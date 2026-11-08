import assert from "node:assert/strict";
import test from "node:test";
import { normalizeTarget, deepScanAllowed } from "../lib/security/target";
import { analyzeUrl } from "../lib/scanner/url-heuristics";
import { assess } from "../lib/scanner/assessment";
import type { CheckResult } from "../types/scan";

test("normalized targets remove query fragments that may contain secrets", () => {
  const target = normalizeTarget("https://example.com/path?secret=123#password");
  assert.equal(target.url, "https://example.com/path");
});
test("unsafe network targets are rejected before any outbound request", () => {
  for (const url of ["http://127.0.0.1", "http://localhost", "http://169.254.169.254", "file:///etc/passwd", "http://example.com:8080"]) {
    assert.throws(() => normalizeTarget(url), url);
  }
});
test("token-bearing paths cannot be sent to external browser analysis", () => {
  assert.equal(deepScanAllowed("https://example.com/reset-password"), false);
  assert.equal(deepScanAllowed("https://example.com/marketing"), true);
});
test("brand-shaped registrable domains produce review indicators", () => {
  const result = analyzeUrl("https://paypa1-verification.com/login");
  assert.equal(result.status, "completed");
  assert.ok(result.evidence.some(item => item.code === "url-lookalike"));
});
test("a missing reputation match never becomes a guarantee of safety", () => {
  const checks: CheckResult[] = [{ provider: "reputation", status: "completed", evidence: [{ code: "reputation-no-match", category: "reputation", level: "info", title: "No match", detail: "Not proof of safety", source: "Test", scoreImpact: 0, observedAt: new Date().toISOString() }] }];
  assert.equal(assess(checks).verdict, "inconclusive");
  assert.ok(assess(checks).confidence !== "high");
});

test("a low-risk classification requires independent completed checks", () => {
  const checks: CheckResult[] = [
    {provider:"reputation",status:"completed",evidence:[]},
    {provider:"tls",status:"completed",evidence:[]},
  ];
  assert.equal(assess(checks).verdict, "low-risk");
});

test("bare public domains default to an HTTPS investigation", () => {
  assert.equal(normalizeTarget("example.com").url, "https://example.com/");
  assert.equal(normalizeTarget("example.com/login").url, "https://example.com/login");
});
