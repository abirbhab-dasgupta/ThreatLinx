import tls from "node:tls";
import { X509Certificate, createHash } from "node:crypto";
import { KNOWN_COMPROMISED_TLS_SPKI } from "@/lib/intelligence/known-ca-spki";
import { lookup } from "node:dns/promises";
import ipaddr from "ipaddr.js";
import type { CheckResult } from "@/types/scan";
import { evidence } from "@/lib/scanner/helpers";
import { normalizeTarget } from "@/lib/security/target";

function isPublic(ip: string) {
  try { return ipaddr.parse(ip).range() === "unicast"; }
  catch { return false; }
}
async function publicAddresses(host: string) {
  // Use the OS resolver (including Windows/VPN DNS), then pin the connection
  // to a validated address so a second DNS lookup cannot redirect it internally.
  const ips = (await lookup(host, { all: true, verbatim: false })).map(record => record.address);
  if (!ips.length) throw new Error("No public DNS records were found");
                                                                                 
  if (!ips.every(isPublic)) throw new Error("Non-public DNS destination blocked");
  return ips;
}

export async function inspectTls(url: string): Promise<CheckResult> {
  const target = normalizeTarget(url);
  if (new URL(url).protocol !== "https:") return {
    provider: "tls", status: "completed", evidence: [evidence("tls-no-https", "tls", "warning", "HTTPS is not used",
      "The submitted URL uses HTTP rather than HTTPS. No TLS certificate can be validated for this URL.", "ThreatLinx TLS inspector")]
  };
  const ips = await publicAddresses(target.hostname);
                                                                                    
  return await new Promise<CheckResult>((resolve, reject) => {
    const socket = tls.connect({
      host: ips[0], port: 443, servername: target.hostname,
      rejectUnauthorized: false,                                                               
      timeout: 5500,
    });
    let settled = false;
    const fail = (e: Error) => { if (settled) return; settled = true; socket.destroy(); reject(e); };
    socket.once("timeout", () => fail(new Error("TLS handshake timed out")));
    socket.once("error", fail);
    socket.once("secureConnect", () => {
      if (settled) return;
      try {
        const leaf = socket.getPeerCertificate(true);
        if (!leaf || !leaf.raw) throw new Error("Peer presented no readable certificate");
        const hostnameError = tls.checkServerIdentity(target.hostname, leaf);
        const chain: Array<Record<string, unknown>> = [];
        let current: tls.DetailedPeerCertificate | undefined = leaf;
        const seen = new Set<string>();
        const incidentMatches: Array<{ intermediate: string; incident: string; source: string; spkiSha256: string }> = [];
        for (let i = 0; i < 7 && current; i++) {
          if (!current.fingerprint256 || seen.has(current.fingerprint256)) break;
          seen.add(current.fingerprint256);
          const spkiDer = new X509Certificate(current.raw).publicKey.export({ type: "spki", format: "der" });
          const spkiSha256 = createHash("sha256").update(spkiDer).digest("hex").toUpperCase();
          const known = KNOWN_COMPROMISED_TLS_SPKI[spkiSha256];
          if (known) incidentMatches.push({ ...known, spkiSha256 });
          chain.push({
            spkiSha256,
            subjectCN: current.subject?.CN ?? null,
            issuerCN: current.issuer?.CN ?? null,
            validFrom: current.valid_from,
            validTo: current.valid_to,
            fingerprint256: current.fingerprint256,
          });
          if (current.issuerCertificate === current) break;
          current = current.issuerCertificate;
        }
        const expired = Date.parse(leaf.valid_to) < Date.now();
        const notYetValid = Date.parse(leaf.valid_from) > Date.now();
        const trusted = socket.authorized && !hostnameError && !expired && !notYetValid;
        const result: CheckResult = {
          provider: "tls", status: "completed",
          metadata: { trusted, hostnameMatches: !hostnameError, protocol: socket.getProtocol(), chain, incidentMatches },
          evidence: [evidence(trusted ? "tls-valid" : "tls-invalid", "tls", trusted ? "info" : "critical",
            trusted ? "Valid TLS identity observed" : "TLS identity or trust validation failed",
            trusted ? `TLS validated for ${target.hostname} in this runtime's CA trust store.` :
              `TLS did not validate: ${String(socket.authorizationError ?? hostnameError?.message ?? (expired ? "expired" : notYetValid ? "not yet valid" : "unknown reason"))}.`,
            "ThreatLinx Node.js TLS inspector", 0,
            { subject: leaf.subject?.CN ?? null, issuer: leaf.issuer?.CN ?? null, validFrom: leaf.valid_from,
              validTo: leaf.valid_to, fingerprint256: leaf.fingerprint256, hostnameMatches: !hostnameError, trusted })]
        };
        if (incidentMatches.length) {
          result.evidence.push(evidence("tls-known-ca-spki", "tls", "critical",
            "Observed certificate chain matches a known compromised CA public key",
            "An observed chain member SPKI exactly matches a documented compromised eMudhra intermediate CA key. This is a certificate trust issue, not by itself evidence of phishing.",
            "Kudelski Security (historical SPKI advisory)", 0, { matches: incidentMatches }));
        }
        settled = true; socket.destroy(); resolve(result);
      } catch (e) { fail(e instanceof Error ? e : new Error("TLS inspector failed")); }
    });
  });
}
