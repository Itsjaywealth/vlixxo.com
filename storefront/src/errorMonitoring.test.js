import assert from "node:assert/strict";
import test from "node:test";
import { initErrorMonitoring } from "./errorMonitoring.js";

test("storefront error monitoring stays inactive without configuration", async () => {
  const sentry = {
    init() {
      throw new Error("init should not run");
    },
  };
  for (const dsn of [undefined, "", "   "]) {
    const result = await initErrorMonitoring({ dsn, sentry });
    assert.equal(result.enabled, false);
    assert.equal(typeof result.boundary, "function");
  }
});

test("storefront error monitoring samples traces at 0.1 and skips replay", async () => {
  let config;
  const tracing = { name: "BrowserTracing" };
  const sentry = {
    init(value) {
      config = value;
    },
    browserTracingIntegration() {
      return tracing;
    },
    ErrorBoundary() {
      return null;
    },
  };

  const result = await initErrorMonitoring({
    dsn: "https://public@example.invalid/1",
    sentry,
  });

  assert.equal(result.enabled, true);
  assert.equal(result.boundary, sentry.ErrorBoundary);
  assert.equal(config.dsn, "https://public@example.invalid/1");
  assert.equal(config.tracesSampleRate, 0.1);
  assert.equal(config.sendDefaultPii, false);
  const names = config
    .integrations([{ name: "Replay" }, { name: "BrowserTracing" }, { name: "GlobalHandlers" }])
    .map((integration) => integration.name);
  assert.deepEqual(names, ["BrowserTracing", "GlobalHandlers"]);
  const withTracingAdded = config
    .integrations([{ name: "Replay" }, { name: "GlobalHandlers" }])
    .map((integration) => integration.name);
  assert.deepEqual(withTracingAdded, ["GlobalHandlers", "BrowserTracing"]);
});
