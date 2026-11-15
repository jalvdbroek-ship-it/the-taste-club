import { fresh, go, browser } from "./check-setup.mjs";
const { page } = await fresh(390, 700);
await go(page, "product/hennessy-vs");
await page.reload(); await page.waitForSelector(".fill"); await page.waitForTimeout(1050);
await page.screenshot({ path: "docs/screenshots/tmp/fill-mid.png", clip: { x: 0, y: 40, width: 390, height: 460 } });
await browser.close();
