import assert from "node:assert/strict";
import test from "node:test";
import { createProductAnalytics, DEFAULT_ANALYTICS_HOST } from "./analytics.js";

test("application analytics stays inactive without a key", async () => {
  for (const key of [undefined, "", "   "]) {
    const analytics = createProductAnalytics({
      key,
      clientFactory() {
        throw new Error("client should not be created");
      },
    });
    assert.equal(analytics.enabled, false);
    analytics.capture("shopper", "checkout_started");
    await analytics.shutdown();
  }
});

test("application analytics defaults the host and captures product events", async () => {
  let seen;
  const events = [];
  const analytics = createProductAnalytics({
    key: " test_key ",
    host: "",
    clientFactory(token, options) {
      seen = { token, options };
      return {
        capture(event) {
          events.push(event);
        },
        async shutdown() {
          events.push("shutdown");
        },
      };
    },
  });

  assert.equal(analytics.enabled, true);
  assert.equal(seen.token, "test_key");
  assert.equal(seen.options.host, DEFAULT_ANALYTICS_HOST);
  assert.equal(seen.options.host, "https://us.i.posthog.com");
  analytics.capture("shopper-1", "checkout_started", { items: 1 });
  analytics.capture("", "checkout_started");
  analytics.capture("shopper-1", " ");
  await analytics.shutdown();
  assert.deepEqual(events, [
    { distinctId: "shopper-1", event: "checkout_started", properties: { items: 1 } },
    "shutdown",
  ]);
});

test("application analytics honors a configured host", () => {
  let seen;
  createProductAnalytics({
    key: "test_key",
    host: " https://analytics.example.invalid ",
    clientFactory(_token, options) {
      seen = options;
      return { capture() {}, shutdown() {} };
    },
  });
  assert.equal(seen.host, "https://analytics.example.invalid");
});
