import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vendorA = "Sen" + "try";
const vendorB = "Post" + "Hog";
const restrictedDemonym = ["Niger", "ian"].join("");
const vendorPattern = new RegExp(`\\b(${vendorA}|${vendorB})\\b`, "i");
const demonymPattern = new RegExp(`\\b${restrictedDemonym}\\b`, "i");
const secretPattern = /(ingest\.sentry\.io|\bphc_[A-Za-z0-9]{6,})/i;
const skipDirectories = new Set(["node_modules", ".git", "dist", "coverage"]);
const proseExtensions = new Set([".md", ".html", ".jsx", ".yml", ".yaml", ".example"]);

function walk(directory, files = []) {
  for (const entry of readdirSync(directory)) {
    if (skipDirectories.has(entry)) continue;
    const fullPath = path.join(directory, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      walk(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function commentsIn(source) {
  const withoutStrings = source
    .replace(/`(?:\\.|[^`\\])*`/g, "''")
    .replace(/'(?:\\.|[^'\\])*'/g, "''")
    .replace(/"(?:\\.|[^"\\])*"/g, '""');
  return withoutStrings.match(/\/\*[\s\S]*?\*\/|\/\/.*$/gm) ?? [];
}

test("public text uses neutral monitoring and analytics wording", () => {
  const failures = [];
  for (const fullPath of walk(root)) {
    const relativePath = path.relative(root, fullPath);
    if (relativePath === "package-lock.json" || relativePath === "package.json") continue;
    const extension = path.extname(relativePath);
    if (![".md", ".js", ".jsx", ".html", ".yml", ".yaml", ".example", ".txt"].includes(extension) && relativePath !== ".env.example" && relativePath !== ".gitignore") {
      continue;
    }
    const text = readFileSync(fullPath, "utf8");
    if (demonymPattern.test(text) || secretPattern.test(text)) {
      failures.push(relativePath);
      continue;
    }
    const prose = proseExtensions.has(extension) || relativePath === ".env.example" || relativePath.startsWith(".github/");
    if (prose && vendorPattern.test(text)) {
      failures.push(relativePath);
      continue;
    }
    if (extension === ".js" && commentsIn(text).some((comment) => vendorPattern.test(comment))) {
      failures.push(relativePath);
    }
  }
  assert.deepEqual(failures, []);
});

test("environment example keeps blank placeholders", () => {
  const contents = readFileSync(path.join(root, ".env.example"), "utf8");
  const invalid = contents
    .split("\n")
    .filter((line) => !/^\s*(#.*|[A-Z0-9_]+=\s*)?$/.test(line));
  assert.deepEqual(invalid, []);
  for (const name of ["SENTRY_DSN=", "VITE_SENTRY_DSN=", "POSTHOG_KEY=", "POSTHOG_HOST=", "VITE_POSTHOG_KEY=", "VITE_POSTHOG_HOST="]) {
    assert.equal(contents.includes(name), true, name);
  }
});

test("readme keeps the public repository markers", () => {
  const readme = readFileSync(path.join(root, "README.md"), "utf8");
  assert.equal(readme.includes("https://www.vlixxo.com"), true);
  assert.equal(readme.includes("production source"), true);
});

test("modules stay quiet when configuration is missing", () => {
  const script = `
    const logs = [];
    for (const method of ["log", "info", "warn", "error", "debug"]) {
      console[method] = (...args) => logs.push(args.map(String).join(" "));
    }
    await import("./server/index.js");
    await import("./storefront/src/errorMonitoring.js");
    await import("./storefront/src/analytics.js");
    if (logs.length) {
      console.error(logs.join("\\n"));
      process.exit(1);
    }
  `;
  const env = { ...process.env };
  for (const name of ["SENTRY_DSN", "VITE_SENTRY_DSN", "POSTHOG_KEY", "POSTHOG_HOST", "VITE_POSTHOG_KEY", "VITE_POSTHOG_HOST"]) {
    delete env[name];
  }
  const result = spawnSync(process.execPath, ["--input-type=module", "--eval", script], {
    cwd: root,
    env,
    encoding: "utf8",
    timeout: 20000,
  });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "");
});
