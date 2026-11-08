import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
const base = process.env.THREATLINX_TEST_ORIGIN || "http://localhost:3000";
let cookie = "";
async function request(path, body) {
  const response = await fetch(base + path, { method: body ? "POST" : "GET", redirect: "manual",
    headers: { Origin: base, "Content-Type": "application/json", Cookie: cookie },
    ...(body ? {body:JSON.stringify(body)} : {}), signal:AbortSignal.timeout(30000) });
  return response;
}
const email = `threatlinx-qa-${Date.now()}@example.com`;
const rejected = await request("/api/auth/sign-up/email", {name:"ThreatLinx QA",email,password:"short"});
assert.ok([400,422].includes(rejected.status));
console.log("PASS short signup password rejected");
const signup = await request("/api/auth/sign-up/email", {name:"ThreatLinx QA",email,password:randomBytes(24).toString("hex")});
assert.equal(signup.status,200);
cookie = signup.headers.getSetCookie().map(value=>value.split(";")[0]).join("; ");
console.log("PASS new QA account signup (no email sent)");
for (const path of ["/api/scans/606f0f69-b5dd-4e94-889b-76a9dfc48eef", "/api/messages/4b478f8a-f551-476c-a114-fc6b4156edb2"]) {
  assert.equal((await request(path)).status,404);
  console.log(`PASS cross-account ownership ${path.split('/')[2]}`);
}
for (const path of ["/api/scans/not-a-uuid", "/api/messages/not-a-uuid", "/api/reports/not-a-uuid/verify"]) {
  assert.equal((await request(path)).status,400);console.log("PASS malformed record ID rejected");
}
assert.equal((await request("/api/auth/sign-out",{})).status,200);
const protectedPage=await request("/dashboard");
assert.equal(protectedPage.status,307);assert.ok(protectedPage.headers.get("location").includes("/sign-in"));
console.log("PASS signed-out workspace redirects to sign-in");
