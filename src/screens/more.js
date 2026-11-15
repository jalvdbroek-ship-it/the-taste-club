import { html, $ } from "../lib/dom.js";
import { icon } from "../components/icons.js";

const ITEMS = [
  ["#/producten", "book", "Alle flessen", "Zoek en filter het voorbeeld-assortiment"],
  ["#/pick", "star", "The Golden Pick", "De fles waar we nu bij stilstaan"],
  ["#/club", "calendar", "Club en events", "Proeverijen, nieuws en verhalen"],
  ["#/over", "info", "Over deze demo", "Wat werkt, verantwoord genieten, fotoverantwoording"],
  ["#/privacy", "lock", "Privacy", "Wat er op je apparaat staat"],
  ["#/beheer", "edit", "Beheer (demo)", "Prototype voor de ondernemer"],
];

export default {
  title: "Meer",
  render(app) {
    const w = app.config.winkel, rm = app.local.getItem("tc.rm") === "1";
    return html`<div class="screen"><div class="screen-head"><h1 data-reveal>Meer</h1><span class="thread" aria-hidden="true"></span></div>
      <ul class="list">${ITEMS.map(([href, ic, t, s]) => html`<li data-reveal><a class="card menu-row" href="${href}"><span class="icon">${icon(ic)}</span><span><strong>${t}</strong><br><span class="muted small">${s}</span></span><span class="icon menu-row__go">${icon("arrow")}</span></a></li>`)}</ul>
      <div class="card"><h3>Weergave</h3><label class="row switch"><input type="checkbox" id="rm" ${rm ? "checked" : ""}><span>Minder beweging</span></label><p class="small muted">Zet animaties uit. Dit volgt ook de instelling van je apparaat.</p></div>
      <div class="card card--gold"><h3>${w.naam}</h3><p class="muted">${w.straat}<br>${w.postcode} ${w.plaats}</p><div class="row"><a class="btn btn--ghost btn--sm" href="${w.telefoonLink}">${icon("phone")} ${w.telefoon}</a></div><p class="small muted">Openingstijden zijn niet bevestigd: bel even.</p></div></div>`;
  },
  mount(view, app) {
    const el = $("#rm", view);
    const on = () => { app.local.setItem("tc.rm", el.checked ? "1" : "0"); document.documentElement.classList.toggle("rm", el.checked); };
    el.addEventListener("change", on);
    return () => el.removeEventListener("change", on);
  },
};
