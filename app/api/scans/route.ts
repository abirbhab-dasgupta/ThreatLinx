import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { scans } from "@/lib/schema";
import { inngest } from "@/inngest/client";
import { normalizeTarget, deepScanAllowed } from "@/lib/security/target";
import { rateLimitUser } from "@/lib/security/rate-limit";
import { recentUserScans } from "@/lib/scanner/persistence";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
export const runtime = "nodejs";
const payload = z.object({ url: z.string().min(4).max(2048), deepScan: z.boolean().default(false) });

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Sign in to start an investigation" }, { status: 401 });
  if (req.headers.get("origin") !== req.nextUrl.origin) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  try {
    const body = payload.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Provide a valid website URL" }, { status: 400 });
    let target: ReturnType<typeof normalizeTarget>;
    try { target = normalizeTarget(body.data.url); }
    catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid URL" }, { status: 400 }); }
    if (!deepScanAllowed(target.url)) return NextResponse.json({ error: "Authentication, recovery and token-bearing URL paths cannot be scanned" }, { status: 400 });
    if (!(await rateLimitUser(session.user.id, "scan"))) return NextResponse.json({ error: "Hourly investigation limit reached. Try again later." }, { status: 429 });
    const [scan] = await db.insert(scans).values({ userId: session.user.id, url: target.url,
      hostname: target.hostname, deepScan: body.data.deepScan }).returning({ id: scans.id });
    try {
      await inngest.send({ id: `threatlinx-${scan.id}`, name: "threatlinx/scan.created", data: { scanId: scan.id } });
    } catch {
      await db.update(scans).set({ status: "failed", phase: "Workflow could not be dispatched" }).where(eq(scans.id, scan.id));
      return NextResponse.json({ error: "Unable to queue this investigation" }, { status: 503 });
    }
    return NextResponse.json({ id: scan.id, status: "queued" }, { status: 202, headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Investigation service is currently unavailable" }, { status: 503 }); }
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  try { return NextResponse.json({ scans: await recentUserScans(session.user.id, 60) }, { headers: { "Cache-Control": "private, no-store" } }); }
  catch { return NextResponse.json({ error: "Could not load investigations" }, { status: 503 }); }
}
