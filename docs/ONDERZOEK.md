# Onderzoek

## De winkel (bevestigde feiten)

De Gouden Kurk, slijterij, Raadhuisplein 6, 3181 CG Rozenburg, telefoon 06 44999844. Ruim 340 spiritualien. Open sinds januari 2026
in het voormalige pand van De Tuinwijzer. Bron: `social-media/brand-guidelines`.

**Niet bevestigd, dus nergens als feit in de app:** openingstijden, prijzen, voorraad, evenementen, proeverijen, bezorging, webshop,
verpakkingsservice.

## Huisstijl van de website (`site/v2`)

- Palet: nacht `#0a0908`, wijn `#3a1315`, messing `#d9b468` (alleen lijn, cijfer, accent), ivoor `#f5efe6`, amber `#b5651d`.
- Lettertypen (lokale woff2, SIL OFL): Bodoni Moda (koppen, kapitalen), Cormorant italic (accentwoorden en citaten), Instrument Sans (tekst en UI).
- Beeld: eigen illustraties, fijne korrel, gouden lijn als kader, merkteken (cirkel met fles en sterretje). Geen feestbeelden, geen mensen onder 25.
- Toon: warm, nuchter, je-vorm, kort. Nooit aanprijzen, nooit "feestje", nooit sociaal succes of dronkenschap.
- Techniek: statische site, strikte CSP, geen derde-partij-verzoeken, GSAP en Lenis lokaal, leeftijdspoort per sessie.

## Productdata

`site/assets/js/products.js` bevat 11 producten als **voorbeeldassortiment met demonstratieprijzen**. Foto's zijn kleine 2D-uitsnedes
(100 tot 340 px breed) onder CC BY of CC BY-SA, met verplichte bronvermelding. Daarom:

- prijzen en beschikbaarheid worden niet getoond zolang `prijzenBevestigd` in `config/app.json` false is;
- smaakprofiel, herkomst en serveertips zijn redactioneel concept en dragen `bron: "concept"` tot de ondernemer ze bevestigt;
- fotocredits staan zichtbaar in de app (productdetail en `#/over`).

## Voorbeeldproject

`05-Spellen-En-Apps/Cafetaria-De-Zon-App` is een vanilla-ES-module-PWA zonder build, met hash-router, View Transitions,
service worker met offline-lijst en test, demo-beheer, contrasttool en Playwright-controles. Dat patroon is hier hergebruikt.

## Techniek en regels

- Alleen 18+: leeftijdspoort is een zelfverklaring, geen echte verificatie (documentatie zegt dat).
- NIX18 en "Alleen 18+. Geniet, maar drink met mate." in poort en voettekst.
- Reclamecode Alcoholhoudende Dranken (RvA), Alcoholwet en Meta/TikTok-regels gelden voor wat later wordt gedeeld; de app zelf deelt alleen via Web Share met neutrale tekst. Details in `COMPLIANCE.md`.
- AVG: alleen lokale opslag op het apparaat, geen analytics, geen accounts, geen externe verzoeken.
