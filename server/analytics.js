import { PostHog } from "posthog-node";

export const DEFAULT_ANALYTICS_HOST = "https://us.i.posthog.com";

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function createProductAnalytics({ key, host, clientFactory } = {}) {
  const token = clean(key);
  if (!token) {
    return {
      enabled: false,
      capture() {},
      async shutdown() {},
    };
  }

  const apiHost = clean(host) || DEFAULT_ANALYTICS_HOST;
  const client = clientFactory
    ? clientFactory(token, { host: apiHost })
    : new PostHog(token, { host: apiHost });

  return {
    enabled: true,
    capture(distinctId, event, properties) {
      const id = clean(distinctId);
      const name = clean(event);
      if (!id || !name) return;
      client.capture({ distinctId: id, event: name, properties });
    },
    async shutdown() {
      if (typeof client.shutdown === "function") {
        await client.shutdown();
      }
    },
  };
}

const productAnalytics = createProductAnalytics({
  key: process.env.POSTHOG_KEY,
  host: process.env.POSTHOG_HOST,
});

export function captureProductEvent(distinctId, event, properties) {
  productAnalytics.capture(distinctId, event, properties);
}

export function shutdownProductAnalytics() {
  return productAnalytics.shutdown();
}
