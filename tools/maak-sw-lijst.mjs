// Werkt de offline-lijst (CORE) in sw.js bij na het toevoegen van bestanden. Run: node tools/maak-sw-lijst.mjs
import fs from "node:fs";
import path from "node:path";
let s = fs.readFileSync("sw.js", "utf8");
const a = s.indexOf("const CORE"), b = s.indexOf("];", a) + 2;
const walk = (d) => fs.readdirSync(d).flatMap((f) => { const p = path.join(d, f); return fs.statSync(p).isDirectory() ? walk(p) : [p]; });
const norm = (p) => p.split(path.sep).join("/");
const files = [...walk("src"), ...walk("config"), ...walk("public")].map(norm).filter((p) => !p.endsWith(".txt")).sort();
const list = ["./", "index.html", "manifest.webmanifest", ...files];
s = s.slice(0, a) + "const CORE = [\n" + list.map((x) => `  "${x}",`).join("\n") + "\n];" + s.slice(b);
fs.writeFileSync("sw.js", s);
console.log(`${list.length} bestanden in de offline-lijst`);
