import { html, $, reducedMotion, stagger } from "./lib/dom.js";

// [patroon, tab, laadfunctie]
const ROUTES = [
  [/^\/$/, "home", () => import("./screens/home.js")],
  [/^\/smaak$/, "smaak", () => import("./screens/taste.js")],
  [/^\/cadeau$/, "cadeau", () => import("./screens/gift.js")],
  [/^\/collectie$/, "collectie", () => import("./screens/collection.js")],
  [/^\/pick$/, "meer", () => import("./screens/pick.js")],
  [/^\/club$/, "meer", () => import("./screens/club.js")],
  [/^\/producten$/, "meer", () => import("./screens/products.js")],
  [/^\/product\/([a-z0-9-]+)$/, "meer", () => import("./screens/product.js")],
  [/^\/meer$/, "meer", () => import("./screens/more.js")],
  [/^\/beheer$/, "meer", () => import("./screens/admin.js")],
  [/^\/privacy$/, "meer", () => import("./screens/privacy.js")],
  [/^\/over$/, "meer", () => import("./screens/about.js")],
  [/^\/rondleiding$/, "meer", () => import("./screens/tour.js")],
];

export function startRouter(app, onShown) {
  const view = $("#view");
  let cleanup = null, first = true, token = 0, vt = null, current = null;

  async function show({ keepScroll = false, focus = null } = {}) {
    const mine = ++token;
    const path = location.hash.replace(/^#/, "") || "/";
    const hit = ROUTES.map(([re, tab, load]) => [re.exec(path), tab, load]).find(([m]) => m);
    if (!hit) { view.innerHTML = html`<section class="screen"><h1 tabindex="-1">Niet gevonden</h1><p class="muted">Deze pagina bestaat niet.</p><a class="btn" href="#/">Naar The Club</a></section>`.s; onShown({ tab: "home", path, title: "Niet gevonden" }); return; }
    const [m, tab, load] = hit;
    let screen;
    try { screen = (await load()).default; } catch {
      view.innerHTML = html`<section class="screen"><h1 tabindex="-1">Dit scherm kon niet laden</h1><p class="muted">Misschien ben je offline. Probeer het opnieuw.</p><a class="btn" href="#/">Naar The Club</a></section>`.s;
      onShown({ tab, path, title: "Fout" });
      return;
    }
    if (mine !== token) return;
    const params = m.slice(1);
    const paint = async () => {
      const out = await screen.render(app, ...params);
      if (mine !== token) return;
      cleanup?.();
      view.innerHTML = out.s;
      view.dataset.route = path;
      stagger(view);
      cleanup = screen.mount?.(view, app, ...params) || null;
      onShown({ tab, path, title: typeof screen.title === "function" ? screen.title(app, ...params) : screen.title });
      if (!keepScroll) scrollTo(0, 0);
      if (focus) view.querySelector(focus)?.focus({ preventScroll: true });
      else if (!first && !keepScroll) { const h = view.querySelector("h1"); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
      first = false;
    };
    const animate = document.startViewTransition && !vt && !reducedMotion() && !first && !keepScroll && current !== path;
    current = path;
    if (animate) {
      vt = document.startViewTransition(paint);
      vt.finished.catch(() => {}).finally(() => { vt = null; });
      await vt.updateCallbackDone.catch(() => {});
    } else await paint();
  }

  app.rerender = (opts = {}) => show({ keepScroll: true, ...opts });
  addEventListener("hashchange", () => show());
  show();
}
