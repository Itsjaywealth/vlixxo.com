import assert from "node:assert/strict";
import test from "node:test";
import { configureErrorMonitoring } from "./instrument.js";

test("application error monitoring stays inactive without configuration", () => {
  const sentry = {
    init() {
      throw new Error("init should not run");
    },
  };
  for (const dsn of [undefined, "", "   "]) {
    const monitoring = configureErrorMonitoring({ dsn, sentry });
    assert.equal(monitoring.enabled, false);
    assert.equal(monitoring.setup({}), false);
    monitoring.capture(new Error("ignored"));
  }
});

test("application error monitoring samples traces at 0.1 and skips replay", () => {
  let config;
  const calls = [];
  const sentry = {
    init(value) {
      config = value;
    },
    setupExpressErrorHandler(app) {
      calls.push(app);
    },
    captureException(error) {
      calls.push(error.message);
    },
  };

  const monitoring = configureErrorMonitoring({
    dsn: " https://public@example.invalid/1 ",
    sentry,
    environment: "test",
  });
  const app = { name: "app" };

  assert.equal(monitoring.enabled, true);
  assert.equal(monitoring.setup(app), true);
  monitoring.capture(new Error("boom"));
  assert.equal(config.dsn, "https://public@example.invalid/1");
  assert.equal(config.tracesSampleRate, 0.1);
  assert.equal(config.sendDefaultPii, false);
  assert.equal(config.environment, "test");
  assert.deepEqual(calls, [app, "boom"]);
  const names = config
    .integrations([{ name: "Replay" }, { name: "Http" }, { name: "Express" }])
    .map((integration) => integration.name);
  assert.deepEqual(names, ["Http", "Express"]);
});
