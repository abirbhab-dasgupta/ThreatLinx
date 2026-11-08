"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity, ArrowUpRight, BookOpenText, ChevronRight,
  FileSearch2, Globe2, LayoutDashboard, LogOut, Menu,
  Plus, ShieldCheck, UserRound, X, ClipboardCheck, MailWarning, Network, Blocks,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ProductBrand } from "./brand";

type Viewer = { name: string; email: string; isModerator: boolean };
const sections = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, index: "01" },
  { href: "/investigations", label: "Web investigations", icon: FileSearch2, index: "02" },
  { href: "/messages", label: "Message intelligence", icon: MailWarning, index: "03" },
  { href: "/campaigns", label: "Campaign DNA", icon: Network, index: "04" },
  { href: "/intelligence", label: "Community reports", icon: Globe2, index: "05" },
  { href: "/proof-registry", label: "Proof registry", icon: Blocks, index: "06" },
  { href: "/incidents", label: "Certificate research", icon: BookOpenText, index: "07" },
] as const;

export function AppShell({ children, user }: { children: React.ReactNode; user: Viewer }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerPath, setDrawerPath] = useState<string | null>(null);
  const drawerOpen = drawerPath === pathname;
  const setDrawerOpen = (open: boolean) => setDrawerPath(open ? pathname : null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawerPath(null); };
    const onResize = () => { if (window.innerWidth >= 1024) setDrawerPath(null); };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    const originalOverflow = document.body.style.overflow;
    if (window.innerWidth < 1024) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [drawerOpen]);

  async function signOut() {
    setLoggingOut(true);
    try {
      const result = await authClient.signOut();
      if (result.error) { setLoggingOut(false); return; }
      router.replace("/sign-in");
      router.refresh();
    } catch { setLoggingOut(false); }
  }

  const currentSection = pathname.startsWith("/investigations/")
    ? "Investigation detail"
    : pathname === "/dashboard" ? "Overview"
    : pathname.split("/").filter(Boolean).at(-1)?.replaceAll("-", " ") ?? "Workspace";

  return (
    <div className="tlx-app tlx-workspace">
      <a className="tlx-shell-skip" href="#workspace-main">Skip to main content</a>
      <button type="button" className={`tlx-shell-scrim ${drawerOpen ? "is-open" : ""}`} onClick={() => setDrawerOpen(false)} aria-label="Close navigation menu" tabIndex={drawerOpen ? 0 : -1} />

      <aside className={`tlx-shell-sidebar ${drawerOpen ? "is-open" : ""}`} aria-label="Workspace navigation">
        <div className="tlx-shell-brand-row">
          <ProductBrand />
          <button type="button" className="tlx-shell-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu"><X size={22} /></button>
        </div>
        <div className="tlx-shell-tagline"><span className="tlx-shell-status-dot" /> DIGITAL THREAT INTELLIGENCE</div>
        <Link className="tlx-shell-new" href="/dashboard#new-investigation" onClick={() => setDrawerOpen(false)}>
          <Plus size={18} /> <span>NEW INVESTIGATION</span> <ArrowUpRight size={16} />
        </Link>

        <div className="tlx-shell-section-label">01 / NAVIGATION</div>
        <nav className="tlx-shell-nav" aria-label="Main navigation">
          {[...sections, ...(user.isModerator ? [{ href: "/moderation", label: "Moderation", icon: ClipboardCheck, index: "08" }] : [])].map(({ href, label, icon: Icon, index }) => {
            const active = pathname === href || (href === "/investigations" && pathname.startsWith("/investigations/"));
            return (
              <Link href={href} key={href} className={`tlx-shell-link ${active ? "is-active" : ""}`} aria-current={active ? "page" : undefined} onClick={() => setDrawerOpen(false)}>
                <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                <span>{label}</span>
                <small>{index}</small>
              </Link>
            );
          })}
        </nav>

        <div className="tlx-shell-sidebar-bottom">
          <div className="tlx-shell-principle"><ShieldCheck size={19} /><span>VERIFY THE MESSAGE. TRACE THE LINK.<br />PROVE THE REPORT.</span></div>
          <Link className={`tlx-shell-account ${pathname === "/settings" ? "is-active" : ""}`} href="/settings" onClick={() => setDrawerOpen(false)}>
            <span className="tlx-shell-avatar"><UserRound size={18}/></span>
            <span className="tlx-shell-account-name"><strong>{user.name}</strong><small>{user.email}</small></span>
            <ChevronRight size={16}/>
          </Link>
          <button type="button" className="tlx-shell-logout" onClick={signOut} disabled={loggingOut}><LogOut size={15}/>{loggingOut ? "SIGNING OUT…" : "SIGN OUT"}</button>
        </div>
      </aside>

      <div className="tlx-shell-content">
        <header className="tlx-shell-header">
          <div className="tlx-shell-header-left">
            <button type="button" className="tlx-shell-menu" onClick={() => setDrawerOpen(true)} aria-label="Open navigation menu" aria-expanded={drawerOpen}><Menu size={21}/></button>
            <div className="tlx-shell-breadcrumb"><span>THREATLINX / WORKSPACE</span><ChevronRight size={13}/><strong>{currentSection}</strong></div>
          </div>
          <div className="tlx-shell-header-right"><span className="tlx-shell-header-status"><Activity size={14}/> EVIDENCE FIRST</span><Link href="/settings" className="tlx-shell-header-profile" aria-label="Account settings"><UserRound size={17}/></Link></div>
        </header>
        <main id="workspace-main" className="tlx-shell-main">{children}</main>
        <footer className="tlx-shell-footer"><span>THREATLINX © 2026</span><span>VERIFY THE SIGNALS. FOLLOW THE EVIDENCE.</span><Link href="/">PUBLIC WEBSITE <ArrowUpRight size={13}/></Link></footer>
      </div>
    </div>
  );
}
