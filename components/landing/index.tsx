import { LandingHeader } from "./header";
import { LandingHero } from "./hero";
import { LandingScanStrip } from "./scan-strip";
import { LandingInfoRibbon } from "./info-ribbon";
import { LandingCapabilities } from "./capabilities";
import { LandingThreatXray } from "./threat-xray";
import { LandingMethodology } from "./methodology";
import { LandingCommunity } from "./community";
import { LandingClosing } from "./closing";
import { LandingFooter } from "./footer";
import { LandingInteractions } from "./landing-interactions";

export function LandingPage() {
  return <>
    <a className="skip-link" href="#main">SKIP TO CONTENT</a>
    <div className="top-meter mono" aria-label="Platform status"><span>THREATLINX / DIGITAL THREAT INTELLIGENCE</span><span className="top-center">● MULTIPLE CHECKS. TRACEABLE FINDINGS.</span><span>FOLLOW THE SIGNALS. VERIFY THE EVIDENCE.</span></div>
    <LandingHeader />
    <main id="main">
      <LandingHero />
      <LandingScanStrip />
      <LandingInfoRibbon />
      <LandingCapabilities />
      <LandingThreatXray />
      <LandingMethodology />
      <LandingCommunity />
      <LandingClosing />
    </main>
    <LandingFooter />
    <LandingInteractions />
  </>;
}
