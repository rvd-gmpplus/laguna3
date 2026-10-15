export const meta = {
  name: 'visuele-poort',
  description: 'Visuele poort: drie onafhankelijke beoordelaars per plak, meerderheid per kenmerk',
  phases: [{ title: 'Poort', detail: '3 plakken x 3 beoordelaars' }],
}
// Aanroep: Workflow({scriptPath: 'tools/orkestratie/poort.js', args: {dir: '<map met beelden van gateshots.py>'}})
const G = args.dir
const SL = [
  { id: 'a', titel: 'voorkant en voorportieren', files: ['00-openen-dicht.png', '04-motorkap.png', '06-portier-linksvoor.png', '07-zijruit-linksvoor.png', '08-buitenspiegel-links.png', '09-portier-rechtsvoor.png', '10-zijruit-rechtsvoor.png', '11-buitenspiegel-rechts.png', '24-olievuldop.png', '25-dop-expansievat.png', '95-telefoon-motorkap.png', '95-telefoon-portier-linksvoor.png'],
    k: ['K1 Motorkap: scharniert aan de achterrand, voorkant omhoog (ongeveer 65 graden), steunstang houdt hem, de motorruimte is goed te zien', 'K2 Voorportieren: draaien om de voorrand naar buiten (ongeveer 68 graden), niet door scherm of stijl; de opening ziet er af uit (dorpel, B-stijl, sluitrand van het portier)', 'K3 Zijruiten voor: zakken in het portier, steken er nergens uit', 'K4 Buitenspiegels: klappen naar achteren tegen het portier', 'K5 Doppen in de motorruimte: de olievuldop klapt om een scharnier aan de vulhals omhoog, de dop van het expansievat komt omhoog', 'K9 Geen zichtbare doorsteken, gaten, zwevende delen of delen die door elkaar lopen in deze standen', 'K10 Bediening: de modus Openen is duidelijk (segmentknop Uitklappen | Openen, dock met Alles open, Alles dicht, Openers), ook op de telefoon'] },
  { id: 'b', titel: 'achterkant, achterportieren en dak van buiten', files: ['01-schuifdak.png', '02-zonnescherm-voor.png', '03-zonnescherm-achter.png', '05-achterklep.png', '12-portier-linksachter.png', '13-zijruit-linksachter.png', '14-portier-rechtsachter.png', '15-zijruit-rechtsachter.png', '26-tankklep.png', '90-dak-dicht-boven.png', '91-dak-open-boven.png', '95-telefoon-achterklep.png'],
    k: ['K2 Achterportieren: draaien om de voorrand naar buiten (ongeveer 62 graden), niet door het achterscherm; de opening ziet er af uit', 'K3 Zijruiten achter: zakken gedeeltelijk in het portier (een stukje blijft staan, zoals bij de echte auto)', 'K6 Achterklep: scharniert aan de dakrand (ongeveer 66 graden), twee gasveren tussen klep en carrosserie schuiven mee uit, de hoedenplank komt mee omhoog, de bagageruimte is te zien', 'K7 Tankklep: rechtsachter, zwaait naar voren open, de vulhals (capless, zonder dop) is te zien', 'K8 Panoramadak van buiten: twee zo goed als zwarte glaspanelen achter elkaar met een dwarsbalk (zo donker als bij de auto van de eigenaar; de zonneschermen zijn daardoor van buiten niet te zien); open: het voorste glas kantelt en schuift naar achteren boven het vaste glas, de voorste opening is vrij', 'K9 Geen zichtbare doorsteken, gaten, zwevende delen of delen die door elkaar lopen in deze standen'] },
  { id: 'c', titel: 'interieur, overzicht en dak van binnen', files: ['16-handschoenenkastje.png', '17-armsteun-middenconsole.png', '18-rugleuning-groot-deel-(rechts).png', '19-middenarmsteun-achter.png', '20-rugleuning-klein-deel-(links).png', '21-zonneklep-links.png', '22-zonneklep-rechts.png', '23-bagageruimtevloer.png', '80-alles-open-linksvoor.png', '80-alles-open-rechtsachter.png', '80-alles-open-boven.png', '92-dak-open-binnen.png', '93-dak-dicht-binnen.png'],
    k: ['K11 Interieuropeners: handschoenenkastje klapt omlaag en de bak erachter is te zien, het deksel van de armsteun klapt omhoog met een vak eronder, de middenarmsteun achter klapt neer, de twee delen van de achterbank klappen naar voren (het grote deel rechts), de zonnekleppen klappen omlaag, de bagagevloer komt omhoog met een bak eronder; telkens is het van buiten door een geopend portier of de klep te zien', 'K12 Alles open: de auto met alles open leest als een Laguna III hatchback met geopende kap, portieren, klep en dak', 'K13 Panoramadak van binnen: hemelbekleding met twee openingen en een nette afwerkring, de zonneschermen, het glas en de lucht zijn te zien', 'K9 Geen zichtbare doorsteken, gaten, zwevende delen of delen die door elkaar lopen in deze standen'] },
]
const SCHEMA = { type: 'object', properties: {
  features: { type: 'array', items: { type: 'object', properties: { k: { type: 'string' }, oordeel: { type: 'string', enum: ['ja', 'deels', 'nee'] }, reden: { type: 'string' }, beelden: { type: 'array', items: { type: 'string' } } }, required: ['k', 'oordeel', 'reden', 'beelden'] } },
  problemen: { type: 'array', items: { type: 'object', properties: { beeld: { type: 'string' }, wat: { type: 'string' }, ernst: { type: 'string', enum: ['blokkerend', 'storend', 'klein'] } }, required: ['beeld', 'wat', 'ernst'] } },
  notes_file: { type: 'string' } }, required: ['features', 'problemen', 'notes_file'] }
const judge = (sl, j) => agent(`Je bent beoordelaar ${j} van 3 in een visuele poort voor een 3D-model van een Renault Laguna III hatchback (2011, zilvergrijs, Initiale Paris, met panoramadak) in de browser. Het model heeft een nieuwe modus Openen: een klik opent de motorkap, portieren, ruiten, spiegels, achterklep, tankklep, panoramadak en interieurdelen, en de camera kijkt dan in de opening. Jij beoordeelt de plak "${sl.titel}" aan de hand van deze screenshots (1280 x 800 of telefoon 390 x 844) in ${G}:
${sl.files.map(f => '- ' + f).join('\n')}
In ${G}/index.json staat per beeld welke opener open is. Het is een schematisch model (geen fotorealisme); beoordeel of de beweging en de standen kloppen met een echte auto en of je er goed in kunt kijken.
Werkwijze (verplicht): bekijk elk beeld precies een keer met Read, schrijf na elk beeld direct je notities naar ${G}/notes-${sl.id}-${j}.md, en lees geen beeld opnieuw. Werk klaar binnen 25 minuten; wat je dan niet bekeken hebt, telt als niet beoordeeld.
Beoordeel per kenmerk ja (klopt), deels (klopt grotendeels, met een duidelijk punt) of nee (klopt niet of is niet te zien), met een korte reden en de beelden waarop je het baseert:
${sl.k.map(x => '- ' + x).join('\n')}
Noem daarnaast concrete problemen per beeld met ernst (blokkerend: dit mag niet live; storend: zichtbaar en lelijk; klein). Verzin niets wat niet op het beeld staat. Nederlands, geen em-dash of pijlen.`, { label: `poort:${sl.id}:${j}`, phase: 'Poort', schema: SCHEMA, model: 'opus', effort: 'high' })
phase('Poort')
const jobs = []
for (const sl of SL) for (const j of [1, 2, 3]) jobs.push(() => judge(sl, j).then(r => ({ sl: sl.id, j, r })))
const res = (await parallel(jobs)).filter(Boolean)
const out = {}
for (const sl of SL) {
  const rs = res.filter(x => x.sl === sl.id && x.r)
  const feats = {}
  for (const x of rs) for (const f of x.r.features) { const key = f.k.split(' ')[0]; (feats[key] = feats[key] || []).push(f.oordeel) }
  const maj = {}
  for (const [k, v] of Object.entries(feats)) {
    const c = { ja: v.filter(a => a === 'ja').length, deels: v.filter(a => a === 'deels').length, nee: v.filter(a => a === 'nee').length }
    maj[k] = c.ja >= 2 ? 'ja' : (c.nee >= 2 ? 'nee' : 'deels'); maj[k + '_stemmen'] = v.join('/')
  }
  out[sl.id] = { beoordelaars: rs.length, meerderheid: maj, problemen: rs.flatMap(x => x.r.problemen.map(p => ({ j: x.j, ...p }))) }
}
return out
