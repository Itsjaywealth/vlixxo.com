import { setupErrorMonitoring } from "./instrument.js";
import express from "express";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { shutdownProductAnalytics } from "./analytics.js";

export function createApp() {
  const app = express();
  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });
  setupErrorMonitoring(app);
  return app;
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  const absolute = path.isAbsolute(entry) ? entry : path.resolve(entry);
  return import.meta.url === pathToFileURL(absolute).href;
}

if (isDirectRun()) {
  const port = Number(process.env.PORT) || 3000;
  const server = createApp().listen(port, () => {
    const address = server.address();
    const actual = address && typeof address === "object" ? address.port : port;
    console.log(`Listening on port ${actual}`);
  });

  const shutdown = () => {
    server.close(() => {
      void shutdownProductAnalytics();
    });
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
