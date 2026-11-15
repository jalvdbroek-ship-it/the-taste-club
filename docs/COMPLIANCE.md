# Compliance Register: THE TASTE CLUB

Snapshot: 15 november 2026 · Reviewed by: GG Coder (compliance-guard, full review) · **Technische en redactionele richtlijn, geen juridisch advies en geen certificering.**
Hier staat geen "compliant". Het zegt wat is gecontroleerd, wat is ingebouwd en wat open blijft. Alleen de demo staat ter beoordeling online (GitHub Pages, 15 november 2026); een echte uitgave is niet gepubliceerd.

Evidence: **RUNTIME** = in de browser gedraaid (`npm run check`, 63 controles groen) · **CODE** = in de broncode gelezen · **DEDUCED** = afgeleid uit afwezigheid.
Bronmarkering: **[V]** primaire tekst gelezen · **[S]** samenvatting of snapshot, controleer voor gebruik · **[U]** niet gecontroleerd, algemene kennis.

## Aangenomen blootstelling

| Punt | Aanname | Status |
|---|---|---|
| Bereik | Lokaal (`localhost:4300`) en sinds 15 november 2026 als demo op `jalvdbroek-ship-it.github.io/the-taste-club/`: voor iedereen met de link bereikbaar, dus NL-, EU- en daarbuiten | Aangenomen |
| Persoonsgegevens | Alleen wat de gebruiker zelf op eigen apparaat bewaart (favorieten, notities, smaakprofiel). Geen server, geen account | Bevestigd (CODE, RUNTIME) |
| Minderjarigen | Mogelijk, zelfverklaring-poort zonder echte controle | Aangenomen |
| Geld | Geen verkoop, betaling, korting, spaarpunten | Bevestigd (CODE) |
| Domein | **Alcohol** (gereguleerd product, Alcoholwet en Reclamecode) | Bevestigd |
| Derde partijen | Geen scripts, lettertypen, analytics of CDN | Bevestigd (RUNTIME: 0 externe verzoeken in alle routes en flows) |
| Entiteit | Onbekend: wie is verantwoordelijke (De Gouden Kurk, eenmanszaak of bv)? | **Open** |

## Dekkingsregister

### Veiligheid (PRE-DEPLOY BLOCKERS)

| # | Punt | Uitkomst | Bewijs |
|---|---|---|---|
| 1 | Geheimen in client of repo | pass, met opmerking | CODE: geen sleutels. De beheerpincode staat leesbaar in `config/app.json` en is zo gelabeld. `.gitignore` aanwezig |
| 2 | Row-level security | n-a | Geen database |
| 3 | Admin-sleutel in browser | pass | CODE: geen sleutels. Beheerpaneel schrijft alleen naar lokale opslag |
| 4 | Autorisatie alleen in UI | **fail, bewust gedocumenteerd** | De pincode is geen autorisatie. Mitigatie: paneel werkt alleen op lokale/privenetwerk-hosts (`src/lib/env.mjs`, test `env.test.mjs`); er is niets te beschermen want er is geen server. Moet vervangen worden voor publicatie (`BEHEER-UITBREIDING.md`) |
| 4a | Standaarden die toegang geven | pass | CODE: leeftijdspoort start op "niet bevestigd"; `prijzenBevestigd`, `verpakking`, `bevestigd` starten op false |
| 4b | Tenant-isolatie uit client | n-a | Geen tenants |
| 5 | Mass assignment | pass | CODE: formulieren lezen alleen velden uit de spec; import wordt gevalideerd en onbekende velden in de collectie worden weggegooid (`sanitize`, tests) |
| 6 | String-queries | n-a | Geen database |
| 7 | Onbeveiligde interne endpoints | n-a | Geen server-endpoints. `server.js` serveert alleen statische bestanden en verbergt `tests`, `tools`, `docs`, `.git` |
| 8 | Bucket-rechten | n-a | Geen opslag; foto-upload in beheer wordt lokaal als data-URL bewaard, type en grootte begrensd (400 KB) |
| 9 | Rate limiting | n-a | Geen server. Pincode vertraagt na 3 fouten (demo) |
| 10 | Wachtwoordhash | n-a | Geen accounts |
| 11 | Sessies/tokens in localStorage | n-a | Geen tokens |
| 12 | JWT | n-a | |
| 13 | CORS | n-a | Alleen same-origin; CSP `connect-src 'self'` |
| 14 | Kaartgegevens | n-a | Geen betaling |
| 14b | Financiele/identiteitskolommen | n-a | |
| 15 | PII in logs | pass | Geen logging van gebruikersdata. `server.js` logt alleen de startregel |
| 16 | Transportbeveiliging | **open** | Lokaal http. Bij publicatie: https, HSTS. Zie `PUBLICEREN.md` |
| 17 | SSRF | n-a | Geen server-fetch van gebruikers-URL's |
| 18 | Back-up en herstel | n-a, deels | Geen serverdata. Gebruikersdata: export, back-up bij importeren, herstelknop (RUNTIME-test in `check-more`) |

### Privacy, tracking en opslag

| Punt | Uitkomst | Bewijs |
|---|---|---|
| Derde-partij-verzoeken | pass | RUNTIME: 0 externe verzoeken op 13 routes x 3 schermformaten en in alle flows |
| Cookies | pass | RUNTIME: `document.cookie` is leeg |
| Opslag op apparaat voor gebruiker te bewaren | pass, met **LAWYER-opmerking** | RUNTIME: lokale opslag is leeg tot je iets bewaart; na een favoriet staat er alleen `tc.collectie.v1`. Opslag die de gebruiker zelf vraagt (favoriet, notitie) en de leeftijdsverklaring vallen waarschijnlijk onder de vrijstelling voor strikt noodzakelijke opslag (ePrivacy art. 5(3); NL Tw art. 11.7a) **[U]**. Service-worker-cache idem. Laat een jurist dit bevestigen |
| Privacyverklaring klopt met de code | pass | CODE + RUNTIME: lijst in `src/screens/privacy.js` komt overeen met de gevonden sleutels |
| Verwijderen en inzage | pass | RUNTIME: "Wis al mijn gegevens" laat 0 `tc.`-sleutels over; export als JSON |
| Verwerkingsverantwoordelijke en contact | **fail (open)** | Privacyverklaring noemt `[naam, KVK-nummer, privacycontact]` nog niet; ondernemer moet invullen |
| Cookiebanner | n-a | Geen niet-noodzakelijke opslag en geen derde partijen. Voeg er een toe zodra analytics of embeds komen |
| Lettertypen | pass | Lokaal gehost (SIL OFL, licentietekst meegeleverd) |

### Alcohol: minderjarigen, reclame en winkelregels (NL)

| ID | Ernst | Punt | Bewijs en uitkomst |
|---|---|---|---|
| A1 | LAWYER | Leeftijdspoort is een **zelfverklaring**, geen verificatie | CODE/RUNTIME: poort per sessie, "Nee" blokkeert de app, inhoud is `inert` achter de poort. De poort zegt zelf dat leeftijd niet te controleren is. Of dit voldoende is voor een alcoholgerelateerde app is een juridische vraag |
| A2 | HIGH | NIX18 en "Alleen 18+. Geniet, maar drink met mate." | CODE: in poort en in voettekst op elk scherm (RUNTIME: logo met alt-tekst aanwezig). **Open:** het NIX18-logo is hier 64 tot 72 px; de specificatie (`NIX18-grootte-specificaties.pdf`) rekent met beeldoppervlak voor beeldmateriaal. Laat de ondernemer vaststellen of de app-voettekst voldoet |
| A3 | HIGH | Reclamecode Alcoholhoudende Dranken (RvA): de app is mogelijk commerciele communicatie van een verkoper | Inhoud nagelezen tegen de kernregels **[S]**: geen aanzet tot overmatig gebruik, geen sociaal of seksueel succes, geen prestatieclaims, geen verkeer/werk/sport, geen gezondheidsclaims, geen minderjarigen of jeugdbeelden, geen aanprijzing van sterkte. Teksten zijn rustig, "een klein glas, rustig tempo", "ontdekken, niet meer drinken". Artikelnummers niet gecontroleerd: haal ze op bij stiva.nl of reclamecode.nl **[U]** |
| A4 | HIGH | Prijsacties, kortingen, spaarpunten, "club"-voordeel | CODE: geen. "The Taste Club" is geen lidmaatschap: geen aanmelding, geen beloningen, geen challenges. Houd het zo. Voor een ledenprogramma met voordeel eerst juridisch laten toetsen (Alcoholwet beperkt prijsacties) **[U]** |
| A5 | MEDIUM | Verkoop op afstand en bezorging | CODE: niets. Pas bij een webshop komt leeftijdscontrole bij aflevering en vergunningcheck aan de orde **[U]** |
| A6 | LAWYER | Alcoholwetvergunning en eventuele proeverijen (schenken) | Niet beoordeeld. Evenementen zijn niet bevestigd en zonder reservering. Voor proeverijen is vergunning/regelgeving van gemeente Rotterdam relevant **[U]** |
| A7 | MEDIUM | Web Share van cadeautekst | CODE: neutrale tekst (naam, adres, "Alleen 18+"), geen aanprijzing, geen prijs. Test `gifts.test`. Voor Instagram/Facebook gelden de Reclamecode Social Media en Meta-regels; TikTok verbiedt alcoholreclame: het socialpakket zegt dat al. Geen social-functies in de app **[S]** |
| A8 | MEDIUM | Merknamen en flesfoto's | Voorbeeldassortiment met echte merken. Producten tonen merklogo's op etiketten. Gebruik van merken door een verkoper voor eigen aanbod is gebruikelijk, maar de ondernemer moet de assortimentkeuze en beeldrechten bevestigen **[U]** |
| A9 | MEDIUM | Gezondheidsclaims | CODE: geen. "Verantwoord genieten" noemt zwangerschap, verkeer, medicijnen alleen als waarschuwing |

### Rechten op beeld en tekst

| ID | Ernst | Punt | Uitkomst |
|---|---|---|---|
| R1 | MEDIUM | CC BY / CC BY-SA foto's: bronvermelding, licentielink, vermelding van bewerking | pass: onder elk productscherm en in `#/over`. Bewerkte foto's (achtergrond weg, bijgesneden) vallen bij CC BY-SA onder dezelfde licentie; houd die vermelding bij hergebruik **[S]** |
| R2 | MEDIUM | Beheer-upload: eigen foto | Formulier vraagt verplicht om bron en rechten |
| R3 | LOW | Redactionele teksten (herkomst, verhaal, smaakwaarden) | Gemarkeerd als "Concept, niet bevestigd" in de UI. Feitelijke claims over herkomst zijn algemene kennis en niet bronvermeld **[U]**: laat de ondernemer ze bevestigen |

### Toegankelijkheid (per punt)

| Punt | Uitkomst | Bewijs |
|---|---|---|
| Alt-teksten | pass | RUNTIME: `check-lib` vindt op alle routes 0 afbeeldingen zonder alt; decoratieve SVG's zijn `aria-hidden` |
| Labels van velden | pass | RUNTIME: 0 velden zonder label of aria-label |
| Toetsenbord | pass, deels handmatig | RUNTIME: eerste Tab is de sla-over-link; alle knoppen zijn `<button>`/`<a>`; dialogen via `<dialog>.showModal()` (Esc, focusval). Niet getest met schermlezer |
| Contrast | pass | `npm run contrast`: 29 paren gemeten, laagste 4,85:1 (amber/lijn, UI 3:1) |
| Zichtbare focus | pass | RUNTIME: 2 px gouden ring op 10 van 12 Tab-stops in de proef; koppen met `tabindex=-1` tonen bewust geen ring |
| Raakvlakken | pass | RUNTIME: alle knoppen en links >= 44 px op 3 formaten |
| Media | n-a nu | Videoslot (Golden Pick) heeft `controls`; ondertitels moeten bij een echte video worden toegevoegd |
| Paginataal | pass | `<html lang="nl">` |
| Minder beweging | pass | RUNTIME: met reduced-motion geen intro, getekende lijnen direct zichtbaar, geen animatie. Schakelaar in "Meer" |
| EAA/WCAG-status | **LAWYER** | De Europese toegankelijkheidswet geldt voor o.a. webwinkels; deze app verkoopt niets, dus waarschijnlijk buiten bereik **[S]**. De app is gebouwd op WCAG 2.2 AA, maar er is geen audit, geen schermlezertest en geen toegankelijkheidsverklaring. Zeg dus nergens "toegankelijk" of "conform" |

### Minderjarigen

fail-met-mitigatie: er is een echte poort (A1), maar geen verificatie. Er worden geen persoonsgegevens van wie dan ook verzameld, dus de privacykant van kinderen is klein; de alcoholkant (A1 tot A3) is de echte vraag.

## Wat in deze pas is ingebouwd

1. Strikte CSP (header en meta) zonder `unsafe-inline`; RUNTIME bevestigd: 0 CSP-fouten, 0 externe verzoeken.
2. Beheerpaneel alleen op lokale hosts (`env.mjs`).
3. Prijzen, voorraad, verpakking en evenementen bestaan in de UI alleen na bevestiging; geautomatiseerde tests (`data.test`, `gifts.test`) weigeren een prijs zonder `prijzenBevestigd` en een reservering zonder `bevestigd`.
4. Interesse in een evenement is expliciet geen reservering en noemt het telefoonnummer.
5. Wissen, exporteren, back-up en herstel van gebruikersgegevens.
6. Guards: `npm test` (41 tests), `npm run check` (63 controles, incl. privacyclaims), `npm run contrast`.

## Open: besluit van de ondernemer

1. Verwerkingsverantwoordelijke en privacycontact invullen in de privacyverklaring.
2. Bevestigen: assortiment, herkomst en verhaalteksten, openingstijden, prijzen (pas dan `prijzenBevestigd: true`), evenementen.
3. NIX18-weergave in de app laten goedkeuren (A2).
4. Beslissen of beeldrechten en merkgebruik (A8) akkoord zijn, en of eigen productfoto's worden gemaakt.

## Needs a lawyer

A1 (is een zelfverklaring genoeg), A3 en A4 (Reclamecode en prijsregels bij een "club"), A6 (vergunning proeverijen), ePrivacy-vrijstelling voor lokale opslag, EAA-reikwijdte, verantwoordelijkheid bij Web Share.

## Not checked

Geen schermlezer (NVDA/VoiceOver), geen axe-core (niet geinstalleerd; aanbevolen als blokkerende controle zodra een dependency is toegestaan), geen iOS Safari, geen echte apparaten, geen https-hosting, geen juridische bronnen herlezen (RvA-artikelnummers [U]), Meta- en TikTok-voorwaarden niet opnieuw nagelezen (niet nodig zolang er geen sociale functies zijn).

## Re-verify before relying (date-sensitive)

RvA-artikelen en NIX18-grootte (stiva.nl, reclamecode.nl), Tw art. 11.7a en de Digital Omnibus-wijzigingen aan ePrivacy **[S]** (niet wet op dit moment), EAA-uitzonderingen voor kleine bedrijven per lidstaat **[S]**.
