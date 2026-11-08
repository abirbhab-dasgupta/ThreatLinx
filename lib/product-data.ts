import type { InferSelectModel } from "drizzle-orm";
import type { scans, evidence, providerChecks, reports } from "@/lib/schema";
import type { ScanSummary, Investigation, ReportItem } from "@/types/product";
import type { ScanStatus, Verdict, Confidence, Category, Level } from "@/types/scan";

type Scan = InferSelectModel<typeof scans>;
type Evidence = InferSelectModel<typeof evidence>;
type Provider = InferSelectModel<typeof providerChecks>;
type Report = InferSelectModel<typeof reports>;

export function serializeSummary(row: Pick<Scan, "id"|"hostname"|"url"|"deepScan"|"status"|"verdict"|"threatRisk"|"confidence"|"securityGrade"|"createdAt"|"completedAt">): ScanSummary {
  return { id:row.id, hostname:row.hostname, url:row.url, deepScan:row.deepScan,
    threatRisk:row.threatRisk, securityGrade:row.securityGrade,
    status: row.status as ScanStatus, verdict: row.verdict as Verdict | null,
    confidence: row.confidence as Confidence | null,
    createdAt: row.createdAt.toISOString(), completedAt: row.completedAt?.toISOString() ?? null };
}
export function serializeInvestigation(scan: Scan, findings: Evidence[], checks: Provider[]): Investigation {
  return { ...serializeSummary(scan), phase: scan.phase, explanation: scan.explanation,
    nextActions: scan.nextActions, updatedAt: scan.updatedAt.toISOString(),
    evidence: findings.map(e => ({ id: e.id, code: e.code, category: e.category as Category,
      level: e.level as Level, title: e.title, detail: e.detail, source: e.source,
      scoreImpact: e.scoreImpact, observedAt: e.observedAt.toISOString(), metadata: e.metadata ?? undefined })),
    providers: checks.map(p => ({ provider: p.provider, status: p.status, error: p.error,
      metadata: p.metadata, updatedAt: p.updatedAt.toISOString() })) };
}
export function serializeReport(row: Pick<Report,"id"|"url"|"category"|"description"|"status"|"submittedAt">): ReportItem {
  return { ...row, submittedAt: row.submittedAt.toISOString() };
}
