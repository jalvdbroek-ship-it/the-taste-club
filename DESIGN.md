# Ontwerpthese: THE TASTE CLUB

**Onderwerp, doelgroep, taak:** een besloten-clubgevoel voor 18-plussers in en rond Rozenburg die een fles willen kiezen of begrijpen, zonder te kopen of aangespoord te worden. De app helpt ontdekken, bewaren en cadeau kiezen.

**Signatuur:** *de gouden draad*. Een fijne messinglijn die zich tekent: de ring van het merkteken in de intro, de lijn onder een gekozen stap, de omtrek van het smaakprofiel, de scheidslijn bij de Golden Pick. Daarnaast het **vullen van de fles**: productfoto's onthullen van onder naar boven, als een glas dat zich vult. Twee bewegingen, herkenbaar, rustig.

**Type:** Bodoni Moda in hoofdletters (koppen, cijfers; Didone = editorial gezag), Cormorant italic (accentwoorden die iets betekenen: een naam, een smaakwoord, een citaat), Instrument Sans (UI en tekst). Schaal 1,25. Cijfers tabulair.

**Kleur (OKLCH, gemeten met `npm run contrast`):** nacht, bordeaux (drie stappen), messing, ivoor en gedempt ivoor, amber alleen voor vloeistof. Neutrale tinten hellen licht naar bordeaux. Messing is lijn, cijfer en accent; alleen de primaire knop is een messing vlak (klein oppervlak, zoals op de site).

**Ruimte en materiaal:** basis 4 px, schaal 4/8/12/16/24/32/48/72. Radius per rol: knoppen en velden 10 px, kaarten 14 px, sheets 22 px, chips volledig rond (alleen toggles). Vlakke tonale lagen met een haarlijn; geen schaduwen behalve de zachte vloer-gloed onder flessen.

**Beeld:** echte productfoto's (klein, dus nooit boven hun eigen pixelgrootte), op een donkere "vloer" met licht eronder en fijne korrel. Eigen SVG-lijnillustraties. Geen stockfoto's, geen mensen, geen feest.

**Beweging:** een georkestreerd moment per scherm (intro op home, vullen van de fles op product/Golden Pick, omtrek tekenen op het smaakprofiel); verder feedback van 120 tot 250 ms. Alleen `transform`, `opacity`, `clip-path`, `stroke-dashoffset`. Overgang tussen schermen via View Transitions. Reduced motion: alles statisch en direct zichtbaar, intro vervalt.

**Uitlijning:** een leesrail van 38 rem op mobiel en tablet; op desktop 70 rem met tweekolomslay-outs waar het inhoud dient. Navigatie onderaan op mobiel, bovenaan op desktop.

**Bewust niet gedaan (slop tells):** gecentreerde gradient-hero, drie gelijke icoonkaarten, bento, glasmorfisme, paarse gradient, stat-strips met verzonnen cijfers, schijn-sociaal bewijs, eyebrow boven elke kop, hover-lift. Romeinse cijfers alleen bij echte volgorde (stappen). Cormorant-accent alleen op woorden met betekenis.
