import { eq } from "drizzle-orm";
import { inngest } from "./client";
import { getDb } from "@/db";
import { scans } from "@/lib/schema";
import { markPhase, storeChecks, completeScan } from "@/lib/scanner/persistence";
import { guarded, guardedPending, unavailable } from "@/lib/scanner/helpers";
import { analyzeUrl } from "@/lib/scanner/url-heuristics";
import { checkSafeBrowsing } from "@/lib/providers/safe-browsing";
import { inspectTls } from "@/lib/providers/tls";
import { scanObservatory } from "@/lib/providers/observatory";
import { submitPrivateBrowserScan, readBrowserScan } from "@/lib/providers/urlscan";
import { assess } from "@/lib/scanner/assessment";
import { explainWithGemini } from "@/lib/providers/gemini";
import type { CheckResult } from "@/types/scan";

export const investigateUrl = inngest.createFunction(
  { id: "threatlinx-investigate-url", concurrency: { limit: 4 }, retries: 2,
    triggers: { event: "threatlinx/scan.created" } },
  async ({ event, step }) => {
    const scanId = event.data.scanId as string;
    const [row] = await step.run("load-scan", () => getDb().select().from(scans).where(eq(scans.id, scanId)).limit(1));
    if (!row) return { error: "Scan not found" };
    await step.run("phase-fast", () => markPhase(scanId, "Inspecting URL, reputation, TLS and web configuration"));

    const [url, reputation, tls, security] = await Promise.all([
      step.run("url-heuristics", async () => guarded("url", async () => analyzeUrl(row.url))),
      step.run("safe-browsing", async () => guarded("reputation", () => checkSafeBrowsing(row.url))),
      step.run("inspect-tls", async () => guarded("tls", () => inspectTls(row.url))),
      step.run("mozilla-observatory", async () => guarded("security", () => scanObservatory(row.hostname))),
    ]);
    const checks: CheckResult[] = [url, reputation, tls, security];
    await step.run("persist-fast", () => storeChecks(scanId, checks));

    if (row.deepScan) {
      await step.run("phase-browser", () => markPhase(scanId, "Observing browser behaviour in an isolated service"));
      const submitted = await step.run("urlscan-submit-private", async () => {
        try { return { result: await submitPrivateBrowserScan(row.url), error: null as string | null }; }
        catch (e) { return { result: null, error: e instanceof Error ? e.message : "Browser scan unavailable" }; }
      });
      let browser: CheckResult = unavailable("browser", submitted.error || "urlscan private scan was not available");
      if (submitted.result?.uuid) {
        await step.sleep("browser-initial-wait", "30s");
        for (let attempt = 0; attempt < 4; attempt++) {
          const result = await step.run(`urlscan-poll-${attempt}`, () => guardedPending("browser", () => readBrowserScan(submitted.result!.uuid)));
          if (result !== null) { browser = result; break; }
          if (attempt < 3) await step.sleep(`browser-retry-wait-${attempt}`, "15s");
          browser = unavailable("browser", "Browser result was not ready before the MVP timeout");
        }
      }
      checks.push(browser);
      await step.run("persist-browser", () => storeChecks(scanId, [browser]));
    } else {
      checks.push({ provider: "browser", status: "skipped", evidence: [], error: "Deep scanning was not requested" });
      await step.run("persist-browser-skipped", () => storeChecks(scanId, [checks[checks.length - 1]]));
    }

    await step.run("phase-analysis", () => markPhase(scanId, "Correlating evidence and preparing the explanation"));
    const assessment = await step.run("deterministic-assessment", () => assess(checks));
    const explanation = await step.run("gemini-explanation", () => explainWithGemini(assessment, checks.flatMap(c => c.evidence)));
    await step.run("save-final-result", () => completeScan(scanId, assessment, explanation, checks));
    return { scanId, verdict: assessment.verdict, threatRisk: assessment.threatRisk };
  }
);
