// Maakt het deelbeeld (og:image, 1200×630) met een verse schermafbeelding van het beginscherm.
// Run met de app aan (npm start): node tools/maak-deelbeeld.mjs   (of zet BASE)
import { writeFileSync, rmSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadPlaywright } from "./browser.mjs";

const BASE = process.env.BASE || "http://localhost:4300/";
const { chromium } = await loadPlaywright();
const browser = await chromium.launch({ args: ["--allow-file-access-from-files"] });
const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
await phone.addInitScript(() => { sessionStorage.setItem("tc.leeftijd18", "ja"); sessionStorage.setItem("tc.intro", "1"); });
await phone.goto(BASE, { waitUntil: "networkidle" });
await phone.waitForSelector("#view h1");
await phone.waitForTimeout(800);
const home = `data:image/png;base64,${(await phone.screenshot({ type: "png" })).toString("base64")}`;
await phone.close();

const tmp = fileURLToPath(new URL("../public/img/.deelbeeld.html", import.meta.url));
writeFileSync(tmp, `<!doctype html><meta charset="utf-8"><style>
@font-face { font-family: B; src: url("../fonts/bodoni-moda-latin.woff2"); }
@font-face { font-family: S; src: url("../fonts/instrument-sans-latin.woff2"); }
@font-face { font-family: C; src: url("../fonts/cormorant-italic-latin.woff2"); font-style: italic; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; background: radial-gradient(60% 80% at 75% 40%, #4a1419, #2a0d10 60%, #12090a); color: #f6f1e8; font-family: S, sans-serif; position: relative; }
.t { position: absolute; left: 80px; top: 110px; width: 600px; display: grid; gap: 22px; }
.k { font: 600 18px/1 S; letter-spacing: .22em; text-transform: uppercase; color: #d9b468; }
h1 { font: 400 84px/1 B, serif; text-transform: uppercase; }
h1 em { display: block; font: italic 400 52px/1.1 C, serif; text-transform: none; color: #d9b468; }
p { font-size: 25px; line-height: 1.45; color: #e2d4c3; }
.n { position: absolute; left: 80px; bottom: 52px; display: flex; align-items: center; gap: 16px; font-size: 19px; }
.n img { height: 40px; }
.ph { position: absolute; right: 120px; top: 50px; width: 300px; padding: 10px; border: 1.5px solid rgba(217,180,104,.55); border-radius: 44px; background: #050404; box-shadow: 0 40px 80px -20px rgba(0,0,0,.8); }
.ph img { display: block; width: 100%; height: 590px; object-fit: cover; object-position: top; border-radius: 34px; }
</style><div class="t"><span class="k">De Gouden Kurk · Rozenburg</span><h1>The Taste Club<em>by De Gouden Kurk</em></h1><p>Ontdek je smaak, kies een cadeau en bewaar wat je proeft. Een demo-app, alles blijft op je eigen telefoon.</p></div>
<div class="n"><img src="nix18/nix18-wit.png" alt="">Alleen 18+. Geniet, maar drink met mate.</div>
<div class="ph"><img src="${home}" alt=""></div>`);
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(pathToFileURL(tmp).href, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
writeFileSync(new URL("../public/img/deelbeeld.jpg", import.meta.url), await page.screenshot({ type: "jpeg", quality: 86 }));
await browser.close();
rmSync(tmp);
console.log("deelbeeld klaar: public/img/deelbeeld.jpg");
