import { html, $, $$, toast } from "./dom.js";
import { NOTE_MAX } from "./collection.mjs";

// Proefnotitie-formulier (gedeeld door productdetail en collectie).
export const noteForm = (productId) => html`<form class="form note-form" data-note-form="${productId}" novalidate>
  <div class="field"><span class="label" id="nr-${productId}">Beoordeling (optioneel)</span>
    <div class="chips" role="radiogroup" aria-labelledby="nr-${productId}">${[1, 2, 3, 4, 5].map((n) => html`<button class="chip" type="button" role="radio" aria-checked="false" data-rate="${n}" aria-label="${n} van 5">${n}</button>`)}</div></div>
  <div class="field"><label for="nt-${productId}">Wat valt je op?</label><textarea class="textarea" id="nt-${productId}" maxlength="${NOTE_MAX}" aria-describedby="nh-${productId}"></textarea>
    <span class="field__hint" id="nh-${productId}">Beschrijf wat je ruikt en proeft, niet hoeveel je dronk.</span><span class="field__error" role="alert" data-err></span></div>
  <button class="btn" type="submit">Bewaar notitie</button></form>`;

export function bindNoteForms(root, app, after) {
  const onClick = (e) => {
    const r = e.target.closest("[data-rate]"); if (!r) return;
    const on = r.getAttribute("aria-checked") !== "true";
    $$("[data-rate]", r.parentElement).forEach((b) => b.setAttribute("aria-checked", "false"));
    r.setAttribute("aria-checked", String(on));
  };
  const onSubmit = (e) => {
    const f = e.target.closest("[data-note-form]"); if (!f) return;
    e.preventDefault();
    const sel = $('[data-rate][aria-checked="true"]', f);
    const res = app.collection.addNote(f.dataset.noteForm, { beoordeling: sel ? Number(sel.dataset.rate) : null, tekst: $("textarea", f).value });
    const err = $("[data-err]", f), ta = $("textarea", f);
    if (!res.ok) { err.textContent = res.fout; ta.setAttribute("aria-invalid", "true"); ta.focus(); return; }
    toast("Notitie bewaard");
    after?.(res.note);
  };
  root.addEventListener("click", onClick); root.addEventListener("submit", onSubmit);
  return () => { root.removeEventListener("click", onClick); root.removeEventListener("submit", onSubmit); };
}

export const stars = (n) => (n ? "★".repeat(n) + "☆".repeat(5 - n) : "");
