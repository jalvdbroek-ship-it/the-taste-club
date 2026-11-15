import { html, $, $$, toast } from "../lib/dom.js";
import { icon } from "../components/icons.js";
import { productImg } from "../components/product-card.js";
import { matchGifts, budgetBands, cleanMessage, shareText, MESSAGE_MAX } from "../lib/gifts.mjs";

const group = (id, titel, opties, cur) => html`<fieldset class="fieldset"><legend class="label">${titel}</legend><div class="chips" role="radiogroup" aria-label="${titel}">${opties.map((o) => html`<button class="chip" type="button" role="radio" aria-checked="${cur === o.id}" data-g="${id}" data-v="${o.id}">${o.label}</button>`)}</div></fieldset>`;

export default {
  title: "Gift Finder",
  render(app) {
    const g = app.data.gifts, bands = budgetBands(app.config);
    return html`<div class="screen"><div class="screen-head"><h1 data-reveal>Gift <em>Finder</em></h1><span class="thread" aria-hidden="true"></span>
      <p class="lead" data-reveal>Een cadeau kiezen is makkelijker als je weet voor wie en waarom. Kies, en we laten ideeën zien.</p></div>
      <form class="form" id="gf" novalidate>${group("voor", "Voor wie?", g.voor)}${group("gelegenheid", "Gelegenheid", g.gelegenheden)}${group("stijl", "Stijl", g.stijlen)}${bands.length ? group("budget", "Budget", bands) : ""}</form>
      <section class="sect" aria-labelledby="g-res"><h2 id="g-res">Ideeën</h2><p class="small muted" id="g-count" role="status"></p><div class="list" id="g-list"></div></section>
      <section class="sect" aria-labelledby="g-msg"><h2 id="g-msg">Cadeau<em>boodschap</em></h2>
        <div class="field"><label for="msg">Schrijf een korte boodschap voor op de kaart</label><textarea class="textarea" id="msg" maxlength="${MESSAGE_MAX}"></textarea><span class="field__hint"><span id="msg-n">0</span> van ${MESSAGE_MAX} tekens</span></div>
        <div class="chips" aria-label="Voorbeeldboodschappen">${g.boodschappen.map((m, i) => html`<button class="chip" type="button" data-ex="${i}">Voorbeeld ${i + 1}</button>`)}</div>
        <div class="card card--paper giftcard" aria-label="Voorbeeldkaart"><p class="giftcard__msg" id="msg-prev">Je boodschap verschijnt hier.</p><p class="small muted">${app.config.winkel.naam} · ${app.config.winkel.plaats}</p></div>
        ${app.config.verpakking ? html`<label class="row"><input type="checkbox" id="wrap"> Verpakt meegeven</label>` : ""}</section>
      <div class="card card--gold"><h3>Samen kiezen in de winkel</h3><p class="muted">Twijfel je? Bel of loop binnen, dan denken we mee. Alleen 18+.</p><div class="row"><a class="btn" href="${app.config.winkel.telefoonLink}">${icon("phone")} Bel ${app.config.winkel.telefoon}</a></div></div></div>`;
  },
  mount(view, app) {
    const keuze = {}, list = $("#g-list", view), msg = $("#msg", view);
    const draw = () => {
      const r = matchGifts(keuze, app.data.gifts, app.data.catalog, app.config);
      $("#g-count", view).textContent = r.length ? `${r.length} ${r.length === 1 ? "idee" : "ideeën"}` : "Geen ideeën voor deze combinatie. Probeer een keuze los te laten.";
      list.innerHTML = r.map(({ idea, producten }) => html`<article class="card gift" data-reveal><div class="gift__imgs">${producten.map((p) => html`<a href="#/product/${p.id}" aria-label="${p.naam}"><div class="stage stage--mini">${productImg(p)}</div></a>`)}</div>
        <h3>${idea.titel}</h3><p class="muted">${idea.tekst}</p><p class="small">${producten.map((p, i) => html`${i ? " + " : ""}<a class="link" href="#/product/${p.id}">${p.naam}</a>`)}</p>
        <div class="row"><button class="btn btn--ghost btn--sm" type="button" data-save="${idea.id}" aria-pressed="${app.collection.hasGift(idea.id)}">${icon("bookmark")} <span>${app.collection.hasGift(idea.id) ? "Bewaard" : "Bewaar"}</span></button><button class="btn btn--quiet btn--sm" type="button" data-share="${idea.id}">${icon("share")} Deel</button></div></article>`).join("");
    };
    view.addEventListener("click", async (e) => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.g) { const on = b.getAttribute("aria-checked") !== "true"; $$(`[data-g="${b.dataset.g}"]`, view).forEach((x) => x.setAttribute("aria-checked", "false")); b.setAttribute("aria-checked", String(on)); if (on) keuze[b.dataset.g] = b.dataset.v; else delete keuze[b.dataset.g]; draw(); }
      else if (b.dataset.ex) { msg.value = app.data.gifts.boodschappen[Number(b.dataset.ex)]; msg.dispatchEvent(new Event("input")); }
      else if (b.dataset.save) { const on = app.collection.toggleGift(b.dataset.save); b.setAttribute("aria-pressed", String(on)); b.querySelector("span").textContent = on ? "Bewaard" : "Bewaar"; toast(on ? "Bewaard in je collectie" : "Verwijderd uit je collectie"); }
      else if (b.dataset.share) {
        const idee = app.data.gifts.ideeen.find((i) => i.id === b.dataset.share);
        const text = shareText({ idee, boodschap: msg.value, winkel: app.config.winkel });
        try { if (navigator.share) await navigator.share({ title: "Cadeau-idee", text }); else { await navigator.clipboard.writeText(text); toast("Tekst gekopieerd. Plak hem in een bericht."); } }
        catch (err) { if (err?.name !== "AbortError") toast("Delen lukt hier niet. Kopieer de tekst uit de voorbeeldkaart."); }
      }
    });
    msg.addEventListener("input", () => { const t = cleanMessage(msg.value); $("#msg-n", view).textContent = String(msg.value.length); $("#msg-prev", view).textContent = t || "Je boodschap verschijnt hier."; });
    draw();
  },
};
