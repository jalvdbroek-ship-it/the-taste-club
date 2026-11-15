// Cadeaukeuze: ideeen uit gifts.json, gewogen op wat de gebruiker koos. Budget werkt alleen met bevestigde prijzen.
export const MESSAGE_MAX = 240;

export function budgetBands(config) {
  if (!config.prijzenBevestigd) return [];
  return [{ id: "tot-25", label: "Tot 25 euro", max: 25 }, { id: "25-50", label: "25 tot 50 euro", min: 25, max: 50 }, { id: "50+", label: "Meer dan 50 euro", min: 50 }];
}

export function ideaPrice(idea, producten) {
  const prijzen = idea.producten.map((id) => producten.find((p) => p.id === id)?.prijs);
  return prijzen.every((p) => typeof p === "number") ? prijzen.reduce((a, b) => a + b, 0) : null;
}

// keuze: { voor, gelegenheid, stijl, budget } (alles optioneel). Geeft ideeen met opgeloste producten, beste eerst.
export function matchGifts(keuze, gifts, catalog, config) {
  const producten = catalog.producten;
  const bands = budgetBands(config);
  const band = bands.find((b) => b.id === keuze.budget);
  const out = [];
  for (const idea of gifts.ideeen) {
    const items = idea.producten.map((id) => producten.find((p) => p.id === id)).filter(Boolean);
    if (items.length !== idea.producten.length) continue;
    let score = 0;
    if (keuze.voor && idea.voor.includes(keuze.voor)) score += 3;
    if (keuze.gelegenheid && idea.gelegenheid.includes(keuze.gelegenheid)) score += 2;
    if (keuze.stijl && idea.stijl.includes(keuze.stijl)) score += 2;
    const asked = [keuze.voor, keuze.gelegenheid, keuze.stijl].filter(Boolean).length;
    if (asked && score === 0) continue;
    if (band) {
      const prijs = ideaPrice(idea, producten);
      if (prijs == null || (band.min != null && prijs < band.min) || (band.max != null && prijs > band.max)) continue;
    }
    out.push({ idea, producten: items, score });
  }
  return out.sort((a, b) => b.score - a.score || a.idea.titel.localeCompare(b.idea.titel, "nl"));
}

// Cadeauboodschap: platte tekst, geen opmaak, begrensd.
export function cleanMessage(text, max = MESSAGE_MAX) {
  return String(text ?? "").replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

// Neutrale deeltekst: geen aanprijzing, wel 18+.
export function shareText({ idee, boodschap = "", winkel }) {
  const lines = [`Cadeau-idee van ${winkel.naam}: ${idee.titel}.`];
  const b = cleanMessage(boodschap);
  if (b) lines.push(`"${b}"`);
  lines.push(`${winkel.straat}, ${winkel.plaats}. Alleen 18+.`);
  return lines.join("\n");
}
