"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy,
  Download, Lock, Radio, RefreshCw, ShieldAlert } from "lucide-react";
import type { Investigation, EvidenceRow } from "@/types/product";
import { fmtDate, RiskStatus, riskTone, riskLabel } from "./risk-status";
import { ThreatGraph } from "./threat-graph";

const sourceLinks: Record<string, string> = {
  "Google Safe Browsing v5": "https://developers.google.com/safe-browsing/reference/rest",
  "Mozilla HTTP Observatory": "https://observatory.mozilla.org/",
  "urlscan.io": "https://docs.urlscan.io/",
  "Kudelski Security (historical SPKI advisory)": "https://kudelskisecurity.com/research/emudhra-intermediate-ca-private-key-compromise",
};

const categories: Record<string,string> = { url: "URL INTELLIGENCE", reputation: "THREAT REPUTATION", tls: "CERTIFICATE TRUST", security: "WEB SECURITY", browser: "BROWSER INVESTIGATION" };
function metaValue(data: Record<string, unknown> | null | undefined, key: string) { const val = data?.[key]; return typeof val === "string" || typeof val === "number" || typeof val === "boolean" ? String(val) : null; }

export function InvestigationView({ initial }: { initial: Investigation }) {
  const [scan, setScan] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(initial.evidence[0]?.id ?? null);
  const [tab, setTab] = useState<"evidence" | "certificate" | "providers">("evidence");
  const [copied, setCopied] = useState(false);
  const progressing = scan.status === "queued" || scan.status === "running";
  useEffect(() => {
    if (!progressing) return;
    let disposed = false;
    const poll = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const response = await fetch(`/api/scans/${scan.id}`, { cache: "no-store" });
        if (!response.ok) return;
        const next = await response.json() as Investigation;
        if (!disposed) { setScan(next); setSelectedId(prev => prev ?? next.evidence[0]?.id ?? null); }
      } catch {  }
    };
    const interval = window.setInterval(poll, 3200);
    void poll();
    return () => { disposed = true; window.clearInterval(interval); };
  }, [scan.id, progressing]);
  const selection = useMemo(() => scan.evidence.find(e => e.id === selectedId) ?? scan.evidence[0] ?? null, [scan.evidence, selectedId]);
  const tls = scan.providers.find(p => p.provider === "tls");
  const chain = Array.isArray(tls?.metadata?.chain) ? tls.metadata.chain.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object")) : [];
  const grouped = Object.entries(categories).map(([category, name]) => ({ category, name, items: scan.evidence.filter(e => e.category === category) })).filter(group => group.items.length);
  function exportJson() {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), scan }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = `threatlinx-${scan.id.slice(0,8)}.json`;
    link.click(); URL.revokeObjectURL(url);
  }
  async function copyUrl() {
    try { await navigator.clipboard.writeText(scan.url); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch {  }
  }
  return <div className="tlx-page tlx-investigation-page">
    <div className="tlx-page-meta"><span>WORKSPACE / INVESTIGATIONS / DETAIL</span><Link href="/investigations" className="tlx-inline-return"><ArrowLeft size={13}/> BACK TO LIBRARY</Link></div>
    <div className="tlx-detail-heading"><div className="tlx-detail-name"><span className="tlx-overline">/ SUBJECT UNDER REVIEW</span><h1>{scan.hostname}</h1><div className="tlx-subject-url"><span>{scan.url}</span><button onClick={copyUrl} aria-label="Copy investigated URL">{copied ? <Check size={15}/> : <Copy size={15}/>}</button></div></div><button className="tlx-outline-link tlx-export" onClick={exportJson}><Download size={17}/> EXPORT EVIDENCE</button></div>
    <div className="tlx-detail-topline"><span>INVESTIGATION ID / {scan.id.slice(0,8).toUpperCase()}</span><span>CREATED {fmtDate(scan.createdAt).toUpperCase()}</span><span>MODE / {scan.deepScan ? "EXTENDED" : "STANDARD"}</span></div>
    <div className="tlx-verdict-grid">
      <div className={`tlx-verdict-lead ${riskTone(scan.verdict,scan.status)}`}><span className="tlx-overline">01 / THREAT ASSESSMENT</span><div className="tlx-verdict-main"><div><RiskStatus verdict={scan.verdict} status={scan.status}/><h2>{progressing ? "INVESTIGATING." : `${riskLabel(scan.verdict, scan.status).toUpperCase()}.`}</h2></div><ShieldAlert size={35} strokeWidth={1.1}/></div><p>{progressing ? scan.phase : scan.explanation ?? "The available evidence is insufficient for a conclusive assessment."}</p></div>
      <div className="tlx-verdict-score"><span className="tlx-overline">02 / INDICATOR SCORE</span><div className="tlx-big-number">{scan.threatRisk === null ? "—" : scan.threatRisk}<small>{scan.threatRisk === null ? "NOT SCORED" : " / 100"}</small></div><span className="tlx-score-caption">HEURISTIC INDICATOR · NOT A PROBABILITY</span></div>
      <div className="tlx-verdict-other"><div><span className="tlx-overline">03 / SECURITY POSTURE</span><b>{scan.securityGrade ?? "N/A"}</b><small>HTTP configuration grade</small></div><div><span className="tlx-overline">04 / EVIDENCE CONFIDENCE</span><b className="tlx-confidence">{scan.confidence ?? "PENDING"}</b><small>Availability and corroboration</small></div></div>
    </div>
    {progressing && <div className="tlx-live-progress" role="status"><span className="tlx-progress-dot"/><div><b>INVESTIGATION IN PROGRESS</b><p>{scan.phase}</p></div><RefreshCw size={20} className="tlx-spin"/></div>}
    {scan.status === "failed" && <div className="tlx-inline-error">This job did not finish. Create a new investigation to retry; no results have been fabricated.</div>}
    <section className="tlx-analysis-section"><div className="tlx-block-heading"><div><span className="tlx-overline">/ EVIDENCE CORRELATION — 05</span><h2>THREAT<br/><em>X-RAY.</em></h2></div><div className="tlx-heading-note"><Radio size={17}/> {scan.evidence.length} OBSERVED FINDINGS</div></div>
      <div className="tlx-xray-workspace"><div className="tlx-xray-left"><div className="tlx-xray-bar"><span>SIGNAL MAP / EVIDENCE GRAPH</span><span>DRAG TO PAN · SCROLL TO ZOOM</span></div><ThreatGraph hostname={scan.hostname} evidence={scan.evidence} selected={selection?.id ?? null} onSelect={id => { setSelectedId(id); setTab("evidence"); }}/></div>
      <div className="tlx-evidence-inspector"><div className="tlx-inspector-bar"><span>DETAIL / INSPECTOR</span><span>↗</span></div><div className="tlx-inspector-tabs" role="tablist" aria-label="Evidence inspector views">{["evidence","certificate","providers"].map(label => <button role="tab" aria-selected={tab===label} className={tab===label?"active":""} onClick={()=>setTab(label as typeof tab)} key={label}>{label.toUpperCase()}</button>)}</div>
        {tab === "evidence" ? <div className="tlx-inspector-content"><span className="tlx-overline">{selection ? categories[selection.category] : "AWAITING OBSERVATIONS"}</span><h3>{selection?.title ?? "Evidence not yet available"}</h3><p>{selection?.detail ?? "Provider checks are being collected. Findings will be displayed with their sources as soon as they are available."}</p>{selection && <div className="tlx-inspector-meta"><div><span>LEVEL</span><b>{selection.level.toUpperCase()}</b></div><div><span>SOURCE</span><b>{selection.source}</b>{sourceLinks[selection.source] && <a className="tlx-evidence-source" href={sourceLinks[selection.source]} rel="noopener noreferrer" target="_blank">PROVIDER DOCUMENTATION <ArrowUpRight size={12}/></a>}</div><div><span>OBSERVED</span><b>{fmtDate(selection.observedAt)}</b></div></div>}</div>
        : tab === "certificate" ? <div className="tlx-inspector-content"><span className="tlx-overline">TLS / CERTIFICATE PATH</span><h3>{chain.length ? `${chain.length} CHAIN CERTIFICATE${chain.length===1?"":"S"}` : "NO CHAIN DATA"}</h3><p>Chain information is collected from the observed TLS connection when available. Runtime trust validation is not the same as universal browser trust.</p>{chain.map((cert,i)=><div key={i} className="tlx-cert-mini"><small>{String(i+1).padStart(2,"0")} / {i===0?"LEAF":"ISSUER"}</small><b>{metaValue(cert,"subjectCN") ?? "UNNAMED CERTIFICATE"}</b><span>ISSUER: {metaValue(cert,"issuerCN") ?? "UNKNOWN"}</span><span>VALID TO: {metaValue(cert,"validTo") ?? "UNKNOWN"}</span></div>)}{tls?.status === "unavailable" || tls?.status === "error" ? <p>{tls.error ?? "TLS analysis was unavailable"}</p> : null}</div>
        : <div className="tlx-inspector-content"><span className="tlx-overline">PIPELINE / PROVIDER STATUS</span><h3>CHECK STATUS.</h3><div className="tlx-provider-list">{scan.providers.length ? scan.providers.map(provider => <div key={provider.provider}><div><b>{categories[provider.provider] ?? provider.provider.toUpperCase()}</b><span>{provider.status.toUpperCase()}</span></div>{provider.error && <p>{provider.error}</p>}</div>) : <p>Provider results have not been received yet.</p>}</div></div>}
      </div></div>
    </section>
    <section className="tlx-findings"><div className="tlx-block-heading"><div><span className="tlx-overline">/ TECHNICAL FINDINGS — 06</span><h2>SIGNAL<br/><em>REGISTER.</em></h2></div><span className="tlx-micro-count">{scan.evidence.length} TOTAL ITEMS</span></div>
      {grouped.length ? <div className="tlx-evidence-groups">{grouped.map(group=><div className="tlx-evidence-group" key={group.category}><div className="tlx-group-name"><span className="tlx-diamond"/><b>{group.name}</b><small>{String(group.items.length).padStart(2,"0")}</small></div><div>{group.items.map((item: EvidenceRow) => <button type="button" onClick={() => { setSelectedId(item.id); setTab("evidence"); document.querySelector(".tlx-analysis-section")?.scrollIntoView({behavior:"smooth",block:"start"}); }} key={item.id} className={`tlx-finding-row ${selectedId===item.id?"selected":""}`}><span className={`tlx-finding-level ${item.level}`}>{item.level}</span><span><b>{item.title}</b><small>{item.source}</small></span><ArrowRight size={18}/></button>)}</div></div>)}</div> : <div className="tlx-scan-placeholder"><Activity size={28}/><p>{progressing ? "Checks are running. Findings will appear as the providers return." : "No findings are available for this investigation."}</p></div>}
    </section>
    <section className="tlx-result-bottom"><div className="tlx-recommendation"><span className="tlx-overline">/ RECOMMENDED ACTIONS</span><h3>WHAT NEXT?</h3>{scan.nextActions.length ? <ol>{scan.nextActions.map((item,i)=><li key={i}>{item}</li>)}</ol> : <p>Verify important links through the organisation&apos;s independently known official website. Do not submit credentials to an unverified destination.</p>}</div><div className="tlx-limits"><Lock size={26}/><h3>AN EVIDENCE-LED VERDICT.</h3><p>A clean reputation lookup is not a safety guarantee. Weak security controls are not proof of phishing. Browser investigations require an isolated scanner, and unavailable checks stay explicitly marked.</p><Link href="/investigations" className="tlx-text-link">BACK TO INVESTIGATIONS <ArrowUpRight size={14}/></Link></div></section>
  </div>;
}
