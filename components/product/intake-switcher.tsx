"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FileSearch2, MailWarning, ShieldCheck, LoaderCircle } from "lucide-react";
import { ScanComposer } from "./scan-composer";

                                                                                      
export function IntakeSwitcher({ initialMode = "website" }: { initialMode?: "website" | "message" }) {
  const [mode,setMode]=useState<"website"|"message">(initialMode);
  const [sourceType,setSourceType]=useState("sms");
  const [text,setText]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const router=useRouter();
  async function submit(e:FormEvent) {
    e.preventDefault();if(busy)return;setBusy(true);setError("");
    try {
      const r=await fetch("/api/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sourceType,text})});
      const result=await r.json() as {id?:string;error?:string};
      if(!r.ok||!result.id){setError(result.error||"Unable to investigate the message");return;}
      router.push(`/messages/${result.id}`);router.refresh();
    } catch {setError("The analysis service could not be reached.");} finally {setBusy(false);}
  }
  return <div className="tlx-intake">
    <div className="tlx-intake-tabs" role="tablist" aria-label="Investigation input">
      <button role="tab" id="website-tab" aria-controls="website-panel" aria-selected={mode==="website"} type="button" onClick={()=>setMode("website")} className={mode==="website"?"active":""}><FileSearch2 size={18}/> WEBSITE / URL <span>01</span></button>
      <button role="tab" id="message-tab" aria-controls="message-panel" aria-selected={mode==="message"} type="button" onClick={()=>setMode("message")} className={mode==="message"?"active":""}><MailWarning size={18}/> SCAM MESSAGE <span>02</span></button>
    </div>
    {mode==="website" ? <div id="website-panel" role="tabpanel" aria-labelledby="website-tab"><ScanComposer compact/></div> :
    <section id="message-panel" role="tabpanel" aria-labelledby="message-tab" className="tlx-message-composer">
      <div className="tlx-message-composer-head"><span className="tlx-overline">/ COMMUNICATION INTELLIGENCE</span><h2>READ THE MESSAGE.<br/><em>TRACE THE INTENT.</em></h2><p>Paste an SMS, email, recruitment offer or notification. We identify social-engineering indicators and investigate any eligible website links it contains.</p></div>
      <form onSubmit={submit} className="tlx-message-compose-form">
        <div className="tlx-message-types" role="group" aria-label="Message source">{[{v:"sms",l:"SMS"},{v:"email",l:"EMAIL"},{v:"social",l:"SOCIAL / CHAT"},{v:"other",l:"OTHER"}].map(item=><button key={item.v} type="button" onClick={()=>setSourceType(item.v)} aria-pressed={sourceType===item.v} className={sourceType===item.v?"active":""}>{item.l}</button>)}</div>
        <label htmlFor="suspicious-text" className="tlx-input-label">SUSPICIOUS MESSAGE <span>25–6000 CHARACTERS</span></label>
        <textarea id="suspicious-text" rows={7} required minLength={25} maxLength={6000} value={text} onChange={e=>setText(e.target.value)} placeholder="Your bank account will be blocked today. Visit https://example.com to complete verification…"/>
        <div className="tlx-message-form-bottom"><span><ShieldCheck size={15}/> Never include passwords, OTPs or personal details. Sensitive patterns are redacted before analysis.</span><button disabled={busy||text.trim().length<25} className="tlx-action tlx-action-dark" type="submit">{busy?<LoaderCircle className="tlx-spin" size={18}/>:<ArrowRight size={18}/>} {busy?"QUEUING":"INVESTIGATE MESSAGE"}</button></div>
        {error && <p role="alert" className="tlx-inline-error">{error}</p>}
      </form>
    </section>}
  </div>;
}
