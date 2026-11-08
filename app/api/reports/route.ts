import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { reports, scans } from "@/lib/schema";
import { inngest } from "@/inngest/client";
import { eq, desc } from "drizzle-orm";
import { rateLimitUser } from "@/lib/security/rate-limit";
import { normalizeTarget, deepScanAllowed } from "@/lib/security/target";
import { auth } from "@/lib/auth";
export const runtime = "nodejs";
const schema = z.object({ url: z.string().min(4).max(2048),
  category: z.enum(["phishing", "impersonation", "malware", "other"]),
  description: z.string().trim().min(20).max(1000) });

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Sign in to submit intelligence" }, { status: 401 });
  if (req.headers.get("origin") !== req.nextUrl.origin) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  try {
    const body = schema.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Enter a valid URL, category, and description (20–1000 characters)" }, { status: 400 });
    let target: ReturnType<typeof normalizeTarget>;
    try { target = normalizeTarget(body.data.url); }
    catch { return NextResponse.json({ error: "Invalid public URL" }, { status: 400 }); }
    if (!deepScanAllowed(target.url)) return NextResponse.json({ error: "Sensitive authentication and recovery URLs cannot be reported" }, { status: 400 });
    if (!(await rateLimitUser(session.user.id, "report"))) return NextResponse.json({ error: "Report submission limit reached" }, { status: 429 });
    const [report] = await db.insert(reports).values({ userId: session.user.id, url: target.url,
      category: body.data.category, description: body.data.description }).returning({ id: reports.id, status: reports.status });
                                                                                                               
    let scanId: string | null = null;
    try {
      const [scan] = await db.insert(scans).values({userId:session.user.id,url:target.url,hostname:target.hostname,deepScan:false}).returning({id:scans.id});
      scanId = scan.id;
      await inngest.send({name:"threatlinx/scan.created",id:`report-${scan.id}`,data:{scanId:scan.id}});
    } catch {
      if (scanId) await db.update(scans).set({status:"failed",phase:"Workflow could not be dispatched",updatedAt:new Date()}).where(eq(scans.id,scanId));
      scanId = null;
    }
    return NextResponse.json({ ...report, scanId, message: scanId
      ? "Report received. Website checks are queued; verification requires completed independent checks and moderator review."
      : "Report received and pending. Website checks could not be queued; start a separate investigation before moderator review." }, { status: 201 });
  } catch { return NextResponse.json({ error: "Could not submit report" }, { status: 503 }); }
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  try {
    const [verified, own] = await Promise.all([
      db.select({ id: reports.id, url: reports.url, category: reports.category, description: reports.description,
        status: reports.status, submittedAt: reports.submittedAt }).from(reports)
        .where(eq(reports.status, "verified")).orderBy(desc(reports.submittedAt)).limit(40),
      db.select({ id: reports.id, url: reports.url, category: reports.category, description: reports.description,
        status: reports.status, submittedAt: reports.submittedAt }).from(reports)
        .where(eq(reports.userId, session.user.id)).orderBy(desc(reports.submittedAt)).limit(30),
    ]);
    return NextResponse.json({ verified: verified.map(row => ({...row,description:"Moderated submission supported by an independent technical review."})), mine: own }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return NextResponse.json({ error: "Reports temporarily unavailable" }, { status: 503 }); }
}
