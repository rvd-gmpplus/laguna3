# Schema van docs/onderdeelnummers.csv

`docs/onderdeelnummers.csv` is de platte uitvoer van de nummergegevens in `data/pn/`, bedoeld voor wie de nummers buiten de
pagina wil gebruiken (spreadsheet, script). De pagina zelf leest dezelfde gegevens als `PN_DATA` uit `src/partnumbers.js`.
Beide bestanden maakt `python3 tools/orkestratie/build_pn.py`; niemand bewerkt ze met de hand. `python3 tools/pncheck.py`
bouwt ze in het geheugen opnieuw en vergelijkt byte voor byte met wat gecommit is. De aantallen (rijen, bronnen, nummers)
staan in `docs/cijfers.md` en in de statistiek die `build_pn.py` afdrukt; dit document herhaalt ze niet.

## Bestandsvorm

| Kenmerk | Waarde |
|---|---|
| Codering | UTF-8 zonder BOM |
| Scheidingsteken | puntkomma (`;`) |
| Regeleinde | CRLF (`\r\n`), ook op de laatste regel; `.gitattributes` houdt dat zo (`*.csv -text`) |
| Kopregel | ja, de 23 kolomnamen hieronder, in deze volgorde |
| Aanhalen | alleen als het veld een puntkomma, een dubbel aanhalingsteken of een regeleinde bevat; dan staat het veld tussen dubbele aanhalingstekens en is een aanhalingsteken erin verdubbeld (RFC 4180, Python `csv` met `QUOTE_MINIMAL`) |
| Getallen | decimale komma in maten (`Ø 66 mm, breedte 32 mm`); `diepte` is een geheel getal |
| Leeg veld | niets tussen de puntkomma's; betekenis per kolom hieronder |
| Volgorde | alfabetisch op `pad` (codepuntvolgorde); binnen een pad eerst de Renault-nummers in de volgorde van het record, dan de fabrikantnummers in de volgorde van het record |

Twee keer bouwen geeft dezelfde bytes: de rijvolgorde volgt uit de sortering en uit de volgorde in de plakbestanden, en er
staat geen datum of tijd in de uitvoer behalve de controledatum die in `data/pn/meta.json` vastligt.

## Rijen

Elke rij is één combinatie van een pad in de modelboom en één nummer. Er zijn drie soorten rijen:

1. Een pad dat in `data/pn/map.json` aan een verkoopeenheid is gekoppeld en waarvan de eenheid nummers heeft: één rij per
   nummer, met de eenheidsgegevens op elke rij herhaald (`unit_id`, `verkoopeenheid`, `relatie`, `regel`, `status`, `var`,
   `per`, `bronnen`, de keuzekolommen).
2. Een gekoppeld pad waarvan de eenheid geen nummer heeft (status `niet gevonden`, of een groep die als eenheid is
   geregistreerd): één rij zonder `soort`, `merk`, `nummer`, `bewijs` en `opmerking`.
3. Een pad uit `data/tree.json` dat niet in `map.json` staat: één rij met status `niet onderzocht`; alleen `pad`, `naam`,
   `diepte`, `knoop` en eventueel `info` zijn gevuld.

De wortel `Renault Laguna III` staat niet in de CSV; alle paden zijn zonder wortel, net als in `map.json` en `PN_DATA.map`.

## Kolommen

| Nr | Kolom | Bron in `data/pn/` | Betekenis |
|---|---|---|---|
| 1 | `pad` | sleutel van `map.json`, of een pad uit `data/tree.json` | Pad zonder wortel, als één veld. Een knoopnaam kan zelf een schuine streep bevatten (zie hieronder); splits dit veld daarom niet op `/`. |
| 2 | `naam` | afgeleid uit `data/tree.json` | Naam van de knoop (het laatste deel van het pad), ook als die een schuine streep bevat. |
| 3 | `diepte` | afgeleid uit `data/tree.json` | Diepte onder de wortel: 1 voor `Carrosserie`, 2 voor `Carrosserie/Motorkap`, enzovoort. |
| 4 | `knoop` | afgeleid uit `data/tree.json` | `groep` als het pad in de boom kinderen heeft, anders `onderdeel`. |
| 5 | `unit_id` | sleutel van `units/<plak>.json`, via `map.json` | Verkoopeenheid, als `plak:ID` (`S1-motor-service:U_COIL`). Leeg bij `niet onderzocht`. Sommige eenheden dragen dezelfde naam als een andere eenheid; het id houdt ze uit elkaar. |
| 6 | `verkoopeenheid` | `n` van de eenheid | Naam van de verkoopeenheid, zoals het paneel hem toont. |
| 7 | `relatie` | tweede element in `map.json` | `zelf` (het onderdeel is zelf de verkoopeenheid), `deel` (zit in de eenheid en wordt daarmee besteld) of `set` (wordt als set met andere delen verkocht). Leeg bij `niet onderzocht`. |
| 8 | `regel` | derde element in `map.json` | Toelichting bij de koppeling, zoals het paneel die bij `deel` en `set` toont; vaak leeg. Dit is een onderzoeksaantekening en noemt soms de categorie van de bron. |
| 9 | `status` | `st` en `kz` van de eenheid; afwezigheid van een record | Statuslabel, zie de tabel hieronder. Bij `deel` en `set` is dit de status van de eenheid waar het onderdeel in zit (het paneel toont daar `Deel van`). |
| 10 | `soort` | `oe` of `am` van de eenheid | `Renault` voor een Renault-nummer uit `oe`, `fabrikant` voor een nummer van een andere fabrikant uit `am`. Leeg op een rij zonder nummer. |
| 11 | `merk` | `Renault`, of `am[0]` | Merk van het nummer. |
| 12 | `nummer` | `oe[0]` of `am[1]` | Het nummer, letterlijk zoals de bron het schrijft (spaties en punten inbegrepen). |
| 13 | `bewijs` | `oe[2]` of `am[3]` | A: staat in de catalogus voor dit type op de juiste plaats; B: Renault-nummer van zo'n artikel; C: kruisverwijzing van een A- of B-nummer; D: alleen uit een advertentie voor een gebruikt onderdeel. |
| 14 | `opmerking` | `oe[1]` of `am[2]` | Korte Nederlandse aanduiding bij dit nummer: maat, zijde, uitvoering, of waar het nummer gevonden is. Geen letterlijke catalogustekst (zie "Geen productteksten"). |
| 15 | `var` | `var` van de eenheid | Varianten in de catalogus en waarvan de keuze afhangt; leeg als er geen varianten zijn. Herhaald op elke rij van de eenheid. |
| 16 | `per` | `per` van de eenheid | Verpakking of aantal per auto (`1 stuk`, `set`, `4 stuks (1 per cilinder, zelfde nummer)`). |
| 17 | `bronnen` | `src` van de eenheid | Alle bron-URL's van de eenheid, gescheiden door `\|` (een URL bevat nooit `\|` of een spatie; `build_pn.py` stopt als dat wel zo is). Elk nummer van de eenheid is tegen deze pagina's gecontroleerd; de kolom `opmerking` zegt soms op welke van de pagina's het nummer staat. |
| 18 | `gekozen` | `kz.o` en `kz.a` van de eenheid | `ja` op de rij van een nummer dat voor de auto van de gebruiker is gekozen; anders leeg. |
| 19 | `uitvoering_keuze` | `kz.v` | De gekozen uitvoering in woorden. Gevuld op elke rij van een eenheid met een keuze, ook op de rijen van de niet gekozen nummers. |
| 20 | `zekerheid_keuze` | `kz.z` | Zekerheid van de keuze: `hoog`, `middel` of `laag`. |
| 21 | `grond_keuze` | `kz.g` | De grond van de keuze: welke feiten over de auto (RDW, bouwperiode, bak) de uitvoering bepalen. Het chassisnummer en het kenteken zelf staan er nooit in. |
| 22 | `bronnen_keuze` | `kz.s` | Bron-URL's van de keuze, gescheiden door `\|`. |
| 23 | `info` | `info.json` op het pad | Onderhoudsregels en bekende problemen van dit pad, elk als `label: waarde (zekerheid; bron)`, gescheiden door ` \| `. Staat ook op rijen `niet onderzocht`, want deze regels horen bij het pad en niet bij een eenheid. |

Wat niet in de CSV staat maar wel in `data/pn/` en `PN_DATA`: `note` (de onderzoeksnotitie per eenheid, een lopende tekst
die de pagina ook niet toont), de hostnaam per bron (`src[i][1]`), `meta.json` (voertuig, TecDoc-type, controledatum, de
toelichting van het paneel) en het bewijsniveau van de keuze (`kz.b`, gelijk aan het bewijs van de gekozen nummers).

## Statuslabels

| `status` | Wanneer | In het paneel |
|---|---|---|
| `past volgens catalogus` | eenheid met `st` = `past` | Past volgens catalogus |
| `variant: kies op VIN` | eenheid met `st` = `vin` zonder `kz` | Variant: kies op VIN |
| `gekozen voor deze auto` | eenheid met `st` = `vin` en een `kz`; de kolom `gekozen` zegt welke nummers | Gekozen voor deze auto |
| `niet gevonden` | eenheid met `st` = `nietgevonden`; de rij heeft geen nummer | Niet gevonden |
| `niet onderzocht` | pad zonder record in `map.json` | Niet onderzocht (bij een groep toont het paneel het aantal onderdelen eronder met een nummer) |

Bij `relatie` = `deel` of `set` toont het paneel `Deel van` of `Deel van set` met de naam van de eenheid; de CSV geeft daar de
status van die eenheid, zodat een filter op `status` ook de delen van een passende eenheid vindt.

## Paden met een schuine streep

Enkele knoopnamen bevatten zelf een schuine streep (op de stand van golf 5d: `ABS/ESP-unit`, `Lage/achteruitrem`,
`Zuigerhuis L/R-rem`, `Aan/uit-solenoïde 1` en `Aan/uit-solenoïde 2`; `build_pn.py` telt ze als `namen_met_schuine_streep`). Een pad als `Onderstel/Remsysteem/ABS/ESP-unit/Pompmotor` heeft dus diepte
4, niet 5. Daarom:

- `pad` is één veld en wordt nooit gesplitst; de koppeling aan `data/pn/map.json` en aan `PN_DATA.map` gaat op het volle pad,
  net als in de pagina (`src/app2.js` zoekt in een tabel van volle paden).
- `naam` en `diepte` staan apart. `build_pn.py` leidt ze af uit `data/tree.json`: de ouder van een pad is het langste
  kortere pad in de boom waar het pad mee begint, de naam is de rest. Het ouderpad van een rij is dus `pad` zonder
  `/` plus `naam` aan het eind, en de ouder staat zelf ook in de CSV (als eigen rij, met zijn eigen `naam`).
- `unit_id` plus `pad` maakt een rij eenduidig, ook als twee eenheden dezelfde naam dragen.

De knoopnamen zelf veranderen niet; dat zou de paden in `map.json`, `info.json`, `data/tree.json` en de deeplinks van de
pagina raken.

## Bronnen

`bronnen` bevat alle bronnen van de eenheid, niet alleen de eerste. De telling "bronnen per nummer" die `pncheck` afdrukt
(`bronnen_per_nummer`) is het aantal bron-URL's van alle eenheden gedeeld door het aantal nummers; hij mag bij een nieuwe
ronde niet dalen (poort in `docs/masterplan.md`, golf 5d). `bronnen_uniek_in_csv` telt de verschillende URL's in de kolommen
`bronnen` en `bronnen_keuze` samen.

Een deel van de bronnen is een categorielijst van de catalogus voor dit voertuigtype met `?page=N` erachter: de pagina N van
die lijst waarop het artikel stond op de controledatum. Die verwijzingen zijn minder stabiel dan een artikelpagina, maar de
artikelpagina is uit zo'n URL niet af te leiden en kon in golf 5d niet worden opgehaald (de catalogus staat achter een
Cloudflare-controle, de leesdiensten hadden geen tegoed). Ze blijven staan tot een latere ronde ze met een eigen
ophaalactie kan vervangen; `build_pn.py` telt ze als `bronnen_met_page`.

## Geen productteksten

De repo neemt geen productteksten, prijzen of foto's over (`README.md`, `docs/onderzoek/databankenrecht.md`). In golf 5d
(migratie ATTR_NL, zie `data/pn/README.md`) zijn de opmerkingen bij de nummers en de variantteksten ontdaan van letterlijke
Engelse catalogusattributen: `Opening Temperature [°C]: 89` werd `opent bij 89 °C`, `Diameter: 66, Width: 32` werd `Ø 66 mm,
breedte 32 mm`, `Positie: frontal sided` werd `distributiezijde`, uitrustingstermen uit de lijst staan in het Nederlands, en de
twee advertentietitels bij de D-nummers van het panoramadak zijn vervangen door een eigen omschrijving. De feiten (maten,
zijde, bouwperiode) blijven; de catalogus levert ze als eigenschap van het artikel en ze zijn nodig om varianten uit elkaar
te houden.

Wat wel Engelse woorden bevat: de kolom `regel` en het veld `note` (niet in de CSV) zijn onderzoeksaantekeningen en noemen
soms de categorie waarin de bron het artikel plaatst (`Autodoc Crankshaft seal, positie "transmission sided"`), zodat het
artikel terug te vinden is; de kolom `var` citeert hier en daar een bouwjaargrens. Dat zijn verwijzingen naar een
rubriek, geen productbeschrijvingen.

## Zo komt de CSV tot stand

1. `build_pn.py` leest `data/pn/meta.json`, `data/pn/units/*.json` (eerst `pilot`, dan de plakken alfabetisch),
   `data/pn/map.json`, `data/pn/info.json` en `data/tree.json`.
2. Hij controleert de gegevens (paden in de boom, eenheden bestaan en worden gebruikt, status geldig, keuze verwijst naar
   bestaande nummers, bronnen met https en zonder `|`) en stopt bij een fout.
3. Hij schrijft `src/partnumbers.js` (het object `PN_DATA`, de gegevens ongewijzigd) en deze CSV (de projectie hierboven).
4. `python3 tools/pncheck.py` herbouwt beide in het geheugen en vergelijkt; `--tree` controleert ook dat `data/tree.json`
   gelijk is aan de boom van de pagina. Verandert de boom, dan eerst `pncheck.py --tree --update`, dan opnieuw bouwen.

Een nieuwe ronde nummers (zie `data/pn/README.md`) verandert dit schema niet: nieuwe eenheden en koppelingen komen als
nieuwe rijen mee.
