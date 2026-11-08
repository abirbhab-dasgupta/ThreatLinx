                                                                      
export function LandingThreatXray() {
  return (
    <section className="xray-section" id="xray">
<div className="container">
<div className="xray-heading"><div><div className="sec-id">02 / THREATLINX SIGNAL MAP</div><h2>NOT JUST<br />A WARNING.<br /><i>THE EVIDENCE.</i></h2></div><p>Every warning should lead somewhere: to a hostname mismatch, a reputation match, a certificate finding or an observed page behavior. Explore the supporting evidence and the unanswered questions behind the verdict.</p></div>
<div className="investigation" aria-label="Interactive demonstration of the ThreatLinx investigation workspace">
<aside className="invest-side">
<div className="invest-brand"><span className="small-square"></span> THREATLINX</div>
<div className="invest-nav"><div className="mini">{"// INVESTIGATION"}</div><button className="active" type="button" data-jump="xray"><span className="menu-glyph">▧</span> Evidence graph</button><button type="button" data-evidence="lookalike"><span className="menu-glyph">⌕</span> URL signals</button><button type="button" data-evidence="certificate"><span className="menu-glyph">▤</span> TLS chain</button><button type="button" data-evidence="reputation"><span className="menu-glyph">◉</span> Reputation</button><button type="button" data-evidence="browser"><span className="menu-glyph">▣</span> Page evidence</button></div>
<div className="invest-side-bottom"><span className="online-light"></span>EXPLORABLE EXAMPLE<br />NO LIVE URL CONTACTED</div>
</aside>
<div className="invest-main">
<div className="invest-topbar"><span className="mini">SIGNAL MAP / TL—CASE—001</span><span className="demo-tag">● SYNTHETIC SCENARIO</span></div>
<div className="invest-content">
<div className="invest-title">SUBJECT / DOMAIN</div><div className="invest-url">paypa1-verify.example</div>
<div className="invest-digest"><div className="risk-score"><div className="risk-circle"><strong>76</strong></div><div className="score-desc">ILLUSTRATIVE RISK / 100<br /><b>Suspicious</b><br />Not a real scan result</div></div><div className="risk-signal">SECURITY POSTURE <b>NOT ASSESSED</b>EVIDENCE CONFIDENCE / DEMO</div></div>
<div className="graph-stage" id="graph-stage">
<svg className="graph-lines" viewBox="0 0 600 300" preserveAspectRatio="none" aria-hidden="true"><line x1="260" y1="146" x2="125" y2="68"></line><line x1="332" y1="146" x2="480" y2="74"></line><line x1="255" y1="158" x2="125" y2="240"></line><line x1="331" y1="159" x2="479" y2="240"></line></svg>
<button type="button" className="graph-node primary" data-evidence="primary">◈ URL UNDER REVIEW</button>
<button type="button" className="graph-node lookalike selected" data-evidence="lookalike">LOOKALIKE HOSTNAME</button>
<button type="button" className="graph-node certificate" data-evidence="certificate">TLS CERTIFICATE</button>
<button type="button" className="graph-node reputation" data-evidence="reputation">THREAT FEEDS</button>
<button type="button" className="graph-node browser" data-evidence="browser">PAGE EVIDENCE</button>
</div>
</div>
</div>
<aside className="invest-evidence" aria-live="polite">
<div className="evidence-top"><strong>Evidence inspector</strong><span>↗ NODE 01/05</span></div>
<div className="evidence-inner"><div className="evidence-status" id="evidence-status">REQUIRES ATTENTION</div><div className="evidence-index" id="evidence-index">EV / 001 — URL SIGNAL</div><h3 id="evidence-heading">LOOKALIKE<br />DOMAIN.</h3><p id="evidence-copy">The hostname uses a character that resembles a well-known payment brand. The actual registrable domain does not match the brand&apos;s official domain.</p><div className="evidence-detail"><div><span className="label">EVIDENCE SOURCE</span><span className="value" id="evidence-source">Hostname comparison</span></div><div><span className="label">CLASSIFICATION</span><span className="value" id="evidence-classification">Potential impersonation</span></div><div><span className="label">VERIFICATION</span><span className="value">Synthetic demonstration only</span></div></div></div>
</aside>
</div>
<div className="xray-under"><p>* THIS IS AN INTERACTIVE DESIGN SCENARIO. SCORES, DOMAINS AND FINDINGS ARE FICTIONAL. LIVE INVESTIGATIONS USE OBSERVED, ATTRIBUTED EVIDENCE.</p><a href="#methodology" className="btn btn-purple">UNDERSTAND THE PROCESS <span className="arrow">↗</span></a></div>
</div>
</section>
  );
}
