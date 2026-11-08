import Link from "next/link";
                                                                      
export function LandingHero() {
  return (
    <section className="hero" id="top">
<div className="container hero-grid">
<div className="hero-copy">
<div className="eyebrow"><span className="plus">✳</span> THREATLINX / DIGITAL THREAT INTELLIGENCE</div>
<h1>FOLLOW<br /><span className="inset">THE</span><br /><span className="accent-word">SIGNAL.</span></h1>
<p><strong>A message is a claim. A link is a destination.</strong> ThreatLinx investigates both, connects suspicious behaviour to technical evidence and lets you verify reviewed reports independently.</p>
<div className="hero-actions"><a className="btn btn-black" href="#investigate">CHECK A LINK <span className="arrow">↗</span></a><Link className="btn btn-ghost" href="/messages">ANALYZE A MESSAGE <span className="arrow">↘</span></Link></div>
<div className="hero-note"><span className="line-tick"></span><span>PHISHING CAN START WITH A MESSAGE.<br />FOLLOW ITS CLAIMS INTO THE EVIDENCE.</span></div>
</div>
<div className="hero-art" aria-label="ThreatLinx evidence-layer sculpture rendered in black, ultraviolet and signal lime">
<div className="corner-label top">TL / SIGNAL CORRELATION — 001<br />LOOK BEYOND THE ADDRESS BAR →</div>
<div className="orbit-label">↗ IDENTITY / CONTEXT</div>
<svg viewBox="0 0 790 670" role="img" aria-label="ThreatLinx abstract linked security-signal sculpture">
<defs>
<pattern id="microgrid" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M 22 0 L 0 0 0 22" fill="none" stroke="#cfd1c9" strokeWidth=".7"></path></pattern>
<pattern id="halftone" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.05" fill="#55565d" opacity=".45"></circle></pattern>
<linearGradient id="panel-gradient" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#32343d"></stop><stop offset=".42" stopColor="#14161a"></stop><stop offset="1" stopColor="#44464c"></stop></linearGradient>
<linearGradient id="violet-gradient" x1="0" x2="1" y1="1" y2="0"><stop stopColor="#6140d4"></stop><stop offset="1" stopColor="#d2b1ff"></stop></linearGradient>
<filter id="shadow"><feDropShadow dx="15" dy="20" stdDeviation="15" floodColor="#141414" floodOpacity=".17"></feDropShadow></filter>
</defs>
<rect x="28" y="50" width="730" height="575" fill="url(#microgrid)" opacity=".67"></rect>
<circle cx="396" cy="338" r="220" fill="none" stroke="#c2c3bb" strokeWidth="1" strokeDasharray="3 8"></circle>
<circle cx="396" cy="338" r="289" fill="none" stroke="#c2c3bb" strokeWidth=".7" strokeDasharray="1 10"></circle>
<path d="M 73 485 L 735 200 M 75 177 L 713 510" stroke="#d1d2ca" strokeWidth=".8" strokeDasharray="7 5"></path>
<g filter="url(#shadow)" transform="translate(50 12)">
<path d="M182 236 420 135 648 241 405 359Z" fill="#383a42" stroke="#0e1012" strokeWidth="2"></path>
<path d="M182 236 405 359 406 511 187 393Z" fill="#141519" stroke="#0e1012" strokeWidth="2"></path>
<path d="M405 359 648 241 638 398 406 511Z" fill="url(#panel-gradient)" stroke="#0e1012" strokeWidth="2"></path>
<path d="M210 244 420 156 614 245 402 343Z" fill="#25262b"></path>
<path d="M210 244 402 343 401 376 210 274Z" fill="#686975"></path>
<path d="M402 343 614 245 614 277 401 376Z" fill="#1a1a1e"></path>
<path d="M211 292 395 391 395 405 211 307Z" fill="#dcff43"></path>
<path d="M411 387 611 289 610 305 411 404Z" fill="#734fbd"></path>
<path d="M212 335 387 428 387 447 212 354Z" fill="#3a3b45"></path>
<path d="M414 429 603 335 603 354 414 448Z" fill="#85818f"></path>
<path d="M218 373 385 465 385 485 218 394Z" fill="#0c0d0f"></path>
<path d="M420 467 601 377 601 401 420 491Z" fill="#ac82f9"></path>
<g opacity=".7" stroke="#999ca0" strokeWidth="1">
<path d="M265 220 461 319 M297 207 495 306 M325 194 523 292 M358 180 554 276"></path>
<path d="M261 266 262 386 M306 288 307 409 M350 311 351 432"></path>
</g>
</g>
<g id="voxel-shards"><rect x="248.0" y="450.0" width="28" height="12" fill="#313139" opacity="1"></rect>
<rect x="554.5" y="210.4" width="12" height="12" fill="#17191e" opacity="1"></rect>
<rect x="496.9" y="193.5" width="16" height="6" fill="#ac82f9" opacity="1"></rect>
<rect x="389.7" y="518.7" width="6" height="41" fill="#313139" opacity="1"></rect>
<rect x="664.9" y="324.5" width="20" height="16" fill="#313139" opacity="0.8"></rect>
<rect x="268.2" y="453.7" width="9" height="16" fill="#4c4b59" opacity="1"></rect>
<rect x="669.0" y="311.6" width="6" height="22" fill="#17191e" opacity="0.9"></rect>
<rect x="321.0" y="461.3" width="38" height="8" fill="#17191e" opacity="1"></rect>
<rect x="372.9" y="236.4" width="38" height="6" fill="#dcff43" opacity="1"></rect>
<rect x="338.8" y="231.9" width="8" height="41" fill="#ac82f9" opacity="0.9"></rect>
<rect x="319.2" y="165.6" width="20" height="6" fill="#4c4b59" opacity="1"></rect>
<rect x="214.0" y="252.8" width="8" height="12" fill="#313139" opacity="0.8"></rect>
<rect x="205.1" y="307.9" width="28" height="6" fill="#dcff43" opacity="0.8"></rect>
<rect x="383.0" y="232.8" width="28" height="10" fill="#dcff43" opacity="1"></rect>
<rect x="411.8" y="492.2" width="12" height="12" fill="#dcff43" opacity="0.8"></rect>
<rect x="268.8" y="242.4" width="28" height="6" fill="#313139" opacity="1"></rect>
<rect x="230.9" y="366.1" width="6" height="12" fill="#313139" opacity="1"></rect>
<rect x="603.1" y="273.7" width="8" height="12" fill="#17191e" opacity="0.8"></rect>
<rect x="348.4" y="478.7" width="9" height="29" fill="#17191e" opacity="0.9"></rect>
<rect x="554.8" y="241.7" width="12" height="29" fill="#17191e" opacity="1"></rect>
<rect x="524.4" y="183.6" width="12" height="29" fill="#cfb0ff" opacity="1"></rect>
<rect x="327.1" y="460.8" width="8" height="8" fill="#ac82f9" opacity="1"></rect>
<rect x="380.1" y="216.6" width="38" height="12" fill="#4c4b59" opacity="1"></rect>
<rect x="555.9" y="451.7" width="8" height="22" fill="#17191e" opacity="0.8"></rect>
<rect x="487.0" y="185.4" width="6" height="22" fill="#4c4b59" opacity="0.8"></rect>
<rect x="342.8" y="206.7" width="28" height="8" fill="#17191e" opacity="1"></rect>
<rect x="437.6" y="441.3" width="6" height="12" fill="#313139" opacity="1"></rect>
<rect x="272.6" y="264.4" width="6" height="29" fill="#4c4b59" opacity="0.9"></rect>
<rect x="276.9" y="211.6" width="12" height="12" fill="#4c4b59" opacity="1"></rect>
<rect x="265.4" y="205.8" width="16" height="6" fill="#4c4b59" opacity="1"></rect>
<rect x="620.3" y="313.5" width="38" height="22" fill="#17191e" opacity="1"></rect>
<rect x="392.5" y="160.2" width="8" height="12" fill="#17191e" opacity="1"></rect>
<rect x="359.4" y="154.0" width="8" height="10" fill="#17191e" opacity="1"></rect>
<rect x="299.4" y="190.2" width="12" height="22" fill="#17191e" opacity="1"></rect>
<rect x="640.5" y="438.3" width="38" height="8" fill="#dcff43" opacity="1"></rect>
<rect x="545.8" y="470.3" width="9" height="12" fill="#313139" opacity="1"></rect>
<rect x="606.6" y="456.7" width="28" height="16" fill="#17191e" opacity="1"></rect>
<rect x="220.4" y="264.9" width="38" height="22" fill="#313139" opacity="1"></rect>
<rect x="458.1" y="443.1" width="28" height="29" fill="#dcff43" opacity="0.8"></rect>
<rect x="212.6" y="263.4" width="55" height="22" fill="#17191e" opacity="1"></rect>
<rect x="249.1" y="468.8" width="28" height="12" fill="#74727e" opacity="0.9"></rect>
<rect x="218.2" y="416.4" width="28" height="41" fill="#ac82f9" opacity="0.8"></rect>
<rect x="579.4" y="484.7" width="9" height="12" fill="#ac82f9" opacity="1"></rect>
<rect x="173.4" y="218.3" width="28" height="6" fill="#17191e" opacity="1"></rect>
<rect x="462.3" y="245.1" width="9" height="22" fill="#4c4b59" opacity="0.8"></rect>
<rect x="220.1" y="273.2" width="9" height="29" fill="#74727e" opacity="1"></rect>
<rect x="226.6" y="252.1" width="8" height="10" fill="#4c4b59" opacity="1"></rect>
<rect x="376.1" y="498.0" width="38" height="22" fill="#17191e" opacity="1"></rect>
<rect x="194.1" y="463.0" width="38" height="6" fill="#17191e" opacity="1"></rect>
<rect x="563.5" y="251.6" width="38" height="16" fill="#cfb0ff" opacity="0.9"></rect>
<rect x="372.9" y="443.7" width="6" height="12" fill="#dcff43" opacity="1"></rect>
<rect x="532.7" y="467.2" width="12" height="22" fill="#313139" opacity="0.8"></rect>
<rect x="384.0" y="166.7" width="6" height="22" fill="#74727e" opacity="1"></rect>
<rect x="218.5" y="403.1" width="12" height="10" fill="#ac82f9" opacity="1"></rect>
<rect x="566.8" y="367.1" width="6" height="6" fill="#4c4b59" opacity="1"></rect>
<rect x="457.2" y="446.9" width="38" height="22" fill="#17191e" opacity="0.8"></rect>
<rect x="327.6" y="184.4" width="8" height="22" fill="#313139" opacity="1"></rect>
<rect x="256.7" y="427.3" width="12" height="16" fill="#17191e" opacity="0.9"></rect>
<rect x="518.7" y="486.7" width="20" height="8" fill="#17191e" opacity="0.9"></rect>
<rect x="421.1" y="159.3" width="28" height="8" fill="#ac82f9" opacity="1"></rect>
<rect x="553.8" y="252.9" width="20" height="29" fill="#17191e" opacity="0.9"></rect>
<rect x="166.3" y="377.3" width="6" height="22" fill="#17191e" opacity="1"></rect>
<rect x="212.6" y="416.3" width="8" height="10" fill="#ac82f9" opacity="1"></rect>
<rect x="400.7" y="458.0" width="9" height="16" fill="#17191e" opacity="1"></rect>
<rect x="626.8" y="327.0" width="9" height="12" fill="#313139" opacity="1"></rect>
<rect x="599.3" y="295.9" width="20" height="12" fill="#313139" opacity="0.8"></rect>
<rect x="612.7" y="317.7" width="6" height="12" fill="#74727e" opacity="1"></rect>
<rect x="287.8" y="261.0" width="9" height="6" fill="#4c4b59" opacity="1"></rect>
<rect x="455.1" y="457.6" width="28" height="16" fill="#17191e" opacity="0.8"></rect>
<rect x="625.1" y="258.2" width="20" height="22" fill="#ac82f9" opacity="0.9"></rect>
<rect x="623.7" y="377.2" width="9" height="16" fill="#313139" opacity="1"></rect>
<rect x="523.8" y="415.7" width="6" height="16" fill="#ac82f9" opacity="0.9"></rect>
<rect x="539.4" y="236.7" width="9" height="16" fill="#74727e" opacity="0.8"></rect>
<rect x="493.4" y="218.8" width="12" height="22" fill="#17191e" opacity="1"></rect>
<rect x="279.3" y="458.9" width="16" height="12" fill="#74727e" opacity="0.8"></rect>
<rect x="585.2" y="240.0" width="8" height="10" fill="#dcff43" opacity="1"></rect>
<rect x="146.4" y="286.1" width="55" height="10" fill="#17191e" opacity="0.9"></rect>
<rect x="480.4" y="186.4" width="38" height="12" fill="#17191e" opacity="1"></rect>
<rect x="273.3" y="266.6" width="12" height="22" fill="#cfb0ff" opacity="1"></rect>
<rect x="468.7" y="225.6" width="6" height="8" fill="#17191e" opacity="0.8"></rect>
<rect x="498.3" y="436.6" width="6" height="29" fill="#313139" opacity="1"></rect>
<rect x="417.1" y="456.3" width="20" height="22" fill="#4c4b59" opacity="1"></rect>
<rect x="420.9" y="174.6" width="28" height="12" fill="#4c4b59" opacity="1"></rect>
<rect x="352.4" y="210.1" width="8" height="29" fill="#313139" opacity="1"></rect>
<rect x="519.8" y="436.7" width="28" height="10" fill="#17191e" opacity="1"></rect>
<rect x="652.0" y="290.8" width="28" height="29" fill="#17191e" opacity="1"></rect>
<rect x="223.1" y="247.4" width="20" height="22" fill="#cfb0ff" opacity="0.8"></rect>
<rect x="648.2" y="281.9" width="9" height="16" fill="#17191e" opacity="1"></rect>
<rect x="252.4" y="436.6" width="55" height="16" fill="#4c4b59" opacity="0.9"></rect>
<rect x="210.5" y="389.5" width="28" height="12" fill="#ac82f9" opacity="1"></rect>
<rect x="594.3" y="402.2" width="12" height="22" fill="#dcff43" opacity="1"></rect>
<rect x="172.7" y="324.7" width="8" height="12" fill="#cfb0ff" opacity="0.8"></rect>
<rect x="396.1" y="495.1" width="38" height="16" fill="#dcff43" opacity="1"></rect>
<rect x="551.8" y="491.8" width="8" height="29" fill="#313139" opacity="1"></rect>
<rect x="210.5" y="345.6" width="8" height="22" fill="#ac82f9" opacity="1"></rect>
<rect x="494.6" y="227.5" width="12" height="6" fill="#cfb0ff" opacity="1"></rect>
<rect x="151.9" y="265.2" width="16" height="10" fill="#313139" opacity="1"></rect>
<rect x="249.7" y="212.2" width="9" height="29" fill="#313139" opacity="0.8"></rect>
<rect x="368.7" y="492.5" width="16" height="41" fill="#313139" opacity="1"></rect>
<rect x="607.2" y="216.0" width="55" height="22" fill="#313139" opacity="1"></rect>
<rect x="315.7" y="500.2" width="38" height="10" fill="#4c4b59" opacity="1"></rect>
<rect x="249.9" y="392.2" width="20" height="41" fill="#17191e" opacity="0.8"></rect>
<rect x="303.8" y="207.5" width="38" height="22" fill="#313139" opacity="1"></rect>
<rect x="593.3" y="212.0" width="28" height="22" fill="#313139" opacity="1"></rect>
<rect x="342.5" y="218.3" width="8" height="12" fill="#cfb0ff" opacity="1"></rect>
<rect x="530.8" y="506.9" width="6" height="29" fill="#313139" opacity="1"></rect>
<rect x="261.0" y="425.2" width="28" height="10" fill="#313139" opacity="0.8"></rect>
<rect x="297.3" y="495.9" width="38" height="6" fill="#313139" opacity="1"></rect>
<rect x="409.0" y="525.1" width="55" height="29" fill="#ac82f9" opacity="0.8"></rect>
<rect x="201.0" y="260.7" width="8" height="12" fill="#17191e" opacity="1"></rect>
<rect x="184.0" y="387.1" width="38" height="8" fill="#17191e" opacity="0.8"></rect>
<rect x="272.5" y="448.0" width="8" height="41" fill="#17191e" opacity="0.9"></rect>
<rect x="428.1" y="219.9" width="9" height="41" fill="#17191e" opacity="1"></rect>
<rect x="394.7" y="182.9" width="6" height="10" fill="#17191e" opacity="1"></rect>
<rect x="570.3" y="421.0" width="9" height="22" fill="#17191e" opacity="1"></rect>
<rect x="220.9" y="327.8" width="8" height="6" fill="#74727e" opacity="1"></rect>
<rect x="312.5" y="249.9" width="28" height="6" fill="#313139" opacity="1"></rect>
<rect x="590.1" y="340.8" width="8" height="8" fill="#4c4b59" opacity="0.9"></rect>
<rect x="609.2" y="367.2" width="16" height="8" fill="#cfb0ff" opacity="1"></rect>
<rect x="426.2" y="237.8" width="16" height="16" fill="#17191e" opacity="1"></rect>
<rect x="560.7" y="348.8" width="55" height="6" fill="#74727e" opacity="0.9"></rect>
<rect x="463.4" y="506.7" width="12" height="29" fill="#313139" opacity="1"></rect>
<rect x="576.6" y="256.7" width="28" height="16" fill="#313139" opacity="1"></rect>
<rect x="652.1" y="313.9" width="9" height="12" fill="#4c4b59" opacity="1"></rect>
<rect x="208.0" y="381.8" width="16" height="10" fill="#313139" opacity="0.8"></rect>
<rect x="148" y="259" width="109" height="13" fill="#17191e"></rect>
<rect x="583" y="335" width="103" height="16" fill="#17191e"></rect>
<rect x="181" y="483" width="84" height="20" fill="#ac82f9"></rect>
<rect x="550" y="205" width="119" height="9" fill="#dcff43"></rect>
<rect x="301" y="128" width="49" height="23" fill="#17191e"></rect>
<rect x="627" y="409" width="80" height="31" fill="#cfb0ff"></rect></g>
<g opacity=".94">
<rect x="587" y="147" width="85" height="29" fill="#ac82f9" transform="rotate(-11 587 147)"></rect>
<rect x="131" y="392" width="94" height="18" fill="#dcff43" transform="rotate(-11 131 392)"></rect>
<rect x="573" y="491" width="84" height="13" fill="#dcff43" transform="rotate(-9 573 491)"></rect>
<rect x="340" y="94" width="25" height="92" fill="#cfb0ff" opacity=".7" transform="rotate(15 340 94)"></rect>
<rect x="490" y="502" width="45" height="73" fill="#ac82f9" opacity=".5"></rect>
</g>
<g fontFamily="monospace" fontSize="12" fill="#161616"><text x="84" y="143">[01] IDENTITY</text><path d="M168 150 252 221" fill="none" stroke="#2d2b2c" strokeDasharray="3 4"></path><text x="579" y="577">[02] EVIDENCE</text><text x="84" y="565">TL//01</text></g>
</svg>
<div className="stamp"><b>CHECK<br />THE SIGNALS.</b><span>SCAN / CORRELATE / UNDERSTAND</span></div>
<div className="corner-label bottom">● SECURE CONNECTION ≠ SAFE WEBSITE</div>
</div>
</div>
</section>
  );
}
