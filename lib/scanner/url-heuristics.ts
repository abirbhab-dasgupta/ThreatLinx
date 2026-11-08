import type { CheckResult } from "@/types/scan";
import { evidence } from "./helpers";
import { normalizeTarget } from "@/lib/security/target";

                                                                      
const BRANDS = [
  { name: "Microsoft", domain: "microsoft.com", token: "microsoft" },
  { name: "PayPal", domain: "paypal.com", token: "paypal" },
  { name: "Google", domain: "google.com", token: "google" },
  { name: "State Bank of India", domain: "onlinesbi.sbi", token: "onlinesbi" },
  { name: "Amazon", domain: "amazon.com", token: "amazon" },
];
function editDistance(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => i + j));
  for (let j=0; j<=b.length; j++) dp[0][j] = j;
  for (let i=1; i<=a.length; i++) for (let j=1; j<=b.length; j++)
    dp[i][j] = Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+(a[i-1] === b[j-1] ? 0 : 1));
  return dp[a.length][b.length];
}

export function analyzeUrl(raw: string): CheckResult {
  const { hostname, registrableDomain } = normalizeTarget(raw);
  const labels = hostname.split(".");
  const signals = [];
  const registrableLabel = registrableDomain.split(".")[0];
  const normalizedLabel = registrableLabel.replace(/0/g, "o").replace(/1/g, "l").replace(/5/g, "s");
  const segments = normalizedLabel.split("-").filter(Boolean);
  for (const brand of BRANDS) {
    if (registrableDomain === brand.domain) continue;
                                                                                          
    const lookalike = segments.some(segment => {
      const distance = editDistance(segment, brand.token);
      return (distance <= 1 && Math.abs(segment.length - brand.token.length) <= 1) ||
        (segment === brand.token && registrableDomain !== brand.domain);
    });
    if (lookalike) {
      signals.push(evidence("url-lookalike", "url", "warning", `Possible ${brand.name} impersonation`,
        `The registered domain ${registrableDomain} contains a label resembling ${brand.token}, but differs from the listed official domain. This requires confirmation.`,
        "ThreatLinx URL heuristics", 30, { claimedBrand: brand.name, officialDomain: brand.domain, registrableDomain }));
      break;
    }
    if (normalizedLabel.includes(brand.token)) {
      signals.push(evidence("url-brand-reference", "url", "warning", `${brand.name} brand reference in unrelated domain`,
        `The registrable domain includes a brand name but is not on the small reference list of official domains. This is a weak indicator, not proof of phishing.`,
        "ThreatLinx URL heuristics", 12, { claimedBrand: brand.name, registrableDomain }));
      break;
    }
  }
  if (labels.some(l => l.startsWith("xn--"))) signals.push(evidence("url-punycode", "url", "warning",
    "Internationalized hostname needs review", "The domain uses punycode encoding. This can be legitimate but may hide visual lookalikes.",
    "ThreatLinx URL heuristics", 10));
  if (registrableLabel.length > 35 || (registrableLabel.match(/-/g)?.length ?? 0) >= 3) signals.push(evidence("url-complexity", "url", "info",
    "Unusual domain structure", "A long or heavily hyphenated domain is a weak contextual signal.", "ThreatLinx URL heuristics", 5));
  if (!signals.length) signals.push(evidence("url-no-obvious-signals", "url", "info", "No obvious URL lookalike indicators",
    "This URL does not match the limited set of implemented heuristic rules. This does not establish safety.", "ThreatLinx URL heuristics"));
  return { provider: "url", status: "completed", evidence: signals, metadata: { hostname, registrableDomain } };
}
