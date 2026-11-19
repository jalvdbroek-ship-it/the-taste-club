import { html, $ } from "../lib/dom.js";
import { icon } from "../components/icons.js";
import { huidigeFeestdag, receptenVoor } from "../lib/feest.mjs";

const ALLES = "alles";

// Begin bij de feestdag die nu loopt; de rest volgt in kalenderorde.
const volgorde = (feestdagen, nuId) => {
  const i = Math.max(0, feestdagen.findIndex((f) => f.id === nuId));
  return [...feestdagen.slice(i), ...feestdagen.slice(0, i)];
};

function recept(app, r, naam, open) {
  const producten = (r.producten || []).map((id) => app.product(id)).filter(Boolean);
  return html`<details class="card card--gold recept"${open ? " open" : ""}>
    <summary>${naam ? html`<span class="tag">${naam}</span>` : ""}<h3>${r.naam}</h3><p class="muted">${r.intro}</p><p class="small muted">${r.glazen} · ${r.tijd}</p></summary>
    <div class="recept__body">
      ${r.vooraf ? html`<p class="recept__vooraf small"><strong>Vooraf:</strong> ${r.vooraf}</p>` : ""}
      <h4>Wat je nodig hebt</h4>
      <ul class="recept__lijst">${r.ingredienten.map((x) => html`<li>${x}</li>`)}</ul>
      <h4>Zo maak je het</h4>
      <ol class="howto">${r.bereiding.map((x) => html`<li>${x}</li>`)}</ol>
      <div class="recept__zonder"><h4>Zonder alcohol</h4><p>${r.zonderAlcohol}</p></div>
      <p class="small muted">${r.tip}</p>
      ${producten.length ? html`<p class="small">Past bij: ${producten.map((p, i) => html`${i ? ", " : ""}<a class="link" href="#/product/${p.id}">${p.naam}</a>`)}</p>` : ""}
      ${r.toonbank ? html`<p class="small muted">${r.toonbank}</p>` : ""}
      <p class="small muted">Alleen voor 18+. Geniet, maar drink met mate.</p>
    </div>
  </details>`;
}

function lijst(app, keuze) {
  const { feestdagen, recepten } = app.data.recepten;
  const tonen = feestdagen.filter((f) => keuze === ALLES || f.id === keuze);
  return html`${tonen.map((f, i) => {
    const rs = receptenVoor(recepten, f.id);
    return html`<section class="sect" aria-labelledby="r-${f.id}">
      <div class="sect__head"><h2 id="r-${f.id}">${f.naam}</h2><span class="small muted">${f.periode}</span></div>
      <p class="muted">${f.intro}</p>
      ${rs.map((r, j) => recept(app, r, keuze === ALLES ? f.naam : "", keuze !== ALLES && j === 0))}
    </section>`;
  })}`;
}

export default {
  title: "Recepten",
  render(app) {
    const { feestdagen } = app.data.recepten;
    const { feestdag, actief } = huidigeFeestdag(feestdagen);
    const keuze = actief ? feestdag.id : ALLES;
    const chips = [...volgorde(feestdagen, feestdag.id).map((f) => [f.id, f.naam]), [ALLES, "Alles"]];
    const status = actief ? `Nu: ${feestdag.naam}, ${feestdag.periode}.` : `Straks: ${feestdag.naam}, ${feestdag.periode}.`;
    return html`<div class="screen"><div class="screen-head"><h1 data-reveal>Recepten voor de <em>feestdagen</em></h1><span class="thread" aria-hidden="true"></span>
      <p class="lead" data-reveal>Kies een feestdag. De app begint bij de tijd van het jaar waarin je nu zit.</p></div>
      <p class="small" id="rstatus">${icon("calendar")} ${status}</p>
      <div class="chips" role="group" aria-label="Feestdag">${chips.map(([id, naam]) => html`<button class="chip" type="button" aria-pressed="${String(id === keuze)}" data-f="${id}">${naam}</button>`)}</div>
      <div id="rlist" class="recepten">${lijst(app, keuze)}</div>
      <p class="small muted">Dit zijn voorbeelden van recepten. De Gouden Kurk kan ze aanpassen of aanvullen.</p></div>`;
  },
  mount(view, app) {
    const draw = (keuze) => { $("#rlist", view).innerHTML = lijst(app, keuze).s; };
    const onClick = (e) => {
      const b = e.target.closest("[data-f]"); if (!b) return;
      view.querySelectorAll("[data-f]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      draw(b.dataset.f);
    };
    view.addEventListener("click", onClick);
    return () => view.removeEventListener("click", onClick);
  },
};
