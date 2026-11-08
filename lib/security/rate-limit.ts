import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

                                                                                         
export async function rateLimitUser(userId: string, kind: "scan" | "report") {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (process.env.NODE_ENV === "production") throw new Error("Rate limiting must be configured in production");
    return true;
  }
  const redis = new Redis({ url, token });
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(kind === "scan" ? 12 : 4, "1 h"),
    prefix: `threatlinx:${kind}`,
  });
  return (await limiter.limit(userId)).success;
}
