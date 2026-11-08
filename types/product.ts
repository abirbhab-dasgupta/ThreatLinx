import type { Evidence, Confidence, Verdict, ScanStatus } from "@/types/scan";

export type ScanSummary = {
  id: string; hostname: string; url: string; deepScan: boolean;
  status: ScanStatus; verdict: Verdict | null; threatRisk: number | null;
  confidence: Confidence | null; securityGrade: string | null;
  createdAt: string; completedAt: string | null;
};
export type ProviderRow = { provider: string; status: string; error: string | null;
  metadata: Record<string, unknown> | null; updatedAt: string };
export type EvidenceRow = Evidence & { id: string };
export type Investigation = ScanSummary & {
  phase: string; explanation: string | null; nextActions: string[];
  updatedAt: string; evidence: EvidenceRow[]; providers: ProviderRow[];
};
export type ReportItem = { id: string; url: string; category: string;
  description: string; status: string; submittedAt: string };
