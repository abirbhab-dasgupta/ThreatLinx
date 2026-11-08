"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {Network,Link2,ShieldAlert} from "lucide-react";
type Cluster={domain:string;basis:string;confidence:string;members:Array<{id:string;kind:string;label:string}>};
export function CampaignBoard(){
  const [clusters,setClusters]=useState<Cluster[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
  useEffect(()=>{let active=true;fetch("/api/campaigns").then(r=>r.json().then(body=>({r,body}))).then(({r,body})=>{if(!r.ok)throw Error(body.error);if(active)setClusters(body.clusters||[])}).catch(e=>{if(active)setError(e.message||"Correlation unavailable")}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[]);
  return <section className="tlx-v2-panel"><div className="tlx-v2-panel-head"><span>SHARED TECHNICAL INDICATORS</span><Network size={18}/></div><div className="tlx-v2-explainer"><ShieldAlert size={20}/><p>Groups are based on matching registrable domains in your message cases and reviewed community reports. A match indicates shared destinations—not proof of a shared attacker.</p></div>{loading?<p>Correlating submitted evidence…</p>:error?<p role="alert" className="tlx-inline-error">{error}</p>:clusters.length?clusters.map(x=><article className="tlx-campaign-card" key={x.domain}><header><div><span className="tlx-overline">EXACT DOMAIN MATCH / {x.members.length} CASES</span><h3>{x.domain}</h3></div><Link2 size={20}/></header><p>{x.basis}</p><div>{x.members.map((m,i)=><Link key={`${m.id}-${i}`} href={m.kind==="message"?`/messages/${m.id}`:`/intelligence#report-${m.id}`} className="tlx-campaign-chip">{m.kind==="message"?"MESSAGE CASE":"REVIEWED REPORT"} ↗</Link>)}</div></article>):<div className="tlx-v2-empty">No supported clusters yet. Shared domains will appear only after multiple qualifying submissions.</div>}</section>;
}
