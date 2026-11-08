import { NextResponse } from "next/server";
import { and,eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { db } from "@/db";
import { reports,reportCommitments } from "@/lib/schema";
export const runtime="nodejs";

export async function GET(req:Request,{params}:{params:Promise<{id:string}>}) {
  const session=await auth.api.getSession({headers:req.headers});
  if(!session)return NextResponse.json({error:"Authentication required"},{status:401});
  if(!isAdmin(session.user))return NextResponse.json({error:"Moderator access required"},{status:403});
  const {id}=await params;
  if(!z.string().uuid().safeParse(id).success)return NextResponse.json({error:"Invalid report ID"},{status:400});
  try {
    const [report]=await db.select({id:reports.id}).from(reports).where(eq(reports.id,id)).limit(1);
    if(!report)return NextResponse.json({error:"Report not found"},{status:404});
    const [publication]=await db.select({status:reportCommitments.status,txHash:reportCommitments.txHash,error:reportCommitments.error}).from(reportCommitments).where(and(eq(reportCommitments.reportId,id),eq(reportCommitments.version,1))).limit(1);
    return NextResponse.json(publication ?? {status:"unpublished",txHash:null,error:null},{headers:{"Cache-Control":"private, no-store"}});
  } catch {return NextResponse.json({error:"Publication status is temporarily unavailable"},{status:503});}
}
