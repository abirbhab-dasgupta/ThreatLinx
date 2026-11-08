import { getDomain } from "tldts";
export type CampaignIndicator = { id: string; domain: string; kind: "message" | "verified-report"; label: string };
export type CampaignCluster = { domain: string; basis: string; confidence: "technical-match"; members: CampaignIndicator[] };

                                                                                        
export function correlateCampaigns(indicators: CampaignIndicator[]): CampaignCluster[] {
  const groups = new Map<string, CampaignIndicator[]>();
  for (const item of indicators) {
    const domain = getDomain(item.domain, { allowPrivateDomains: false });
    if (!domain) continue;
    const current = groups.get(domain) ?? [];
    if (!current.some(i => i.id === item.id && i.kind === item.kind)) current.push({ ...item, domain });
    groups.set(domain, current);
  }
  return [...groups.entries()].filter(([,items]) => items.length >= 2)
    .map(([domain, members]) => ({domain, basis:"Exact registrable-domain reuse in linked submissions",confidence:"technical-match" as const,members}))
    .sort((a,b)=>b.members.length-a.members.length).slice(0,30);
}
