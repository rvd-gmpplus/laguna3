/* ===================== koeling, luchtinlaat, uitlaat, brandstof, elektra ===================== */
const TURB_OUT = [0.01, 0.15, -0.26], COMP_IN = [0.2, 0.15, -0.26], COMP_OUT = [0.155, 0.25, -0.26];
function buildCooling() {
  const shroud = merge([xf(G.box(0.64, 0.03, 0.03), [0, 0.215, 0]), xf(G.box(0.64, 0.03, 0.03), [0, -0.215, 0]), xf(G.box(0.03, 0.43, 0.03), [0.32, 0, 0]), xf(G.box(0.03, 0.43, 0.03), [-0.32, 0, 0]), G.torus('z', 0.175, 0.012, 48, 6), xf(G.box(0.36, 0.012, 0.012), [0, 0, -0.01]), xf(G.box(0.012, 0.36, 0.012), [0, 0, -0.01])]);
  return A('Koeling en luchtinlaat', { d: 'Radiateur, condensor, intercooler, koelventilator en het luchtinlaattraject naar de turbo.', ex: [0, 0.3, 3.15] }, [
    A('Radiateur', { d: 'Koelt de koelvloeistof van de motor.', ex: [0, 0.05, -0.05] }, [
      P('Koelblok', merge([G.box(0.62, 0.4, 0.026), ...[-0.15, -0.05, 0.05, 0.15].map(y => xf(G.box(0.62, 0.004, 0.028), [0, y, 0]))]), MAT.alu, { d: 'Aluminium lamellenblok.', p: [0, 0.47, 2.04] }),
      P('Waterkast links', G.box(0.04, 0.42, 0.045), MAT.plastic, { d: 'Kunststof eindtank.', p: [0.33, 0.47, 2.04], ex: [0.14, 0, 0] }),
      P('Waterkast rechts', G.box(0.04, 0.42, 0.045), MAT.plastic, { d: 'Kunststof eindtank met aftapkraan.', p: [-0.33, 0.47, 2.04], ex: [-0.14, 0, 0] }),
      P('Aftapkraan', G.cyl('y', 0.008, 0.008, 0.03, 10), MAT.plastic, { d: 'Kraan om de koelvloeistof af te tappen.', p: [-0.33, 0.245, 2.04], ex: [-0.2, -0.1, 0] }),
    ]),
    P('Condensor', G.box(0.6, 0.36, 0.016), MAT.darkSteel, { d: 'Condensor van de airconditioning, vóór de radiateur.', p: [0, 0.46, 2.085], ex: [0, 0.04, 0.18] }),
    A('Intercooler', { d: 'Koelt de door de turbo samengeperste lucht voor een hogere vullingsgraad.', ex: [0, -0.12, 0.3] }, [
      P('Intercoolerblok', merge([G.box(0.5, 0.13, 0.05), ...[-0.03, 0.03].map(y => xf(G.box(0.5, 0.004, 0.052), [0, y, 0]))]), MAT.alu, { d: 'Lucht-luchtwarmtewisselaar.', p: [0, 0.315, 2.19] }),
      P('Eindkap links', G.rbox(0.04, 0.13, 0.06, 0.012), MAT.aluCast, { d: 'Inlaatzijde met aansluiting van de turbo.', p: [0.27, 0.315, 2.19], ex: [0.12, 0, 0] }),
      P('Eindkap rechts', G.rbox(0.04, 0.13, 0.06, 0.012), MAT.aluCast, { d: 'Uitlaatzijde naar het gasklephuis.', p: [-0.27, 0.315, 2.19], ex: [-0.12, 0, 0] }),
    ]),
    A('Koelventilator', { d: 'Elektrische ventilator achter de radiateur.', ex: [0, 0.02, -0.38] }, [
      P('Ventilatorkap', shroud, MAT.plastic, { d: 'Kap die de luchtstroom door het hele blok trekt.', p: [0, 0.47, 1.995] }),
      P('Ventilatorwaaier', merge([blades(7, 0.045, 0.165, 0.03, 0.003, 0.55, 'z'), G.cyl('z', 0.045, 0.045, 0.035, 20)]), MAT.plastic, { d: 'Zevenbladige waaier.', p: [0, 0.47, 2.005], ex: [0, 0, 0.14] }),
      P('Ventilatormotor', G.cyl('z', 0.045, 0.045, 0.06, 20), MAT.darkSteel, { d: 'Elektromotor met regelweerstand.', p: [0, 0.47, 1.962], ex: [0, 0, -0.12] }),
    ]),
    P('Expansievat', merge([G.rbox(0.14, 0.12, 0.18, 0.02), xf(G.cyl('y', 0.025, 0.025, 0.03, 16), [0.02, 0.07, 0])]), MAT.tank, { d: 'Doorzichtig expansievat met min/max-markering.', p: [-0.5, 0.76, 1.12], ex: [-0.2, 0.16, -0.2] }),
    P('Koelslang boven', tube([ENG2CAR([0.27, 0.3, 0.04]), [0.22, 0.62, 1.75], [0.33, 0.63, 1.98], [0.33, 0.63, 2.02]], 0.02, 40, 10), MAT.rubber, { d: 'Warme koelvloeistof van de thermostaat naar de radiateur.', ex: [0.1, 0.18, 0] }),
    P('Koelslang onder', tube([ENG2CAR([-0.19, 0.06, 0.15]), [-0.3, 0.3, 1.85], [-0.33, 0.3, 2.0], [-0.33, 0.3, 2.02]], 0.02, 40, 10), MAT.rubber, { d: 'Afgekoelde vloeistof terug naar de waterpomp.', ex: [-0.1, -0.14, 0] }),
    A('Luchtinlaat', { d: 'Aanzuigtraject van luchthapper tot turbocompressor.', ex: [0.3, 0.36, -0.2] }, [
      P('Aanzuigmond', tube([[0.36, 0.7, 2.02], [0.36, 0.72, 2.12], [0.3, 0.72, 2.18]], 0.03, 16, 10), MAT.plastic, { d: 'Haalt koele buitenlucht achter de grille.', ex: [0, 0, 0.14] }),
      P('Luchtfilterhuis', G.rbox(0.24, 0.1, 0.3, 0.02), MAT.plastic, { d: 'Onderbak van het luchtfilter.', p: [0.36, 0.69, 1.86], ex: [0, -0.1, 0] }),
      P('Luchtfilterelement', G.rbox(0.22, 0.035, 0.28, 0.006), MAT.filter, { d: 'Papieren luchtfilter.', p: [0.36, 0.755, 1.86], ex: [0, 0.08, 0] }),
      P('Luchtfilterdeksel', G.rbox(0.24, 0.05, 0.3, 0.02), MAT.plastic, { d: 'Deksel met aansluiting naar de turbo.', p: [0.36, 0.795, 1.86], ex: [0, 0.2, 0] }),
      P('Aanzuigslang turbo', tube([[0.36, 0.73, 1.71], [0.36, 0.72, 1.45], [0.25, 0.62, 1.28], ENG2CAR([COMP_IN[0] + 0.05, COMP_IN[1], COMP_IN[2]]), ENG2CAR([COMP_IN[0] + 0.02, COMP_IN[1], COMP_IN[2]])], 0.03, 48, 12), MAT.rubber, { d: 'Gefilterde lucht naar de compressorinlaat.', ex: [0, 0.12, -0.12] }),
    ]),
    P('Intercoolerslang heet', tube([ENG2CAR([COMP_OUT[0], COMP_OUT[1] + 0.02, COMP_OUT[2]]), [0.3, 0.62, 1.3], [0.4, 0.62, 1.6], [0.45, 0.45, 1.95], [0.4, 0.32, 2.1], [0.29, 0.315, 2.19]], 0.025, 64, 10), MAT.rubber, { d: 'Samengeperste, hete lucht van turbo naar intercooler.', ex: [0.22, 0.2, 0] }),
    P('Intercoolerslang koud', tube([[-0.29, 0.315, 2.19], [-0.42, 0.32, 2.0], [-0.44, 0.42, 1.8], ENG2CAR([-0.3, 0.14, 0.21]), ENG2CAR([-0.262, 0.14, 0.21])], 0.025, 56, 10), MAT.rubber, { d: 'Gekoelde laadlucht naar het gasklephuis.', ex: [-0.22, 0.2, 0] }),
  ]);
}
function buildExhaust() {
  const t0 = ENG2CAR(TURB_OUT), t1 = ENG2CAR([TURB_OUT[0] - 0.04, TURB_OUT[1] - 0.05, TURB_OUT[2] - 0.04]);
  const oval = (len, r, sx) => xf(G.cyl('z', r, r, len, 24), [0, 0, 0], null, [sx, 1, 1]);
  return A('Uitlaatsysteem', { d: 'Van turbo via katalysator en twee dempers naar het eindstuk.', ex: [0, -0.7, -0.25] }, [
    P('Downpipe', tube([t0, t1, [0.04, 0.3, 1.1], [0.04, 0.16, 0.96]], 0.028, 40, 12), MAT.exhaust, { d: 'Voorpijp direct achter de turbine.', ex: [0, 0.12, 0.18] }),
    P('Lambdasonde voor', G.cyl('y', 0.009, 0.009, 0.05, 12), MAT.steel, { d: 'Meet het restzuurstofgehalte voor de katalysator.', p: [t1[0], t1[1] + 0.035, t1[2]], ex: [0, 0.16, 0.18] }),
    P('Katalysator', merge([oval(0.3, 0.065, 1.4), xf(G.cyl('z', 0.028, 0.065, 0.06, 20), [0, 0, 0.18]), xf(G.cyl('z', 0.065, 0.028, 0.06, 20), [0, 0, -0.18])]), MAT.heat, { d: 'Driewegkatalysator die CO, HC en NOx omzet.', p: [0.04, 0.13, 0.78], ex: [0, 0, 0.1] }),
    P('Lambdasonde na', G.cyl('y', 0.009, 0.009, 0.05, 12), MAT.steel, { d: 'Controleert de werking van de katalysator.', p: [0.04, 0.2, 0.57], ex: [0, 0.12, 0] }),
    P('Flexstuk', merge([tube([[0.04, 0.13, 0.57], [0.04, 0.13, 0.41]], 0.024, 8, 12), ...[0, 1, 2, 3, 4, 5, 6].map(k => xf(G.torus('z', 0.026, 0.004, 24, 6), [0.04, 0.13, 0.43 + k * 0.02]))]), MAT.steel, { d: 'Flexibele koppeling die motorbewegingen opvangt.', ex: [0, 0, 0.04] }),
    P('Tussenpijp', tube([[0.04, 0.13, 0.42], [0.04, 0.125, 0.2], [0.04, 0.12, 0.02]], 0.025, 16, 10), MAT.exhaust, { d: 'Pijp tussen flexstuk en middendemper.', ex: [0, 0, 0.02] }),
    P('Middendemper', merge([oval(0.42, 0.06, 1.3), xf(G.cyl('z', 0.025, 0.06, 0.05, 20), [0, 0, 0.235]), xf(G.cyl('z', 0.06, 0.025, 0.05, 20), [0, 0, -0.235])]), MAT.exhaust, { d: 'Resonator die vooral hoge tonen dempt.', p: [0.04, 0.12, -0.2] }),
    P('Achterpijp', tube([[0.04, 0.12, -0.42], [0.06, 0.1, -0.62], [0.08, 0.1, -1.05], [0.1, 0.12, -1.3], [0.15, 0.2, -1.7], [0.15, 0.24, -1.86]], 0.025, 64, 10), MAT.exhaust, { d: 'Pijp onder tank en achteras door naar de einddemper.', ex: [0, 0, -0.04] }),
    P('Einddemper', G.rbox(0.62, 0.17, 0.28, 0.06), MAT.exhaust, { d: 'Dwarsgeplaatste einddemper.', p: [0.05, 0.25, -2.0], ex: [0, 0, -0.14] }),
    P('Uitlaateindstuk', G.cyl('z', 0.036, 0.036, 0.12, 24), MAT.chrome, { d: 'Verchroomd eindstuk.', p: [0.3, 0.24, -2.2], ex: [0, 0, -0.32] }),
    ...[[0.04, 0.17, 0.0], [0.07, 0.15, -0.62], [0.22, 0.34, -1.95], [-0.12, 0.34, -2.0]].map((p, i) => P(`Uitlaatrubber ${i + 1}`, G.torus('z', 0.018, 0.006, 20, 6), MAT.rubber, { d: 'Rubber ophanging die trillingen isoleert.', p, ex: [0, 0.16, 0] })),
  ]);
}
function buildFuel() {
  const fx = surfX(-1.72, 0.86);
  return A('Brandstofsysteem', { d: 'Kunststof tank onder de achterbank met pompmodule, vulpijp en leiding naar de motor.', spec: [['Tankinhoud', '66 l'], ['Brandstof', 'benzine (Euro 95)']], ex: [-0.9, -0.5, -0.6] }, [
    P('Brandstoftank', merge([G.rbox(0.92, 0.18, 0.36, 0.05), xf(G.box(0.86, 0.004, 0.3), [0, -0.09, 0])]), MAT.plastic, { d: 'Kunststof brandstoftank van 66 liter.', p: [-0.04, 0.27, -0.9] }),
    P('Brandstofpompmodule', merge([G.cyl('y', 0.06, 0.06, 0.03, 24), xf(G.cyl('y', 0.035, 0.035, 0.12, 18), [0, -0.075, 0])]), MAT.plasticGrey, { d: 'Elektrische brandstofpomp met niveaumeter in de tank.', p: [-0.25, 0.37, -0.9], ex: [0, 0.18, 0] }),
    P('Tankvulpijp', tube([[-0.48, 0.3, -1.02], [-0.62, 0.42, -1.3], [-0.8, 0.7, -1.62], [-(fx - 0.03), 0.86, -1.72]], 0.022, 40, 10), MAT.plastic, { d: 'Vulpijp van tankklep naar tank.', ex: [-0.14, 0.1, -0.12] }),
    P('Tankdop', G.cyl('x', 0.025, 0.025, 0.02, 18), MAT.plastic, { d: 'Afsluitdop van de vulpijp.', p: [-(fx - 0.02), 0.86, -1.72], ex: [-0.26, 0.1, -0.12] }),
    P('Tankklep', G.cyl('x', 0.06, 0.06, 0.006, 28), MAT.paint, { d: 'Tankklep in het rechter achterscherm.', p: [-(fx + 0.003), 0.86, -1.72], ex: [-0.36, 0.1, -0.12] }),
    P('Brandstofleiding', tube([[-0.25, 0.39, -0.9], [-0.3, 0.16, -0.7], [-0.3, 0.15, 0.8], [-0.32, 0.3, 1.02], ENG2CAR([0.2, 0.3, 0.155]), ENG2CAR([0.2, 0.345, 0.155])], 0.004, 80, 6), MAT.steel, { d: 'Leiding van pompmodule naar de brandstofrail.', ex: [0, 0.1, 0.1] }),
    P('Koolstoffilter', G.cyl('y', 0.045, 0.045, 0.18, 20), MAT.plastic, { d: 'Actief-koolfilter dat benzinedampen uit de tank opvangt.', p: [0.58, 0.52, 1.8], ex: [0.2, 0.1, 0.3] }),
  ]);
}
function buildElectrical() {
  const starter = ENG2CAR([GB_X + 0.12, -0.035, 0.205]);
  return A('Elektrisch systeem', { d: 'Accu, zekeringkast, motorcomputer, claxons en kabelbomen.', ex: [-1.55, 0.65, 1.85] }, [
    A('Accu', { d: '12-voltaccu in de motorruimte.', ex: [-0.2, 0.18, 0.1] }, [
      P('Accubak', G.box(0.24, 0.17, 0.175), MAT.battery || MAT.plastic, { d: 'Accubak met loodcellen.', p: [-0.42, 0.675, 1.86] }),
      P('Accudeksel', G.box(0.245, 0.02, 0.18), MAT.plasticGrey, { d: 'Deksel met ontluchting.', p: [-0.42, 0.77, 1.86], ex: [0, 0.08, 0] }),
      P('Pluspool', G.cyl('y', 0.01, 0.01, 0.025, 14), MAT.red, { d: 'Pluspool met rode afdekkap.', p: [-0.5, 0.79, 1.8], ex: [0, 0.16, 0] }),
      P('Minpool', G.cyl('y', 0.01, 0.01, 0.025, 14), MAT.darkSteel, { d: 'Minpool (massa).', p: [-0.34, 0.79, 1.8], ex: [0, 0.16, 0] }),
      P('Accuklem', G.box(0.03, 0.015, 0.2), MAT.darkSteel, { d: 'Klem die de accu vastzet.', p: [-0.42, 0.788, 1.86], ex: [0, 0.24, 0] }),
      P('Accuplaat', G.box(0.27, 0.02, 0.2), MAT.plastic, { d: 'Draagplaat onder de accu.', p: [-0.42, 0.58, 1.86], ex: [0, -0.1, 0] }),
    ]),
    P('Zekeringkast motorruimte', G.rbox(0.14, 0.09, 0.2, 0.012), MAT.plastic, { d: 'Zekeringen en relais voor de motorruimte.', p: [0.48, 0.74, 1.58], ex: [0.16, 0.08, 0] }),
    P('Motormanagementcomputer', G.rbox(0.16, 0.035, 0.13, 0.006), MAT.ecu, { d: 'Regelt inspuiting, ontsteking, turbodruk en nokkenasverstelling.', p: [-0.42, 0.72, 1.66], ex: [-0.12, 0.12, 0] }),
    ...[1, -1].map(s => P(`Claxon ${sideName(s)}`, merge([G.cyl('z', 0.04, 0.04, 0.02, 20), xf(G.cyl('z', 0.012, 0.025, 0.03, 14), [0, 0, 0.022])]), MAT.darkSteel, { d: 'Elektrische claxon.', p: [s * 0.45, 0.42, 2.18], ex: [s * 0.1, 0, 0.12] })),
    P('Kabelboom', merge([tube([[-0.42, 0.8, 1.8], [-0.5, 0.85, 1.4], [-0.4, 0.9, 1.05], [0, 0.92, 1.0]], 0.008, 40, 6), tube([[0, 0.3, 0.95], [0.7, 0.25, 0.8], [0.75, 0.24, -0.8], [0.7, 0.4, -1.8]], 0.008, 60, 6)]), MAT.plastic, { d: 'Hoofdkabelboom door motorruimte en interieur.', ex: [0, 0.1, 0] }),
    P('Accukabel plus', tube([[-0.5, 0.81, 1.8], [-0.52, 0.55, 1.9], [-0.1, 0.45, 1.88], [0.15, 0.4, 1.8], starter], 0.009, 48, 8), MAT.red, { d: 'Dikke voedingskabel van accu naar startmotor.', ex: [0, -0.06, 0.1] }),
    P('Massakabel', tube([[-0.34, 0.8, 1.8], [-0.3, 0.7, 1.95], [-0.3, 0.6, 2.06]], 0.008, 16, 6), MAT.darkSteel, { d: 'Massaverbinding met de carrosserie.', ex: [0, 0.04, 0.08] }),
  ]);
}
function buildCar() {
  const wheels = [[1, true], [-1, true], [1, false], [-1, false]].map(([s, f]) => buildWheel(s, f));
  return A('Renault Laguna III', {
    d: 'Renault Laguna III hatchback (fase 2, 2011) in Initiale Paris-uitvoering, zilvergrijs metallic, met de 2.0 Turbo F4Rt-motor en zestraps automaat. Tik op een groep om hem uit te klappen.',
    spec: [['Uitvoering', 'Initiale Paris (fase 2)'], ['Carrosserie', '5-deurs hatchback'], ['Motor', '2.0 Turbo F4Rt, 125 kW (170 pk)'], ['Koppel', '270 Nm bij 3250 tpm'], ['Transmissie', '6-traps automaat'], ['Topsnelheid', '220 km/h'], ['0–100 km/h', '9,2 s'], ['Verbruik (gecomb.)', '8,9 l/100 km'], ['CO₂', '210 g/km'], ['Tankinhoud', '66 l'], ['L × B × H', '4695 × 1811 × 1445 mm'], ['Wielbasis', '2756 mm']],
  }, [buildBody(), buildInterior(), buildPowertrain(), buildCooling(), buildFrontAxle(), buildRearAxle(), ...wheels, buildBrakeSystem(), buildExhaust(), buildFuel(), buildElectrical()]);
}
