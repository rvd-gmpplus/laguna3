/* ===================== presets: gegevens en één toepassingsmotor ===================== */
// Elke preset is alleen gegevens. Velden:
//   id, cat (categorie), label, key (sneltoets), note (wat je ziet, één regel),
//   iso: [ankers] alleen deze tonen, open: [groepen] precies deze uitklappen, deep: [groepen] met hun hele deelboom,
//   pull: { naam: [dx,dy,dz] } hele groep verschuiven (in het frame van de ouder), xray, sys (kleuren per systeem),
//   spread (standaard 1), cam: { dir: [x,y,z], pad }, select: naam, labels: naam (van welke groep de kinderen een label krijgen),
//   labelOnly: [namen] alleen deze kinderen van de labelgroep krijgen een label,
//   frame: [namen] wat in beeld moet (standaard iso, anders de hele auto).
// Alleen ankernamen uit contract §8 / tools/anchors.json. Een preset waarvan een naam niet oplost, verschijnt niet in de menu's.
const appCar = 'Renault Laguna III';
const appCats = ['Overzicht', 'Motor', 'Aandrijving', 'Onderstel', 'Carrosserie', 'Interieur'];
const PRESETS = [
  // Overzicht
  { id: 'assembled', cat: 'Overzicht', label: 'Gemonteerd', key: '0', note: 'De complete auto in elkaar: Laguna III hatchback fase 2, Initiale Paris.', cam: { dir: [1, 0.42, 1.08], pad: 1.04 } },
  { id: 'main', cat: 'Overzicht', label: 'Hoofdgroepen', key: '1', note: 'De acht hoofdgroepen uit elkaar: carrosserie, interieur, aandrijflijn, onderstel en vier systemen.', open: [appCar], labels: appCar, cam: { dir: [1, 0.5, 1.08], pad: 1.04 } },
  { id: 'bodyOff', cat: 'Overzicht', label: 'Carrosserie eraf', note: 'Carrosserie en interieur opgetild, zodat motor, automaat en onderstel op hun plek te zien zijn.', pull: { 'Carrosserie': [0, 1.4, 0], 'Interieur': [0, 0.5, 0] }, labels: appCar, cam: { dir: [1, 0.3, 0.8], pad: 1.04 } },
  { id: 'xray', cat: 'Overzicht', label: 'Röntgen', key: '8', note: 'Carrosserie doorzichtig: de techniek in de gemonteerde auto, van opzij.', xray: true, cam: { dir: [1, 0.12, 0.02], pad: 1.03 } },
  { id: 'everything', cat: 'Overzicht', label: 'Alles uit elkaar', key: '9', note: 'Elke groep uitgeklapt tot op het kleinste onderdeel, gekleurd per hoofdgroep.', deep: [appCar], sys: true, labels: appCar, cam: { dir: [1, 0.6, 1.0], pad: 1.0 } },
  { id: 'tour', cat: 'Overzicht', label: 'Rondleiding', note: 'Speelt de belangrijkste presets na elkaar af, met uitleg bij elke stap.', tour: true },
  // Motor
  { id: 'engine', cat: 'Motor', label: 'Motor F4Rt', key: '2', note: '2.0 16V turbobenzinemotor: 1998 cm³, 125 kW (170 pk), 270 Nm. Eerste laag uit elkaar.', iso: ['Motor F4Rt'], open: ['Motor F4Rt'], cam: { dir: [0.3, 0.42, 1], pad: 1.08 } },
  { id: 'engineAll', cat: 'Motor', label: 'Motor tot op de bout', key: '3', note: 'Alle groepen van de motor uitgeklapt, tot op de kleinste onderdelen.', iso: ['Motor F4Rt'], deep: ['Motor F4Rt'], cam: { dir: [0.3, 0.45, 1], pad: 1.02 } },
  { id: 'head', cat: 'Motor', label: 'Cilinderkop en kleppen', note: 'Aluminium cilinderkop met twee nokkenassen en zestien kleppen, helemaal uit elkaar.', iso: ['Cilinderkop'], deep: ['Cilinderkop'], cam: { dir: [0.7, 0.5, 1], pad: 1.04 } },
  { id: 'crank', cat: 'Motor', label: 'Krukmechanisme', note: 'Krukas met de vier zuigers en drijfstangen; boring × slag 82,7 × 93,0 mm.', iso: ['Krukmechanisme'], deep: ['Krukmechanisme'], cam: { dir: [0.35, 0.4, 1], pad: 1.04 } },
  { id: 'timing', cat: 'Motor', label: 'Distributie', note: 'Getande distributieriem die de nokkenassen en de waterpomp aandrijft, op de motor uitgeklapt.', iso: ['Motor F4Rt'], deep: ['Distributie'], select: 'Distributie', labels: 'Distributie', frame: ['Motor F4Rt'], cam: { dir: [-1, 0.35, 0.45], pad: 1.06 } },
  { id: 'turbo', cat: 'Motor', label: 'Turbo', note: 'Mitsubishi TD04-turbocompressor met het uitlaatspruitstuk, uit elkaar.', iso: ['Turbo en uitlaatspruitstuk'], deep: ['Turbo en uitlaatspruitstuk'], labels: 'Turbocompressor', cam: { dir: [0.5, 0.45, -1], pad: 1.05 } },
  { id: 'dynStart', cat: 'Motor', label: 'Dynamo en startmotor', note: 'Dynamo (150 A) aan de multiriem en de startmotor op de automaat, beide uit elkaar.', iso: ['Dynamo', 'Startmotor'], deep: ['Dynamo', 'Startmotor'], labels: 'Dynamo', select: 'Dynamo', cam: { dir: [0.15, 0.45, 1], pad: 1.06 } },
  { id: 'psPump', cat: 'Motor', label: 'Stuurpomp', note: 'Hydraulische stuurbekrachtigingspomp aan de multiriem, met poelie, pomphuis, stroomregelklep en aansluitingen, uit elkaar.', iso: ['Stuurpomp'], deep: ['Stuurpomp'], labels: 'Stuurpomp', cam: { dir: [-0.55, 0.4, 1], pad: 1.06 } },
  { id: 'cooling', cat: 'Motor', label: 'Koeling en luchtinlaat', note: 'Koelpakket met radiateur, condensor, intercooler en ventilator, plus expansievat, koelslangen en het luchtinlaattraject naar de turbo.', iso: ['Koeling en luchtinlaat'], open: ['Koeling en luchtinlaat'], labels: 'Koeling en luchtinlaat', cam: { dir: [0.75, 0.5, 1], pad: 1.05 } },
  { id: 'exhaust', cat: 'Motor', label: 'Uitlaatsysteem', note: 'De uitlaat van turbo tot bumper: voorkatalysator, downpipe, flexstuk, middendemper en einddemper, met ophangingen en hitteschilden.', iso: ['Uitlaatsysteem'], open: ['Uitlaatsysteem'], labels: 'Uitlaatsysteem', cam: { dir: [0.9, 0.4, 0.55], pad: 1.03 } },
  { id: 'battery', cat: 'Motor', label: 'Accu', note: '12-voltaccu in de motorruimte, uit elkaar: accubak met cellen, deksel, polen, poolklemmen en houder.', iso: ['Accu'], deep: ['Accu'], labels: 'Accu', cam: { dir: [-0.8, 0.6, 0.9], pad: 1.06 } },
  // Aandrijving
  { id: 'gearbox', cat: 'Aandrijving', label: 'Automaat', key: '4', note: 'Zestraps automaat Jatco JF613E (Renault AJ0), eerste laag uit elkaar.', iso: ['Automaatversnellingsbak'], open: ['Automaatversnellingsbak'], cam: { dir: [0.45, 0.5, 1], pad: 1.06 } },
  { id: 'gearboxAll', cat: 'Aandrijving', label: 'Automaat tot op de bout', note: 'Elke groep van de automaat uitgeklapt, van koppelomvormer tot klepblok.', iso: ['Automaatversnellingsbak'], deep: ['Automaatversnellingsbak'], cam: { dir: [0.45, 0.5, 1], pad: 1.03 } },
  { id: 'converter', cat: 'Aandrijving', label: 'Koppelomvormer', note: 'Hydraulische koppeling tussen motor en bak: pompwiel, turbinewiel, leidwiel en overbruggingskoppeling.', iso: ['Koppelomvormer'], deep: ['Koppelomvormer'], cam: { dir: [0.9, 0.4, 0.7], pad: 1.05 } },
  { id: 'gearsets', cat: 'Aandrijving', label: 'Tandwielsets en koppelingen', note: 'Planetaire tandwielsets en de lamellenkoppelingen en -remmen die de zes versnellingen schakelen.', iso: ['Tandwielsets', 'Koppelingen en remmen'], deep: ['Tandwielsets', 'Koppelingen en remmen'], labels: 'Koppelingen en remmen', select: 'Koppelingen en remmen', cam: { dir: [0.9, 0.45, 0.8], pad: 1.05 } },
  { id: 'diff', cat: 'Aandrijving', label: 'Differentieel', note: 'Differentieel met kroonwiel dat het koppel over de twee aandrijfassen verdeelt.', iso: ['Differentieel'], deep: ['Differentieel'], cam: { dir: [0.8, 0.5, 1], pad: 1.05 } },
  { id: 'shafts', cat: 'Aandrijving', label: 'Aandrijfassen', note: 'Linker en rechter aandrijfas met homokinetische koppelingen naar de voorwielen.', iso: ['Aandrijfassen'], deep: ['Aandrijfassen'], cam: { dir: [0.35, 1, 0.9], pad: 1.04 } },
  // Onderstel
  { id: 'chassis', cat: 'Onderstel', label: 'Onderstel', key: '5', note: 'Vooras met McPherson-veerpoten, achteras, de vier wielen en het remsysteem.', iso: ['Onderstel'], open: ['Onderstel', 'Vooras en stuurinrichting', 'Achteras'], cam: { dir: [1, 0.55, 1.08], pad: 1.04 } },
  { id: 'frontAxle', cat: 'Onderstel', label: 'Vooras en stuurinrichting', note: 'McPherson-voorwielophanging met tandheugelbesturing en stuurwiel.', iso: ['Vooras en stuurinrichting'], open: ['Vooras en stuurinrichting', 'Stuurinrichting', 'Wielophanging linksvoor'], cam: { dir: [0.7, 0.55, 1], pad: 1.04 } },
  { id: 'rearAxle', cat: 'Onderstel', label: 'Achteras', note: 'Torsieas in H-vorm met langsarmen, aparte schroefveren en schokdempers.', iso: ['Achteras'], open: ['Achteras', 'Wielophanging linksachter'], cam: { dir: [0.75, 0.6, -1], pad: 1.04 } },
  { id: 'brakeLF', cat: 'Onderstel', label: 'Rem linksvoor', note: 'Wielophanging linksvoor uitgeklapt, de remklauw tot op de remblokken uit elkaar; geventileerde schijf 296 × 26 mm.', iso: ['Wielophanging linksvoor'], open: ['Wielophanging linksvoor'], deep: ['Remklauw linksvoor'], labels: 'Remklauw linksvoor', labelOnly: ['Remklauwhuis', 'Remklauwdrager', 'Remblok binnen', 'Remblok buiten', 'Zuiger'], select: 'Remklauw linksvoor', cam: { dir: [0.7, 0.45, 0.75], pad: 1.05 } },
  { id: 'wheelLF', cat: 'Onderstel', label: 'Wiel linksvoor', note: 'Lichtmetalen wiel met band 225/45 R18 (18 inch in het model; 17 inch is voor deze uitvoering even goed mogelijk), uit elkaar.', iso: ['Wiel linksvoor'], deep: ['Wiel linksvoor'], cam: { dir: [1, 0.35, 0.65], pad: 1.05 } },
  { id: 'steering', cat: 'Onderstel', label: 'Stuurinrichting', note: 'Tandheugelstuurhuis met spoorstangen, stuurkolom en stuurwiel, en de stuurbekrachtiging met reservoir en slangen.', iso: ['Stuurinrichting'], open: ['Stuurinrichting', 'Stuurbekrachtiging'], labels: 'Stuurinrichting', cam: { dir: [0.75, 0.6, 1], pad: 1.04 } },
  { id: 'parkBrake', cat: 'Onderstel', label: 'Parkeerrem', note: 'Elektrische parkeerremunit bij de achteras, uit elkaar: elektromotor met wormoverbrenging en kabelverdeler, en de twee kabels naar de achterklauwen.', iso: ['Parkeerrem'], open: ['Parkeerrem'], labels: 'Parkeerrem', cam: { dir: [0.6, 0.75, -1], pad: 1.05 } },
  // Carrosserie
  { id: 'body', cat: 'Carrosserie', label: 'Carrosserie', key: '6', note: 'Kooi met portieren, kleppen, bumpers, verlichting en ruiten: eerste laag uit elkaar.', iso: ['Carrosserie'], open: ['Carrosserie'], cam: { dir: [1, 0.5, 1.08], pad: 1.03 } },
  { id: 'doorLF', cat: 'Carrosserie', label: 'Portier linksvoor', note: 'Linker voorportier tot op de onderdelen, met de buitenspiegel.', iso: ['Portier linksvoor'], deep: ['Portier linksvoor'], cam: { dir: [1, 0.3, 0.35], pad: 1.05 } },
  { id: 'headlampL', cat: 'Carrosserie', label: 'Koplamp links', note: 'Bi-xenon koplamp links uit elkaar.', iso: ['Koplamp links'], deep: ['Koplamp links'], cam: { dir: [0.8, 0.35, 1], pad: 1.06 } },
  { id: 'tailgate', cat: 'Carrosserie', label: 'Achterklep', note: 'Achterklep van de hatchback met achterruit, derde remlicht, wisser, slot en gasveren, uit elkaar.', iso: ['Achterklep'], deep: ['Achterklep'], cam: { dir: [0.55, 0.45, -1], pad: 1.05 } },
  // Interieur
  { id: 'interior', cat: 'Interieur', label: 'Interieur', key: '7', note: 'Dashboard, middenconsole, stoelen, bekleding en pedalen uit elkaar.', iso: ['Interieur'], open: ['Interieur', 'Stoelen'], cam: { dir: [0.9, 0.85, 0.7], pad: 1.04 } },
  { id: 'driverSeat', cat: 'Interieur', label: 'Bestuurdersstoel', note: 'Bestuurdersstoel tot op de onderdelen: zitting, rugleuning en hoofdsteun.', iso: ['Bestuurdersstoel'], deep: ['Bestuurdersstoel'], cam: { dir: [1, 0.45, 0.8], pad: 1.05 } },
  { id: 'dash', cat: 'Interieur', label: 'Dashboard', note: 'Dashboard met instrumentenpaneel en bedieningsdelen uit elkaar.', iso: ['Dashboard'], deep: ['Dashboard'], cam: { dir: [0.3, 0.45, -1], pad: 1.05 } },
];
const appTourSteps = ['assembled', 'main', 'bodyOff', 'engine', 'head', 'turbo', 'gearbox', 'gearsets', 'chassis', 'brakeLF', 'interior', 'everything', 'assembled'];
const appPresetById = new Map(PRESETS.map(p => [p.id, p]));

function appPresetNames(p) {
  return [...(p.iso || []), ...(p.open || []), ...(p.deep || []), ...Object.keys(p.pull || {}), ...(p.select ? [p.select] : []), ...(p.labels ? [p.labels] : []), ...(p.frame || [])];
}
function appPresetErrors(p) {
  const err = [];
  for (const name of new Set(appPresetNames(p))) {
    const c = uiNameCount.get(name) || 0;
    if (c === 0) err.push(`preset "${p.label}": naam "${name}" bestaat niet`);
    else if (c > 1) err.push(`preset "${p.label}": naam "${name}" komt ${c}x voor`);
  }
  if (err.length) return err;
  const iso = (p.iso || []).map(byName);
  const scope = iso.length ? iso : [ROOT];
  for (const name of [...(p.open || []), ...(p.deep || []), ...(p.select ? [p.select] : []), ...(p.labels ? [p.labels] : [])]) {
    const n = byName(name);
    if (!scope.some(r => isUnder(n, r))) err.push(`preset "${p.label}": "${name}" ligt niet onder ${iso.length ? (p.iso || []).join(' of ') : 'de auto'}`);
  }
  return err;
}
function appCheckPresets() {
  const err = [], ids = new Set(), keys = new Set();
  for (const p of PRESETS) {
    if (ids.has(p.id)) err.push(`preset-id "${p.id}" komt twee keer voor`); ids.add(p.id);
    if (p.key) { if (keys.has(p.key)) err.push(`sneltoets ${p.key} komt twee keer voor`); keys.add(p.key); }
    if (!appCats.includes(p.cat)) err.push(`preset "${p.label}": onbekende categorie ${p.cat}`);
    err.push(...appPresetErrors(p));
  }
  for (const id of appTourSteps) if (!appPresetById.has(id)) err.push(`rondleiding: preset "${id}" bestaat niet`);
  return err;
}
const appPresetOk = p => p.tour || appPresetErrors(p).length === 0;
function appSubject(p) {
  const names = p.frame || (p.iso && p.iso.length ? p.iso : [appCar]);
  return names.map(byName).filter(Boolean);
}

/* ---------- toepassen in fasen: (1) dicht wat dicht moet (diepste eerst), (2) camera naar de eindkadrering
   terwijl (3) open gaat wat open moet (ondiepste eerst). Alles samen hoogstens 2,5 s. ---------- */
function appApplyPreset(p, opt = {}) {
  if (!p || p.tour || !appPresetOk(p)) return false;
  uiStopPlay();
  if (!opt.tour) uiStopTour();
  if (!opt.noHistory) uiPush();
  const want = new Set();
  for (const name of p.open || []) want.add(byName(name));
  for (const name of p.deep || []) subtree(byName(name)).forEach(a => { if (a.asm) want.add(a); });
  // isolatie en weergave
  ISO = (p.iso || []).map(byName);
  XRAY = !!p.xray; SYSCOL = !!p.sys;
  if (SPREAD !== (p.spread || 1)) uiSetSpread(p.spread || 1, false);
  uiDrop();
  // in de eindstand verborgen groepen (buiten de isolatie en niet op het pad erheen) springen direct dicht
  const onPath = new Set(); for (const r of ISO) for (let a = r; a; a = a.parent) onPath.add(a);
  const shown = a => !ISO.length || onPath.has(a) || uiInScope(a);
  const closing = [], opening = [];
  for (const a of ASMS) {
    const t = want.has(a) ? 1 : 0;
    if (a.target === t && !uiAnim.has(a)) continue;
    if (!shown(a)) { uiSetNow(a, t); continue; }
    (t ? opening : closing).push(a);
  }
  const span = list => list.length ? [Math.min(...list.map(a => a.depth)), Math.max(...list.map(a => a.depth))] : [0, 0];
  const [c0, c1] = span(closing), [o0, o1] = span(opening);
  const cStag = closing.length ? Math.min(0.06, 0.3 / Math.max(1, c1 - c0)) : 0;
  const cDur = 0.45, closeT = closing.length ? cDur + cStag * (c1 - c0) : 0;
  const oDur = 0.7, oStag = opening.length ? Math.min(0.22, Math.max(0.04, (2.35 - closeT - oDur) / Math.max(1, o1 - o0))) : 0;
  closing.forEach(a => setTarget(a, 0, cStag * (c1 - a.depth), cDur));
  opening.forEach(a => setTarget(a, 1, closeT + oStag * (a.depth - o0), oDur));
  // optillen
  const pulls = new Map(Object.entries(p.pull || {}).map(([k, v]) => [byName(k), v]));
  for (const n of ALL) {
    const v = pulls.get(n);
    if (v) { n.pull.set(v[0], v[1], v[2]); uiOffTo(n, 1.0, closeT); }
    else if (n.pull.lengthSq() > 0) { n.pull.set(0, 0, 0); uiOffTo(n, 0.6, 0); }
  }
  applyVisibility(); applyMats();
  // selectie, labels en camera
  CTX = p.labels ? byName(p.labels) : (p.select ? byName(p.select) : ((p.open || p.deep || []).length ? byName((p.open || p.deep)[0]) : null));
  uiLabelForce = !!p.labels;
  ACTIVE_PRESET = p.id;
  const sel = p.select ? byName(p.select) : (ISO.length === 1 ? ISO[0] : ROOT);
  select(sel, { keepPreset: true });
  const openSpan = opening.length ? oDur + oStag * (o1 - o0) : 0;
  const camDelay = closing.length ? closeT * 0.6 : 0;
  const camDur = clamp(Math.max(0.9, openSpan + closeT - camDelay), 0.9, 2.5 - camDelay);
  const cam = p.cam || {};
  focusNodes(appSubject(p), cam.dir ? V3(...cam.dir) : DIRS.iso, cam.pad || 1.06, { dur: camDur, delay: camDelay });
  if (REDUCED) finishAll();
  uiAfterAction();
  requestRender();
  return true;
}

/* ---------- rondleiding ---------- */
let appTour = null;
function uiStartTour() {
  uiStopPlay();
  uiPush();
  appTour = { i: -1, timer: 0 };
  uiTourStep();
  uiSyncTour();
}
function uiTourStep() {
  if (!appTour) return;
  appTour.i++;
  if (appTour.i >= appTourSteps.length) { uiStopTour(); return; }
  const p = appPresetById.get(appTourSteps[appTour.i]);
  // een stap waarvan de namen niet (meer) oplossen, wordt overgeslagen (de waarschuwing staat al bij het starten in de console)
  if (!p || !appPresetOk(p)) { uiTourStep(); return; }
  // eerst het bijschrift: op een telefoon houdt het vrije beeld er rekening mee, zodat de camera de auto eronder inpast
  uiTourCaption(p, appTour.i, appTourSteps.length);
  appApplyPreset(p, { tour: true, noHistory: true });
  appTour.timer = setTimeout(uiTourStep, REDUCED ? 4500 : 5000);
}
function uiStopTour() {
  if (!appTour) return;
  clearTimeout(appTour.timer);
  appTour = null;
  uiTourCaption(null);
  uiSyncTour();
}
