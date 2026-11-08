"use client";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
export default function WorkspaceError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="tlx-page tlx-error-page"><span className="tlx-overline">/ WORKSPACE / REQUEST INTERRUPTED</span><h1>THE SIGNAL<br/><em>WAS LOST.</em></h1><p>We couldn&apos;t retrieve this view. Your previous scan records have not been altered by this display error.</p><div className="tlx-error-actions"><button className="tlx-action tlx-action-lime" onClick={()=>reset()}><RefreshCw size={18}/> RETRY REQUEST</button><Link href="/dashboard" className="tlx-outline-link"><ArrowLeft size={17}/> BACK TO OVERVIEW</Link></div></div>;
}
