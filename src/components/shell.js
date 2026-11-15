import { html, $, $$, raw } from "../lib/dom.js";
import { icon } from "./icons.js";
import { isAdultConfirmed, confirmAdult } from "../lib/age.mjs";

export const MARK = `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><g fill="none" stroke="#d9b468" stroke-linecap="round" stroke-linejoin="round"><circle class="mark__ring" cx="32" cy="32" r="29" stroke-width="1.8" pathLength="1"/><circle cx="32" cy="32" r="25.5" stroke-width=".8" opacity=".55"/><g transform="rotate(-24 32 32)" stroke-width="1.8"><path d="M20.5 19.6c0-1.8 1.4-3.1 3.2-3.1h16.6c1.8 0 3.2 1.3 3.2 3.1v1.6c0 1-.8 1.8-1.8 1.8H22.3c-1 0-1.8-.8-1.8-1.8z" fill="#d9b468" fill-opacity=".22"/><path d="M26.2 23v21.6c0 1.6 1.3 2.9 2.9 2.9h5.8c1.6 0 2.9-1.3 2.9-2.9V23"/><path d="M29.3 28.5v14.5M34.7 28.5v14.5" stroke-width=".9" opacity=".6"/></g><path d="M46.5 14.5v5M44 17h5M17 45.5v3.6M15.2 47.3h3.6" stroke-width="1.1" opacity=".8"/></g></svg>`;

const TABS = [
  ["home", "#/", "Club", "club"], ["smaak", "#/smaak", "Smaak", "smaak"], ["cadeau", "#/cadeau", "Cadeau", "cadeau"],
  ["collectie", "#/collectie", "Collectie", "collectie"], ["meer", "#/meer", "Meer", "meer"],
];

export function renderChrome(app) {
  $("#topbar").innerHTML = html`<a class="topbar__brand" href="#/" aria-label="THE TASTE CLUB, naar de startpagina">${raw(MARK)}<span class="topbar__name">The Taste Club<small>De Gouden Kurk</small></span></a>
    <a class="icon-btn topbar__back" id="back" href="#/" aria-label="Terug" hidden>${icon("back")}</a><span class="topbar__age" id="age">18+</span>`.s;
  $("#nav").innerHTML = html`${TABS.map(([id, href, label, ic]) => html`<a class="nav__item" href="${href}" data-tab="${id}">${icon(ic)}<span>${label}</span></a>`)}<span class="nav__line" aria-hidden="true"></span>`.s;
  const w = app.config.winkel;
  $("#foot").innerHTML = html`<div class="foot__nix"><img src="public/img/nix18/nix18-wit.png" width="480" height="130" alt="NIX18: geen alcohol onder de 18" loading="lazy"><p><strong>Alleen 18+.</strong> Geniet, maar drink met mate.</p></div>
    <p>${w.naam} · ${w.straat}, ${w.postcode} ${w.plaats} · <a class="link" href="${w.telefoonLink}">${w.telefoon}</a></p>
    <p>Demo: er wordt niets verkocht of verstuurd. <a class="link" href="#/privacy">Privacy</a> · <a class="link" href="#/over">Over deze demo</a></p>`.s;
  $("#back").addEventListener("click", (e) => { if (navCount > 1) { e.preventDefault(); history.back(); } });
}

let navCount = 0;
export function onShown({ tab, path, title }) {
  navCount++;
  const tabs = $$("[data-tab]");
  tabs.forEach((a) => (a.dataset.tab === tab ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
  $("#nav").style.setProperty("--tab-i", String(Math.max(0, TABS.findIndex(([id]) => id === tab))));
  const deep = path !== "/" && !TABS.some(([, href]) => href === `#${path}`);
  $("#back").hidden = !deep;
  $("#age").hidden = deep;
  document.title = `${title ? title + " · " : ""}THE TASTE CLUB (demo)`;
}

// Leeftijdspoort: zelfverklaring, geen verificatie. Geeft een belofte die klaar is zodra de gebruiker 18+ bevestigt.
export function ageGate(app) {
  if (isAdultConfirmed(app.session)) return Promise.resolve(false);
  return new Promise((resolve) => {
    const d = document.createElement("dialog");
    d.className = "gate"; d.setAttribute("aria-labelledby", "gate-t"); d.setAttribute("aria-describedby", "gate-p");
    d.innerHTML = html`<div class="gate__inner"><div class="gate__mark">${raw(MARK)}</div>
      <h2 id="gate-t">Alleen voor <em>18-plussers</em></h2>
      <p id="gate-p">Ben je 18 jaar of ouder? Dit is een zelfverklaring: we kunnen je leeftijd niet controleren. In de winkel vragen we bij twijfel om legitimatie.</p>
      <div class="gate__actions" data-actions><button class="btn" type="button" data-yes>Ja, ik ben 18 of ouder</button><button class="btn btn--quiet" type="button" data-no>Nee</button></div>
      <p class="gate__small"><img src="public/img/nix18/nix18-wit.png" width="480" height="130" alt="NIX18"><span>Geniet, maar drink met mate.</span></p></div>`.s;
    document.body.append(d);
    ["#view", "#nav", "#topbar", "#foot"].forEach((s) => $(s)?.setAttribute("inert", ""));
    d.addEventListener("cancel", (e) => e.preventDefault());
    $("[data-yes]", d).addEventListener("click", () => {
      confirmAdult(app.session);
      ["#view", "#nav", "#topbar", "#foot"].forEach((s) => $(s)?.removeAttribute("inert"));
      d.close(); d.remove(); resolve(true);
    });
    $("[data-no]", d).addEventListener("click", () => {
      $("#gate-t", d).innerHTML = "Tot ziens";
      $("#gate-p", d).textContent = "Deze app is alleen voor mensen van 18 jaar en ouder. Kom terug als je 18 bent.";
      $("[data-actions]", d).innerHTML = '<a class="btn btn--quiet" href="https://www.nix18.nl" rel="noopener noreferrer">Meer over NIX18</a>';
    });
    d.showModal();
    $("[data-yes]", d).focus();
  });
}

// Cinematische intro: de ring tekent zich, de naam verschijnt, dan opent het gordijn. Eenmalig per sessie, overslaan kan.
export function playIntro(app) {
  if (!app.config.intro || app.session.getItem("tc.intro") || matchMedia("(prefers-reduced-motion: reduce)").matches) return Promise.resolve();
  app.session.setItem("tc.intro", "1");
  return new Promise((resolve) => {
    const el = document.createElement("div");
    el.className = "intro"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Intro");
    el.innerHTML = html`<div class="intro__half intro__half--l"></div><div class="intro__half intro__half--r"></div>
      <div class="intro__center">${raw(MARK)}<p class="intro__name"><span>The</span> <span>Taste</span> <span>Club</span></p><p class="intro__sub">by De Gouden Kurk</p></div>
      <button class="intro__skip" type="button">Overslaan</button>`.s;
    document.body.append(el);
    const done = () => { el.remove(); resolve(); };
    el.querySelector(".intro__skip").addEventListener("click", done);
    addEventListener("keydown", function esc(e) { if (e.key === "Escape") { removeEventListener("keydown", esc); done(); } });
    el.querySelector(".intro__half--l").addEventListener("animationend", done, { once: true });
    el.querySelector(".intro__skip").focus();
    setTimeout(done, 5000);
  });
}
