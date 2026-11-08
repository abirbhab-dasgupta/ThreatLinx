import assert from "node:assert/strict";
import { config } from "dotenv";
import { Pool } from "pg";
import { hashReport } from "../lib/blockchain/commitment.ts";
config({path:".env.local",quiet:true});
const base=process.env.THREATLINX_TEST_ORIGIN||"http://localhost:3000";
const password=process.env.THREATLINX_TEST_PASSWORD;
assert.ok(password);
const existingId="0804df71-0ccd-4dac-b3e2-c66c51914d1f";
const pool=new Pool({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:10000});
async function request(path,{body,cookie=""}={}){
  const r=await fetch(base+path,{method:body===undefined?"GET":"POST",redirect:"manual",headers:{Origin:base,"Content-Type":"application/json",Cookie:cookie},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(30000)});
  const text=await r.text();let data;try{data=JSON.parse(text)}catch{data=null}return {r,data,text};
}
async function login(email){const {r}=await request("/api/auth/sign-in/email",{body:{email,password}});assert.equal(r.status,200);return r.headers.getSetCookie().map(s=>s.split(";")[0]).join("; ");}
const user=await login("john@gmail.com"),moderator=await login("abdasgupta@gmail.com");
console.log("PASS investigator and moderator authentication");
try {
  for(const path of ["/moderation","/proof-registry","/intelligence","/campaigns"])assert.equal((await request(path,{cookie:moderator})).r.status,200,path);
  const deniedPage=await request("/moderation",{cookie:user});
  assert.ok(!deniedPage.text.includes("REGISTER REVIEWED EVIDENCE"),"non-moderator cannot render the review board");
  for(const suffix of ["evidence","publication"]){
    assert.equal((await request(`/api/reports/${existingId}/${suffix}`)).r.status,401);
    assert.equal((await request(`/api/reports/${existingId}/${suffix}`,{cookie:user})).r.status,403);
    assert.equal((await request(`/api/reports/${existingId}/${suffix}`,{cookie:moderator})).r.status,200);
  }
  const evidence=await request(`/api/reports/${existingId}/evidence`,{cookie:moderator});
  assert.ok(evidence.data.scan.evidence.length);assert.ok(!("userId" in evidence.data.scan));
  console.log("PASS moderator evidence access without investigator ownership bypass");
  const before=await pool.query("select reviewed_at from reports where id=$1",[existingId]);
  const repeatedReview=await request(`/api/reports/${existingId}/review`,{cookie:moderator,body:{status:"verified"}});
  assert.equal(repeatedReview.r.status,200);
  const after=await pool.query("select reviewed_at from reports where id=$1",[existingId]);
  assert.equal(after.rows[0].reviewed_at.toISOString(),before.rows[0].reviewed_at.toISOString());
  assert.equal((await request(`/api/reports/${existingId}/review`,{cookie:moderator,body:{status:"rejected"}})).r.status,409);
  console.log("PASS idempotent review and conflicting-decision protection");
  const beforeProof=await request(`/api/reports/${existingId}/verify`);
  assert.equal(beforeProof.data.verified,true);
  const repeat=await request(`/api/reports/${existingId}/publish`,{cookie:moderator,body:{}});
  assert.equal(repeat.r.status,200);assert.equal(repeat.data.status,"confirmed");assert.equal(repeat.data.txHash,beforeProof.data.txHash);
  console.log("PASS already-confirmed publication returns actual transaction without a new write");
  assert.notEqual(hashReport({...beforeProof.data.snapshot,category:"changed-local-copy"},beforeProof.data.salt),beforeProof.data.digest);
  console.log("PASS real published snapshot matches chain; altered local copy fails its digest");
  const campaign=await request("/api/campaigns",{cookie:user});
  const group=campaign.data.clusters.find(x=>x.domain==="example.com");assert.ok(group?.members.some(m=>m.kind==="message"));assert.ok(group?.members.some(m=>m.kind==="verified-report"));
  const adminCampaign=await request("/api/campaigns",{cookie:moderator});
  assert.ok(adminCampaign.data.clusters.every(g=>g.members.every(m=>m.kind!=="message")),"investigator message IDs must not leak to moderator campaigns");
  console.log("PASS mixed-source Campaign DNA and private-message isolation");
  const created=[];
  for(const suffix of ["approve","reject"]){
    const result=await request("/api/reports",{cookie:user,body:{url:`https://example.com/qa-report-${suffix}-${Date.now()}`,category:"other",description:"QA TEST ONLY: neutral documentation-domain workflow test. This makes no phishing, malware or impersonation allegation."}});
    assert.equal(result.r.status,201,JSON.stringify(result.data));created.push(result.data.id);
    console.log(`CREATED ${suffix} ${result.data.id}`);
  }
  const [approveId,rejectId]=created;
  assert.equal((await request(`/api/reports/${approveId}/publish`,{cookie:moderator,body:{}})).r.status,422);
  const immediate=await request(`/api/reports/${approveId}/review`,{cookie:moderator,body:{status:"verified"}});
  assert.equal(immediate.r.status,422,"independent scan is required before approval");
  assert.equal((await request(`/api/reports/${rejectId}/review`,{cookie:moderator,body:{status:"rejected"}})).r.status,200);
  assert.equal((await request(`/api/reports/${rejectId}/publish`,{cookie:moderator,body:{}})).r.status,422);
  console.log("PASS pending publication blocked, evidence gate enforced, rejection blocks publication");
  let completed=false;
  for(let n=0;n<40;n++){
    const data=await request(`/api/reports/${approveId}/evidence`,{cookie:moderator});
    if(data.data.scan?.providers.some(p=>p.provider!=="url"&&p.status==="completed")){
      assert.equal((await request(`/api/reports/${approveId}/review`,{cookie:moderator,body:{status:"verified"}})).r.status,200);
      completed=true;break;
    }
    await new Promise(r=>setTimeout(r,3000));
  }
  assert.ok(completed,"QA investigation completes and becomes reviewable");
  const feed=await request("/api/reports",{cookie:user});
  assert.ok(feed.data.verified.some(r=>r.id===approveId));assert.ok(!feed.data.verified.some(r=>r.id===rejectId));
  assert.ok(feed.data.mine.some(r=>r.id===rejectId&&r.status==="rejected"));
  assert.equal((await request(`/api/reports/${approveId}/verify`)).r.status,404);
  console.log("PASS approved/rejected community visibility and unpublished-proof privacy");
  console.log(`READY_FOR_PUBLICATION ${approveId}`);
}finally{
  await pool.end();await request("/api/auth/sign-out",{cookie:user,body:{}});await request("/api/auth/sign-out",{cookie:moderator,body:{}});
}
