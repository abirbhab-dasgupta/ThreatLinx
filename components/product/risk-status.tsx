import type { Verdict, ScanStatus } from "@/types/scan";
export function riskLabel(verdict: Verdict | null, status?: ScanStatus) {
  if (status === "queued" || status === "running") return "Analyzing";
  if (status === "failed") return "Interrupted";
  return ({ "confirmed-malicious": "Confirmed malicious", "known-threat": "Known threat", "high-risk": "High risk", suspicious: "Suspicious", "low-risk": "Low risk", "no-known-threat": "No known match", inconclusive: "Inconclusive" } as Record<string,string>)[verdict ?? ""] ?? "Awaiting evidence";
}
export function riskTone(verdict: Verdict | null, status?: ScanStatus) {
  if (status === "queued" || status === "running") return "processing";
  if (verdict === "known-threat" || verdict === "confirmed-malicious") return "critical";
  if (verdict === "suspicious" || verdict === "high-risk") return "warning";
  if (verdict === "no-known-threat" || verdict === "low-risk") return "neutral";
  return "muted";
}
export function RiskStatus({ verdict, status }: { verdict: Verdict | null; status?: ScanStatus }) {
  return <span className={`tlx-pill tlx-pill-${riskTone(verdict, status)}`}><span className="tlx-pill-dot"/>{riskLabel(verdict, status)}</span>;
}
export function fmtDate(value: string) { return new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value)); }
export function shortHost(url: string) { try { return new URL(url).hostname; } catch { return url; } }
