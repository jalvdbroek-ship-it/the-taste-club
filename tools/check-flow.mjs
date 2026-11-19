import { BASE, fresh, go, ok, fail, check, report, shot } from "./check-setup.mjs";

export async function gateFlow() {
  const { ctx, page, issues } = await fresh(390, 844, { adult: false });
  await page.goto(BASE);
  await page.waitForSelector("dialog.gate[open]");
  check(await page.locator("#view").evaluate((e) => e.hasAttribute("inert")), "gate", "inhoud is inert achter de poort");
  await page.click("[data-no]");
  check(await page.locator("#gate-p").innerText().then((t) => /alleen voor mensen van 18/.test(t)), "gate", "'Nee' blokkeert de app");
  check((await page.locator("[data-yes]").count()) === 0, "gate", "na 'Nee' is er geen doorgang");
  await page.reload(); await page.waitForSelector("dialog.gate[open]");
  await page.click("[data-yes]");
  await page.waitForSelector(".intro", { timeout: 3000 });
  ok("gate", "intro start na bevestigen");
  await page.click(".intro__skip");
  check((await page.locator(".intro").count()) === 0, "gate", "intro is over te slaan");
  await page.waitForSelector("#view h1");
  await page.reload(); await page.waitForSelector("#view h1");
  check((await page.locator("dialog.gate").count()) === 0 && (await page.locator(".intro").count()) === 0, "gate", "geen poort en intro meer binnen dezelfde sessie");
  report(issues, "gate"); await ctx.close();
}

export async function tasteFlow() {
  const { ctx, page, issues } = await fresh(390, 844);
  await go(page, "smaak");
  for (let i = 0; i < 4; i++) { await page.locator('.choice[data-val="high"]').click(); await page.waitForSelector(`.steps__i:nth-child(${i + 2})[aria-current]`); }
  check(await page.locator("#taste-body h2").innerText().then((t) => /soorten/i.test(t)), "taste", "stap V: categorie");
  await page.click('[data-cat="gin"]'); await page.click("[data-next]");
  await page.click('[data-moment="aperitief"]'); await page.click("[data-next]");
  await page.waitForSelector(".radar");
  check((await page.locator(".rank").count()) === 4, "taste", "resultaat toont 4 flessen");
  check(await page.locator(".rank a >> nth=1").evaluate((a) => !!a.href), "taste", "resultaat linkt naar product");
  await page.locator(".rank [data-fav] >> nth=0").click();
  await page.click("[data-save]");
  await page.waitForTimeout(300); await shot(page, "390-smaak-resultaat");
  await go(page, "collectie");
  check((await page.locator("#c-prof ~ .card .radar, #c-prof + .card .radar").count()) >= 1, "taste", "profiel staat in collectie");
  check((await page.locator("#c-fav ~ .pgrid .pcard, #c-fav + .pgrid .pcard").count()) === 1, "taste", "favoriet uit resultaat staat in collectie");
  report(issues, "taste"); await ctx.close();
}

export async function giftFlow() {
  const { ctx, page, issues } = await fresh(390, 844);
  await go(page, "cadeau");
  const n0 = await page.locator("#g-list .gift").count();
  await page.click('[data-g="voor"][data-v="partner"]'); await page.click('[data-g="gelegenheid"][data-v="jubileum"]');
  const n1 = await page.locator("#g-list .gift").count();
  check(n1 > 0 && n1 < n0, "gift", `filter verkleint ideeën (${n0} naar ${n1})`);
  check((await page.locator('[data-g="budget"]').count()) === 0, "gift", "geen budgetkeuze zonder bevestigde prijzen");
  await page.fill("#msg", "Bedankt voor alles."); 
  check(await page.locator("#msg-prev").innerText() === "Bedankt voor alles.", "gift", "voorbeeldkaart toont boodschap");
  await page.click("[data-ex='1']");
  check((await page.locator("#msg").inputValue()).length > 5, "gift", "voorbeeldboodschap invulbaar");
  await page.locator("[data-save] >> nth=0").click();
  await page.locator("[data-share] >> nth=0").click();
  await page.waitForSelector(".toast");
  const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => ""));
  check(/Alleen 18\+/.test(clip) || (await page.locator(".toast").innerText()).length > 0, "gift", "delen geeft neutrale tekst of melding");
  check(await page.locator('a[href^="tel:"]').first().isVisible(), "gift", "bel de winkel is zichtbaar");
  check((await page.locator("#wrap").count()) === 0, "gift", "geen verpakking zonder config");
  await page.click('[data-g="voor"][data-v="partner"]');
  await shot(page, "390-cadeau");
  report(issues, "gift"); await ctx.close();
}

export async function collectionFlow() {
  const { ctx, page, issues } = await fresh(390, 844);
  await go(page, "collectie");
  await page.click("[data-sample]");
  await page.waitForSelector("[data-clear-sample]");
  check((await page.locator(".pcard").count()) === 3 && (await page.locator(".cmp-table").count()) === 1, "collectie", "voorbeeldcollectie: drie favorieten en een vergelijking");
  await go(page, "product/campari"); await page.click("[data-fav]");
  await go(page, "collectie");
  await page.click("[data-clear-sample]");
  await page.waitForSelector("[data-clear-sample]", { state: "detached" });
  check((await page.locator(".pcard").count()) === 1 && (await page.locator("[data-sample]").count()) === 0, "collectie", "voorbeeld weg, eigen favoriet blijft staan");
  await go(page, "product/campari"); await page.click("[data-fav]");
  await go(page, "product/campari");
  await page.click("[data-fav]"); await page.click("[data-cmp]");
  await go(page, "product/hennessy-vs");
  await page.click("[data-cmp]");
  await page.locator("details summary").first().click();
  await page.click(".chip[data-rate='4']");
  await page.fill("textarea", "Zacht en warm, met eik.");
  await page.click(".note-form button[type=submit]");
  await page.waitForSelector("#notes .card");
  check(await page.locator("#notes").innerText().then((t) => /Zacht en warm/.test(t)), "collectie", "notitie op productpagina");
  await page.fill("textarea", ""); await page.click(".note-form button[type=submit]");
  check((await page.locator(".field__error").first().innerText()).length > 0, "collectie", "lege notitie geeft foutmelding");
  await go(page, "collectie");
  check((await page.locator(".cmp-table").count()) === 1, "collectie", "vergelijking van 2 producten");
  check((await page.locator("#c-not ~ .list .card, #c-not + .list .card").count()) === 1, "collectie", "notitie in collectie");
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click("[data-export]")]);
  check(/taste-club-collectie/.test(dl.suggestedFilename()), "collectie", "export levert een bestand");
  await shot(page, "390-collectie");
  await page.click("[data-wipe]");
  await page.locator("dialog [data-no]").click();
  check((await page.locator(".pcard").count()) === 1, "collectie", "annuleren wist niets");
  await page.click("[data-wipe]"); await page.locator("dialog [data-yes]").click();
  await page.waitForSelector(".empty");
  check((await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("tc.")).length)) === 0, "collectie", "wissen verwijdert alle eigen opslag");
  report(issues, "collectie"); await ctx.close();
}

// Recepten: de app begint bij de feestdag van nu; buiten een periode staat "Alles" aan en komt de eerstvolgende als tekst.
export async function receptenFlow() {
  for (const [datum, verwacht, status] of [["2026-11-19", "Sinterklaas", /^Nu: Sinterklaas/], ["2027-03-10", "Alles", /^Straks: Halloween/]]) {
    const { ctx, page, issues } = await fresh(390, 844);
    await page.addInitScript((iso) => {
      const t = new Date(`${iso}T12:00:00`).getTime(), Echt = Date;
      globalThis.Date = class extends Echt { constructor(...a) { a.length ? super(...a) : super(t); } static now() { return t; } };
    }, datum);
    await go(page, "recepten"); await page.waitForSelector("#rlist .recept");
    check((await page.locator('[data-f][aria-pressed="true"]').innerText()) === verwacht, "recepten", `${datum}: ${verwacht} staat aan`);
    check(status.test((await page.locator("#rstatus").innerText()).trim()), "recepten", `${datum}: statusregel`);
    if (verwacht === "Sinterklaas") {
      check((await page.locator(".recept").count()) === 1 && /speculaas/i.test(await page.locator(".recept h3").innerText()), "recepten", "Sinterklaas toont het speculaasrecept");
      await page.click('[data-f="kerst"]');
      check((await page.locator(".recept").count()) === 2 && (await page.locator('[data-f="kerst"][aria-pressed="true"]').count()) === 1, "recepten", "Kerst toont twee recepten");
      await go(page, ""); check(/Sinterklaas/.test(await page.locator("#h-recept").innerText()), "recepten", "beginscherm noemt Sinterklaas");
    }
    await go(page, "recepten"); await page.click('[data-f="alles"]');
    check((await page.locator(".recept").count()) === 5 && (await page.locator(".recept[open]").count()) === 0, "recepten", "Alles toont vijf recepten, dicht");
    await page.locator(".recept summary").first().click();
    check((await page.locator(".recept[open] .recept__zonder").count()) === 1, "recepten", "recept opent met versie zonder alcohol");
    report(issues, `recepten ${datum}`);
    await ctx.close();
  }
}
