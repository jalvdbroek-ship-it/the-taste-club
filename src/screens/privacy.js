import { html, $, toast, confirmDialog } from "../lib/dom.js";
import { icon } from "../components/icons.js";

export default {
  title: "Privacy",
  render(app) {
    const w = app.config.winkel;
    return html`<div class="screen prose"><div class="screen-head"><h1 data-reveal>Pri<em>vacy</em></h1><span class="thread" aria-hidden="true"></span><p class="lead">Kort gezegd: deze app stuurt niets naar een server.</p></div>
      <section class="sect"><h2>Wat er op je <em>apparaat</em> staat</h2>
        <ul class="plain"><li><strong>Je leeftijdsverklaring</strong> (sessieopslag): dat je hebt aangegeven 18 of ouder te zijn en of de intro is getoond. Verdwijnt als je de browser sluit.</li>
        <li><strong>Je collectie</strong> (lokale opslag): favorieten, bewaarde cadeau-ideeën, proefnotities, smaakprofiel, vergelijklijst en eventuele interesse in een evenement (alleen id, aantal en datum).</li>
        <li><strong>Instelling</strong>: of je minder beweging wilt.</li>
        <li><strong>Demo-beheer</strong>: wijzigingen die je in het beheerprototype maakt, ook alleen lokaal.</li>
        <li><strong>Offline-cache</strong>: bestanden van de app zelf, zodat hij zonder internet opent.</li></ul></section>
      <section class="sect"><h2>Wat <em>niet</em> gebeurt</h2>
        <ul class="plain"><li>Geen account, geen inlog, geen naam of e-mailadres.</li><li>Geen cookies, geen advertentie- of statistiekdiensten, geen verzoeken aan andere websites.</li><li>Geen verkoop, betaling of bestelling.</li><li>De app weet je leeftijd niet; de leeftijdspoort is een zelfverklaring.</li></ul></section>
      <section class="sect"><h2>Jouw <em>rechten</em></h2><p>Omdat alles op je eigen apparaat staat, heb je alles zelf in de hand: bekijk het in <a class="link" href="#/collectie">Mijn collectie</a>, exporteer het als JSON, of wis het hieronder. Wissen is definitief.</p>
        <div class="row"><button class="btn btn--danger btn--sm" type="button" id="wipe">${icon("trash")} Wis al mijn gegevens</button></div></section>
      <section class="sect"><h2>Wie is <em>verantwoordelijk</em></h2><p>Dit is een demo ter beoordeling, geen echte uitgave. Bij een echte uitgave is ${w.naam} (${w.straat}, ${w.plaats}) verantwoordelijk voor de verwerking. De juiste gegevens, bewaartermijnen en contactpunt voor privacyvragen moeten dan nog worden ingevuld door de ondernemer. Zie <code>docs/COMPLIANCE.md</code> voor de open punten.</p></section></div>`;
  },
  mount(view, app) {
    $("#wipe", view).addEventListener("click", async () => {
      if (await confirmDialog({ title: "Alles wissen?", text: "Favorieten, notities, smaakprofiel, instellingen en demo-beheerdata op dit apparaat worden verwijderd.", ok: "Wis alles", danger: true })) { app.collection.wipe(); app.refreshData(); document.documentElement.classList.remove("rm"); toast("Alles is gewist"); }
    });
  },
};
