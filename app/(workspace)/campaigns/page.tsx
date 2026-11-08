import type {Metadata} from "next";
import {CampaignBoard} from "@/components/product/campaign-board";
export const metadata:Metadata={title:"Campaign DNA",robots:{index:false}};
export default function CampaignsPage(){return <div className="tlx-page tlx-v2-page"><div className="tlx-page-meta"><span>WORKSPACE / THREAT CORRELATION</span><span>REPRODUCIBLE INDICATORS</span></div><header className="tlx-page-title"><span className="tlx-overline">/ CAMPAIGN DNA</span><h1>CONNECT<br/><em>THE DOTS.</em></h1><p>Discover repeated destinations across independently submitted messages and reviewed reports. Every relationship is based on a technical indicator you can inspect.</p></header><CampaignBoard/></div>}
