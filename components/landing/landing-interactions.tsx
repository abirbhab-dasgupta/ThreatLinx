"use client";

import { useEffect } from "react";

                                                                       
                                                                           
                                                                        
const evidence = {
  lookalike: { index: "EV / 001 — URL SIGNAL", status: "REQUIRES ATTENTION", title: "LOOKALIKE<br>DOMAIN.", copy: "The hostname uses a character that resembles a well-known payment brand. The actual registrable domain does not match the brand's official domain.", source: "Hostname comparison", classification: "Potential impersonation", badge: "↗ NODE 01/05" },
  certificate: { index: "EV / 002 — TLS IDENTITY", status: "NO LIVE CHECK", title: "CERTIFICATE<br>IDENTITY.", copy: "An HTTPS certificate can establish an encrypted connection to a hostname without proving that the website belongs to the brand it imitates. Chain validity is a separate check.", source: "Certificate-chain inspector", classification: "Not assessed in demo", badge: "↗ NODE 02/05" },
  reputation: { index: "EV / 003 — THREAT FEED", status: "NO LIVE CHECK", title: "KNOWN-THREAT<br>LOOKUP.", copy: "Reputation services can identify previously reported threats. An empty result would mean no known match—not proof that a website is safe.", source: "Threat-intelligence providers", classification: "Not assessed in demo", badge: "↗ NODE 03/05" },
  browser: { index: "EV / 004 — PAGE BEHAVIOR", status: "NO LIVE CHECK", title: "PAGE<br>OBSERVATIONS.", copy: "Optional isolated inspection can reveal redirect destinations, password fields and other observable page signals. Their meaning depends on context.", source: "Isolated browser evidence", classification: "Not assessed in demo", badge: "↗ NODE 04/05" },
  primary: { index: "EV / 000 — SUBJECT", status: "SYNTHETIC EXAMPLE", title: "ONE URL.<br>MULTIPLE SIGNALS.", copy: "The investigation centers on the requested URL. Findings from independent modules are connected only when a relationship is supported by actual evidence.", source: "Investigation graph", classification: "Illustrative scenario", badge: "↗ SUBJECT / 00" },
} as const;

type EvidenceKey = keyof typeof evidence;

export function LandingInteractions() {
  useEffect(() => {
    const cleanups: (() => void)[] = [];
    const bind = (element: Element | Document | null, event: string, handler: EventListener) => {
      if (!element) return;
      element.addEventListener(event, handler);
      cleanups.push(() => element.removeEventListener(event, handler));
    };

    const navToggle = document.querySelector<HTMLButtonElement>(".menu-toggle");
    const navLinks = document.getElementById("nav-links");
    bind(navToggle, "click", () => {
      if (!navToggle || !navLinks) return;
      const opened = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!opened));
      navLinks.classList.toggle("open", !opened);
    });
    document.querySelectorAll(".nav-links a").forEach(link => {
      bind(link, "click", () => {
        navLinks?.classList.remove("open");
        navToggle?.setAttribute("aria-expanded", "false");
      });
    });

    function selectEvidence(id: EvidenceKey) {
      const data = evidence[id];
      if (!data) return;
      const update = (selector: string, value: string) => {
        const node = document.querySelector<HTMLElement>(selector);
        if (node) node.textContent = value;
      };
      update("#evidence-index", data.index);
      update("#evidence-status", data.status);
      update("#evidence-copy", data.copy);
      update("#evidence-source", data.source);
      update("#evidence-classification", data.classification);
      update(".evidence-top span", data.badge);
                                                                                   
      const headline = document.getElementById("evidence-heading");
      if (headline) headline.innerHTML = data.title;
      document.querySelectorAll(".graph-node").forEach(node => node.classList.toggle("selected", (node as HTMLElement).dataset.evidence === id));
      document.querySelectorAll(".invest-nav button[data-evidence]").forEach(node => node.classList.toggle("active", (node as HTMLElement).dataset.evidence === id));
    }
    document.querySelectorAll<HTMLElement>("[data-evidence]").forEach(node => {
      bind(node, "click", () => {
        const id = node.dataset.evidence as EvidenceKey | undefined;
        if (id && id in evidence) selectEvidence(id);
      });
    });
    bind(document.querySelector('[data-jump="xray"]'), "click", () => selectEvidence("primary"));
    return () => {
      cleanups.forEach(fn => fn());

    };
  }, []);
  return null;
}
