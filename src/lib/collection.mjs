// Persoonlijke collectie in het apparaat (localStorage). Geen accounts, geen verzending.
import { wipeAll } from "./storage.mjs";

export const KEY = "tc.collectie.v1";
export const BACKUP_KEY = "tc.collectie.backup";
export const CORRUPT_KEY = "tc.collectie.corrupt";
export const MAX_COMPARE = 3;
export const NOTE_MAX = 600;

const fresh = () => ({ v: 1, favorieten: [], cadeaus: [], notities: [], profiel: null, vergelijk: [], interesses: [] });
const uniq = (a) => [...new Set(a.filter((x) => typeof x === "string" && x))];
const isDate = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

// Maakt van onbekende invoer een geldige staat; onbekende velden verdwijnen.
export function sanitize(x) {
  const s = fresh();
  if (!x || typeof x !== "object") return s;
  s.favorieten = uniq(Array.isArray(x.favorieten) ? x.favorieten : []);
  s.cadeaus = uniq(Array.isArray(x.cadeaus) ? x.cadeaus : []);
  s.vergelijk = uniq(Array.isArray(x.vergelijk) ? x.vergelijk : []).slice(0, MAX_COMPARE);
  s.notities = (Array.isArray(x.notities) ? x.notities : []).filter((n) => n && typeof n.productId === "string" && isDate(n.datum))
    .map((n) => ({ id: String(n.id || uid()), productId: n.productId, datum: n.datum, beoordeling: Number.isInteger(n.beoordeling) && n.beoordeling >= 1 && n.beoordeling <= 5 ? n.beoordeling : null, tekst: String(n.tekst ?? "").slice(0, NOTE_MAX) }));
  if (x.profiel && typeof x.profiel === "object") {
    const p = x.profiel, num = (v) => (typeof v === "number" && v >= 0 && v <= 1 ? v : null);
    s.profiel = { kruidig: num(p.kruidig), vol: num(p.vol), zoet: num(p.zoet), complex: num(p.complex), categorieen: uniq(Array.isArray(p.categorieen) ? p.categorieen : []), moment: typeof p.moment === "string" ? p.moment : null, datum: isDate(p.datum) ? p.datum : null };
  }
  s.interesses = (Array.isArray(x.interesses) ? x.interesses : []).filter((i) => i && typeof i.eventId === "string")
    .map((i) => ({ eventId: i.eventId, aantal: Math.min(8, Math.max(1, Number.isInteger(i.aantal) ? i.aantal : 1)), datum: isDate(i.datum) ? i.datum : null }));
  return s;
}

export function createCollection(storage, today = () => new Date().toISOString().slice(0, 10)) {
  let state = fresh();
  let lastError = null;
  const listeners = new Set();
  try {
    const rawText = storage.getItem(KEY);
    if (rawText) {
      try { state = sanitize(JSON.parse(rawText)); } catch { storage.setItem(CORRUPT_KEY, rawText); }
    }
  } catch { /* opslag niet beschikbaar */ }

  const save = () => {
    try { storage.setItem(KEY, JSON.stringify(state)); lastError = null; } catch (e) { lastError = e; }
    listeners.forEach((fn) => fn(state));
    return lastError === null;
  };
  const toggle = (list, id) => { const i = state[list].indexOf(id); if (i >= 0) state[list].splice(i, 1); else state[list].push(id); save(); return i < 0; };

  return {
    get state() { return state; },
    get saveFailed() { return lastError !== null; },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    isFav: (id) => state.favorieten.includes(id),
    toggleFav: (id) => toggle("favorieten", id),
    hasGift: (id) => state.cadeaus.includes(id),
    toggleGift: (id) => toggle("cadeaus", id),
    inCompare: (id) => state.vergelijk.includes(id),
    toggleCompare(id) {
      if (state.vergelijk.includes(id)) return toggle("vergelijk", id), true;
      if (state.vergelijk.length >= MAX_COMPARE) return false;
      state.vergelijk.push(id); save(); return true;
    },
    clearCompare() { state.vergelijk = []; save(); },
    addNote(productId, { beoordeling = null, tekst = "" } = {}) {
      const t = String(tekst).trim();
      if (!productId) return { ok: false, fout: "Kies een product." };
      if (!t && beoordeling == null) return { ok: false, fout: "Schrijf iets op of geef een beoordeling." };
      if (t.length > NOTE_MAX) return { ok: false, fout: `Maximaal ${NOTE_MAX} tekens.` };
      if (beoordeling != null && !(Number.isInteger(beoordeling) && beoordeling >= 1 && beoordeling <= 5)) return { ok: false, fout: "Beoordeling is 1 tot en met 5." };
      const note = { id: uid(), productId, datum: today(), beoordeling, tekst: t };
      state.notities.unshift(note); save();
      return { ok: true, note };
    },
    removeNote(id) { const n = state.notities.length; state.notities = state.notities.filter((x) => x.id !== id); save(); return n !== state.notities.length; },
    notesFor: (productId) => state.notities.filter((n) => n.productId === productId),
    setProfile(profiel) { state.profiel = sanitize({ profiel: { ...profiel, datum: today() } }).profiel; save(); return state.profiel; },
    clearProfile() { state.profiel = null; save(); },
    addInterest(eventId, aantal = 1) {
      state.interesses = state.interesses.filter((i) => i.eventId !== eventId);
      state.interesses.push({ eventId, aantal: Math.min(8, Math.max(1, aantal | 0)), datum: today() }); save();
    },
    removeInterest(eventId) { state.interesses = state.interesses.filter((i) => i.eventId !== eventId); save(); },
    hasInterest: (eventId) => state.interesses.some((i) => i.eventId === eventId),
    exportJSON: () => JSON.stringify({ app: "the-taste-club", export: 1, gemaakt: today(), collectie: state }, null, 2),
    // mode "samenvoegen" behoudt wat er al is; "vervangen" bewaart eerst een back-up van de huidige staat.
    importJSON(text, mode = "samenvoegen") {
      let data;
      try { data = JSON.parse(text); } catch { return { ok: false, fout: "Dit bestand is geen geldige JSON." }; }
      if (!data || data.app !== "the-taste-club" || !data.collectie) return { ok: false, fout: "Dit is geen export van The Taste Club." };
      const incoming = sanitize(data.collectie);
      storage.setItem(BACKUP_KEY, JSON.stringify(state));
      if (mode === "vervangen") state = incoming;
      else {
        state.favorieten = uniq([...state.favorieten, ...incoming.favorieten]);
        state.cadeaus = uniq([...state.cadeaus, ...incoming.cadeaus]);
        const ids = new Set(state.notities.map((n) => n.id));
        state.notities = [...state.notities, ...incoming.notities.filter((n) => !ids.has(n.id))];
        state.profiel = state.profiel || incoming.profiel;
      }
      save();
      return { ok: true };
    },
    restoreBackup() {
      const b = storage.getItem(BACKUP_KEY);
      if (!b) return false;
      try { state = sanitize(JSON.parse(b)); save(); return true; } catch { return false; }
    },
    hasBackup: () => !!storage.getItem(BACKUP_KEY),
    wipe() { state = fresh(); const n = wipeAll(storage); listeners.forEach((fn) => fn(state)); return n; },
  };
}
