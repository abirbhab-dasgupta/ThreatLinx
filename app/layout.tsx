import type { Metadata } from "next";
import "./globals.css";
import "@/components/product/v2.css";

export const metadata: Metadata = {
  title: { default: "ThreatLinx — Investigate the deception. Verify the evidence.", template: "%s | ThreatLinx" },
  description: "Analyze suspicious messages and links, investigate website and certificate evidence, connect related incidents, and independently verify reviewed threat reports.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en">
    <head>
      <meta name="theme-color" content="#f3f3ef" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* Root App Router layout applies these fonts to every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800;900&family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
    </head>
    <body>{children}</body>
  </html>;
}
