// Browsercontrole: node tools/check-app.mjs   (server moet draaien op http://localhost:4300/, of zet BASE)
import { fresh, go, report, shot, fail, browser, state } from "./check-setup.mjs";
import { auditPage } from "./check-lib.mjs";
import { gateFlow, tasteFlow, giftFlow, collectionFlow } from "./check-flow.mjs";
import { adminFlow, motionAndKeyboard, offlineFlow, privacyClaims } from "./check-more.mjs";

const VIEWPORTS = [[390, 844], [768, 1024], [1280, 800]];
const ROUTES = ["", "smaak", "cadeau", "collectie", "pick", "club", "producten", "product/campari", "product/smirnoff-vodka", "meer", "beheer", "privacy", "over"];
const shots = new Set(["", "smaak", "pick", "product/campari", "club", "producten", "meer", "over"]);

for (const [w, h] of VIEWPORTS) {
  console.log(`\n== ${w}x${h}: ${ROUTES.length} routes`);
  const { ctx, page, issues } = await fresh(w, h);
  for (const r of ROUTES) {
    await go(page, r); await page.waitForTimeout(250);
    for (const p of await page.evaluate(auditPage)) fail(`${w} #/${r}`, p);
    if (shots.has(r) && w !== 768) await shot(page, `${w}-${r.replace("/", "-") || "home"}`);
  }
  for (const bad of ["product/bestaat-niet", "bestaat-niet"]) await go(page, bad);
  report(issues, `${w}px`);
  await ctx.close();
}
console.log("\n== flows");
await gateFlow(); await tasteFlow(); await giftFlow(); await collectionFlow(); await adminFlow(); await motionAndKeyboard(); await offlineFlow(); await privacyClaims();
await browser.close();
console.log(state.fails ? `\n${state.fails} probleem/problemen (${state.oks} ok)` : `\nAlles groen (${state.oks} controles)`);
process.exit(state.fails ? 1 : 0);
