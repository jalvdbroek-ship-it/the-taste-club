// Draait in de pagina: structurele controles per scherm. Geeft een lijst met problemen terug.
export function auditPage() {
  const out = [];
  const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
  if (document.documentElement.scrollWidth > innerWidth + 1) out.push(`horizontale overloop (${document.documentElement.scrollWidth} > ${innerWidth})`);
  const h1 = [...document.querySelectorAll("#view h1")].filter(vis);
  if (h1.length !== 1) out.push(`${h1.length} h1-koppen in de inhoud`);
  for (const el of document.querySelectorAll("#view button, #view a.btn, #view .chip, #view .icon-btn, #view select, #view input:not([type=file]):not([type=checkbox]):not([type=radio]), .nav a, .topbar a, #view summary")) {
    if (!vis(el)) continue;
    if (el.closest(".chip.check") && el.tagName === "INPUT") continue;
    const r = el.getBoundingClientRect();
    if (r.height < 43.5 || r.width < 43.5) out.push(`klein raakvlak ${Math.round(r.width)}x${Math.round(r.height)}: ${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30)}"`);
    const name = (el.getAttribute("aria-label") || el.textContent || el.labels?.[0]?.textContent || el.getAttribute("title") || "").trim();
    if (!name && !["SELECT", "INPUT"].includes(el.tagName)) out.push(`knop of link zonder naam: ${el.outerHTML.slice(0, 80)}`);
  }
  for (const img of document.querySelectorAll("#view img")) {
    if (!img.hasAttribute("alt")) out.push(`afbeelding zonder alt: ${img.getAttribute("src")}`);
    if (!img.getAttribute("width") || !img.getAttribute("height")) out.push(`afbeelding zonder afmetingen: ${img.getAttribute("src")}`);
    if (img.complete && img.naturalWidth && vis(img)) { const r = img.getBoundingClientRect(); if (r.width > img.naturalWidth * 1.05 && img.naturalWidth > 0) out.push(`foto boven eigen pixelgrootte: ${img.getAttribute("src")} ${Math.round(r.width)} > ${img.naturalWidth}`); }
  }
  for (const f of document.querySelectorAll("#view input:not([type=file]):not([type=checkbox]):not([type=radio]):not([type=range]), #view textarea, #view select")) {
    if (vis(f) && !f.labels?.length && !f.getAttribute("aria-label")) out.push(`veld zonder label: ${f.id || f.name}`);
  }
  const ids = [...document.querySelectorAll("[id]")].map((e) => e.id); const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) out.push(`dubbele id's: ${[...new Set(dup)].join(", ")}`);
  if (/€|\bEUR\b/.test(document.querySelector("#view").innerText)) out.push("prijs zichtbaar terwijl prijzen niet bevestigd zijn");
  return out;
}
