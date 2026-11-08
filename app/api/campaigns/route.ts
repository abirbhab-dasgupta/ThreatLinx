import { NextRequest,NextResponse } from "next/server";
import { eq, inArray, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { messageCases,messageLinks,reports } from "@/lib/schema";
import { correlateCampaigns, type CampaignIndicator } from "@/lib/intelligence/campaigns";
import { getDomain } from "tldts";
export const runtime="nodejs";
export async function GET(req:NextRequest) {
  const session=await auth.api.getSession({headers:req.headers});
  if(!session)return NextResponse.json({error:"Authentication required"},{status:401});
  try {
    const cases=await db.select({id:messageCases.id}).from(messageCases).where(eq(messageCases.userId,session.user.id)).orderBy(desc(messageCases.createdAt)).limit(100);
    const ids=cases.map(x=>x.id);
    const links=ids.length?await db.select({messageId:messageLinks.messageId,domain:messageLinks.domain}).from(messageLinks).where(inArray(messageLinks.messageId,ids)):[];
                                                                             
    const verified=await db.select({id:reports.id,url:reports.url}).from(reports).where(eq(reports.status,"verified")).orderBy(desc(reports.submittedAt)).limit(100);
    const candidates:CampaignIndicator[]=[...links.map(x=>({id:x.messageId,domain:x.domain,kind:"message" as const,label:"Your message case"})),...verified.flatMap(x=>{try{return [{id:x.id,domain:getDomain(new URL(x.url).hostname)??"",kind:"verified-report" as const,label:"Reviewed community report"}];}catch{return [];}})];
    return NextResponse.json({clusters:correlateCampaigns(candidates),methodology:"Exact registrable-domain reuse; grouping is not attribution to a shared perpetrator."},{headers:{"Cache-Control":"private, no-store"}});
  } catch {return NextResponse.json({error:"Correlation unavailable"},{status:503});}
}
