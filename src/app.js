import { createApp } from "./state/app-state.js";
import { startRouter } from "./router.js";
import { renderChrome, onShown, ageGate, playIntro } from "./components/shell.js";

const app = await createApp().catch((e) => {
  document.querySelector("#view").innerHTML = '<section class="screen"><h1>Laden mislukt</h1><p class="muted">De gegevens konden niet worden geladen. Controleer je verbinding en probeer het opnieuw.</p></section>';
  throw e;
});
renderChrome(app);
const justConfirmed = await ageGate(app);
startRouter(app, onShown);
if (justConfirmed) playIntro(app);

if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});
