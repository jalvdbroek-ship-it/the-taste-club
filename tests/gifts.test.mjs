import test from "node:test";
import assert from "node:assert/strict";
import { load } from "./fixtures.mjs";
import { matchGifts, budgetBands, cleanMessage, shareText, MESSAGE_MAX } from "../src/lib/gifts.mjs";
import { parseBundle, exportBundle, saveOverrides, loadOverrides, resetOverrides, restoreOverrides, createPinGate, ADMIN_BACKUP } from "../src/lib/admin-store.mjs";
import { isAdultConfirmed, confirmAdult, resetAdult } from "../src/lib/age.mjs";
import { memoryStorage } from "../src/lib/storage.mjs";

const d = load();

test("cadeau-filter weegt wie, gelegenheid en stijl", () => {
  const r = matchGifts({ voor: "partner", gelegenheid: "jubileum", stijl: "puur" }, d.gifts, d.catalog, d.config);
  assert.ok(r.length >= 2); assert.ok(r[0].score >= r.at(-1).score);
  assert.ok(r.every((x) => x.score > 0)); assert.ok(r.every((x) => x.producten.length === x.idea.producten.length));
});
test("zonder keuze komen alle ideeen terug; een onbekend product verbergt het idee", () => {
  assert.equal(matchGifts({}, d.gifts, d.catalog, d.config).length, d.gifts.ideeen.length);
  const kapot = { ...d.gifts, ideeen: [{ ...d.gifts.ideeen[0], producten: ["bestaat-niet"] }] };
  assert.equal(matchGifts({}, kapot, d.catalog, d.config).length, 0);
});
test("budget bestaat niet zolang prijzen niet bevestigd zijn", () => {
  assert.deepEqual(budgetBands(d.config), []);
  const a = matchGifts({ budget: "tot-25" }, d.gifts, d.catalog, d.config); assert.equal(a.length, d.gifts.ideeen.length);
});
test("met bevestigde prijzen filtert budget; idee zonder prijs valt af", () => {
  const cfg = { ...d.config, prijzenBevestigd: true };
  const cat = { ...d.catalog, producten: d.catalog.producten.map((p, i) => ({ ...p, prijs: 10 + i * 10 })) };
  const r = matchGifts({ budget: "tot-25" }, d.gifts, cat, cfg);
  assert.ok(r.length > 0 && r.length < d.gifts.ideeen.length);
  const zonder = matchGifts({ budget: "tot-25" }, d.gifts, d.catalog, cfg); assert.equal(zonder.length, 0);
});
test("cadeauboodschap en deeltekst blijven neutraal en begrensd", () => {
  assert.equal(cleanMessage("  hoi\n\n\tdaar\u0000 "), "hoi daar");
  assert.equal(cleanMessage("x".repeat(500)).length, MESSAGE_MAX);
  const t = shareText({ idee: { titel: "De vertrouwde whisky" }, boodschap: "Bedankt", winkel: d.config.winkel });
  assert.match(t, /Alleen 18\+/); assert.match(t, /Bedankt/); assert.ok(!/korting|actie|gratis/i.test(t));
});
test("beheerimport: ongeldige of onvolledige bestanden worden geweigerd, geldige geaccepteerd", () => {
  assert.equal(parseBundle("{x", d.config).ok, false);
  assert.equal(parseBundle("{}", d.config).ok, false);
  assert.equal(parseBundle(JSON.stringify({ app: "the-taste-club", beheerExport: 1, catalog: d.catalog }), d.config).ok, false);
  const good = exportBundle({ catalog: d.catalog, events: d.events, stories: d.stories, gifts: d.gifts, pick: d.pick });
  assert.ok(parseBundle(good, d.config).ok);
  const bad = JSON.parse(good); bad.catalog.producten[0].prijs = 12;
  const r = parseBundle(JSON.stringify(bad), d.config); assert.equal(r.ok, false); assert.match(r.fouten[0], /prijs/);
});
test("beheeropslag: back-up bij overschrijven en herstel", () => {
  const s = memoryStorage();
  saveOverrides(s, { catalog: 1 }); saveOverrides(s, { catalog: 2 });
  assert.equal(s.getItem(ADMIN_BACKUP), '{"catalog":1}');
  resetOverrides(s); assert.equal(loadOverrides(s), null);
  assert.ok(restoreOverrides(s)); assert.equal(loadOverrides(s).catalog, 2);
  assert.equal(restoreOverrides(memoryStorage()), false);
});
test("pincode-poort: foute pogingen vertragen, goede pincode werkt", () => {
  let t = 0; const g = createPinGate("1234", () => t);
  assert.equal(g.try("0000").ok, false); g.try("1"); assert.equal(g.try("2").ok, false);
  assert.ok(g.try("1234").wacht > 0); t += 31000; assert.ok(g.try("1234").ok);
});
test("leeftijdspoort: zelfverklaring per sessie", () => {
  const s = memoryStorage();
  assert.equal(isAdultConfirmed(s), false); assert.ok(confirmAdult(s)); assert.equal(isAdultConfirmed(s), true);
  resetAdult(s); assert.equal(isAdultConfirmed(s), false);
  const kapot = { getItem() { throw new Error("x"); }, setItem() { throw new Error("x"); } };
  assert.equal(isAdultConfirmed(kapot), false); assert.equal(confirmAdult(kapot), false);
});
