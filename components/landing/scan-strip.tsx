"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function LandingScanStrip() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function investigate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/scans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: url.trim(), deepScan: false }) });
      if (res.status === 401) { router.push("/sign-in"); return; }
      const data = await res.json() as { id?: string; error?: string };
      if (!res.ok || !data.id) { setError(data.error ?? "Could not begin investigation"); return; }
      router.push(`/investigations/${data.id}`);
    } catch { setError("Investigation service could not be reached. Please retry."); }
    finally { setBusy(false); }
  }
  return <section className="scan-strip" id="investigate" aria-labelledby="scan-title"><div className="container scan-grid">
    <div className="scan-head"><span className="mini">/ 00 — START AN INVESTIGATION</span><h2 id="scan-title">ONE LINK.<br/>DEEPER ANSWERS.</h2></div>
    <div className="scan-side"><form className="scan-form" onSubmit={investigate}><label className="scan-prefix" htmlFor="url-input">↗</label><input id="url-input" name="url" type="text" required inputMode="url" autoComplete="url" spellCheck={false} value={url} onChange={e=>setUrl(e.target.value)} placeholder="Paste a website URL to investigate" aria-label="Website URL"/><button disabled={busy} className="scan-submit" type="submit">{busy ? "QUEUING…" : "INVESTIGATE URL"} <span>↗</span></button></form>
    <div className="scan-disclaimer"><span>WEBSITE CHECKS ARE PASSIVE. SCAM MESSAGE ANALYSIS AVAILABLE AFTER SIGN-IN.</span><span>✳ SIGN IN REQUIRED · QUERY PARAMETERS OMITTED</span></div>
    {error && <p role="alert" style={{margin:"6px 0 0",fontSize:12,color:"#8c2921"}}>{error}</p>}</div>
  </div></section>;
}
