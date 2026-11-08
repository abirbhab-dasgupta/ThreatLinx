                                                                      
export function LandingHeader() {
  return (
    <header className="site-header">
<nav className="container navbar" aria-label="Primary navigation">
<a className="brand" href="#top" aria-label="ThreatLinx home"><span className="brand-mark" aria-hidden="true"></span><span className="brand-name">THREATLINX</span></a>
<div className="nav-slogan">DIGITAL THREAT<br />INTELLIGENCE</div>
<div className="nav-links" id="nav-links">
<a href="#capabilities">CAPABILITIES</a><a href="#xray">SIGNAL MAP</a><a href="#methodology">METHODOLOGY</a><a href="#community">COLLECTIVE INTELLIGENCE</a>
</div>
<a href="/sign-in" className="nav-signin">SIGN IN ↗</a><a className="btn btn-black nav-cta" href="#investigate">START INVESTIGATING <span className="arrow">↗</span></a>
<button className="menu-toggle" aria-controls="nav-links" aria-expanded="false" aria-label="Toggle menu">☰</button>
</nav>
</header>
  );
}
