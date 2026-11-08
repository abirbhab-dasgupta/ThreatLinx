import { test } from "node:test";
import assert from "node:assert/strict";
import { hasIndependentCheck, reviewDecision } from "../lib/reports/review";
import { correlateCampaigns } from "../lib/intelligence/campaigns";
import { serializeSummary } from "../lib/product-data";

test("report approval requires a completed independent provider, not URL heuristics alone",()=>{
  assert.equal(hasIndependentCheck([{provider:"url",status:"completed"},{provider:"tls",status:"error"}]),false);
  assert.equal(hasIndependentCheck([{provider:"reputation",status:"unavailable"}]),false);
  for(const provider of ["reputation","tls","security","browser"])assert.equal(hasIndependentCheck([{provider,status:"completed"}]),true);
});
test("review retries preserve final decisions and prevent conflicting overwrites",()=>{
  assert.equal(reviewDecision("pending","verified"),"allowed");
  assert.equal(reviewDecision("pending","rejected"),"allowed");
  assert.equal(reviewDecision("verified","verified"),"unchanged");
  assert.equal(reviewDecision("rejected","rejected"),"unchanged");
  assert.equal(reviewDecision("verified","rejected"),"conflict");
  assert.equal(reviewDecision("rejected","verified"),"conflict");
});
test("campaign clusters count distinct cases rather than multiple links from one case",()=>{
  const indicator={id:"one",domain:"example.com",kind:"message" as const,label:"Your message"};
  assert.equal(correlateCampaigns([indicator,{...indicator,domain:"www.example.com"}]).length,0);
  const result=correlateCampaigns([indicator,{...indicator,id:"two",kind:"verified-report"}]);
  assert.equal(result[0].members.length,2);
  assert.deepEqual(result[0].members.map(x=>x.id),["one","two"]);
});

test("scan summaries do not spread database-only fields into reviewer evidence",()=>{
  const row={id:"qa",hostname:"example.com",url:"https://example.com/",deepScan:false,status:"completed",verdict:"low-risk",threatRisk:0,confidence:"high",securityGrade:"F",createdAt:new Date(),completedAt:new Date(),userId:"private-account-id",internalField:"private"};
  const result=serializeSummary(row);
  assert.equal(result.hostname,"example.com");
  assert.ok(!("userId" in result));
  assert.ok(!("internalField" in result));
});
