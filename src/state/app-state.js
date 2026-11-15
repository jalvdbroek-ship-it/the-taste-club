import { createFileSource, fetchReader, applyOverrides } from "../lib/datasource.mjs";
import { createCollection } from "../lib/collection.mjs";
import { safeLocal, safeSession } from "../lib/storage.mjs";
import { loadOverrides, saveOverrides, resetOverrides } from "../lib/admin-store.mjs";

export async function createApp() {
  const local = safeLocal(), session = safeSession();
  const base = await createFileSource(fetchReader()).load();
  const app = {
    local, session, base,
    config: base.config,
    collection: createCollection(local),
    data: applyOverrides(base, loadOverrides(local)),
    rerender: () => {},
    product: (id) => app.data.catalog.producten.find((p) => p.id === id) || null,
    get products() { return app.data.catalog.producten; },
    categories: () => app.data.catalog.categorieen,
    setOverrides(next) { saveOverrides(local, next); app.data = applyOverrides(base, next); },
    resetOverrides() { resetOverrides(local); app.data = applyOverrides(base, null); },
    refreshData() { app.data = applyOverrides(base, loadOverrides(local)); },
    hasOverrides: () => !!loadOverrides(local),
  };
  return app;
}
