import type { Assessment, CheckResult, Evidence } from "@/types/scan";

                                                                 
export function assess(checks: CheckResult[]): Assessment {
  const all = checks.flatMap(c=>c.evidence);
  const active = checks.filter(c=>c.status==="completed");
  const confirmed = all.some(e=>e.code==="reputation-known-threat");
  const score = Math.min(100, all.reduce((n,e)=>n+Math.max(0,e.scoreImpact),0));
  const risk = active.length ? score : null;
  let verdict:Assessment["verdict"]="inconclusive";
  if(confirmed)verdict="confirmed-malicious";
  else if(risk!==null && risk>=55)verdict="high-risk";
  else if(risk!==null && risk>=25)verdict="suspicious";
  const independent=active.filter(c=>["reputation","browser","tls","security"].includes(c.provider));
  if (verdict==="inconclusive" && risk!==null && independent.length>=2 &&
      independent.some(c=>c.provider==="reputation")) verdict="low-risk";
  let confidence:Assessment["confidence"]="insufficient";
  if(confirmed || independent.length>=3)confidence="high";
  else if(independent.length>=2)confidence="medium";
  else if(active.length)confidence="low";
  const grade=checks.find(c=>c.provider==="security")?.metadata?.grade;
  return {threatRisk:risk,verdict,confidence,securityGrade:typeof grade==="string"?grade:null};
}

export function fallbackExplanation(verdict:Assessment["verdict"],findings:Evidence[]) {
  const significant=findings.filter(e=>e.scoreImpact>0);
  const summary=verdict==="confirmed-malicious" || verdict==="known-threat" ?
    "A threat-intelligence provider identified a known unsafe URL. Do not provide credentials or financial information." :
    verdict==="high-risk" ? "Several significant risk indicators were found. Avoid interacting with the site until its identity is independently confirmed." :
    verdict==="suspicious" ? `Potential deception indicators were identified: ${significant.map(e=>e.title).slice(0,3).join("; ")}. These signals do not prove fraud.` :
    verdict==="low-risk" || verdict==="no-known-threat" ? "No significant malicious indicators were detected in completed checks. This does not guarantee that the website is safe." :
    "Evidence is insufficient for a reliable conclusion, or important providers were unavailable.";
  return {summary,actions:["Verify the domain with the organisation through a trusted channel.","Never share passwords or one-time codes through unverified links."],citedEvidenceCodes:significant.slice(0,3).map(x=>x.code)};
}
