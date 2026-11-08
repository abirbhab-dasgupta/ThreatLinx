import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { SignOutButton } from "@/components/auth/sign-out-button";
export const metadata: Metadata = { title: "Account", robots: { index: false } };
export default async function SettingsPage() {
  const user = await requireUser();
  return <div className="tlx-page"><div className="tlx-page-meta"><span>WORKSPACE / ACCOUNT</span><span>IDENTITY / AUTHENTICATED</span></div><header className="tlx-page-title"><span className="tlx-overline">/ YOUR THREATLINX ACCOUNT</span><h1>IDENTITY<br/><em>CONFIRMED.</em></h1><p>Authentication and session management are handled securely with Better Auth and your Neon-backed user account.</p></header>
    <section className="tlx-account-panel"><div className="tlx-account-profile"><span className="tlx-overline">ACCOUNT / PROFILE</span><h2>{user.name}</h2><p>YOUR INVESTIGATION WORKSPACE</p></div><div className="tlx-account-details"><div><span>EMAIL ADDRESS</span><strong>{user.email}</strong></div><div><span>EMAIL VERIFICATION</span><strong>{user.emailVerified ? "VERIFIED" : "NOT VERIFIED"}</strong></div><div><span>SESSION SECURITY</span><strong>BETTER AUTH · SERVER-VALIDATED</strong></div></div><div className="tlx-account-action"><p>Signing out ends your current session on this device. Your investigation records remain associated with your account.</p><SignOutButton/></div></section>
  </div>;
}
