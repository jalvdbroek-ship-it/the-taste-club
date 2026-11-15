// Validatie van data en beheerformulieren. Elke functie geeft { veld: "melding" } terug; leeg object = geldig.
export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const AS = ["kruidig", "vol", "zoet", "complex"];
const isNum01 = (v) => typeof v === "number" && v >= 0 && v <= 1;
const isDate = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

export function validateProduct(p, { categorieen = [], prijzenBevestigd = false, andereIds = [] } = {}) {
  const e = {};
  if (!p || typeof p !== "object") return { _: "Geen geldig product." };
  if (!SLUG.test(p.id || "")) e.id = "Gebruik kleine letters, cijfers en streepjes.";
  else if (andereIds.includes(p.id)) e.id = "Deze id bestaat al.";
  if (!String(p.naam || "").trim()) e.naam = "Vul een naam in.";
  else if (p.naam.length > 80) e.naam = "Maximaal 80 tekens.";
  if (!categorieen.some((c) => c.id === p.categorie)) e.categorie = "Kies een categorie.";
  if (!String(p.stijl || "").trim()) e.stijl = "Vul de stijl in.";
  if (!p.smaak || AS.some((k) => !isNum01(p.smaak[k]))) e.smaak = "Vier smaakwaarden tussen 0 en 1.";
  if (!p.afbeelding || typeof p.afbeelding !== "string") e.afbeelding = "Kies een afbeelding.";
  else if (!/^(public\/img\/|data:image\/(webp|png|jpeg);base64,)/.test(p.afbeelding)) e.afbeelding = "Onbekend afbeeldingstype.";
  if (p.prijs != null && !prijzenBevestigd) e.prijs = "Een prijs mag pas als prijzen zijn bevestigd (config/app.json).";
  else if (p.prijs != null && !(typeof p.prijs === "number" && p.prijs > 0 && p.prijs < 10000)) e.prijs = "Een prijs is een getal groter dan 0.";
  if (p.alcohol && !/^\d{1,2}([,.]\d)?\s?%$/.test(p.alcohol)) e.alcohol = "Bijvoorbeeld 40% of 37,5%.";
  if (!p.credit && String(p.afbeelding || "").startsWith("public/")) e.credit = "Een foto heeft een bronvermelding nodig.";
  return e;
}

export function validateEvent(ev) {
  const e = {};
  if (!SLUG.test(ev?.id || "")) e.id = "Gebruik kleine letters, cijfers en streepjes.";
  if (!String(ev?.titel || "").trim()) e.titel = "Vul een titel in.";
  if (!["proeverij", "evenement", "nieuws"].includes(ev?.soort)) e.soort = "Kies een soort.";
  if (ev?.bevestigd === true) {
    if (!isDate(ev.datum)) e.datum = "Een bevestigd evenement heeft een datum (JJJJ-MM-DD).";
    if (!Number.isInteger(ev.plaatsen) || ev.plaatsen < 0 || ev.plaatsen > 200) e.plaatsen = "Aantal plaatsen is een geheel getal van 0 tot 200.";
  } else if (ev?.datum != null && !isDate(ev.datum)) e.datum = "Datum als JJJJ-MM-DD.";
  return e;
}

export function validateStory(s, { productIds = [] } = {}) {
  const e = {};
  if (!SLUG.test(s?.id || "")) e.id = "Gebruik kleine letters, cijfers en streepjes.";
  if (!String(s?.titel || "").trim()) e.titel = "Vul een titel in.";
  if (!String(s?.tekst || "").trim()) e.tekst = "Schrijf een tekst.";
  else if (s.tekst.length > 1200) e.tekst = "Maximaal 1200 tekens.";
  if (!["gepubliceerd", "concept"].includes(s?.status)) e.status = "Kies concept of gepubliceerd.";
  if ((s?.producten || []).some((id) => !productIds.includes(id))) e.producten = "Verwijst naar een onbekend product.";
  return e;
}

export function validateGift(g, { productIds = [] } = {}) {
  const e = {};
  if (!SLUG.test(g?.id || "")) e.id = "Gebruik kleine letters, cijfers en streepjes.";
  if (!String(g?.titel || "").trim()) e.titel = "Vul een titel in.";
  if (!String(g?.tekst || "").trim()) e.tekst = "Schrijf een korte toelichting.";
  if (!Array.isArray(g?.producten) || !g.producten.length) e.producten = "Kies minstens een product.";
  else if (g.producten.some((id) => !productIds.includes(id))) e.producten = "Verwijst naar een onbekend product.";
  return e;
}

export function validatePick(pick, { productIds = [] } = {}) {
  const e = {};
  if (!productIds.includes(pick?.productId)) e.productId = "Kies een product uit de catalogus.";
  if (!String(pick?.titel || "").trim()) e.titel = "Vul een titel in.";
  if (pick?.video && !/^public\/|^https:\/\//.test(pick.video)) e.video = "Een video is een bestand in public/ of een https-adres.";
  if (pick?.meerInfoUrl && !/^https:\/\//.test(pick.meerInfoUrl)) e.meerInfoUrl = "Gebruik een https-adres.";
  return e;
}

// Controle van de hele dataset (gebruikt door tests en door import in beheer). Geeft een lijst met meldingen.
export function validateDataset({ catalog, events, stories, gifts, pick, config }) {
  const out = [];
  const ids = catalog.producten.map((p) => p.id);
  const seen = new Set();
  for (const p of catalog.producten) {
    const errs = validateProduct(p, { categorieen: catalog.categorieen, prijzenBevestigd: config.prijzenBevestigd, andereIds: seen.has(p.id) ? [p.id] : [] });
    seen.add(p.id);
    for (const [k, m] of Object.entries(errs)) out.push(`product ${p.id}: ${k}: ${m}`);
  }
  for (const ev of events.items) for (const [k, m] of Object.entries(validateEvent(ev))) out.push(`evenement ${ev.id}: ${k}: ${m}`);
  for (const s of stories.items) for (const [k, m] of Object.entries(validateStory(s, { productIds: ids }))) out.push(`verhaal ${s.id}: ${k}: ${m}`);
  for (const g of gifts.ideeen) for (const [k, m] of Object.entries(validateGift(g, { productIds: ids }))) out.push(`cadeau ${g.id}: ${k}: ${m}`);
  for (const [k, m] of Object.entries(validatePick(pick, { productIds: ids }))) out.push(`golden pick: ${k}: ${m}`);
  return out;
}
