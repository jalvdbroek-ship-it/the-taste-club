// Opslag-adapter met dezelfde vorm als localStorage; het geheugenvariant wordt in tests en als terugval gebruikt.
export function memoryStorage(seed = {}) {
  const m = new Map(Object.entries(seed));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
    key: (i) => [...m.keys()][i] ?? null,
    get length() { return m.size; },
  };
}
export function safeLocal() {
  try { const s = globalThis.localStorage; s.setItem("tc.test", "1"); s.removeItem("tc.test"); return s; } catch { return memoryStorage(); }
}
export function safeSession() {
  try { const s = globalThis.sessionStorage; s.setItem("tc.test", "1"); s.removeItem("tc.test"); return s; } catch { return memoryStorage(); }
}
export const PREFIX = "tc.";
export function keysOf(storage) {
  const out = [];
  for (let i = 0; i < storage.length; i++) { const k = storage.key(i); if (k && k.startsWith(PREFIX)) out.push(k); }
  return out;
}
export function wipeAll(storage) { const ks = keysOf(storage); ks.forEach((k) => storage.removeItem(k)); return ks.length; }
