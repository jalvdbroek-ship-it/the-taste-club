import { html, $, toast } from "../lib/dom.js";
import { icon } from "../components/icons.js";
import { productImg, priceLine, productCard, bindFavs } from "../components/product-card.js";
import { bars, placeBars } from "../components/radar.js";
import { MOMENTEN, matchScore, AXES } from "../lib/taste.mjs";
import { noteForm, bindNoteForms, stars } from "../lib/notes-ui.js";

const notesList = (app, id) => {
  const n = app.collection.notesFor(id);
  return n.length ? html`<ul class="list">${n.map((x) => html`<li class="card"><div class="row"><span class="num muted small">${x.datum}</span><span aria-label="${x.beoordeling ? x.beoordeling + " van 5" : ""}">${stars(x.beoordeling)}</span></div><p>${x.tekst}</p>
    <button class="btn btn--quiet btn--sm" type="button" data-del-note="${x.id}">${icon("trash")} Verwijder</button></li>`)}</ul>` : html`<p class="muted small">Nog geen notities bij deze fles.</p>`;
};

export default {
  title: (app, id) => app.product(id)?.naam || "Product",
  render(app, id) {
    const p = app.product(id);
    if (!p) return html`<section class="screen"><h1 tabindex="-1">Niet gevonden</h1><p class="muted">Dit product bestaat niet (meer).</p><a class="btn" href="#/producten">Naar alle flessen</a></section>`;
    const c = app.collection, cr = p.credit;
    const like = app.products.filter((x) => x.id !== p.id).map((x) => ({ x, d: -AXES.reduce((s, a) => s + Math.abs(x.smaak[a.key] - p.smaak[a.key]), 0) })).sort((a, b) => b.d - a.d).slice(0, 2).map((o) => o.x);
    const price = priceLine(app, p);
    return html`<article class="screen product">
      <div class="stage stage--hero fill-in parallax" data-reveal><span class="fill">${productImg(p, "eager")}</span></div>
      <header class="screen-head"><span class="pcard__cat">${p.categorieLabel} · ${p.herkomst}</span><h1>${p.naam}</h1><span class="thread" aria-hidden="true"></span><p class="lead">${p.stijl}</p>
        <p class="muted num">${p.inhoud} · ${p.alcohol}${price ? html` · <strong>${price}</strong>` : ""}</p></header>
      <div class="row">
        <button class="btn btn--ghost" type="button" data-fav="${p.id}" aria-pressed="${c.isFav(p.id)}">${icon("heart")} <span data-fav-t>${c.isFav(p.id) ? "In favorieten" : "Favoriet"}</span></button>
        <button class="btn btn--quiet" type="button" data-cmp="${p.id}" aria-pressed="${c.inCompare(p.id)}">${icon("compare")} <span data-cmp-t>${c.inCompare(p.id) ? "In vergelijking" : "Vergelijk"}</span></button>
      </div>
      ${price ? "" : html`<div class="demo-note">${icon("info")}<p>Prijs en voorraad staan er niet bij: die bevestigt De Gouden Kurk zelf. Vraag ernaar aan de toonbank of bel <a class="link" href="${app.config.winkel.telefoonLink}">${app.config.winkel.telefoon}</a>.</p></div>`}
      <section class="sect" aria-labelledby="h-smaak"><h2 id="h-smaak">Smaak<em>profiel</em></h2>${bars(p.smaak)}<div class="chips">${p.smaakwoorden.map((w) => html`<span class="tag tag--muted">${w}</span>`)}</div></section>
      <section class="sect" aria-labelledby="h-verhaal"><h2 id="h-verhaal">Het <em>verhaal</em></h2><p>${p.verhaal}</p>${p.bron === "concept" ? html`<p class="small muted"><span class="tag tag--muted">Concept</span> Redactionele tekst, nog niet bevestigd door De Gouden Kurk.</p>` : ""}</section>
      <section class="sect" aria-labelledby="h-serv"><h2 id="h-serv">Serveer<em>tip</em></h2><p>${p.serveer}</p>
        <div class="chips">${(p.momenten || []).map((m) => html`<span class="tag">${MOMENTEN.find((x) => x.id === m)?.label || m}</span>`)}</div><p class="small muted">Eén klein glas, rustig tempo. Alleen 18+.</p></section>
      <section class="sect" aria-labelledby="h-not"><h2 id="h-not">Mijn <em>proefnotities</em></h2><div id="notes">${notesList(app, p.id)}</div><details class="story"><summary><h3>Nieuwe notitie</h3></summary>${noteForm(p.id)}</details></section>
      ${like.length ? html`<section class="sect" aria-labelledby="h-like"><h2 id="h-like">Ook <em>ontdekken</em></h2><div class="pgrid">${like.map((x) => productCard(app, x))}</div></section>` : ""}
      <p class="credit">Foto: ${[cr.title, cr.creator].filter(Boolean).join(", ")}${cr.sourceUrl ? html`, <a href="${cr.sourceUrl}" rel="noopener noreferrer">${cr.license}</a>` : cr.license ? `, ${cr.license}` : ""}. ${cr.changes ? `Bewerkt: ${cr.changes}.` : ""}</p>
    </article>`;
  },
  mount(view, app, id) {
    const un = [bindFavs(view, app)];
    view.addEventListener("favchange", (e) => { if (e.detail.id === id) $("[data-fav-t]", view).textContent = e.detail.on ? "In favorieten" : "Favoriet"; });
    const cmp = (e) => {
      const b = e.target.closest("[data-cmp]"); if (!b) return;
      const ok = app.collection.toggleCompare(id);
      if (!ok) return toast("Je kunt maximaal drie flessen vergelijken.");
      const on = app.collection.inCompare(id);
      b.setAttribute("aria-pressed", String(on)); $("[data-cmp-t]", b).textContent = on ? "In vergelijking" : "Vergelijk";
      toast(on ? `In vergelijking (${app.collection.state.vergelijk.length} van 3). Bekijk in je collectie.` : "Uit de vergelijking gehaald");
    };
    const del = (e) => { const b = e.target.closest("[data-del-note]"); if (!b) return; app.collection.removeNote(b.dataset.delNote); $("#notes", view).innerHTML = notesList(app, id).s; toast("Notitie verwijderd"); };
    view.addEventListener("click", cmp); view.addEventListener("click", del);
    un.push(bindNoteForms(view, app, () => { $("#notes", view).innerHTML = notesList(app, id).s; const f = $("[data-note-form]", view); f.reset(); f.querySelectorAll("[data-rate]").forEach((b) => b.setAttribute("aria-checked", "false")); }));
    placeBars(view);
    return () => { un.forEach((f) => f()); view.removeEventListener("click", cmp); view.removeEventListener("click", del); };
  },
};
