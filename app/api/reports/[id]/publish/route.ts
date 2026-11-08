import { NextRequest,NextResponse } from "next/server";
import { eq,and } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { db } from "@/db";
import { reportCommitments } from "@/lib/schema";
import { reports } from "@/lib/schema";
import { randomUUID } from "node:crypto";
import { prepareReviewedEvidence } from "@/lib/blockchain/prepare";
import { inngest } from "@/inngest/client";
export const runtime="nodejs";
export async function POST(req:NextRequest,{params}:{params:Promise<{id:string}>}) {
  const session=await auth.api.getSession({headers:req.headers});
  if(!session)return NextResponse.json({error:"Authentication required"},{status:401});
  if(!isAdmin(session.user))return NextResponse.json({error:"Moderator only"},{status:403});
  if(req.headers.get("origin")!==req.nextUrl.origin)return NextResponse.json({error:"Invalid origin"},{status:403});
  const {id}=await params;
  if(!z.string().uuid().safeParse(id).success)return NextResponse.json({error:"Invalid report ID"},{status:400});
  try {
    const [report]=await db.select({status:reports.status,reviewedAt:reports.reviewedAt}).from(reports).where(eq(reports.id,id)).limit(1);
    if(!report)return NextResponse.json({error:"Report not found"},{status:404});
    if(report.status!=="verified" || !report.reviewedAt)return NextResponse.json({error:"Report must be verified by a moderator before publication"},{status:422});
    const [existing]=await db.select().from(reportCommitments).where(and(eq(reportCommitments.reportId,id),eq(reportCommitments.version,1))).limit(1);
    if(existing?.status==="confirmed")return NextResponse.json({reportId:id,status:"confirmed",txHash:existing.txHash});
    if(existing?.status==="publishing")return NextResponse.json({reportId:id,status:"publishing",txHash:existing.txHash},{status:202});
    if(!process.env.REPORT_REGISTRY_ADDRESS || !process.env.REPORT_PUBLISHER_PRIVATE_KEY)return NextResponse.json({error:"Registry contract and publisher wallet must be configured"},{status:503});
    if(!existing) {
      const {snapshot,salt,digest}=await prepareReviewedEvidence(id);
      await db.insert(reportCommitments).values({reportId:id,version:1,digest,salt,snapshot}).onConflictDoNothing();
    }
    const [commitment]=await db.select({id:reportCommitments.id,status:reportCommitments.status}).from(reportCommitments).where(and(eq(reportCommitments.reportId,id),eq(reportCommitments.version,1))).limit(1);
    if(!commitment)throw Error("Publication record could not be prepared");
    const retry=commitment.status==="failed";
    if(retry) {
      const [claimed]=await db.update(reportCommitments).set({status:"queued",error:null}).where(and(eq(reportCommitments.id,commitment.id),eq(reportCommitments.status,"failed"))).returning({id:reportCommitments.id});
      if(!claimed)return NextResponse.json({reportId:id,status:"queued"},{status:202});
    }
    try {
      await inngest.send({id:`publish-${commitment.id}${retry?`-${randomUUID()}`:""}`,name:"threatlinx/report.publish",data:{reportId:id,version:1}});
    } catch {
      await db.update(reportCommitments).set({status:"failed",error:"Publication could not be queued. Retry registration."}).where(and(eq(reportCommitments.id,commitment.id),eq(reportCommitments.status,"queued")));
      return NextResponse.json({error:"Publication queue is unavailable. Retry registration."},{status:503});
    }
    return NextResponse.json({reportId:id,status:"queued"},{status:202});
  } catch(e) {return NextResponse.json({error:e instanceof Error?e.message:"Unable to queue publication"},{status:422});}
}
