import { NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { db } from "@/db";
import { reports, scans } from "@/lib/schema";
import { getUserScan } from "@/lib/scanner/persistence";
import { serializeInvestigation } from "@/lib/product-data";
export const runtime = "nodejs";

export async function GET(req: Request, { params }: {params:Promise<{id:string}>}) {
  const session = await auth.api.getSession({headers:req.headers});
  if (!session) return NextResponse.json({error:"Authentication required"},{status:401});
  if (!isAdmin(session.user)) return NextResponse.json({error:"Moderator access required"},{status:403});
  const {id}=await params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({error:"Invalid report ID"},{status:400});
  try {
    const [report]=await db.select().from(reports).where(eq(reports.id,id)).limit(1);
    if (!report) return NextResponse.json({error:"Report not found"},{status:404});
    const [scan]=await db.select({id:scans.id}).from(scans).where(and(eq(scans.userId,report.userId),eq(scans.url,report.url),inArray(scans.status,["completed","partial"]))).orderBy(desc(scans.createdAt)).limit(1);
    const result=scan ? await getUserScan(scan.id,report.userId) : null;
    return NextResponse.json({reportId:id,url:report.url,scan:result ? serializeInvestigation(result,result.evidence,result.providers) : null}, {headers:{"Cache-Control":"private, no-store"}});
  } catch { return NextResponse.json({error:"Report evidence is temporarily unavailable"},{status:503}); }
}
