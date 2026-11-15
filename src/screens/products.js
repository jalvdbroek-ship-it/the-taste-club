import { html, $ } from "../lib/dom.js";
import { icon } from "../components/icons.js";
import { productCard, bindFavs } from "../components/product-card.js";

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export default {
  title: "Alle flessen",
  render(app) {
    return html`<div class="screen"><div class="screen-head"><h1 data-reveal>Alle <em>flessen</em></h1><span class="thread" aria-hidden="true"></span>
      <p class="lead" data-reveal>Een voorbeeld-assortiment om te ontdekken. Er is geen winkelmand: je bekijkt, bewaart en loopt binnen.</p></div>
      <form class="form" role="search" id="pf" novalidate><div class="field"><label for="pq">Zoek op naam, stijl of herkomst</label><input class="input" id="pq" type="search" autocomplete="off" enterkeyhint="search"></div>
        <div class="chips" role="group" aria-label="Categorie"><button class="chip" type="button" aria-pressed="true" data-c="">Alles</button>${app.categories().map((c) => html`<button class="chip" type="button" aria-pressed="false" data-c="${c.id}">${c.label}</button>`)}</div></form>
      <p class="small muted" id="pcount" role="status"></p>
      <div class="pgrid" id="pgrid"></div>
      <div class="empty" id="pempty" hidden>${icon("search")}<p>Geen fles gevonden. Probeer een andere zoekterm, of vraag het aan de toonbank.</p></div></div>`;
  },
  mount(view, app) {
    let cat = "", q = "";
    const grid = $("#pgrid", view);
    const draw = () => {
      const list = app.products.filter((p) => (!cat || p.categorie === cat) && (!q || norm([p.naam, p.stijl, p.herkomst, p.categorieLabel, ...(p.smaakwoorden || [])].join(" ")).includes(q)));
      grid.innerHTML = list.map((p) => productCard(app, p)).join("");
      $("#pcount", view).textContent = `${list.length} ${list.length === 1 ? "fles" : "flessen"}`;
      $("#pempty", view).hidden = list.length > 0;
    };
    $("#pf", view).addEventListener("submit", (e) => e.preventDefault());
    $("#pq", view).addEventListener("input", (e) => { q = norm(e.target.value.trim()); draw(); });
    $("#pf", view).addEventListener("click", (e) => {
      const b = e.target.closest("[data-c]"); if (!b) return;
      cat = b.dataset.c; view.querySelectorAll("[data-c]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); draw();
    });
    draw();
    return bindFavs(view, app);
  },
};
