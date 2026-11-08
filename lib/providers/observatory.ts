import type { CheckResult } from "@/types/scan";
import { evidence } from "@/lib/scanner/helpers";

export async function scanObservatory(hostname: string): Promise<CheckResult> {
  const endpoint = new URL("https://observatory-api.mdn.mozilla.net/api/v2/scan");
  endpoint.searchParams.set("host", hostname);
  const response = await fetch(endpoint, {
    method: "POST", headers: { "User-Agent": "ThreatLinx/1.0" },
    signal: AbortSignal.timeout(12000), cache: "no-store"
  });
  if (!response.ok) throw new Error(`Mozilla Observatory returned HTTP ${response.status}`);
  const data = await response.json() as { grade?: string; score?: number; tests_failed?: number; tests_passed?: number; details_url?: string };
  if (!data.grade) throw new Error("Observatory returned no security grade");
  const grade = String(data.grade).slice(0, 3);
  return { provider: "security", status: "completed", metadata: { grade, detailsUrl: data.details_url ?? null },
    evidence: [evidence("security-observatory", "security", grade.startsWith("A") ? "info" : "warning", `HTTP security posture: ${grade}`,
      `Mozilla Observatory graded the site's HTTP security controls ${grade}. Security headers are not a measure of phishing legitimacy.`,
      "Mozilla HTTP Observatory", 0, { grade, testsPassed: data.tests_passed ?? null, testsFailed: data.tests_failed ?? null })] };
}
