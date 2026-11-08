import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Radar, ShieldAlert, ShieldCheck, ScanSearch } from "lucide-react";
import { requireUser } from "@/lib/session";
import { recentUserScans, userOverview } from "@/lib/scanner/persistence";
import { serializeSummary } from "@/lib/product-data";
import { IntakeSwitcher } from "@/components/product/intake-switcher";
import { InvestigationTable } from "@/components/product/investigation-table";
export const metadata: Metadata = { title: "Overview", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const [overview, records] = await Promise.all([userOverview(user.id), recentUserScans(user.id, 5)]);
  const data = records.map(serializeSummary);
  return <div className="tlx-page tlx-overview-page">
    <div className="tlx-page-meta"><span>WORKSPACE / OVERVIEW</span><span>01 — INVESTIGATION CONTROL</span></div>
    <div className="tlx-hero">
      <div className="tlx-hero-copy"><span className="tlx-overline"><i className="tlx-diamond"/> YOUR SECURITY WORKSPACE</span>
        <h1>DECODE<br/>THE THREAT<span className="tlx-hero-period">.</span></h1>
        <p>Start with a suspicious message or website. Connect social-engineering indicators to URL, TLS and reputation evidence, then follow reviewed cases through on-chain verification.</p>
        <div className="tlx-hero-foot"><span>SCAM MESSAGES</span><span>×</span><span>WEBSITE EVIDENCE</span><span>×</span><span>VERIFIABLE REPORTS</span></div>
      </div>
      <div className="tlx-hero-visual" aria-hidden="true"><div className="tlx-visual-grid"/><span className="tlx-visual-caption">TL / 001<br/>CONNECTED EVIDENCE</span><div className="tlx-orbit one"/><div className="tlx-orbit two"/><div className="tlx-visual-center"><span>TL</span></div><div className="tlx-visual-stamp">VERIFY<br/>FIRST.<small>TRACE THE EVIDENCE ↗</small></div><span className="tlx-visual-cross">✳</span></div>
    </div>
    <IntakeSwitcher/>
    <section className="tlx-stat-strip" aria-label="Investigation statistics">
      <div className="tlx-stat"><div className="tlx-stat-label"><ScanSearch size={16}/> INVESTIGATIONS</div><strong>{overview.total.toLocaleString()}</strong><span>SUBMITTED BY YOUR ACCOUNT</span></div>
      <div className="tlx-stat"><div className="tlx-stat-label"><ShieldAlert size={16}/> FLAGGED</div><strong>{overview.flagged.toLocaleString()}</strong><span>FLAGGED WEBSITE INVESTIGATIONS</span></div>
      <div className="tlx-stat"><div className="tlx-stat-label"><ShieldCheck size={16}/> ASSESSED</div><strong>{overview.completed.toLocaleString()}</strong><span>COMPLETED OR PARTIAL REPORTS</span></div>
      <Link href="/incidents" className="tlx-stat tlx-stat-editorial"><Radar size={25}/><span>UNDERSTANDING CERTIFICATE TRUST</span><b>WHY HTTPS<br/>ISN&apos;T ENOUGH. ↗</b></Link>
    </section>
    <section className="tlx-history-section"><div className="tlx-block-heading"><div><span className="tlx-overline">/ YOUR ACTIVITY — 02</span><h2>RECENT<br/><em>INVESTIGATIONS.</em></h2></div><Link href="/investigations" className="tlx-outline-link">OPEN LIBRARY <ArrowUpRight size={17}/></Link></div><InvestigationTable limited scans={data}/></section>
    <section className="tlx-bottom-pair"><div className="tlx-explain-block"><span className="tlx-overline">OUR POSITION / 001</span><h3>NO SINGLE SIGNAL<br/>DEFINES TRUST.</h3><p>A valid certificate does not prove a website is legitimate. A missing reputation match does not mean it is safe. Our reports separate observed facts, technical security posture, and threat indicators.</p></div><div className="tlx-explain-graphic" aria-hidden="true"><span>KNOWN THREATS</span><span>URL HEURISTICS</span><span>TLS IDENTITY</span><span>WEB SECURITY</span><div>→ EVIDENCE<br/>OVER ASSUMPTION.</div></div></section>
  </div>;
}
