import { NextResponse } from "next/server";
import { z } from "zod";
import { eq,and } from "drizzle-orm";
import { db } from "@/db";
import { reports,reportCommitments } from "@/lib/schema";
import { hashReport,reportKey } from "@/lib/blockchain/commitment";
import { readRegisteredDigest,registryLink } from "@/lib/blockchain/registry";
export const runtime="nodejs";

                                                                                          
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  if(!z.string().uuid().safeParse(id).success)return NextResponse.json({error:"Invalid report ID"},{status:400});
  try {
  const [row]=await db.select({version:reportCommitments.version,status:reportCommitments.status,snapshot:reportCommitments.snapshot,salt:reportCommitments.salt,digest:reportCommitments.digest,txHash:reportCommitments.txHash,contractAddress:reportCommitments.contractAddress,chainId:reportCommitments.chainId}).from(reportCommitments)
    .innerJoin(reports,eq(reportCommitments.reportId,reports.id))
    .where(and(eq(reportCommitments.reportId,id),eq(reportCommitments.status,"confirmed"),eq(reports.status,"verified"))).limit(1);
  if(!row)return NextResponse.json({error:"No published, reviewed evidence exists for this report"},{status:404});
  const recalculated=hashReport(row.snapshot,row.salt);
  const localMatch=recalculated.toLowerCase()===row.digest.toLowerCase();
  let onchainDigest:null|string=null,networkError:null|string=null;
  try {onchainDigest=await readRegisteredDigest(id,row.version,row.contractAddress as `0x${string}` | undefined);} catch {networkError="Testnet registry could not be reached";}
  const networkMatch=onchainDigest!==null && onchainDigest.toLowerCase()===row.digest.toLowerCase();
  return NextResponse.json({reportId:id,reportKey:reportKey(id),version:row.version,chainId:row.chainId,contractAddress:row.contractAddress,txHash:row.txHash,explorerUrl:row.txHash?registryLink(row.txHash):null,snapshot:row.snapshot,salt:row.salt,digest:row.digest,recalculatedDigest:recalculated,onchainDigest,verified:localMatch && networkMatch,localMatch,networkMatch,networkError,warning:"This proves data integrity and registration history, not that a website is malicious."},{headers:{"Cache-Control":"public, max-age=30"}});
  } catch { return NextResponse.json({error:"Proof verification service is temporarily unavailable"},{status:503}); }
}
