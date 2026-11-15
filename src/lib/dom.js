// Kleine template-helper: waarden worden standaard ge-escaped, alleen raw() en geneste html`` niet.
const MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => MAP[c]);

export class Raw { constructor(s) { this.s = s; } toString() { return this.s; } }
export const raw = (s) => new Raw(s);
const val = (v) => (v instanceof Raw ? v.s : Array.isArray(v) ? v.map(val).join("") : v == null || v === false ? "" : esc(v));
export const html = (strings, ...vals) => new Raw(strings.reduce((out, s, i) => out + s + (i < vals.length ? val(vals[i]) : ""), ""));

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const reducedMotion = () => document.documentElement.classList.contains("rm") || matchMedia("(prefers-reduced-motion: reduce)").matches;

let toastTimer;
export function toast(text) {
  document.querySelector(".toast")?.remove();
  const t = document.createElement("div");
  t.className = "toast"; t.setAttribute("role", "status"); t.textContent = text;
  document.body.append(t);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.remove(), 3200);
}

// Zet per element een animatievolgorde (CSP staat geen style-attributen in HTML toe, wel via CSSOM).
export function stagger(root, sel = "[data-reveal]", step = 70) {
  [...root.querySelectorAll(sel)].forEach((el, i) => el.style.setProperty("--i", String(Math.min(i, 12) * step)));
}

// Bevestigingsdialoog (native <dialog>); geeft true/false terug.
export function confirmDialog({ title, text, ok = "Bevestig", cancel = "Annuleer", danger = false }) {
  return new Promise((resolve) => {
    const d = document.createElement("dialog");
    d.className = "sheet"; d.setAttribute("aria-labelledby", "cd-t");
    d.innerHTML = html`<div class="sheet__body"><h2 id="cd-t">${title}</h2><p class="muted">${text}</p>
      <div class="sheet__actions"><button class="btn btn--quiet" data-no type="button">${cancel}</button><button class="btn ${danger ? "btn--danger" : ""}" data-yes type="button">${ok}</button></div></div>`.s;
    document.body.append(d);
    const done = (v) => { d.close(); d.remove(); resolve(v); };
    d.querySelector("[data-no]").addEventListener("click", () => done(false));
    d.querySelector("[data-yes]").addEventListener("click", () => done(true));
    d.addEventListener("cancel", (e) => { e.preventDefault(); done(false); });
    d.showModal();
    d.querySelector("[data-no]").focus();
  });
}
