import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { messageCases, messageLinks, scans } from "@/lib/schema";
import { extractMessageEvidence } from "@/lib/messages/analysis";
import { rateLimitUser } from "@/lib/security/rate-limit";
import { inngest } from "@/inngest/client";

export const runtime = "nodejs";
const payload = z.object({ sourceType: z.enum(["sms", "email", "social", "other"]), text: z.string().trim().min(25).max(6000) });

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({error:"Sign in to investigate messages"},{status:401});
  if (req.headers.get("origin") !== req.nextUrl.origin) return NextResponse.json({error:"Invalid request origin"},{status:403});
  const body = payload.safeParse(await req.json().catch(()=>null));
  if (!body.success) return NextResponse.json({error:"Choose a message type and submit 25–6000 characters"},{status:400});
  try {
    if (!(await rateLimitUser(session.user.id,"scan"))) return NextResponse.json({error:"Investigation limit reached"},{status:429});
    const parsed = extractMessageEvidence(body.data.text);
    const [caseRow] = await db.insert(messageCases).values({userId:session.user.id,sourceType:body.data.sourceType,redactedText:parsed.redactedText,signals:parsed.signals}).returning({id:messageCases.id});
    const events: Array<{name:string;id:string;data:{scanId?:string;messageId?:string}}> = [];
    for (const link of parsed.links) {
      const [scan] = await db.insert(scans).values({userId:session.user.id,url:link.url,hostname:new URL(link.url).hostname,deepScan:false}).returning({id:scans.id});
      await db.insert(messageLinks).values({messageId:caseRow.id,scanId:scan.id,url:link.url,domain:link.domain});
      events.push({name:"threatlinx/scan.created",id:`message-link-${scan.id}`,data:{scanId:scan.id}});
    }
    events.push({name:"threatlinx/message.created",id:`message-${caseRow.id}`,data:{messageId:caseRow.id}});
    try { await inngest.send(events); }
    catch {
      await db.update(messageCases).set({status:"failed",phase:"Could not dispatch investigation"}).where(eq(messageCases.id,caseRow.id));
      const scanIds = events.flatMap(event => event.data.scanId ? [event.data.scanId] : []);
      for (const scanId of scanIds) await db.update(scans).set({status:"failed",phase:"Could not dispatch investigation",updatedAt:new Date()}).where(eq(scans.id,scanId));
      return NextResponse.json({error:"Message saved, but investigation queue is unavailable. Retry later.",id:caseRow.id},{status:503});
    }
    return NextResponse.json({id:caseRow.id,status:"queued",linkedInvestigations:parsed.links.length,rejectedLinks:parsed.rejectedLinks},{status:202,headers:{"Cache-Control":"no-store"}});
  } catch { return NextResponse.json({error:"Unable to create message investigation"},{status:503}); }
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({headers:req.headers});
  if (!session) return NextResponse.json({error:"Authentication required"},{status:401});
  try {
    const rows = await db.select({id:messageCases.id,sourceType:messageCases.sourceType,status:messageCases.status,verdict:messageCases.verdict,riskScore:messageCases.riskScore,createdAt:messageCases.createdAt}).from(messageCases).where(eq(messageCases.userId,session.user.id)).orderBy(desc(messageCases.createdAt)).limit(50);
    return NextResponse.json({cases:rows.map(x=>({...x,createdAt:x.createdAt.toISOString()}))},{headers:{"Cache-Control":"private, no-store"}});
  } catch { return NextResponse.json({error:"Unable to load messages"},{status:503}); }
}
