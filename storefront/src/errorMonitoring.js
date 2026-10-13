import { Component, createElement } from "react";

const TRACE_SAMPLE_RATE = 0.1;

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function readStorefrontDsn() {
  if (!import.meta.env) return undefined;
  return import.meta.env.VITE_SENTRY_DSN;
}

class LocalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? createElement("p", null, "Something went wrong.");
    }
    return this.props.children;
  }
}

function withoutReplay(defaults) {
  return defaults.filter((integration) => !/replay/i.test(integration?.name ?? ""));
}

let activeBoundary = LocalErrorBoundary;
let activeClient = null;

export function getErrorBoundary() {
  return activeBoundary;
}

export function captureException(error, context) {
  if (!activeClient || typeof activeClient.captureException !== "function") return;
  activeClient.captureException(error, context);
}

export async function initErrorMonitoring(options = {}) {
  const dsn = clean(options.dsn !== undefined ? options.dsn : readStorefrontDsn());
  if (!dsn) {
    return { enabled: false, boundary: LocalErrorBoundary };
  }

  const sentry = options.sentry ?? (await import("@sentry/react"));
  sentry.init({
    dsn,
    tracesSampleRate: TRACE_SAMPLE_RATE,
    sendDefaultPii: false,
    integrations(defaults) {
      const kept = withoutReplay(defaults);
      if (
        typeof sentry.browserTracingIntegration === "function" &&
        !kept.some((integration) => integration?.name === "BrowserTracing")
      ) {
        kept.push(sentry.browserTracingIntegration());
      }
      return kept;
    },
  });

  activeClient = sentry;
  activeBoundary = sentry.ErrorBoundary ?? LocalErrorBoundary;
  return { enabled: true, boundary: activeBoundary };
}
