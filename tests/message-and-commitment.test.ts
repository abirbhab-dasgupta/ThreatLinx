import test from "node:test";
import assert from "node:assert/strict";
import { extractMessageEvidence,assessMessage } from "../lib/messages/analysis";
import { correlateCampaigns } from "../lib/intelligence/campaigns";
import {canonicalJson,hashReport,reportKey} from "../lib/blockchain/commitment";

test("message extraction detects social engineering and redacts secrets before storage",()=>{
  const result=extractMessageEvidence("URGENT: your bank account will be suspended. Provide OTP: 123456 now at https://bank-verify.example/login?token=secret");
  assert.equal(result.links.length,1);
  assert.ok(result.signals.some(s=>s.code==="otp-request"));
  assert.equal(result.redactedText.includes("123456"),false);
  assert.equal(result.redactedText.includes("token=secret"),false);
  assert.equal(assessMessage(result.signals,[]).verdict,"high-risk");
});
test("known malicious linked URL upgrades message verdict only with independent finding",()=>{
  assert.equal(assessMessage([], ["confirmed-malicious"]).verdict,"confirmed-malicious");
  assert.equal(assessMessage([], []).verdict,"inconclusive");
});

test("OTP values are redacted with plain whitespace, separators and reverse wording",()=>{
  for (const text of ["Share your OTP 654321 now", "OTP is 654321", "OTP: 654321", "654321 is your OTP", "Your verification code is 654321", "OTP 654 321", "CVV 654"]) {
    const result = extractMessageEvidence(text);
    assert.ok(result.redactedText.includes("[REDACTED SECRET]"), text);
    assert.ok(!/654/.test(result.redactedText), text);
  }
});
test("campaign correlation never clusters on single or vague signals",()=>{
  const clusters=correlateCampaigns([{id:"a",domain:"login.phish.example",kind:"message",label:"A"},{id:"b",domain:"pay.phish.example",kind:"verified-report",label:"B"},{id:"c",domain:"other.example.org",kind:"message",label:"C"}]);
  assert.equal(clusters.length,1);
  assert.equal(clusters[0].domain,"phish.example");
});
test("canonical commitments are stable, report edits invalidate hashes",()=>{
  const a={b:2,a:{z:"same",y:1}},b={a:{y:1,z:"same"},b:2};
  const salt=`0x${"c".repeat(64)}`;
  assert.equal(canonicalJson(a),canonicalJson(b));
  assert.equal(hashReport(a,salt),hashReport(b,salt));
  assert.notEqual(hashReport(a,salt),hashReport({b:3,a:a.a},salt));
  assert.equal(reportKey("00000000-0000-4000-8000-000000000001").length,66);
});
