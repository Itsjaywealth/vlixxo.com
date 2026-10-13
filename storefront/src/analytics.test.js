import assert from "node:assert/strict";
import test from "node:test";
import { captureProductEvent, DEFAULT_ANALYTICS_HOST, initProductAnalytics } from "./analytics.js";

test("storefront analytics stays inactive without a key", async () => {
  const client = {
    init() {
      throw new Error("init should not run");
    },
  };
  for (const key of [undefined, "", "   "]) {
    assert.equal(await initProductAnalytics({ key, client }), false);
  }
  captureProductEvent("storefront_viewed", { source: "test" });
});

test("storefront analytics uses the default host and keeps session replay off", async () => {
  let seen;
  const client = {
    init(key, options) {
      seen = { key, options };
    },
    capture(event, properties) {
      seen.event = { event, properties };
    },
  };

  assert.equal(await initProductAnalytics({ key: "test_key", host: "  ", client }), true);
  assert.equal(seen.key, "test_key");
  assert.equal(seen.options.api_host, DEFAULT_ANALYTICS_HOST);
  assert.equal(seen.options.api_host, "https://us.i.posthog.com");
  assert.equal(seen.options.disable_session_recording, true);
  assert.equal(seen.options.capture_pageview, true);
  assert.equal(Object.hasOwn(seen.options, "session_recording"), false);

  captureProductEvent("product_viewed", { id: "sku-1" });
  assert.deepEqual(seen.event, { event: "product_viewed", properties: { id: "sku-1" } });
});

test("storefront analytics honors a configured host", async () => {
  let seen;
  const client = {
    init(_key, options) {
      seen = options;
    },
  };
  await initProductAnalytics({
    key: "test_key",
    host: "https://analytics.example.invalid",
    client,
  });
  assert.equal(seen.api_host, "https://analytics.example.invalid");
  assert.equal(seen.disable_session_recording, true);
});
