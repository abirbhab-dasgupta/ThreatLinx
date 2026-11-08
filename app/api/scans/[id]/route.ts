import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserScan } from "@/lib/scanner/persistence";
import { auth } from "@/lib/auth";
export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Invalid investigation ID" }, { status: 400 });
  try {
    const scan = await getUserScan(id, session.user.id);
    if (!scan) return NextResponse.json({ error: "Investigation not found" }, { status: 404 });
    return NextResponse.json(scan, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return NextResponse.json({ error: "Could not load the investigation" }, { status: 503 }); }
}
