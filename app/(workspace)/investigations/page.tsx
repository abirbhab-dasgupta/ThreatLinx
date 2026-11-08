import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { recentUserScans } from "@/lib/scanner/persistence";
import { serializeSummary } from "@/lib/product-data";
import { InvestigationTable } from "@/components/product/investigation-table";
import { ScanComposer } from "@/components/product/scan-composer";
export const metadata: Metadata = { title: "Investigations", robots: { index: false } };
export const dynamic = "force-dynamic";
export default async function InvestigationsPage() {
  const user = await requireUser();
  const records = await recentUserScans(user.id, 60);
  return <div className="tlx-page"><div className="tlx-page-meta"><span>WORKSPACE / INVESTIGATIONS</span><span>02 — INVESTIGATION LIBRARY</span></div><header className="tlx-page-title"><span className="tlx-overline">/ INVESTIGATION ARCHIVE</span><h1>FOLLOW THE<br/><em>RECORD.</em></h1><p>Every URL you investigate, every finding collected, and every conclusion preserved with its sources.</p></header><ScanComposer compact/><div className="tlx-block-heading tlx-library-heading"><div><span className="tlx-overline">/ HISTORY</span><h2>YOUR<br/><em>INVESTIGATIONS.</em></h2></div><span className="tlx-micro-count">{records.length} MOST RECENT RECORDS</span></div><InvestigationTable scans={records.map(serializeSummary)}/></div>;
}
