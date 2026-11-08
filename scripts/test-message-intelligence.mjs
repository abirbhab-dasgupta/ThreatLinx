import assert from "node:assert/strict";
const base = process.env.THREATLINX_TEST_ORIGIN || "http://localhost:3000";
const email = process.env.THREATLINX_TEST_EMAIL;
const password = process.env.THREATLINX_TEST_PASSWORD;
assert.ok(email && password, "Set QA email and password environment variables");
let cookie = "";
async function request(path, body, signedIn = true) {
  const r = await fetch(base + path, { method: body === undefined ? "GET" : "POST", redirect:"manual",
    headers:{Origin:base,"Content-Type":"application/json",...(signedIn && cookie ? {Cookie:cookie} : {})},
    ...(body === undefined ? {} : {body:JSON.stringify(body)}),signal:AbortSignal.timeout(30000)});
  const text = await r.text(); let data; try {data=JSON.parse(text)} catch {data=null}
  return {r,data};
}
assert.equal((await request("/",undefined,false)).r.status,200);
console.log("PASS signed-out root shows landing page");
const login=await request("/api/auth/sign-in/email",{email,password});
assert.equal(login.r.status,200);
cookie=login.r.headers.getSetCookie().map(s=>s.split(";")[0]).join("; ");
for(const path of ["/","/sign-in","/sign-up"]){
  const result=await request(path);assert.equal(result.r.status,307,path);
  assert.equal(new URL(result.r.headers.get("location"),base).pathname,"/dashboard",path);
  console.log(`PASS signed-in ${path} redirects to dashboard`);
}
for(const body of [{sourceType:"sms",text:"short"},{sourceType:"invalid",text:"A fictional message that exceeds twenty-five characters."},{sourceType:"email",text:"x".repeat(6001)}]){
  assert.equal((await request("/api/messages",body)).r.status,400);
}
console.log("PASS short/oversized/invalid-source messages rejected");
assert.equal((await request("/api/messages",{sourceType:"sms",text:"A fictional message that exceeds twenty-five characters."},false)).r.status,401);
console.log("PASS message creation requires authentication");
const fixtures=[
  {sourceType:"sms",text:"QA fictional test: URGENT your bank account will be suspended. Share your OTP 543210 at https://example.com/help. Fictional test only.",links:1,verdict:"high-risk"},
  {sourceType:"email",text:"QA fictional newsletter: Our public documentation is available at https://example.com/help. Read it whenever convenient.",links:1,verdict:"low-risk"},
  {sourceType:"social",text:"QA fictional test: The team meeting starts tomorrow afternoon. Bring your notes and we will discuss the project together.",links:0,verdict:"inconclusive"},
  {sourceType:"other",text:"QA fictional test: URGENT your bank account will be suspended. Share your OTP 543210 immediately at http://127.0.0.1/private. Fictional test only.",links:0,verdict:"high-risk"},
];
for(const fixture of fixtures){
  const result=await request("/api/messages",{sourceType:fixture.sourceType,text:fixture.text});
  assert.equal(result.r.status,202,JSON.stringify(result.data));
  assert.equal(result.data.linkedInvestigations,fixture.links);
  if(fixture.sourceType==="other")assert.equal(result.data.rejectedLinks,1);
  fixture.id=result.data.id;console.log(`QUEUED ${fixture.sourceType} ${fixture.id}`);
}
const pending=new Set(fixtures.map(f=>f.id));
for(let attempt=0;attempt<40 && pending.size;attempt++){
  for(const fixture of fixtures.filter(f=>pending.has(f.id))){
    const {r,data}=await request(`/api/messages/${fixture.id}`);assert.equal(r.status,200);
    assert.ok(!data.case.redactedText.includes("543210"),"OTP redacted before storage");
    if(data.case.status==="failed")throw Error(`${fixture.sourceType} failed: ${data.case.phase}`);
    if(data.case.status!=="completed" || data.links.some(l=>["queued","running"].includes(l.scanStatus)))continue;
    assert.equal(data.case.sourceType,fixture.sourceType);assert.equal(data.links.length,fixture.links);
    assert.equal(data.case.verdict,fixture.verdict,fixture.sourceType);
    assert.ok(data.case.explanation && data.case.recommendations.length);
    assert.ok(!data.case.explanation.startsWith("AI explanation unavailable."),"real Gemini generation");
    console.log(`PASS ${fixture.sourceType}: ${data.case.verdict}, linked=${data.links.length}, AI explanation present`);
    pending.delete(fixture.id);
  }
  if(pending.size)await new Promise(r=>setTimeout(r,3000));
}
assert.equal(pending.size,0,"All message workflows finish");
const library=await request("/api/messages");assert.equal(library.r.status,200);
for(const fixture of fixtures)assert.ok(library.data.cases.some(c=>c.id===fixture.id));
console.log("PASS all four source types appear in message history");
assert.equal((await request("/api/auth/sign-out",{})).r.status,200);
assert.equal((await request("/",undefined,false)).r.status,200);
console.log("PASS sign-out restores public landing access");
