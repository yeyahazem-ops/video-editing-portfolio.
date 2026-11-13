// Bubbly Tales · 3D · «How Deep Is the Ocean?» — a real 3D scene (three.js) rendered per frame and composited
// under a 2D HUD. Everything is a pure function of t. One continuous descent from the surface to Challenger Deep.
(function () {
  const G = globalThis.G, S = globalThis.SCORE, Studio = globalThis.Studio, T3 = globalThis.THREE;
  const W = G.W, H = G.H, TAU = Math.PI * 2, INK = '#0A0F1E', ST = S.ST, ev = S.ev;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, k) => a + (b - a) * k;
  const sstep = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
  const outBack = (k, s = 1.8) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
  const pop = (t, t0, d = 0.3, s = 2.0) => (t < t0 ? 0 : outBack(clamp((t - t0) / d), s));
  const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  // ---------- the descent: world Y as the integral of a speed profile (table, so it is a pure function of t) ----------
  const V = 4.3, DT = 1 / 120, TAB = [0];
  const speed = (t) => V * sstep(ev.dive, ev.dive + 1.4, t) * (1 - sstep(ev.land - 2.2, ev.land, t));
  for (let i = 1; i <= Math.ceil((S.DURATION + 1) / DT); i++) TAB.push(TAB[i - 1] + speed((i - 0.5) * DT) * DT);
  const Y = (t) => { const f = clamp(t, 0, S.DURATION) / DT, i = Math.floor(f); return lerp(TAB[i], TAB[Math.min(TAB.length - 1, i + 1)], f - i); };
  const YF = Y(ev.land); // the floor
  const PTS = [[0, 0], ...ST.map((s) => [Y(s.t), s.depth]), [YF, S.BOTTOM]];
  const depthAt = (y) => { for (let i = 1; i < PTS.length; i++) if (y <= PTS[i][0]) return lerp(PTS[i - 1][1], PTS[i][1], (y - PTS[i - 1][0]) / (PTS[i][0] - PTS[i - 1][0])); return S.BOTTOM; };

  // ---------- three.js scene ----------
  let R, scene, cam, sub, prop, amb, key, snow, snowBase, shafts, surface, bubbles, dust, headCone, LOGO;
  const upd = []; // per-station updaters
  const mat = (color, o = {}) => new T3.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, metalness: 0, ...o });
  const mesh = (geo, m, p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) => { const x = new T3.Mesh(geo, m); x.position.set(...p); x.rotation.set(...r); x.scale.set(...(typeof s === 'number' ? [s, s, s] : s)); return x; };
  const grp = (...kids) => { const g = new T3.Group(); kids.forEach((k) => g.add(k)); return g; };
  const sph = (r = 1, w = 12, h = 8) => new T3.SphereGeometry(r, w, h), cyl = (a, b, h, n = 10, hs = 1, open = false) => new T3.CylinderGeometry(a, b, h, n, hs, open), box = (x, y, z) => new T3.BoxGeometry(x, y, z), cone = (r, h, n = 8) => new T3.ConeGeometry(r, h, n);

  function makeSub() {
    const yel = mat(0xffc928), dark = mat(0x2a3350), g = grp(
      mesh(new T3.CapsuleGeometry(0.55, 1.5, 6, 14), yel, [0, 0, 0], [0, 0, Math.PI / 2]),
      mesh(cyl(0.3, 0.36, 0.5, 12), yel, [0.1, 0.62, 0]), mesh(cyl(0.05, 0.05, 0.5, 6), dark, [0.1, 1.0, 0]), mesh(box(0.22, 0.08, 0.08), dark, [0.2, 1.22, 0]),
      mesh(box(0.5, 0.06, 1.5), mat(0xe0a010), [-0.9, 0, 0]), mesh(box(0.5, 0.7, 0.06), mat(0xe0a010), [-0.95, 0.2, 0]),
      mesh(cyl(0.58, 0.58, 0.12, 14), mat(0xe0a010), [0.35, 0, 0], [0, 0, Math.PI / 2]));
    for (const x of [-0.35, 0.2, 0.75]) g.add(mesh(sph(0.2, 10, 8), mat(0x9fe8ff, { emissive: 0x58c8ff, emissiveIntensity: 0.9 }), [x, 0.08, 0.5], [0, 0, 0], [1, 1, 0.45]));
    g.add(mesh(sph(0.16, 8, 6), mat(0xffffff, { emissive: 0xfff2b0, emissiveIntensity: 2 }), [1.28, -0.05, 0]));
    prop = grp(mesh(box(0.06, 0.9, 0.16), dark), mesh(box(0.06, 0.16, 0.9), dark)); prop.position.set(-1.38, 0, 0); g.add(prop);
    headCone = mesh(cone(1.5, 6.5, 16), new T3.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: 0.1, blending: T3.AdditiveBlending, depthWrite: false, side: T3.DoubleSide }), [4.5, -0.05, 0], [0, 0, Math.PI / 2]); g.add(headCone);
    const pl = new T3.PointLight(0xfff0c0, 1.3, 16, 1.5); pl.position.set(2.2, 0.4, 1.5); g.add(pl);
    return g;
  }
  function makeDiver(lamp) {
    const suit = mat(0x1d2536), g = grp(mesh(new T3.CapsuleGeometry(0.22, 0.75, 4, 8), suit, [0, 0, 0], [0, 0, Math.PI / 2]), mesh(sph(0.2, 8, 6), mat(0xffd7b0), [0.72, 0.05, 0]),
      mesh(box(0.16, 0.1, 0.34), mat(0x66d9ff, { emissive: 0x2288aa }), [0.82, 0.08, 0]), mesh(cyl(0.11, 0.11, 0.6, 8), mat(0xffb400), [0.05, 0.3, 0], [0, 0, Math.PI / 2]));
    const legs = [-1, 1].map((s) => { const l = grp(mesh(cyl(0.08, 0.07, 0.8, 6), suit, [-0.4, 0, 0], [0, 0, Math.PI / 2]), mesh(box(0.5, 0.04, 0.24), mat(0xff5a4e), [-1.0, 0, 0])); l.position.set(-0.4, 0, s * 0.12); g.add(l); return l; });
    for (const s of [-1, 1]) g.add(mesh(cyl(0.06, 0.06, 0.6, 6), suit, [0.5, -0.2, s * 0.26], [0, 0, 1.0]));
    if (lamp) { const pl = new T3.PointLight(0xfff0c0, 1.2, 9, 1.5); pl.position.set(1.4, 0, 0.6); g.add(pl, mesh(sph(0.07, 6, 4), mat(0xffffff, { emissive: 0xfff2b0, emissiveIntensity: 2 }), [0.9, 0.2, 0.1])); }
    g.userData = { legs }; return g;
  }
  const swimDiver = (d, t) => { d.userData.legs.forEach((l, i) => (l.rotation.z = 0.35 * Math.sin(t * 5 + i * Math.PI))); d.rotation.z = 0.06 * Math.sin(t * 2.5); };
  function makeFish(n, color) { const im = new T3.InstancedMesh(cone(0.11, 0.42, 5), mat(color, { emissive: color, emissiveIntensity: 0.15 }), n); im.userData.n = n; im.frustumCulled = false; return im; }
  const _m = new T3.Matrix4(), _q = new T3.Quaternion(), _e = new T3.Euler(), _p = new T3.Vector3(), _s = new T3.Vector3(1, 1, 1);
  function swimFish(im, t, dir = 1, seed = 0) { for (let i = 0; i < im.userData.n; i++) { const a = rnd(i + seed) * TAU, r = 0.4 + rnd(i + seed + 9) * 1.6; _p.set(Math.cos(a) * r * 1.6 + 0.2 * Math.sin(t * 2 + i), Math.sin(a) * r * 0.7 + 0.15 * Math.sin(t * 3 + i * 1.7), (rnd(i + seed + 4) - 0.5) * 2); _e.set(0, 0.25 * Math.sin(t * 9 + i), dir > 0 ? -Math.PI / 2 : Math.PI / 2); _q.setFromEuler(_e); _m.compose(_p, _q, _s); im.setMatrixAt(i, _m); } im.instanceMatrix.needsUpdate = true; }
  function makeWhale(color, belly, len = 5, boxy = false) {
    const body = mat(color), g = grp(mesh(sph(1, 16, 10), body, [0, 0, 0], [0, 0, 0], [len, 1.05, 1.15]), mesh(sph(1, 14, 8), mat(belly), [0.3, -0.28, 0], [0, 0, 0], [len * 0.82, 0.86, 1.02]));
    if (boxy) g.add(mesh(new T3.CapsuleGeometry(0.95, len * 0.7, 4, 10), body, [-len * 0.45, 0.15, 0], [0, 0, Math.PI / 2]), mesh(box(len * 0.6, 0.12, 0.3), mat(0xd8dde8), [-len * 0.5, -0.95, 0]));
    const tail = grp(mesh(cone(0.55, 2.2, 8), body, [1.0, 0, 0], [0, 0, -Math.PI / 2]), mesh(box(0.7, 0.12, 2.6), body, [2.1, 0, 0]), mesh(cone(0.5, 1.1, 4), body, [2.2, 0, 0.9], [Math.PI / 2, 0, 0.4], [1, 1, 0.25]), mesh(cone(0.5, 1.1, 4), body, [2.2, 0, -0.9], [-Math.PI / 2, 0, 0.4], [1, 1, 0.25])); tail.position.set(len * 0.82, 0, 0); g.add(tail);
    for (const s of [-1, 1]) g.add(mesh(box(1.5, 0.1, 0.6), body, [-len * 0.35, -0.5, s * 1.15], [s * 0.5, s * 0.5, -0.2]));
    for (const s of [-1, 1]) g.add(mesh(sph(0.09, 6, 4), mat(0x0a0a12), [-len * (boxy ? 0.62 : 0.72), 0.12, s * (boxy ? 0.93 : 0.72)]));
    g.userData.tail = tail; return g;
  }
  function makeJelly(color) { const m = mat(color, { emissive: color, emissiveIntensity: 1.1, transparent: true, opacity: 0.85 }), g = grp(mesh(new T3.SphereGeometry(0.45, 12, 8, 0, TAU, 0, Math.PI / 2), m)); for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; g.add(mesh(cyl(0.025, 0.012, 1.1, 4), m, [Math.cos(a) * 0.25, -0.55, Math.sin(a) * 0.25])); } return g; }
  function makeBurj() { const g = new T3.Group(), m = mat(0xb9c6d8, { metalness: 0.3, roughness: 0.5, emissive: 0x223a55, emissiveIntensity: 0.5 }); const tiers = [[0.06, 2.4], [0.16, 2.2], [0.3, 2.2], [0.46, 2.2], [0.64, 2.2], [0.84, 2.2], [1.05, 2.4]]; let y = 0; tiers.forEach(([r, h], i) => { g.add(mesh(cyl(r * 1.25, r, h, 3 + (i > 2 ? 3 : 0)), m, [0, y + h / 2, 0], [0, i * 0.5, 0])); y += h; }); for (let i = 0; i < 26; i++) { const yy = 3 + rnd(i) * 12, r = 0.2 + (yy / 15.8) * 0.95, a = rnd(i + 5) * TAU; g.add(mesh(box(0.08, 0.14, 0.08), mat(0xffe9a0, { emissive: 0xffd060, emissiveIntensity: 1.6 }), [Math.cos(a) * r, yy, Math.sin(a) * r])); } return g; } // tip at y=0, widening upward: upside down
  function makeAngler() {
    const skin = mat(0x4a2630, { emissive: 0x1a0508 }), g = grp(mesh(sph(1, 12, 9), skin, [0, 0, 0], [0, 0, 0], [1.25, 1.0, 0.9]), mesh(cone(0.5, 1.0, 5), skin, [1.5, 0, 0], [0, 0, -Math.PI / 2], [1, 1, 0.3]), mesh(sph(0.16, 8, 6), mat(0xe8f6ff, { emissive: 0xbfe8ff, emissiveIntensity: 1.2 }), [-0.7, 0.42, 0.62]), mesh(sph(0.07, 6, 4), mat(0x05050a), [-0.78, 0.43, 0.75]));
    const jaw = grp(mesh(sph(0.9, 10, 6), skin, [0, 0, 0], [0, 0, 0], [1.0, 0.35, 0.82])); for (let i = 0; i < 9; i++) { const a = -1.2 + i * 0.3; jaw.add(mesh(cone(0.06, 0.34, 4), mat(0xf3f6ff, { emissive: 0x8899aa }), [-Math.cos(a) * 0.85, 0.22, Math.sin(a) * 0.7])); g.add(mesh(cone(0.06, 0.3, 4), mat(0xf3f6ff, { emissive: 0x8899aa }), [-0.35 - Math.cos(a) * 0.82, -0.12, Math.sin(a) * 0.72], [Math.PI, 0, 0])); } jaw.position.set(-0.35, -0.5, 0); g.add(jaw);
    const rod = mesh(new T3.TorusGeometry(0.75, 0.035, 5, 12, Math.PI * 0.75), skin, [-0.55, 0.85, 0], [0, 0, 0.6]), bulb = mesh(sph(0.16, 8, 6), mat(0xd9fff0, { emissive: 0x7dffd0, emissiveIntensity: 3 }), [-1.42, 0.9, 0]), pl = new T3.PointLight(0x7dffd0, 1.8, 8, 1.6); pl.position.copy(bulb.position); g.add(rod, bulb, pl); g.userData = { jaw, pl }; return g;
  }
  function makeSquid() { const m = mat(0xc23b4a, { emissive: 0x3a0a10 }), g = grp(mesh(cone(0.5, 2.4, 8), m, [1.2, 0, 0], [0, 0, -Math.PI / 2]), mesh(sph(0.5, 8, 6), m), mesh(sph(0.2, 8, 6), mat(0xf6f6e8, { emissive: 0x888866 }), [-0.1, 0.1, 0.42]), mesh(sph(0.1, 6, 4), mat(0x080808), [-0.12, 0.1, 0.56])); const arms = []; for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU, arm = mesh(cyl(0.07, 0.02, 2.6, 5), m, [-1.5, Math.sin(a) * 0.2, Math.cos(a) * 0.2], [0, 0, Math.PI / 2]); arms.push(arm); g.add(arm); } g.userData.arms = arms; return g; }
  function makeTitanic() {
    const rust = mat(0x5a3a2a), dark = mat(0x22262e), g = grp(mesh(box(8, 1.1, 1.5), dark), mesh(box(8, 0.35, 1.52), rust, [0, -0.72, 0]), mesh(cone(0.75, 1.6, 4), dark, [-4.75, 0, 0], [0, Math.PI / 4, Math.PI / 2], [1, 1, 0.75]), mesh(box(5.2, 0.5, 1.2), mat(0xcfc8b8), [0.3, 0.8, 0]), mesh(box(4.4, 0.35, 1.0), mat(0xcfc8b8), [0.5, 1.2, 0]), mesh(cyl(0.04, 0.04, 1.8, 5), rust, [-3.3, 1.4, 0], [0, 0, -0.15]));
    for (let i = 0; i < 4; i++) g.add(mesh(cyl(0.26, 0.28, 1.2, 10), mat(0xd9903a), [-1.2 + i * 1.15, 1.9, 0], [0, 0, 0.12]), mesh(cyl(0.27, 0.27, 0.25, 10), dark, [-1.27 + i * 1.15, 2.45, 0], [0, 0, 0.12]));
    for (let i = 0; i < 14; i++) g.add(mesh(box(0.14, 0.14, 0.02), mat(0xffe9a0, { emissive: 0xffc860, emissiveIntensity: 0.6 }), [-3.2 + i * 0.5, 0.15, 0.77]));
    const rock = mesh(new T3.IcosahedronGeometry(1, 1), mat(0x1c2230), [0.5, -2.6, -0.5], [0.3, 0.2, 0], [5.5, 1.7, 3.2]), pl = new T3.PointLight(0xffe0b0, 1.1, 14, 1.4); pl.position.set(-1, 3, 4); return grp(g, rock, pl);
  }
  function makeSnailfish() { const m = mat(0xffc9d6, { emissive: 0xff9fb5, emissiveIntensity: 0.5, transparent: true, opacity: 0.85 }); return grp(mesh(sph(0.34, 10, 8), m, [0, 0, 0], [0, 0, 0], [1.2, 1, 0.9]), mesh(cone(0.3, 1.5, 6), m, [0.95, 0, 0], [0, 0, -Math.PI / 2], [1, 1, 0.5]), mesh(sph(0.05, 5, 4), mat(0x101018), [-0.28, 0.1, 0.24])); }
  function makeEverest() { const g = grp(mesh(cone(6, 12, 6), mat(0x2f3644), [0, 6, 0], [Math.PI, 0.3, 0]), mesh(cone(1.52, 3, 6), mat(0xe8eef8, { emissive: 0x39424f, emissiveIntensity: 0.5 }), [0, 1.5, 0], [Math.PI, 0.3, 0]), mesh(cone(2.6, 4.5, 5), mat(0x272d39), [3.4, 9.75, 1.2], [Math.PI, 1, 0]), mesh(cone(2.2, 3.6, 5), mat(0x272d39), [-3.2, 10.2, 1.5], [Math.PI, 2, 0]), mesh(box(14, 3, 8), mat(0x1f2530), [0, 13.4, 0])); const pl = new T3.PointLight(0xbfd8ff, 0.8, 26, 1.2); pl.position.set(-3, 5, 8); g.add(pl); return g; } // tip at y=0
  function makeFloor() {
    const geo = new T3.PlaneGeometry(90, 70, 36, 28); geo.rotateX(-Math.PI / 2); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, 0.7 * Math.sin(x * 0.5) * Math.cos(z * 0.4) + 0.5 * (rnd(i) - 0.5) + Math.pow(Math.abs(x) / 9, 2.2) * 3); } geo.computeVertexNormals();
    const g = grp(mesh(geo, mat(0x3d352f)), mesh(new T3.IcosahedronGeometry(1, 0), mat(0x3a3430), [-3, 0.3, -2], [1, 2, 0], [1.2, 0.8, 1]), mesh(new T3.IcosahedronGeometry(1, 0), mat(0x3a3430), [3.5, 0.2, -4], [0, 1, 2], [0.9, 0.6, 1.1]), mesh(new T3.IcosahedronGeometry(1, 0), mat(0x3a3430), [2.4, 0.1, 1.5], [2, 1, 0], [0.5, 0.35, 0.5]));
    const pl = new T3.PointLight(0xfff0c8, 1.0, 20, 1.3); pl.position.set(2, 3.5, 3); g.add(pl); return g;
  }

  function build() {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    R = new T3.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true }); R.outputEncoding = T3.sRGBEncoding;
    scene = new T3.Scene(); scene.fog = new T3.Fog(0x1fa3d8, 9, 46); scene.background = new T3.Color(0x1fa3d8);
    cam = new T3.PerspectiveCamera(50, W / H, 0.1, 120);
    amb = new T3.AmbientLight(0xbfe6ff, 0.9); key = new T3.DirectionalLight(0xffffff, 1.1); key.position.set(3, 10, 6); scene.add(amb, key);
    sub = makeSub(); scene.add(sub);
    surface = mesh(new T3.PlaneGeometry(120, 120), new T3.MeshBasicMaterial({ color: 0xd8f6ff, side: T3.DoubleSide }), [0, 4.2, 0], [Math.PI / 2, 0, 0]); scene.add(surface);
    shafts = new T3.Group(); for (let i = 0; i < 7; i++) shafts.add(mesh(cyl(0.3 + rnd(i) * 0.5, 1.6 + rnd(i + 3) * 1.6, 40, 8, 1, true), new T3.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.085, blending: T3.AdditiveBlending, depthWrite: false, side: T3.DoubleSide, fog: false }), [-7 + i * 2.4 + rnd(i + 7), -15, -5 - rnd(i + 2) * 6], [0, 0, 0.12 + 0.06 * (rnd(i) - 0.5)])); scene.add(shafts);
    const N = 520, pos = new Float32Array(N * 3); snowBase = []; for (let i = 0; i < N; i++) snowBase.push([(rnd(i) - 0.5) * 24, rnd(i + 1000) * 30, (rnd(i + 2000) - 0.5) * 22 + 1]);
    const sg = new T3.BufferGeometry(); sg.setAttribute('position', new T3.BufferAttribute(pos, 3)); snow = new T3.Points(sg, new T3.PointsMaterial({ color: 0xdff4ff, size: 0.09, transparent: true, opacity: 0.75, depthWrite: false })); snow.frustumCulled = false; scene.add(snow);
    bubbles = new T3.InstancedMesh(sph(0.07, 6, 4), new T3.MeshBasicMaterial({ color: 0xe8fbff, transparent: true, opacity: 0.7 }), 18); bubbles.frustumCulled = false; scene.add(bubbles);
    dust = new T3.InstancedMesh(sph(0.5, 7, 5), new T3.MeshBasicMaterial({ color: 0x9a8a78, transparent: true, opacity: 0.35, depthWrite: false }), 16); dust.frustumCulled = false; scene.add(dust);

    const at = (id) => { const s = ST.find((x) => x.id === id); return { t: s.t, y: -Y(s.t) }; };
    const add = (id, g, fn) => { const a = at(id); scene.add(g); upd.push((t) => { g.visible = Math.abs(-Y(t) - a.y) < 34; if (g.visible) fn(t - a.t, t, a.y); }); };
    { const d1 = makeDiver(), d2 = makeDiver(), f = makeFish(36, 0xffa63d); add('diver', grp(d1, d2, f), (u, t, y) => { d1.position.set(-2.2 + u * 0.35, y + 0.4, -1.2); d2.position.set(-3.0 + u * 0.35, y + 1.6, -3); d1.scale.setScalar(1.15); swimDiver(d1, t); swimDiver(d2, t + 1); f.position.set(2.8 - u * 0.9, y + 2.4, -4); swimFish(f, t, -1); }); }
    { const w = makeWhale(0x4a6fa5, 0xc4d4ea, 5), f = makeFish(24, 0xff6b8a); add('whale', grp(w, f), (u, t, y) => { w.position.set(2.5 - u * 2.4, y + 0.8 + 0.3 * Math.sin(t * 0.9), -7); w.rotation.z = 0.05 * Math.sin(t * 1.2); w.userData.tail.rotation.z = 0.22 * Math.sin(t * 1.8); f.position.set(-2.4 + u * 0.8, y - 2.2, -2); swimFish(f, t, 1, 50); }); }
    { const cols = [0xff7ad9, 0x7ad9ff, 0xffd27a, 0xff7ad9, 0x9d7aff], js = cols.map(makeJelly); add('twilight', grp(...js), (u, t, y) => js.forEach((j, i) => { j.position.set([-2.4, 2.3, -1.2, 2.9, 0.6][i], y + [0.8, -0.6, -2.4, 2.4, 3.2][i] + u * 0.5 + 0.25 * Math.sin(t * 1.5 + i), [-1.5, -2.5, 0.5, -5, -6][i]); const k = 1 + 0.18 * Math.sin(t * 3 + i * 1.3); j.scale.set(1.35 / Math.sqrt(k), k * 1.1, 1.35 / Math.sqrt(k)); })); }
    { const d = makeDiver(true), rope = mesh(cyl(0.025, 0.025, 60, 4), mat(0xf2f2e6, { emissive: 0x777766 })); add('record', grp(d, rope), (u, t, y) => { d.position.set(-2.1, y + 0.2 + 0.1 * Math.sin(t * 2), -0.8); d.rotation.z = -1.25; d.scale.setScalar(1.25); d.userData.legs.forEach((l, i) => (l.rotation.z = 0.2 * Math.sin(t * 3 + i * Math.PI))); rope.position.set(-2.55, y + 28, -0.8); }); }
    { const b = makeBurj(); add('burj', b, (u, t, y) => { b.position.set(2.4, y - 4.2, -4.5); b.scale.setScalar(0.62); b.rotation.y = t * 0.12; }); }
    { const a = makeAngler(); add('angler', a, (u, t, y) => { a.position.set(-2.3 + 0.25 * u, y + 0.2 + 0.2 * Math.sin(t * 1.4), -0.5); a.rotation.y = Math.PI + 0.5 + 0.12 * Math.sin(t); a.scale.setScalar(1.05); a.userData.jaw.rotation.z = 0.12 + 0.12 * Math.sin(t * 2.2); a.userData.pl.intensity = 1.6 + 0.6 * Math.sin(t * 5); }); }
    { const w = makeWhale(0x5c6470, 0x8a93a0, 4.2, true), q = makeSquid(), pl = new T3.PointLight(0xbfd8ff, 1.0, 22, 1.2); add('sperm', grp(w, q, pl), (u, t, y) => { w.position.set(4.6 - u * 2.2, y + 1.2, -7); w.rotation.z = 0.12; w.userData.tail.rotation.z = 0.25 * Math.sin(t * 2.2); q.position.set(-0.6 - u * 2.5, y - 0.6, -5.5); q.rotation.z = 0.15; q.userData.arms.forEach((a, i) => { a.rotation.y = 0.25 * Math.sin(t * 5 + i); }); pl.position.set(0, y + 3, 4); }); }
    { const s = makeTitanic(); add('titanic', s, (u, t, y) => { s.position.set(1.0, y - 0.6, -8); s.rotation.set(0.04, 0.35, 0.05); }); }
    { const fs = [0, 1, 2].map(makeSnailfish); add('hadal', grp(...fs), (u, t, y) => fs.forEach((f, i) => { f.position.set([-2.2, 2.0, -0.6][i] + u * 0.3 * (i % 2 ? -1 : 1), y + [0.6, -0.8, 2.6][i] + 0.2 * Math.sin(t * 1.3 + i), [-0.5, -2, -4][i]); f.rotation.y = (i % 2 ? 0 : Math.PI) + 0.3 * Math.sin(t * 3 + i); f.scale.setScalar(1.5); })); }
    { const e = makeEverest(); add('everest', e, (u, t, y) => { e.position.set(-2.8, y - 4.6, -9); }); }
    { const f = makeFloor(); f.position.set(0, -YF - 1.25, -2); scene.add(f); upd.push((t) => { f.visible = YF - Y(t) < 40; }); }
  }

  const FOGS = [[0, 0x1fa3d8], [100, 0x1784c4], [200, 0x0e5c9a], [600, 0x093a70], [1000, 0x051f48], [3800, 0x030f26], [8000, 0x020916], [10935, 0x02060f]];
  const cA = new T3.Color(), cB = new T3.Color();
  function fogAt(d) { for (let i = 1; i < FOGS.length; i++) if (d <= FOGS[i][0]) { cA.setHex(FOGS[i - 1][1]); cB.setHex(FOGS[i][1]); return cA.lerp(cB, (d - FOGS[i - 1][0]) / (FOGS[i][0] - FOGS[i - 1][0])); } return cA.setHex(0x02060f); }

  function render3d(t) {
    const y = Y(t), d = depthAt(y), sy = -y, landed = t >= ev.land, la = t - ev.land;
    const col = fogAt(d); scene.fog.color.copy(col); scene.background.copy(col);
    const dark = clamp(Math.log10(1 + d / 30) / 2.4); amb.intensity = lerp(0.95, 0.3, dark); key.intensity = lerp(1.15, 0.12, dark); amb.color.setHex(d < 200 ? 0xbfe6ff : 0x7f9fd8);
    shafts.visible = d < 260; shafts.children.forEach((s, i) => (s.material.opacity = 0.085 * (1 - sstep(60, 250, d)) * (0.7 + 0.3 * Math.sin(t * 0.8 + i * 2))));
    const tilt = -0.42 * sstep(ev.dive, ev.dive + 1.2, t) * (1 - sstep(ev.land - 2.4, ev.land - 0.2, t));
    const bounce = landed ? 0.18 * Math.exp(-la * 5) * Math.abs(Math.sin(la * 9)) : 0;
    sub.position.set(0.35 * Math.sin(t * 0.5), sy + 0.12 * Math.sin(t * 1.7) * (landed ? 0.2 : 1) + bounce, 0); sub.rotation.set(0.05 * Math.sin(t * 0.9), -0.35 + 0.1 * Math.sin(t * 0.3), tilt);
    prop.rotation.x = t * 18 * (landed ? Math.max(0.1, 1 - la) : 1); headCone.material.opacity = 0.03 + 0.05 * dark;
    const settle = sstep(ev.land - 1.5, ev.land + 2.5, t), back = sstep(ev.twist - 0.4, ev.twist + 3, t), shake = landed ? 0.22 * Math.exp(-la * 4.5) : 0;
    cam.position.set(1.3 * Math.sin(t * 0.21) + 1.2 * settle, sy + 1.7 - 0.6 * settle + 4.5 * back + shake * Math.sin(t * 61), 12.5 - 2.6 * settle + 7 * back + shake * Math.sin(t * 47));
    cam.lookAt(0.3 * settle, sy - 0.7 + 0.5 * settle + 0.6 * back, -2);
    const p = snow.geometry.attributes.position; for (let i = 0; i < snowBase.length; i++) { const b = snowBase[i], yy = ((b[1] + y * 0.985 + t * 0.15) % 30 + 30) % 30; p.setXYZ(i, b[0] + 0.3 * Math.sin(t * 0.6 + i), sy + yy - 15, b[2]); } p.needsUpdate = true; snow.material.opacity = lerp(0.35, 0.8, dark);
    for (let i = 0; i < 18; i++) { const ph = ((t * 0.7 + rnd(i)) % 1), k = landed ? Math.max(0, 1 - la * 0.6) : 1; _p.set(sub.position.x - 1.3 + (rnd(i + 3) - 0.5) * 0.6 + 0.2 * Math.sin(t * 4 + i), sub.position.y + 0.3 + ph * 5, (rnd(i + 5) - 0.5) * 0.6); _s.setScalar(Math.max(0.0001, (0.5 + rnd(i + 8)) * (1 - ph * 0.5) * k)); _m.compose(_p, _q.identity(), _s); bubbles.setMatrixAt(i, _m); } bubbles.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU, r = landed ? 0.8 + 3.2 * (1 - Math.exp(-la * 1.6)) * (0.6 + rnd(i) * 0.6) : 0; _p.set(Math.cos(a) * r, -YF - 0.85 + 0.9 * (1 - Math.exp(-la)) * rnd(i + 4), Math.sin(a) * r * 0.8); _s.setScalar(landed ? Math.max(0.0001, (0.5 + 1.6 * (1 - Math.exp(-la * 1.2))) * Math.max(0, 1 - la / 4.5)) : 0.0001); _m.compose(_p, _q.identity(), _s); dust.setMatrixAt(i, _m); } dust.instanceMatrix.needsUpdate = true; _s.set(1, 1, 1);
    surface.visible = d < 120;
    upd.forEach((f) => f(t));
    R.render(scene, cam);
  }

  // ---------- 2D HUD ----------
  function text(c, s, x, y, size, fill, o = {}) {
    c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot); const k = o.scale ?? 1; if (k <= 0.001) { c.restore(); return; } c.scale(k, k);
    c.font = `${o.weight || 700} ${size}px ${o.font || 'Baloo'}`; c.textAlign = o.align || 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    if (o.maxW) { const w = c.measureText(s).width; if (w > o.maxW) c.scale(o.maxW / w, o.maxW / w); }
    if (o.alpha != null) c.globalAlpha = clamp(o.alpha);
    if (o.shadow) { c.lineWidth = o.lw ?? size * 0.16; c.strokeStyle = o.shadow; c.fillStyle = o.shadow; c.strokeText(s, size * 0.05, size * 0.08); c.fillText(s, size * 0.05, size * 0.08); }
    if (o.lw !== 0) { c.lineWidth = o.lw ?? size * 0.16; c.strokeStyle = o.stroke || INK; c.strokeText(s, 0, 0); }
    c.fillStyle = fill; c.fillText(s, 0, 0); c.restore();
  }
  const ZONES = [[200, 'SUNLIGHT ZONE', '#FFD23F', INK], [1000, 'TWILIGHT ZONE', '#5AA9FF', INK], [4000, 'MIDNIGHT ZONE', '#7B5CFF', '#FFFFFF'], [6000, 'THE ABYSS', '#3B3F8F', '#FFFFFF'], [1e9, 'THE TRENCHES', '#D7263D', '#FFFFFF']];
  function hud(c, t) {
    const y = Y(t), d = depthAt(y), a = 1 - sstep(ev.end - 0.5, ev.end, t); if (a <= 0) return; c.save(); c.globalAlpha = a;
    let g = c.createLinearGradient(0, 0, 0, 620); g.addColorStop(0, 'rgba(2,6,18,0.6)'); g.addColorStop(1, 'rgba(2,6,18,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 620);
    g = c.createLinearGradient(0, 1180, 0, H); g.addColorStop(0, 'rgba(2,6,18,0)'); g.addColorStop(0.45, 'rgba(2,6,18,0.62)'); g.addColorStop(1, 'rgba(2,6,18,0.8)'); c.fillStyle = g; c.fillRect(0, 1180, W, H - 1180);
    const landed = t >= ev.land, hit = ST.reduce((m, s) => Math.max(m, t >= s.t ? Math.exp(-(t - s.t) * 7) : 0), landed ? Math.exp(-(t - ev.land) * 4) : 0);
    const shown = d < 1000 ? Math.round(d) : Math.round(d / 5) * 5;
    text(c, 'DEPTH', 540, 262, 40, '#9FD8FF', { font: 'Inter', weight: 800, lw: 8, alpha: a });
    text(c, `${(landed ? S.BOTTOM : shown).toLocaleString('en-US')} m`, 540, 352, 128, landed ? '#FFD23F' : '#FFFFFF', { font: 'Bungee', weight: 400, lw: 20, scale: 1 + 0.1 * hit, shadow: '#0B2A55', alpha: a });
    const z = ZONES.find((q) => d < q[0]); c.font = '800 36px Inter'; const zw = c.measureText(z[1]).width + 56; c.beginPath(); c.roundRect(540 - zw / 2, 432, zw, 60, 30); c.fillStyle = z[2]; c.fill(); c.lineWidth = 6; c.strokeStyle = INK; c.stroke(); c.fillStyle = z[3]; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(z[1], 540, 464);
    const rx = 910, r0 = 600, r1 = 1150, k = y / YF; c.beginPath(); c.roundRect(rx - 7, r0, 14, r1 - r0, 7); c.fillStyle = 'rgba(255,255,255,0.22)'; c.fill(); c.beginPath(); c.roundRect(rx - 7, r0, 14, Math.max(14, (r1 - r0) * k), 7); c.fillStyle = '#FFD23F'; c.fill();
    ST.forEach((s) => { const yy = lerp(r0, r1, Y(s.t) / YF); c.beginPath(); c.arc(rx, yy, 6, 0, TAU); c.fillStyle = t >= s.t ? '#FFFFFF' : 'rgba(255,255,255,0.45)'; c.fill(); });
    c.beginPath(); c.arc(rx, lerp(r0, r1, k), 15, 0, TAU); c.fillStyle = '#FFD23F'; c.fill(); c.lineWidth = 6; c.strokeStyle = INK; c.stroke();
    const ha = 1 - sstep(2.5, 3.0, t); if (ha > 0) { const hs = (1 + 0.03 * Math.sin(t * 6)) * (1 + 0.25 * (1 - ha)); text(c, 'HOW DEEP', 540, 700, 150, '#FFFFFF', { font: 'Bungee', weight: 400, lw: 24, scale: hs, alpha: ha * a, shadow: '#0B2A55', rot: -0.03 }); text(c, 'IS THE OCEAN?', 540, 850, 112, '#FFD23F', { font: 'Bungee', weight: 400, lw: 20, scale: hs, alpha: ha * a, shadow: '#0B2A55', rot: -0.03 }); text(c, 'watch until the bottom ↓', 540, 1300, 54, '#FFFFFF', { lw: 10, alpha: ha * a }); }
    ST.forEach((s) => { const t0 = s.t - 0.7, t1 = s.t + 2.55; if (t < t0 || t > t1) return; const out = 1 - sstep(t1 - 0.3, t1, t); text(c, s.title, 540, 1325, 92, '#FFFFFF', { lw: 16, scale: pop(t, t0, 0.35, 2.2) * out, maxW: 860, shadow: '#0B2A55', alpha: a }); text(c, s.sub, 540, 1425, 48, '#FFD23F', { font: 'Inter', weight: 800, lw: 10, scale: pop(t, t0 + 0.25, 0.3, 1.6) * out, maxW: 860, alpha: a }); });
    if (landed && t < ev.twist - 0.2) { const o = 1 - sstep(ev.twist - 0.6, ev.twist - 0.2, t); text(c, 'CHALLENGER DEEP', 540, 1315, 96, '#FFFFFF', { lw: 16, scale: pop(t, ev.land + 0.15, 0.35, 2.4) * o, maxW: 860, shadow: '#0B2A55' }); text(c, 'the deepest point on Earth', 540, 1420, 52, '#FFD23F', { font: 'Inter', weight: 800, lw: 10, scale: pop(t, ev.land + 0.6, 0.3, 1.6) * o }); }
    if (landed && t < ev.land + 0.25) { c.fillStyle = `rgba(255,255,255,${0.5 * (1 - (t - ev.land) / 0.25)})`; c.fillRect(0, 0, W, H); }
    if (t >= ev.twist - 0.4) { const o = sstep(ev.twist - 0.4, ev.twist + 0.3, t); c.fillStyle = `rgba(2,6,18,${0.55 * o})`; c.fillRect(0, 560, W, 680); text(c, 'OVER 80%', 540, 730, 170, '#FFD23F', { font: 'Bungee', weight: 400, lw: 24, scale: pop(t, ev.twist, 0.35, 2.6), shadow: '#0B2A55', alpha: a }); text(c, 'OF THE OCEAN', 540, 890, 92, '#FFFFFF', { lw: 16, scale: pop(t, ev.twist + 0.7, 0.3, 2), alpha: a }); text(c, 'HAS NEVER BEEN EXPLORED', 540, 1000, 66, '#FFFFFF', { lw: 12, scale: pop(t, ev.twist + 1.2, 0.3, 2), maxW: 860, alpha: a }); text(c, 'What else is down there?', 540, 1130, 52, '#9FD8FF', { lw: 10, scale: pop(t, ev.twist + 2.2, 0.3, 1.6), font: 'Inter', weight: 800, alpha: a }); }
    c.restore();
  }
  function endCard(c, t) {
    const a = sstep(ev.end - 0.5, ev.end, t); if (a <= 0) return; c.save(); c.globalAlpha = a; c.fillStyle = '#131C3D'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 18; i++) { const p = ((t * 0.12 + rnd(i)) % 1), x = rnd(i + 3) * W + Math.sin(t + i) * 20, y = H + 100 - p * (H + 300); c.beginPath(); c.arc(x, y, 14 + rnd(i + 6) * 30, 0, TAU); c.lineWidth = 5; c.strokeStyle = `rgba(120,200,255,${0.35 * Math.sin(p * Math.PI)})`; c.stroke(); }
    const k = pop(t, ev.end + 0.1, 0.5, 1.8); if (LOGO && k > 0) { c.save(); c.translate(540, 760); c.scale(k, k); c.drawImage(LOGO, -430, -430, 860, 860); c.restore(); }
    text(c, 'FOLLOW FOR', 540, 1210, 80, '#FFFFFF', { scale: pop(t, ev.end + 0.6, 0.3), lw: 14 }); text(c, 'MORE SCIENCE!', 540, 1310, 96, '#FFD23F', { scale: pop(t, ev.end + 0.8, 0.3) * (1 + 0.03 * Math.sin(t * 6)), lw: 16, shadow: '#FF6B4A' }); c.restore();
  }
  Studio.film({ post: { vignette: 0.14, grain: 0, paper: 0 }, fadeOut: 0.4,
    async init() { await Studio.loadFont('Baloo', 'assets/baloo-700.woff2', 700); LOGO = await Studio.loadImage('assets/logo.png'); build(); },
    draw(ctx, t) { if (t < ev.end + 0.05) { render3d(t); ctx.drawImage(R.domElement, 0, 0, W, H); } hud(ctx, t); endCard(ctx, t); } });
})();
