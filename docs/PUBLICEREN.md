# Publiceren: alleen de demo staat online

De demo staat ter beoordeling op GitHub Pages (https://jalvdbroek-ship-it.github.io/the-taste-club/), zonder echte gegevens, zonder verkoop en met het beheerpaneel als gelabelde demo aan (wijzigingen blijven op het eigen apparaat; de pincode staat in de presentatie en is geen beveiliging). Een echte uitgave voor klanten vraagt de punten hieronder.

## Voor het live gaat

1. **Ondernemer bevestigt**: assortiment en teksten, openingstijden, evenementen, prijzen. Pas dan `prijzenBevestigd: true`.
2. **Privacyverklaring invullen**: verwerkingsverantwoordelijke, KVK-nummer en privacycontact (`src/screens/privacy.js`). Nu nog open.
3. **NIX18-weergave** laten goedkeuren (zie `COMPLIANCE.md`, A2).
4. **Juridische toets** op de punten onder "Needs a lawyer" in `COMPLIANCE.md`.
5. **https en headers**: https met HSTS. De CSP staat in `index.html` en `server.js` (`default-src 'self'`). Een statische host moet dezelfde headers meesturen.
6. **Beheerpaneel uit**: zet `toegestaanOpElkeHost` terug op `false` (in de demo staat hij bewust op `true`). Op een publiek domein is het paneel dan uitgeschakeld. Echt beheer vraagt `BEHEER-UITBREIDING.md`.
7. **Echte foto's** (aanbevolen): de huidige productfoto's zijn kleine uitsneden onder CC BY of CC BY-SA. Bij hergebruik blijven bronvermelding en licentie nodig.
8. **Controles opnieuw**: `npm test`, `npm run check`, `npm run contrast`, `npm run bundel`.
9. **Cacheversie ophogen** (`sw.js`, nu `tasteclub-v2`) en `npm run sw-lijst` draaien bij elke wijziging aan bestanden.

## Hosting

Geen build nodig. De hele map zonder `tests`, `tools`, `docs` en `.git` is statisch. De lokale server blokkeert die mappen al; een echte host moet dat ook doen.

## Wat er niet bij hoort

Social-functies, promotie, korting of webshop. Voor die uitbreidingen eerst de regels van Meta, TikTok en de Reclamecode opnieuw nalezen.
