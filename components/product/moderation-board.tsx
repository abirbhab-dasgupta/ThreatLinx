"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import type { Investigation, ReportItem } from "@/types/product";
import { fmtDate, shortHost, riskLabel } from "./risk-status";

export type PublicationState = {status:string;txHash:string|null;error:string|null};
export type ModeratorReport = ReportItem & {publication?:PublicationState};
const labels:Record<string,string>={unpublished:"Reviewed — not registered",queued:"Queued for registration",publishing:"Waiting for testnet confirmation",confirmed:"Registered on Base Sepolia",failed:"Registration failed — retry available"};

export function ModerationBoard({ pending, reviewed }: { pending: ReportItem[]; reviewed: ModeratorReport[] }) {
  const router=useRouter();
  const [busy,setBusy]=useState<string|null>(null);
  const [error,setError]=useState("");
  const [publications,setPublications]=useState<Record<string,PublicationState>>({});
  const [evidence,setEvidence]=useState<Record<string,{url:string;scan:Investigation|null}>>({});
  const [expanded,setExpanded]=useState<string|null>(null);
  const publicationFor=(report:ModeratorReport)=>publications[report.id] ?? report.publication ?? {status:"unpublished",txHash:null,error:null};
  const pollingIds=reviewed.filter(r=>["queued","publishing"].includes(publicationFor(r).status)).map(r=>r.id).join(",");
  useEffect(()=>{
    if(!pollingIds)return;
    let active=true;
    async function refresh(){
      await Promise.all(pollingIds.split(",").map(async id=>{
        try {
          const response=await fetch(`/api/reports/${id}/publication`,{cache:"no-store",signal:AbortSignal.timeout(10000)});
          const body=await response.json();if(!response.ok)throw Error(body.error||"Publication status unavailable");
          if(active)setPublications(current=>({...current,[id]:body}));
        }catch{if(active)setError("Could not refresh registration status. Updates will retry automatically.");}
      }));
    }
    void refresh();const timer=setInterval(()=>void refresh(),4000);
    return()=>{active=false;clearInterval(timer)};
  },[pollingIds]);
  async function inspect(id:string){
    if(expanded===id){setExpanded(null);return;}
    setBusy(id);setError("");
    try{
      const response=await fetch(`/api/reports/${id}/evidence`,{cache:"no-store"});
      const body=await response.json();if(!response.ok)throw Error(body.error||"Could not load technical evidence");
      setEvidence(current=>({...current,[id]:body}));setExpanded(id);
    }catch(e){setError(e instanceof Error?e.message:"Evidence unavailable");}finally{setBusy(null)}
  }
  async function review(id:string,status:"verified"|"rejected"){
    setBusy(id);setError("");
    try{
      const response=await fetch(`/api/reports/${id}/review`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});
      const body=await response.json();if(!response.ok)throw Error(body.error||"Could not complete review");router.refresh();
    }catch(e){setError(e instanceof Error?e.message:"Could not contact moderation service.");}finally{setBusy(null)}
  }
  async function publish(id:string){
    setBusy(id);setError("");
    try{
      const response=await fetch(`/api/reports/${id}/publish`,{method:"POST",headers:{"Content-Type":"application/json"}});
      const body=await response.json();if(!response.ok)throw Error(body.error||"Publication failed");
      setPublications(current=>({...current,[id]:{status:body.status,txHash:body.txHash??null,error:null}}));
    }catch(e){setError(e instanceof Error?e.message:"Publication unavailable");}finally{setBusy(null)}
  }
  function evidencePanel(id:string){
    if(expanded!==id || !evidence[id])return null;
    const scan=evidence[id].scan;
    return <section className="tlx-moderation-evidence" aria-label="Independent technical evidence"><h4>TECHNICAL EVIDENCE</h4><p>{evidence[id].url}</p>
      {!scan?<p>No completed investigation for this reporter and exact URL yet. Wait for the checks, then reload evidence.</p>:<>
        <p><strong>{riskLabel(scan.verdict,scan.status)}</strong> · Confidence: {scan.confidence??"insufficient"} · {fmtDate(scan.completedAt??scan.createdAt)}</p><p>{scan.explanation}</p>
        <ul>{scan.providers.map(provider=><li key={provider.provider}><strong>{provider.provider.toUpperCase()}</strong>: {provider.status}{provider.error?` — ${provider.error}`:""}</li>)}</ul>
        {scan.evidence.map(item=><div key={item.id}><strong>{item.title}</strong><p>{item.detail}</p><small>{item.source} · {fmtDate(item.observedAt)}</small></div>)}
      </>}
    </section>;
  }
  return <div className="tlx-history-panel">{error&&<p role="alert" className="tlx-inline-error">{error}</p>}
    {pending.length?pending.map(report=><article className="tlx-moderation-item" key={report.id}>
      <div className="tlx-moderation-copy"><span className="tlx-overline">{report.category.toUpperCase()} / {fmtDate(report.submittedAt)}</span><h3>{shortHost(report.url)}</h3><p>{report.description}</p><small>REVIEW THE EVIDENCE INDEPENDENTLY BEFORE CONFIRMING THIS REPORT.</small>{evidencePanel(report.id)}</div>
      <div className="tlx-moderation-actions"><button disabled={Boolean(busy)} onClick={()=>inspect(report.id)}>{expanded===report.id?"CLOSE EVIDENCE":"REVIEW EVIDENCE"}</button><button disabled={Boolean(busy)} onClick={()=>review(report.id,"verified")}><Check size={16}/> VERIFY</button><button disabled={Boolean(busy)} onClick={()=>review(report.id,"rejected")}><X size={16}/> REJECT</button></div>
    </article>):<div className="tlx-history-empty"><span className="tlx-history-empty-star">✳</span><h3>ALL REPORTS REVIEWED.</h3><p>No community submissions are awaiting moderator decisions.</p></div>}
    <section className="tlx-moderation-published"><h2>REGISTER REVIEWED EVIDENCE</h2><p>Only moderator-reviewed reports with completed independent evidence are eligible for registration. The contract records a digest, not message contents.</p>
      {reviewed.length?reviewed.map(report=>{const publication=publicationFor(report);const waiting=["queued","publishing"].includes(publication.status);return <div key={report.id}>
        <div className="tlx-v2-history-row"><span>{shortHost(report.url)}</span><strong role="status">{labels[publication.status]??publication.status}</strong>
          {publication.status==="confirmed"?<Link href={`/proof/${report.id}`}>VERIFY PROOF ↗</Link>:<button type="button" disabled={Boolean(busy)||waiting} onClick={()=>publish(report.id)}>{waiting?"REGISTERING…":publication.status==="failed"?"RETRY REGISTRATION ↗":"REGISTER PROOF ↗"}</button>}
          <button type="button" disabled={Boolean(busy)} onClick={()=>inspect(report.id)}>REVIEW EVIDENCE</button>
        </div>{publication.error&&<p className="tlx-inline-error" role="alert">{publication.error}</p>}{evidencePanel(report.id)}
      </div>}):<p>No reviewed reports available for publication.</p>}
    </section>
  </div>;
}
