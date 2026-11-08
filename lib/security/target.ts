import { getDomain } from "tldts";

                                                                                           
export function normalizeTarget(raw: string) {
  if (typeof raw !== "string" || raw.length > 2048) throw new Error("URL is too long");
  let url: URL;
  const value=raw.trim();
                                                                                   
  const candidate=/^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value :
    /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
  try { url = new URL(candidate); } catch { throw new Error("Enter a valid public URL or domain"); }
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only HTTP(S) is supported");
  if (url.username || url.password) throw new Error("URLs containing credentials are not allowed");
  if (url.port) throw new Error("Custom ports are not supported");
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!hostname || hostname.length > 253) throw new Error("Invalid hostname");
  if (!/^[a-z0-9.-]+$/.test(hostname)) throw new Error("Invalid hostname characters");
  if (["localhost", "local", "internal", "test", "invalid"].some(x => hostname === x || hostname.endsWith(`.${x}`))) {
    throw new Error("Internal and non-public hostnames are not allowed");
  }
  if (!getDomain(hostname, { allowPrivateDomains: false })) {
    throw new Error("Provide a publicly registrable domain");
  }
  const parts = hostname.split(".");
  if (parts.some(s => !s || s.length > 63 || s.startsWith("-") || s.endsWith("-"))) {
    throw new Error("Invalid domain label");
  }
  if (/^\d+$/.test(parts[0])) throw new Error("Numeric hostnames are not supported");
  url.search = "";
  url.hash = "";
  url.hostname = hostname;
  return { url: url.toString(), hostname, registrableDomain: getDomain(hostname)! };
}

export function deepScanAllowed(url: string) {
  const path = new URL(url).pathname;
  return !/(?:reset|recover|magic|invite|verify-token|oauth|callback|session|password)/i.test(path);
}
