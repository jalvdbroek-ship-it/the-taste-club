# Wat werkt nu, en wat is demo

Stand: 15 november 2026 · versie 0.1.0 · **demo, ter beoordeling online op https://jalvdbroek-ship-it.github.io/the-taste-club/**.

## Echt werkend (in de browser, getest)

| Onderdeel | Wat het doet |
|---|---|
| Leeftijdspoort | 18+ zelfverklaring per sessie. Geen echte verificatie. "Nee" blokkeert de app |
| Intro en schermovergangen | Eenmalig per sessie, overslaanbaar, valt weg bij "minder beweging" |
| Taste Finder | 6 vragen, smaakprofiel (radar) en passende flessen uit de catalogus |
| Gift Finder | Voor wie, gelegenheid, stijl; cadeauboodschap met voorbeeldkaart; bel de winkel; deel via Web Share (neutrale tekst) |
| My Collection | Favorieten, proefnotities (datum, beoordeling), vergelijken van 2 tot 3 producten, eigen smaakprofiel |
| Producten | Bibliotheek met zoeken en filters, detailscherm met foto-credit |
| The Golden Pick | Magazine-opmaak; videoslot alleen als er een video is |
| Club en Events | Lege staat zolang niets bevestigd is. Bij een bevestigd evenement wordt alleen een **lokale interesse** opgeslagen met de tekst "bel 06 44999844 om te bevestigen" |
| Privacy | Wissen van alle gegevens, export als JSON, back-up en herstel |
| PWA | Manifest, iconen, service worker met offline-lijst en cacheversie. Offline-run getest |
| Voorbeeldcollectie | `#/collectie`: bij een lege collectie laadt één knop drie favorieten, een smaakprofiel, een vergelijking en twee voorbeeldnotities. "Haal het voorbeeld weg" verwijdert alleen het voorbeeld |
| Rondleiding | `#/rondleiding`: vijf stappen langs wat de app kan, gelinkt vanaf de start en Meer |
| Beginscherm | Meer: uitleg voor iPhone en Android; iOS-meta en een apple-touch-icon van 180×180; deelbeeld (`public/img/deelbeeld.jpg`) |
| Beheerprototype | `#/beheer`: producten, afbeelding, Golden Pick, evenementen, cadeau-ideeën, verhalen, export en import met validatie |

## Demo, dus niet echt

| Onderdeel | Waarom |
|---|---|
| Assortiment (11 producten) | Voorbeeldassortiment van de website. Smaakprofielen, herkomst, verhalen en serveertips zijn **concept** (`bron: "concept"`) en zo gemarkeerd |
| Prijzen | Niet getoond: `prijzenBevestigd` staat op `false`. Een prijs in de data zonder die schakelaar wordt door de validatie en de tests geweigerd |
| Voorraad | Niet gekoppeld (`voorraadGekoppeld: false`), dus niet getoond |
| Evenementen | Er is er geen bevestigd. Het voorbeeldevenement wordt nergens als echt getoond |
| Verpakking in Gift Finder | Uit (`verpakking: false`) tot de winkel dit aanbiedt |
| Openingstijden | Niet bevestigd, niet getoond |
| Beheerpincode | **Geen beveiliging**. De pincode staat leesbaar in `config/app.json`. In de demo staat het paneel open op elke host (`toegestaanOpElkeHost: true`), met het label "Demo, alleen op dit apparaat". Zet het voor een echte uitgave op `false`: dan werkt het alleen op localhost of een privénetwerk-adres |
| Beheerwijzigingen | Blijven in de eigen browser (lokale opslag). Ze bereiken andere bezoekers niet. Export is de manier om ze aan te leveren |
| Gebruikersgegevens | Alleen in `localStorage` op het apparaat. Geen account, geen server, geen analytics, geen derde partijen |
| Winkelfunctie | Bestaat niet: geen mand, geen betaling, geen bezorging, geen korting, geen punten |

## Opslagsleutels (moeten kloppen met de privacyverklaring)

`tc.collectie.v1` (favorieten, notities, smaak), `tc.beheer.v1` (lokale beheerkopie), `tc.collectie.backup` en `tc.beheer.backup` (herstel), `tc.leeftijd18`, `tc.intro` en `tc.rm` (sessie- en voorkeursvlaggen). `npm run check` controleert dat er voor een favoriet alleen `tc.collectie.v1` bij komt en dat er geen cookies zijn.

## Controles die draaien

`npm test` (41 tests), `npm run check` (63 controles op 390, 768 en 1280 px: alle routes, flows, geen console-fouten, geen externe verzoeken, offline, reduced motion, privacyclaims), `npm run contrast` (laagste paar 4,85:1), `npm run bundel`.

## Niet getest

Schermlezer (NVDA, VoiceOver), iOS Safari, echte telefoons, https-hosting, installatie vanaf een echt domein, axe-core.
