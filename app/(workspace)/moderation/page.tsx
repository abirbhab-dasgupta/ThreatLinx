import type { Metadata } from "next";
import { eq, desc, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { reports, reportCommitments } from "@/lib/schema";
import { isAdmin } from "@/lib/admin";
import { requireUser } from "@/lib/session";
import { serializeReport } from "@/lib/product-data";
import { ModerationBoard } from "@/components/product/moderation-board";
export const metadata: Metadata = { title: "Moderation", robots: { index: false } };
export const dynamic = "force-dynamic";
export default async function ModerationPage() {
  const user = await requireUser();
  if (!isAdmin(user)) notFound();
  const pending = await db.select({ id: reports.id, url: reports.url, category: reports.category, description: reports.description,
    status: reports.status, submittedAt: reports.submittedAt }).from(reports).where(eq(reports.status,"pending")).orderBy(desc(reports.submittedAt)).limit(80);
  const reviewed = await db.select({ id: reports.id, url: reports.url, category: reports.category, description: reports.description, status: reports.status, submittedAt: reports.submittedAt, publicationStatus:reportCommitments.status, txHash:reportCommitments.txHash, publicationError:reportCommitments.error }).from(reports).leftJoin(reportCommitments,and(eq(reportCommitments.reportId,reports.id),eq(reportCommitments.version,1))).where(eq(reports.status,"verified")).orderBy(desc(reports.submittedAt)).limit(50);
  return <div className="tlx-page"><div className="tlx-page-meta"><span>WORKSPACE / INTELLIGENCE MODERATION</span><span>RESTRICTED / VERIFIED MODERATORS</span></div><header className="tlx-page-title"><span className="tlx-overline">/ REVIEW QUEUE</span><h1>VERIFY THE<br/><em>CLAIM.</em></h1><p>Review incoming intelligence against independent evidence. Only verified reports become visible to other investigators.</p></header><ModerationBoard pending={pending.map(serializeReport)} reviewed={reviewed.map(row=>({...serializeReport(row),publication:{status:row.publicationStatus??"unpublished",txHash:row.txHash,error:row.publicationError}}))}/></div>;
}
