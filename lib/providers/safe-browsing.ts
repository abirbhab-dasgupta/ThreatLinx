import type { CheckResult } from "@/types/scan";
import { evidence, unavailable } from "@/lib/scanner/helpers";
import { safeBrowsingHitCount } from "./safe-browsing-response";

export async function checkSafeBrowsing(url: string): Promise<CheckResult> {
  const key = process.env.SAFE_BROWSING_API_KEY;
  if (!key) return unavailable("reputation", "SAFE_BROWSING_API_KEY not configured");
  const endpoint = new URL("https://safebrowsing.googleapis.com/v5/urls:search");
  endpoint.searchParams.set("key", key);
  endpoint.searchParams.append("urls", url);
  const response = await fetch(endpoint, { cache: "no-store", signal: AbortSignal.timeout(6000) });
  if (!response.ok) throw new Error(`Safe Browsing returned HTTP ${response.status}`);
  const hitCount = await safeBrowsingHitCount(response);
  if (hitCount) return {
    provider: "reputation", status: "completed", metadata: { hitCount },
    evidence: [evidence("reputation-known-threat", "reputation", "critical", "Known unsafe URL match",
      "Google Safe Browsing returned one or more threat matches for this submitted URL or a related URL expression.",
      "Google Safe Browsing v5", 95, { hitCount })]
  };
  return { provider: "reputation", status: "completed", evidence: [evidence("reputation-no-match", "reputation", "info",
    "No known threat match", "Safe Browsing did not find a matching known threat. This is not a safety guarantee.", "Google Safe Browsing v5")] };
}
