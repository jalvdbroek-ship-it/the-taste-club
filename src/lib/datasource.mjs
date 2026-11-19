// Eén DataSource-vorm met twee implementaties: bestanden (nu) en API (contract in docs/API-CONTRACT.md, niet gebouwd).
const FILES = { config: "config/app.json", catalog: "src/data/catalog.json", events: "src/data/events.json", stories: "src/data/stories.json", gifts: "src/data/gifts.json", pick: "src/data/golden-pick.json", recepten: "src/data/recepten.json" };

export function createFileSource(read) {
  return {
    id: "bestanden",
    async load() {
      const entries = await Promise.all(Object.entries(FILES).map(async ([k, path]) => [k, await read(path)]));
      return Object.fromEntries(entries);
    },
  };
}

export function createApiSource() {
  return {
    id: "api",
    async load() {
      const err = new Error("De API-bron is nog niet gebouwd. Zie docs/API-CONTRACT.md.");
      err.code = "niet-gebouwd";
      throw err;
    },
  };
}

export const createDataSource = (kind, opts = {}) => (kind === "api" ? createApiSource() : createFileSource(opts.read));

// Lokale beheerwijzigingen (demo) leggen zich over de bestanden. Sleutels: catalog, events, stories, gifts, pick.
export function applyOverrides(base, overrides) {
  if (!overrides) return base;
  const out = { ...base };
  for (const k of ["catalog", "events", "stories", "gifts", "pick"]) if (overrides[k]) out[k] = overrides[k];
  return out;
}

// Gedeeld door browser en tests: haalt JSON op via fetch.
export const fetchReader = (fetchFn = globalThis.fetch) => async (path) => {
  const res = await fetchFn(path, { cache: "no-cache" });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
};
