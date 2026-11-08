import { and,eq } from "drizzle-orm";
import { db } from "@/db";
import { reportCommitments, reports } from "@/lib/schema";
import { hashReport } from "@/lib/blockchain/commitment";
import { publishDigest } from "@/lib/blockchain/registry";
import { inngest } from "./client";

export const publishReviewedReport=inngest.createFunction(
  {id:"threatlinx-publish-reviewed-evidence", concurrency:{limit:1},retries:2,triggers:{event:"threatlinx/report.publish"}},
  async ({event,step})=>{
    const {reportId,version}=event.data as {reportId:string;version:number};
    const [row]=await step.run("load-commitment",()=>db.select().from(reportCommitments).where(and(eq(reportCommitments.reportId,reportId),eq(reportCommitments.version,version))).limit(1));
    if(!row)throw Error("Missing reviewed commitment");
    if(row.status==="confirmed")return {status:"already-confirmed"};
    await step.run("mark-publishing",()=>db.update(reportCommitments).set({status:"publishing",error:null}).where(eq(reportCommitments.id,row.id)));
                                                                                     
    let published: {registered:boolean;txHash:`0x${string}`|null};
    try {
      published=await step.run("publish-and-confirm",async()=>{
      const [review]=await db.select({status:reports.status,reviewedAt:reports.reviewedAt}).from(reports).where(eq(reports.id,reportId)).limit(1);
      if(review?.status!=="verified" || !review.reviewedAt)throw Error("Report is no longer eligible for publication");
      if(hashReport(row.snapshot,row.salt).toLowerCase()!==row.digest.toLowerCase())throw Error("Reviewed evidence commitment does not match its snapshot");
      const [latest]=await db.select({txHash:reportCommitments.txHash}).from(reportCommitments).where(eq(reportCommitments.id,row.id)).limit(1);
      return publishDigest(reportId,version,row.digest as `0x${string}`,async tx=>{
        await db.update(reportCommitments).set({txHash:tx}).where(eq(reportCommitments.id,row.id));
      }, latest?.txHash as `0x${string}` | null | undefined);
      });
    } catch (error) {
      await db.update(reportCommitments).set({status:"failed",error:"Registration failed. Check registry connectivity, publisher permissions and testnet funds, then retry."}).where(eq(reportCommitments.id,row.id));
      throw error;
    }
    await step.run("mark-confirmed",()=>db.update(reportCommitments).set({status:"confirmed",txHash:published.txHash??row.txHash,contractAddress:process.env.REPORT_REGISTRY_ADDRESS,chainId:84532,publishedAt:new Date(),error:null}).where(eq(reportCommitments.id,row.id)));
    return {reportId,version,status:"confirmed"};
  }
);
