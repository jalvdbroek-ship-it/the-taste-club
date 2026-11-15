// Meet bundelgrootte (gzip) en laadgedrag van de startpagina. Run: node tools/meet-bundel.mjs (server moet draaien)
import { readdirSync, readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join, extname } from "node:path";
import { loadPlaywright } from "./browser.mjs";

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const groups = { "JavaScript (src)": [/^src\/.*\.m?js$/], "CSS": [/^public\/css\//], "Data (JSON)": [/^src\/data\/|^config\//], "Lettertypen": [/\.woff2$/], "Productfoto's": [/img\/producten/], "Overig (iconen, afbeeldingen)": [/.*/] };
const rows = {};
for (const f of [...walk("src"), ...walk("config"), ...walk("public"), "index.html", "sw.js", "manifest.webmanifest"]) {
  const key = Object.keys(groups).find((k) => groups[k].some((re) => re.test(f.split("\\").join("/"))));
  const buf = readFileSync(f);
  const gz = [".js", ".mjs", ".css", ".json", ".html", ".svg", ".webmanifest"].includes(extname(f)) ? gzipSync(buf).length : buf.length;
  rows[key] ||= { n: 0, raw: 0, gz: 0 }; rows[key].n++; rows[key].raw += buf.length; rows[key].gz += gz;
}
const kb = (n) => (n / 1024).toFixed(1).padStart(7);
console.log("Groep".padEnd(34), "bestanden   ruw KB   verzonden KB");
for (const [k, v] of Object.entries(rows)) console.log(k.padEnd(34), String(v.n).padStart(6), kb(v.raw), kb(v.gz));

const { chromium } = await loadPlaywright();
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
await ctx.addInitScript(() => { sessionStorage.setItem("tc.leeftijd18", "ja"); sessionStorage.setItem("tc.intro", "1"); });
const page = await ctx.newPage();
let bytes = 0, reqs = 0;
page.on("response", async (r) => { reqs++; try { bytes += (await r.body()).length; } catch { /* redirect */ } });
await page.addInitScript(() => { window.__lcp = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true }); });
await page.goto(process.env.BASE || "http://localhost:4300/"); await page.waitForSelector("#view h1"); await page.waitForTimeout(1500);
const t = await page.evaluate(() => ({ lcp: Math.round(window.__lcp), dcl: Math.round(performance.getEntriesByType("navigation")[0].domContentLoadedEventEnd), load: Math.round(performance.getEntriesByType("navigation")[0].loadEventEnd) }));
console.log(`\nStartpagina, eerste bezoek (lokaal, geen throttling): ${reqs} verzoeken, ${(bytes / 1024).toFixed(0)} KB ruw. DOMContentLoaded ${t.dcl} ms, load ${t.load} ms, LCP ${t.lcp} ms.`);
await b.close();
