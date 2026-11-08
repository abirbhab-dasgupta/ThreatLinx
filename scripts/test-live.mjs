// Uses an existing QA account. Creates clearly labelled private test cases and
// one pending QA report; never moderates reports or publishes transactions.
import assert from "node:assert/strict";
const base = process.env.THREATLINX_TEST_ORIGIN || "http://localhost:3000";
const email = process.env.THREATLINX_TEST_EMAIL;
const password = process.env.THREATLINX_TEST_PASSWORD;
if (!email || !password) throw new Error("Set THREATLINX_TEST_EMAIL and THREATLINX_TEST_PASSWORD");
let cookie = "";
async function request(path, { method = "GET", body, signedIn = true, origin = base } = {}) {
  const response = await fetch(`${base}${path}`, {
    method, redirect: "manual", signal: AbortSignal.timeout(30000),
    headers: { ...(signedIn && cookie ? { Cookie: cookie } : {}), Origin: origin,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  let data; try { data = JSON.parse(text); } catch { data = null; }
  return { response, data, text };
}
function check(name, actual, expected) { assert.equal(actual, expected, name); console.log(`PASS ${name}`); }
for (const path of ["/api/scans", "/api/messages", "/api/reports", "/api/campaigns"]) {
  check(`signed-out ${path}`, (await request(path, { signedIn: false })).response.status, 401);
}
const login = await request("/api/auth/sign-in/email", { method: "POST", body: { email, password } });
check("sign in", login.response.status, 200);
cookie = login.response.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");
assert.ok(cookie, "session cookie received");
for (const path of ["/dashboard", "/investigations", "/messages", "/campaigns", "/intelligence", "/proof-registry", "/incidents", "/settings"]) {
  const result = await request(path); check(`render ${path}`, result.response.status, 200);
  assert.ok(!result.text.includes('"digest":"') && !result.text.includes("THE SIGNAL<br"), `no error boundary on ${path}`);
}
for (const path of ["/api/scans", "/api/messages", "/api/reports", "/api/campaigns"]) {
  check(`signed-in ${path}`, (await request(path)).response.status, 200);
}
for (const url of ["http://127.0.0.1", "http://localhost", "file:///etc/passwd", "https://example.com/reset/token"]) {
  check(`reject unsafe URL ${url}`, (await request("/api/scans", { method: "POST", body: { url } })).response.status, 400);
}
check("reject cross-origin submission", (await request("/api/scans", { method: "POST", origin: "https://untrusted.invalid", body: { url: "https://example.com" } })).response.status, 403);
check("reject short message", (await request("/api/messages", { method: "POST", body: { sourceType: "sms", text: "short" } })).response.status, 400);
const unknown = "00000000-0000-4000-8000-000000000001";
check("moderation access boundary", (await request(`/api/reports/${unknown}/review`, { method: "POST", body: { status: "verified" } })).response.status, 403);
check("publishing access boundary", (await request(`/api/reports/${unknown}/publish`, { method: "POST", body: {} })).response.status, 403);
check("unpublished proof", (await request(`/api/reports/${unknown}/verify`, { signedIn: false })).response.status, 404);
const scan = await request("/api/scans", { method: "POST", body: { url: "https://example.com/", deepScan: true } });
check("queue deep website investigation", scan.response.status, 202);
console.log(`SCAN ${scan.data.id}`);
const messages = [];
for (const sourceType of ["email", "social"]) {
  const message = await request("/api/messages", { method: "POST", body: { sourceType,
    text: "QA synthetic test: URGENT your bank account will be suspended. Share your OTP 765432 at https://example.com/help. Fictional test only." } });
  check(`queue ${sourceType} message`, message.response.status, 202);
  messages.push(message.data.id); console.log(`MESSAGE ${message.data.id}`);
}
const report = await request("/api/reports", { method: "POST", body: { url: "https://example.com/", category: "other",
  description: "QA TEST ONLY: example.com is a documentation example domain. This submission tests the pending-review workflow and makes no threat allegation. Do not verify or publish." } });
check("submit pending QA report", report.response.status, 201);
console.log(`REPORT ${report.data.id}`);
for (let attempt = 0; attempt < 36; attempt++) {
  const s = await request(`/api/scans/${scan.data.id}`);
  const cases = await Promise.all(messages.map(id => request(`/api/messages/${id}`)));
  if (attempt === 0) console.log("POLLING workflows");
  const item = s.data.scan ?? s.data;
  if (["completed", "partial", "failed"].includes(item.status) && cases.every(c => ["completed", "failed"].includes(c.data.case.status))) {
    assert.notEqual(item.status, "failed");
    console.log(`SCAN RESULT ${JSON.stringify({status:item.status,verdict:item.verdict,providers:item.providers.map(p=>({provider:p.provider,status:p.status,error:p.error}))})}`);
    for (const c of cases) {
      check("message completes", c.data.case.status, "completed");
      assert.ok(!c.data.case.redactedText.includes("765432"), "OTP redacted before storage");
      console.log(`MESSAGE RESULT ${c.data.case.verdict}; linked=${c.data.links.length}`);
    }
    break;
  }
  if (attempt === 35) throw new Error("Workflows did not complete within 3 minutes");
  await new Promise(resolve => setTimeout(resolve, 5000));
}
const campaigns = await request("/api/campaigns");
assert.ok(campaigns.data.clusters.some(cluster => cluster.domain === "example.com" && cluster.members.length >= 2), "exact-domain campaign correlation");
console.log("PASS exact-domain campaign correlation");
check("sign out", (await request("/api/auth/sign-out", { method: "POST", body: {} })).response.status, 200);
check("session invalid after sign out", (await request("/api/scans")).response.status, 401);
