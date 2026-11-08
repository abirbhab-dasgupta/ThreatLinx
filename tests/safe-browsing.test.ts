import { test } from "node:test";
import assert from "node:assert/strict";
import { safeBrowsingHitCount } from "../lib/providers/safe-browsing-response";

test("Safe Browsing decodes a real v5 no-match protobuf response", async () => {
  // Field 2: cache_duration { seconds: 300 }.
  const response = new Response(new Uint8Array([18, 3, 8, 172, 2]), {
    headers: { "content-type": "application/x-protobuf" },
  });
  assert.equal(await safeBrowsingHitCount(response), 0);
});

test("Safe Browsing detects binary threat matches and rejects truncated responses", async () => {
  const url = new TextEncoder().encode("https://example.com/");
  const threat = [10, url.length, ...url, 18, 1, 2];
  assert.equal(await safeBrowsingHitCount(new Response(new Uint8Array([10, threat.length, ...threat]), {
    headers: { "content-type": "application/x-protobuf" },
  })), 1);
  for (const bytes of [[], [10, 40, 1], [8, 1]]) {
    await assert.rejects(safeBrowsingHitCount(new Response(new Uint8Array(bytes), {
      headers: { "content-type": "application/x-protobuf" },
    })));
  }
  await assert.rejects(safeBrowsingHitCount(new Response("<html>Unavailable</html>", {
    headers: { "content-type": "text/html" },
  })));
});
