import { desc,eq } from "drizzle-orm";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { db } from "@/db";
import { messageCases } from "@/lib/schema";
import { requireUser } from "@/lib/session";
import { IntakeSwitcher } from "@/components/product/intake-switcher";
export const metadata:Metadata={title:"Message investigations",robots:{index:false}};
export const dynamic="force-dynamic";
export default async function MessagesPage(){
  const user=await requireUser();
  const cases=await db.select({id:messageCases.id,sourceType:messageCases.sourceType,status:messageCases.status,verdict:messageCases.verdict,createdAt:messageCases.createdAt}).from(messageCases).where(eq(messageCases.userId,user.id)).orderBy(desc(messageCases.createdAt)).limit(30);
  return <div className="tlx-page tlx-v2-page"><div className="tlx-page-meta"><span>WORKSPACE / MESSAGE INTELLIGENCE</span><span>AI + VERIFIED URL EVIDENCE</span></div><header className="tlx-page-title"><span className="tlx-overline">/ COMMUNICATION ANALYSIS</span><h1>DECODE<br/><em>THE SCAM.</em></h1><p>Spot impersonation, pressure tactics and credential requests. Investigate websites referenced in suspicious communications.</p></header><IntakeSwitcher initialMode="message"/><section className="tlx-v2-panel"><div className="tlx-v2-panel-head"><span>MESSAGE INVESTIGATION LIBRARY</span><span>{cases.length} RECENT</span></div>{cases.length?cases.map(x=><Link className="tlx-v2-history-row" key={x.id} href={`/messages/${x.id}`}><span>{x.sourceType.toUpperCase()}</span><strong>{x.verdict?.replaceAll("-"," ")||x.status}</strong><time>{x.createdAt.toLocaleDateString("en-GB")}</time><ArrowUpRight size={17}/></Link>):<div className="tlx-v2-empty">No message cases yet. Start with a suspicious text or email above.</div>}</section></div>;
}
