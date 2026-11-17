import test from "node:test";
import assert from "node:assert/strict";
import { createCollection, KEY, BACKUP_KEY, CORRUPT_KEY, MAX_COMPARE, NOTE_MAX, SAMPLE } from "../src/lib/collection.mjs";
import { memoryStorage, wipeAll } from "../src/lib/storage.mjs";

const mk = (seed) => { const s = memoryStorage(seed); return [createCollection(s, () => "2026-11-15"), s]; };

test("favoriet aan en uit, en blijft bewaard", () => {
  const [c, s] = mk();
  assert.equal(c.toggleFav("campari"), true); assert.ok(c.isFav("campari"));
  assert.ok(createCollection(s).isFav("campari"));
  assert.equal(c.toggleFav("campari"), false); assert.ok(!c.isFav("campari"));
});
test("notities: validatie, datum en verwijderen", () => {
  const [c] = mk();
  assert.equal(c.addNote("campari", {}).ok, false);
  assert.equal(c.addNote("campari", { beoordeling: 9, tekst: "x" }).ok, false);
  assert.equal(c.addNote("campari", { tekst: "a".repeat(NOTE_MAX + 1) }).ok, false);
  const r = c.addNote("campari", { beoordeling: 4, tekst: " bitter en zacht " });
  assert.ok(r.ok); assert.equal(r.note.datum, "2026-11-15"); assert.equal(r.note.tekst, "bitter en zacht");
  assert.equal(c.notesFor("campari").length, 1);
  assert.ok(c.removeNote(r.note.id)); assert.equal(c.notesFor("campari").length, 0);
});
test("vergelijken is beperkt tot drie", () => {
  const [c] = mk();
  for (const id of ["a", "b", "c"]) assert.ok(c.toggleCompare(id));
  assert.equal(c.toggleCompare("d"), false); assert.equal(c.state.vergelijk.length, MAX_COMPARE);
  c.toggleCompare("a"); assert.ok(c.toggleCompare("d"));
});
test("kapotte opslag gaat niet verloren en breekt de app niet", () => {
  const [c, s] = mk({ [KEY]: "{kapot" });
  assert.deepEqual(c.state.favorieten, []); assert.equal(s.getItem(CORRUPT_KEY), "{kapot");
});
test("onbekende of misvormde velden worden schoongemaakt", () => {
  const [c] = mk({ [KEY]: JSON.stringify({ favorieten: ["x", 5, null], notities: [{ productId: "p", datum: "morgen" }, { productId: "p", datum: "2026-01-01", beoordeling: 9, tekst: 5 }], profiel: { kruidig: 4, categorieen: "gin" } }) });
  assert.deepEqual(c.state.favorieten, ["x"]); assert.equal(c.state.notities.length, 1); assert.equal(c.state.notities[0].beoordeling, null); assert.equal(c.state.profiel.kruidig, null);
});
test("export en import: samenvoegen verliest niets, vervangen maakt een back-up", () => {
  const [a] = mk(); a.toggleFav("campari"); a.addNote("campari", { tekst: "mooi" });
  const dump = a.exportJSON();
  const [b] = mk(); b.toggleFav("gordons-london-dry");
  assert.ok(b.importJSON(dump).ok);
  assert.deepEqual(b.state.favorieten.sort(), ["campari", "gordons-london-dry"]); assert.equal(b.state.notities.length, 1);
  assert.ok(b.importJSON(dump, "vervangen").ok);
  assert.deepEqual(b.state.favorieten, ["campari"]); assert.ok(b.hasBackup());
  assert.ok(b.restoreBackup()); assert.equal(b.state.favorieten.length, 2);
  assert.equal(b.importJSON("niet json").ok, false); assert.equal(b.importJSON('{"app":"x"}').ok, false);
});
test("wis alles verwijdert alleen eigen sleutels", () => {
  const s = memoryStorage({ "andere.app": "1" }); const c = createCollection(s);
  c.toggleFav("x"); c.addInterest("e1", 2); s.setItem(BACKUP_KEY, "{}");
  assert.ok(c.wipe() >= 2); assert.equal(s.getItem("andere.app"), "1"); assert.equal(s.getItem(KEY), null); assert.equal(c.state.favorieten.length, 0);
  assert.equal(wipeAll(s), 0);
});
test("interesse in een evenement bewaart alleen id, aantal en datum", () => {
  const [c] = mk(); c.addInterest("proeverij-1", 99);
  assert.deepEqual(c.state.interesses, [{ eventId: "proeverij-1", aantal: 8, datum: "2026-11-15" }]);
  assert.ok(c.hasInterest("proeverij-1")); c.removeInterest("proeverij-1"); assert.ok(!c.hasInterest("proeverij-1"));
});
test("opslaan dat mislukt (vol) wordt gemeld in plaats van te crashen", () => {
  const s = memoryStorage(); s.setItem = () => { throw new Error("quota"); };
  const c = createCollection(s); c.toggleFav("x"); assert.equal(c.saveFailed, true);
});

test("voorbeeldcollectie: laden vult een lege collectie en blijft bewaard", () => {
  const [c, s] = mk();
  assert.ok(c.isEmpty());
  c.loadSample(["johnnie-walker-black-label", "hennessy-vs", "gordons-london-dry", "campari"]);
  assert.deepEqual(c.state.favorieten, SAMPLE.favorieten);
  assert.equal(c.state.notities.length, 2);
  assert.ok(c.state.notities.every((n) => n.id.startsWith("vb-") && n.datum === "2026-11-15"));
  assert.ok(c.state.profiel && c.state.voorbeeld);
  assert.ok(!c.isEmpty());
  assert.equal(createCollection(s).state.voorbeeld, true);
});
test("voorbeeldcollectie: alleen bestaande flessen, en weghalen laat eigen werk staan", () => {
  const [c] = mk();
  c.toggleFav("campari");
  c.addNote("campari", { tekst: "eigen notitie" });
  c.loadSample(["hennessy-vs", "campari"]);
  assert.deepEqual(c.state.favorieten, ["campari", "hennessy-vs"]);
  assert.equal(c.state.notities.filter((n) => n.id.startsWith("vb-")).length, 1);
  assert.ok(c.clearSample());
  assert.deepEqual(c.state.favorieten, ["campari"]);
  assert.deepEqual(c.state.notities.map((n) => n.tekst), ["eigen notitie"]);
  assert.equal(c.state.profiel, null);
  assert.equal(c.state.voorbeeld, false);
  assert.equal(c.clearSample(), false);
});
