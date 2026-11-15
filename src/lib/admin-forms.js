import { html, raw } from "./dom.js";
import { AXES, MOMENTEN } from "./taste.mjs";
import { validateProduct, validateEvent, validateStory, validateGift, validatePick } from "./validate.mjs";

const slug = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
const SOORT_EV = [["proeverij", "Proeverij"], ["evenement", "Evenement"], ["nieuws", "Nieuws"]];

// Veldspecificaties per soort: { k, label, type, opties, hint, nieuwAlleen }
export const SPECS = (app) => {
  const cats = app.categories().map((c) => [c.id, c.label]);
  const prods = app.products.map((p) => [p.id, p.naam]);
  return {
    product: [
      { k: "id", label: "Id (kleine letters en streepjes)", type: "text", nieuwAlleen: true, hint: "Wordt afgeleid van de naam als je het leeg laat." },
      { k: "naam", label: "Naam", type: "text" }, { k: "stijl", label: "Stijl", type: "text" },
      { k: "categorie", label: "Categorie", type: "select", opties: cats },
      { k: "herkomst", label: "Herkomst", type: "text" }, { k: "inhoud", label: "Inhoud (bijv. 70 cl)", type: "text" }, { k: "alcohol", label: "Alcohol (bijv. 40%)", type: "text" },
      ...AXES.map((a) => ({ k: `smaak.${a.key}`, label: `${a.low} tot ${a.high} (0 tot 100)`, type: "range" })),
      { k: "smaakwoorden", label: "Smaakwoorden (met komma's)", type: "list" },
      { k: "momenten", label: "Serveermomenten", type: "multi", opties: MOMENTEN.map((m) => [m.id, m.label]) },
      { k: "verhaal", label: "Verhaal", type: "textarea" }, { k: "serveer", label: "Serveertip", type: "textarea" },
      ...(app.config.prijzenBevestigd ? [{ k: "prijs", label: "Prijs in euro", type: "number" }] : []),
      { k: "_foto", label: "Foto (webp, png of jpeg)", type: "file" },
      { k: "_credit", label: "Bron en rechten van de foto", type: "text", hint: "Verplicht bij een nieuwe foto." },
    ],
    pick: [
      { k: "productId", label: "Fles", type: "select", opties: prods }, { k: "titel", label: "Titel", type: "text" }, { k: "intro", label: "Inleiding", type: "textarea" },
      { k: "waaromDezeFles", label: "Waarom deze fles", type: "textarea" }, { k: "proefnotitie", label: "Proefnotitie (een regel per punt)", type: "lines" },
      { k: "achtergrond", label: "Achtergrond", type: "textarea" }, { k: "tip", label: "Serveertip", type: "textarea" }, { k: "periode", label: "Periode (bijv. november)", type: "text" },
      { k: "video", label: "Video (bestand in public/ of https-adres, leeg laten voor geen video)", type: "text" }, { k: "meerInfoUrl", label: "Meer-info-link (https)", type: "text" },
      { k: "bevestigd", label: "Bevestigd door De Gouden Kurk", type: "checkbox" },
    ],
    event: [
      { k: "titel", label: "Titel", type: "text" }, { k: "soort", label: "Soort", type: "select", opties: SOORT_EV }, { k: "tekst", label: "Omschrijving", type: "textarea" },
      { k: "datum", label: "Datum", type: "date" }, { k: "tijd", label: "Tijd (bijv. 19:30)", type: "text" }, { k: "plaatsen", label: "Aantal plaatsen", type: "number" },
      { k: "bevestigd", label: "Bevestigd (pas dan zichtbaar in de app)", type: "checkbox" },
    ],
    story: [
      { k: "titel", label: "Titel", type: "text" }, { k: "soort", label: "Soort", type: "select", opties: [["weetje", "Weetje"], ["uitleg", "Uitleg"], ["nieuws", "Winkelnieuws"]] },
      { k: "tekst", label: "Tekst", type: "textarea" }, { k: "status", label: "Status", type: "select", opties: [["concept", "Concept"], ["gepubliceerd", "Gepubliceerd"]] },
      { k: "producten", label: "Gekoppelde flessen", type: "multi", opties: prods },
    ],
    gift: [
      { k: "titel", label: "Titel", type: "text" }, { k: "tekst", label: "Toelichting", type: "textarea" }, { k: "producten", label: "Flessen in dit idee", type: "multi", opties: prods },
      { k: "voor", label: "Voor wie", type: "multi", opties: app.data.gifts.voor.map((x) => [x.id, x.label]) },
      { k: "gelegenheid", label: "Gelegenheid", type: "multi", opties: app.data.gifts.gelegenheden.map((x) => [x.id, x.label]) },
      { k: "stijl", label: "Stijl", type: "multi", opties: app.data.gifts.stijlen.map((x) => [x.id, x.label]) },
    ],
  };
};

export const get = (o, k) => k.split(".").reduce((a, p) => (a == null ? a : a[p]), o);
const set = (o, k, v) => { const ps = k.split("."); let t = o; ps.slice(0, -1).forEach((p) => (t = t[p] ??= {})); t[ps.at(-1)] = v; };

export function fieldHtml(f, vals, errs, isNew) {
  if (f.nieuwAlleen && !isNew) return "";
  const id = `f-${f.k.replace(".", "-")}`, v = get(vals, f.k), err = errs[f.k.split(".")[0]] || errs[f.k], d = err ? `${id}-e` : (f.hint ? `${id}-h` : "");
  const aria = `${err ? 'aria-invalid="true"' : ""} ${d ? `aria-describedby="${d}"` : ""}`;
  const tail = html`${f.hint ? html`<span class="field__hint" id="${id}-h">${f.hint}</span>` : ""}${err ? html`<span class="field__error" id="${id}-e" role="alert">${err}</span>` : ""}`;
  if (f.type === "textarea") return html`<div class="field"><label for="${id}">${f.label}</label><textarea class="textarea" id="${id}" name="${f.k}" ${raw(aria)}>${v ?? ""}</textarea>${tail}</div>`;
  if (f.type === "select") return html`<div class="field"><label for="${id}">${f.label}</label><select class="select" id="${id}" name="${f.k}" ${raw(aria)}>${f.k === "categorie" || f.k === "productId" ? html`<option value="">Kies…</option>` : ""}${f.opties.map(([o, l]) => html`<option value="${o}" ${o === v ? "selected" : ""}>${l}</option>`)}</select>${tail}</div>`;
  if (f.type === "checkbox") return html`<label class="row switch"><input type="checkbox" name="${f.k}" ${v ? "checked" : ""}><span>${f.label}</span></label>`;
  if (f.type === "multi") return html`<fieldset class="fieldset"><legend class="label">${f.label}</legend><div class="chips">${f.opties.map(([o, l]) => html`<label class="chip check"><input type="checkbox" name="${f.k}" value="${o}" ${(v || []).includes(o) ? "checked" : ""}><span>${l}</span></label>`)}</div>${tail}</fieldset>`;
  if (f.type === "range") return html`<div class="field"><label for="${id}">${f.label}</label><input class="range" id="${id}" type="range" min="0" max="100" name="${f.k}" value="${Math.round((v ?? 0.5) * 100)}"></div>`;
  if (f.type === "file") return html`<div class="field"><label for="${id}">${f.label}</label><input class="input" id="${id}" type="file" name="${f.k}" accept="image/webp,image/png,image/jpeg" ${raw(aria)}>${tail}</div>`;
  const val = f.type === "list" ? (v || []).join(", ") : f.type === "lines" ? (v || []).join("\n") : v ?? "";
  if (f.type === "lines") return html`<div class="field"><label for="${id}">${f.label}</label><textarea class="textarea" id="${id}" name="${f.k}">${val}</textarea>${tail}</div>`;
  return html`<div class="field"><label for="${id}">${f.label}</label><input class="input" id="${id}" name="${f.k}" type="${f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}" ${f.type === "number" ? 'step="any" min="0"' : ""} value="${val}" ${raw(aria)}>${tail}</div>`;
}

// Leest het formulier terug naar een object volgens de spec.
export function readForm(form, spec, base) {
  const out = structuredClone(base || {});
  for (const f of spec) {
    if (f.k.startsWith("_") || (f.nieuwAlleen && base?.id)) continue;
    const els = [...form.elements].filter((e) => e.name === f.k);
    if (!els.length) continue;
    if (f.type === "multi") set(out, f.k, els.filter((e) => e.checked).map((e) => e.value));
    else if (f.type === "checkbox") set(out, f.k, els[0].checked);
    else if (f.type === "range") set(out, f.k, Number(els[0].value) / 100);
    else if (f.type === "number") set(out, f.k, els[0].value === "" ? null : Number(els[0].value));
    else if (f.type === "list") set(out, f.k, els[0].value.split(",").map((s) => s.trim()).filter(Boolean));
    else if (f.type === "lines") set(out, f.k, els[0].value.split("\n").map((s) => s.trim()).filter(Boolean));
    else { const t = els[0].value.trim(); set(out, f.k, t === "" && ["datum", "tijd", "periode", "video", "meerInfoUrl", "alcohol"].includes(f.k) ? null : t); }
  }
  return out;
}

export const validators = { product: validateProduct, event: validateEvent, story: validateStory, gift: validateGift, pick: validatePick };
export { slug };
