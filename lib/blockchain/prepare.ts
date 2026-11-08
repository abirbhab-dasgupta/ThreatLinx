import { randomBytes } from "node:crypto";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { reports, scans, evidence, providerChecks } from "@/lib/schema";
import { hashReport } from "./commitment";
import { hasIndependentCheck } from "@/lib/reports/review";

                                                                                                 
export async function prepareReviewedEvidence(reportId:string) {
  const [report]=await db.select().from(reports).where(eq(reports.id,reportId)).limit(1);
  if(!report || report.status!=="verified" || !report.reviewedAt)throw Error("Report must be verified by a moderator before publication");
  const [scan]=await db.select().from(scans).where(and(eq(scans.userId,report.userId),eq(scans.url,report.url),inArray(scans.status,["completed","partial"]))).orderBy(desc(scans.createdAt)).limit(1);
  if(!scan)throw Error("The reporter must first finish a URL investigation for this exact address");
  const [findings,providers]=await Promise.all([
    db.select({code:evidence.code,category:evidence.category,source:evidence.source,observedAt:evidence.observedAt}).from(evidence).where(eq(evidence.scanId,scan.id)),
    db.select({provider:providerChecks.provider,status:providerChecks.status}).from(providerChecks).where(eq(providerChecks.scanId,scan.id)),
  ]);
  if(!findings.length || !hasIndependentCheck(providers))throw Error("Cannot publish a report without independent technical evidence");
  const domain=new URL(report.url).hostname;
  const snapshot:Record<string,unknown>={
    schema:"threatlinx-report-v1",reportId:report.id,version:1,category:report.category,domain,
    reviewStatus:"verified",reviewedAt:report.reviewedAt.toISOString(),
    assessment:scan.verdict || "inconclusive",confidence:scan.confidence || "insufficient",
    evidence:findings.map(x=>({code:x.code,category:x.category,source:x.source,observedAt:x.observedAt.toISOString()})).sort((a,b)=>a.code.localeCompare(b.code)),
    providers:providers.map(x=>({name:x.provider,status:x.status})).sort((a,b)=>a.name.localeCompare(b.name)),
  };
                                                                      
  const salt=`0x${randomBytes(32).toString("hex")}`;
  return {snapshot,salt,digest:hashReport(snapshot,salt)};
}
