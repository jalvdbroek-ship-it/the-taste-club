# Benodigde koppelingen voor een echte versie

Nu draait alles op bestanden en lokale opslag. Dit is wat er nodig is om van demo naar productie te gaan. Niets hiervan is gebouwd of besteld.

| Onderdeel | Nodig voor | Opties | Opmerking |
|---|---|---|---|
| Authenticatie voor beheer | Vervangt de demo-pincode | Eigen login met e-mail en wachtwoord (hash met argon2 of bcrypt), of een identiteitsdienst met 2FA | Geen sleutels in de browser. Sessie via HttpOnly-cookie |
| Database | Producten, evenementen, verhalen, cadeau-ideeën, Golden Pick, auditlog | PostgreSQL of SQLite op eigen server, of een beheerde database in de EU | Tabellen volgen `API-CONTRACT.md` |
| Afbeeldingsopslag | Eigen productfoto's | Objectopslag in de EU, of map op de server met formaatlimiet en conversie naar webp | Rechten en bronvermelding per foto bewaren |
| Evenementen en reserveringen | Echte plaatsen en bevestiging | Eigen tabel met plaatsentelling, bevestigingsmail | Dan komt AVG-werk bij: naam en contact zijn persoonsgegevens (doel, bewaartermijn, verwerkersovereenkomst) |
| Voorraad en prijzen | `voorraadGekoppeld` en `prijzenBevestigd` | Kassa- of voorraadsysteem van de winkel via export of API | Alleen tonen wat betrouwbaar is. Eerst vragen welk kassasysteem de winkel heeft |
| E-mail | Bevestigingen | EU-aanbieder met verwerkersovereenkomst | Alleen als reserveringen echt worden gebouwd |
| Hosting | Publiceren | Statische hosting met https en HSTS, of de bestaande website-omgeving | Zie `PUBLICEREN.md` |
| Back-ups | Servergegevens | Dagelijkse database-back-up, een herstelproef | Zie `BEHEER-UITBREIDING.md` |
| Video | Videoslot Golden Pick | Eigen bestand met ondertitels | Videoslot staat klaar, werkt pas met een bestand |
| Analytics | Niet nodig | Alleen als de ondernemer dat wil, en dan met cookie-keuze en privacywijziging | Nu bewust niet aanwezig |

## Wat niet gekoppeld hoeft te worden

Betaling en webshop: de app verkoopt niet en moet dat ook niet gaan doen zonder juridische toets (zie `COMPLIANCE.md`, A4 en A5).
