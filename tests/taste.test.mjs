import test from "node:test";
import assert from "node:assert/strict";
import { buildProfile, matchScore, rankProducts, matchLabel, describeProfile, AXES } from "../src/lib/taste.mjs";
import { load } from "./fixtures.mjs";

const { catalog } = load();
const P = catalog.producten;

test("buildProfile zet antwoorden om en negeert onzin", () => {
  const p = buildProfile({ kruidig: "high", vol: "low", zoet: "mid", categorieen: ["gin", "gin", 5], moment: "puur" });
  assert.equal(p.kruidig, 0.85); assert.equal(p.vol, 0.15); assert.equal(p.zoet, 0.5); assert.equal(p.complex, null);
  assert.deepEqual(p.categorieen, ["gin"]); assert.equal(p.moment, "puur");
  assert.equal(buildProfile({ moment: "nacht" }).moment, null);
});
test("droog en kruidig geeft gin boven vermouth", () => {
  const r = rankProducts(buildProfile({ kruidig: "high", zoet: "low", vol: "mid", complex: "mid" }), P, 11);
  const idx = (id) => r.findIndex((x) => x.product.id === id);
  assert.ok(idx("beefeater-london-dry") < idx("martini-bianco"));
  assert.ok(r[0].score >= r.at(-1).score);
});
test("zoet en licht geeft vermouth of rum boven cognac", () => {
  const r = rankProducts(buildProfile({ zoet: "high", vol: "low", kruidig: "low", complex: "low" }), P, 3);
  assert.ok(["martini-bianco", "bacardi-carta-blanca", "havana-club-3"].includes(r[0].product.id));
});
test("categorievoorkeur en serveermoment wegen mee, scores blijven 0..1", () => {
  const base = buildProfile({ kruidig: "mid" });
  const gin = P.find((p) => p.categorie === "gin");
  const metCat = matchScore({ ...base, categorieen: ["gin"] }, gin);
  const zonder = matchScore({ ...base, categorieen: ["rum"] }, gin);
  assert.ok(metCat > zonder);
  assert.ok(matchScore({ ...base, moment: "aperitief" }, P.find((p) => p.id === "campari")) >= matchScore(base, P.find((p) => p.id === "campari")));
  for (const p of P) { const s = matchScore(buildProfile({ kruidig: "high", vol: "high", zoet: "high", complex: "high", categorieen: ["x"] }), p); assert.ok(s >= 0 && s <= 1); }
});
test("zonder antwoorden is er toch een resultaat, en de volgorde is stabiel", () => {
  const a = rankProducts(buildProfile({}), P, 4).map((x) => x.product.id);
  assert.equal(a.length, 4); assert.deepEqual(a, rankProducts(buildProfile({}), P, 4).map((x) => x.product.id));
});
test("labels en beschrijving", () => {
  assert.equal(matchLabel(0.9), "Sterke match"); assert.equal(matchLabel(0.7), "Goede match"); assert.equal(matchLabel(0.3), "Om te verkennen");
  assert.match(describeProfile(buildProfile({ kruidig: "high", zoet: "low" })), /kruidig, droog/);
  assert.match(describeProfile(buildProfile({})), /breed/);
  assert.equal(AXES.length, 4);
});
