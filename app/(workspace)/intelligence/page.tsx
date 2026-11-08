import type { Metadata } from "next";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { reports } from "@/lib/schema";
import { requireUser } from "@/lib/session";
import { serializeReport } from "@/lib/product-data";
import { CommunityBoard } from "@/components/product/community-board";
export const metadata: Metadata = { title: "Collective intelligence", robots: { index: false } };
export const dynamic = "force-dynamic";
export default async function IntelligencePage() {
  const user = await requireUser();
  const selection = { id: reports.id, url: reports.url, category: reports.category, description: reports.description, status: reports.status, submittedAt: reports.submittedAt };
  const [verified, mine] = await Promise.all([
    db.select(selection).from(reports).where(eq(reports.status, "verified")).orderBy(desc(reports.submittedAt)).limit(40),
    db.select(selection).from(reports).where(eq(reports.userId, user.id)).orderBy(desc(reports.submittedAt)).limit(30),
  ]);
  return <div className="tlx-page"><div className="tlx-page-meta"><span>WORKSPACE / COLLECTIVE INTELLIGENCE</span><span>03 — REPORTING NETWORK</span></div>
    <header className="tlx-page-title"><span className="tlx-overline">/ COLLECTIVE DEFENSE</span><h1>SHARE THE<br/><em>SIGNAL.</em></h1><p>Threat intelligence works when observations can be examined, verified, and traced back to their source—not when accusations travel unchecked.</p></header><CommunityBoard verified={verified.map(row=>serializeReport({...row,description:"Moderated submission supported by an independent technical review."}))} mine={mine.map(serializeReport)}/></div>;
}
