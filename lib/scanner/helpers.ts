import type { CheckResult, Category, Evidence, Level } from "@/types/scan";
export function evidence(
  code: string, category: Category, level: Level, title: string,
  detail: string, source: string, scoreImpact = 0,
  metadata?: Record<string, unknown>
): Evidence {
  return { code, category, level, title, detail, source, scoreImpact, observedAt: new Date().toISOString(), metadata };
}
export function unavailable(provider: Category, reason: string): CheckResult {
  return { provider, status: "unavailable", evidence: [], error: reason };
}
export async function guarded(provider: Category, fn: () => Promise<CheckResult>): Promise<CheckResult> {
  try { return await fn(); }
  catch (error) { return { provider, status: "error", evidence: [], error: error instanceof Error ? error.message.slice(0, 200) : "Provider failed" }; }
}

                                                                                  
export async function guardedPending(provider: Category, fn: () => Promise<CheckResult | null>): Promise<CheckResult | null> {
  try { return await fn(); }
  catch (error) { return { provider, status: "error", evidence: [], error: error instanceof Error ? error.message.slice(0, 200) : "Provider failed" }; }
}
