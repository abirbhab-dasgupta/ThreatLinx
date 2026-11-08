import { keccak256, toHex } from "viem";

                                                                                                 
export function canonicalJson(value: unknown): string {
  if (value===null || typeof value!=="object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const obj=value as Record<string,unknown>;
  return `{${Object.keys(obj).sort().filter(k=>obj[k]!==undefined).map(k=>`${JSON.stringify(k)}:${canonicalJson(obj[k])}`).join(",")}}`;
}

export function hashReport(snapshot: Record<string, unknown>, salt: string): `0x${string}` {
  if (!/^0x[0-9a-f]{64}$/i.test(salt)) throw Error("Report salt must be 32 random bytes");
  return keccak256(toHex(canonicalJson({salt,snapshot})));
}

export function reportKey(id: string): `0x${string}` {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw Error("Invalid report ID");
  return keccak256(toHex(id.toLowerCase()));
}
