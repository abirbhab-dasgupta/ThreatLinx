import protobuf from "protobufjs";
import { z } from "zod";

// Safe Browsing v5 SearchUrlsResponse wire schema. Only the threat count is
// retained; returned URLs must not leak sensitive provider response data.
// https://developers.google.com/safe-browsing/reference/rpc/google.security.safebrowsing.v5
const responseType = protobuf.parse(`syntax = "proto3";
  message ThreatUrl { string url = 1; repeated int32 threat_types = 2; }
  message Duration { int64 seconds = 1; int32 nanos = 2; }
  message SearchUrlsResponse { repeated ThreatUrl threats = 1; Duration cache_duration = 2; }
`).root.lookupType("SearchUrlsResponse");
const jsonResponse = z.object({ threats: z.array(z.object({
  url: z.string(), threatTypes: z.array(z.string()).min(1),
})).optional(), cacheDuration: z.string().optional() });

export async function safeBrowsingHitCount(response: Response): Promise<number> {
  const contentType = response.headers.get("content-type")?.split(";")[0].trim();
  if (contentType === "application/json") {
    return jsonResponse.parse(await response.json()).threats?.length ?? 0;
  }
  if (!["application/x-protobuf", "application/protobuf"].includes(contentType ?? "")) {
    throw new Error("Safe Browsing returned an unsupported response format");
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!bytes.length || bytes.length > 1_000_000) throw new Error("Invalid Safe Browsing response size");
  const decoded = responseType.decode(bytes) as protobuf.Message & {
    threats?: Array<{ url?: string; threatTypes?: number[] }>;
    cacheDuration?: unknown;
  };
  if (!decoded.cacheDuration && !decoded.threats?.length) throw new Error("Incomplete Safe Browsing response");
  if (decoded.threats?.some(threat => !threat.url || !threat.threatTypes?.length)) {
    throw new Error("Incomplete Safe Browsing threat match");
  }
  return decoded.threats?.length ?? 0;
}
