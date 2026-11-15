# Van beheerprototype naar echt beheer

Wat `#/beheer` nu is: een bewerkbare lokale kopie van de data in de browser, met validatie, export en import. Wat het niet is: beveiligd, gedeeld of permanent.

## Wat het prototype al kan

Producten toevoegen en bewerken (inclusief foto uit bestandskeuze, max 400 KB, met bron en rechten), Golden Pick kiezen, evenementen, cadeau-ideeën en verhalen (concept of gepubliceerd), validatie per formulier, export als JSON, import met controle en automatische back-up, herstelknop.

## Wat er echt bij moet

| Onderdeel | Eis |
|---|---|
| Authenticatie | Echte login, wachtwoordhash, 2FA voor de beheerder, sessie via HttpOnly-cookie, vertraging na foute pogingen. De pincode verdwijnt |
| Autorisatie | Op de server afgedwongen, per route. Rollen: **beheerder** (alles, schakelaars, gebruikers), **redacteur** (producten, verhalen, Golden Pick, cadeau-ideeën), **lezer** (alleen kijken). Niet alleen in de interface verbergen |
| Database | Producten, evenementen, verhalen, ideeën, pick, gebruikers, auditlog. Migraties in versiebeheer |
| Afbeeldingen | Server-side controle op type en grootte, conversie naar webp, opslag buiten de code, bron en licentie per bestand |
| Auditlog | Wie, wat, wanneer, voor en na. Niet te wijzigen door redacteuren |
| Concept en publicatie | Het onderscheid concept/gepubliceerd uit het prototype blijft. Publiceren vraagt de rol beheerder of redacteur |
| Back-ups | Dagelijks, minstens 14 dagen bewaard, buiten de server opgeslagen, en een herstelproef voordat het live gaat |
| Bevestiging van feiten | Producten met `bron: "concept"` gelden pas als bevestigd na akkoord van de ondernemer. Prijzen pas tonen na `prijzenBevestigd` |
| Verwijderen | Eerst archiveren, dan pas definitief |
| Meerdere gebruikers | "Laatste wijziging wint" is niet genoeg: gebruik een versienummer per record |

## Overgangsroute (zonder server)

Tot er een backend is werkt dit: de ondernemer wijzigt in `#/beheer`, kiest **Exporteer** en levert het JSON-bestand aan. De ontwikkelaar zet de gewijzigde delen in `src/data/*.json`, draait `npm test` en `npm run sw-lijst`, en publiceert na akkoord. Importeren in een andere browser zet de lokale kopie daar ook neer.
