import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { load, root_ } from "./fixtures.mjs";
import { validateDataset, validateProduct, validateEvent, validateStory, validateGift, validatePick } from "../src/lib/validate.mjs";
import { visibleEvents, canReserve, isConfirmed } from "../src/lib/events.mjs";
import { createFileSource, createApiSource, createDataSource, applyOverrides } from "../src/lib/datasource.mjs";
import { readJson } from "./fixtures.mjs";

const d = load();
const cats = d.catalog.categorieen;

test("de meegeleverde data is geldig en alle afbeeldingen bestaan", () => {
  assert.deepEqual(validateDataset({ ...d }), []);
  for (const p of d.catalog.producten) assert.ok(existsSync(root_ + p.afbeelding), p.afbeelding);
});
test("geen prijs en geen voorraad zolang prijzen niet zijn bevestigd", () => {
  assert.equal(d.config.prijzenBevestigd, false);
  for (const p of d.catalog.producten) { assert.equal(p.prijs, null, p.id); assert.equal(p.voorraad, null, p.id); }
});
test("elk product is gemarkeerd als concept en heeft een fotocredit", () => {
  for (const p of d.catalog.producten) { assert.equal(p.bron, "concept"); assert.ok(p.credit.license && p.credit.sourceUrl, p.id); }
});
test("een prijs zonder bevestiging wordt geweigerd, met bevestiging geaccepteerd", () => {
  const p = { ...d.catalog.producten[0], prijs: 19.99 };
  assert.ok(validateProduct(p, { categorieen: cats, prijzenBevestigd: false }).prijs);
  assert.deepEqual(validateProduct(p, { categorieen: cats, prijzenBevestigd: true }), {});
  assert.ok(validateProduct({ ...p, prijs: -1 }, { categorieen: cats, prijzenBevestigd: true }).prijs);
});
test("productvalidatie vangt de gangbare fouten", () => {
  const ok = d.catalog.producten[0];
  const e = validateProduct({ ...ok, id: "Slecht Id", naam: "", categorie: "bier", smaak: { kruidig: 2 }, afbeelding: "http://x/y.png", alcohol: "veel" }, { categorieen: cats });
  for (const k of ["id", "naam", "categorie", "smaak", "afbeelding", "alcohol"]) assert.ok(e[k], k);
  assert.ok(validateProduct(ok, { categorieen: cats, andereIds: [ok.id] }).id);
});
test("een evenement telt pas mee met bevestiging; reserveren vraagt plaatsen en toekomstige datum", () => {
  assert.deepEqual(visibleEvents(d.events.items, "2026-11-15"), []);
  const ev = { id: "e1", titel: "Proeverij", soort: "proeverij", datum: "2026-12-05", plaatsen: 8, bevestigd: true };
  assert.equal(isConfirmed(ev), true); assert.ok(canReserve(ev, "2026-11-15"));
  assert.ok(!canReserve({ ...ev, bevestigd: false }, "2026-11-15")); assert.ok(!canReserve({ ...ev, plaatsen: 0 }, "2026-11-15"));
  assert.ok(!canReserve({ ...ev, datum: "2026-11-01" }, "2026-11-15")); assert.ok(!canReserve({ ...ev, demo: true }, "2026-11-15"));
  assert.equal(visibleEvents([ev, { ...ev, id: "e2", bevestigd: false }], "2026-11-15").length, 1);
  assert.ok(validateEvent({ ...ev, datum: null }).datum); assert.ok(validateEvent({ ...ev, plaatsen: -1 }).plaatsen);
  assert.deepEqual(validateEvent(ev), {});
});
test("verhaal, cadeau en pick-validatie", () => {
  const ids = d.catalog.producten.map((p) => p.id);
  assert.ok(validateStory({ id: "x", titel: "t", tekst: "", status: "klaar", producten: ["nep"] }, { productIds: ids }).status);
  assert.ok(validateGift({ id: "g", titel: "t", tekst: "x", producten: [] }, { productIds: ids }).producten);
  assert.ok(validatePick({ productId: "nep", titel: "x" }, { productIds: ids }).productId);
  assert.ok(validatePick({ ...d.pick, meerInfoUrl: "http://x" }, { productIds: ids }).meerInfoUrl);
  assert.deepEqual(validatePick(d.pick, { productIds: ids }), {});
});
test("DataSource: bestandsbron laadt alles, API-bron meldt eerlijk dat hij niet bestaat", async () => {
  const src = createFileSource(async (p) => readJson(p));
  const data = await src.load();
  assert.deepEqual(Object.keys(data).sort(), ["catalog", "config", "events", "gifts", "pick", "recepten", "stories"]);
  await assert.rejects(createApiSource().load(), { code: "niet-gebouwd" });
  assert.equal(createDataSource("api").id, "api"); assert.equal(createDataSource("x", { read: async () => ({}) }).id, "bestanden");
});
test("overrides vervangen alleen onderdelen die er zijn", () => {
  const out = applyOverrides({ a: 1, catalog: "oud", events: "e" }, { catalog: "nieuw" });
  assert.equal(out.catalog, "nieuw"); assert.equal(out.events, "e"); assert.equal(applyOverrides({ x: 1 }, null).x, 1);
});
