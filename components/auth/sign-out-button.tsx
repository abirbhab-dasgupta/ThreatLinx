"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
export function SignOutButton() {
  const router = useRouter();
  const [working, setWorking] = useState(false);
  return <button type="button" className="btn btn-black" disabled={working} onClick={async () => {
    setWorking(true);
    try { await authClient.signOut(); router.replace("/sign-in"); router.refresh(); }
    catch { alert("Could not sign out. Please try again."); }
    finally { setWorking(false); }
  }}>{working ? "SIGNING OUT…" : "SIGN OUT ↗"}</button>;
}
