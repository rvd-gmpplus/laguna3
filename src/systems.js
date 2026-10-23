/* ===================== koeling, luchtinlaat, uitlaat, brandstof, elektra en de samenstelling van de auto ===================== */
// Alles wat aan de motor of de startmotor hangt begint op ENG_PORTS.* (via ENG2CAR) of DRV_PORTS.starterTerminal.
std('sysHose', 0x1b1d20, 0, 0.8);
std('sysBattery', 0x1f2125, 0, 0.6);                           // zwarte accubak (golf 5i, naar foto; was blauwgrijs)
std('sysTkNis', 0x3a3e44, 0.15, 0.55);                          // tankkom: halfdonker satijn, donkerder dan de lak
std('sysDemper', 0x4a4642, 0.35, 0.88);                         // einddemper en eindpijpen: donker, ruw plaatstaal (onder de bumper is bijna niets te zien)

// Routes van slangen, kabels en leidingen in de motorruimte (golf 5j): tussenpunten in het autoframe uit een A*-zoektocht door de
// vrije ruimte (6 mm-rooster met de straal plus speling, daarna met zichtlijnen gladgetrokken); de uiteinden rekent de code zelf uit.
const SYS_RT = {
  vent: [[0.104, 0.748, 1.424], [0.104, 0.756, 1.424], [0.104, 0.764, 1.424], [0.104, 0.772, 1.424], [0.112, 0.788, 1.424], [0.112, 0.804, 1.438], [0.111, 0.821, 1.453], [0.111, 0.834, 1.469], [0.108, 0.834, 1.491], [0.105, 0.829, 1.516], [0.101, 0.824, 1.54], [0.094, 0.819, 1.562], [0.087, 0.814, 1.584], [0.065, 0.813, 1.592], [0.043, 0.811, 1.6], [0.02, 0.81, 1.608], [-0.003, 0.809, 1.615], [-0.026, 0.807, 1.623], [-0.05, 0.806, 1.63], [-0.073, 0.805, 1.637], [-0.097, 0.804, 1.644], [-0.12, 0.803, 1.651], [-0.144, 0.802, 1.658], [-0.168, 0.801, 1.665], [-0.192, 0.799, 1.671], [-0.216, 0.798, 1.678], [-0.24, 0.797, 1.684], [-0.264, 0.796, 1.691], [-0.288, 0.795, 1.697], [-0.312, 0.794, 1.704], [-0.336, 0.793, 1.71], [-0.36, 0.792, 1.715], [-0.383, 0.792, 1.72], [-0.406, 0.791, 1.725], [-0.43, 0.79, 1.73], [-0.453, 0.79, 1.734], [-0.475, 0.789, 1.737], [-0.498, 0.788, 1.741], [-0.52, 0.788, 1.744], [-0.528, 0.788, 1.744]],
  aanvoer: [[-0.565, 0.565, 1.757], [-0.555, 0.552, 1.771], [-0.545, 0.539, 1.785], [-0.534, 0.525, 1.798], [-0.523, 0.511, 1.812], [-0.512, 0.497, 1.825], [-0.5, 0.483, 1.838], [-0.488, 0.469, 1.851], [-0.473, 0.453, 1.862], [-0.455, 0.441, 1.865], [-0.436, 0.429, 1.868], [-0.418, 0.417, 1.871], [-0.399, 0.405, 1.874], [-0.381, 0.394, 1.876], [-0.362, 0.383, 1.878], [-0.344, 0.372, 1.88]],
  air: [[0.25, 0.775, 1.33], [0.251, 0.765, 1.312], [0.251, 0.756, 1.293], [0.252, 0.746, 1.275], [0.252, 0.736, 1.256], [0.253, 0.726, 1.238], [0.254, 0.715, 1.218], [0.254, 0.698, 1.208], [0.255, 0.679, 1.206], [0.256, 0.658, 1.213], [0.256, 0.636, 1.222], [0.255, 0.615, 1.229], [0.242, 0.596, 1.231], [0.223, 0.579, 1.23], [0.204, 0.562, 1.229], [0.185, 0.546, 1.228], [0.164, 0.532, 1.227], [0.143, 0.519, 1.226], [0.121, 0.505, 1.225], [0.1, 0.492, 1.224]],
  duct: [[0.28, 0.624, 2.176], [0.29, 0.627, 2.153], [0.3, 0.631, 2.129], [0.31, 0.635, 2.106], [0.319, 0.639, 2.082], [0.329, 0.642, 2.059], [0.339, 0.646, 2.035], [0.349, 0.65, 2.011], [0.352, 0.651, 1.987], [0.355, 0.653, 1.962], [0.357, 0.654, 1.938], [0.36, 0.655, 1.913], [0.362, 0.656, 1.888], [0.364, 0.658, 1.864], [0.366, 0.659, 1.839], [0.368, 0.66, 1.815], [0.37, 0.661, 1.791], [0.371, 0.661, 1.767], [0.372, 0.662, 1.744], [0.373, 0.663, 1.721], [0.375, 0.664, 1.699], [0.376, 0.665, 1.677], [0.377, 0.665, 1.655], [0.378, 0.666, 1.634], [0.378, 0.666, 1.622]],
  vloei: [[-0.275, 0.368, 2.056], [-0.288, 0.382, 2.06], [-0.302, 0.4, 2.06], [-0.315, 0.418, 2.059], [-0.328, 0.436, 2.059], [-0.341, 0.454, 2.058], [-0.354, 0.474, 2.051], [-0.367, 0.492, 2.041], [-0.379, 0.511, 2.032], [-0.392, 0.529, 2.022], [-0.404, 0.547, 2.011], [-0.417, 0.566, 2], [-0.429, 0.584, 1.988], [-0.442, 0.601, 1.975], [-0.454, 0.619, 1.962], [-0.467, 0.636, 1.949], [-0.479, 0.653, 1.936], [-0.491, 0.67, 1.923], [-0.504, 0.687, 1.909], [-0.516, 0.704, 1.895], [-0.528, 0.721, 1.881], [-0.54, 0.735, 1.868], [-0.552, 0.748, 1.854], [-0.564, 0.762, 1.84], [-0.576, 0.776, 1.826], [-0.588, 0.789, 1.812], [-0.578, 0.789, 1.752], [-0.56, 0.808, 1.741], [-0.542, 0.828, 1.73], [-0.535, 0.828, 1.707], [-0.528, 0.829, 1.684], [-0.521, 0.828, 1.661], [-0.514, 0.827, 1.639], [-0.507, 0.825, 1.616], [-0.5, 0.824, 1.594], [-0.493, 0.822, 1.571], [-0.486, 0.82, 1.549], [-0.478, 0.819, 1.527], [-0.471, 0.817, 1.504], [-0.464, 0.816, 1.482], [-0.456, 0.817, 1.46], [-0.449, 0.819, 1.438], [-0.441, 0.821, 1.416], [-0.433, 0.823, 1.394], [-0.425, 0.825, 1.373], [-0.415, 0.828, 1.353], [-0.4, 0.822, 1.339], [-0.385, 0.815, 1.325], [-0.367, 0.805, 1.313], [-0.35, 0.794, 1.302], [-0.332, 0.782, 1.291], [-0.314, 0.77, 1.28], [-0.295, 0.759, 1.269], [-0.277, 0.746, 1.258], [-0.259, 0.734, 1.248], [-0.24, 0.721, 1.238], [-0.222, 0.709, 1.227], [-0.203, 0.696, 1.217], [-0.184, 0.683, 1.207], [-0.165, 0.67, 1.197], [-0.146, 0.657, 1.187], [-0.128, 0.644, 1.177], [-0.109, 0.63, 1.167], [-0.09, 0.617, 1.157], [-0.071, 0.604, 1.147], [-0.052, 0.591, 1.137], [-0.033, 0.578, 1.127], [-0.015, 0.565, 1.117], [0.002, 0.552, 1.119], [0.018, 0.54, 1.121]],
  plus: [[0.346, 0.696, 1.741], [0.337, 0.675, 1.735], [0.331, 0.653, 1.73], [0.325, 0.631, 1.725], [0.319, 0.609, 1.721], [0.314, 0.587, 1.717], [0.309, 0.565, 1.713], [0.305, 0.542, 1.709], [0.301, 0.519, 1.706], [0.297, 0.496, 1.702], [0.294, 0.473, 1.699]],
  massa: [[0.668, 0.758, 1.732], [0.662, 0.758, 1.72], [0.658, 0.749, 1.696], [0.653, 0.739, 1.672], [0.649, 0.73, 1.647], [0.644, 0.72, 1.623]],
  gas: [[0.626, 0.734, 1.906], [0.624, 0.712, 1.909], [0.621, 0.69, 1.912], [0.619, 0.668, 1.915], [0.616, 0.646, 1.917], [0.614, 0.624, 1.92], [0.611, 0.601, 1.923], [0.608, 0.581, 1.925], [0.606, 0.561, 1.927], [0.603, 0.54, 1.928]],
  kbv: [[0.484, 0.806, 1.529], [0.476, 0.816, 1.539], [0.468, 0.825, 1.549], [0.455, 0.829, 1.562], [0.438, 0.83, 1.576], [0.42, 0.827, 1.587], [0.402, 0.821, 1.597], [0.385, 0.814, 1.608], [0.368, 0.807, 1.619], [0.351, 0.8, 1.631], [0.335, 0.792, 1.642], [0.318, 0.785, 1.653], [0.314, 0.779, 1.676], [0.309, 0.773, 1.698], [0.303, 0.767, 1.72], [0.296, 0.761, 1.741], [0.289, 0.756, 1.762], [0.279, 0.751, 1.782], [0.269, 0.747, 1.801], [0.257, 0.743, 1.82], [0.244, 0.739, 1.837], [0.23, 0.736, 1.854], [0.214, 0.733, 1.871], [0.199, 0.731, 1.887], [0.183, 0.729, 1.903], [0.166, 0.727, 1.919]],
  kbvR: [[0.125, 0.724, 1.935], [0.1, 0.722, 1.935], [0.074, 0.721, 1.935], [0.049, 0.719, 1.936], [0.024, 0.718, 1.936], [-0.001, 0.717, 1.936], [-0.026, 0.715, 1.936], [-0.051, 0.714, 1.936], [-0.076, 0.712, 1.936], [-0.102, 0.711, 1.937], [-0.127, 0.71, 1.937], [-0.152, 0.708, 1.937], [-0.177, 0.707, 1.937], [-0.202, 0.705, 1.937], [-0.227, 0.704, 1.937], [-0.253, 0.703, 1.938], [-0.278, 0.701, 1.938], [-0.303, 0.7, 1.938], [-0.328, 0.698, 1.938], [-0.353, 0.697, 1.938], [-0.378, 0.696, 1.938], [-0.403, 0.694, 1.938], [-0.429, 0.693, 1.939], [-0.454, 0.691, 1.939], [-0.479, 0.69, 1.939], [-0.504, 0.688, 1.939], [-0.529, 0.687, 1.939], [-0.554, 0.686, 1.939], [-0.58, 0.684, 1.94], [-0.605, 0.683, 1.94], [-0.63, 0.681, 1.94]],
  kbvL: [[0.175, 0.723, 1.935], [0.201, 0.721, 1.935], [0.226, 0.718, 1.936], [0.251, 0.716, 1.936], [0.276, 0.714, 1.936], [0.301, 0.712, 1.937], [0.327, 0.709, 1.937], [0.352, 0.707, 1.937], [0.377, 0.705, 1.937], [0.403, 0.703, 1.938], [0.428, 0.7, 1.938], [0.453, 0.698, 1.938], [0.478, 0.696, 1.938], [0.503, 0.694, 1.938], [0.529, 0.691, 1.939], [0.554, 0.689, 1.939], [0.579, 0.687, 1.939], [0.605, 0.684, 1.94], [0.63, 0.682, 1.94]],
  kbm: [[0.626, 0.71, 1.654], [0.632, 0.71, 1.648], [0.632, 0.71, 1.636], [0.632, 0.71, 1.624], [0.61, 0.712, 1.611], [0.588, 0.713, 1.598], [0.567, 0.715, 1.586], [0.546, 0.716, 1.573], [0.525, 0.717, 1.561], [0.504, 0.718, 1.549], [0.488, 0.716, 1.54], [0.486, 0.702, 1.523], [0.485, 0.689, 1.507], [0.483, 0.675, 1.49], [0.482, 0.661, 1.473], [0.48, 0.647, 1.456], [0.479, 0.633, 1.439], [0.474, 0.621, 1.419], [0.465, 0.614, 1.399], [0.452, 0.611, 1.379], [0.437, 0.61, 1.359], [0.422, 0.609, 1.339], [0.407, 0.609, 1.319], [0.392, 0.608, 1.3], [0.376, 0.608, 1.28], [0.36, 0.608, 1.261], [0.345, 0.608, 1.242], [0.329, 0.609, 1.224], [0.312, 0.61, 1.205], [0.296, 0.611, 1.187], [0.28, 0.612, 1.169], [0.263, 0.613, 1.15], [0.246, 0.614, 1.132], [0.23, 0.616, 1.114], [0.213, 0.617, 1.096], [0.197, 0.619, 1.078]],
  wash: [[-0.641, 0.576, 2.015], [-0.628, 0.586, 1.996], [-0.614, 0.596, 1.977], [-0.602, 0.606, 1.958], [-0.59, 0.616, 1.938], [-0.578, 0.626, 1.918], [-0.568, 0.635, 1.898], [-0.558, 0.644, 1.878], [-0.55, 0.653, 1.857], [-0.543, 0.661, 1.836], [-0.537, 0.669, 1.815], [-0.532, 0.677, 1.793], [-0.528, 0.685, 1.771], [-0.524, 0.692, 1.749], [-0.522, 0.699, 1.726], [-0.52, 0.706, 1.703], [-0.519, 0.713, 1.68], [-0.518, 0.719, 1.657], [-0.518, 0.726, 1.633], [-0.518, 0.733, 1.61], [-0.518, 0.739, 1.587], [-0.519, 0.746, 1.563], [-0.52, 0.752, 1.54], [-0.521, 0.758, 1.516], [-0.522, 0.765, 1.493], [-0.539, 0.768, 1.486], [-0.559, 0.77, 1.484], [-0.58, 0.773, 1.482]],
};
const sysP = e => ENG2CAR(e);                                  // punt in het motorframe naar het autoframe
const sysE = (port, d = 0) => ENG2CAR(portAt(port, d));         // punt op afstand d buiten een aansluiting (autoframe)
function sysDir(a, b) { return V3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize(); }
function sysAt(p, t, k) { return [p[0] + t.x * k, p[1] + t.y * k, p[2] + t.z * k]; }
// slangklem met stelschroef om een slang of pijp met straal r (de band ligt 3,5 mm buiten de slang, generieke hoseClamp uit core.js); as langs t (eenheidsvector), schuift bij uitklappen langs out
function sysClamp(name, at, t, r, out) {
  const o = out || t;
  return P(name, hoseClamp('z', r + 0.0035, { screw: true }), MAT.steel, { d: 'Slangklem van verzinkt staal met een stelschroef; klemt de slang of pijp vast op de aansluiting.', p: at, q: quatFromTo(V3(0, 0, 1), t), ex: [o.x * 0.06, o.y * 0.06 + 0.02, o.z * 0.06] });
}
// stuk [u0, u1] (booglengte 0 tot 1) van de buis tube(pts, r, n, rad): de ringen ertussen liggen op k/n met de assenstelsels
// van de hele buis, de uiteinden op u0 en u1 (assenstelsel meegedraaid vanaf de buurring zoals computeFrenetFrames doet).
// Zo valt het stuk precies op de oorspronkelijke buis en blijven de afstanden tot de omgeving gelijk.
function sysTubePart(pts, r, n, rad, u0, u1) {
  const full = new THREE.CatmullRomCurve3(pts.map(p => V3(...p)), false, 'centripetal'), F = full.computeFrenetFrames(n, false);
  const us = [u0]; for (let k = Math.ceil(u0 * n); k <= Math.floor(u1 * n); k++) if (k / n - u0 > 1e-6 && u1 - k / n > 1e-6) us.push(k); us.push(u1);
  const fr = { tangents: [], normals: [], binormals: [] }, uOf = i => (i === 0 || i === us.length - 1) ? us[i] : us[i] / n;
  us.forEach((v, i) => {
    if (i > 0 && i < us.length - 1) { fr.tangents.push(F.tangents[v]); fr.normals.push(F.normals[v]); fr.binormals.push(F.binormals[v]); return; }
    const k = i === 0 ? Math.ceil(u0 * n) : Math.floor(u1 * n), T = full.getTangentAt(v), N = F.normals[k].clone(), ax = new THREE.Vector3().crossVectors(F.tangents[k], T);
    if (ax.length() > Number.EPSILON) N.applyMatrix4(new THREE.Matrix4().makeRotationAxis(ax.normalize(), Math.acos(THREE.MathUtils.clamp(F.tangents[k].dot(T), -1, 1))));
    fr.tangents.push(T); fr.normals.push(N); fr.binormals.push(new THREE.Vector3().crossVectors(T, N));
  });
  const part = new THREE.Curve();
  part.getPointAt = (t, o) => full.getPointAt(uOf(Math.round(t * (us.length - 1))), o);
  part.computeFrenetFrames = () => fr;
  return new THREE.TubeGeometry(part, us.length - 1, r, rad, false);
}
// slang als groep: slang plus twee klemmen. pts in het autoframe; de uiteinden liggen op de aansluitingen.
function sysHose(name, d, pts, r, o = {}) {
  const n = pts.length, t0 = sysDir(pts[0], pts[1]), t1 = sysDir(pts[n - 1], pts[n - 2]);
  const kids = [P('Slang', tube(pts, r, o.seg || 28, o.rad || 8), o.mat || MAT.sysHose, { d: o.dh || 'Slang van versterkt rubber; volgt de route tussen beide aansluitingen.', ex: o.hex || [0, 0.08, 0] })];
  if (o.c0 !== false) kids.push(sysClamp(o.n0 || 'Klem begin', sysAt(pts[0], t0, 0.016), t0, r, t0.clone().negate()));
  if (o.c1 !== false) kids.push(sysClamp(o.n1 || 'Klem eind', sysAt(pts[n - 1], t1, 0.016), t1, r, t1.clone().negate()));
  return A(name, { d, spec: o.spec, ex: o.ex || [0, 0.1, 0] }, kids);
}

/* ============================ koeling en luchtinlaat ============================ */
function buildCooling() {
  const RY = 0.48, RZ = 1.99;                                   // hartlijn koelblok
  // ---------- radiateur ----------
  const coreGeo = cache('sysRadCore', () => merge([G.box(0.56, 0.36, 0.022), ...[-0.15, -0.075, 0, 0.075, 0.15].map(y => xf(G.box(0.56, 0.003, 0.025), [0, y, 0]))]));
  const radiateur = A('Radiateur', { d: 'Dwarsstroomradiateur met aluminium blok en kunststof waterkasten, vóór de motor in de frontmodule. De koelvloeistof stroomt van de linker naar de rechter waterkast (opbouw schematisch).', ex: [0, 0, -0.12] }, [
    P('Koelblok', coreGeo, MAT.alu, { d: 'Aluminium blok met buisjes en lamellen waar de lucht doorheen stroomt.', p: [0, RY, RZ], ex: [0, 0, 0] }),
    P('Waterkast links', G.rbox(0.04, 0.36, 0.046, 0.008), MAT.plastic, { d: 'Kunststof waterkast waar de warme koelvloeistof binnenkomt.', p: [0.30, RY, RZ], ex: [0.13, 0, 0] }),
    P('Waterkast rechts', G.rbox(0.04, 0.36, 0.046, 0.008), MAT.plastic, { d: 'Kunststof waterkast waar de afgekoelde vloeistof het blok verlaat.', p: [-0.30, RY, RZ], ex: [-0.13, 0, 0] }),
    P('Pakking waterkast links', G.box(0.012, 0.34, 0.024), MAT.rubber, { d: 'Rubber afdichting tussen waterkast en blok.', p: [0.285, RY, RZ], ex: [0.06, 0, 0], inner: true }),
    P('Pakking waterkast rechts', G.box(0.012, 0.34, 0.024), MAT.rubber, { d: 'Rubber afdichting tussen waterkast en blok.', p: [-0.285, RY, RZ], ex: [-0.06, 0, 0] }),
    P('Inlaatstomp', G.cyl('z', 0.0185, 0.0185, 0.045, 14), MAT.plastic, { d: 'Aansluiting van de bovenste radiateurslang op de linker waterkast.', p: [0.30, 0.62, RZ - 0.0455], ex: [0, 0.05, -0.1] }),
    P('Uitlaatstomp', G.cyl('z', 0.0185, 0.0185, 0.045, 14), MAT.plastic, { d: 'Aansluiting van de onderste radiateurslang op de rechter waterkast.', p: [-0.30, 0.34, RZ - 0.0455], ex: [0, -0.05, -0.1] }),
    P('Aftapkraan', merge([G.cyl('y', 0.008, 0.008, 0.026, 10), xf(G.box(0.03, 0.008, 0.008), [0, -0.016, 0])]), MAT.plastic, { d: 'Kraan onderin de rechter waterkast om de koelvloeistof af te tappen.', p: [-0.30, 0.285, RZ], ex: [0, -0.1, 0] }),
    P('Ontluchtingsschroef', G.cyl('y', 0.007, 0.007, 0.02, 8), MAT.bearing, { d: 'Schroef bovenin de waterkast om lucht uit het koelsysteem te laten ontsnappen.', p: [-0.30, 0.67, RZ], ex: [0, 0.12, 0] }),
    ...[1, -1].map(s => P(`Ophangrubber boven ${sideName(s)}`, merge([G.cyl('y', 0.011, 0.011, 0.018, 12), xf(G.cyl('y', 0.005, 0.005, 0.03, 8), [0, 0.012, 0])]), MAT.rubber, { d: 'Rubber ophangpen waarmee de radiateur bovenin in de frontmodule rust.', p: [s * 0.2, 0.67, RZ], ex: [0, 0.14, 0] })),
    ...[1, -1].map(s => P(`Steunblok onder ${sideName(s)}`, G.rbox(0.04, 0.02, 0.04, 0.005), MAT.rubber, { d: 'Rubber steunblok onder de radiateur in de frontmodule.', p: [s * 0.2, 0.29, RZ], ex: [0, -0.14, 0] })),
  ]);
  // ---------- condensor met droger ----------
  // Condensorblok klapt recht naar voren uit: de automatische richting liet het blok schuin door de radiateur en de vloeistofleiding gaan.
  // De droger staat sinds golf 5j aan de rechterkant: de vloeistofleiding loopt van daar langs de rechter binnenwang over het
  // stuuroliereservoir naar het schutbord (foto van de gebruiker); links staan nu accu en accukap.
  const condensor = A('Condensor', { d: 'Condensor van de airconditioning, vlak vóór de radiateur, met de droger-filtereenheid (receiver-drier) tegen de rechterkant van het blok (plaats schematisch).', ex: [0, 0, 0.16] }, [
    P('Condensorblok', cache('sysCondCore', () => merge([G.box(0.58, 0.34, 0.014), ...[-0.12, -0.06, 0, 0.06, 0.12].map(y => xf(G.box(0.58, 0.004, 0.017), [0, y, 0]))])), MAT.darkSteel, { d: 'Aluminium parallelstroomblok waar het koudemiddel zijn warmte aan de lucht afgeeft.', p: [0, RY, 2.015], ex: [0, 0, 0.1] }),
    P('Droger', G.cyl('y', 0.021, 0.021, 0.2, 16), MAT.alu, { d: 'Droger-filtereenheid met vochtopname voor het koudemiddel.', p: [-0.26, RY, 2.045], ex: [-0.12, 0, 0.1] }),
    P('Dop droger', G.cyl('y', 0.024, 0.024, 0.02, 12), MAT.plastic, { d: 'Dop op de droger; verwisselbaar bij vervanging van het filter.', p: [-0.26, RY + 0.11, 2.045], ex: [0, 0.14, 0] }),
    P('Leidingblok', G.rbox(0.05, 0.04, 0.03, 0.006), MAT.steel, { d: 'Aansluitblok voor de persleiding (hogedrukzijde) van de airconditioning, naast de rechterrand van het condensorblok. Alleen de persleiding sluit hier aan: de vloeistofleiding begint bij de droger en de zuigleiding loopt van het expansieventiel naar de compressor (plaats schematisch).', p: [-0.315, RY - 0.01, 2.034], ex: [-0.1, 0, 0.1] }),
    ...[1, -1].map(s => P(`Condensorclip ${sideName(s)}`, G.box(0.03, 0.016, 0.02), MAT.plastic, { d: 'Kunststof clip die de condensor aan de frontmodule bevestigt.', p: [s * 0.26, 0.655, 2.025], ex: [s * 0.04, 0.1, 0.04] })),
  ]);
  // ---------- intercooler ----------
  const ICY = 0.31, ICZ = 2.15;
  const intercooler = A('Intercooler', { d: 'Lucht-luchtkoeler achter de onderste luchtinlaat: koelt de door de turbo samengeperste lucht voordat die naar het gasklephuis gaat. De warme lucht komt links binnen, de gekoelde lucht verlaat hem rechts. De stompmaten van 57 mm (inlaat) en 47 mm (uitlaat) zijn aannemelijk, niet bevestigd.', ex: [0, -0.04, 0.36] }, [
    P('Intercoolerkern', cache('sysIcCore', () => merge([G.box(0.54, 0.11, 0.09), ...[-0.03, 0, 0.03].map(y => xf(G.box(0.54, 0.003, 0.094), [0, y, 0]))])), MAT.alu, { d: 'Aluminium kern met plaatvormige luchtkanalen en koelribben.', p: [0, ICY, ICZ] }),
    P('Eindkap links', G.rbox(0.06, 0.12, 0.096, 0.012), MAT.aluCast, { d: 'Gegoten eindkap aan de inlaatzijde (links), met de aansluiting voor de hete laadluchtslang.', p: [0.30, ICY, ICZ], ex: [0.12, 0, 0] }),
    P('Eindkap rechts', G.rbox(0.06, 0.12, 0.096, 0.012), MAT.aluCast, { d: 'Gegoten eindkap aan de uitlaatzijde (rechts), met de aansluiting voor de gekoelde laadluchtslang.', p: [-0.30, ICY, ICZ], ex: [-0.12, 0, 0] }),
    P('Inlaatstomp intercooler', G.cyl('z', 0.0285, 0.0285, 0.05, 18), MAT.aluCast, { d: 'Inlaatstomp voor de hete laadluchtslang van de turbo (57 mm, aannemelijk).', p: [0.30, ICY, ICZ - 0.07], ex: [0.06, 0, -0.1] }),
    P('Uitlaatstomp intercooler', G.cyl('z', 0.0235, 0.0235, 0.05, 18), MAT.aluCast, { d: 'Uitlaatstomp voor de koude laadluchtslang naar het gasklephuis (47 mm, aannemelijk).', p: [-0.30, ICY, ICZ - 0.07], ex: [-0.06, 0, -0.1] }),
    ...[1, -1].map(s => P(`Steunbeugel ${sideName(s)}`, merge([G.box(0.03, 0.02, 0.12), xf(G.box(0.03, 0.06, 0.012), [0, 0.03, 0.054])]), MAT.darkSteel, { d: 'Steunbeugel dat de intercooler aan de bumperbalk en de frontmodule vasthoudt.', p: [s * 0.2, ICY - 0.07, ICZ + 0.0], ex: [s * 0.06, -0.12, 0] })),
  ]);
  // ---------- koelventilatormodule ----------
  const FZ = 1.955;
  const shroud = cache('sysShroud', () => merge([xf(G.box(0.6, 0.026, 0.035), [0, 0.18, 0]), xf(G.box(0.6, 0.026, 0.035), [0, -0.18, 0]), xf(G.box(0.026, 0.36, 0.035), [0.3, 0, 0]), xf(G.box(0.026, 0.36, 0.035), [-0.3, 0, 0]), G.torus('z', 0.18, 0.012, 40, 6)]));
  const spokes = cache('sysFanSpokes', () => merge([0, 1, 2, 3].map(k => xf(G.box(0.012, 0.13, 0.014), [0.1 * Math.cos(k * HALF + 0.4), 0.1 * Math.sin(k * HALF + 0.4), -0.012], [0, 0, k * HALF + 0.4 - HALF]))));
  const ventilator = A('Koelventilatormodule', { d: 'Elektrische koelventilator in een kunststof kap achter de radiateur; trekt lucht door het hele koelpakket, vooral stilstaand en bij lage snelheid. Het aantal ventilatoren is niet gevonden; regelweerstand en stekker zijn schematisch weergegeven (opbouw zoals gebruikelijk bij een ventilatormodule).', ex: [0, 0, -0.36] }, [
    P('Ventilatorkap', shroud, MAT.plastic, { d: 'Kap die de luchtstroom door het hele koelblok leidt.', p: [0, RY, FZ] }),
    P('Ventilatorwaaier', merge([blades(7, 0.045, 0.165, 0.03, 0.003, 0.55, 'z'), G.cyl('z', 0.045, 0.045, 0.035, 20)]), MAT.plastic, { d: 'Zevenbladige waaier van kunststof.', p: [0, RY, FZ + 0.004], ex: [0, 0, 0.14] }),
    P('Ventilatormotor', G.cyl('z', 0.04, 0.04, 0.06, 20), MAT.darkSteel, { d: 'Elektromotor in het midden van de kap, drijft de waaier rechtstreeks aan.', p: [0, RY, FZ - 0.034], ex: [0, 0, -0.14] }),
    P('Motorsteunen', spokes, MAT.plastic, { d: 'Vier spaken die de ventilatormotor in de kap dragen.', p: [0, RY, FZ - 0.01], ex: [0, 0, -0.07] }),
    P('Regelweerstand', merge([G.box(0.05, 0.03, 0.03), ...[0, 1, 2].map(k => xf(G.box(0.05, 0.004, 0.036), [0, -0.012 + k * 0.012, 0]))]), MAT.darkSteel, { d: 'Weerstand die de ventilator op een lager toerental laat draaien.', p: [-0.2, RY - 0.17, FZ - 0.03], ex: [-0.06, -0.1, -0.06] }),
    P('Ventilatorstekker', G.rbox(0.03, 0.022, 0.02, 0.004), MAT.plastic, { d: 'Stekker met de voeding en de aansturing van de ventilatormotor.', p: [0.14, RY - 0.17, FZ - 0.05], ex: [0.04, -0.1, -0.1] }),
  ]);
  // ---------- radiateurafdekplaat ----------
  // Zwarte kunststof plaat over radiateur, condensor en ventilator tussen de koplampen (foto van een Laguna III 2.0T, golf 5j). Het vlakke
  // deel ligt op de bovenbalk van de frontmodule (y 0,75); omdat de motorkap van het model vooraan sterk afloopt, loopt de voorrand als een
  // schort van 29 graden naar het motorkapslot (in de echte auto is de plaat vlakker). In de schort zit de sleuf voor de slotbeugel met een
  // venster voor de veiligheidshaak van de kap; links van de sleuf (rechts op de foto, die van voren is genomen) een rond gat.
  std('sysPlaat', 0x1c1e21, 0, 0.78);
  std('sysSchuim', 0x2a2b2d, 0, 1);
  const PLY = 0.753, PLT = 0.004, PLZ0 = 1.915, PLZ1 = 2.10, PLS = 0.552;     // hart en dikte vlak deel, achterrand, begin schort, helling schort (y per z)
  const PLA = Math.atan(PLS), PLC = Math.cos(PLA), plS = z => (z - PLZ1) / PLC;  // hoek van de schort, afstand langs de schort
  const plTop = z => z <= PLZ1 ? PLY + PLT / 2 : PLY + PLT / 2 - (z - PLZ1) * PLS;   // bovenkant van de plaat op z
  const schort = g => { g.rotateX(PLA); g.translate(0, PLY, PLZ1); return g; };      // van het vlak (x, afstand langs de schort) naar het autoframe
  // de voorhoeken volgen schuin de rib van het binnenframe van de motorkap (gemeten: minstens 3 mm eronder)
  const vlakR = [[0.565, PLZ0], [0.58, 1.955], [0.578, 2.015], [0.545, 2.045], [0.47, 2.06], [0.41, 2.075], [0.37, 2.088], [0.37, PLZ1 + 0.001]];
  const vlak = shapeOf([[-0.565, PLZ0], ...vlakR, ...vlakR.slice(1).reverse().map(([x, z]) => [-x, z])]);
  vlak.holes.push(circlePath(0.21, 2.0, 0.016));
  const schortR = [[0.37, -0.002], [0.365, plS(2.14)], [0.35, plS(2.17)], [0.325, plS(2.185)], [0.285, plS(2.205)], [0.09, plS(2.205)], [0.09, plS(2.222)]];
  const schortVorm = shapeOf([[-0.37, -0.002], ...schortR, ...schortR.slice(1).reverse().map(([x, z]) => [-x, z])]);
  const sl = [plS(2.180), plS(2.214), plS(2.150), plS(2.205)];
  const sleuf = new THREE.Path(); [[-0.032, sl[0]], [0.032, sl[0]], [0.032, sl[2]], [0.078, sl[2]], [0.078, sl[3]], [0.032, sl[3]], [0.032, sl[1]], [-0.032, sl[1]]].forEach((q, i) => i ? sleuf.lineTo(...q) : sleuf.moveTo(...q)); sleuf.closePath();
  schortVorm.holes.push(sleuf);
  const plaatGeo = cache('sysPlaat', () => merge([xf(plan(vlak, PLT), [0, PLY, 0]), schort(plan(schortVorm, PLT)), xf(G.box(1.11, 0.022, 0.004), [0, PLY + PLT / 2 + 0.011, PLZ0 + 0.002])]));
  const plaat = A('Radiateurafdekplaat', { d: 'Zwarte kunststof afdekplaat over radiateur, condensor en koelventilator, over bijna de volle breedte tussen de koplampen. Hij ligt op de bovenbalk van de frontmodule, onder de motorkap, met een opstaande rand aan de motorzijde, een sleuf voor de slotbeugel van de motorkap (het motorkapslot zit eronder), een rond gat, twee pennen, schroeven in de voorhoeken en een schuimstrook langs de voorrand. Links sluit hij aan op de accukap, rechts op het stuuroliereservoir en de vulhals van de sproeiertank (naar foto; maten geschat, de schort aan de voorkant is in het model steiler dan in de auto).', ex: [0, 0.42, 0.04] }, [
    P('Afdekplaat', plaatGeo, MAT.sysPlaat, { d: 'De plaat zelf: vlak deel op de frontmodule en een schort naar het motorkapslot, met sleuf, rond gat en een opstaande rand aan de motorzijde.', ex: [0, 0, 0] }),
    ...[1, -1].map(s => P(`Schuimstrook ${sideName(s)}`, schort(xf(G.box(0.18, 0.004, 0.01), [s * 0.18, PLT / 2 + 0.002, plS(2.205) - 0.007])), MAT.sysSchuim, { d: 'Schuimstrook langs de voorrand die de spleet naar de motorkap afdicht.', ex: [s * 0.02, 0.05, 0.03] })),
    ...[1, -1].map(s => P(`Pen ${sideName(s)}`, merge([G.cyl('y', 0.006, 0.006, 0.01, 10), xf(G.cyl('y', 0.009, 0.009, 0.003, 12), [0, -0.0035, 0])]), MAT.sysPlaat, { d: 'Kunststof pen (popnagel) die de plaat aan de achterrand vastzet.', p: [s * 0.12, PLY + PLT / 2 + 0.005, 1.955], ex: [0, 0.08, 0] })),
    ...[1, -1].map(s => P(`Schroef voorhoek ${sideName(s)}`, merge([G.cyl('y', 0.009, 0.009, 0.003, 12), xf(G.box(0.012, 0.0012, 0.002), [0, 0.0015, 0])]), MAT.darkSteel, { d: 'Schroef in de voorhoek die de plaat op de bovenbalk van de frontmodule vastzet.', p: [s * 0.40, PLY + PLT / 2 + 0.0015, 2.05], ex: [s * 0.02, 0.1, 0] })),
    ...[1, -1].map(s => P(`Aanslagrubber ${sideName(s)}`, merge([G.cyl('y', 0.011, 0.013, 0.022, 12), xf(G.cyl('y', 0.006, 0.006, 0.006, 8), [0, 0.014, 0])]), MAT.rubber, { d: 'Rubber aanslag in de achterhoek waarop de motorkap rust.', p: [s * 0.52, PLY + PLT / 2 + 0.011, 1.935], ex: [0, 0.1, 0] })),
  ]);
  // ---------- expansievat ----------
  // Vóór de rechter veerpoottoren, achter en boven het stuuroliereservoir (foto van de gebruiker, golf 5j; was achter de veerpoottoren bij het
  // schutbord). Het vat zit op de wielkastboog (de onderkant volgt de boog op 12 mm) en de bovenkant loopt mee met de motorkap. Het vat staat
  // aan de wielkastzijde van het motorsteunblok en de dynamo (x -0,525), binnen de lage zijrand van de kap, vóór de veerpoottoren (die eindigt op z 1,46) en achter het stuuroliereservoir.
  std('sysStreep', 0xf4f4f0, 0, 0.6);
  const archY = z => AY + Math.sqrt(Math.max(0, (ARCH + 0.03) ** 2 - (z - AXF) ** 2));   // bovenkant van de wielkastboog (body.js)
  const EX0 = -0.735, EX1 = -0.530, EZ0 = 1.495, EZ1 = 1.725, ET = [0.795, 0.83, 0.775, 0.815];   // kader en bovenkant in de hoeken (x0z0, x1z0, x0z1, x1z1)
  const evTop = (x, z) => { const u = (x - EX0) / (EX1 - EX0), w = (z - EZ0) / (EZ1 - EZ0); return (1 - u) * (1 - w) * ET[0] + u * (1 - w) * ET[1] + (1 - u) * w * ET[2] + u * w * ET[3]; };
  // blok tussen twee hoogtefuncties (gesloten, onderverdeeld zodat de onderkant de boog volgt)
  const tussen = (x0, x1, z0, z1, lo, hi, n = [8, 4, 10]) => { const g = new THREE.BoxGeometry(1, 1, 1, ...n), a = g.attributes.position;
    for (let i = 0; i < a.count; i++) { const X = lerp(x0, x1, a.getX(i) + 0.5), Z = lerp(z0, z1, a.getZ(i) + 0.5); a.setXYZ(i, X, lerp(lo(X, Z), hi(X, Z), a.getY(i) + 0.5), Z); }
    g.computeVertexNormals(); return g; };
  // de motorkapsteun (body: van (-0,745; 0,769; 1,33) naar (-0,705; 0,684; 1,822), straal 8 mm) ligt in rust over de buitenkant: daar is het vat
  // een lage strook onder de steun door (vanaf z 1,575, daarachter ligt de steun te dicht op de wielkast), het hoge deel begint bij x -0,70
  const EXS = -0.70, rodY = z => 0.7686 - 0.0846 * (z - 1.33) / 0.492;
  const DX = -0.565, DZ = 1.53, DY = evTop(DX, DZ);       // vulhals: binnen en achter, waar de motorkap het hoogst is
  const NT = DY + 0.01;                                   // bovenrand van de hals
  const EVN = [-0.54, 0.785], EVA = [-0.575, 0.578];      // nippel ontluchting en aanvoerstomp aan de voorkant (x, y)
  const expansie = A('Expansievat', { d: 'Doorzichtig wit kunststof expansievat met MAXI- en MINI-streep vóór de rechter veerpoottoren, tegen de rechter binnenwang, achter en boven het stuuroliereservoir (foto van de gebruiker); vangt de uitzetting van de koelvloeistof op en houdt het systeem onder druk. Ongeveer 20 cm breed (bovenin 17 cm, aan de buitenkant een lage strook onder de motorkapsteun door), 23 cm diep en aan de voorkant 23 cm hoog: in het model past het niet groter tussen veerpoottoren, reservoir, motorsteun, kapsteun en motorkap. De openingsdruk van de dop van ongeveer 1,4 bar is aannemelijk, niet bevestigd.', ex: [-0.2, 0.2, 0.02] }, [
    P('Vat', cache('sysEvVat', () => merge([tussen(EXS, EX1, EZ0, EZ1, (x, z) => archY(z) + 0.012, evTop), tussen(EX0, EXS, 1.575, EZ1, (x, z) => archY(z) + 0.012, (x, z) => rodY(z) - 0.014, [2, 4, 8]), xf(G.cyl('y', 0.021, 0.021, 0.03, 16), [DX, NT - 0.015, DZ]), xf(G.cyl('z', 0.0055, 0.0055, 0.026, 10), [EVN[0], EVN[1], EZ1 + 0.005]), xf(G.cyl('z', 0.007, 0.007, 0.026, 10), [EVA[0], EVA[1], EZ1 + 0.005])])), MAT.tank, { d: 'Doorzichtig vat met de vulhals, een nippel voor de ontluchtingsslang en een stomp voor de aanvoerslang aan de voorkant; de onderkant volgt de wielkastboog.' }),
    P('Niveaustrepen', merge([xf(G.box(0.002, 0.004, 0.06), [EX1 + 0.0008, 0.775, 1.64]), xf(G.box(0.002, 0.004, 0.06), [EX1 + 0.0008, 0.705, 1.64])]), MAT.sysStreep, { d: 'Lichte MAXI- en MINI-streep aan de motorzijde van het vat (koud peilen, tussen de strepen).', ex: [0.05, 0, 0] }),
    // maten naar de catalogus (golf 5c-2, K10): dop Ø52 (7700805031: 50 tot 53 mm), opening Ø33 (binnen 27 tot 35 mm), hals Ø42. De dop zwenkt in
    // het model om een lip aan de buitenkant vlak opzij naar voren (onder de kap is te weinig ruimte om te kantelen; zo blijft hij ook uit de buurt
    // van motorsteun en sproeierkoppeling)
    P('Vulopening expansievat', G.cyl('y', 0.0165, 0.0165, 0.002, 20), MAT.blackGloss, { d: 'Open vulhals van het expansievat: een donkere opening in de opstaande hals; de drukdop sluit hem af.', p: [DX, NT + 0.0005, DZ], ex: [0, 0.03, 0] }),
    P('Expansiedop', merge([G.cyl('y', 0.026, 0.026, 0.016, 16), xf(G.box(0.014, 0.01, 0.054), [0, 0.011, 0]), xf(G.box(0.016, 0.006, 0.016), [-0.034, -0.005, 0]), xf(G.cyl('z', 0.0045, 0.0045, 0.02, 8), [-0.0405, -0.0045, 0])]), MAT.plastic, { d: 'Drukdop met overdrukklep die bij ongeveer 1,4 bar opent (aannemelijk); zwenkt in dit model om een lip aan de buitenkant van de hals vlak opzij naar voren en blijft eraan vast (opener, schematisch: in werkelijkheid draai je de dop los; onder de dichte motorkap is maar 1,5 cm ruimte, dus kantelen kan hier niet).', p: [DX, NT + 0.0098, DZ], ex: [0, 0.14, 0], open: hinge([DX - 0.0405, NT + 0.0053, DZ], [0, 1, 0], -1.8, { min: 1.44, needs: 'Motorkap', label: 'Dop expansievat', look: { dir: [-0.5, 0.85, 0.6], nodes: ['Expansiedop', 'Koeling en luchtinlaat/Expansievat/Vat'] } }) }),
    P('Niveauschakelaar', G.rbox(0.026, 0.03, 0.026, 0.005), MAT.plastic, { d: 'Schakelaar die het dashboard waarschuwt bij een te laag koelvloeistofpeil.', p: [EX1 + 0.011, 0.70, 1.60], ex: [0.1, 0, 0] }),
    P('Vathouder', cache('sysEvHouder', () => tussen(EX0 + 0.02, EX1 - 0.02, EZ0 + 0.02, EZ1 - 0.03, (x, z) => archY(z) + 0.0035, (x, z) => archY(z) + 0.0105, [4, 1, 6])), MAT.darkSteel, { d: 'Steunplaat op de wielkastboog waarop het expansievat rust en vastgeschroefd is.', ex: [0, -0.12, 0] }),
  ]);
  // ---------- koelslangen ----------
  const tOut = ENG_PORTS.thermostatOut, pIn = ENG_PORTS.waterPumpIn;
  const hoseTop = sysHose('Bovenste radiateurslang', 'Voert de warme koelvloeistof van het waterstuk bij de thermostaat naar de linker waterkast van de radiateur.', [sysP(tOut.p), sysE(tOut, 0.04), [0.15, 0.80, 1.6], [0.27, 0.792, 1.79], [0.30, 0.73, 1.885], [0.30, 0.64, 1.918], [0.30, 0.62, 1.935]], 0.02, { n0: 'Klem waterstuk', n1: 'Klem radiateur', seg: 40, rad: 10, ex: [0.1, 0.16, 0.08] });
  const hoseBot = sysHose('Onderste radiateurslang', 'Brengt de afgekoelde vloeistof van de rechter waterkast terug naar de aanvoerstomp van de waterpomp.', [sysP(pIn.p), sysE(pIn, 0.03), [-0.29, 0.42, 1.78], [-0.30, 0.37, 1.88], [-0.30, 0.34, 1.935]], 0.02, { n0: 'Klem waterpomp', n1: 'Klem radiateur', seg: 28, rad: 10, ex: [-0.04, -0.14, 0.1] });
  // verwarmingsslangen en ontluchting lopen achter de motor langs naar het schutbord (schematisch, aansluiting op het waterstuk)
  const wA = sysP([tOut.p[0] - 0.012, tOut.p[1] - 0.012, tOut.p[2] - 0.02]), wB = sysP([tOut.p[0] - 0.028, tOut.p[1] - 0.012, tOut.p[2] - 0.034]);
  const hoseHeatA = sysHose('Verwarmingsslang aanvoer', 'Voert warme koelvloeistof naar de verwarmingsradiateur achter het schutbord.', [wA, [0.16, 0.755, 1.36], [0.14, 0.745, 1.24], [0.02, 0.74, 1.215], [-0.04, 0.74, 1.15], [-0.07, 0.74, 1.05]], 0.0095, { n0: 'Klem waterstuk', n1: 'Klem schutbord', seg: 40, rad: 8, ex: [0, 0.12, -0.1] });
  const hoseHeatR = sysHose('Verwarmingsslang retour', 'Brengt de afgekoelde vloeistof van de verwarmingsradiateur terug naar het koelcircuit.', [wB, [0.115, 0.755, 1.36], [0.095, 0.745, 1.285], [0.003, 0.74, 1.257], [-0.079, 0.74, 1.166], [-0.12, 0.74, 1.05]], 0.0095, { n0: 'Klem waterstuk', n1: 'Klem schutbord', seg: 40, rad: 8, ex: [0, 0.16, -0.1] });
  const heater = A('Verwarmingsslangen', { d: 'Twee slangen tussen het koelcircuit en de verwarmingsradiateur achter het schutbord, met de aansluitstompen door het schutbord.', ex: [0, 0.1, -0.1] }, [
    hoseHeatA, hoseHeatR,
    P('Aansluitstomp aanvoer', G.cyl('z', 0.0085, 0.0085, 0.04, 10), MAT.alu, { d: 'Stomp van de verwarmingsradiateur die door het schutbord steekt (aanvoer).', p: [-0.07, 0.74, 1.04], ex: [0, 0, 0.1] }),
    P('Aansluitstomp retour', G.cyl('z', 0.0085, 0.0085, 0.04, 10), MAT.alu, { d: 'Stomp van de verwarmingsradiateur die door het schutbord steekt (retour).', p: [-0.12, 0.74, 1.04], ex: [0, 0, 0.1] }),
  ]);
  // ontluchting: van het waterstuk vóór de motorafdekkap langs naar de nippel aan de motorzijde van het expansievat (rechtsvoor)
  const evVent = [EVN[0], EVN[1], EZ1 + 0.018], evOut = [EVA[0], EVA[1], EZ1 + 0.018];   // uiteinden nippel ontluchting en aanvoerstomp
  const hoseVent = sysHose('Ontluchtingsslang', 'Dunne slang van het waterstuk naar het expansievat: vóór de motorafdekkap langs naar de motorzijde van het vat; voert damp en lucht uit het koelcircuit af.', [sysP([tOut.p[0] - 0.02, tOut.p[1] - 0.012, tOut.p[2] - 0.045]), ...SYS_RT.vent, evVent], 0.0075, { n0: 'Klem waterstuk', n1: 'Klem expansievat', seg: 64, rad: 6, ex: [0, 0.2, 0] });
  // aanvoer: van de stomp onder aan de voorkant van het vat naar een T-stuk in de onderste radiateurslang (statische aanvoer naar de waterpomp)
  const tT = [-0.34, 0.37, 1.88], tDir = V3(-0.01, -0.08, 0.155);   // einde van de zijstomp van het T-stuk; de onderslang loopt door (-0,30; 0,37; 1,88)
  const hoseFeed = A('Aanvoerslang expansievat', { d: 'Slang van de onderkant van het expansievat naar een T-stuk in de onderste radiateurslang: vult het koelcircuit aan de zuigzijde van de waterpomp aan (verloop schematisch).', ex: [-0.04, -0.1, 0.08] }, [
    sysHose('Aanvoerslang', 'Rubber slang van het expansievat naar het T-stuk.', [evOut, ...SYS_RT.aanvoer, [tT[0] + 0.006, tT[1], tT[2]]], 0.008, { n0: 'Klem expansievat', n1: 'Klem T-stuk', seg: 40, rad: 6, ex: [-0.03, -0.06, 0.04] }),
    P('T-stuk onderste radiateurslang', merge([G.cyl('z', 0.0215, 0.0215, 0.05, 14), xf(G.cyl('x', 0.0065, 0.0065, 0.04, 10), [-0.02, 0, 0])]), MAT.plastic, { d: 'Kunststof T-stuk in de onderste radiateurslang met een zijstomp voor de aanvoerslang.', p: [tT[0] + 0.04, tT[1], tT[2]], q: quatFromTo(V3(0, 0, 1), tDir), ex: [0, -0.06, 0.06] }),
  ]);
  const slangen = A('Koelslangen', { d: 'De slangen van het koelcircuit: boven- en onderslang naar de radiateur, de verwarmingsslangen, de ontluchtingsslang naar het expansievat en de aanvoerslang van het vat naar de onderste radiateurslang. Elke slang zit met klemmen op zijn aansluiting.', ex: [0, 0.16, 0.1] }, [hoseTop, hoseBot, heater, hoseVent, hoseFeed]);
  // ---------- luchtinlaat ----------
  // Golf 5j: het luchtfilterhuis staat linksachter, direct achter de accukap en vóór de hoofdremcilinder, boven de versnellingsbak (foto van
  // de gebruiker; de accu staat nu linksvoor). Onderbak x 0,175 tot 0,465, z 1,37 tot 1,59; het deksel reikt tot y 0,815, de vacuümslang
  // loopt erboven. De luchtgeleider komt van de grille binnen langs de accu (onder de accukap) naar de voorkant; de geribbelde aanzuigslang
  // verlaat het deksel aan de achterkant op de hoogte van het deksel (golf 5j ronde 2, foto: hoog en zichtbaar), loopt naar achteren
  // en duikt tussen de remleidingen en het schutbord omlaag naar de turbo. De lucht komt onder het element binnen en verlaat het huis erboven.
  const AB = [0.32, 0.6775, 1.48], ABW = 0.29, ABD = 0.22;
  const dIn = [0.38, 0.665, AB[2] + ABD / 2 + 0.022], dOut = [0.25, 0.775, AB[2] - ABD / 2 - 0.024];   // uiteinden inlaat- en uitlaatstomp
  const cIn = ENG_PORTS.compIn;
  // geribbelde slang: gladde kern met ringen om de 22 mm (buitenstraal r)
  const ribbed = (pts, r, key) => cache(key, () => { const c = new THREE.CatmullRomCurve3(pts.map(q => V3(...q)), false, 'centripetal'), n = Math.floor(c.getLength() / 0.022), rings = [];
    for (let k = 1; k < n; k++) { const t = k / n, q = c.getPointAt(t), g = G.torus('z', r - 0.004, 0.004, 12, 4).clone(); g.applyQuaternion(quatFromTo(V3(0, 0, 1), c.getTangentAt(t))); g.translate(q.x, q.y, q.z); rings.push(g); }
    return merge([tube(pts, r - 0.004, 48, 10), ...rings]); });
  const airPts = [dOut, ...SYS_RT.air, sysE(cIn, 0.03), sysP(cIn.p)];
  const ta0 = sysDir(airPts[0], airPts[1]), ta1 = sysDir(airPts[airPts.length - 1], airPts[airPts.length - 2]);
  const hoseAir = A('Aanzuigslang turbo', { d: 'Geribbelde zwarte aanzuigslang (Ø8 cm) van het deksel van het luchtfilterhuis naar de compressorinlaat van de turbo: hoog achter het luchtfilterhuis langs, zichtbaar tussen het luchtfilterhuis en de rembekrachtiger, en dan tussen de remleidingen en het schutbord omlaag naar de turbo (verloop schematisch; de turbo-inlaat zit laag achter de motor).', ex: [0.08, 0.1, -0.12] }, [
    P('Slang', ribbed(airPts, 0.04, 'sysAirRib'), MAT.sysHose, { d: 'Geribbelde rubber slang; volgt de route tussen luchtfilterhuis en turbo.', ex: [0, 0.08, 0] }),
    sysClamp('Klem luchtfilterhuis', sysAt(airPts[0], ta0, -0.012), ta0, 0.04, ta0.clone().negate()),
    sysClamp('Klem turbo', sysAt(airPts[airPts.length - 1], ta1, 0.016), ta1, 0.036, ta1.clone().negate()),
  ]);
  const ductPts = [[0.27, 0.62, 2.235], ...SYS_RT.duct, dIn];
  const inlaat = A('Luchtinlaat', { d: 'Aanzuigtraject: luchtgeleider van de grille naar het luchtfilterhuis linksachter, luchtfilterhuis met papieren element en de geribbelde aanzuigslang naar de turbocompressor. De motor meet de belasting met een druksensor (MAP) op het inlaatspruitstuk; een luchtmassameter komt in de onderdelenlijsten voor deze motor niet voor (aannemelijk).', ex: [0.2, 0.3, -0.05] }, [
    P('Luchtgeleider', merge([tube(ductPts, 0.025, 48, 12), xf(G.cyl('z', 0.034, 0.025, 0.03, 14), [0.27, 0.62, 2.24])]), MAT.plastic, { d: 'Kunststof kanaal dat koele buitenlucht achter de grille opvangt en langs de binnenkant van de accu, onder de accukap, naar de voorkant van het luchtfilterhuis leidt.', ex: [0, 0.08, 0.2] }),
    P('Luchtfilterhuis', merge([G.rbox(ABW, 0.105, ABD, 0.015), xf(G.box(ABW + 0.012, 0.008, ABD + 0.008), [0, 0.0485, 0]), xf(G.cyl('z', 0.028, 0.028, 0.024, 16), [dIn[0] - AB[0], dIn[1] - AB[1], ABD / 2 + 0.01])]), MAT.plastic, { d: 'Zwarte kunststof onderbak van het luchtfilter met de rand voor het deksel en de inlaatstomp voor de luchtgeleider aan de voorkant (de lucht komt onder het element binnen).', p: AB, ex: [0, -0.1, 0] }),
    P('Luchtfilterelement', cache('sysAirEl3', () => merge([G.rbox(ABW - 0.02, 0.03, ABD - 0.02, 0.006), ...[-0.1, -0.05, 0, 0.05, 0.1].map(x => xf(G.box(0.006, 0.014, ABD - 0.03), [x, 0.02, 0]))])), MAT.filter, { d: 'Geplisseerd papieren filterelement.', p: [AB[0], AB[1] + 0.06, AB[2]], ex: [0, 0.09, 0] }),
    P('Luchtfilterdeksel', merge([G.rbox(ABW, 0.085, ABD, 0.015), xf(G.cyl('z', 0.04, 0.04, 0.028, 18), [dOut[0] - AB[0], dOut[1] - 0.7725, -ABD / 2 - 0.01])]), MAT.plastic, { d: 'Zwart deksel van het luchtfilterhuis (schone zijde) met de uitlaatstomp voor de aanzuigslang aan de achterkant, vastgezet met vier clips.', p: [AB[0], 0.7725, AB[2]], ex: [0, 0.22, 0] }),
    ...[[AB[0] + ABW / 2 + 0.008, 1.43, 1], [AB[0] + ABW / 2 + 0.008, 1.575, 1], [0.22, AB[2] + ABD / 2 + 0.006, 0], [0.30, AB[2] + ABD / 2 + 0.006, 0]].map(([x, z, zij], i) => P(`Sluitclip ${i + 1}`, zij ? G.box(0.016, 0.06, 0.012) : G.box(0.012, 0.06, 0.016), MAT.steel, { d: 'Veerclip die het deksel op de onderbak klemt.', p: [x, 0.73, z], ex: zij ? [0.1, 0.12, 0] : [0, 0.12, 0.1] })),
    P('Inlaattemperatuursensor', merge([G.cyl('y', 0.007, 0.007, 0.02, 8), xf(G.rbox(0.02, 0.014, 0.02, 0.004), [0, 0.014, 0])]), MAT.plastic, { d: 'Meet de temperatuur van de aangezogen lucht.', p: [0.31, 0.825, 1.42], ex: [0, 0.1, 0] }),
    P('Rubber ophangpen luchtfilterhuis', G.cyl('y', 0.01, 0.01, 0.03, 10), MAT.rubber, { d: 'Rubber pen waarmee de onderbak op de steun boven de versnellingsbak rust.', p: [0.30, 0.61, 1.42], ex: [0, -0.1, 0] }),
    hoseAir,
    P('Resonator', merge([G.cyl('x', 0.028, 0.028, 0.07, 16), xf(G.cyl('y', 0.012, 0.012, 0.03, 10), [0, 0.03, 0])]), MAT.plastic, { d: 'Kunststof resonator onder het luchtfilterhuis, met een hals op de onderbak; dempt het aanzuiggeluid van de turbo (plaats en uitvoering schematisch).', p: [0.215, 0.588, 1.47], ex: [0, -0.1, 0] }),
  ]);
  // ---------- laadluchtleidingen ----------
  const cO = ENG_PORTS.compOut, tI = ENG_PORTS.throttleIn;
  const hot = sysHose('Hete laadluchtslang', 'Voert de door de turbo samengeperste, hete lucht van de compressoruitlaat naar de linker eindkap van de intercooler. Aansluiting op de intercooler 57 mm (aannemelijk).', [sysP(cO.p), sysE(cO, 0.035), [0.0, 0.64, 1.16], [0.14, 0.62, 1.2], [0.12, 0.5845, 1.30], [0.122, 0.598, 1.42], [0.122, 0.60, 1.53], [0.19, 0.6, 1.72], [0.31, 0.56, 1.86], [0.375, 0.46, 1.96], [0.35, 0.372, 2.022], [0.30, 0.31, 2.07]], 0.031, { n0: 'Klem turbo', n1: 'Klem intercooler', seg: 81, rad: 12, ex: [0.12, 0.2, 0] });
  const cold = sysHose('Koude laadluchtslang', 'Voert de gekoelde lucht van de rechter eindkap van de intercooler naar het gasklephuis. De slang buigt binnen enkele centimeters na het gasklephuis naar voren, vóór de multiriem, en loopt boven de stuurbekrachtigingspomp langs. Aansluiting op de intercooler 47 mm (aannemelijk).', [[-0.30, 0.31, 2.07], [-0.33, 0.33, 2.04], [-0.37, 0.40, 1.98], [-0.39, 0.50, 1.90], [-0.42, 0.57, 1.83], sysP([tI.p[0] - 0.03, tI.p[1] + 0.01, 0.30]), sysP([tI.p[0] - 0.029, tI.p[1], 0.245]), sysP([tI.p[0] - 0.021, tI.p[1], tI.p[2] + 0.005]), sysP(tI.p)], 0.027, { n0: 'Klem intercooler', n1: 'Klem gasklephuis', seg: 80, rad: 12, ex: [-0.12, 0.2, 0] });
  const laadlucht = A('Laadluchtleidingen', { d: 'De twee slangen die de aangezogen lucht van de turbo naar de intercooler en van de intercooler naar het gasklephuis brengen.', ex: [0, 0.22, 0.1] }, [hot, cold]);
  // ---------- airconditioningleidingen (schematisch) ----------
  // Uitklappen: de groep gaat mee met de condensor (zelfde z) en iets omlaag, zodat de pers- en vloeistofleiding bij het
  // uitklappen van Koeling en luchtinlaat aan de condensor blijven en nergens door een ander deel lopen (gemeten in drie standen).
  // Route uit een A*-zoektocht door de vrije ruimte (8 mm-rooster, daarna met de hand gladgetrokken en gemeten met clash.py):
  // persleiding van de dunne nippel van de compressor omhoog en naar voren, van de zijkant in het Leidingblok; zuigleiding van het
  // expansieventiel langs de rechterflank van de motor naar de dikke nippel. De uiteinden liggen 0,1 mm voor het aansluitvlak.
  // Golf 5j: de vloeistofleiding begint bij de droger aan de rechterkant van de condensor, loopt rechts langs de radiateur omhoog, onder
  // de radiateurafdekplaat naar achteren en zichtbaar over het stuuroliereservoir (rubber tussenstuk met geribbelde persmoffen, zoals op
  // de foto: in bovenaanzicht minder dan 1 cm van de as, 7 mm boven de dop), dan langs de bovenrand aan de motorzijde van het expansievat en
  // binnen langs de rechter veerpoottoren naar het expansieventiel (SYS_RT.vloei; A* in drie benen zodat de punten boven de dop vast liggen).
  const cDis = ENG_PORTS.acDis, cSuc = ENG_PORTS.acSuc;
  const TXV = [0.025, 0.52, 1.0525], txvF = TXV[2] + 0.025 + 0.0001;   // expansieventiel tegen het schutbord (voorkant schutbord z 1,026); voorvlak
  const pers = [sysE(cDis, 0.0001), sysE(cDis, 0.008), sysE(cDis, 0.02), [-0.348, 0.40, 1.8167], [-0.338, 0.466, 1.97], [-0.375, 0.47, 2.034], [-0.352, 0.47, 2.034], [-0.3401, 0.47, 2.034]];
  const zuig = [[0.016, 0.515, txvF], [0.016, 0.515, txvF + 0.008], [0.016, 0.515, txvF + 0.02], [-0.064, 0.478, 1.106], [-0.16, 0.414, 1.178], [-0.36, 0.382, 1.394], [-0.384, 0.334, 1.49], sysE(cSuc, 0.025), sysE(cSuc, 0.01), sysE(cSuc, 0.0001)];
  const vloei = [[-0.26, 0.3799, 2.045], [-0.26, 0.372, 2.045], [-0.26, 0.36, 2.045], ...SYS_RT.vloei, [0.034, 0.528, txvF + 0.02], [0.034, 0.528, txvF + 0.008], [0.034, 0.528, txvF]];
  // rubber tussenstuk: 14 cm booglengte rond het punt boven het stuuroliereservoir
  const vC = new THREE.CatmullRomCurve3(vloei.map(q => V3(...q)), false, 'centripetal'), vL = vC.getLength();
  let vT = 0, vBest = Infinity; for (let k = 0; k <= 400; k++) { const q = vC.getPointAt(k / 400), d = Math.hypot(q.x + 0.585, q.z - 1.78); if (d < vBest) { vBest = d; vT = k / 400; } }
  const vU0 = vT - 0.07 / vL, vU1 = vT + 0.07 / vL;
  const mof = u => { const q = vC.getPointAt(u), t = vC.getTangentAt(u), qq = quatFromTo(V3(0, 0, 1), t);
    return merge([G.cyl('z', 0.0085, 0.0085, 0.03, 12), ...[-0.011, -0.004, 0.003, 0.010].map(z => xf(G.torus('z', 0.0085, 0.0018, 12, 4), [0, 0, z]))].map(g => { const h = g.clone(); h.applyQuaternion(qq); h.translate(q.x, q.y, q.z); return h; })); };
  const airco = A('Airconditioningleidingen', { d: 'Leidingen van het koudemiddelcircuit van de airconditioning: de persleiding van de compressor naar de condensor, de vloeistofleiding van de droger naar het expansieventiel op het schutbord en de zuigleiding van het expansieventiel terug naar de compressor. De vloeistofleiding loopt langs de rechter binnenwang over het stuuroliereservoir, met een rubber tussenstuk (foto van de gebruiker). Route, diameters en de plaats van het expansieventiel zijn schematisch; de echte plaats is voor deze auto niet gevonden.', ex: [0.02, -0.04, 0.16] }, [
    P('Persleiding', tube(pers, 0.0055, 30, 6), MAT.alu, { d: 'Aluminium persleiding (Ø11 mm, schematisch): voert het hete gasvormige koudemiddel onder hoge druk van de compressor naar het Leidingblok van de condensor.', ex: [0, -0.03, 0.06] }),
    P('Vloeistofleiding', merge([sysTubePart(vloei, 0.0045, 140, 6, 0, vU0 + 0.004), sysTubePart(vloei, 0.0045, 140, 6, vU1 - 0.004, 1)]), MAT.alu, { d: 'Dunne aluminium vloeistofleiding (Ø9 mm, schematisch): voert het vloeibare koudemiddel van de droger rechts langs de radiateur omhoog, in de lengte recht over de dop van het stuuroliereservoir, langs de bovenrand aan de motorzijde van het expansievat en binnen langs de rechter veerpoottoren naar het expansieventiel.', ex: [-0.06, 0.04, 0.06] }),
    P('Rubberslang vloeistofleiding', sysTubePart(vloei, 0.0065, 140, 8, vU0, vU1), MAT.sysHose, { d: 'Rubber tussenstuk van de vloeistofleiding, recht over de dop van het stuuroliereservoir (7 mm vrij); vangt de trillingen tussen motor en carrosserie op.', ex: [-0.06, 0.06, 0.06] }),
    P('Koppelstuk vloeistofleiding', merge([mof(vU0 + 0.012 / vL), mof(vU1 - 0.012 / vL)]), MAT.alu, { d: 'Geribbelde persmoffen die het rubber tussenstuk op de aluminium leiding vastzetten.', ex: [-0.06, 0.08, 0.06] }),
    P('Zuigleiding', tube(zuig, 0.008, 58, 6), MAT.sysHose, { d: 'Dikke zuigleiding (Ø16 mm, schematisch): voert het koude, gasvormige koudemiddel van het expansieventiel langs de rechterkant van de motor terug naar de compressor.', ex: [-0.06, 0.02, 0] }),
    P('Expansieventiel', G.rbox(0.04, 0.04, 0.05, 0.004), MAT.alu, { d: 'Expansieventiel (blokventiel) tegen het schutbord: laat het koudemiddel uitzetten voordat het de verdamper achter het schutbord in gaat. Plaats en maat schematisch.', p: TXV, ex: [0, 0, -0.06] }),
  ]);

  return A('Koeling en luchtinlaat', { d: 'Koelpakket (intercooler, condensor, radiateur en koelventilator) met de radiateurafdekplaat, expansievat, koelslangen, de leidingen van de airconditioning en het luchtinlaattraject naar de turbo.', ex: [0, 0.3, 2.0] }, [radiateur, condensor, intercooler, ventilator, plaat, expansie, slangen, inlaat, laadlucht, airco]);
}

/* ============================ uitlaatsysteem ============================ */
function buildExhaust() {
  // ---- voorkatalysator, direct op de turbine (motorframe, daarom een groep met de motortransformatie)
  const T = ENG_PORTS.turbineOut, tx = T.p[0], ty = T.p[1], tz = T.p[2];
  const bolts = [[0.034, 0], [-0.017, 0.03], [-0.017, -0.03]];
  const flangeShape = cache('sysCatFlange', () => side(shapeOf(circlesHull([[0.034, 0, 0.012], [-0.017, 0.03, 0.012], [-0.017, -0.03, 0.012]], 0)), 0.008));
  const gasketShape = cache('sysCatGasket', () => side(shapeOf(circlesHull([[0.034, 0, 0.012], [-0.017, 0.03, 0.012], [-0.017, -0.03, 0.012]], 0)), 0.0016));
  const xE = tx - 0.0;                                         // vlak van de turbine-uitgang
  const canL = 0.12, canX0 = xE - 0.062;
  const voorkat = A('Voorkatalysator', { d: 'Driewegkatalysator direct op de turbine-uitgang (voorkat): zet CO, koolwaterstoffen en NOx om. De lambdasonde ervoor regelt het mengsel, de sonde erna controleert de katalysator. Opbouw schematisch.', p: PT_POS.toArray(), r: [PT_TILT, 0, 0], ex: [-0.1, 0.06, 0] }, [
    P('Pakking voorkat', gasketShape, MAT.heat, { d: 'Metalen pakking tussen de turbineflens en de voorkatalysator.', p: [xE - 0.0008, ty, tz], ex: [-0.02, 0, 0] }),
    P('Flens voorkat', flangeShape, MAT.steel, { d: 'Driegatsflens van de voorkatalysator, met drie moeren op de tapeinden van de turbine.', p: [xE - 0.0056, ty, tz], ex: [-0.045, 0, 0] }),
    ...bolts.map(([dz, dy], i) => P(`Moer voorkat ${i + 1}`, hexNut('x', 0.0075, 0.008), MAT.steel, { d: 'Zeskantmoer op een tapeind van de turbine; houdt de voorkatalysator vast.', p: [xE - 0.0135, ty + dy, tz + dz], ex: [-0.09, dy * 2, dz * 2] })),
    P('Inlaatconus voorkat', G.lathe('-x', [[0.026, 0], [0.034, 0.014], [0.0415, 0.034], [0.0405, 0.036]], 24, 'sysCatIn'), MAT.steel, { d: 'Conus die de turbine-uitgang verwijdt naar de katalysatorbehuizing.', p: [xE - 0.0096, ty, tz], ex: [-0.05, 0, 0] }),
    P('Katalysatorhuis', G.cyl('-x', 0.0415, 0.0415, canL, 24), MAT.steel, { d: 'Roestvrijstalen behuizing om de keramische monoliet.', p: [canX0 - canL / 2, ty, tz], ex: [-0.06, 0, 0] }),
    P('Monoliet voorkat', G.cyl('-x', 0.036, 0.036, canL - 0.01, 18), MAT.ceramic, { d: 'Keramische honingraat met edelmetaalcoating waar de uitlaatgassen overheen stromen.', p: [canX0 - canL / 2, ty, tz], ex: [-0.12, 0.05, 0], inner: true }),
    P('Steunmat voorkat', annulus(0.036, 0.0405, canL - 0.014, 'x', 24), MAT.filter, { d: 'Uitzettende mat die de monoliet beschermt tegen trillingen en hitte.', p: [canX0 - canL / 2, ty, tz], ex: [-0.12, -0.05, 0], inner: true }),
    P('Uitlaatconus voorkat', G.lathe('-x', [[0.0405, 0], [0.034, 0.02], [0.026, 0.04]], 24, 'sysCatOut'), MAT.steel, { d: 'Conus die de katalysatorbehuizing aansluit op de uitlaatpijp.', p: [canX0 - canL, ty, tz], ex: [-0.09, 0, 0] }),
    P('Hitteschild voorkat', G.half('x', 0.053, canL + 0.02, PI, 16), MAT.heat, { d: 'Aluminium hitteschild boven de voorkatalysator; beschermt de bedrading en de motorruimte.', p: [canX0 - canL / 2, ty + 0.002, tz], ex: [0, 0.1, 0] }),
    A('Lambdasonde voor', { d: 'Zuurstofsonde in de uitlaat vóór de katalysator: meet het zuurstofgehalte voor de mengselregeling.', p: [xE - 0.0495, ty, tz - 0.034], r: [-HALF, 0, 0], ex: [0, 0, -0.12] }, [
      P('Sondelichaam', merge([G.cyl('y', 0.0045, 0.0045, 0.04, 8), xf(G.cyl('y', 0.0085, 0.0085, 0.008, 6), [0, 0.02, 0]), xf(G.cyl('y', 0.006, 0.006, 0.018, 10), [0, 0.034, 0])]), MAT.steel, { d: 'Sondelichaam met zeskant en beschermkap.', ex: [0, 0.05, 0] }),
      P('Stekker lambdasonde voor', G.rbox(0.022, 0.016, 0.018, 0.004), MAT.plastic, { d: 'Stekker aan de bedrading van de sonde.', p: [-0.02, 0.07, 0.02], ex: [-0.04, 0.05, 0.04] }),
      P('Kabel lambdasonde voor', tube([[0, 0.04, 0], [-0.008, 0.06, 0.008], [-0.016, 0.068, 0.016]], 0.0018, 8, 5), MAT.sysHose, { d: 'Bedrading tussen sonde en stekker.', ex: [-0.03, 0.04, 0.03] }),
    ]),
  ]);
  // ---- downpipe, flens, flex, tussenpijp, middendemper, achterpijp, einddemper (autoframe)
  const dpP = [sysP([xE - 0.062 - canL - 0.04, ty, tz]), [-0.385, 0.465, 1.19], [-0.38, 0.40, 1.13], [-0.30, 0.29, 1.095], [-0.17, 0.265, 1.075], [-0.06, 0.266, 1.04], [0.02, 0.268, 0.95], [0.02, 0.27, 0.85]];
  const pipeR = 0.0255;
  const dpCurve = new THREE.CatmullRomCurve3(dpP.map(q => V3(...q)), false, 'centripetal');
  const lp = dpCurve.getPoint(0.1), lpY = lp.y + pipeR + 0.015;
  const lamB = A('Lambdasonde na', { d: 'Zuurstofsonde achter de katalysator: controleert of de katalysator goed werkt.', ex: [0.08, 0.1, 0] }, [
    P('Sondelichaam', merge([G.cyl('y', 0.0045, 0.0045, 0.04, 8), xf(G.cyl('y', 0.0085, 0.0085, 0.008, 6), [0, 0.02, 0]), xf(G.cyl('y', 0.006, 0.006, 0.018, 10), [0, 0.034, 0])]), MAT.steel, { d: 'Sondelichaam met zeskant en beschermkap.', p: [lp.x, lpY, lp.z], ex: [0, 0.05, 0] }),
    P('Stekker lambdasonde na', G.rbox(0.022, 0.016, 0.018, 0.004), MAT.plastic, { d: 'Stekker aan de bedrading van de sonde.', p: [lp.x - 0.02, lpY + 0.07, lp.z + 0.02], ex: [-0.04, 0.05, 0.04] }),
    P('Kabel lambdasonde na', tube([[lp.x, lpY + 0.04, lp.z], [lp.x - 0.008, lpY + 0.06, lp.z + 0.008], [lp.x - 0.016, lpY + 0.068, lp.z + 0.016]], 0.0018, 8, 5), MAT.sysHose, { d: 'Bedrading tussen sonde en stekker.', ex: [-0.03, 0.04, 0.03] }),
  ]);
  const downpipe = A('Downpipe', { d: 'Pijp van de voorkatalysator, achter het blok omlaag en onder het schutbord door naar de tunnel. De lambdasonde achter de katalysator zit in dit stuk.', ex: [0, -0.1, -0.12] }, [
    P('Downpijp', tube(dpP, pipeR, 56, 14), MAT.exhaust, { d: 'Stalen uitlaatbuis die achter het blok omlaag buigt (afmetingen schematisch).', ex: [0, 0, 0] }),
    lamB,
  ]);
  const FZ0 = 0.84;
  const flenzen = A('Flensverbinding', { d: 'Driegats flensverbinding tussen de downpipe en het flexstuk, met pakking en drie bouten.', ex: [0, 0, -0.08] }, [
    P('Flens voor', annulus(pipeR, 0.05, 0.008, 'z', 24), MAT.steel, { d: 'Flens aan het uiteinde van de downpipe.', p: [0.02, 0.27, FZ0 + 0.0075], ex: [0, 0, 0.05] }),
    P('Flenspakking', annulus(pipeR, 0.046, 0.002, 'z', 24), MAT.heat, { d: 'Metalen pakking tussen de flenzen.', p: [0.02, 0.27, FZ0], ex: [0, 0, 0] }),
    P('Flens achter', annulus(pipeR, 0.05, 0.008, 'z', 24), MAT.steel, { d: 'Flens aan het voorste uiteinde van het flexstuk.', p: [0.02, 0.27, FZ0 - 0.0075], ex: [0, 0, -0.05] }),
    ...[0, 1, 2].map(k => P(`Flensbout ${k + 1}`, hexBolt(0.032, 0.008, 'z'), MAT.steel, { d: 'Bout met moer door beide flenzen.', p: [0.02 + 0.04 * Math.cos(k * PI * 2 / 3 + HALF), 0.27 + 0.04 * Math.sin(k * PI * 2 / 3 + HALF), FZ0 - 0.0105], ex: [0.04 * Math.cos(k * PI * 2 / 3 + HALF), 0.04 * Math.sin(k * PI * 2 / 3 + HALF), -0.1] })),
  ]);
  const flex = A('Flexstuk', { d: 'Flexibele koppeling die de bewegingen van de dwarsgeplaatste motor opvangt (opbouw zoals gebruikelijk, schematisch weergegeven).', ex: [0, 0.05, -0.1] }, [
    P('Balg met vlechtwerk', merge([tube([[0.02, 0.27, 0.83], [0.02, 0.27, 0.68]], 0.0245, 4, 14), ...[0, 1, 2, 3, 4, 5, 6].map(k => xf(G.torus('z', 0.0255, 0.004, 22, 6), [0.02, 0.27, 0.82 - k * 0.02]))]), MAT.steel, { d: 'Gegolfde balg met een vlechtmantel eromheen.', ex: [0, 0, 0] }),
    sysClamp('Klem flexstuk voor', [0.02, 0.27, 0.80], V3(0, 0, 1), 0.0275, V3(0, 0, 1)),
    sysClamp('Klem flexstuk achter', [0.02, 0.27, 0.70], V3(0, 0, 1), 0.0275, V3(0, 0, -1)),
  ]);
  const tussen = P('Tussenpijp', tube([[0.02, 0.27, 0.68], [0.02, 0.27, 0.4], [0.02, 0.27, 0.09]], pipeR, 24, 14), MAT.exhaust, { d: 'Rechte pijp door de tunnel, van het flexstuk naar de middendemper.', ex: [0, 0.04, 0] });
  const MZ = -0.12;
  const midGeo = cache('sysMid', () => merge([xf(G.cyl('z', 0.065, 0.065, 0.3, 24), [0, 0, 0], null, [1, 0.8, 1]), xf(G.cyl('z', 0.026, 0.065, 0.06, 20), [0, 0, 0.18], null, [1, 0.8, 1]), xf(G.cyl('z', 0.065, 0.026, 0.06, 20), [0, 0, -0.18], null, [1, 0.8, 1])]));
  const midden = A('Middendemper', { d: 'Middendemper (resonator, ongeveer 425 mm lang): dempt vooral de hoge tonen. Opbouw schematisch.', ex: [0, -0.12, 0] }, [
    P('Demperhuis midden', midGeo, MAT.exhaust, { d: 'Ovale demperbus met inwendige schotten (niet weergegeven).', p: [0.02, 0.27, MZ] }),
    P('Hitteschild middendemper', G.half('z', 0.075, 0.34, HALF, 14), MAT.heat, { d: 'Aluminium hitteschild boven de middendemper, tegen de tunnel.', p: [0.02, 0.28, MZ], ex: [0, 0.12, 0] }),
    sysClamp('Klem midden voor', [0.02, 0.27, MZ + 0.215], V3(0, 0, 1), 0.0275, V3(0, 0, 1)),
    sysClamp('Klem midden achter', [0.02, 0.27, MZ - 0.215], V3(0, 0, 1), 0.0275, V3(0, 0, -1)),
  ]);
  const PY = 0.148;                                               // hartlijn achterpijp achter de tunnel: onderkant 0,1225 boven de grond, bovenkant 2,5 mm onder het hitteschild van de tank
  const achterpijp = P('Achterpijp', tube([[0.02, 0.27, -0.33], [0.02, 0.27, -0.46], [0.03, 0.235, -0.56], [0.04, 0.19, -0.65], [0.05, 0.157, -0.745], [0.05, PY, -0.84], [0.05, PY, -1.1], [0.05, PY, -1.3], [0.05, 0.15, -1.45], [0.05, 0.157, -1.58], [0.05, 0.175, -1.7], [0.05, 0.192, -1.78], [0.05, 0.1975, -1.82]], pipeR, 72, 14), MAT.exhaust, { d: 'Pijp van de middendemper, vanaf het eind van de tunnel strak onder de vloer en de brandstoftank (met het hitteschild ertussen) en onder de torsiebalk door, daarna oplopend naar de einddemper (verloop schematisch).', ex: [0, -0.04, -0.06] });
  const EZ = -1.93, EY = 0.1975;                                    // platte einddemper, zo hoog en zo ver naar voren als de bagagevloer toelaat (onder de reservewielkuip)
  const endGeo = cache('sysEndFlat', () => merge([xf(G.rbox(0.66, 0.075, 0.26, 0.03), [0, 0, 0]), xf(G.cyl('z', 0.026, 0.026, 0.05, 14), [0.05, 0, 0.14])]));
  const einddemper = A('Einddemper', { d: 'Dwarsgeplaatste einddemper achter de achteras, met aan beide kanten een uitlaatpijp naar een verchroomd eindstuk (twee chromen eindstukken: aannemelijk voor deze uitvoering).', ex: [0, -0.1, -0.18] }, [
    P('Demperhuis eind', endGeo, MAT.sysDemper, { d: 'Dwarsgeplaatste einddemper van geplooid plaatstaal.', p: [0, EY, EZ], ex: [0, 0, 0] }),
    // de buis loopt onder de bumperonderkant naar de zwarte inham in de bumperonderrand (Achterbumper/Uitlaatuitsparing: |x| 0,385 tot 0,515,
    // tot y 0,345, vanaf z -2,13) en stijgt daarin naar het eindstuk. Kleinste speling (clash.py, advisorronde golf 5f): 16 mm tot de voorwand
    // van de inham en de onderschort, 18 mm tot de bumperschaal, 42 mm tot de kabelboom; eerder 0,1 mm tot de onderrand van de voorwand.
    // Daarvoor ligt het steunpunt op z -2,14 een centimeter lager (y 0,235) en staat de voorwand 2 cm verder naar voren. Het eindstuk zit in de inham met de achterkant
    // gelijk met het bumpervlak (z -2,27 op y 0,31); eerder hing het met het hart op y 0,268 als losse cilinder onder de bumper (S7, golf 5f ronde 2)
    ...[1, -1].map(s => P(`Uitlaatpijp ${sideName(s)}`, tube([[s * 0.29, EY, EZ - 0.07], [s * 0.36, 0.212, -2.03], [s * 0.45, 0.228, -2.075], [s * 0.45, 0.235, -2.14], [s * 0.45, 0.285, -2.19], [s * 0.45, 0.305, -2.22], [s * 0.45, 0.305, -2.25]], 0.02, 24, 10), MAT.sysDemper, { d: 'Korte buis van het uiteinde van de einddemper, strak onder de bumper en in de inham in de bumperonderrand oplopend naar het chromen eindstuk.', ex: [s * 0.015, 0, -0.03] })),
    ...[1, -1].map(s => P(`Uitlaateindstuk ${sideName(s)}`, annulus(0.026, 0.031, 0.06, 'z', 22), MAT.chrome, { d: 'Klein verchroomd eindstuk (62 mm) in de zwarte inham in de onderrand van de bumper, met de achterkant gelijk met het bumpervlak (plaats en maat geschat).', p: [s * 0.45, 0.305, -2.243], ex: [s * 0.015, 0, -0.1] })),
  ]);
  const hang = (n, x, yp, z, yb) => {
    const yt = yp + pipeR, len = yb - yt - 0.010;                    // rubber tussen de tap van de pijpbeugel (tot yt + 6 mm) en het vloerplaatje (4 mm)
    return A(`Ophanging ${n}`, { d: 'Rubber ophanging die de uitlaat aan de carrosserie hangt en trillingen isoleert: beugel om de pijp, rubber blokje, plaatje tegen de vloer.', ex: [0, -0.1, 0] }, [
      P('Pijpbeugel', cache('sysHangBr', () => merge([G.torus('z', pipeR + 0.002, 0.002, 18, 5), xf(G.box(0.04, 0.004, 0.03), [0, pipeR + 0.004, 0])])), MAT.darkSteel, { d: 'Stalen beugel die om de uitlaatpijp is gelast, met een tap naar boven.', p: [x, yp, z], ex: [0, -0.06, 0] }),
      P('Ophangrubber', cache(`sysHangRub${n}`, () => merge([G.cyl('y', 0.008, 0.008, len, 10), xf(G.cyl('y', 0.012, 0.012, 0.004, 12), [0, -len / 2 + 0.002, 0]), xf(G.cyl('y', 0.012, 0.012, 0.004, 12), [0, len / 2 - 0.002, 0])])), MAT.rubber, { d: 'Rubber ophangblokje tussen de pijpbeugel en de carrosserie.', p: [x, yt + 0.006 + len / 2, z], ex: [0, 0.08, 0] }),
      P('Vloerplaatje', G.box(0.04, 0.004, 0.03), MAT.darkSteel, { d: 'Stalen plaatje tegen de vloer waar het rubber aan hangt.', p: [x, yb - 0.002, z], ex: [0, 0.1, 0] }),
    ]);
  };
  const hangers = A('Ophangingen', { d: 'Rubber ophangingen die het uitlaatsysteem aan de vloer hangen.', ex: [0, 0.12, 0] }, [hang(1, 0.02, 0.27, 0.55, 0.385), hang(2, 0.02, 0.27, -0.46, 0.385), hang(3, 0.05, 0.149, -1.4, 0.198), hang(4, 0.05, 0.171, -1.68, 0.229)]);
  const hitte = A('Hitteschilden', { d: 'Aluminium hitteschilden die de vloer en de brandstoftank tegen de uitlaat beschermen.', ex: [0, 0.2, 0] }, [
    P('Hitteschild tunnel', plan(shapeOf([[-0.07, 0.8], [0.11, 0.8], [0.11, 0.2], [0.09, -0.5], [-0.05, -0.5], [-0.07, 0.2]]), 0.003), MAT.heat, { d: 'Plaat boven de pijp in de middentunnel; houdt de hitte van de vloer.', p: [0, 0.313, 0], ex: [0, 0.1, 0] }),
    P('Hitteschild tank', plan(shapeOf([[-0.12, -0.73], [0.2, -0.73], [0.2, -1.07], [-0.12, -1.07]]), 0.003), MAT.heat, { d: 'Plaat tussen de uitlaatpijp en de brandstoftank, strak onder de tank en tussen de twee spanbanden.', p: [0.05, 0.1775, 0], ex: [0, -0.1, 0] }),
  ]);
  return A('Uitlaatsysteem', { d: 'De uitlaat van de turbo tot de bumper: voorkatalysator direct op de turbine, downpipe, flexstuk, middendemper, einddemper en twee eindstukken (aannemelijk), met hitteschilden en rubber ophangingen. Lambdasondes zitten voor en na de katalysator.', ex: [0, -0.8, -0.3] }, [voorkat, downpipe, flenzen, flex, tussen, midden, achterpijp, einddemper, hangers, hitte]);
}

/* ============================ brandstofsysteem ============================ */
function buildFuel() {
  const TX = 0.0, TY = 0.268, TZ = -0.84;            // hart van de tank: z -0,975 tot -0,705, tussen de opkant in de bodemplaat (torsiebalk) en de middentunnel
  const fx = surfX(-1.72, 0.86);
  const tankGeo = cache('sysTank2', () => merge([G.rbox(0.86, 0.17, 0.27, 0.05), xf(G.box(0.66, 0.012, 0.18), [0, 0.088, 0])]));
  const tank = A('Brandstoftank', { d: 'Kunststof tank van 66 liter onder de achterbank, vóór de achteras, met twee stalen spanbanden, rubber strips en een hitteschild. De vorm en de maten van het model zijn schematisch en kleiner dan de echte tank.', spec: [['Inhoud', '66 l']], ex: [0, -0.2, 0] }, [
    P('Tank', tankGeo, MAT.plastic, { d: 'Zadelvormige kunststof tank van 66 liter (vorm schematisch).', p: [TX, TY, TZ] }),
    ...[0.1, -0.1].map((dz, i) => P(`Spanband ${i ? 'achter' : 'voor'}`, merge([xf(G.box(0.18, 0.006, 0.04), [0.35, 0, 0]), xf(G.box(0.36, 0.006, 0.04), [-0.26, 0, 0]), xf(G.box(0.006, 0.16, 0.04), [0.438, 0.08, 0]), xf(G.box(0.006, 0.16, 0.04), [-0.438, 0.08, 0])]), MAT.darkSteel, { d: 'Stalen spanband onder de tank, aan beide kanten aan de vloer geschroefd. In twee stukken: in het midden is hij onderbroken voor de uitlaatpijp en het hitteschild.', p: [TX, TY - 0.088, TZ + dz], ex: [0, -0.14, dz * 0.8] })),
    ...[[0.438, 0.1], [-0.438, 0.1], [0.438, -0.1], [-0.438, -0.1]].map(([dx, dz], i) => P(`Spanbandbout ${i + 1}`, hexBolt(0.02, 0.008, 'y'), MAT.steel, { d: 'Bout die de spanband aan de vloer bevestigt.', p: [TX + dx, TY + 0.077, TZ + dz], ex: [dx * 0.2, 0.14, dz * 0.4] })),
    P('Tankstrips', merge([xf(G.box(0.76, 0.006, 0.03), [0, 0, 0.115]), xf(G.box(0.76, 0.006, 0.03), [0, 0, -0.115])]), MAT.rubber, { d: 'Rubber strips tussen tank en vloer tegen trillingen en piepen.', p: [TX, TY + 0.092, TZ], ex: [0, 0.1, 0] }),
  ]);
  // pompmodule in de tank
  const MP = [-0.25, TY + 0.088, TZ];
  const pompmodule = A('Pompmodule', { d: 'Brandstofpompmodule in de tank: flens met vergrendelring, elektrische pomp met zeef, niveausensor met vlotter en drukregelaar. Er is geen retourleiding: de regelaar zit in de module.', ex: [0, 0.3, 0] }, [
    P('Modulevlens', merge([G.cyl('y', 0.085, 0.085, 0.01, 28), xf(G.cyl('y', 0.02, 0.02, 0.014, 12), [0.04, 0.012, 0.03])]), MAT.plasticGrey, { d: 'Kunststof flens die de module op de tank afsluit; bevat de leiding- en stekkeraansluiting.', p: [MP[0], MP[1] + 0.005, MP[2]], ex: [0, 0.12, 0] }),
    P('Vergrendelring', annulus(0.07, 0.098, 0.01, 'y', 28), MAT.darkSteel, { d: 'Draairing die de flens op de tank vastzet.', p: [MP[0], MP[1] + 0.014, MP[2]], ex: [0, 0.2, 0] }),
    P('Moduleafdichting', G.torus('y', 0.075, 0.004, 28, 6), MAT.rubber, { d: 'Rubber ring tussen flens en tank.', p: [MP[0], MP[1] - 0.001, MP[2]], ex: [0, 0.06, 0] }),
    P('Modulestekker', G.rbox(0.035, 0.022, 0.03, 0.005), MAT.plastic, { d: 'Elektrische aansluiting van de pomp en de niveausensor.', p: [MP[0] - 0.05, MP[1] + 0.02, MP[2] + 0.03], ex: [-0.1, 0.1, 0] }),
    P('Leidingaansluiting module', G.cyl('y', 0.008, 0.008, 0.03, 10), MAT.steel, { d: 'Uitgang van de module voor de toevoerleiding naar de motor.', p: [MP[0] + 0.04, MP[1] + 0.026, MP[2] + 0.03], ex: [0.1, 0.14, 0] }),
    P('Pompbeker', G.lathe('y', [[0.0, 0], [0.055, 0], [0.058, 0.005], [0.058, 0.1], [0.054, 0.1], [0.054, 0.006], [0, 0.006]], 20, 'sysCup'), MAT.plasticGrey, { d: 'Opvangbeker rond de pomp, houdt brandstof bij de pomp in bochten.', p: [MP[0], MP[1] - 0.125, MP[2]], ex: [0, -0.12, 0], inner: true }),
    P('Brandstofpomp', merge([G.cyl('y', 0.028, 0.028, 0.09, 18), xf(G.cyl('y', 0.012, 0.012, 0.02, 10), [0, 0.055, 0])]), MAT.steel, { d: 'Elektrische brandstofpomp in de beker.', p: [MP[0], MP[1] - 0.065, MP[2]], ex: [0, -0.06, 0], inner: true }),
    P('Pompzeef', G.rbox(0.07, 0.02, 0.07, 0.006), MAT.filter, { d: 'Fijnmazige zeef op de aanzuiging van de pomp.', p: [MP[0], MP[1] - 0.12, MP[2]], ex: [0, -0.12, 0], inner: true }),
    P('Drukregelaar', merge([G.cyl('y', 0.014, 0.014, 0.05, 12), xf(G.cyl('y', 0.018, 0.018, 0.01, 12), [0, 0.03, 0])]), MAT.darkSteel, { d: 'Houdt de brandstofdruk op de rail constant; overtollige brandstof stroomt terug in de beker.', p: [MP[0] + 0.035, MP[1] - 0.06, MP[2] - 0.03], ex: [0.1, 0, 0], inner: true }),
    P('Niveausensor', merge([G.box(0.03, 0.05, 0.01), tube([[0.015, -0.02, 0], [0.07, -0.05, 0.0], [0.11, -0.07, 0.0]], 0.0018, 8, 5)]), MAT.copper, { d: 'Potentiometer met arm waarmee de brandstofmeter wordt aangestuurd.', p: [MP[0] - 0.045, MP[1] - 0.06, MP[2] - 0.03], ex: [-0.1, 0, 0], inner: true }),
    P('Vlotter', G.sphere(0.02, 10), MAT.red, { d: 'Drijver aan de arm van de niveausensor.', p: [MP[0] + 0.065, MP[1] - 0.13, MP[2] - 0.03], ex: [0.1, -0.1, 0], inner: true }),
    P('Steunstangen module', merge([xf(G.cyl('y', 0.004, 0.004, 0.1, 6), [0.05, 0, 0.04]), xf(G.cyl('y', 0.004, 0.004, 0.1, 6), [-0.05, 0, -0.04])]), MAT.steel, { d: 'Twee stangen met veer die de beker tegen de tankbodem drukken.', p: [MP[0], MP[1] - 0.05, MP[2]], ex: [0, -0.05, 0.1], inner: true }),
  ]);
  // vulsysteem: rechts achter (aan de passagierskant); de klep zit in het rechter achterscherm, met een tankkom erachter. De opening in het
  // scherm (bodTkZ, bodTkY) staat in bodyparts.js. Capless (HB2 1.73): geen dop, maar een klep in de vulhals die het pistool opent.
  const flapY = (bodTkY[0] + bodTkY[1]) / 2, flapZ = (bodTkZ[0] + bodTkZ[1]) / 2;
  const tkFloor = fx - 0.05, tkMouth = fx - 0.022, tkNeck = fx - 0.056;       // x (positief, rechterkant) van de bodem, de monding en de achterkant van de hals
  const tkSkin = (z, y, out) => { const p = bodAt(z, y, out); return [-p[0], p[1], p[2]]; };
  // klep: schaal die de huid volgt (2 mm over de rand van de opening), met een binnenvlak en vier randen. Golf 8 ronde 3 (kierenaudit, paneelnaad
  // stap hooguit 1 mm): buitenvlak 0,5 mm boven de huid (was 1,5 mm; gemeten stap 1,6 mm tegen het scherm)
  const flapZ0 = bodTkZ[0] - 0.002, flapZ1 = bodTkZ[1] + 0.002, flapY0 = bodTkY[0] - 0.002, flapY1 = bodTkY[1] + 0.002, fo = 0.0005, fi = -0.004;
  const flapCrown = (z, t) => 0.005 * Math.sin(PI * (z - flapZ0) / (flapZ1 - flapZ0)) * Math.sin(PI * t);   // licht bol, zoals het scherm
  // buitenvlak (golf 5n): volgt de huid zonder extra bolling en krijgt de normalen van de huid (bodN, gespiegeld naar rechts). Met de bolling
  // van 5 mm weken de normalen tot ca. 8 graden af van het scherm eromheen, en de blanke lak spiegelde daardoor een andere strook van de
  // omgeving: een lichte rechthoek boven de achterwielboog. De binnenzijde houdt de halve bolling (alleen te zien bij een open klep), zodat
  // de klep in het midden 3 mm dik blijft.
  const flapSkin = () => { const g = patch((z, t) => tkSkin(z, lerp(flapY0, flapY1, t), fo), flapZ0, flapZ1, 14, () => [0, 1], 12), P3 = g.attributes.position, N = g.attributes.normal;
    for (let i = 0; i < P3.count; i++) { const e = bodNormalAt(P3.getZ(i), P3.getY(i)), q = [-e[0], e[1], e[2]], o = Math.sign(q[0] * N.getX(i) + q[1] * N.getY(i) + q[2] * N.getZ(i)) || 1; N.setXYZ(i, o * q[0], o * q[1], o * q[2]); }
    return g; };
  // ronde 2: stralen loodrecht op de huid over de klep en 8 mm daarbuiten (3111 stralen) raken binnen de klep altijd eerst het buitenvlak en
  // daarbuiten het scherm; nergens liggen twee onderdelen binnen 0,8 mm (geen doorboring, geen z-fight; met fo 1,5 mm). De vier randen (fo boven de huid
  // tot 4 mm eronder) waren gelakt en vingen het licht: van opzij een witte lijn langs de scharnierkant. Ze horen nu bij de grijze
  // binnenzijde en lezen als de donkere naad rond de klep.
  const flapOut = cache('sysFlapRo', () => flapSkin());
  const flapIn = cache('sysFlapRi', () => merge([
    patch((z, t) => tkSkin(z, lerp(flapY0, flapY1, t), fi + 0.5 * flapCrown(z, t)), flapZ0, flapZ1, 14, () => [0, 1], 12),
    ...[flapZ0, flapZ1].map(zz => patch((y, t) => tkSkin(zz, y, lerp(fo, fi, t)), flapY0, flapY1, 8, () => [0, 1], 1)),
    ...[flapY0, flapY1].map(yy => patch((z, t) => tkSkin(z, yy, lerp(fo, fi, t)), flapZ0, flapZ1, 10, () => [0, 1], 1)),
  ]));
  // tankkom: vier wanden van de rand van de opening naar de bodem en een bodem met de hals
  const tkBowl = cache('sysTankkom', () => merge([
    ...[bodTkZ[0], bodTkZ[1]].map(zz => patch((y, t) => [-lerp(-tkSkin(zz, y, -0.004)[0], tkFloor, t), y, zz], bodTkY[0], bodTkY[1], 8, () => [0, 1], 4)),
    ...bodTkY.map(yy => patch((z, t) => [-lerp(-tkSkin(z, yy, -0.004)[0], tkFloor, t), yy, z], bodTkZ[0], bodTkZ[1], 8, () => [0, 1], 4)),
    patch((z, t) => [-tkFloor, lerp(bodTkY[0], bodTkY[1], t), z], bodTkZ[0], bodTkZ[1], 6, () => [0, 1], 6),
  ]));
  const vulRoute = [[-0.426, 0.30, -0.84], [-0.458, 0.304, -0.86], [-0.467, 0.32, -0.93], [-0.467, 0.34, -1.0], [-0.467, 0.3475, -1.07], [-0.467, 0.3475, -1.14], [-0.467, 0.3475, -1.2], [-0.455, 0.37, -1.26], [-0.447, 0.40, -1.32], [-0.40, 0.45, -1.43], [-0.40, 0.60, -1.52], [-0.44, 0.74, -1.58], [-0.62, 0.80, -1.62], [-0.76, 0.84, -1.66], [-tkNeck, flapY, flapZ]];   // route van de vulpijp, van de tank naar de tankhals
  const vul = A('Vulsysteem', { d: 'Vulpijp met capless vulhals en tankklep in het rechter achterscherm. De vulpijp loopt boven het achterwiel langs naar de tank. Een dop is er niet: in de vulhals zit een klep die het pistool opent.', ex: [-0.2, 0.1, -0.1] }, [
    // De vulpijp loopt van de tank boven het achterwiel langs omhoog en verdwijnt in de verhoging van de zijbekleding van de
    // bagageruimte; achter de bekleding komt hij weer uit de zijwand en loopt naar de tankhals. Het stuk dat helemaal binnen
    // de bekleding ligt, is weggelaten: de onderste pijp eindigt 2 tot 3 cm in de verhoging (u 0,491), het bovenstuk begint
    // waar de pijp vrij uit de zijwand komt (u 0,854). Beide stukken liggen precies op de oorspronkelijke route. Het bovenstuk eindigt op u 0,98:
    // de laatste bocht van de route komt schuin op de hals aan, en een uiteinde op u 1 liet de buisrand 1,4 mm in de vulhals steken; op 0,98 ligt het
    // uiteinde 3,9 mm voor de hals (op 0,985 steekt het er 2,1 mm in).
    ...[['Vulpijp', 0, 0.491, 'Kunststof vulpijp van de tank boven het achterwiel langs omhoog tot in de verhoging van de zijbekleding van de bagageruimte; verder loopt hij binnen de bekleding.'],
      ['Vulpijp bovenstuk', 0.854, 0.98, 'Bovenste stuk van de kunststof vulpijp: komt achter de zijbekleding van de bagageruimte uit de zijwand en loopt naar de vulhals achter de tankklep.']].map(([n, u0, u1, d]) =>
      P(n, sysTubePart(vulRoute, 0.0185, 64, 10, u0, u1), MAT.plastic, { d, ex: [-0.04, 0, 0] })),
    P('Vulhals', merge([annulus(0.0245, 0.029, tkMouth - tkNeck, 'x', 24), xf(G.torus('x', 0.0268, 0.0036, 24, 6), [-(tkMouth - tkNeck) / 2, 0, 0])]), MAT.plastic, { d: 'Capless vulhals achter de tankklep: een korte holle hals met een rand waarin het pistool past; de zwarte vulklep zit er een centimeter in.', p: [-(tkNeck + tkMouth) / 2, flapY, flapZ], ex: [-0.1, 0, 0] }),
    P('Vulklep', merge([G.cyl('x', 0.0235, 0.0235, 0.003, 20), xf(G.cyl('z', 0.0025, 0.0025, 0.03, 8), [0.002, 0.022, 0])]), MAT.blackGloss, { d: 'Capless vulklep (klep B in de vulpijp, HB2 1.73): geen dop en geen bandje. Een veer houdt de klep dicht; het pistool duwt hem open. Niet met de vingers indrukken. Op de benzineversie laat een restrictor alleen een loodvrij pistool toe (vorm schematisch).', p: [-(tkMouth - 0.012), flapY, flapZ], ex: [-0.2, 0.05, 0] }),
    P('Vulklepring', G.torus('x', 0.0238, 0.0032, 24, 6), MAT.steel, { d: 'Metalen ring om de zwarte vulklep: zo is de capless vulhals van buiten af te lezen (vorm schematisch).', p: [-(tkMouth - 0.0105), flapY, flapZ], ex: [-0.22, 0.05, 0] }),
    P('Tankkom', tkBowl, MAT.sysTkNis, { d: 'Kom in het rechter achterscherm achter de tankklep, met de hals van de vulpijp op de bodem (vorm schematisch).', ex: [-0.12, 0.02, 0] }),
    A('Tankklep', { d: 'Tankklep in het rechter achterscherm, in lak uitgevoerd. Opent na ontgrendelen door op de achterrand te drukken en draait dan ongeveer 140 graden om de scharnierrand aan de voorkant (hoek geschat).', ex: [-0.34, 0.05, 0],
      open: hinge(tkSkin(bodTkZ[1] + 0.004, flapY, 0.004), [0, 1, 0], 140 * PI / 180, { min: 112 * PI / 180, label: 'Tankklep', look: { dir: [-1, 0.3, -0.45], nodes: ['Tankklep', 'Tankkom'] } }) }, [
      P('Tankklep buitenkant', flapOut, MAT.paint, { d: 'Buitenkant van de tankklep in carrosseriekleur, die de welving van het scherm volgt.', ex: [-0.04, 0.01, 0] }),
      P('Tankklep binnenzijde', flapIn, MAT.plasticGrey, { d: 'Grijze kunststof binnenzijde van de tankklep met de randen, zichtbaar als de klep openstaat; de randen lezen bij een dichte klep als de naad.', ex: [0.04, 0, 0] }),
    ]),
    sysClamp('Klem vulpijp', [-0.44, 0.302, -0.845], V3(1, 0, 0), 0.0185, V3(0.5, 0, 0)),
  ]);
  // leidingen
  const rail = ENG_PORTS.fuelRailIn;
  const toevoer = A('Brandstofleiding', { d: 'Stalen toevoerleiding van de pompmodule onder de vloer langs naar de brandstofrail. Door het ontbreken van een retourleiding is dit de enige brandstofleiding naar de motor.', ex: [0, -0.12, 0] }, [
    P('Toevoerleiding', tube([[MP[0] + 0.04, MP[1] + 0.045, MP[2] + 0.03], [-0.2, 0.355, -0.8], [-0.4, 0.3, -0.7], [-0.42, 0.13, -0.6], [-0.42, 0.13, 0.4], [-0.38, 0.14, 0.9], [-0.1, 0.33, 1.0], [0.1, 0.5, 1.06], [0.21, 0.62, 1.2], [0.155, 0.645, 1.33], [0.14, 0.645, 1.55], [0.138, 0.655, 1.6], sysE(rail, 0.045), sysP(rail.p)], 0.004, 138, 6), MAT.steel, { d: 'Stalen brandstofleiding met kunststof mantel, aan de vloer vastgeklikt.', ex: [0, 0.1, 0] }),
    ...[[-0.42, 0.13, -0.3], [-0.42, 0.13, 0.2], [-0.4, 0.135, 0.65]].map((p, i) => P(`Leidingclip ${i + 1}`, G.box(0.016, 0.012, 0.02), MAT.plastic, { d: 'Kunststof clip die de brandstofleiding aan de vloer klikt.', p, ex: [0, 0.06, 0] })),
  ]);
  const evap = A('Dampsysteem', { d: 'Opvang van benzinedampen (EVAP): het koolstoffilter vangt dampen uit de tank op en laat ze via het spoelventiel door de motor verbranden. De leiding naar het inlaatspruitstuk is niet weergegeven.', ex: [-0.1, -0.1, -0.1] }, [
    P('Koolstoffilter', merge([G.rbox(0.06, 0.17, 0.10, 0.015), xf(G.cyl('z', 0.008, 0.008, 0.05, 8), [0, 0.06, 0.06])]), MAT.plastic, { d: 'Houder met actieve kool die benzinedampen uit de tank vasthoudt. Staat links naast de tank tegen de wand van de wielkast, boven de vloerplaat (plaats en maten schematisch).', p: [0.468, 0.271, -0.84], ex: [-0.08, -0.1, 0] }),
    P('Spoelventiel', merge([G.cyl('y', 0.014, 0.014, 0.05, 12), xf(G.rbox(0.02, 0.014, 0.02, 0.004), [0, 0.03, 0.016])]), MAT.darkSteel, { d: 'Magneetventiel dat de dampen gestuurd naar het inlaatspruitstuk laat stromen.', p: [0.468, 0.30, -0.735], ex: [0.06, 0.1, 0] }),
    P('Rolloverventiel', G.cyl('y', 0.014, 0.014, 0.03, 10), MAT.plastic, { d: 'Ventiel op de tank dat bij kantelen de dampleiding afsluit.', p: [0.41, 0.352, TZ - 0.05], ex: [0, 0.14, 0] }),
    P('Dampleiding', tube([[0.41, 0.358, -0.89], [0.425, 0.345, -0.865], [0.436, 0.328, -0.85]], 0.007, 20, 6), MAT.sysHose, { d: 'Dunne kunststof slang van het rolloverventiel op de tank naar het koolstoffilter.', ex: [0, 0.1, 0] }),
    P('Spoelleiding', tube([[0.468, 0.23, -0.79], [0.468, 0.23, -0.765], [0.468, 0.26, -0.745]], 0.006, 12, 6), MAT.sysHose, { d: 'Korte slang van het koolstoffilter naar het spoelventiel.', ex: [0, 0.08, 0] }),
  ]);
  return A('Brandstofsysteem', { d: 'Brandstoftank van 66 liter onder de achterbank met pompmodule, vulsysteem aan de rechterzijde, toevoerleiding naar de motor en het dampsysteem.', spec: [['Tankinhoud', '66 l'], ['Brandstof', 'loodvrije benzine (Euro 95)'], ['Tankklep', 'rechterachterscherm']], ex: [-0.5, -0.5, -1.0] }, [tank, pompmodule, vul, toevoer, evap]);
}

/* ============================ elektrisch systeem ============================ */
function buildElectrical() {
  const starter = ENG2CAR(DRV_PORTS.starterTerminal);
  // kabel naar de B+-bout: komt van voren op de hoogte van de bout aan (de motorbout zit 1,1 cm lager), laatste stuk langs de boutas
  const stAt = (dx, dy, dz) => ENG2CAR(DRV_PORTS.starterTerminal.map((v, i) => v + [dx, dy, dz][i]));
  // Golf 5j: accu linksvoor, direct achter de radiateurafdekplaat, op de voorkant van de linker wielkast, onder een zwarte accukap (foto van de
  // gebruiker; was linksachter op de versnellingsbak). Achter de accu draagt de accubak de motorcomputer (onder de kap); achter de kap staat de
  // zekeringkast met een klikdeksel, vóór de veerpoottoren. De lange zijde van de accu ligt dwars (x); de polen zitten achter op het deksel,
  // de pluspool aan de motorzijde.
  const BX = 0.545, BY = 0.66, BZ = 1.8075;                 // hart van de accu (maat geschat)
  const W = 0.23, L = 0.175, Hh = 0.15;                     // lengte (x), breedte (z) en hoogte van de bak; deksel 12 mm
  const PZ = BZ - 0.06, PT = BY + Hh / 2 + 0.012;           // z van de polen (achter) en bovenkant van het deksel
  const PX = [BX - 0.08, BX + 0.08];                        // pluspool (motorzijde) en minpool
  const cellGeo = cache('sysCell2', () => G.box((W - 0.02) / 6 - 0.004, Hh - 0.04, L - 0.02));
  std('sysKap', 0x17181b, 0, 0.82);
  // accukap: deksel (4 mm) met een rand van 3 mm rondom tot 4 cm diep; de voorhoek aan de wielkastzijde is afgeschuind (motorkap)
  const kapOm = [[0.33, 1.60], [0.68, 1.60], [0.68, 1.86], [0.645, 1.905], [0.33, 1.905]];
  const kapIn = [[0.333, 1.603], [0.677, 1.603], [0.677, 1.859], [0.6435, 1.902], [0.333, 1.902]];
  const kapGeo = cache('sysAccukap', () => { const o = shapeOf(kapOm), r = shapeOf(kapOm); const h = new THREE.Path(); kapIn.forEach((q, i) => i ? h.lineTo(...q) : h.moveTo(...q)); h.closePath(); r.holes.push(h);
    return merge([xf(plan(o, 0.004), [0, 0.774, 0]), xf(plan(r, 0.037), [0, 0.7535, 0]), ...[0.42, 0.50, 0.58].map(x => xf(G.box(0.06, 0.003, 0.008), [x, 0.7775, 1.66]))]); });
  const accu = A('Accu', { d: '12-voltaccu linksvoor in de motorruimte, direct achter de radiateurafdekplaat, in een zwarte accubak op de voorkant van de linker wielkast, onder een zwarte accukap; met poolklemmen, houder, afkoppelunit op de pluspool en een ontgassingsslang. Plaats naar foto\'s van de gebruiker en van een Laguna III 2.0T; de exacte maat is geschat.', spec: [['Spanning', '12 V'], ['Plaats', 'linksvoor in de motorruimte, onder de accukap (waargenomen)']], ex: [0.12, 0.3, 0.12] }, [
    P('Accukap', kapGeo, MAT.sysKap, { d: 'Zwarte kunststof kap van ongeveer 35 bij 30 cm over de accu en de motorcomputer; de rode pluskabel komt er aan de motorzijde onder vandaan.', ex: [0, 0.55, 0] }),
    P('Accubak', G.rbox(W, Hh, L, 0.01), MAT.sysBattery, { d: 'Kunststof accubak met de zes cellen.', p: [BX, BY, BZ] }),
    P('Accudeksel', G.rbox(W + 0.002, 0.012, L + 0.002, 0.004), MAT.plasticGrey, { d: 'Deksel met ontgassingskanaal.', p: [BX, BY + Hh / 2 + 0.006, BZ], ex: [0, 0.2, 0] }),
    A('Cellen', { d: 'De zes in serie geschakelde cellen van de accu (2 volt per cel), in de accubak onder het deksel.', ex: [0, 0.1, 0], inner: true }, [0, 1, 2, 3, 4, 5].map(k => P(`Cel ${k + 1}`, cellGeo, MAT.sysBattery, { d: 'Loodzuurcel van 2 volt, in serie geschakeld met de andere cellen.', p: [BX + (k - 2.5) * ((W - 0.02) / 6), BY - 0.004, BZ], ex: [(k - 2.5) * 0.03, k * 0.02, 0], inner: true }))),
    P('Pluspool', G.cyl('y', 0.009, 0.009, 0.016, 12), MAT.steel, { d: 'Pluspool van de accu, iets dikker dan de minpool zodat de klemmen niet te verwisselen zijn.', p: [PX[0], PT + 0.008, PZ], ex: [0, 0.27, 0] }),
    P('Minpool', G.cyl('y', 0.008, 0.008, 0.016, 12), MAT.steel, { d: 'Minpool van de accu, waarop de massakabel naar de carrosserie aansluit.', p: [PX[1], PT + 0.008, PZ], ex: [0, 0.27, 0] }),
    P('Poolklem plus', merge([G.cyl('y', 0.014, 0.014, 0.012, 12), xf(G.box(0.03, 0.012, 0.014), [-0.022, 0, 0])]), MAT.steel, { d: 'Poolklem op de pluspool, aangesloten op de accuafkoppelunit.', p: [PX[0], PT + 0.012, PZ], ex: [-0.04, 0.33, 0] }),
    P('Poolklem min', merge([G.cyl('y', 0.013, 0.013, 0.012, 12), xf(G.box(0.03, 0.012, 0.014), [0.022, 0, -0.006])]), MAT.steel, { d: 'Poolklem op de minpool, met de massakabel naar de carrosserie.', p: [PX[1], PT + 0.012, PZ], ex: [0.04, 0.33, 0] }),
    P('Afdekkap plus', G.cyl('y', 0.019, 0.019, 0.012, 14), MAT.red, { d: 'Rode afdekkap over de pluspool tegen kortsluiting.', p: [PX[0], PT + 0.016, PZ], ex: [0, 0.42, 0] }),
    P('Accuafkoppelunit', merge([G.rbox(0.044, 0.024, 0.04, 0.005), xf(G.cyl('x', 0.006, 0.006, 0.02, 8), [-0.03, -0.004, 0])]), MAT.plasticGrey, { d: 'Afkoppelunit met pyrotechnische klem die de voeding bij een aanrijding onderbreekt.', p: [BX - W / 2 - 0.026, PT - 0.012, PZ], ex: [-0.14, 0.3, 0] }),
    P('Accuhouder', merge([G.box(W + 0.02, 0.012, 0.02), xf(G.cyl('y', 0.004, 0.004, 0.03, 6), [W / 2 + 0.005, -0.01, 0]), xf(G.cyl('y', 0.004, 0.004, 0.03, 6), [-W / 2 - 0.005, -0.01, 0])]), MAT.darkSteel, { d: 'Beugel die de accu aan de voet op de bak klemt, met twee bouten.', p: [BX, BY - Hh / 2 + 0.012, BZ + L / 2 + 0.009], ex: [0, 0.1, 0.1] }),
    P('Accubak onderplaat', cache('sysAccuBak', () => merge([G.box(W + 0.02, 0.013, L + 0.02), xf(G.box(W + 0.02, 0.035, 0.004), [0, 0.024, -(L + 0.02) / 2 + 0.002]), xf(G.box(W + 0.02, 0.012, 0.004), [0, 0.0125, (L + 0.02) / 2 - 0.002]), xf(G.box(0.004, 0.035, L + 0.02), [(W + 0.02) / 2 - 0.002, 0.024, 0]), xf(G.box(0.004, 0.035, L + 0.02), [-(W + 0.02) / 2 + 0.002, 0.024, 0])])), MAT.sysKap, { d: 'Zwarte kunststof accubak (draagbak) waarin de accu staat, op de voorkant van de linker wielkast; achteraan draagt hij de motorcomputer.', p: [BX, BY - Hh / 2 - 0.0065, BZ], ex: [0, -0.12, 0] }),
    P('Ontgassingsslang', tube([[BX + 0.08, PT - 0.006, BZ + L / 2 + 0.001], ...SYS_RT.gas], 0.005, 16, 6), MAT.sysHose, { d: 'Slangetje dat accugassen aan de voorkant van de accu naar beneden afvoert.', ex: [0.02, -0.1, 0.04] }),
  ]);
  const UX = 0.60, UZ = 1.535, UY = 0.77;                   // zekeringkast achter de accukap, vóór de veerpoottoren, boven de wielkast
  const upc = A('Zekeringkast motorruimte', { d: 'Zekerings- en relaisdoos van de motorruimte (UPC) achter de accukap en vóór de linker veerpoottoren, onder een klikdeksel, met het blok maxizekeringen aan de voorkant (plaats naar foto; opbouw schematisch).', ex: [0.08, 0.45, -0.06] }, [
    P('Doosbasis', G.rbox(0.19, 0.05, 0.12, 0.008), MAT.plastic, { d: 'Onderbak met de zekeringen en relais.', p: [UX, UY - 0.0005, UZ], ex: [0, 0.02, 0] }),
    P('Doosdeksel', merge([G.rbox(0.192, 0.012, 0.086, 0.004), xf(G.box(0.03, 0.01, 0.006), [0, -0.004, -0.044]), xf(G.box(0.05, 0.004, 0.012), [0, 0.008, 0.02])]), MAT.plasticGrey, { d: 'Klikdeksel met lippen die met clips op de zekeringkast vastzit en de zekeringen tegen vocht en vuil afschermt.', p: [UX, UY + 0.031, UZ - 0.016], ex: [0, 0.14, 0] }),
    P('Maxizekeringblok', merge([G.box(0.12, 0.012, 0.026), ...[-0.04, -0.013, 0.013, 0.04].map(x => xf(G.box(0.016, 0.01, 0.014), [x, 0.011, 0]))]), MAT.red, { d: 'Blok met de maxizekeringen (hoofdzekeringen) aan de voorkant van de zekeringkast.', p: [UX, UY + 0.031, UZ + 0.044], ex: [0, 0.2, 0.08] }),
    P('Doosstekker', G.rbox(0.03, 0.03, 0.04, 0.006), MAT.plastic, { d: 'Stekker voor de kabelboom van de motorruimte, aan de motorzijde van de zekeringkast.', p: [UX - 0.11, UY + 0.005, UZ - 0.015], ex: [-0.08, 0.12, -0.03] }),
  ]);
  // motorcomputer achter de accu op de accubak, onder de accukap (MR 415 noemt de accubak als plaats, zie de opdracht van golf 5j)
  const EC = [0.51, 0.711, 1.662];
  const ecu = A('Motorcomputer', { d: 'Motormanagementcomputer (ECU) van de F4Rt: regelt inspuiting, ontsteking en turbodruk. Staat op een beugel aan de achterkant van de accubak, onder de accukap (plaats volgens het werkplaatshandboek MR 415; maat en stand geschat).', ex: [0.05, 0.22, -0.08] }, [
    P('ECU behuizing', G.rbox(0.16, 0.042, 0.10, 0.007), MAT.ecu, { d: 'Aluminium behuizing met de printplaat van de motorcomputer.', p: EC }),
    P('ECU beugel', merge([G.box(0.17, 0.006, 0.106), xf(G.box(0.17, 0.09, 0.004), [0, -0.042, 0.0525])]), MAT.darkSteel, { d: 'Beugel die de motorcomputer aan de achterkant van de accubak bevestigt.', p: [EC[0], EC[1] - 0.024, EC[2] - 0.003], ex: [0, -0.1, 0] }),
    P('ECU stekker', G.rbox(0.03, 0.03, 0.06, 0.006), MAT.plastic, { d: 'Grote stekker voor de motorbedrading, aan de wielkastzijde.', p: [EC[0] + 0.095, EC[1], EC[2]], ex: [0.12, 0.06, 0] }),
  ]);
  // UCH: achter het onderpaneel van het interieur (dat de klep levert), in het frame van dat paneel:
  // lokale z wijst van de bestuurder af, het paneel zit op x = 0,37 in het vlak van het dashboard
  const uf = typeof intFace === 'function' ? intFace(0.66, 0.008) : { z: 0.52, y: 0.656, rx: -0.528 };
  const uc = Math.cos(uf.rx), us = Math.sin(uf.rx);
  const uchAt = (lx, ly, lz) => [0.37 + lx, uf.y + ly * uc - lz * us, uf.z + ly * us + lz * uc];
  const uch = A('Centrale cabine-unit', { d: 'Centrale cabine-unit (UCH) met de zekeringen voor het interieur, achter het onderpaneel links van de stuurkolom (de klep van dat paneel hoort bij het interieur). Ontvangt onder meer de signalen van de bandenspanningssensoren. Opbouw schematisch.', p: uchAt(0, 0, 0), r: [uf.rx, 0, 0], ex: [0.2, -0.1, 0.3] }, [
    P('UCH behuizing', G.rbox(0.15, 0.07, 0.04, 0.008), MAT.ecu, { d: 'Behuizing met de printplaat van de cabine-unit.', p: [-0.05, 0, 0.05] }),
    P('UCH stekker', G.rbox(0.05, 0.03, 0.03, 0.006), MAT.plastic, { d: 'Stekker voor de kabelboom van de cabine.', p: [-0.05, -0.045, 0.083], ex: [0, -0.06, 0.08] }),
    P('UCH zekeringkast', merge([G.box(0.1, 0.045, 0.026), ...[-0.03, 0, 0.03].map(x => xf(G.box(0.02, 0.03, 0.01), [x, 0, 0.016]))]), MAT.plastic, { d: 'Zekeringkast van het interieur naast de cabine-unit, achter het paneel.', p: [0.085, 0, 0.045], ex: [0.08, 0, 0.06] }),
  ]);
  const horns = [1, -1].map(s => A(`Claxon ${sideName(s)}`, { d: 'Elektrische claxon achter de voorbumper (aantal en plaats geschat).', ex: [s * 0.12, -0.08, 0.1] }, [
    P('Claxonhuis', merge([G.cyl('z', 0.04, 0.04, 0.02, 20), xf(G.lathe('z', [[0.012, 0], [0.026, 0.02], [0.034, 0.05]], 16, 'sysHorn'), [0, 0, 0.012])]), MAT.darkSteel, { d: 'Membraanhoorn met trechter.', p: [s * 0.62, 0.53, 2.1], ex: [0, 0, 0.1] }),
    P('Claxonbeugel', merge([G.box(0.03, 0.05, 0.008), xf(G.box(0.03, 0.008, 0.05), [0, 0.025, 0.03])]), MAT.darkSteel, { d: 'Beugel waarmee de claxon aan de bumperbalk hangt.', p: [s * 0.62, 0.53 - 0.01, 2.06], ex: [0, 0.08, -0.08] }),
  ]));
  // pluskabel: van de afkoppelunit aan de motorzijde van de accu onder de rand van de accukap uit (zichtbaar tussen kap en motorafdekkap)
  // en omlaag naar de pluspool van de startmotor; de laatste centimeters komen van voren langs de boutas
  const plusPts = [[BX - W / 2 - 0.056, PT - 0.016, PZ], [BX - W / 2 - 0.075, PT - 0.03, PZ], ...SYS_RT.plus, stAt(0.03, 0, 0.025), starter];
  const plusCable = A('Accukabel plus', { d: 'Dikke voedingskabel met rode isolatie van de accu naar de startmotor: vanaf de afkoppelunit aan de motorzijde van de accu onder de accukap uit, zichtbaar tussen de accukap en de motorafdekkap, en omlaag naar de pluspool van de startmotor.', ex: [-0.06, 0.06, 0.1] }, [
    P('Kabel', tube(plusPts, 0.009, 48, 8), MAT.red, { d: 'Dikke kabel met rode isolatie.', ex: [0, -0.05, 0] }),
    P('Kabelschoen accu', G.cyl('x', 0.009, 0.009, 0.008, 10), MAT.copper, { d: 'Kabelschoen op de uitgang van de afkoppelunit.', p: [BX - W / 2 - 0.052, PT - 0.016, PZ], ex: [-0.1, 0.3, 0] }),
    P('Kabelschoen startmotor', G.cyl('x', 0.0095, 0.0095, 0.008, 10), MAT.copper, { d: 'Kabelschoen op de pluspool van de startmotor.', p: starter, ex: [0.06, 0, 0] }),
    ...SYS_RT.plus.map((q, i) => P(`Kabelclip ${i + 1}`, G.box(0.014, 0.012, 0.02), MAT.plastic, { d: 'Kunststof clip die de kabel op zijn plaats houdt.', p: q, ex: [0, -0.06, 0] })).slice(0, 3),
  ]);
  // massakabel: van de minpool naar achteren onder de accukap uit naar een massaoog op de bovenkant van de linker wielkast, achter de accu
  const mN = V3(0, 0.819, 0.573), mO = V3(0.64, 0.6835, 1.58).addScaledVector(mN, 0.0035);   // normaal en hart van het massaoog op de wielkastboog
  const mAt = k => mO.clone().addScaledVector(mN, k).toArray();
  const massa = A('Massakabels', { d: 'Massaverbinding van de minpool naar de carrosserie.', ex: [0.08, 0.1, 0] }, [
    P('Massakabel accu', tube([[PX[1] + 0.03, PT + 0.012, PZ - 0.006], [PX[1] + 0.045, PT + 0.008, PZ - 0.012], ...SYS_RT.massa, mAt(0.03), mAt(0.006)], 0.008, 40, 8), MAT.sysHose, { d: 'Kabel van de minpool naar de carrosserie.', ex: [0.06, 0.04, 0] }),
    P('Massaoog carrosserie', merge([G.cyl('z', 0.012, 0.012, 0.004, 10), xf(hexBolt(0.016, 0.006, 'z'), [0, 0, 0.002])]), MAT.steel, { d: 'Massaoog met bout op de bovenkant van de linker wielkast, achter de accu.', p: mO.toArray(), q: quatFromTo(V3(0, 0, 1), mN), ex: [0.04, 0.1, 0] }),
  ]);
  // kabelbomen (schematisch)
  const kbS = [UX - 0.11, UY + 0.02, UZ - 0.015], kbJ = [0.15, 0.725, 1.935];   // bovenkant van de doosstekker; splitsing onder de afdekplaat
  const kbEcu = [EC[0] + 0.11, EC[1], EC[2]];             // uitgang van de ECU-stekker
  const harness = A('Kabelbomen', { d: 'De hoofdkabelbomen van de auto in vereenvoudigde vorm: voorzijde (koplampen en claxons), motorruimte met motorcomputer en cabine met de lijn naar de achterlichten.', ex: [0, 0.14, 0] }, [
    P('Kabelboom voorzijde', merge([tube([kbS, ...SYS_RT.kbv, kbJ, ...SYS_RT.kbvR, [-0.655, 0.68, 1.94]], 0.01, 96, 6), tube([kbJ, ...SYS_RT.kbvL, [0.655, 0.68, 1.94]], 0.007, 24, 6)]), MAT.sysHose, { d: 'Bedrading van de zekeringkast naar de koplampen: onder de accukap door en onder de radiateurafdekplaat langs naar beide koplampen.', ex: [0, 0.1, 0] }),
    P('Kabelboom motorruimte', tube([kbEcu, ...SYS_RT.kbm, [0.18, 0.62, 1.045]], 0.011, 64, 6), MAT.sysHose, { d: 'Bedrading van de motorcomputer op de accubak naar de doorvoer in het schutbord (de aftakkingen naar de sensoren van de motor horen bij de motorkabelboom).', ex: [0, 0.1, -0.1] }),
    // golf 5l: niet meer door de voetruimte. Boven de afdekking van de voetruimte naar voren (buiten de pedaalarmen om), voor de voetwand
    // omlaag tot net boven de onderrand van die wand, onder de zijbekleding door naar de goot tussen tapijt en dorpel, pas onder de instaplijst omlaag (daarvoor
    // zou hij in de spleet tussen tapijt en zijbekleding te zien zijn), onder de instaplijsten naar achteren, achter de brandstoftank en het koolstoffilter onder de zitting naar binnen en onder de dwarsbalk van de achteras door;
    // vanaf daar de oude lijn naar de achterlichten
    P('Kabelboom cabine', tube([uchAt(-0.05, -0.062, 0.083), [0.33, 0.535, 0.665], [0.34, 0.51, 0.75], [0.35, 0.50, 0.86], [0.42, 0.48, 0.905], [0.60, 0.455, 0.935], [0.69, 0.36, 0.934], [0.73, 0.288, 0.94], [0.80, 0.285, 0.942], [0.835, 0.265, 0.90], [0.835, 0.255, 0.80], [0.835, 0.212, 0.70], [0.835, 0.212, -0.45], [0.82, 0.212, -0.72], [0.62, 0.215, -0.985], [0.47, 0.235, -1.0], [0.43, 0.24, -1.12], [0.436, 0.245, -1.35], [0.45, 0.26, -1.9], [0.53, 0.27, -2.1], [0.59, 0.32, -2.2], [0.6, 0.42, -2.22], [0.6, 0.55, -2.235]], 0.01, 110, 6), MAT.sysHose, { d: 'Bedrading van de centrale cabine-unit: boven de afdekking van de voetruimte naar voren, voor de voetwand omlaag en onder de zijbekleding door naar de dorpel, onder de instaplijsten langs de dorpel naar achteren, achter de brandstoftank onder de achterbank naar binnen en onder de bagagevloer door naar de achterlichten; hij stijgt pas achter de achterrand van de vloerplaat. Vanaf de stoelen is hij nergens te zien (route geschat).', ex: [0.1, 0, 0] }),
    P('Doorvoer schutbord', G.cyl('z', 0.04, 0.04, 0.02, 14), MAT.rubber, { d: 'Rubber doorvoer in het schutbord voor de kabelboom.', p: [0.18, 0.62, 1.03], ex: [0, 0, 0.12] }),
  ]);
  // ruitensproeierinstallatie: tank in het vak rechtsvoor tussen de langsligger (x tot -0,572) en de bumpersteun (vanaf x -0,715), achter de
  // frontmodule en onder de koplamp; de vulhals met de gele dop staat achter de koplamp en vóór de wielkast (golf 5i: rechtsvoor, zoals op de
  // foto van een Laguna III 2.0T; was gespiegeld linksvoor). De slang loopt over de tank en langs de motorzijde van het expansievat (golf 5j; buitenom lag hij in de baan van de motorkapsteun)
  // naar de koppeling vóór de rechter veerpoottoren, waar de sproeierslang van de kap aansluit (maat van de tank schematisch).
  std('sysWashCap', 0xe2b51c, 0, 0.5);
  const WX = -0.6425, WY = 0.46, WZ = 1.91, WW = 0.115, WH = 0.22, WL = 0.22;      // hart en maten van de tank
  const neck = [-0.62, WZ - 0.035], NT = 0.745;                                   // vulhals: x, z en de hoogte van de bovenrand (golf 5j: 4 cm naar voren voor het stuuroliereservoir)
  const pu = [-0.655, 0.395, WZ + WL / 2 + 0.017];                                // hart van de pomp, tegen de voorkant van de tank
  const wEnd = [-0.60, 0.815, 1.48];                                              // koppeling vóór de veerpoottoren
  const washer = A('Ruitensproeierinstallatie', { d: 'Ruitensproeiertank met elektrische pomp en de sproeierslang naar de motorkap, in het vak rechtsvoor in de motorruimte, onder de koplamp; de vulhals met de gele dop staat rechtsvoor, zoals op een foto van een Laguna III 2.0T. Vorm en inhoud van de tank zijn niet gevonden (schematisch).', ex: [-0.16, 0.06, 0.06] }, [
    P('Sproeiertank', G.rbox(WW, WH, WL, 0.016), MAT.tank, { d: 'Doorschijnend kunststof reservoir voor de ruitensproeiervloeistof (vorm en maten schematisch).', p: [WX, WY, WZ] }),
    P('Vulhals sproeiertank', G.cyl('y', 0.02, 0.02, NT - (WY + WH / 2) - 0.0005, 16), MAT.tank, { d: 'Opstaande vulhals die vanaf de tank tot net onder de motorkap reikt, zodat je hem bij open kap kunt bijvullen.', p: [neck[0], (NT + WY + WH / 2 + 0.0005) / 2, neck[1]], ex: [0, 0.05, 0] }),
    P('Vuldop sproeiertank', merge([G.cyl('y', 0.026, 0.026, 0.018, 18), xf(G.box(0.036, 0.008, 0.008), [0, 0.012, 0])]), MAT.sysWashCap, { d: 'Gele kunststof dop op de vulhals met een greep om hem los te trekken (kleur naar foto).', p: [neck[0], NT + 0.0093, neck[1]], ex: [0, 0.12, 0] }),
    P('Sproeierpomp', merge([G.cyl('y', 0.015, 0.015, 0.07, 16), xf(G.cyl('z', 0.006, 0.006, 0.008, 10), [0, -0.025, -0.01275]), xf(G.cyl('y', 0.004, 0.004, 0.016, 8), [0, 0.043, 0])]), MAT.plastic, { d: 'Elektrische pomp die onderin tegen de tank zit en de vloeistof door de slang naar de sproeiers op de kap perst.', p: pu, ex: [0, -0.02, 0.1] }),
    P('Stekker sproeierpomp', G.rbox(0.014, 0.02, 0.016, 0.004), MAT.plasticGrey, { d: 'Stekker met de voeding van de pomp (bedrading schematisch).', p: [pu[0] - 0.0225, pu[1] - 0.005, pu[2]], ex: [-0.06, 0, 0.06] }),
    P('Tankbeugel sproeiertank', G.box(0.011, 0.03, 0.08), MAT.darkSteel, { d: 'Stalen beugel waarmee de tank aan de rechter langsligger vastzit (schematisch).', p: [-0.5785, 0.44, WZ], ex: [0.06, 0, 0] }),
    P('Sproeierslang motorruimte', tube([[pu[0], pu[1] + 0.0515, pu[2]], [pu[0], 0.50, pu[2]], [-0.655, 0.565, pu[2] - 0.003], ...SYS_RT.wash, [wEnd[0], wEnd[1] - 0.04, wEnd[2]], [wEnd[0], wEnd[1] - 0.0165, wEnd[2]]], 0.0035, 64, 6), MAT.rubber, { d: 'Dunne rubber slang van de pomp over de tank en langs de motorzijde van het expansievat naar de koppeling vóór de rechter veerpoottoren, waar de slang naar de sproeiers op de kap aansluit.', ex: [0, 0.06, 0] }),
    P('Slangkoppeling sproeierslang', G.cyl('y', 0.006, 0.006, 0.02, 10), MAT.plastic, { d: 'Kunststof verbindingsstuk tussen de slang in de motorruimte en de sproeierslang van de motorkap.', p: [wEnd[0], wEnd[1] - 0.005, wEnd[2]], ex: [0, 0.08, 0] }),
  ]);
  return A('Elektrisch systeem', { d: 'Accu met zekeringkast, motorcomputer, cabine-unit, claxons, voedings- en massakabels, de kabelbomen en de ruitensproeierinstallatie.', ex: [-1.5, 0.7, 1.4] }, [accu, upc, ecu, uch, ...horns, plusCable, massa, harness, washer]);
}

/* ============================ de hele auto ============================ */
function buildCar() {
  const wheels = A('Wielen', { d: 'Vier lichtmetalen wielen met banden 225/45 R18 en bandenspanningssensoren in de ventielen. Maat: 18 inch (UK Initiale Lux standaard; voor een Nederlandse Initiale Paris van 2011 is 17 inch even goed mogelijk).', ex: [0, 0, 0] },
    [[1, true], [-1, true], [1, false], [-1, false]].map(([s, f]) => buildWheel(s, f)));
  const chassis = A('Onderstel', { d: 'Vooras met stuurinrichting, achteras, de vier wielen (225/45 R18; 18 inch is de maat van de UK Initiale Lux, voor een Nederlandse Initiale Paris van 2011 is 17 inch even goed mogelijk) en het remsysteem.', ex: [0, -0.4, 0] },
    [buildFrontAxle(), buildRearAxle(), wheels, buildBrakeSystem()]);
  const car = A('Renault Laguna III', {
    d: 'Renault Laguna III hatchback (fase 2, 2011) in Initiale Paris-uitvoering, zilvergrijs metallic (Gris Platine), met de 2,0 Turbo F4Rt-motor, zestraps automaat en elektrisch panoramadak. Klik op een onderdeel om het uit te klappen, dubbelklik om er direct naartoe te gaan, rechtsklik of houd vast om weer in te klappen.',
    spec: [['Uitvoering', 'Initiale Paris (fase 2)'], ['Carrosserie', '5-deurs hatchback'], ['Motor', '2,0 Turbo F4Rt, 125 kW (170 pk)'], ['Koppel', '270 Nm bij 3.250 tpm'], ['Transmissie', '6-traps automaat'], ['Topsnelheid', '220 km/h'], ['0–100 km/h', '9,2 s'], ['Verbruik (gecomb.)', '8,7 l/100 km'], ['CO₂', '201 g/km'], ['Emissienorm', 'Euro 5'], ['Tankinhoud', '66 l'], ['L × B × H', '4.695 × 1.811 × 1.445 mm'], ['Wielbasis', '2.756 mm']],
  }, [buildBody(), buildInterior(), buildPowertrain(), chassis, buildCooling(), buildExhaust(), buildFuel(), buildElectrical()]);
  // keuzes voor de eerste twee uitklapniveaus (vectoren in het autoframe, in meters bij 100 %)
  const set = (name, v) => { const n = car.kids.find(k => k.name === name) || chassis.kids.find(k => k.name === name); if (n) n.ex = V3(...v); };
  set('Carrosserie', [0, 1.9, 0.1]);
  set('Interieur', [0, 0.85, -0.2]);
  set('Aandrijflijn', [0, 0.45, 1.25]);
  set('Onderstel', [0, -0.55, 0]);
  set('Koeling en luchtinlaat', [0, 0.25, 2.0]);
  set('Uitlaatsysteem', [0.4, -1.5, -0.6]);
  set('Brandstofsysteem', [-0.75, -0.95, -0.3]);
  set('Elektrisch systeem', [0.4, 0.6, 0.9]);
  set('Vooras en stuurinrichting', [0, -0.4, 0.3]);
  set('Achteras', [0, -0.4, -0.3]);
  set('Wielen', [0, 0.5, 0]);
  set('Remsysteem', [0, 0.15, 0]);
  return car;
}
