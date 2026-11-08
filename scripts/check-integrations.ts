import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

// Read-only provider diagnostics. Never log keys, full request URLs or raw replies.
const { checkSafeBrowsing } = await import("../lib/providers/safe-browsing");
const { inspectTls } = await import("../lib/providers/tls");
const { scanObservatory } = await import("../lib/providers/observatory");
const { readRegisteredDigest } = await import("../lib/blockchain/registry");
const { explainMessage } = await import("../lib/messages/gemini");
const { extractMessageEvidence } = await import("../lib/messages/analysis");
const { explainWithGemini } = await import("../lib/providers/gemini");
const { analyzeUrl } = await import("../lib/scanner/url-heuristics");
const checks = [
  ["Safe Browsing", () => checkSafeBrowsing("https://example.com/")],
  ["Safe Browsing official test", () => checkSafeBrowsing("http://testsafebrowsing.appspot.com/s/phishing.html")],
  ["Valid TLS", () => inspectTls("https://example.com/")],
  ["Expired TLS", () => inspectTls("https://expired.badssl.com/")],
  ["Wrong-host TLS", () => inspectTls("https://wrong.host.badssl.com/")],
  ["Observatory", () => scanObservatory("example.com")],
  ["Registry read", async () => ({ digest: await readRegisteredDigest("00000000-0000-0000-0000-000000000000", 1) })],
  ["Gemini message explanation", async () => {
    const input = extractMessageEvidence("QA fictional message: URGENT your bank account will be suspended. Share your OTP 765432 immediately.");
    const result = await explainMessage(input.redactedText, input.signals);
    if (result.summary.startsWith("AI explanation unavailable.")) throw Error("Gemini still using fallback");
    return { generated: true, observations: result.observations.length };
  }],
  ["Gemini website explanation", async () => {
    const result = await explainWithGemini({ verdict:"inconclusive", threatRisk:0, confidence:"low", securityGrade:null }, analyzeUrl("https://example.com/").evidence);
    if (result.summary.startsWith("AI explanation unavailable.")) throw Error("Gemini still using fallback");
    return { generated:true, actions:result.actions.length };
  }],
] as const;
await Promise.all(checks.map(async ([name, run]) => {
  try {
    const result = await run();
    if ("provider" in result) {
      console.log(JSON.stringify({ name, provider: result.provider, status: result.status,
        codes: result.evidence.map(item => item.code), trusted: result.metadata?.trusted }));
    } else console.log(JSON.stringify({ name, result }));
  } catch (error) {
    console.log(JSON.stringify({ name, error: error instanceof Error ? error.message.split("\n")[0] : "Check failed" }));
    process.exitCode = 1;
  }
}));
