import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { messageCases, messageLinks, scans } from "@/lib/schema";
export const runtime = "nodejs";
export async function GET(req:NextRequest,{params}:{params:Promise<{id:string}>}) {
  const session=await auth.api.getSession({headers:req.headers});
  if(!session)return NextResponse.json({error:"Authentication required"},{status:401});
  const {id}=await params;
  if(!z.string().uuid().safeParse(id).success)return NextResponse.json({error:"Invalid case ID"},{status:400});
  try {
    const [row]=await db.select().from(messageCases).where(and(eq(messageCases.id,id),eq(messageCases.userId,session.user.id))).limit(1);
    if(!row)return NextResponse.json({error:"Not found"},{status:404});
    const links=await db.select({url:messageLinks.url,domain:messageLinks.domain,scanId:messageLinks.scanId,scanStatus:scans.status,scanVerdict:scans.verdict,scanThreatRisk:scans.threatRisk}).from(messageLinks).leftJoin(scans,eq(messageLinks.scanId,scans.id)).where(eq(messageLinks.messageId,id));
    return NextResponse.json({case:{...row,createdAt:row.createdAt.toISOString(),updatedAt:row.updatedAt.toISOString(),completedAt:row.completedAt?.toISOString()??null},links},{headers:{"Cache-Control":"private, no-store"}});
  } catch { return NextResponse.json({error:"Unable to load case"},{status:503}); }
}
