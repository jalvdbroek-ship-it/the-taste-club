# UX-structuur

## Gedachte

De app is een **club**, geen winkel: er is geen mand, geen betaling, geen kortingen. De gebruiker komt om iets te leren, te kiezen en te bewaren,
en gaat daarna naar de winkel of belt. Eerst ontdekken, niet meer drinken.

## Navigatie

Onderbalk met vijf items: **Club** (home), **Smaak**, **Cadeau**, **Collectie**, **Meer** (producten, Golden Pick, Club en Events, over, privacy, beheer).
Topbalk met merkteken en terugknop op detailschermen.

## Stromen

1. **Eerste bezoek:** leeftijdspoort (18+) -> cinematische intro (eenmalig per sessie, overslaan mogelijk) -> Home.
2. **Taste Finder:** 6 stappen (fruitig/kruidig, licht/vol, droog/zoet, fris/complex, categorie, serveermoment) -> smaakprofiel (SVG-radar) -> passende producten -> bewaar in collectie.
3. **Gift Finder:** voor wie -> gelegenheid -> budgetband (alleen als prijzen bevestigd) -> stijl -> resultaten -> cadeauboodschap (voorbeeldkaart) -> bel de winkel of deel via Web Share.
4. **Collectie:** favorieten, proefnotities (datum, beoordeling, geen hoeveelheden), vergelijken (2 tot 3), export en alles wissen.
5. **Golden Pick:** een uitgelichte fles als magazinepagina, zonder korting of beloning.
6. **Club en Events:** evenementen uit de data; zonder `bevestigd: true` en plaatsen > 0 geen reservering. De flow slaat lokaal een interesse op en verwijst naar de winkel.
7. **Beheer (demo):** lokale kopie van de data, bewerken, exporteren en importeren van JSON.

## Lege staten (eerlijk)

Geen evenementen bevestigd -> "Nog geen proeverijen gepland. Vraag het aan de toonbank." Prijzen niet bevestigd -> geen prijs, wel "Vraag naar de prijs in de winkel."
Geen favorieten -> uitnodiging om te ontdekken.

## Schermenkaart

`#/` · `#/smaak` · `#/cadeau` · `#/collectie` · `#/pick` · `#/club` · `#/producten` · `#/product/:id` · `#/beheer` · `#/privacy` · `#/over`
