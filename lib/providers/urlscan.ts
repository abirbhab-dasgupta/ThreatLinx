import type { CheckResult } from "@/types/scan";
import { evidence, unavailable } from "@/lib/scanner/helpers";

const API = "https://urlscan.io/api/v1";

export async function submitPrivateBrowserScan(url: string): Promise<{ uuid: string } | null> {
  const key = process.env.URLSCAN_API_KEY;
  if (!key) return null;
  const response = await fetch(`${API}/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "API-Key": key },
    body: JSON.stringify({ url, visibility: "private" }),
    signal: AbortSignal.timeout(10000), cache: "no-store",
  });
  if (!response.ok) throw new Error(`urlscan private submission failed (HTTP ${response.status}). No public fallback used.`);
  const data = await response.json() as { uuid?: string };
  if (!data.uuid || !/^[0-9a-f-]{36}$/i.test(data.uuid)) throw new Error("urlscan returned no valid scan identifier");
  return { uuid: data.uuid };
}

export async function readBrowserScan(uuid: string): Promise<CheckResult | null> {
  const key = process.env.URLSCAN_API_KEY;
  if (!key) return unavailable("browser", "URLSCAN_API_KEY not configured");
  if (!/^[0-9a-f-]{36}$/i.test(uuid)) throw new Error("Invalid urlscan identifier");
  const response = await fetch(`${API}/result/${uuid}/`, {
    headers: { "API-Key": key }, cache: "no-store", signal: AbortSignal.timeout(10000),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`urlscan result failed (HTTP ${response.status})`);
  const data = await response.json() as {
    page?: { domain?: string; url?: string; title?: string; redirected?: boolean; status?: string | number };
    data?: { inputTypes?: string[]; redirects?: unknown[] };
    lists?: { domains?: string[] };
    verdicts?: { urlscan?: { score?: number; categories?: string[]; brands?: Array<{ name?: string }> } };
  };
  const v = data.verdicts?.urlscan;
  const score = typeof v?.score === "number" ? v.score : null;
  const categories = (v?.categories ?? []).filter(x => typeof x === "string").slice(0, 6);
  const inputs = (data.data?.inputTypes ?? []).slice(0, 30);
  const hasPassword = inputs.some(x => x.toLowerCase() === "password");
  const redirects = data.data?.redirects?.length ?? 0;
  const findings = [];
  if (score !== null && score >= 25) findings.push(evidence("browser-urlscan-risk", "browser", "critical",
    "Browser scan reported suspicious content", `urlscan reported a maliciousness score of ${score} (its native scale is -100 to 100); categories: ${categories.join(", ") || "unspecified"}.`,
    "urlscan.io", Math.min(80, Math.max(35, Math.round(score * 0.75))), { urlscanScore: score, categories }));
  if (hasPassword) findings.push(evidence("browser-password", "browser", "info", "Password input observed",
    "The browser-observed page contains a password input. This is contextual evidence, not proof of credential theft.",
    "urlscan.io", 0));
  if (redirects > 0) findings.push(evidence("browser-redirects", "browser", "info", "Redirect behaviour observed",
    `The page redirected ${redirects} time(s). Redirects alone are not malicious.`, "urlscan.io", 0,
    { redirectCount: redirects }));
  if (!findings.length) findings.push(evidence("browser-no-strong-signal", "browser", "info",
    "No strong browser threat signal", "The returned browser metadata did not meet the implemented detection thresholds. This is not proof of safety.", "urlscan.io"));
  return { provider: "browser", status: "completed", evidence: findings,
    metadata: { resultId: uuid, urlscanScore: score, categories, finalHostname: data.page?.domain ?? null,
      contactedDomainCount: data.lists?.domains?.length ?? null, hasPassword, redirectCount: redirects } };
}
