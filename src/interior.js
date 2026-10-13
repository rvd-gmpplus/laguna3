/* ===================== interieur ===================== */
function frontSeat(s) {
  const who = s > 0 ? 'Bestuurdersstoel' : 'Passagiersstoel';
  const headrest = A('Hoofdsteun', { d: 'In hoogte verstelbare hoofdsteun.', p: [0, 0.68, -0.02], ex: [0, 0.3, 0] }, [
    P('Hoofdsteunkussen', G.rbox(0.27, 0.17, 0.09, 0.04), MAT.leather, { d: 'Met leder bekleed kussen.', p: [0, 0.09, 0], ex: [0, 0.07, 0] }),
    P('Hoofdsteunstangen', merge([xf(G.cyl('y', 0.006, 0.006, 0.1, 10), [0.07, -0.02, 0]), xf(G.cyl('y', 0.006, 0.006, 0.1, 10), [-0.07, -0.02, 0])]), MAT.chrome, { d: 'Verchroomde geleidestangen.', ex: [0, -0.05, 0] }),
  ]);
  const back = A('Rugleuning', { d: 'Elektrisch verstelbare rugleuning met zijairbag en verwarming.', p: [0, 0.24, -0.24], r: [-0.3, 0, 0], ex: [0, 0.26, -0.26] }, [
    P('Rugleuningbekleding', merge([xf(G.rbox(0.5, 0.62, 0.11, 0.04), [0, 0.31, 0]), xf(G.rbox(0.07, 0.55, 0.08, 0.03), [0.22, 0.3, 0.05]), xf(G.rbox(0.07, 0.55, 0.08, 0.03), [-0.22, 0.3, 0.05])]), MAT.leather, { d: 'Beige lederen bekleding met verstevigde zijwangen.', ex: [0, 0, 0.13] }),
    P('Verwarmingsmat rugleuning', G.box(0.34, 0.4, 0.003), MAT.heater, { d: 'Verwarmingselement voor de stoelverwarming.', p: [0, 0.3, 0.057], ex: [0, 0, 0.24] }),
    P('Rugleuningframe', merge([xf(G.box(0.44, 0.03, 0.03), [0, 0.6, -0.03]), xf(G.box(0.03, 0.6, 0.03), [0.21, 0.3, -0.03]), xf(G.box(0.03, 0.6, 0.03), [-0.21, 0.3, -0.03])]), MAT.darkSteel, { d: 'Stalen frame van de rugleuning.', ex: [0, 0, -0.14] }),
    P('Zijairbag', G.rbox(0.06, 0.2, 0.08, 0.02), MAT.plastic, { d: 'Zijairbag in de buitenste zijwang.', p: [s * 0.235, 0.38, 0], ex: [s * 0.2, 0, 0] }),
    headrest,
  ]);
  return A(who, { d: `${who}: elektrisch verstelbaar met geheugen (bestuurder), stoelverwarming en beige leder (Initiale).`, p: [s * 0.37, 0.24, -0.02], ex: [s * 0.36, 0.05, 0.06] }, [
    P('Stoelrail links', G.box(0.03, 0.03, 0.5), MAT.steel, { d: 'Geleiderail voor de lengteverstelling.', p: [0.18, 0.015, 0], ex: [0.04, -0.15, 0] }),
    P('Stoelrail rechts', G.box(0.03, 0.03, 0.5), MAT.steel, { d: 'Geleiderail voor de lengteverstelling.', p: [-0.18, 0.015, 0], ex: [-0.04, -0.15, 0] }),
    P('Stoelonderstel', G.rbox(0.42, 0.06, 0.44, 0.01), MAT.darkSteel, { d: 'Onderstel met hoogteverstelling.', p: [0, 0.07, 0.01], ex: [0, -0.08, 0] }),
    P('Verstelmotoren', merge([xf(G.cyl('x', 0.022, 0.022, 0.12, 14), [0, 0.115, 0.12]), xf(G.cyl('x', 0.022, 0.022, 0.12, 14), [0, 0.115, -0.1])]), MAT.darkSteel, { d: 'Elektromotoren voor lengte, hoogte en hellingshoek.', ex: [0, -0.03, 0.22] }),
    P('Zitting', merge([xf(G.rbox(0.5, 0.11, 0.52, 0.04), [0, 0.18, 0.02]), xf(G.rbox(0.07, 0.06, 0.5, 0.03), [0.22, 0.25, 0.02]), xf(G.rbox(0.07, 0.06, 0.5, 0.03), [-0.22, 0.25, 0.02])]), MAT.leather, { d: 'Lederen zitting met zijwangen.', ex: [0, 0.1, 0.12] }),
    P('Verwarmingsmat zitting', G.box(0.34, 0.003, 0.38), MAT.heater, { d: 'Verwarmingselement in de zitting.', p: [0, 0.238, 0.02], ex: [0, 0.2, 0.2] }),
    back,
  ]);
}
function buildInterior() {
  const dashProfile = [[1.03, 0.935], [0.8, 0.95], [0.62, 0.945], [0.52, 0.91], [0.47, 0.84], [0.48, 0.74], [0.55, 0.62], [0.58, 0.52], [0.68, 0.5], [0.9, 0.6], [1.0, 0.78]];
  const vent = merge([G.rbox(0.11, 0.05, 0.015, 0.008), ...[-0.012, 0, 0.012].map(y => xf(G.box(0.1, 0.004, 0.01), [0, y, 0.006]))]);
  const dash = A('Dashboard', { d: 'Dashboard met instrumenten, navigatiescherm, klimaatbediening en airbags.', ex: [0, 0.16, 0.6] }, [
    P('Dashboardbekleding', side(shapeOf(dashProfile), 1.5), MAT.dash, { d: 'Zachte kunststof dashboardhuid over een draagstructuur.', ex: [0, 0.12, 0.08] }),
    P('Dwarsbalk dashboard', merge([G.cyl('x', 0.03, 0.03, 1.44, 16), xf(G.box(0.03, 0.3, 0.03), [0.12, -0.2, -0.1]), xf(G.box(0.03, 0.3, 0.03), [-0.12, -0.2, -0.1])]), MAT.steel, { d: 'Stalen dwarsbalk die stuurkolom en dashboard draagt.', p: [0, 0.8, 0.72], ex: [0, -0.1, 0.1] }),
    P('Instrumentenpaneel', G.rbox(0.3, 0.12, 0.03, 0.01), MAT.screen, { d: 'Instrumenten met snelheidsmeter, toerenteller en boordcomputer.', p: [0.37, 0.875, 0.53], r: [-0.25, 0, 0], ex: [0, 0.04, -0.12] }),
    P('Instrumentenkap', G.rbox(0.34, 0.035, 0.14, 0.015), MAT.dash, { d: 'Kap boven de instrumenten tegen reflecties.', p: [0.37, 0.945, 0.56], ex: [0, 0.1, 0] }),
    P('Navigatiescherm', G.rbox(0.2, 0.11, 0.018, 0.008), MAT.screen, { d: 'Scherm van de Carminat TomTom Live-navigatie.', p: [0, 0.965, 0.64], r: [-0.35, 0, 0], ex: [0, 0.14, -0.04] }),
    P('Klimaatbedieningspaneel', G.rbox(0.22, 0.08, 0.02, 0.008), MAT.plastic, { d: 'Bediening van de tweezone-klimaatregeling.', p: [0, 0.78, 0.466], ex: [0, 0, -0.14] }),
    ...[[0.62, 0.485], [0.1, 0.462], [-0.1, 0.462], [-0.62, 0.485]].map(([x, z], i) => P(`Ventilatierooster ${i + 1}`, vent, MAT.satin, { d: 'Verstelbaar luchtrooster.', p: [x, 0.86, z], ex: [0, 0.03, -0.12] })),
    P('Handschoenenkastje', G.rbox(0.4, 0.15, 0.03, 0.01), MAT.dash, { d: 'Afsluitbaar dashboardkastje.', p: [-0.38, 0.67, 0.508], ex: [0, -0.04, -0.16] }),
    P('Passagiersairbag', G.rbox(0.3, 0.06, 0.2, 0.012), MAT.plastic, { d: 'Airbagmodule aan passagierszijde.', p: [-0.38, 0.9, 0.68], ex: [0, 0.22, 0] }),
    P('Kachelhuis', merge([G.rbox(0.5, 0.28, 0.24, 0.03), xf(G.cyl('x', 0.07, 0.07, 0.16, 20), [-0.33, -0.05, 0])]), MAT.plastic, { d: 'Klimaatunit met kachelradiateur, verdamper en aanjager.', p: [0.02, 0.66, 0.8], ex: [0, -0.06, 0.24] }),
  ]);
  const cup = G.lathe('y', [[0.035, 0], [0.035, -0.06], [0, -0.06]], 24, 'cup');
  const console_ = A('Middenconsole', { d: 'Middenconsole met keuzehendel, kaartlezer en startknop.', ex: [0, 0.12, 0.05] }, [
    P('Consoletunnel', G.rbox(0.24, 0.26, 0.87, 0.04), MAT.dash, { d: 'Kunststof console over de vloertunnel.', p: [0, 0.36, 0.015], ex: [0, -0.06, 0] }),
    P('Middenconsole voorzijde', G.rbox(0.24, 0.3, 0.12, 0.03), MAT.dash, { d: 'Verticaal deel onder de klimaatbediening.', p: [0, 0.55, 0.48], ex: [0, 0, 0.08] }),
    P('Keuzehendel', merge([xf(G.cyl('y', 0.008, 0.008, 0.08, 10), [0, -0.04, 0]), G.lathe('y', [[0, 0], [0.022, 0.006], [0.026, 0.03], [0.018, 0.05], [0, 0.055]], 24)]), MAT.leather, { d: 'Keuzehendel van de automaat (P-R-N-D) met handmatige schakelstand.', p: [0, 0.545, 0.2], ex: [0, 0.18, 0] }),
    P('Keuzehendelplaat', G.rbox(0.12, 0.012, 0.2, 0.005), MAT.satin, { d: 'Afdekplaat met standaanduiding.', p: [0, 0.497, 0.2], ex: [0, 0.1, 0] }),
    P('Kaartlezer', G.rbox(0.1, 0.03, 0.03, 0.008), MAT.plastic, { d: 'Lezer voor de handsfree Renault-kaart.', p: [0, 0.64, 0.545], ex: [0, 0, 0.12] }),
    P('Startknop', G.cyl('z', 0.015, 0.015, 0.012, 20), MAT.chrome, { d: 'Start-/stopknop van de motor.', p: [0.08, 0.64, 0.548], ex: [0, 0, 0.14] }),
    P('Parkeerremschakelaar', G.rbox(0.04, 0.015, 0.05, 0.005), MAT.plastic, { d: 'Bedient de automatische parkeerrem.', p: [0.07, 0.498, 0.32], ex: [0, 0.1, 0] }),
    P('Bekerhouders', merge([xf(cup, [0.045, 0.49, 0.02]), xf(cup, [-0.045, 0.49, 0.02])]), MAT.plastic, { d: 'Twee bekerhouders.', ex: [0, 0.08, 0] }),
    P('Armsteun middenconsole', G.rbox(0.2, 0.07, 0.3, 0.025), MAT.leather, { d: 'Lederen armsteun met opbergvak.', p: [0, 0.525, -0.26], ex: [0, 0.14, -0.05] }),
  ]);
  const seats = A('Stoelen', { d: 'Voorstoelen met verwarming en elektrische verstelling, achterbank met neerklapbare rugleuning.', ex: [0, 0.26, -0.1] }, [
    frontSeat(1), frontSeat(-1),
    A('Achterbank', { d: 'Driezits achterbank met gedeeld neerklapbare rugleuning.', ex: [0, 0.1, -0.36] }, [
      P('Zitting achterbank', G.rbox(1.3, 0.12, 0.48, 0.05), MAT.leather, { d: 'Lederen zitting achter.', p: [0, 0.43, -0.95], ex: [0, -0.06, 0.12] }),
      P('Rugleuning groot deel', G.rbox(0.77, 0.56, 0.11, 0.04), MAT.leather, { d: 'Grootste deel van de gedeelde rugleuning.', p: [-0.265, 0.76, -1.27], r: [-0.25, 0, 0], ex: [-0.12, 0.1, -0.1] }),
      P('Rugleuning klein deel', G.rbox(0.52, 0.56, 0.11, 0.04), MAT.leather, { d: 'Kleinste deel van de gedeelde rugleuning.', p: [0.385, 0.76, -1.27], r: [-0.25, 0, 0], ex: [0.12, 0.1, -0.1] }),
      ...[[-0.42, 1.1, 'links'], [0, 1.08, 'midden'], [0.42, 1.1, 'rechts']].map(([x, y, n]) => P(`Hoofdsteun achter ${n}`, G.rbox(0.24, 0.14, 0.08, 0.035), MAT.leather, { d: 'Hoofdsteun achter.', p: [x, y, -1.37], ex: [0, 0.22, 0] })),
    ]),
    A('Veiligheidsgordels', { d: 'Driepuntsgordels met oprolautomaten en gordelsloten.', ex: [0, 0.3, 0] }, [
      ...[1, -1].map(s => P(`Gordelrolautomaat voor ${sideName(s)}`, G.rbox(0.06, 0.1, 0.06, 0.01), MAT.plastic, { d: 'Oprolautomaat met gordelspanner in de B-stijl.', p: [s * 0.78, 0.36, -0.3], ex: [s * 0.1, 0, 0] })),
      ...[1, -1].map(s => P(`Gordelband voor ${sideName(s)}`, rodBetween([s * 0.8, 1.2, -0.3], [s * 0.15, 0.47, -0.18], 0.008, 6), MAT.plastic, { d: 'Gordelband van de voorstoel.', ex: [s * 0.12, 0.08, 0] })),
      ...[1, -1].map(s => P(`Gordelslot voor ${sideName(s)}`, G.rbox(0.03, 0.08, 0.04, 0.008), MAT.plastic, { d: 'Gordelslot met gordelverklikker.', p: [s * 0.14, 0.45, -0.18], ex: [0, 0.12, 0] })),
      ...[1, -1].map(s => P(`Gordelrolautomaat achter ${sideName(s)}`, G.rbox(0.06, 0.06, 0.08, 0.01), MAT.plastic, { d: 'Oprolautomaat achter.', p: [s * 0.58, 1.0, -1.55], ex: [0, 0.12, 0] })),
      ...[-0.45, 0, 0.45].map((x, i) => P(`Gordelslot achter ${i + 1}`, G.rbox(0.03, 0.07, 0.04, 0.008), MAT.plastic, { d: 'Gordelslot achterbank.', p: [x, 0.48, -1.12], ex: [0, 0.12, 0] })),
    ]),
  ]);
  const carpet = front(shapeOf([[-0.8, 0.235], [-0.13, 0.235], [-0.11, 0.36], [0.11, 0.36], [0.13, 0.235], [0.8, 0.235], [0.8, 0.215], [-0.8, 0.215]]), 1.65); carpet.translate(0, 0, 0.125);
  const trim = A('Bekleding', { d: 'Hemel, vloer en bagageruimte.' }, [
    P('Hemelbekleding', patch((z, w) => { const p = ghPt(z, w); return [p[0] * 0.965, p[1] - 0.028, p[2]]; }, -1.3, 0.4, 24, () => [0.3, 0.7], 12), MAT.fabric, { d: 'Lichtbeige hemelbekleding.', ex: [0, 0.48, 0] }),
    P('Vloerbedekking', carpet, MAT.carpet, { d: 'Getufte vloerbedekking over vloer en tunnel.', ex: [0, -0.22, 0] }),
    P('Hoedenplank', G.rbox(1.3, 0.012, 0.55, 0.005), MAT.carpet, { d: 'Afdekplaat van de bagageruimte; beweegt mee met de achterklep.', p: [0, 1.0, -1.85], ex: [0, 0.3, -0.2] }),
    P('Bagageruimtevloer', G.rbox(1.2, 0.015, 0.75, 0.005), MAT.carpet, { d: 'Vloerplaat van de bagageruimte (450 tot 1377 liter).', p: [0, 0.46, -1.86], ex: [0, -0.12, -0.3] }),
    ...[1, -1].map(s => P(`Zonneklep ${sideName(s)}`, G.rbox(0.4, 0.012, 0.17, 0.006), MAT.fabric, { d: 'Zonneklep met make-upspiegel.', p: [s * 0.36, 1.372, 0.27], ex: [0, 0.3, 0.1] })),
  ]);
  const pedals = A('Pedalen', { d: 'Rem- en gaspedaal; een automaat heeft geen koppelingspedaal.', ex: [0.12, -0.1, 0.38] }, [
    P('Pedaalbok', G.rbox(0.18, 0.2, 0.1, 0.01), MAT.darkSteel, { d: 'Steun waarin de pedalen scharnieren.', p: [0.33, 0.72, 0.86], ex: [0, 0.1, 0.08] }),
    P('Rempedaal', merge([rodBetween([0.4, 0.72, 0.86], [0.4, 0.42, 0.74], 0.01), xf(G.rbox(0.13, 0.065, 0.012, 0.005), [0.4, 0.4, 0.73], [-0.35, 0, 0])]), MAT.satin, { d: 'Breed rempedaal, typisch voor een automaat.', ex: [0.04, 0, -0.06] }),
    P('Gaspedaal', merge([rodBetween([0.23, 0.7, 0.86], [0.23, 0.4, 0.78], 0.006), xf(G.rbox(0.06, 0.15, 0.012, 0.005), [0.23, 0.36, 0.77], [-0.4, 0, 0])]), MAT.satin, { d: 'Elektronisch gaspedaal (drive-by-wire).', ex: [-0.06, 0, -0.06] }),
    P('Voetsteun', xf(G.rbox(0.07, 0.17, 0.02, 0.006), [0.58, 0.33, 0.76], [-0.6, 0, 0]), MAT.satin, { d: 'Steun voor de linkervoet.', ex: [0.08, 0, -0.04] }),
  ]);
  const mirror = A('Binnenspiegel', { d: 'Automatisch dimmende binnenspiegel.', ex: [0, 0.32, 0.2] }, [
    P('Spiegelvoet binnen', G.rbox(0.04, 0.05, 0.03, 0.008), MAT.plastic, { d: 'Voet op de voorruit, met regensensor.', p: [0, 1.36, 0.38], ex: [0, 0.06, 0.04] }),
    P('Spiegelhuis binnen', G.rbox(0.26, 0.065, 0.035, 0.015), MAT.plastic, { d: 'Behuizing van de binnenspiegel.', p: [0, 1.3, 0.355] }),
    P('Spiegelglas binnen', G.box(0.24, 0.05, 0.003), MAT.reflector, { d: 'Elektrochroom spiegelglas dat automatisch dimt.', p: [0, 1.3, 0.336], ex: [0, 0, -0.08] }),
  ]);
  return A('Interieur', { d: 'Initiale-interieur met beige leder, stoelverwarming, Bose-audio en tweezone-klimaatregeling.', ex: [0, 0.66, 0] }, [dash, console_, seats, trim, pedals, mirror]);
}
