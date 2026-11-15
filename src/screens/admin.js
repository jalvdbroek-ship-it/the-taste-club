import { html, $, toast, confirmDialog } from "../lib/dom.js";
import { icon } from "../components/icons.js";
import { SPECS, fieldHtml, readForm, validators, slug } from "../lib/admin-forms.js";
import { adminAllowed } from "../lib/env.mjs";
import { createPinGate, exportBundle, parseBundle, restoreOverrides, hasAdminBackup } from "../lib/admin-store.mjs";

const TABS = [["product", "Producten"], ["pick", "Golden Pick"], ["event", "Evenementen"], ["gift", "Cadeaus"], ["story", "Verhalen"], ["data", "Data"]];
const LIST = { product: (d) => d.catalog.producten, event: (d) => d.events.items, gift: (d) => d.gifts.ideeen, story: (d) => d.stories.items };
const TITLE = { product: (x) => x.naam, event: (x) => x.titel, gift: (x) => x.titel, story: (x) => x.titel };
const META = { product: (x) => `${x.categorieLabel} · ${x.bron || ""}`, event: (x) => `${x.soort} · ${x.bevestigd ? "bevestigd" : "niet bevestigd"}${x.demo ? " · voorbeeld" : ""}`, gift: (x) => `${x.producten.length} fles(sen)`, story: (x) => `${x.soort} · ${x.status}` };

const bundle = (app) => ({ catalog: app.data.catalog, events: app.data.events, stories: app.data.stories, gifts: app.data.gifts, pick: app.data.pick });
function commit(app, mutate) {
  const next = structuredClone(bundle(app)); mutate(next);
  try { app.setOverrides(next); return true; } catch { toast("Opslaan lukt niet: de lokale opslag is vol. Verklein de foto of exporteer en reset."); return false; }
}
const ctx = (app) => ({ categorieen: app.categories(), prijzenBevestigd: app.config.prijzenBevestigd, productIds: app.products.map((p) => p.id) });

function gate(app) {
  return html`<div class="screen"><div class="screen-head"><h1 data-reveal>Beheer <em>(demo)</em></h1><span class="thread" aria-hidden="true"></span></div>
    <div class="demo-note">${icon("lock")}<p>${app.config.beheer.label}</p></div>
    <form class="form card" id="pin" novalidate><div class="field"><label for="pin-i">Pincode</label><input class="input" id="pin-i" type="password" inputmode="numeric" autocomplete="off"><span class="field__error" id="pin-e" role="alert"></span></div><button class="btn" type="submit">Open het paneel</button></form></div>`;
}

function formView(app, st) {
  const spec = SPECS(app)[st.edit.type], isNew = !st.edit.id;
  return html`<form class="form card" id="aform" novalidate><h2>${isNew ? "Nieuw" : "Bewerk"}</h2>${spec.map((f) => fieldHtml(f, st.values, st.errors, isNew))}
    ${Object.keys(st.errors).length ? html`<p class="field__error" role="alert">Controleer de gemarkeerde velden.</p>` : ""}
    <div class="row"><button class="btn" type="submit">Bewaar</button>${st.edit.type !== "pick" ? html`<button class="btn btn--quiet" type="button" data-cancel>Annuleer</button>` : ""}</div></form>`;
}

function listView(app, type) {
  const items = LIST[type](app.data);
  return html`<div class="row"><button class="btn btn--sm" type="button" data-new="${type}">${icon("plus")} Nieuw</button></div>
    <ul class="list">${items.map((x) => html`<li class="card"><strong>${TITLE[type](x)}</strong><span class="small muted">${META[type](x)}</span><div class="row"><button class="btn btn--ghost btn--sm" type="button" data-edit="${type}:${x.id}">${icon("edit")} Bewerk</button><button class="btn btn--danger btn--sm" type="button" data-del="${type}:${x.id}">${icon("trash")} Verwijder</button></div></li>`)}</ul>`;
}

function dataView(app) {
  return html`<div class="card"><h3>Export en import</h3><p class="muted">Exporteer alle gegevens als één JSON-bestand. Zo kan de ondernemer gewijzigde data aanleveren. Importeren controleert eerst alles en maakt een back-up van je huidige lokale kopie.</p>
    <div class="row"><button class="btn btn--ghost btn--sm" type="button" data-export>${icon("down")} Exporteer</button><label class="btn btn--ghost btn--sm" for="aimp">${icon("up")} Importeer</label><input id="aimp" class="sr-only" type="file" accept="application/json,.json"></div><ul class="plain" id="aimp-err" role="alert"></ul></div>
    <div class="card"><h3>Lokale kopie</h3><p class="muted">${app.hasOverrides() ? "Er zijn lokale wijzigingen actief. De bestanden in src/data zijn niet aangepast." : "Er zijn geen lokale wijzigingen: je ziet de meegeleverde data."}</p>
    <div class="row">${app.hasOverrides() ? html`<button class="btn btn--danger btn--sm" type="button" data-reset>Terug naar de meegeleverde data</button>` : ""}${hasAdminBackup(app.local) ? html`<button class="btn btn--quiet btn--sm" type="button" data-restore>Herstel vorige versie</button>` : ""}</div></div>`;
}

export default {
  title: "Beheer (demo)",
  render(app) {
    if (!adminAllowed(app.config, location.hostname)) return html`<div class="screen"><div class="screen-head"><h1 data-reveal>Beheer <em>(demo)</em></h1><span class="thread" aria-hidden="true"></span></div><div class="demo-note">${icon("lock")}<p>Het beheerprototype is uitgeschakeld op dit adres. Het heeft geen echte beveiliging en draait alleen lokaal of op je eigen netwerk.</p></div></div>`;
    app.admin ||= { open: false, tab: "product", edit: null, values: null, errors: {} };
    const st = app.admin;
    if (!st.open) return gate(app);
    const body = st.tab === "data" ? dataView(app) : st.edit ? formView(app, st) : st.tab === "pick" ? "" : listView(app, st.tab);
    return html`<div class="screen"><div class="screen-head"><h1 data-reveal>Beheer <em>(demo)</em></h1><span class="thread" aria-hidden="true"></span></div>
      <div class="demo-note">${icon("info")}<p>Prototype. Wijzigingen blijven in deze browser en gaan niet naar een server of naar de bestanden. Gebruik Export om ze aan te leveren.</p></div>
      <div class="chips" role="group" aria-label="Onderdeel">${TABS.map(([id, l]) => html`<button class="chip" type="button" aria-pressed="${st.tab === id}" data-tab="${id}">${l}</button>`)}<button class="chip" type="button" data-logout>Sluit paneel</button></div>
      <div id="abody" class="list">${body}</div></div>`;
  },
  mount(view, app) {
    if (!adminAllowed(app.config, location.hostname)) return;
    const st = app.admin, again = (focus) => app.rerender({ focus });
    const download = (name, text) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "application/json" })); a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
    const openEdit = (type, id) => {
      st.edit = { type, id }; st.errors = {}; st.file = null;
      st.values = structuredClone(type === "pick" ? app.data.pick : id ? LIST[type](app.data).find((x) => x.id === id) : type === "product" ? { smaak: { kruidig: 0.5, vol: 0.5, zoet: 0.5, complex: 0.5 }, smaakwoorden: [], momenten: [] } : type === "event" ? { soort: "proeverij", bevestigd: false, plaatsen: 0 } : type === "story" ? { soort: "weetje", status: "concept", producten: [] } : { producten: [], voor: [], gelegenheid: [], stijl: [] });
    };
    const pin = $("#pin", view);
    if (pin) {
      app.pinGate ||= createPinGate(app.config.beheer.pincode);
      pin.addEventListener("submit", (e) => {
        e.preventDefault();
        const r = app.pinGate.try($("#pin-i", view).value);
        if (r.ok) { st.open = true; again(); } else $("#pin-e", view).textContent = r.wacht ? `Te vaak geprobeerd. Wacht ${r.wacht} seconden.` : "Onjuiste pincode.";
      });
      return;
    }
    async function save(form) {
      const { type, id } = st.edit, spec = SPECS(app)[type], isNew = !id;
      let obj = readForm(form, spec, st.values);
      if (isNew && type !== "pick" && !obj.id) obj.id = slug(obj.naam || obj.titel);
      if (type === "product") {
        const file = (st.file = form.elements._foto?.files[0] || st.file), credit = form.elements._credit.value.trim(), errs = {};
        if (file) {
          const max = app.config.limieten.afbeeldingKB * 1024;
          if (!/^image\/(webp|png|jpeg)$/.test(file.type)) errs.afbeelding = "Kies een webp-, png- of jpeg-bestand.";
          else if (file.size > max) errs.afbeelding = `De foto is groter dan ${app.config.limieten.afbeeldingKB} KB.`;
          else if (!credit) errs._credit = "Vul de bron en rechten van de foto in.";
          else {
            const url = await new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(file); });
            const dim = await new Promise((ok) => { const im = new Image(); im.onload = () => ok([im.naturalWidth, im.naturalHeight]); im.onerror = () => ok(null); im.src = url; });
            if (!dim) errs.afbeelding = "Deze foto kan niet worden gelezen.";
            else Object.assign(obj, { afbeelding: url, breedte: dim[0], hoogte: dim[1], afbeeldingAlt: `Fles ${obj.naam}`, credit: { title: credit, creator: "", license: "", sourceUrl: "", changes: "" } });
          }
        }
        const cat = app.categories().find((c) => c.id === obj.categorie);
        Object.assign(obj, { categorieLabel: cat?.label || "", bron: obj.bron || "concept", prijs: app.config.prijzenBevestigd ? obj.prijs ?? null : null, voorraad: obj.voorraad ?? null });
        if (Object.keys(errs).length) { st.values = obj; st.errors = errs; return again(); }
      }
      const others = type === "pick" ? [] : LIST[type](app.data).filter((x) => x.id !== id).map((x) => x.id);
      if (type === "product") var errors = validators.product(obj, { ...ctx(app), andereIds: others });
      else if (type === "event") errors = validators.event(obj);
      else if (type === "pick") errors = validators.pick(obj, ctx(app));
      else errors = validators[type](obj, ctx(app));
      if (type !== "product" && type !== "pick" && others.includes(obj.id)) errors.id = "Deze id bestaat al.";
      if (Object.keys(errors).length) { st.values = obj; st.errors = errors; return again(); }
      const ok = commit(app, (n) => {
        if (type === "pick") n.pick = obj;
        else { const arr = type === "product" ? n.catalog.producten : type === "event" ? n.events.items : type === "gift" ? n.gifts.ideeen : n.stories.items; const i = arr.findIndex((x) => x.id === id); if (i >= 0) arr[i] = obj; else arr.push(obj); }
      });
      if (!ok) return;
      toast("Bewaard in de lokale kopie");
      st.edit = type === "pick" ? { type: "pick", id: "pick" } : null; st.errors = {}; st.values = type === "pick" ? structuredClone(app.data.pick) : null;
      again();
    }
    const onSubmit = (e) => { if (e.target.matches("#aform")) { e.preventDefault(); save(e.target); } };
    const onClick = async (e) => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.tab) { st.tab = b.dataset.tab; st.edit = null; st.errors = {}; if (st.tab === "pick") openEdit("pick", "pick"); return again(); }
      if (b.dataset.logout !== undefined) { st.open = false; st.edit = null; return again(); }
      if (b.dataset.new) { openEdit(b.dataset.new, null); return again("#aform input, #aform select"); }
      if (b.dataset.edit) { const [t, id] = b.dataset.edit.split(":"); openEdit(t, id); return again("#aform input, #aform select"); }
      if (b.dataset.cancel !== undefined) { st.edit = null; st.errors = {}; return again(); }
      if (b.dataset.del) {
        const [t, id] = b.dataset.del.split(":");
        if (t === "product") { const used = [...app.data.stories.items.filter((s) => (s.producten || []).includes(id)).map((s) => `verhaal "${s.titel}"`), ...app.data.gifts.ideeen.filter((g) => g.producten.includes(id)).map((g) => `cadeau "${g.titel}"`), ...(app.data.pick.productId === id ? ["de Golden Pick"] : [])]; if (used.length) return toast(`Kan niet verwijderen: gebruikt in ${used.join(", ")}.`); }
        if (!(await confirmDialog({ title: "Verwijderen?", text: "Dit verwijdert het uit de lokale kopie. Je kunt het herstellen met 'Herstel vorige versie' onder Data.", ok: "Verwijder", danger: true }))) return;
        if (commit(app, (n) => { const arr = t === "product" ? n.catalog.producten : t === "event" ? n.events.items : t === "gift" ? n.gifts.ideeen : n.stories.items; arr.splice(arr.findIndex((x) => x.id === id), 1); })) { toast("Verwijderd"); again(); }
      }
      if (b.dataset.export !== undefined) { download(`taste-club-beheer-${new Date().toISOString().slice(0, 10)}.json`, exportBundle(bundle(app))); toast("Export gemaakt"); }
      if (b.dataset.reset !== undefined && await confirmDialog({ title: "Terug naar de meegeleverde data?", text: "Je lokale wijzigingen worden uit de app gehaald. Er blijft een back-up waarmee je dit kunt terugdraaien.", ok: "Terug", danger: true })) { app.resetOverrides(); toast("Teruggezet"); again(); }
      if (b.dataset.restore !== undefined && await confirmDialog({ title: "Vorige versie herstellen?", text: "De lokale kopie van vlak voor je laatste import, reset of wijziging komt terug.", ok: "Herstel" })) { restoreOverrides(app.local); app.refreshData(); toast("Vorige versie hersteld"); again(); }
    };
    view.addEventListener("submit", onSubmit); view.addEventListener("click", onClick);
    $("#aimp", view)?.addEventListener("change", async (e) => {
      const f = e.target.files[0]; if (!f) return;
      const out = $("#aimp-err", view);
      if (f.size > 4_000_000) { out.innerHTML = "<li>Dit bestand is te groot.</li>"; return; }
      const r = parseBundle(await f.text(), app.config);
      if (!r.ok) { out.innerHTML = r.fouten.slice(0, 8).map((x) => `<li>${x.replace(/[<>&]/g, "")}</li>`).join(""); return; }
      if (!(await confirmDialog({ title: "Import toepassen?", text: "Je huidige lokale kopie wordt vervangen. Er wordt eerst een back-up bewaard.", ok: "Importeer" }))) return;
      if (commit(app, (n) => Object.assign(n, r.data))) { toast("Import gelukt"); st.edit = null; again(); }
    });
    return () => { view.removeEventListener("submit", onSubmit); view.removeEventListener("click", onClick); };
  },
};
