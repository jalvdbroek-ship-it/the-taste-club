import { html, $, $$, toast } from "../lib/dom.js";
import { icon } from "../components/icons.js";
import { AXES, MOMENTEN, buildProfile, rankProducts, matchLabel, describeProfile } from "../lib/taste.mjs";
import { radar } from "../components/radar.js";
import { productImg, bindFavs } from "../components/product-card.js";

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

export default {
  title: "Taste Finder",
  render(app) {
    const had = app.collection.state.profiel;
    return html`<div class="screen" id="taste">
      <div class="screen-head"><h1 data-reveal>Taste <em>Finder</em></h1><span class="thread" aria-hidden="true"></span>
        <p class="lead" data-reveal>Zes vragen, geen goed of fout. We zoeken geen fles om te kopen, maar een smaak om te ontdekken.</p>
        ${had ? html`<p class="small muted"><a class="link" href="#/collectie">Bekijk je opgeslagen profiel</a> of begin opnieuw.</p>` : ""}</div>
      <div id="taste-body"></div>
    </div>`;
  },
  mount(view, app) {
    const body = $("#taste-body", view);
    const answers = { categorieen: [], moment: null };
    let step = 0;
    const cats = app.categories();
    const unbind = bindFavs(view, app);

    const progress = () => html`<ol class="steps" aria-label="Voortgang">${ROMAN.map((r, i) => html`<li class="steps__i" ${i < step ? 'data-done' : ""} ${i === step ? 'aria-current="step"' : ""}><span class="roman">${r}</span></li>`)}</ol>`;

    function focusHeading() { const h = $("[data-q]", body); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
    function go(n, dir = 1) { step = n; draw(); focusHeading(); body.dataset.dir = dir > 0 ? "f" : "b"; }

    function drawAxis(a) {
      const cur = answers[a.key];
      const opt = (val, label, hint) => html`<button class="choice" type="button" role="radio" aria-checked="${cur === val}" data-val="${val}"><strong>${label}</strong><span>${hint}</span></button>`;
      return html`${progress()}<div class="qstep"><h2 data-q>${a.vraag}</h2><p class="muted">${a.hulp}</p>
        <div class="choices" role="radiogroup" aria-label="${a.vraag}">${opt("low", a.low, "Dit past meer bij mij")}${opt("mid", "Allebei", "Geen duidelijke voorkeur")}${opt("high", a.high, "Dit past meer bij mij")}</div></div>
        <div class="row">${step > 0 ? html`<button class="btn btn--quiet btn--sm" type="button" data-back>${icon("back")} Vorige</button>` : ""}</div>`;
    }
    function drawCats() {
      return html`${progress()}<div class="qstep"><h2 data-q>Welke soorten trekken je?</h2><p class="muted">Kies er een paar, of sla over als je overal voor openstaat.</p>
        <div class="chips">${cats.map((c) => html`<button class="chip" type="button" aria-pressed="${answers.categorieen.includes(c.id)}" data-cat="${c.id}">${c.label}</button>`)}</div></div>
        <div class="row"><button class="btn btn--quiet btn--sm" type="button" data-back>${icon("back")} Vorige</button><button class="btn" type="button" data-next>Volgende ${icon("arrow")}</button></div>`;
    }
    function drawMoment() {
      return html`${progress()}<div class="qstep"><h2 data-q>Wanneer schenk je iets in?</h2><p class="muted">Het moment bepaalt welke stijl past. Eén klein glas, rustig tempo.</p>
        <div class="choices choices--2" role="radiogroup" aria-label="Serveermoment">${MOMENTEN.map((m) => html`<button class="choice" type="button" role="radio" aria-checked="${answers.moment === m.id}" data-moment="${m.id}"><strong>${m.label}</strong></button>`)}</div></div>
        <div class="row"><button class="btn btn--quiet btn--sm" type="button" data-back>${icon("back")} Vorige</button><button class="btn" type="button" data-next>Toon mijn profiel</button></div>`;
    }
    function drawResult() {
      const profiel = buildProfile(answers);
      const ranked = rankProducts(profiel, app.products, 4);
      body.innerHTML = html`<div class="result"><h2 data-q>Jouw <em>smaakprofiel</em></h2><p class="lead">${describeProfile(profiel)}</p>
        <div class="card card--gold">${radar(profiel)}</div>
        <p class="muted small">Dit is een richting, geen oordeel. Smaak groeit: proef klein, vergelijk en noteer wat je opvalt.</p>
        <h3>Past bij je profiel</h3>
        <ul class="list">${ranked.map(({ product: p, score }) => html`<li class="rank" data-reveal><a class="rank__img stage stage--mini" href="#/product/${p.id}" tabindex="-1" aria-hidden="true">${productImg(p)}</a>
          <div class="rank__body"><span class="tag">${matchLabel(score)}</span><h4><a href="#/product/${p.id}">${p.naam}</a></h4><p class="muted small">${p.stijl} · ${p.herkomst}</p></div>
          <button class="icon-btn" type="button" data-fav="${p.id}" aria-pressed="${app.collection.isFav(p.id)}" aria-label="Favoriet: ${p.naam}">${icon("heart")}</button></li>`)}</ul>
        <div class="row"><button class="btn" type="button" data-save>${icon("bookmark")} Bewaar mijn profiel</button><button class="btn btn--ghost" type="button" data-again>Opnieuw</button><a class="btn btn--quiet" href="#/cadeau">Cadeau-hulp</a></div>
        <p class="small muted">Ontdekken, niet méér drinken. Vraag aan de toonbank om een kleine proef te bespreken. Alleen 18+.</p></div>`.s;
      focusHeading();
    }
    function draw() {
      if (step < 4) body.innerHTML = drawAxis(AXES[step]).s;
      else if (step === 4) body.innerHTML = drawCats().s;
      else if (step === 5) body.innerHTML = drawMoment().s;
      else drawResult();
    }
    body.addEventListener("click", (e) => {
      const t = e.target.closest("button"); if (!t) return;
      if (t.dataset.back !== undefined) return go(step - 1, -1);
      if (t.dataset.val) {
        answers[AXES[step].key] = t.dataset.val;
        $$(".choice", body).forEach((b) => b.setAttribute("aria-checked", String(b === t)));
        return void setTimeout(() => go(step + 1), matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 520);
      }
      if (t.dataset.cat) { const i = answers.categorieen.indexOf(t.dataset.cat); if (i >= 0) answers.categorieen.splice(i, 1); else answers.categorieen.push(t.dataset.cat); return t.setAttribute("aria-pressed", String(i < 0)); }
      if (t.dataset.moment) { answers.moment = t.dataset.moment; return $$(".choice", body).forEach((b) => b.setAttribute("aria-checked", String(b === t))); }
      if (t.dataset.next !== undefined) return go(step + 1);
      if (t.dataset.again !== undefined) { Object.keys(answers).forEach((k) => delete answers[k]); answers.categorieen = []; answers.moment = null; return go(0, -1); }
      if (t.dataset.save !== undefined) { app.collection.setProfile(buildProfile(answers)); toast("Je smaakprofiel staat in je collectie"); }
    });
    draw();
    return unbind;
  },
};
