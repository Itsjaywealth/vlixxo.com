export const DEFAULT_ANALYTICS_HOST = "https://us.i.posthog.com";

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function readStorefrontKey() {
  if (!import.meta.env) return undefined;
  return import.meta.env.VITE_POSTHOG_KEY;
}

function readStorefrontHost() {
  if (!import.meta.env) return undefined;
  return import.meta.env.VITE_POSTHOG_HOST;
}

let activeClient = null;

export function captureProductEvent(event, properties) {
  if (!activeClient || typeof activeClient.capture !== "function") return;
  const name = clean(event);
  if (!name) return;
  activeClient.capture(name, properties);
}

export async function initProductAnalytics(options = {}) {
  const key = clean(options.key !== undefined ? options.key : readStorefrontKey());
  if (!key) {
    activeClient = null;
    return false;
  }

  const host = clean(options.host !== undefined ? options.host : readStorefrontHost());
  const client = options.client ?? (await import("posthog-js")).default;
  client.init(key, {
    api_host: host || DEFAULT_ANALYTICS_HOST,
    disable_session_recording: true,
    capture_pageview: true,
  });
  activeClient = client;
  return true;
}
