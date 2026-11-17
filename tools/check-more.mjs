import { writeFileSync } from "node:fs";
import { BASE, fresh, go, ok, check, report, shot } from "./check-setup.mjs";

const login = async (page) => { await go(page, "beheer"); if (await page.locator("#pin-i").count()) { await page.fill("#pin-i", "1234"); await page.click("#pin button[type=submit]"); } await page.waitForSelector("#abody"); };

export async function adminFlow() {
  const { ctx, page, issues } = await fresh(390, 844);
  { // De demo staat beheer toe op een publieke host; het label zegt dat het een demo zonder beveiliging is.
    const pub = await ctx.newPage();
    await pub.addInitScript(() => { sessionStorage.setItem("tc.leeftijd18", "ja"); sessionStorage.setItem("tc.intro", "1"); });
    await pub.goto(`${BASE.replace(/\/\/(localhost|127\.0\.0\.1)/, "//taste-club.test")}#/beheer`);
    await pub.waitForSelector("#view h1");
    check((await pub.locator("#pin-i").count()) === 1, "beheer", "pincodescherm op een niet-lokale host (taste-club.test)");
    check(/alleen op dit apparaat/.test(await pub.locator(".demo-note").first().innerText()), "beheer", "label: demo, alleen op dit apparaat");
    await pub.close();
  }
  await go(page, "beheer");
  await page.fill("#pin-i", "0000"); await page.click("#pin button[type=submit]");
  check((await page.locator("#pin-e").innerText()).includes("Onjuiste"), "beheer", "foute pincode wordt geweigerd");
  await page.fill("#pin-i", "1234"); await page.click("#pin button[type=submit]");
  await page.waitForSelector("#abody");
  check((await page.locator("#abody .card").count()) === 11, "beheer", "11 producten in de lijst");
  await page.click("[data-new=product]"); await page.click("#aform button[type=submit]"); await page.waitForTimeout(600);
  check((await page.locator("#aform .field__error").count()) >= 3, "beheer", "leeg product geeft validatiefouten");
  check(await page.locator("#f-naam").getAttribute("aria-invalid") === "true", "beheer", "ongeldig veld is gemarkeerd");
  check((await page.locator("#f-prijs").count()) === 0, "beheer", "geen prijsveld zolang prijzen niet bevestigd zijn");
  await page.fill("#f-naam", "Testfles Rozenburg"); await page.selectOption("#f-categorie", "gin"); await page.fill("#f-stijl", "Proefstijl");
  writeFileSync("docs/screenshots/tmp/t.png", Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"));
  await page.setInputFiles("#f-_foto", "docs/screenshots/tmp/t.png");
  await page.click("#aform button[type=submit]"); await page.waitForTimeout(600);
  check((await page.locator("#f-_credit-e").count()) === 1, "beheer", "foto zonder bronvermelding wordt geweigerd");
  await page.fill("#f-_credit", "Eigen foto test");
  await page.click("#aform button[type=submit]"); await page.waitForTimeout(600);
  await page.waitForFunction(() => document.querySelectorAll("#abody .card").length === 12);
  check((await page.locator("#abody .card").count()) === 12, "beheer", "product toegevoegd");
  await page.click('[data-tab="event"]'); await page.click("[data-new=event]");
  await page.fill("#f-titel", "Kleine proeverij"); await page.fill("#f-tekst", "Een avond aan de toonbank."); await page.fill("#f-datum", "2099-12-05"); await page.fill("#f-plaatsen", "6");
  await page.check('input[name="bevestigd"]'); await page.click("#aform button[type=submit]"); await page.waitForTimeout(600);
  await page.waitForSelector("#abody .card");
  await go(page, "club");
  check((await page.locator("[data-int]").count()) === 1, "beheer", "bevestigd evenement met plaatsen is reserveerbaar in de app");
  await page.click("[data-int]"); await page.waitForSelector("[data-unint]");
  check(await page.locator(".card--gold").innerText().then((t) => /géén reservering/.test(t) && /06 44999844/.test(t)), "club", "interesse is geen schijnbevestiging en noemt het telefoonnummer");
  await go(page, "producten");
  check(await page.locator("#pgrid").textContent().then((t) => t.includes("Testfles Rozenburg")), "beheer", "nieuw product staat in de bibliotheek");
  await shot(page, "390-producten");
  await login(page); await page.click('[data-tab="data"]');
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click("[data-export]")]);
  const path = await dl.path(); const bundle = JSON.parse(await (await import("node:fs/promises")).readFile(path, "utf8"));
  check(bundle.catalog.producten.length === 12 && bundle.events.items.some((e) => e.bevestigd), "beheer", "export bevat wijzigingen");
  bundle.catalog.producten[0].prijs = 9.99; writeFileSync("docs/screenshots/tmp/bad.json", JSON.stringify(bundle));
  await page.setInputFiles("#aimp", "docs/screenshots/tmp/bad.json");
  await page.waitForSelector("#aimp-err li");
  check(/prijs/.test(await page.locator("#aimp-err").innerText()), "beheer", "import met prijs zonder bevestiging wordt geweigerd");
  check((await page.locator("[data-reset]").count()) === 1, "beheer", "reset beschikbaar");
  await page.click("[data-reset]"); await page.locator("dialog [data-yes]").click();
  await page.waitForSelector("[data-restore]");
  await go(page, "producten");
  check((await page.locator(".pcard").count()) === 11, "beheer", "reset brengt de meegeleverde data terug");
  await login(page); await page.click('[data-tab="data"]'); await page.click("[data-restore]"); await page.locator("dialog [data-yes]").click();
  await go(page, "producten");
  check((await page.locator(".pcard").count()) === 12, "beheer", "herstel brengt vorige versie terug");
  await login(page); await page.click('[data-tab="product"]');
  await page.locator('[data-del^="product:campari"]').click();
  check(/gebruikt in/.test(await page.locator(".toast").innerText()), "beheer", "product dat in gebruik is kan niet worden verwijderd");
  report(issues, "beheer"); await ctx.close();
}

export async function motionAndKeyboard() {
  const { ctx, page, issues } = await fresh(390, 844, { adult: false, reduced: true });
  await page.goto(BASE); await page.click("[data-yes]"); await page.waitForSelector("#view h1");
  check((await page.locator(".intro").count()) === 0, "reduced-motion", "intro vervalt");
  await go(page, "smaak");
  for (let i = 0; i < 6; i++) { await page.locator(".choice, [data-next]").first().click(); await page.waitForTimeout(80); if (i === 3) await page.waitForSelector("[data-cat]"); }
  await page.click("[data-next]"); await page.waitForSelector(".radar");
  const dash = await page.locator(".radar .shape").evaluate((e) => getComputedStyle(e).strokeDashoffset);
  check(dash === "0px" || dash === "0", "reduced-motion", "smaakprofiel is direct getekend");
  await go(page, "product/campari");
  check(await page.locator("[data-reveal]").first().evaluate((e) => getComputedStyle(e).opacity === "1" && getComputedStyle(e).animationName === "none"), "reduced-motion", "inhoud direct zichtbaar zonder animatie");
  report(issues, "reduced-motion"); await ctx.close();
  const k = await fresh(390, 844); await go(k.page, "");
  await k.page.keyboard.press("Tab");
  check(await k.page.evaluate(() => document.activeElement.classList.contains("skip")), "toetsenbord", "eerste Tab = sla-over-link");
  let seen = 0;
  for (let i = 0; i < 12; i++) { await k.page.keyboard.press("Tab"); const o = await k.page.evaluate(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle !== "none" && parseFloat(s.outlineWidth) >= 2; }); if (o) seen++; }
  check(seen >= 10, "toetsenbord", `focusring zichtbaar op ${seen} van 12 stops`);
  await k.ctx.close();
}

export async function offlineFlow() {
  const ctx = await (await import("./check-setup.mjs")).browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => { sessionStorage.setItem("tc.leeftijd18", "ja"); sessionStorage.setItem("tc.intro", "1"); });
  const page = await ctx.newPage();
  await page.goto(BASE); await page.waitForSelector("#view h1");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload(); await page.waitForTimeout(500);
  check(await page.evaluate(() => !!navigator.serviceWorker.controller), "offline", "service worker beheert de pagina");
  await ctx.setOffline(true);
  await page.goto(`${BASE}#/product/campari`); await page.reload();
  await page.waitForSelector("#view h1", { timeout: 8000 });
  check((await page.locator("#view h1").innerText()).toLowerCase().includes("campari"), "offline", "productpagina opent zonder internet");
  check(await page.locator(".stage--hero img").evaluate((i) => i.complete && i.naturalWidth > 0), "offline", "afbeelding komt uit de cache");
  await ctx.setOffline(false); await ctx.close();
}

// Privacyclaims uit de privacyverklaring, in de browser gecontroleerd.
export async function privacyClaims() {
  const { ctx, page, issues } = await fresh(390, 844);
  await go(page, ""); await go(page, "smaak"); await go(page, "producten"); await go(page, "over");
  const s = await page.evaluate(() => ({ cookie: document.cookie, local: Object.keys(localStorage), session: Object.keys(sessionStorage) }));
  check(s.cookie === "", "privacy", "er worden geen cookies gezet");
  check(s.local.length === 0, "privacy", `er staat niets in lokale opslag voordat je iets bewaart (${s.local.join(",") || "leeg"})`);
  check(s.session.every((k) => k.startsWith("tc.")), "privacy", "sessieopslag bevat alleen eigen sleutels");
  await go(page, "product/campari"); await page.click("[data-fav]");
  const after = await page.evaluate(() => Object.keys(localStorage));
  check(after.length === 1 && after[0] === "tc.collectie.v1", "privacy", "na een favoriet staat er alleen tc.collectie.v1");
  report(issues, "privacy"); await ctx.close();
}
