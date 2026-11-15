import { html, $, toast } from "../lib/dom.js";
import { icon } from "../components/icons.js";
import { visibleEvents, canReserve, formatDate } from "../lib/events.mjs";

const eventCard = (app, e) => {
  const tel = app.config.winkel;
  const interest = app.collection.hasInterest(e.id);
  return html`<article class="card card--gold" data-reveal><div class="row"><span class="tag">${e.soort}</span>${e.datum ? html`<span class="muted small">${formatDate(e.datum)}${e.tijd ? ` · ${e.tijd}` : ""}</span>` : ""}</div>
    <h3>${e.titel}</h3><p class="muted">${e.tekst}</p>
    ${canReserve(e) ? html`<div class="row">${interest ? html`<span class="tag">Interesse bewaard</span><button class="btn btn--quiet btn--sm" type="button" data-unint="${e.id}">Haal weg</button>` : html`<button class="btn btn--sm" type="button" data-int="${e.id}">Ik heb interesse</button>`}<span class="small muted num">${e.plaatsen} plaatsen</span></div>
      ${interest ? html`<p class="small">Dit is nog géén reservering: je interesse staat alleen op dit apparaat. Bel <a class="link" href="${tel.telefoonLink}">${tel.telefoon}</a> om te bevestigen.</p>` : ""}`
      : html`<p class="small muted">Vraag naar de mogelijkheden aan de toonbank of bel <a class="link" href="${tel.telefoonLink}">${tel.telefoon}</a>.</p>`}</article>`;
};

export default {
  title: "Club en events",
  render(app) {
    const d = app.data, ev = visibleEvents(d.events.items);
    const news = d.stories.items.filter((s) => s.status === "gepubliceerd" && s.soort === "nieuws");
    const verhalen = d.stories.items.filter((s) => s.status === "gepubliceerd" && s.soort !== "nieuws");
    return html`<div class="screen"><div class="screen-head"><h1 data-reveal>Club en <em>events</em></h1><span class="thread" aria-hidden="true"></span>
      <p class="lead" data-reveal>Proeverijen, nieuws en verhalen. Alleen wat De Gouden Kurk bevestigt, staat hier als evenement.</p></div>
      <section class="sect" aria-labelledby="e-ev"><h2 id="e-ev">Evenementen en <em>proeverijen</em></h2>
        ${ev.length ? html`<div class="list" id="evlist">${ev.map((e) => eventCard(app, e))}</div>` : html`<div class="empty">${icon("calendar")}<p>Er zijn nog geen proeverijen of evenementen gepland. Zodra er iets vaststaat, zie je het hier. Vraag het aan de toonbank of bel ${app.config.winkel.telefoon}.</p><a class="btn btn--ghost btn--sm" href="${app.config.winkel.telefoonLink}">${icon("phone")} Bel de winkel</a></div>`}</section>
      ${news.length ? html`<section class="sect" aria-labelledby="e-nw"><h2 id="e-nw">Winkel<em>nieuws</em></h2>${news.map((s) => html`<article class="card"><h3>${s.titel}</h3><p class="muted">${s.tekst}</p></article>`)}</section>` : ""}
      <section class="sect" aria-labelledby="e-vh"><h2 id="e-vh">Product<em>verhalen</em></h2><div>${verhalen.map((s) => html`<details class="story"><summary><span class="tag tag--muted">${s.soort}</span><h3>${s.titel}</h3></summary><p class="story__body">${s.tekst}</p>${(s.producten || []).length ? html`<p class="small">${s.producten.map((id, i) => { const p = app.product(id); return p ? html`${i ? " · " : ""}<a class="link" href="#/product/${id}">${p.naam}</a>` : ""; })}</p>` : ""}</details>`)}</div>
        <p class="small muted">Redactionele weetjes (concept), nog niet bevestigd door De Gouden Kurk.</p></section></div>`;
  },
  mount(view, app) {
    const onClick = (e) => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.int) { app.collection.addInterest(b.dataset.int, 1); toast("Interesse bewaard op dit apparaat"); app.rerender({ focus: `[data-unint="${b.dataset.int}"]` }); }
      if (b.dataset.unint) { app.collection.removeInterest(b.dataset.unint); app.rerender({ focus: `[data-int="${b.dataset.unint}"]` }); }
    };
    view.addEventListener("click", onClick);
    return () => view.removeEventListener("click", onClick);
  },
};
