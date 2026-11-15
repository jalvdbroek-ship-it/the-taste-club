import { html, $ } from "../lib/dom.js";
import { icon } from "../components/icons.js";
import { productImg, bindFavs } from "../components/product-card.js";
import { radar, bars, placeBars } from "../components/radar.js";

export default {
  title: "The Golden Pick",
  render(app) {
    const k = app.data.pick, p = app.product(k.productId);
    if (!p) return html`<section class="screen"><h1 tabindex="-1">The Golden Pick</h1><div class="empty">${icon("star")}<p>Er is nog geen Golden Pick gekozen.</p></div></section>`;
    return html`<article class="screen pick">
      <div class="stage stage--hero fill-in parallax" data-reveal><span class="fill">${productImg(p, "eager")}</span></div>
      <header class="screen-head"><div class="row"><span class="tag">The Golden Pick</span>${k.bevestigd ? "" : html`<span class="tag tag--muted">Voorbeeld-selectie, nog niet bevestigd</span>`}${k.periode ? html`<span class="tag tag--muted">${k.periode}</span>` : ""}</div>
        <h1>${k.titel}</h1><span class="thread" aria-hidden="true"></span><p class="lead">${p.naam}</p><p class="muted">${k.intro}</p></header>
      <div class="pick__cols">
        <div class="pick__main">
          <section class="sect"><h2>Waarom <em>deze fles</em></h2><p>${k.waaromDezeFles}</p></section>
          <section class="sect"><h2>Proef<em>notitie</em></h2><ul class="notes-list">${(k.proefnotitie || []).map((n) => html`<li>${n}</li>`)}</ul></section>
          <section class="sect"><h2>Achter<em>grond</em></h2><p>${k.achtergrond}</p><p class="small muted"><span class="tag tag--muted">Concept</span> Redactionele tekst, nog niet bevestigd door De Gouden Kurk.</p></section>
          <section class="sect"><h2>Serveer<em>tip</em></h2><p>${k.tip}</p><p class="small muted">Eén klein glas, rustig tempo. Alleen 18+.</p></section>
          ${k.video ? html`<section class="sect"><h2>Kijk <em>mee</em></h2><video class="video" controls preload="none" src="${k.video}" aria-label="Video bij ${p.naam}"></video></section>` : ""}
        </div>
        <aside class="pick__side"><div class="card card--gold"><h3>Smaakprofiel</h3>${radar(p.smaak, { label: `Smaakprofiel ${p.naam}` })}${bars(p.smaak)}<p class="small muted num">${p.herkomst} · ${p.inhoud} · ${p.alcohol}</p></div>
          <div class="row"><a class="btn" href="#/product/${p.id}">Bekijk de fles</a><button class="btn btn--ghost" type="button" data-fav="${p.id}" aria-pressed="${app.collection.isFav(p.id)}">${icon("heart")} Favoriet</button>${k.meerInfoUrl ? html`<a class="btn btn--quiet" href="${k.meerInfoUrl}" rel="noopener noreferrer">Meer info</a>` : ""}</div>
          <p class="small muted">Geen korting, geen actie: alleen een fles om bij stil te staan.</p></aside>
      </div></article>`;
  },
  mount(view, app) { placeBars(view); return bindFavs(view, app); },
};
