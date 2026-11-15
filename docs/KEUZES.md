# Keuzes

## Vanilla ES-modules PWA zonder build

Gekozen boven React/Vite. Redenen: geen buildketen voor de ondernemer, kleinste bundel en snelste start op mobiel, eenvoudige offline-cache,
strikte CSP (`default-src 'self'`) zonder uitzonderingen, en hetzelfde bewezen patroon als `Cafetaria-De-Zon-App`. Een framework voegt hier niets toe:
de schermen zijn klein, de staat is een paar lijsten in localStorage. Nadeel: handmatig sjablonen (een getagde `html`-functie met escaping) in plaats van JSX.

## Motion

- **View Transitions API** voor schermovergangen, met fallback naar directe wissel; uit bij reduced motion.
- CSS en WAAPI voor reveals, clip-path-maskers en micro-interacties; `animation-timeline: view()` voor scroll-diepte waar ondersteund, IntersectionObserver als terugval.
- Geen Lenis (native scroll voelt op mobiel beter) en geen GSAP: niets in de app vraagt erom.
- Regels: alleen `transform`, `opacity` en `clip-path`; geen `transition: all`; een georkestreerd moment per scherm; alles heeft een reduced-motion-pad.
- Signatuur: de **gouden draad** (een fijne lijn die zich tekent) en de **kurk-onthulling** van de intro, spaarzaam herhaald op eindschermen. Meer in `DESIGN.md`.

## Data

`DataSource`-interface met twee implementaties: bestandsbron (nu, JSON onder `src/data`) en API-bron (contract in `API-CONTRACT.md`, niet gebouwd).
Beheerwijzigingen leven in een lokale kopie en gaan via JSON export/import naar de echte bestanden.

## Opslag

Alleen `localStorage` op het apparaat. Geen accounts, geen analytics, geen externe verzoeken. Export als JSON en knop "Wis al mijn gegevens".

## Locatie

`de-gouden-kurk-website/the-taste-club`, binnen de werkmap van de opdracht. De mapafspraak in `GG-Projecten/AGENTS.md` noemt `05-Spellen-En-Apps` voor apps; de gebruiker gaf geen toestemming om daar te schrijven, dus de app staat hier en kan later met een gewone verplaatsing naar `05-Spellen-En-Apps/The-Taste-Club-De-Gouden-Kurk`. Website en socialpakket zijn ongewijzigd; assets zijn gekopieerd.
