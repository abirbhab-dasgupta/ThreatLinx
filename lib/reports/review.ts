export function hasIndependentCheck(checks: Array<{provider:string;status:string}>) {
  return checks.some(check => check.status === "completed" && ["reputation", "tls", "security", "browser"].includes(check.provider));
}

export function reviewDecision(current: string, requested: "verified" | "rejected") {
  if (current === requested) return "unchanged";
  return current === "pending" ? "allowed" : "conflict";
}
