import test from "node:test";
import assert from "node:assert/strict";
import { load } from "./fixtures.mjs";
import { huidigeFeestdag, inPeriode, receptenVoor } from "../src/lib/feest.mjs";

const d = load();
const { feestdagen, recepten } = d.recepten;
const op = (iso) => huidigeFeestdag(feestdagen, new Date(`${iso}T12:00:00`));

test("de periode volgt de datum: Halloween, Sinterklaas, Kerst, Oud en nieuw", () => {
  const verwacht = { "2026-10-01": "halloween", "2026-10-31": "halloween", "2026-11-01": "sinterklaas", "2026-11-19": "sinterklaas", "2026-12-05": "sinterklaas", "2026-12-06": "kerst", "2026-12-26": "kerst", "2026-12-27": "oud-en-nieuw", "2026-12-31": "oud-en-nieuw", "2027-01-01": "oud-en-nieuw", "2027-01-02": "oud-en-nieuw" };
  for (const [iso, id] of Object.entries(verwacht)) { const r = op(iso); assert.equal(r.feestdag.id, id, iso); assert.equal(r.actief, true, iso); }
});
test("buiten een periode komt de eerstvolgende feestdag, niet actief", () => {
  assert.deepEqual([op("2027-01-03").feestdag.id, op("2027-01-03").actief], ["halloween", false]);
  assert.deepEqual([op("2027-06-15").feestdag.id, op("2027-06-15").actief], ["halloween", false]);
  assert.equal(op("2027-09-30").feestdag.id, "halloween");
});
test("elke datum valt in hoogstens één periode", () => {
  for (let dag = 0; dag < 366; dag++) {
    const datum = new Date(2026, 0, 1 + dag);
    assert.ok(feestdagen.filter((f) => inPeriode(f, datum)).length <= 1, datum.toDateString());
  }
});
test("elke feestdag heeft een recept en elk recept is compleet", () => {
  for (const f of feestdagen) assert.ok(receptenVoor(recepten, f.id).length >= 1, f.id);
  for (const r of recepten) {
    assert.ok(feestdagen.some((f) => f.id === r.feestdag), r.id);
    for (const k of ["naam", "intro", "glazen", "tijd", "zonderAlcohol", "tip"]) assert.ok(r[k], `${r.id}: ${k}`);
    assert.ok(r.ingredienten.length >= 3 && r.bereiding.length >= 3, r.id);
    for (const id of r.producten) assert.ok(d.catalog.producten.some((p) => p.id === id), `${r.id}: onbekend product ${id}`);
  }
});
test("geen prijzen, acties of punt aan het eind van een kop", () => {
  const tekst = JSON.stringify(d.recepten);
  assert.doesNotMatch(tekst, /€|euro|korting|gratis|aanbieding|actie\b/i);
  for (const t of [...feestdagen.map((f) => f.naam), ...recepten.map((r) => r.naam)]) assert.doesNotMatch(t, /[.!:]$/, t);
});
