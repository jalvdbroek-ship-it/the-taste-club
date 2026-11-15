// WCAG 2.2 contrast voor het Taste Club-palet (OKLCH-tokens uit public/css/tokens.css). Run: node tools/contrast.mjs
import { readFileSync } from "node:fs";
const css = readFileSync(new URL("../public/css/tokens.css", import.meta.url), "utf8");
const T = {};
for (const m of css.matchAll(/--([a-z0-9-]+):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/g)) T[m[1]] = [+m[2], +m[3], +m[4]];
const clamp = (v) => Math.min(1, Math.max(0, v));
function lin([L, C, H]) {
  const h = (H * Math.PI) / 180, a = C * Math.cos(h), b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map(clamp);
}
const Y = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
const ratio = (a, b) => { const [x, y] = [Y(lin(T[a])), Y(lin(T[b]))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
// [voorgrond, achtergrond, minimum]: 4.5 voor tekst, 3 voor grote tekst, lijnen en bedieningselementen
const pairs = [
  ["ivory", "night", 4.5], ["ivory", "wine-900", 4.5], ["ivory", "wine-800", 4.5], ["ivory", "wine-700", 4.5],
  ["ivory-2", "night", 4.5], ["ivory-2", "wine-900", 4.5], ["ivory-2", "wine-800", 4.5], ["ivory-2", "wine-700", 4.5],
  ["ivory-3", "night", 4.5], ["ivory-3", "wine-900", 4.5], ["ivory-3", "wine-800", 4.5],
  ["gold", "night", 4.5], ["gold", "wine-900", 4.5], ["gold", "wine-800", 4.5], ["gold", "wine-700", 4.5],
  ["gold-dim", "night", 3], ["gold-dim", "wine-900", 3], ["gold-dim", "wine-800", 3],
  ["night", "gold", 4.5], ["wine-900", "gold", 4.5],
  ["ink", "paper", 4.5], ["ink-2", "paper", 4.5],
  ["danger", "wine-900", 4.5], ["danger", "wine-800", 4.5], ["ok", "wine-900", 4.5],
  ["amber", "wine-900", 3], ["amber", "night", 3],
  ["gold", "wine-600", 3], ["ivory", "wine-600", 4.5],
];
let fails = 0;
for (const [a, b, min] of pairs) {
  const r = ratio(a, b), ok = r >= min;
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${r.toFixed(2).padStart(6)} (min ${min})  ${a} op ${b}`);
}
console.log(fails ? `\n${fails} paar/paren onder de norm` : "\nAlle paren halen de norm");
process.exit(fails ? 1 : 0);
