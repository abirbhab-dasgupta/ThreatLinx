import { normalizeTarget, deepScanAllowed } from "@/lib/security/target";
import { getDomain } from "tldts";

export type MessageSignal = { code: string; label: string; detail: string; weight: number };
export type LinkIndicator = { url: string; domain: string };
export type MessageInputAnalysis = { redactedText: string; signals: MessageSignal[]; links: LinkIndicator[]; rejectedLinks: number };

const RULES: Array<{ code: string; pattern: RegExp; label: string; detail: string; weight: number }> = [
  { code: "otp-request", pattern: /\b(?:otp|one.time.password|verification code|2fa code|cvv|security code|ओटीपी)\b/i, label: "Authentication secret mentioned", detail: "Message references a one-time code or another sensitive authentication factor.", weight: 30 },
  { code: "credential-request", pattern: /\b(?:password|passcode|login credentials?|account credentials?|reset your password|पासवर्ड)\b/i, label: "Credential-related request", detail: "Message refers to account credentials or password activity.", weight: 18 },
  { code: "pressure", pattern: /\b(?:urgent|immediately|within \d+ (?:min|hour)|last warning|final notice|act now|limited time|तुरंत|जल्दी)\b/i, label: "Time pressure", detail: "Message uses urgency or a deadline to encourage rapid action.", weight: 15 },
  { code: "account-threat", pattern: /\b(?:account (?:will be |has been )?(?:blocked|suspended|frozen|deactivated)|suspend your account|kyc (?:pending|expired|required|update)|केवाईसी)\b/i, label: "Account restriction claim", detail: "Message threatens loss of access or demands account verification.", weight: 20 },
  { code: "payment-request", pattern: /\b(?:transfer (?:money|funds)|processing fee|registration fee|pay (?:now|immediately)|upi|wallet transfer|payment required|refund fee|₹\s?\d+)\b/i, label: "Payment instruction", detail: "Message mentions a payment, transfer, or payment-related demand.", weight: 15 },
  { code: "reward-bait", pattern: /\b(?:you (?:have )?won|claim (?:your )?(?:prize|reward)|lottery winner|guaranteed job|selection fee|free gift)\b/i, label: "Reward or recruitment bait", detail: "Message promises a prize or opportunity that deserves verification.", weight: 18 },
  { code: "claimed-organisation", pattern: /\b(?:bank|government|ministry|university|customer support|recruiter|hr department|income tax)\b/i, label: "Claimed institutional identity", detail: "Message claims a relationship to an institution or support service.", weight: 8 },
];

                                                                                 
export function redactMessage(input: string): string {
  return input
    .replace(/\b(?:otp|one[ -]time[ -](?:password|code)|verification code|2fa code|security code|cvv|pin)\s*(?:(?:is|was)\s*)?[:=\-]?\s*\d(?:[ -]?\d){2,9}\b/gi, "[REDACTED SECRET]")
    .replace(/\b\d(?:[ -]?\d){3,7}\s+(?:(?:is|was)\s+)?(?:your\s+)?(?:otp|verification code|one[ -]time[ -](?:password|code))\b/gi, "[REDACTED SECRET]")
    .replace(/\b(?:otp|cvv|pin|password|passcode|secret)\s*(?:[:=\-]|is|was)\s*\S+/gi, "[REDACTED SECRET]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED EMAIL]")
    .replace(/(?:\+\d{1,3}[ -]?)?\b\d{10,13}\b/g, "[REDACTED NUMBER]")
    .replace(/https?:\/\/[^\s<>'"()]+/gi, match => {
      try { const u = new URL(match.replace(/[.,!?;]+$/, "")); return `${u.protocol}//${u.hostname}/[PATH REMOVED]`; }
      catch { return "[LINK REMOVED]"; }
    });
}

export function extractMessageEvidence(input: string): MessageInputAnalysis {
  const links: LinkIndicator[] = [];
  let rejectedLinks = 0;
                                                                                             
  const seen = new Set<string>();
  for (const match of input.matchAll(/https?:\/\/[^\s<>'"()]+/gi)) {
    if (links.length >= 3) break;
    try {
      const target = normalizeTarget(match[0].replace(/[.,!?;]+$/, ""));
      if (!deepScanAllowed(target.url)) { rejectedLinks++; continue; }
      if (!seen.has(target.url)) {
        seen.add(target.url);
        links.push({ url: target.url, domain: getDomain(target.hostname, { allowPrivateDomains: false }) ?? target.hostname });
      }
    } catch { rejectedLinks++; }
  }
  const signals = RULES.filter(rule => rule.pattern.test(input)).map(({code,label,detail,weight}) => ({code,label,detail,weight}));
  if (links.length) signals.push({ code: "linked-site", label: "External destination included", detail: "Extracted a website address for independent investigation. The presence of a link is not evidence of fraud.", weight: 0 });
  return { redactedText: redactMessage(input).slice(0,7000), signals, links, rejectedLinks };
}

export type MessageAssessment = { verdict: "low-risk"|"suspicious"|"high-risk"|"confirmed-malicious"|"inconclusive"; riskScore: number | null; confidence: "low"|"medium"|"high"|"insufficient" };

export function assessMessage(signals: MessageSignal[], linkedVerdicts: Array<string | null>): MessageAssessment {
  const codes = new Set(signals.map(s => s.code));
  const score = Math.min(100, signals.reduce((a, s) => a + s.weight, 0));
  const known = linkedVerdicts.includes("known-threat") || linkedVerdicts.includes("confirmed-malicious");
  const linksCompleted = linkedVerdicts.some(v => v && v !== "inconclusive");
  const multi = (codes.has("otp-request") || codes.has("credential-request")) && (codes.has("account-threat") || codes.has("pressure"));
  if (known) return { verdict: "confirmed-malicious", riskScore: Math.max(score, 90), confidence: "high" };
  if (score >= 55 && multi) return { verdict: "high-risk", riskScore: score, confidence: linksCompleted ? "medium" : "low" };
  if (score >= 20) return { verdict: "suspicious", riskScore: score, confidence: linksCompleted ? "medium" : "low" };
  if (linksCompleted) return { verdict: "low-risk", riskScore: score, confidence: "low" };
  return { verdict: "inconclusive", riskScore: null, confidence: "insufficient" };
}
