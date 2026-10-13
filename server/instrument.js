import * as Sentry from "@sentry/node";

const TRACE_SAMPLE_RATE = 0.1;

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function withoutReplay(defaults) {
  return defaults.filter((integration) => !/replay/i.test(integration?.name ?? ""));
}

export function configureErrorMonitoring({ dsn, sentry, environment } = {}) {
  const resolvedDsn = clean(dsn);
  if (!resolvedDsn) {
    return {
      enabled: false,
      setup() {
        return false;
      },
      capture() {},
    };
  }

  sentry.init({
    dsn: resolvedDsn,
    tracesSampleRate: TRACE_SAMPLE_RATE,
    sendDefaultPii: false,
    environment: clean(environment) || "development",
    integrations(defaults) {
      return withoutReplay(defaults);
    },
  });

  return {
    enabled: true,
    setup(app) {
      if (typeof sentry.setupExpressErrorHandler !== "function") return false;
      sentry.setupExpressErrorHandler(app);
      return true;
    },
    capture(error, context) {
      sentry.captureException(error, context);
    },
  };
}

const monitoring = configureErrorMonitoring({
  dsn: process.env.SENTRY_DSN,
  sentry: Sentry,
  environment: process.env.NODE_ENV,
});

export function setupErrorMonitoring(app) {
  return monitoring.setup(app);
}

export function captureException(error, context) {
  monitoring.capture(error, context);
}
