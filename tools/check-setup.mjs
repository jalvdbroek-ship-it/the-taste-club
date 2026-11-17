import { mkdirSync } from "node:fs";
import { loadPlaywright } from "./browser.mjs";

export const BASE = process.env.BASE || "http://localhost:4300/";
export const state = { fails: 0, oks: 0 };
export const { chromium } = await loadPlaywright();
// taste-club.test wijst naar deze machine: zo is een niet-lokale host na te bootsen voor het beheer.
export const browser = await chromium.launch({ args: ["--host-resolver-rules=MAP taste-club.test 127.0.0.1"] });
mkdirSync("docs/screenshots", { recursive: true });

export const fail = (scope, msg) => { state.fails++; console.log(`  FOUT [${scope}] ${msg}`); };
export const ok = (scope, msg) => { state.oks++; if (process.env.VERBOSE) console.log(`  ok   [${scope}] ${msg}`); };
export const check = (cond, scope, msg) => (cond ? ok(scope, msg) : fail(scope, msg));

// Nieuw scherm met bijhouden van console-fouten (ook CSP), pagina-fouten en verzoeken buiten de eigen herkomst.
export async function fresh(w = 390, h = 844, { adult = true, intro = false, reduced = false, scale = 1 } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: scale, acceptDownloads: true, reducedMotion: reduced ? "reduce" : "no-preference", serviceWorkers: "block", permissions: ["clipboard-read", "clipboard-write"] });
  const page = await ctx.newPage();
  const issues = { console: [], external: [] };
  page.on("console", (m) => { if (m.type() === "error") issues.console.push(m.text()); });
  page.on("pageerror", (e) => issues.console.push(String(e)));
  page.on("request", (r) => { const u = r.url(); if (!u.startsWith(BASE) && !u.startsWith("data:") && !u.startsWith("blob:")) issues.external.push(u); });
  if (adult) await page.addInitScript((i) => { sessionStorage.setItem("tc.leeftijd18", "ja"); if (!i) sessionStorage.setItem("tc.intro", "1"); }, intro);
  return { ctx, page, issues };
}
export function report(issues, scope) {
  for (const m of issues.console) fail(scope, `consolefout: ${m.slice(0, 160)}`);
  for (const u of issues.external) fail(scope, `extern verzoek: ${u}`);
  if (!issues.console.length && !issues.external.length) ok(scope, "geen consolefouten en geen externe verzoeken");
  issues.console.length = 0; issues.external.length = 0;
}
export const go = async (page, route) => { await page.goto(`${BASE}#/${route}`); await page.waitForSelector("#view h1", { timeout: 8000 }); await page.waitForTimeout(150); };
export const shot = (page, name) => page.screenshot({ path: `docs/screenshots/${name}.png` });
