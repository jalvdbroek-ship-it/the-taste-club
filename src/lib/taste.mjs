// Smaakprofiel en productmatching. Waarden 0..1; elke as loopt van "laag" (0) naar "hoog" (1).
export const AXES = [
  { key: "kruidig", low: "Fruitig", high: "Kruidig", vraag: "Wat past meer bij je?", hulp: "Fruit en zoete geuren, of kruiden, peper en bitters." },
  { key: "vol", low: "Licht", high: "Vol", vraag: "Licht of vol?", hulp: "Een zachte, luchtige drank of een met body en gewicht." },
  { key: "zoet", low: "Droog", high: "Zoet", vraag: "Droog of zoet?", hulp: "Strak en droog, of rond en zoet." },
  { key: "complex", low: "Fris", high: "Complex", vraag: "Fris of complex?", hulp: "Helder en eenvoudig, of met lagen om te ontdekken." },
];
export const MOMENTEN = [
  { id: "aperitief", label: "Aperitief" },
  { id: "long", label: "Lang en fris" },
  { id: "puur", label: "Puur en rustig" },
  { id: "cocktail", label: "In een cocktail" },
];
const ANSWER = { low: 0.15, mid: 0.5, high: 0.85 };

// answers: { kruidig?: "low"|"mid"|"high", ..., categorieen?: string[], moment?: string|null }
export function buildProfile(answers = {}) {
  const profiel = { categorieen: [], moment: null };
  for (const a of AXES) profiel[a.key] = a.key in answers && ANSWER[answers[a.key]] != null ? ANSWER[answers[a.key]] : null;
  if (Array.isArray(answers.categorieen)) profiel.categorieen = [...new Set(answers.categorieen.filter((c) => typeof c === "string"))];
  if (MOMENTEN.some((m) => m.id === answers.moment)) profiel.moment = answers.moment;
  return profiel;
}

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

export function matchScore(profiel, product) {
  const used = AXES.filter((a) => profiel[a.key] != null && typeof product.smaak?.[a.key] === "number");
  let base = 0.6;
  if (used.length) base = 1 - used.reduce((s, a) => s + Math.abs(profiel[a.key] - product.smaak[a.key]), 0) / used.length;
  let bonus = 0;
  if (profiel.categorieen?.length) bonus += profiel.categorieen.includes(product.categorie) ? 0.1 : -0.1;
  if (profiel.moment) bonus += product.momenten?.includes(profiel.moment) ? 0.08 : 0;
  return clamp(base + bonus);
}

export function rankProducts(profiel, producten, limit = 4) {
  return producten
    .map((product) => ({ product, score: matchScore(profiel, product) }))
    .sort((a, b) => b.score - a.score || a.product.naam.localeCompare(b.product.naam, "nl"))
    .slice(0, limit);
}

export const matchLabel = (score) => (score >= 0.8 ? "Sterke match" : score >= 0.65 ? "Goede match" : "Om te verkennen");

// Waarden voor weergave: lege assen vallen terug op het midden.
export const profileValues = (profiel) => AXES.map((a) => ({ ...a, v: profiel?.[a.key] ?? 0.5 }));

// Korte tekst bij het profiel, afgeleid van de uitschieters.
export function describeProfile(profiel) {
  const parts = AXES.filter((a) => profiel[a.key] != null && Math.abs(profiel[a.key] - 0.5) > 0.2)
    .map((a) => (profiel[a.key] > 0.5 ? a.high : a.low).toLowerCase());
  return parts.length ? `Jij houdt van ${parts.join(", ")}.` : "Je smaak is breed: je staat open voor veel stijlen.";
}
