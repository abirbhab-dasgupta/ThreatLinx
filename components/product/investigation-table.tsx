"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Search, SlidersHorizontal } from "lucide-react";
import type { ScanSummary } from "@/types/product";
import { fmtDate, RiskStatus } from "./risk-status";

export function InvestigationTable({ scans, limited = false }: { scans: ScanSummary[]; limited?: boolean }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const results = useMemo(() => scans.filter(scan => {
    const q = query.toLowerCase();
    if (q && !scan.hostname.toLowerCase().includes(q) && !scan.url.toLowerCase().includes(q)) return false;
    if (filter === "flagged") return ["suspicious", "high-risk", "confirmed-malicious", "known-threat"].includes(scan.verdict ?? "");
    if (filter === "complete") return scan.status === "completed" || scan.status === "partial";
    if (filter === "processing") return scan.status === "queued" || scan.status === "running";
    return true;
  }), [scans, query, filter]);
  return <div className="tlx-history-panel">
    {!limited && <div className="tlx-history-controls"><label className="tlx-search"><Search size={16}/><input aria-label="Filter investigations" placeholder="Search hostname or URL" value={query} onChange={e => setQuery(e.target.value)}/></label><label className="tlx-filter"><SlidersHorizontal size={16}/><select aria-label="Investigation filter" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All investigations</option><option value="flagged">Flagged</option><option value="complete">Completed</option><option value="processing">Processing</option></select></label></div>}
    {results.length === 0 ? <div className="tlx-history-empty"><span className="tlx-history-empty-star">✳</span><h3>{scans.length ? "NO MATCHING INVESTIGATIONS." : "EVERY INVESTIGATION STARTS SOMEWHERE."}</h3><p>{scans.length ? "Try another hostname or change the status filter." : "Your completed and in-progress investigations will appear here with source-linked evidence and results."}</p><Link href="/dashboard#new-investigation" className="tlx-text-link">START AN INVESTIGATION <ArrowUpRight size={15}/></Link></div>
      : <div className="tlx-table-wrap"><table className="tlx-table"><thead><tr><th>WEBSITE / SUBJECT</th><th>ASSESSMENT</th><th>RISK</th><th>SCANNED</th><th><span className="tlx-sr">Open</span></th></tr></thead><tbody>{results.map(scan => <tr key={scan.id}><td><Link href={`/investigations/${scan.id}`} className="tlx-table-host">{scan.hostname}<small>{scan.deepScan ? "EXTENDED INVESTIGATION" : "STANDARD INVESTIGATION"}</small></Link></td><td><RiskStatus verdict={scan.verdict} status={scan.status}/></td><td><span className="tlx-table-risk">{scan.threatRisk === null ? "—" : `${scan.threatRisk}/100`}</span></td><td className="tlx-table-date">{fmtDate(scan.createdAt)}</td><td><Link aria-label={`Open ${scan.hostname}`} href={`/investigations/${scan.id}`} className="tlx-open-row"><ArrowRight size={17}/></Link></td></tr>)}</tbody></table></div>}
    {limited && scans.length > 0 && <div className="tlx-table-bottom"><span>SHOWING {scans.length} RECENT INVESTIGATION{scans.length === 1 ? "" : "S"}</span><Link href="/investigations">VIEW ALL INVESTIGATIONS <ArrowUpRight size={14}/></Link></div>}
  </div>;
}
