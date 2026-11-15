import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { root_ as root } from "./fixtures.mjs";

const sw = readFileSync(join(root, "sw.js"), "utf8");
const core = [...sw.slice(sw.indexOf("const CORE"), sw.indexOf("];")).matchAll(/"([^"]+)"/g)].map((m) => m[1]);
const walk = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });

test("elk bestand in de offline-lijst bestaat", () => {
  for (const f of core) if (f !== "./") assert.ok(existsSync(join(root, f)), `${f} ontbreekt`);
});
test("alle app-code, data, stijlen, lettertypen en afbeeldingen staan in de offline-lijst", () => {
  const files = [...walk(join(root, "src")), ...walk(join(root, "config")), ...walk(join(root, "public"))].map((p) => relative(root, p).replaceAll("\\", "/")).filter((f) => !f.endsWith(".txt"));
  assert.deepEqual(files.filter((f) => !core.includes(f)), []);
});
test("de schil, het manifest en de startpagina zijn offline beschikbaar", () => {
  for (const f of ["index.html", "manifest.webmanifest", "src/app.js", "sw.js"].filter((f) => f !== "sw.js")) assert.ok(core.includes(f), f);
});
test("het manifest is installeerbaar: naam, start_url, scope, standalone en iconen bestaan", () => {
  const m = JSON.parse(readFileSync(join(root, "manifest.webmanifest"), "utf8"));
  assert.ok(m.name && m.short_name && m.start_url && m.scope); assert.equal(m.display, "standalone");
  assert.ok(m.icons.some((i) => i.sizes === "192x192") && m.icons.some((i) => i.sizes === "512x512") && m.icons.some((i) => i.purpose === "maskable"));
  for (const i of m.icons) assert.ok(existsSync(join(root, i.src)), i.src);
});
test("de cacheversie is gezet", () => assert.match(sw, /const VERSION = "tasteclub-v\d+"/));
