// Lokale kopie van de data voor het demo-beheer, met back-up voor elke overschrijving.
import { validateDataset } from "./validate.mjs";
export const ADMIN_KEY = "tc.beheer.v1";
export const ADMIN_BACKUP = "tc.beheer.backup";
const PARTS = ["catalog", "events", "stories", "gifts", "pick"];

export function loadOverrides(storage) {
  try { const t = storage.getItem(ADMIN_KEY); return t ? JSON.parse(t) : null; } catch { return null; }
}
export function saveOverrides(storage, overrides) {
  const prev = storage.getItem(ADMIN_KEY);
  if (prev) storage.setItem(ADMIN_BACKUP, prev);
  storage.setItem(ADMIN_KEY, JSON.stringify(overrides));
}
export function resetOverrides(storage) {
  const prev = storage.getItem(ADMIN_KEY);
  if (prev) storage.setItem(ADMIN_BACKUP, prev);
  storage.removeItem(ADMIN_KEY);
}
export function restoreOverrides(storage) {
  const b = storage.getItem(ADMIN_BACKUP);
  if (!b) return false;
  storage.setItem(ADMIN_KEY, b);
  return true;
}
export const hasAdminBackup = (storage) => !!storage.getItem(ADMIN_BACKUP);

export const exportBundle = (data) => JSON.stringify({ app: "the-taste-club", beheerExport: 1, ...Object.fromEntries(PARTS.map((k) => [k, data[k]])) }, null, 2);

// Import: eerst valideren, dan pas overschrijven. Geeft { ok, fouten, data }.
export function parseBundle(text, config) {
  let b;
  try { b = JSON.parse(text); } catch { return { ok: false, fouten: ["Dit bestand is geen geldige JSON."] }; }
  if (!b || b.app !== "the-taste-club" || b.beheerExport !== 1) return { ok: false, fouten: ["Dit is geen beheerexport van The Taste Club."] };
  const missing = PARTS.filter((k) => !b[k]);
  if (missing.length) return { ok: false, fouten: [`Ontbrekende onderdelen: ${missing.join(", ")}.`] };
  if (!Array.isArray(b.catalog.producten) || !Array.isArray(b.events.items) || !Array.isArray(b.stories.items) || !Array.isArray(b.gifts.ideeen)) return { ok: false, fouten: ["De structuur klopt niet."] };
  const fouten = validateDataset({ catalog: b.catalog, events: b.events, stories: b.stories, gifts: b.gifts, pick: b.pick, config });
  if (fouten.length) return { ok: false, fouten };
  return { ok: true, fouten: [], data: Object.fromEntries(PARTS.map((k) => [k, b[k]])) };
}

// Pincode-controle (demo, geen beveiliging) met eenvoudige vertraging na drie fouten.
export function createPinGate(pin, now = () => Date.now()) {
  let fails = 0, lockedUntil = 0;
  return {
    try(input) {
      if (now() < lockedUntil) return { ok: false, wacht: Math.ceil((lockedUntil - now()) / 1000) };
      if (String(input) === String(pin)) { fails = 0; return { ok: true }; }
      if (++fails >= 3) { lockedUntil = now() + 30000; fails = 0; }
      return { ok: false, wacht: 0 };
    },
  };
}
