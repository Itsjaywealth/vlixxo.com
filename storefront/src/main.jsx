import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { initProductAnalytics } from "./analytics.js";
import { initErrorMonitoring } from "./errorMonitoring.js";

async function boot() {
  const monitoring = await initErrorMonitoring();
  await initProductAnalytics();
  const root = document.getElementById("root");
  if (!root) return;
  const Boundary = monitoring.boundary;
  createRoot(root).render(
    <StrictMode>
      <Boundary fallback={<p>Something went wrong.</p>}>
        <App />
      </Boundary>
    </StrictMode>,
  );
}

void boot();
