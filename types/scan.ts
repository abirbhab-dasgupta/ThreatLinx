export type Category = "url" | "reputation" | "tls" | "security" | "browser";
export type Level = "info" | "warning" | "critical" | "unknown";
export type CheckStatus = "completed" | "unavailable" | "error" | "skipped";
export type ScanStatus = "queued" | "running" | "completed" | "partial" | "failed";
export type Verdict = "low-risk" | "suspicious" | "high-risk" | "confirmed-malicious" | "inconclusive" | "known-threat" | "no-known-threat";
export type Confidence = "high" | "medium" | "low" | "insufficient";
export type Evidence = {
  code: string;
  category: Category;
  level: Level;
  title: string;
  detail: string;
  source: string;
  scoreImpact: number;
  observedAt: string;
  metadata?: Record<string, unknown>;
};
export type CheckResult = {
  provider: Category;
  status: CheckStatus;
  evidence: Evidence[];
  metadata?: Record<string, unknown>;
  error?: string;
};
export type Assessment = {
  threatRisk: number | null;
  verdict: Verdict;
  confidence: Confidence;
  securityGrade: string | null;
};
export type AiExplanation = { summary: string; actions: string[]; citedEvidenceCodes: string[] };
