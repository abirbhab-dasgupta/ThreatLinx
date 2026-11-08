import Link from "next/link";
export function ProductBrand({ compact = false }: { compact?: boolean }) {
  return <Link href="/dashboard" className="tlx-brand" aria-label="ThreatLinx dashboard">
    <span className="brand-mark" aria-hidden="true" />
    <span className="tlx-brand-name">THREATLINX</span>
    {!compact && <span className="tlx-brand-sub">THREAT INTELLIGENCE<br />WORKSPACE</span>}
  </Link>;
}
