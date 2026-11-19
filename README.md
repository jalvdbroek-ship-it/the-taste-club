# THE TASTE CLUB by De Gouden Kurk

Installeerbare, mobile-first app (PWA) voor slijterij De Gouden Kurk, Raadhuisplein 6, Rozenburg.
Geen webshop: de app helpt je **smaak ontdekken**, **een cadeau kiezen** en **je eigen collectie bijhouden**.

**Status: demo.** Er is geen backend, geen betaling, geen account en geen verkoop. Alles wat je invult blijft in je eigen
browser (localStorage). Prijzen, voorraad en evenementen worden pas getoond als de ondernemer ze bevestigt (zie `config/app.json`).
Alleen 18+. De demo staat ter beoordeling online op GitHub Pages: https://jalvdbroek-ship-it.github.io/the-taste-club/

## Starten

```bash
npm start          # http://localhost:4300/
npm test           # logica-tests (node:test)
npm run check      # browsercontrole met Playwright (server moet draaien)
npm run contrast   # WCAG-contrast van het palet
npm run bundel     # bundelgrootte
```

Geen `npm install` nodig: geen dependencies, geen build. Playwright wordt alleen voor de browsercontrole gebruikt
(wordt gezocht in de GG Coder-installatie).

## Wat zit erin

| Route | Scherm |
|---|---|
| `#/` | Home, The Club (intro, welkom, Golden Pick, verhalen, evenementen) |
| `#/smaak` | Taste Finder: 6 vragen en je smaakprofiel met passende flessen |
| `#/cadeau` | Gift Finder: voor wie, gelegenheid, stijl, cadeauboodschap, bel de winkel, deel |
| `#/collectie` | My Collection: favorieten, proefnotities, vergelijken, smaakprofiel |
| `#/pick` | The Golden Pick, in magazine-opmaak |
| `#/club` | Club en Events: proeverijen en nieuws (leeg tot de ondernemer iets bevestigt) |
| `#/producten`, `#/product/:id` | Productbibliotheek en detail |
| `#/beheer` | Demo-beheerpaneel (pincode is **geen** echte beveiliging) |
| `#/privacy`, `#/over` | Privacy, verantwoord genieten, fotoverantwoording, over de demo |

## Mappen

| Map | Inhoud |
|---|---|
| `config/` | `app.json`: schakelaars (prijzen bevestigd, verpakking, demo-pincode) |
| `src/data/` | `catalog`, `events`, `stories`, `golden-pick`, `gifts` (JSON) |
| `src/lib/` | pure logica (smaak, cadeau, collectie, validatie, datasource) met tests |
| `src/screens/`, `src/components/`, `src/state/` | schermen, gedeelde onderdelen, app-status |
| `public/` | CSS, lettertypen, iconen, afbeeldingen |
| `tests/`, `tools/` | tests, browsercontrole, contrasttool, iconen- en sw-lijstgenerator |
| `docs/` | onderzoek, keuzes, compliance, koppelingen, API-contract, wat werkt nu |

## Functionaliteiten in het kort

- Leeftijdspoort 18+ (zelfverklaring), NIX18 en "drink met mate" op elk scherm
- Taste Finder, Gift Finder (met cadeauboodschap, bel de winkel, Web Share), My Collection (favorieten, proefnotities, vergelijken)
- The Golden Pick, Club en Events (alleen bevestigde evenementen, interesse blijft lokaal), productbibliotheek
- Installeerbaar en offline bruikbaar (manifest, service worker), minder-beweging-modus, toetsenbord en focus
- Geen cookies, geen analytics, geen externe verzoeken; strikte CSP; wissen en exporteren van eigen gegevens
- Demo-beheer met export en import van JSON; in de online demo open als "demo, alleen op dit apparaat"
- Voorbeeldcollectie in één klik, korte rondleiding (`#/rondleiding`) en uitleg om de app op je beginscherm te zetten
- Recepten voor de feestdagen (`#/recepten`): Sinterklaas, Kerst, Oud en nieuw en Halloween, elk recept ook zonder alcohol. De app begint bij de feestdag die nu loopt; de teksten staan in `src/data/recepten.json`, de periodes in `src/lib/feest.mjs`

## Documenten

| Bestand | Inhoud |
|---|---|
| `docs/WERKT-NU.md` | Wat echt werkt en wat demo is |
| `docs/KOPPELINGEN.md` | Externe koppelingen die nodig zijn voor een echte versie |
| `docs/API-CONTRACT.md` | Ontwerp van de API (niet gebouwd) |
| `docs/BEHEER-UITBREIDING.md` | Van beheerprototype naar echt beheer |
| `docs/PUBLICEREN.md` | Checklist voor een echte uitgave (de demo staat online) |
| `docs/COMPLIANCE.md` | Compliance-register met open punten voor ondernemer en jurist |
| `docs/ONDERZOEK.md`, `UX-STRUCTUUR.md`, `KEUZES.md`, `SKILLS.md` | Onderzoek, schermenkaart, technische keuzes, skillkeuze |

Zie `docs/WERKT-NU.md` voor wat echt werkt en wat demo is.
