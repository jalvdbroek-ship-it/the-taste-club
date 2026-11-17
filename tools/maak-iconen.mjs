// Maakt de PWA-iconen (PNG) uit het merkteken met Playwright. Run: node tools/maak-iconen.mjs
import { writeFileSync, readFileSync } from "node:fs";
import { loadPlaywright } from "./browser.mjs";

const inner = readFileSync(new URL("../public/icons/merkteken.svg", import.meta.url), "utf8").replace(/<svg[^>]*>/, "").replace("</svg>", "").replace(/<title.*?<\/title>/, "").replace(/<rect[^>]*\/>/, "");
const icon = (size, pad, radius) => `<!doctype html><body style="margin:0;background:transparent"><svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
<rect width="64" height="64" rx="${radius}" fill="#2a0d10"/><g transform="translate(${pad} ${pad}) scale(${(64 - 2 * pad) / 64})" style="color:#d4b072">${inner}</g></svg>`;

const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
for (const [name, size, pad, radius] of [["icon-192.png", 192, 0, 14], ["icon-512.png", 512, 0, 14], ["icon-maskable-512.png", 512, 9, 0], ["apple-touch-icon.png", 180, 5, 0]]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(icon(size, pad, radius));
  writeFileSync(new URL(`../public/icons/${name}`, import.meta.url), await page.screenshot({ omitBackground: true, type: "png" }));
  await page.close();
}
await browser.close();
console.log("iconen klaar");
