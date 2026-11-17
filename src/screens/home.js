import { html, raw } from "../lib/dom.js";
import { icon } from "../components/icons.js";
import { MARK } from "../components/shell.js";
import { productImg } from "../components/product-card.js";
import { visibleEvents, formatDate } from "../lib/events.mjs";
import { AXES } from "../lib/taste.mjs";
import { radar } from "../components/radar.js";

const giftCard = (app, g) => {
  const items = g.producten.map((id) => app.product(id)).filter(Boolean);
  return html`<a class="gift-card" href="#/cadeau" data-reveal><div class="gift-card__imgs">${items.map((p) => productImg(p))}</div><h3>${g.titel}</h3><p class="muted small">${g.tekst}</p></a>`;
};

export default {
  title: "",
  render(app) {
    const d = app.data, pick = d.pick, pp = app.product(pick.productId);
    const stories = d.stories.items.filter((s) => s.status === "gepubliceerd" && s.soort !== "nieuws").slice(0, 3);
    const events = visibleEvents(d.events.items);
    const c = app.collection.state;
    return html`<div class="screen">
      <section class="hero" aria-labelledby="h-welkom">
        <div class="hero__text">
          <h1 id="h-welkom" data-reveal>Welkom bij <em>The Taste Club</em></h1>
          <span class="thread" aria-hidden="true"></span>
          <p class="lead" data-reveal>Een kleine club voor wie wil weten wat er in het glas zit. Ontdek je smaak, vind een cadeau, bewaar wat je proeft.</p>
          <div class="row" data-reveal><a class="btn" href="#/smaak">Ontdek jouw smaak ${icon("arrow")}</a><a class="btn btn--ghost" href="#/cadeau">Zoek een cadeau</a></div>
        </div>
        <div class="hero__art" aria-hidden="true" data-reveal>${raw(MARK)}</div>
      </section>

      <div class="demo-note" data-reveal>${icon("info")}<p>Dit is een demo. Het assortiment is een voorbeeld en er wordt niets verkocht. Prijzen en voorraad staan er bewust niet in: die bevestigt De Gouden Kurk zelf. Nieuw hier? Volg de <a class="link" href="#/rondleiding">korte rondleiding</a>.</p></div>

      ${pp ? html`<section class="sect scroll-in" aria-labelledby="h-pick"><div class="sect__head"><h2 id="h-pick">The <em>Golden</em> Pick</h2><a class="link" href="#/pick">Lees meer</a></div>
        <a class="pick-card" href="#/pick"><div class="stage parallax">${productImg(pp, "eager")}</div>
          <div class="pick-card__body"><span class="tag">${pick.bevestigd ? "Deze periode" : "Voorbeeld-selectie"}</span><h3>${pp.naam}</h3><p class="lead">${pick.titel}</p><p class="muted">${pick.intro}</p></div></a></section>` : ""}

      <section class="sect scroll-in" aria-labelledby="h-smaak"><h2 id="h-smaak">Ontdek jouw <em>smaak</em></h2>
        <div class="card taste-teaser">
          ${c.profiel ? html`<p class="muted">Je profiel van ${c.profiel.datum || "eerder"}:</p>${radar(c.profiel)}<a class="btn btn--ghost" href="#/smaak">Opnieuw proeven</a>`
            : html`<p>Zes korte vragen, geen goed of fout. Je krijgt een smaakprofiel en flessen uit de winkel die erbij passen. Ontdekken, niet meer drinken.</p>
            <div class="taste-teaser__axes">${AXES.map((a) => html`<span>${a.low} of ${a.high.toLowerCase()}</span>`)}</div><a class="btn" href="#/smaak">Begin de Taste Finder</a>`}
        </div></section>

      <section class="sect scroll-in" aria-labelledby="h-cadeau"><div class="sect__head"><h2 id="h-cadeau">Cadeau-<em>inspiratie</em></h2><a class="link" href="#/cadeau">Cadeau-hulp</a></div>
        <div class="hscroll">${d.gifts.ideeen.slice(0, 4).map((g) => giftCard(app, g))}</div></section>

      <section class="sect scroll-in" aria-labelledby="h-verhalen"><div class="sect__head"><h2 id="h-verhalen">Nieuwe <em>verhalen</em></h2><a class="link" href="#/club">Alle verhalen</a></div>
        <div>${stories.map((s) => html`<details class="story"><summary><span class="tag tag--muted">${s.soort}</span><h3>${s.titel}</h3></summary><p class="story__body">${s.tekst}</p></details>`)}</div></section>

      <section class="sect scroll-in" aria-labelledby="h-events"><div class="sect__head"><h2 id="h-events">Aankomende <em>evenementen</em></h2><a class="link" href="#/club">Club en events</a></div>
        ${events.length ? html`<div class="list">${events.slice(0, 2).map((e) => html`<a class="card card--gold" href="#/club"><span class="tag">${e.soort}</span><h3>${e.titel}</h3><p class="muted">${formatDate(e.datum)}</p></a>`)}</div>`
          : html`<div class="empty">${icon("calendar")}<p>Er is nog geen proeverij of evenement bevestigd. Vraag het aan de toonbank of bel ${app.config.winkel.telefoon}.</p></div>`}</section>

      <section class="sect scroll-in" aria-labelledby="h-coll"><h2 id="h-coll">Jouw <em>collectie</em></h2>
        <a class="card card--gold" href="#/collectie"><div class="stat-line"><div><strong class="num">${c.favorieten.length}</strong><span>favorieten</span></div><div><strong class="num">${c.notities.length}</strong><span>proefnotities</span></div><div><strong class="num">${c.cadeaus.length}</strong><span>cadeau-ideeen</span></div></div>
        <p class="muted small">Alles blijft op dit apparaat. Niets wordt verstuurd.</p></a></section>
    </div>`;
  },
};
