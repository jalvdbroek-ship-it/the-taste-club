// Bouwt src/data/catalog.json uit het voorbeeldassortiment van de website plus redactie.mjs. Run: node tools/maak-catalogus.mjs
import { writeFileSync } from "node:fs";
import { products, categories } from "../../site/assets/js/products.js";
import { redactie } from "./bron/redactie.mjs";

const items = products.map((p) => {
  const r = redactie[p.id];
  if (!r) throw new Error(`redactie ontbreekt voor ${p.id}`);
  return {
    id: p.id, naam: p.name, stijl: p.style, categorie: p.category, categorieLabel: p.categoryLabel, inhoud: p.volume, alcohol: p.abv,
    afbeelding: `public/img/producten/${p.id}.webp`, afbeeldingAlt: `Fles ${p.name}`, breedte: p.imageWidth, hoogte: p.imageHeight,
    herkomst: r.herkomst, smaak: r.smaak, smaakwoorden: r.woorden, momenten: r.momenten, verhaal: r.verhaal, serveer: p.serve,
    prijs: null, voorraad: null, bron: "concept", credit: p.credit,
  };
});
const cats = categories.filter((c) => c.id !== "alles").map((c) => ({ id: c.id, label: c.label }));
writeFileSync(new URL("../src/data/catalog.json", import.meta.url), JSON.stringify({ voorbeeldassortiment: true, categorieen: cats, producten: items }, null, 2) + "\n");
console.log(`${items.length} producten, ${cats.length} categorieen`);
