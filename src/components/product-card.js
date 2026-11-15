import { html, toast } from "../lib/dom.js";
import { icon } from "./icons.js";

export const productImg = (p, loading = "lazy") => html`<img src="${p.afbeelding}" width="${p.breedte || ""}" height="${p.hoogte || ""}" alt="${p.afbeeldingAlt || `Fles ${p.naam}`}" loading="${loading}" decoding="async">`;

export function priceLine(app, p) {
  return app.config.prijzenBevestigd && typeof p.prijs === "number" ? html`€ ${p.prijs.toFixed(2).replace(".", ",")}` : "";
}

export function productCard(app, p) {
  const fav = app.collection.isFav(p.id);
  return html`<article class="pcard" data-reveal>
    <a class="pcard__link" href="#/product/${p.id}"><div class="stage">${productImg(p)}</div>
      <div class="pcard__body"><span class="pcard__cat">${p.categorieLabel}</span><h3 class="pcard__name">${p.naam}</h3><span class="pcard__meta">${p.stijl}</span></div></a>
    <button class="icon-btn pcard__fav" type="button" data-fav="${p.id}" aria-pressed="${fav}" aria-label="Favoriet: ${p.naam}">${icon("heart")}</button></article>`;
}

// Eén luisteraar per scherm voor alle favorietenknoppen.
export function bindFavs(root, app) {
  const onClick = (e) => {
    const b = e.target.closest("[data-fav]");
    if (!b || !root.contains(b)) return;
    const on = app.collection.toggleFav(b.dataset.fav);
    b.setAttribute("aria-pressed", String(on));
    if (app.collection.saveFailed) toast("Opslaan lukt niet: je opslag is vol of geblokkeerd.");
    else toast(on ? "Bewaard in je collectie" : "Uit je favorieten gehaald");
    root.dispatchEvent(new CustomEvent("favchange", { detail: { id: b.dataset.fav, on } }));
  };
  root.addEventListener("click", onClick);
  return () => root.removeEventListener("click", onClick);
}
