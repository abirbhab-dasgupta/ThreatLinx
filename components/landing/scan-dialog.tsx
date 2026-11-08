                                                                      
export function LandingScanDialog() {
  return (
    <div className="dialog-backdrop" id="mock-dialog" role="presentation"><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-heading" aria-describedby="dialog-description"><button className="close" type="button" aria-label="Close dialog">×</button><div className="mini">THREATLINX / EVIDENCE EXPLORER</div><h2 id="dialog-heading">CHECK THE LINK.<br />READ THE SIGNALS.</h2><p id="dialog-description">This interactive example shows how ThreatLinx presents evidence. It does not perform a live investigation of the displayed URL.</p><span className="entered-url" id="entered-url">https://example.com</span><p>Explore the labeled sample, or sign in to run a real investigation through your configured security providers.</p><a className="btn btn-black" href="#xray" id="dialog-explore">EXPLORE SIGNAL MAP <span className="arrow">↗</span></a></section></div>
  );
}
