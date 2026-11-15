import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("..", import.meta.url));
export const readJson = (p) => JSON.parse(readFileSync(root + p, "utf8"));
export const root_ = root;
export const load = () => ({ config: readJson("config/app.json"), catalog: readJson("src/data/catalog.json"), events: readJson("src/data/events.json"), stories: readJson("src/data/stories.json"), gifts: readJson("src/data/gifts.json"), pick: readJson("src/data/golden-pick.json") });
