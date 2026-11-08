import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { messageCases, messageLinks, scans } from "@/lib/schema";
import { assessMessage } from "@/lib/messages/analysis";
import { explainMessage } from "@/lib/messages/gemini";
import { inngest } from "./client";

                                                                                    
export const investigateMessage = inngest.createFunction(
  { id:"threatlinx-investigate-message", concurrency:{limit:4}, retries:2, triggers:{event:"threatlinx/message.created"} },
  async ({event,step}) => {
    const id=event.data.messageId as string;
    const [item]=await step.run("load-message",()=>db.select().from(messageCases).where(eq(messageCases.id,id)).limit(1));
    if(!item)return {error:"Message not found"};
    await step.run("mark-message-running",()=>db.update(messageCases).set({status:"running",phase:"Detecting social-engineering indicators",updatedAt:new Date()}).where(eq(messageCases.id,id)));
    const explanation=await step.run("explain-message",()=>explainMessage(item.redactedText,item.signals));
    const linkedIds=await step.run("linked-scan-ids",async()=>{
      const rows=await db.select({scanId:messageLinks.scanId}).from(messageLinks).where(eq(messageLinks.messageId,id));
      return rows.flatMap(x=>x.scanId?[x.scanId]:[]);
    });
                                                                                              
    let linked: Array<{id:string;status:string;verdict:string|null}>=[];
    for(let n=0;n<(linkedIds.length?6:1);n++) {
      linked=await step.run(`linked-verdicts-${n}`,async(): Promise<Array<{id:string;status:string;verdict:string|null}>> => {
        if (!linkedIds.length) return [];
        return db.select({id:scans.id,status:scans.status,verdict:scans.verdict}).from(scans).where(inArray(scans.id,linkedIds));
      });
      if(linked.length===0 || linked.every(s=>["completed","partial","failed"].includes(s.status)))break;
      if(n<5)await step.sleep(`link-analysis-delay-${n}`,"10s");
    }
    const assessment=assessMessage(item.signals,linked.map(x=>x.verdict));
    await step.run("finalize-message",()=>db.update(messageCases).set({status:"completed",phase:"Investigation complete",verdict:assessment.verdict,riskScore:assessment.riskScore,confidence:assessment.confidence,explanation:explanation.summary,recommendations:explanation.recommendations,aiObservations:explanation.observations,updatedAt:new Date(),completedAt:new Date()}).where(eq(messageCases.id,id)));
    return {id,verdict:assessment.verdict,linked:linked.length};
  }
);
