# API-contract (ontwerp, niet gebouwd)

`src/lib/datasource.mjs` heeft één vorm met twee bronnen: **bestanden** (nu) en **API** (`createApiSource`, gooit nu een duidelijke fout `niet-gebouwd`). De app roept alleen `source.load()` aan en verwacht dit resultaat:

```json
{ "config": {}, "catalog": {}, "events": {}, "stories": {}, "gifts": {}, "pick": {} }
```

Elke sleutel heeft dezelfde vorm als het bijbehorende bestand in `config/` en `src/data/`. De API hoeft dus alleen die zes JSON-documenten te leveren. Validatie staat in `src/lib/validate.mjs` en kan aan de serverkant hergebruikt worden.

## Publieke leesroutes

| Methode | Pad | Antwoord |
|---|---|---|
| GET | `/api/v1/bundle` | Alle zes documenten in één antwoord (voor opstarten en offline cache) |
| GET | `/api/v1/config` | `config/app.json` zonder `beheer` |
| GET | `/api/v1/catalog` | `{ categorieen, producten }` |
| GET | `/api/v1/events` | `{ items }`, voor publiek alleen met `bevestigd: true` |
| GET | `/api/v1/stories` | `{ items }`, voor publiek alleen met `status: "gepubliceerd"` |
| GET | `/api/v1/gifts` | `{ voor, gelegenheden, stijlen, ideeen }` |
| GET | `/api/v1/pick` | Golden Pick-document |

Antwoorden: `200` JSON, `304` bij ongewijzigde ETag, `5xx` als `{ "fout": "melding" }`. De app valt bij een fout terug op de gecachete versie en toont een foutscherm met "Opnieuw proberen".

## Beheerroutes (alleen na echte aanmelding)

| Methode | Pad | Doel | Rol |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Sessie starten (HttpOnly-cookie) | iedereen |
| POST | `/api/v1/auth/logout` | Sessie beëindigen | beheerder, redacteur |
| POST / PUT / DELETE | `/api/v1/admin/products[/:id]` | Product maken, wijzigen, verwijderen | beheerder, redacteur |
| POST | `/api/v1/admin/images` | Foto uploaden (type, grootte, bron en rechten verplicht) | beheerder, redacteur |
| PUT | `/api/v1/admin/pick` | Golden Pick kiezen | beheerder, redacteur |
| POST / PUT / DELETE | `/api/v1/admin/events[/:id]` | Evenement | beheerder |
| POST / PUT | `/api/v1/admin/stories[/:id]` | Verhaal als concept of gepubliceerd | beheerder, redacteur |
| POST / PUT | `/api/v1/admin/gifts[/:id]` | Cadeau-idee | beheerder, redacteur |
| PUT | `/api/v1/admin/config` | Schakelaars (`prijzenBevestigd`, `verpakking`) | alleen beheerder |
| GET | `/api/v1/admin/audit` | Auditlog | alleen beheerder |

Regels: de server valideert met dezelfde regels als `validate.mjs` (geen prijs zonder `prijzenBevestigd`, geen bevestigd evenement zonder datum en plaatsen). Onbekende velden worden genegeerd. Elke wijziging schrijft een auditregel (wie, wat, wanneer, voor en na).

## Voorbeeld: product

```json
{ "id": "campari", "naam": "Campari", "stijl": "Bitter", "categorie": "likeuren",
  "smaak": { "kruidig": 0.7, "vol": 0.5, "zoet": 0.4, "complex": 0.6 },
  "afbeelding": "/media/campari.webp", "prijs": null, "voorraad": null,
  "bron": "bevestigd" }
```

## Gebruikersgegevens

Blijven op het apparaat. Komen er later accounts of reserveringen, dan komt er een aparte, op privacy beoordeelde API bij (aanmelding, inzage, verwijdering).
