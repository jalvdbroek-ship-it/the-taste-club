import { html } from "../lib/dom.js";
import { icon } from "../components/icons.js";

const STAPPEN = [
  ["smaak", "Ontdek je smaak", "Zes korte vragen, geen goed of fout. Je krijgt een smaakprofiel en flessen uit de winkel die erbij passen.", "#/smaak", "Start de Taste Finder"],
  ["cadeau", "Kies een cadeau", "Vertel voor wie het is, de gelegenheid en de stijl. Je krijgt ideeën, schrijft een cadeauboodschap en kunt de winkel bellen.", "#/cadeau", "Naar de cadeauhulp"],
  ["collectie", "Bewaar wat je proeft", "Favorieten, proefnotities en tot drie flessen naast elkaar. Nog leeg? Laad een voorbeeldcollectie om rond te kijken.", "#/collectie", "Naar je collectie"],
  ["star", "Lees The Golden Pick", "De fles waar de winkel nu bij stilstaat, met verhalen en (zodra bevestigd) proeverijen.", "#/pick", "Naar The Golden Pick"],
  ["meer", "Zet hem op je beginscherm", "Onder Meer staat hoe je de app op je iPhone of Android zet. Daarna werkt hij ook zonder internet.", "#/meer", "Naar Meer"],
];

export default {
  title: "Rondleiding",
  render() {
    return html`<div class="screen"><div class="screen-head"><h1 data-reveal>Een korte <em>rondleiding</em></h1><span class="thread" aria-hidden="true"></span>
      <p class="lead" data-reveal>Vijf dingen die je met The Taste Club kunt. Alles blijft op dit apparaat; er is geen account nodig.</p></div>
      <ol class="list tour">${STAPPEN.map(([ic, t, s, href, cta], i) => html`<li class="card" data-reveal><div class="row tour__head"><span class="icon">${icon(ic)}</span><span class="roman">${["I", "II", "III", "IV", "V"][i]}</span></div><h2 class="tour__title">${t}</h2><p class="muted">${s}</p><a class="btn btn--ghost btn--sm" href="${href}">${cta} ${icon("arrow")}</a></li>`)}</ol>
      <div class="demo-note">${icon("info")}<p>Dit is een demo. Prijzen, voorraad en openingstijden staan er niet in. Alleen voor 18+; geniet, maar drink met mate.</p></div></div>`;
  },
};
