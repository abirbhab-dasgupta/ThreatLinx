"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, FileText, LoaderCircle, ShieldCheck } from "lucide-react";
import type { ReportItem } from "@/types/product";
import { fmtDate, shortHost } from "./risk-status";

export function CommunityBoard({ verified, mine }: { verified: ReportItem[]; mine: ReportItem[] }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("phishing");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (submitting) return;
    setSubmitting(true); setError(""); setSuccess("");
    try {
      const response = await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), category, description: description.trim() }) });
      const body = await response.json() as { error?: string; message?: string };
      if (!response.ok) { setError(body.error ?? "Report submission failed"); return; }
      setSuccess(body.message ?? "Your report is pending moderator review.");
      setUrl(""); setDescription(""); router.refresh();
    } catch { setError("Could not contact the reporting service. Please retry."); }
    finally { setSubmitting(false); }
  }
  return <div className="tlx-community-layout">
    <section className="tlx-report-form-panel"><div className="tlx-form-top"><span className="tlx-overline">01 / CONTRIBUTE AN OBSERVATION</span><FileText size={23}/></div><h2>REPORT A<br/><em>THREAT SIGNAL.</em></h2><p>Share a suspicious destination and your observations. ThreatLinx also queues a technical investigation; reviewed reports may later receive verifiable blockchain evidence commitments.</p>
      <form onSubmit={submit} className="tlx-report-form">
        <label htmlFor="report-url">WEBSITE URL <span>REQUIRED</span></label><input id="report-url" type="text" required maxLength={2048} placeholder="https://suspicious-domain.example" value={url} onChange={e=>setUrl(e.target.value)}/>
        <label htmlFor="report-category">WHAT DID YOU OBSERVE? <span>REQUIRED</span></label><select id="report-category" value={category} onChange={e=>setCategory(e.target.value)}><option value="phishing">Potential phishing</option><option value="impersonation">Brand impersonation</option><option value="malware">Possible malware distribution</option><option value="other">Other suspicious behavior</option></select>
        <label htmlFor="report-description">YOUR EVIDENCE / CONTEXT <span>20–1000 CHARS</span></label><textarea id="report-description" rows={5} required minLength={20} maxLength={1000} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe the behavior or message that made this website suspicious. Do not include passwords or personal data."/>
        {error && <p className="tlx-inline-error" role="alert">{error}</p>}
        {success && <p className="tlx-inline-success" role="status"><Check size={16}/>{success}</p>}
        <button disabled={submitting} className="tlx-action tlx-action-lime">{submitting ? <LoaderCircle size={17} className="tlx-spin"/> : <ArrowRight size={17}/>} {submitting ? "SUBMITTING" : "SUBMIT FOR REVIEW"}</button>
      </form>
    </section>
    <div className="tlx-community-right">
      <section className="tlx-community-feed"><div className="tlx-feed-top"><div><span className="tlx-overline">02 / COMMUNITY INTELLIGENCE</span><h3>VERIFIED<br/>REPORTS.</h3></div><ShieldCheck size={24}/></div>
        {verified.length ? <div className="tlx-report-list">{verified.map(item=><div className="tlx-report-item" id={`report-${item.id}`} key={item.id}><div><b>{shortHost(item.url)}</b><span>{item.category.toUpperCase()} · {fmtDate(item.submittedAt)}</span></div><span className="tlx-report-tag">VERIFIED</span><p>{item.description}</p></div>)}</div> : <div className="tlx-feed-empty"><span>✳</span><h4>NO VERIFIED REPORTS YET.</h4><p>Only manually verified reports appear in this feed. Pending submissions are not presented as facts.</p></div>}
      </section>
      <section className="tlx-my-reports"><div className="tlx-my-reports-head"><span className="tlx-overline">03 / YOUR SUBMISSIONS</span><span>{mine.length} RECORDS</span></div>
        {mine.length ? mine.map(item=><div className="tlx-my-report" key={item.id}><span><b>{shortHost(item.url)}</b><small>{fmtDate(item.submittedAt)} · {item.category}</small></span><i className={item.status === "verified" ? "verified" : ""}>{item.status.toUpperCase()}</i></div>) : <p>You haven&apos;t submitted any reports yet. Your review history will appear here.</p>}
      </section>
    </div>
  </div>;
}
