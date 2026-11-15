import { html } from "../lib/dom.js";

export default {
  title: "Over deze demo",
  render(app) {
    const w = app.config.winkel;
    return html`<div class="screen prose"><div class="screen-head"><h1 data-reveal>Over deze <em>demo</em></h1><span class="thread" aria-hidden="true"></span><p class="lead">The Taste Club is een ontwerp voor ${w.naam}, nog niet in gebruik.</p></div>
      <section class="sect"><h2>Wat <em>werkt</em></h2><ul class="plain"><li>Taste Finder, Gift Finder, favorieten, proefnotities en vergelijken werken echt, op je eigen apparaat.</li><li>Het beheerprototype laat zien hoe de ondernemer inhoud zou kunnen aanpassen.</li><li>De app is installeerbaar en werkt offline.</li></ul></section>
      <section class="sect"><h2>Wat nog <em>demo</em> is</h2><ul class="plain"><li>Het assortiment is een voorbeeld; smaakprofielen, herkomst en verhalen zijn redactioneel concept.</li><li>Prijzen, voorraad, openingstijden en evenementen zijn niet bevestigd en staan er daarom niet.</li><li>Er is geen server, geen account en geen echte leeftijdscontrole.</li></ul></section>
      <section class="sect" id="verantwoord"><h2>Verantwoord <em>genieten</em></h2>
        <p>Alleen voor 18+. Een standaardglas sterke drank is 35 ml. Drink met mate en kies bewust: niet in het verkeer, niet tijdens zwangerschap en niet als je medicijnen gebruikt die dat afraden.</p>
        <p><a class="link" href="https://www.stiva.nl" rel="noopener noreferrer">STIVA</a> en <a class="link" href="https://www.nix18.nl" rel="noopener noreferrer">NIX18</a> geven meer informatie. Bij twijfel over je leeftijd vragen we in de winkel om legitimatie.</p></section>
      <section class="sect"><h2>Foto<em>verantwoording</em></h2><p class="small muted">De productfoto's zijn bewerkt (achtergrond verwijderd en bijgesneden) en gebruikt onder de genoemde licentie.</p>
        <ul class="plain credit">${app.products.map((p) => html`<li>${p.naam}: “${p.credit.title}”${p.credit.creator ? `, ${p.credit.creator}` : ""}${p.credit.sourceUrl ? html`, <a href="${p.credit.sourceUrl}" rel="noopener noreferrer">${p.credit.license}</a>` : ""}</li>`)}</ul></section>
      <section class="sect"><h2>De <em>winkel</em></h2><p>${w.naam}, ${w.straat}, ${w.postcode} ${w.plaats}. <a class="link" href="${w.telefoonLink}">${w.telefoon}</a></p><p class="small muted">Versie ${app.config.versie} (demo).</p></section></div>`;
  },
};
