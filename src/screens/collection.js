import { html, $, toast, confirmDialog } from "../lib/dom.js";
import { icon } from "../components/icons.js";
import { productCard, productImg, bindFavs } from "../components/product-card.js";
import { radar, bars, placeBars } from "../components/radar.js";
import { AXES, describeProfile, MOMENTEN } from "../lib/taste.mjs";
import { stars, noteForm, bindNoteForms } from "../lib/notes-ui.js";

const day = (iso) => iso;

function compareBlock(app) {
  const ids = app.collection.state.vergelijk, ps = ids.map((i) => app.product(i)).filter(Boolean);
  if (ps.length < 2) return html`<div class="empty">${icon("compare")}<p>Kies twee of drie flessen met "Vergelijk" op een productpagina om ze naast elkaar te zien.${ps.length === 1 ? ` Nu gekozen: ${ps[0].naam}.` : ""}</p><a class="btn btn--ghost btn--sm" href="#/producten">Naar alle flessen</a></div>`;
  return html`<div class="card card--gold"><div class="cmp">${ps.map((p) => html`<div class="cmp__col"><div class="stage stage--mini">${productImg(p)}</div><h3>${p.naam}</h3><p class="small muted">${p.stijl}</p></div>`)}</div>
    ${radar(ps[0].smaak, { second: ps[1].smaak, label: `Vergelijking ${ps[0].naam} en ${ps[1].naam}` })}
    <table class="cmp-table"><caption class="sr-only">Vergelijking van smaakwaarden</caption><thead><tr><th scope="col"></th>${ps.map((p) => html`<th scope="col">${p.naam}</th>`)}</tr></thead>
      <tbody>${AXES.map((a) => html`<tr><th scope="row">${a.high}</th>${ps.map((p) => html`<td class="num">${Math.round(p.smaak[a.key] * 100)}%</td>`)}</tr>`)}<tr><th scope="row">Herkomst</th>${ps.map((p) => html`<td>${p.herkomst}</td>`)}</tr><tr><th scope="row">Alcohol</th>${ps.map((p) => html`<td class="num">${p.alcohol}</td>`)}</tr></tbody></table>
    <button class="btn btn--quiet btn--sm" type="button" data-clear-cmp>Vergelijking leegmaken</button></div>`;
}

export default {
  title: "Mijn collectie",
  render(app) {
    const c = app.collection, s = c.state;
    const favs = s.favorieten.map((i) => app.product(i)).filter(Boolean);
    const gifts = s.cadeaus.map((i) => app.data.gifts.ideeen.find((g) => g.id === i)).filter(Boolean);
    return html`<div class="screen"><div class="screen-head"><h1 data-reveal>Mijn <em>collectie</em></h1><span class="thread" aria-hidden="true"></span>
      <p class="lead" data-reveal>Jouw favorieten, notities en smaak. Het blijft op dit apparaat.</p></div>
      <section class="sect" aria-labelledby="c-prof"><h2 id="c-prof">Mijn <em>smaak</em></h2>
        ${s.profiel ? html`<div class="card card--gold">${radar(s.profiel)}<p class="lead">${describeProfile(s.profiel)}</p><p class="small muted">${[s.profiel.moment ? MOMENTEN.find((m) => m.id === s.profiel.moment)?.label : "", s.profiel.categorieen.length ? s.profiel.categorieen.join(", ") : ""].filter(Boolean).join(" · ")}</p><div class="row"><a class="btn btn--ghost btn--sm" href="#/smaak">Opnieuw proeven</a><button class="btn btn--quiet btn--sm" type="button" data-clear-profile>Verwijder profiel</button></div></div>`
          : html`<div class="empty">${icon("smaak")}<p>Je hebt nog geen smaakprofiel. De Taste Finder duurt een minuut.</p><a class="btn btn--sm" href="#/smaak">Start de Taste Finder</a></div>`}</section>
      <section class="sect" aria-labelledby="c-fav"><h2 id="c-fav">Mijn <em>favorieten</em></h2>
        ${favs.length ? html`<div class="pgrid">${favs.map((p) => productCard(app, p))}</div>` : html`<div class="empty">${icon("heart")}<p>Nog geen favorieten. Tik op het hart bij een fles om hem te bewaren.</p><a class="btn btn--ghost btn--sm" href="#/producten">Ontdek flessen</a></div>`}</section>
      <section class="sect" aria-labelledby="c-cmp"><h2 id="c-cmp"><em>Vergelijken</em></h2><div id="cmp">${compareBlock(app)}</div></section>
      <section class="sect" aria-labelledby="c-not"><h2 id="c-not">Proef<em>notities</em></h2>
        ${s.notities.length ? html`<ul class="list">${s.notities.map((n) => { const p = app.product(n.productId); return html`<li class="card"><div class="row"><a class="link" href="#/product/${n.productId}">${p?.naam || n.productId}</a><span class="num muted small">${n.datum}</span><span aria-label="${n.beoordeling ? n.beoordeling + " van 5" : ""}">${stars(n.beoordeling)}</span></div><p>${n.tekst}</p><button class="btn btn--quiet btn--sm" type="button" data-del-note="${n.id}">${icon("trash")} Verwijder</button></li>`; })}</ul>` : html`<div class="empty">${icon("note")}<p>Nog geen proefnotities. Schrijf op wat je ruikt en proeft, niet hoeveel.</p></div>`}
        <details class="story"><summary><h3>Nieuwe notitie</h3></summary><div class="field"><label for="np">Bij welke fles?</label><select class="select" id="np">${app.products.map((p) => html`<option value="${p.id}">${p.naam}</option>`)}</select></div><div id="nf"></div></details></section>
      ${gifts.length ? html`<section class="sect" aria-labelledby="c-gift"><h2 id="c-gift">Bewaarde <em>cadeau-ideeen</em></h2><ul class="list">${gifts.map((g) => html`<li class="card"><h3>${g.titel}</h3><p class="muted">${g.tekst}</p></li>`)}</ul></section>` : ""}
      <section class="sect" aria-labelledby="c-data"><h2 id="c-data">Mijn <em>gegevens</em></h2>
        <div class="card"><p class="muted">Alles staat alleen in de opslag van deze browser. Er is geen account en er wordt niets verstuurd. Maak een export om je collectie mee te nemen of te bewaren.</p>
          <div class="row"><button class="btn btn--ghost btn--sm" type="button" data-export>${icon("down")} Exporteer als JSON</button><label class="btn btn--ghost btn--sm" for="imp">${icon("up")} Importeer</label><input id="imp" class="sr-only" type="file" accept="application/json,.json">
          ${c.hasBackup() ? html`<button class="btn btn--quiet btn--sm" type="button" data-restore>Herstel vorige versie</button>` : ""}</div>
          <p class="field__error" role="alert" id="imp-err"></p>
          <hr class="divider"><button class="btn btn--danger btn--sm" type="button" data-wipe>${icon("trash")} Wis al mijn gegevens</button></div></section></div>`;
  },
  mount(view, app) {
    const c = app.collection;
    const un = [bindFavs(view, app)];
    const reload = () => app.rerender({ focus: null });
    const nf = $("#nf", view), sel = $("#np", view);
    const drawForm = () => { nf.innerHTML = noteForm(sel.value).s; };
    drawForm(); sel.addEventListener("change", drawForm);
    un.push(bindNoteForms(view, app, reload));
    const download = (name, text) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "application/json" })); a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
    const onClick = async (e) => {
      const t = e.target.closest("button"); if (!t) return;
      if (t.dataset.clearCmp !== undefined) { c.clearCompare(); reload(); }
      else if (t.dataset.clearProfile !== undefined) { c.clearProfile(); reload(); }
      else if (t.dataset.delNote) { c.removeNote(t.dataset.delNote); reload(); }
      else if (t.dataset.export !== undefined) { download(`taste-club-collectie-${new Date().toISOString().slice(0, 10)}.json`, c.exportJSON()); toast("Export gemaakt"); }
      else if (t.dataset.restore !== undefined) { if (await confirmDialog({ title: "Vorige versie herstellen?", text: "Je huidige collectie wordt vervangen door de versie van vlak voor je laatste import.", ok: "Herstel" })) { c.restoreBackup(); reload(); toast("Vorige versie hersteld"); } }
      else if (t.dataset.wipe !== undefined) { if (await confirmDialog({ title: "Alles wissen?", text: "Favorieten, notities, smaakprofiel en back-ups op dit apparaat worden verwijderd. Dit kan niet ongedaan worden gemaakt. Maak eerst een export als je iets wilt bewaren.", ok: "Wis alles", danger: true })) { c.wipe(); app.refreshData(); reload(); toast("Alles is gewist"); } }
    };
    view.addEventListener("click", onClick);
    $("#imp", view).addEventListener("change", async (e) => {
      const f = e.target.files[0]; if (!f) return;
      const err = $("#imp-err", view);
      if (f.size > 1_000_000) { err.textContent = "Dit bestand is te groot."; return; }
      const text = await f.text();
      const replace = await confirmDialog({ title: "Importeren", text: "Samenvoegen behoudt wat je al hebt. Vervangen overschrijft je collectie (er wordt eerst een back-up bewaard).", ok: "Vervangen", cancel: "Samenvoegen" });
      const r = c.importJSON(text, replace ? "vervangen" : "samenvoegen");
      if (!r.ok) { err.textContent = r.fout; return; }
      reload(); toast("Import gelukt");
    });
    placeBars(view);
    return () => { un.forEach((f) => f()); view.removeEventListener("click", onClick); };
  },
};
