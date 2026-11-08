import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { scans, evidence as evidenceTable, providerChecks, reports } from "@/lib/schema";
import type { AiExplanation, Assessment, CheckResult } from "@/types/scan";

export async function markPhase(id: string, phase: string) {
  await db.update(scans).set({ status: "running", phase, updatedAt: new Date() }).where(eq(scans.id, id));
}

export async function storeChecks(id: string, checks: CheckResult[]) {
  for (const check of checks) {
    await db.insert(providerChecks).values({ scanId: id, provider: check.provider, status: check.status,
      error: check.error ?? null, metadata: check.metadata ?? null, updatedAt: new Date() })
      .onConflictDoUpdate({ target: [providerChecks.scanId, providerChecks.provider],
        set: { status: check.status, error: check.error ?? null, metadata: check.metadata ?? null, updatedAt: new Date() } });
    for (const item of check.evidence) {
      const row = { scanId: id, code: item.code, category: item.category, level: item.level,
        title: item.title, detail: item.detail, source: item.source, scoreImpact: item.scoreImpact,
        observedAt: new Date(item.observedAt), metadata: item.metadata ?? null };
      await db.insert(evidenceTable).values(row).onConflictDoUpdate({
        target: [evidenceTable.scanId, evidenceTable.code, evidenceTable.source], set: row,
      });
    }
  }
}

export async function completeScan(id: string, assessment: Assessment, ai: AiExplanation, checks: CheckResult[]) {
  const partial = checks.some(c => c.status !== "completed" && c.status !== "skipped");
  await db.update(scans).set({
    status: partial ? "partial" : "completed",
    phase: partial ? "Finished with unavailable checks" : "Investigation completed",
    threatRisk: assessment.threatRisk, verdict: assessment.verdict, confidence: assessment.confidence,
    securityGrade: assessment.securityGrade, explanation: ai.summary, nextActions: ai.actions,
    updatedAt: new Date(), completedAt: new Date(),
  }).where(eq(scans.id, id));
}

export async function getUserScan(id: string, userId: string) {
  const [scan] = await db.select().from(scans).where(and(eq(scans.id, id), eq(scans.userId, userId))).limit(1);
  if (!scan) return null;
  const [findings, checks] = await Promise.all([
    db.select().from(evidenceTable).where(eq(evidenceTable.scanId, id)).orderBy(evidenceTable.category),
    db.select().from(providerChecks).where(eq(providerChecks.scanId, id)),
  ]);
  return { ...scan, evidence: findings, providers: checks };
}

export async function recentUserScans(userId: string, limit = 40) {
  return db.select({ id: scans.id, hostname: scans.hostname, url: scans.url, deepScan: scans.deepScan,
    status: scans.status, verdict: scans.verdict, threatRisk: scans.threatRisk, confidence: scans.confidence,
    securityGrade: scans.securityGrade, createdAt: scans.createdAt, completedAt: scans.completedAt })
    .from(scans).where(eq(scans.userId, userId)).orderBy(desc(scans.createdAt)).limit(limit);
}

export async function userOverview(userId: string) {
  const [summary] = await db.select({
    total: sql<number>`count(*)::int`,
    flagged: sql<number>`count(*) filter (where ${scans.verdict} in ('confirmed-malicious','known-threat','high-risk','suspicious'))::int`,
    completed: sql<number>`count(*) filter (where ${scans.status} in ('completed','partial'))::int`,
  }).from(scans).where(eq(scans.userId, userId));
  return { total: summary?.total ?? 0, flagged: summary?.flagged ?? 0, completed: summary?.completed ?? 0 };
}

export async function userReportCount(userId: string) {
  const [summary] = await db.select({ count: sql<number>`count(*)::int` }).from(reports).where(eq(reports.userId, userId));
  return summary?.count ?? 0;
}
