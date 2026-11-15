import { html, raw } from "../lib/dom.js";
import { AXES } from "../lib/taste.mjs";

// Radar met vier assen (boven, rechts, onder, links). Waarde 0..1 loopt van het midden naar het uiteinde.
const C = 110, R = 72;
const pt = (i, v) => { const a = -Math.PI / 2 + (i * Math.PI) / 2; return [C + Math.cos(a) * R * v, C + Math.sin(a) * R * v]; };
const poly = (vals) => vals.map((v, i) => pt(i, v).map((n) => n.toFixed(1)).join(",")).join(" ");

export function radar(values, { second = null, label = "Smaakprofiel" } = {}) {
  const vs = AXES.map((a) => values?.[a.key] ?? 0.5);
  const ws = second ? AXES.map((a) => second[a.key] ?? 0.5) : null;
  const desc = AXES.map((a, i) => `${a.high}: ${Math.round(vs[i] * 100)} procent`).join(", ");
  const rings = [0.25, 0.5, 0.75, 1].map((r) => `<polygon class="grid" points="${poly([r, r, r, r])}"/>`).join("");
  const axes = AXES.map((_, i) => { const [x, y] = pt(i, 1); return `<line class="axis" x1="${C}" y1="${C}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`; }).join("");
  const anchors = ["middle", "start", "middle", "end"];
  const labels = AXES.map((a, i) => { const [x, y] = pt(i, 1.22); return `<text x="${x.toFixed(1)}" y="${(y + (i === 0 ? -2 : i === 2 ? 8 : 4)).toFixed(1)}" text-anchor="${anchors[i]}">${a.high}</text>`; }).join("");
  const dots = vs.map((v, i) => { const [x, y] = pt(i, v); return `<circle class="pt" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3"/>`; }).join("");
  return raw(`<svg class="radar" viewBox="0 0 220 220" role="img" aria-label="${label}. ${desc}">${rings}${axes}${ws ? `<polygon class="shape shape--b" points="${poly(ws)}" pathLength="1"/>` : ""}<polygon class="shape" points="${poly(vs)}" pathLength="1"/>${dots}${labels}</svg>`);
}

export function bars(values, second = null) {
  return html`<div class="bars">${AXES.map((a) => html`<div class="bar"><div class="bar__labels"><span>${a.low}</span><span>${a.high}</span></div>
    <div class="bar__track" role="img" aria-label="${a.low} tot ${a.high}: ${Math.round((values?.[a.key] ?? 0.5) * 100)} procent"><span class="bar__dot" data-v="${values?.[a.key] ?? 0.5}"></span>${second ? html`<span class="bar__dot bar__dot--b" data-v="${second?.[a.key] ?? 0.5}"></span>` : ""}</div></div>`)}</div>`;
}

// de positie zetten we via CSSOM omdat de CSP geen style-attributen in HTML toestaat
export function placeBars(root) {
  root.querySelectorAll(".bar__dot[data-v]").forEach((d) => d.style.setProperty("--v", d.dataset.v));
}
