import type {Metadata} from "next";
import {eq,desc,and} from "drizzle-orm";
import {db} from "@/db";
import {reports,reportCommitments} from "@/lib/schema";
import {ProofBoard} from "@/components/product/proof-board";
export const metadata:Metadata={title:"Proof Registry",robots:{index:false}};
export const dynamic="force-dynamic";
export default async function RegistryPage(){
  const records=await db.select({id:reportCommitments.reportId,version:reportCommitments.version,status:reportCommitments.status,domain:reports.url,txHash:reportCommitments.txHash,publishedAt:reportCommitments.publishedAt}).from(reportCommitments).innerJoin(reports,eq(reportCommitments.reportId,reports.id)).where(and(eq(reportCommitments.status,"confirmed"),eq(reports.status,"verified"))).orderBy(desc(reportCommitments.publishedAt)).limit(50);
  return <div className="tlx-page tlx-v2-page"><div className="tlx-page-meta"><span>WORKSPACE / EVIDENCE INTEGRITY</span><span>BASE SEPOLIA</span></div><header className="tlx-page-title"><span className="tlx-overline">/ WEB3 VERIFICATION</span><h1>PROVE THE<br/><em>RECORD.</em></h1><p>Independently compare published report digests with their on-chain commitments. Transparent registration history, without exposing private submissions on a public blockchain.</p></header><ProofBoard items={records.map(x=>({...x,domain:new URL(x.domain).hostname,publishedAt:x.publishedAt?.toISOString()||null}))}/></div>;
}
