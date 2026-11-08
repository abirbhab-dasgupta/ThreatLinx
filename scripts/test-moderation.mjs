// Test the neutral QA report with an existing verified, allowlisted moderator.
// Requires explicit owner approval before executing the publication flow.
import { config } from "dotenv";
import { Pool } from "pg";
import assert from "node:assert/strict";
config({path:".env.local",quiet:true});
const email=process.env.THREATLINX_MODERATOR_EMAIL;
const password=process.env.THREATLINX_TEST_PASSWORD;
const reportId=process.env.THREATLINX_QA_REPORT_ID;
const base=process.env.THREATLINX_TEST_ORIGIN||"http://localhost:3000";
assert.ok(email&&password&&reportId,"QA account and report parameters required");
assert.ok((process.env.ADMIN_EMAILS||"").split(",").map(x=>x.trim().toLowerCase()).includes(email.toLowerCase()),"requested moderator must already be allowlisted");
let cookie="";
async function request(path,body) {
  const response=await fetch(base+path,{method:body?"POST":"GET",headers:{Origin:base,"Content-Type":"application/json",Cookie:cookie},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(30000)});
  const text=await response.text();let data;try{data=JSON.parse(text)}catch{data=null}return {response,data};
}
const pool=new Pool({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:10000});
try {
  const existing=await pool.query('select id, "emailVerified" from "user" where lower(email)=$1',[email.toLowerCase()]);
  assert.equal(existing.rows[0]?.emailVerified,true,"An existing verified moderator is required; this test never grants privileges");
  const report=await pool.query('select description, category, url from reports where id=$1',[reportId]);
  assert.ok(report.rows[0]?.description.startsWith("QA TEST ONLY:"),"Only the labelled QA report may be tested");
  assert.equal(report.rows[0].category,"other");
  assert.equal(new URL(report.rows[0].url).hostname,"example.com");
} finally {await pool.end();}
const login=await request("/api/auth/sign-in/email",{email,password});
assert.equal(login.response.status,200);cookie=login.response.headers.getSetCookie().map(x=>x.split(";")[0]).join("; ");
console.log("PASS moderator sign-in");
const page=await request("/moderation");assert.equal(page.response.status,200);console.log("PASS moderator workspace");
// Guard against publishing any existing allegation by accident.
const reports=await request("/api/reports");
assert.equal(reports.response.status,200);
const review=await request(`/api/reports/${reportId}/review`,{status:"verified"});
assert.equal(review.response.status,200,JSON.stringify(review.data));console.log("PASS independent-evidence moderation gate and approval");
const publish=await request(`/api/reports/${reportId}/publish`,{});
assert.ok([200,202].includes(publish.response.status),JSON.stringify(publish.data));console.log("PASS queue testnet integrity publication");
for(let n=0;n<36;n++){
  const proof=await request(`/api/reports/${reportId}/verify`);
  if(proof.response.status===200){
    assert.equal(proof.data.verified,true,JSON.stringify({networkError:proof.data.networkError,localMatch:proof.data.localMatch,networkMatch:proof.data.networkMatch}));
    console.log(JSON.stringify({result:"PASS public on-chain verification",reportId,transaction:proof.data.txHash,contract:proof.data.contractAddress}));break;
  }
  if(n===35)throw Error("No confirmed proof within 3 minutes; inspect publisher workflow");
  await new Promise(resolve=>setTimeout(resolve,5000));
}
assert.equal((await request("/api/auth/sign-out",{})).response.status,200);console.log("PASS moderator sign-out");
