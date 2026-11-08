import type {Metadata} from "next";
import { MessageCaseView } from "@/components/product/message-case-view";
export const metadata:Metadata={title:"Message case",robots:{index:false}};
export default async function MessageDetail({params}:{params:Promise<{id:string}>}){const {id}=await params;return <div className="tlx-page tlx-v2-page"><div className="tlx-page-meta"><span>WORKSPACE / MESSAGE INVESTIGATION</span><span>PRIVATE EVIDENCE</span></div><header className="tlx-page-title"><span className="tlx-overline">/ MESSAGE INTELLIGENCE</span><h1>FOLLOW<br/><em>THE CLAIM.</em></h1><p>A source-aware analysis of language patterns and any linked website investigations.</p></header><MessageCaseView id={id}/></div>}
