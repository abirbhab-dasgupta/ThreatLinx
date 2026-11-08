import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and, inArray, desc } from "drizzle-orm";
import { db } from "@/db";
import { reports, scans, providerChecks } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { hasIndependentCheck, reviewDecision } from "@/lib/reports/review";
export const runtime = "nodejs";
const bodySchema = z.object({ status: z.enum(["verified", "rejected"]) });
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (!isAdmin(session.user)) return NextResponse.json({ error: "Moderator access required" }, { status: 403 });
  if (req.headers.get("origin") !== req.nextUrl.origin) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Invalid report ID" }, { status: 400 });
  const payload = bodySchema.safeParse(await req.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ error: "Invalid moderation decision" }, { status: 400 });
  try {
    const [report] = await db.select().from(reports).where(eq(reports.id,id)).limit(1);
    if (!report) return NextResponse.json({error:"Report not found"},{status:404});
    const decision = reviewDecision(report.status, payload.data.status);
    if (decision === "unchanged") return NextResponse.json({id:report.id,status:report.status},{headers:{"Cache-Control":"no-store"}});
    if (decision === "conflict") return NextResponse.json({error:"This report already has a final review decision. It cannot be overwritten."},{status:409});
    if (payload.data.status === "verified") {
      const [scan] = await db.select().from(scans).where(and(eq(scans.userId,report.userId),eq(scans.url,report.url),inArray(scans.status,["completed","partial"]))).orderBy(desc(scans.createdAt)).limit(1);
      if (!scan) return NextResponse.json({error:"Wait for the independent website investigation to finish before verification."},{status:422});
      const providers = await db.select({provider:providerChecks.provider,status:providerChecks.status}).from(providerChecks).where(eq(providerChecks.scanId,scan.id));
      if (!hasIndependentCheck(providers)) return NextResponse.json({error:"No completed independent provider checks support this report. URL heuristics alone cannot verify a report."},{status:422});
    }
    const [updated] = await db.update(reports).set({ status: payload.data.status, reviewedAt: new Date(), reviewedBy: session.user.id }).where(and(eq(reports.id, id),eq(reports.status,"pending"))).returning({ id: reports.id, status: reports.status });
    if (!updated) return NextResponse.json({ error: "Another moderator already reviewed this report. Refresh the queue." }, { status: 409 });
    return NextResponse.json(updated, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Review could not be saved" }, { status: 503 }); }
}
