"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, ArrowUpRight, Eye, EyeOff, LockKeyhole, ShieldCheck, Check, LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { GoogleIcon } from "./google-icon";

type Mode = "sign-in" | "sign-up";

export function AuthScreen({ mode, googleEnabled, providerError = false }: { mode: Mode; googleEnabled: boolean; providerError?: boolean }) {
  const signup = mode === "sign-up";
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [reveal, setReveal] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(providerError ? "The sign-in provider could not complete the request. Please try again." : "");
  const [socialBusy, setSocialBusy] = useState(false);


  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    if (password.length < 10) { setError("Use at least 10 characters for your password."); return; }
    if (signup && password !== confirm) { setError("Your passwords don't match."); return; }
    if (signup && name.trim().length < 2) { setError("Please enter your name."); return; }
    setBusy(true);
    try {
      const response = signup
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim().toLowerCase(), password })
        : await authClient.signIn.email({ email: email.trim().toLowerCase(), password, rememberMe });
      if (response.error) {
        setError(response.error.message || "Authentication failed. Please try again.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("We couldn't reach the authentication service. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function googleSignIn() {
    setSocialBusy(true);
    setError("");
    try {
      const result = await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard", errorCallbackURL: signup ? "/sign-up" : "/sign-in" });
      if (result.error) setError(result.error.message || "Google sign-in wasn't completed.");
    } catch {
      setError("Google sign-in is temporarily unavailable.");
    } finally {
      setSocialBusy(false);
    }
  }

  return <div className="auth-shell">
    <aside className="auth-visual" aria-label="ThreatLinx visual identity">
      <div className="auth-visual-grain" aria-hidden="true" />
      <div className="auth-left-top"><span className="auth-tiny-star">✳</span><span>THREATLINX / INVESTIGATION WORKSPACE</span><span>TL — 01</span></div>
      <div className="auth-visual-center">
        <div className="auth-visual-prelude mono">{"// VERIFY BEFORE YOU TRUST / THREATLINX"}</div>
        <h1>{signup ? <>FOLLOW<br /><i>THE</i><br />SIGNALS.</> : <>CHECK<br />BEFORE<br /><i>YOU</i> TRUST.</>}</h1>
        <p>{signup ? "Investigate suspicious links and scam messages, connect evidence and contribute reviewed reports with verifiable integrity." : "Your website investigations, scam-message cases and verified intelligence in one secure workspace."}</p>
        <div className="auth-artwork" aria-hidden="true">
          <div className="auth-artwork-grid" />
          <div className="auth-artwork-blob"><span>TL</span></div>
          <div className="auth-artwork-bar one" /><div className="auth-artwork-bar two" /><div className="auth-artwork-bar three" />
          <div className="auth-artwork-tag">[ ANALYZE / CORRELATE / EXPLAIN ]</div>
          <div className="auth-artwork-cross">+</div>
        </div>
      </div>
      <div className="auth-left-bottom"><span>01 / DIGITAL SCAMS</span><span>02 / SITE INTELLIGENCE</span><span>03 / VERIFIABLE PROOF</span></div>
    </aside>

    <section className="auth-panel" aria-labelledby="auth-heading">
      <div className="auth-panel-top">
        <Link href="/" className="auth-logo" aria-label="ThreatLinx homepage"><span className="brand-mark" aria-hidden="true" /><span className="brand-name">THREATLINX</span></Link>
        <Link href="/" className="auth-back" aria-label="Back to landing page">BACK TO SITE <ArrowUpRight size={15}/></Link>
      </div>

      <div className="auth-panel-body">
        <div className="auth-kicker"><span className="auth-rotated-square"/> {signup ? "02 / NEW INVESTIGATOR" : "01 / MEMBER ACCESS"}</div>
        <h2 id="auth-heading">{signup ? <>CREATE<br /><em>ACCOUNT.</em></> : <>WELCOME<br /><em>BACK.</em></>}</h2>
        <p className="auth-subtitle">{signup ? "Create your account to keep your investigations together and contribute verified intelligence." : "Sign in to your ThreatLinx account and pick up where your investigation left off."}</p>

        {googleEnabled && <>
          <button className="auth-google" type="button" onClick={googleSignIn} disabled={busy || socialBusy}>
            <GoogleIcon size={21} /> <span>{socialBusy ? "CONNECTING TO GOOGLE…" : "CONTINUE WITH GOOGLE"}</span> <ArrowUpRight size={18}/>
          </button>
          <div className="auth-or"><span>OR CONTINUE WITH EMAIL</span></div>
        </>}

        <form className="auth-form" onSubmit={submit}>
          {signup && <div className="auth-field">
            <label htmlFor="full-name">FULL NAME <span>01</span></label>
            <input id="full-name" value={name} onChange={event => setName(event.target.value)} placeholder="Your full name" autoComplete="name" minLength={2} maxLength={100} required />
          </div>}
          <div className="auth-field">
            <label htmlFor="auth-email">EMAIL ADDRESS <span>{signup ? "02" : "01"}</span></label>
            <input id="auth-email" value={email} onChange={event => setEmail(event.target.value)} type="email" placeholder="you@example.com" autoComplete="email" required />
          </div>
          <div className="auth-field">
            <label htmlFor="auth-password">PASSWORD <span>{signup ? "03" : "02"}</span></label>
            <div className="auth-password-wrap"><input id="auth-password" type={reveal ? "text" : "password"} value={password} onChange={event => setPassword(event.target.value)} autoComplete={signup ? "new-password" : "current-password"} minLength={10} maxLength={128} required placeholder={signup ? "At least 10 characters" : "Enter your password"} /><button type="button" className="auth-reveal" aria-label={reveal ? "Hide password" : "Show password"} aria-pressed={reveal} onClick={() => setReveal(value => !value)}>{reveal ? <EyeOff size={19}/> : <Eye size={19}/>}</button></div>
          </div>
          {signup && <div className="auth-field">
            <label htmlFor="auth-confirm">CONFIRM PASSWORD <span>04</span></label>
            <input id="auth-confirm" type={reveal ? "text" : "password"} value={confirm} onChange={event => setConfirm(event.target.value)} autoComplete="new-password" minLength={10} maxLength={128} required placeholder="Re-enter password" />
          </div>}
          {signup ? <div className="auth-password-advice"><Check size={14}/> MINIMUM 10 CHARACTERS. CHOOSE A UNIQUE PASSWORD.</div> : <div className="auth-options"><label className="auth-remember"><input type="checkbox" checked={rememberMe} onChange={event => setRememberMe(event.target.checked)}/> <span>REMEMBER ME</span></label></div>}
          {error && <p role="alert" className="auth-error">{error}</p>}
          <button className="auth-submit" disabled={busy || socialBusy} type="submit"><span>{busy ? "SECURING YOUR SESSION…" : signup ? "CREATE ACCOUNT" : "SIGN IN TO THREATLINX"}</span>{busy ? <LoaderCircle className="auth-spinner" size={20}/> : <ArrowRight size={21}/>}</button>
        </form>
        <div className="auth-switch">{signup ? "ALREADY INVESTIGATING?" : "NEW TO THREATLINX?"} <Link href={signup ? "/sign-in" : "/sign-up"}>{signup ? "SIGN IN ↗" : "CREATE ACCOUNT ↗"}</Link></div>
      </div>
      <div className="auth-panel-bottom"><div><LockKeyhole size={14}/> SECURE SESSION / BETTER AUTH</div><div><ShieldCheck size={14}/> YOUR ACCOUNT IS PRIVATE</div><span>© 2026 THREATLINX</span></div>
    </section>
  </div>;
}
