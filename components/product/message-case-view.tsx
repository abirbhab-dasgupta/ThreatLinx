"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, AlertTriangle, Link2, Clock3, ShieldCheck } from "lucide-react";
type CaseItem={id:string;sourceType:string;redactedText:string;status:string;phase:string;verdict:string|null;riskScore:number|null;confidence:string|null;explanation:string|null;signals:Array<{code:string;label:string;detail:string;weight:number}>;aiObservations:string[];recommendations:string[];createdAt:string};
type Linked={url:string;domain:string;scanId:string|null;scanStatus:string|null;scanVerdict:string|null;scanThreatRisk:number|null};
export function MessageCaseView({id}:{id:string}) {
  const [data,setData]=useState<{case:CaseItem;links:Linked[]}|null>(null);
  const [error,setError]=useState("");
  useEffect(()=>{
    let cancel=false;let timer:ReturnType<typeof setTimeout>|undefined;
    async function load(){
      try {const r=await fetch(`/api/messages/${id}`,{cache:"no-store"});const body=await r.json();if(!r.ok)throw Error(body.error||"Cannot load message");if(cancel)return;setData(body);if(["queued","running"].includes(body.case.status) || body.links.some((link:Linked)=>["queued","running"].includes(link.scanStatus||"")))timer=setTimeout(load,3500);}
      catch(e){if(!cancel)setError(e instanceof Error?e.message:"Unable to load case");}
    }
    void load();return()=>{cancel=true;if(timer)clearTimeout(timer)};
  },[id]);
  if(error)return <p className="tlx-inline-error" role="alert">{error}</p>;
  if(!data)return <div className="tlx-empty-panel"><Clock3 size={22}/> Loading your investigation…</div>;
  const item=data.case;
  return <div className="tlx-v2-detail">
    <div className="tlx-v2-result-top"><div><span className="tlx-overline">{item.sourceType.toUpperCase()} / PRIVATE CASE</span><h2>{item.status==="failed"?"INVESTIGATION INTERRUPTED":item.verdict?item.verdict.replaceAll("-"," ").toUpperCase():"ANALYSIS IN PROGRESS"}</h2><p>{item.explanation||item.phase}</p></div><div className="tlx-v2-score"><small>INDICATOR SCORE</small><b>{item.riskScore??"—"}</b><span>CONFIDENCE: {item.confidence||"PENDING"}</span></div></div>
    <div className="tlx-v2-grid">
      <section className="tlx-v2-panel"><div className="tlx-v2-panel-head"><span>01 / REDACTED SUBMISSION</span><ShieldCheck size={19}/></div><p className="tlx-v2-message-quote">{item.redactedText}</p><small>Sensitive patterns are redacted where detected. Never submit passwords, OTPs, or personal data.</small></section>
      <section className="tlx-v2-panel"><div className="tlx-v2-panel-head"><span>02 / SOCIAL ENGINEERING SIGNALS</span><AlertTriangle size={19}/></div>{item.signals.length?item.signals.map(s=><div className="tlx-v2-signal" key={s.code}><b>{s.label}</b><p>{s.detail}</p></div>):<p>No deterministic language indicators identified.</p>}</section>
    </div>
    <section className="tlx-v2-panel"><div className="tlx-v2-panel-head"><span>03 / LINKED WEBSITE INVESTIGATIONS</span><Link2 size={19}/></div>{data.links.length?<div className="tlx-v2-links">{data.links.map((link,index)=><div key={index}><div><b>{link.domain}</b><small>{link.scanStatus||"Queued"} / {link.scanVerdict||"Awaiting evidence"}</small></div>{link.scanId?<Link href={`/investigations/${link.scanId}`}>OPEN EVIDENCE <ArrowUpRight size={16}/></Link>:null}</div>)}</div>:<p>No eligible public HTTP(S) links were detected. This is a message-only assessment.</p>}</section>
    <div className="tlx-v2-grid"><section className="tlx-v2-panel"><div className="tlx-v2-panel-head"><span>04 / ANALYST OBSERVATIONS</span><CheckCircle2 size={19}/></div>{item.aiObservations.length?item.aiObservations.map((x,i)=><p key={i} className="tlx-v2-bullet">{x}</p>):<p>Analysis will appear when processing completes.</p>}</section><section className="tlx-v2-panel"><div className="tlx-v2-panel-head"><span>05 / RECOMMENDED PRECAUTIONS</span><ShieldCheck size={19}/></div>{item.recommendations.map((x,i)=><p key={i} className="tlx-v2-bullet">{x}</p>)}<small>Risk categories describe available evidence; no online safety guarantee is implied.</small></section></div>
  </div>;
}
