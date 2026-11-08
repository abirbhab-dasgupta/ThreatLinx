"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, Globe2, LoaderCircle, LockKeyhole } from "lucide-react";

export function ScanComposer({ initialUrl = "", compact = false }: { initialUrl?: string; compact?: boolean }) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl);
  const [deep, setDeep] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/scans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: url.trim(), deepScan: deep }) });
      const data = await response.json() as { id?: string; error?: string };
      if (!response.ok || !data.id) { setError(data.error ?? "Unable to create investigation"); return; }
      router.push(`/investigations/${data.id}`);
      router.refresh();
    } catch { setError("The investigation service could not be reached. Please retry."); }
    finally { setBusy(false); }
  }
  return <section className={`tlx-scan-composer ${compact ? "compact" : ""}`} id="new-investigation" aria-labelledby="tlx-composer-title">
    <div className="tlx-compose-heading"><div><span className="tlx-overline">/ NEW INVESTIGATION — 01</span><h2 id="tlx-composer-title">Question a link.<br/><em>Follow the evidence.</em></h2></div><div className="tlx-compose-symbol" aria-hidden="true">↗</div></div>
    <form onSubmit={submit} className="tlx-compose-form">
      <div className="tlx-compose-input"><Globe2 size={19}/><input aria-label="Website URL" type="text" inputMode="url" autoComplete="url" spellCheck="false" required maxLength={2048} placeholder="https://website-you-want-to-check.com" value={url} onChange={e => setUrl(e.target.value)}/></div>
      <button type="submit" disabled={busy} className="tlx-action tlx-action-dark">{busy ? <LoaderCircle size={18} className="tlx-spin"/> : <ArrowRight size={19}/>} {busy ? "QUEUING" : "INVESTIGATE"}</button>
    </form>
    <div className="tlx-compose-options"><label><input type="checkbox" checked={deep} onChange={e => setDeep(e.target.checked)}/><span><strong>Include isolated browser analysis</strong><small>Submits the normalized URL to urlscan.io using private visibility when your account supports it.</small></span></label><div className="tlx-compose-security"><LockKeyhole size={14}/> URL query strings and fragments are discarded; sensitive paths are rejected.</div></div>
    {error && <p role="alert" className="tlx-inline-error">{error}</p>}
    {compact && <span className="tlx-composer-hint">REPUTATION / TLS IDENTITY / WEB SECURITY <ArrowUpRight size={12}/></span>}
  </section>;
}
