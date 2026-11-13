// Bubbly Tales · 3D · «GTA 6 is 6 days away» — an ORIGINAL neon-coast city (three.js), flown through by one
// continuous camera, with a 2D HUD on top. No footage, logos or character art from the game: only facts.
// Every frame is a pure function of t; all times come from score.js (the measured narration).
(function () {
  const G = globalThis.G, S = globalThis.SCORE, Studio = globalThis.Studio, T3 = globalThis.THREE;
  const W = G.W, H = G.H, TAU = Math.PI * 2, INK = '#120A2E', L = S.L, ev = S.ev;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, k) => a + (b - a) * k;
  const sstep = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
  const outBack = (k, s = 1.8) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
  const pop = (t, t0, d = 0.3, s = 2.0) => (t < t0 ? 0 : outBack(clamp((t - t0) / d), s));
  const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  // ---------- the camera path: speed table (pure in t), slowing to a crawl while we orbit the heroes ----------
  const orbitK = (t) => sstep(L.leads.t - 0.5, L.leads.t + 0.7, t) * (1 - sstep(ev.end - 0.7, ev.end - 0.1, t));
  const V = 15, DT = 1 / 120, TAB = [0];
  const speed = (t) => (6 + (V - 6) * sstep(0, 2.5, t)) * (1 - 0.97 * orbitK(t));
  for (let i = 1; i <= Math.ceil((S.DURATION + 1) / DT); i++) TAB.push(TAB[i - 1] + speed((i - 0.5) * DT) * DT);
  const Zc = (t) => { const f = clamp(t, 0, S.DURATION) / DT, i = Math.floor(f); return -lerp(TAB[i], TAB[Math.min(TAB.length - 1, i + 1)], f - i); };
  const PO = { x: 0, y: 0, z: Zc(L.leads.t - 0.5) - 17 }; // the heroes' stage

  // ---------- three.js ----------
  let R, scene, cam, sky, sunM, LOGO, amb, dir; const upd = [];
  const mkTex = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new T3.CanvasTexture(c); t.encoding = T3.sRGBEncoding; t.anisotropy = 4; return t; };
  const mesh = (geo, m, p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) => { const x = new T3.Mesh(geo, m); x.position.set(...p); x.rotation.set(...r); x.scale.set(...(typeof s === 'number' ? [s, s, s] : s)); return x; };
  const grp = (...k) => { const g = new T3.Group(); k.forEach((x) => g.add(x)); return g; };
  const basic = (color, o = {}) => new T3.MeshBasicMaterial({ color, ...o });
  const std = (color, o = {}) => new T3.MeshStandardMaterial({ color, flatShading: true, roughness: 0.7, metalness: 0.1, ...o });
  const additive = (color, op = 0.5) => new T3.MeshBasicMaterial({ color, transparent: true, opacity: op, blending: T3.AdditiveBlending, depthWrite: false, fog: false, side: T3.DoubleSide });
  const FOG = 0xf2706a;

  function windows() {
    return mkTex(64, 64, (c, w, h) => { c.fillStyle = '#0c0624'; c.fillRect(0, 0, w, h); const cols = ['#ffd27a', '#ffe9a8', '#7be8ff', '#ff7ad9', '#fff6d8']; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { if (rnd(x * 7 + y * 13 + 3) < 0.38) continue; c.fillStyle = cols[Math.floor(rnd(x * 5 + y * 11) * cols.length)]; c.fillRect(x * 16 + 3, y * 16 + 3, 10, 9); } });
  }
  function building(x, z, w, d, h, mat) {
    const g = new T3.BoxGeometry(w, h, d), uv = g.attributes.uv;
    for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i, u = uv.getX(k), v = uv.getY(k); if (f < 2) uv.setXY(k, u * (d / 5), v * (h / 5)); else if (f > 3) uv.setXY(k, u * (w / 5), v * (h / 5)); else uv.setXY(k, 0.02, 0.02); }
    const b = new T3.Mesh(g, mat); b.position.set(x, h / 2, z); return b;
  }
  function palm(x, z, s, seed) {
    const g = new T3.Group(), dark = basic(0x14082e), lean = (rnd(seed) - 0.5) * 0.5;
    const trunk = mesh(new T3.CylinderGeometry(0.16 * s, 0.26 * s, 6.5 * s, 6), dark, [0, 3.25 * s, 0], [0, 0, lean * 0.3]); g.add(trunk);
    const top = new T3.Vector3(Math.sin(lean * 0.3) * -3.2 * s, 6.5 * s, 0);
    for (let i = 0; i < 7; i++) { const az = (i / 7) * TAU + seed, tilt = 1.05 + 0.3 * rnd(seed + i), len = 3.6 * s; const e = new T3.Euler(tilt, az, 0, 'YXZ'), q = new T3.Quaternion().setFromEuler(e), dirv = new T3.Vector3(0, 1, 0).applyQuaternion(q); const leaf = new T3.Mesh(new T3.ConeGeometry(0.42 * s, len, 4), dark); leaf.scale.set(1, 1, 0.22); leaf.quaternion.copy(q); leaf.position.copy(top).addScaledVector(dirv, len / 2); g.add(leaf); }
    g.position.set(x, 0, z); return g;
  }
  function car(color) {
    const g = grp(mesh(new T3.BoxGeometry(2.0, 0.7, 4.2), std(color, { emissive: color, emissiveIntensity: 0.12 }), [0, 0.55, 0]), mesh(new T3.BoxGeometry(1.7, 0.6, 2.0), std(0x2a1f60, { emissive: 0x3a2a90, emissiveIntensity: 0.5 }), [0, 1.15, -0.2]),
      mesh(new T3.BoxGeometry(0.5, 0.18, 0.1), basic(0xff2a5a), [-0.6, 0.65, 2.12]), mesh(new T3.BoxGeometry(0.5, 0.18, 0.1), basic(0xff2a5a), [0.6, 0.65, 2.12]),
      mesh(new T3.PlaneGeometry(3.4, 5.4), additive(color, 0.22), [0, 0.05, 0], [-Math.PI / 2, 0, 0]));
    return g;
  }
  function panel(w, h, draw, o = {}) { return mesh(new T3.PlaneGeometry(w, h), basic(0xffffff, { map: mkTex(Math.round(w * 160), Math.round(h * 160), draw), transparent: true, fog: false, side: T3.DoubleSide, ...o })); }
  const rrect = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };

  function build() {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    R = new T3.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true }); R.outputEncoding = T3.sRGBEncoding;
    scene = new T3.Scene(); scene.fog = new T3.Fog(FOG, 50, 430); cam = new T3.PerspectiveCamera(56, W / H, 0.1, 900);
    amb = new T3.AmbientLight(0xffa0d0, 0.9); dir = new T3.DirectionalLight(0xffc7a0, 1.2); dir.position.set(10, 22, -25); scene.add(amb, dir);
    // sky + sun (cam-relative, so they sit at infinity)
    sky = mesh(new T3.SphereGeometry(600, 24, 16), basic(0xffffff, { side: T3.BackSide, fog: false, map: mkTex(8, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); [[0, '#0b0630'], [0.16, '#2a0e66'], [0.32, '#a0238f'], [0.44, '#ff4f8b'], [0.5, '#ff9a5c'], [1, '#6a1a6a']].forEach(([k, col]) => g.addColorStop(k, col)); c.fillStyle = g; c.fillRect(0, 0, w, h); }) })); scene.add(sky);
    sunM = mesh(new T3.CircleGeometry(44, 56), basic(0xffffff, { transparent: true, fog: false, depthWrite: false, map: mkTex(256, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffee66'); g.addColorStop(0.55, '#ff9a4d'); g.addColorStop(1, '#ff2e93'); c.fillStyle = g; c.beginPath(); c.arc(w / 2, h / 2, w / 2, 0, TAU); c.fill(); c.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 7; i++) { const y = h * 0.5 + i * (h * 0.072); c.fillRect(0, y, w, 2 + i * 2.2); } }) })); scene.add(sunM);
    const halo = mesh(new T3.CircleGeometry(150, 40), additive(0xff4f8b, 0.28)); sunM.userData.halo = halo; scene.add(halo);
    // ground: road, sidewalks, sand, ocean
    const LEN = 1700, zc = -650;
    scene.add(mesh(new T3.PlaneGeometry(16, LEN), basic(0x140d30), [0, 0, zc], [-Math.PI / 2, 0, 0]), mesh(new T3.PlaneGeometry(60, LEN), basic(0x2a1550), [-38, -0.02, zc], [-Math.PI / 2, 0, 0]), mesh(new T3.PlaneGeometry(60, LEN), basic(0xe8b890), [37, -0.02, zc], [-Math.PI / 2, 0, 0]), mesh(new T3.PlaneGeometry(600, LEN), basic(0x2a1a78), [366, -0.3, zc], [-Math.PI / 2, 0, 0]));
    scene.add(mesh(new T3.PlaneGeometry(600, LEN), basic(0x2a1550), [-338, -0.04, zc], [-Math.PI / 2, 0, 0]));
    for (const [x, col] of [[-7.7, 0xff3d9a], [7.7, 0x3de8ff]]) scene.add(mesh(new T3.BoxGeometry(0.25, 0.15, LEN), basic(col), [x, 0.08, zc]));
    const dash = new T3.InstancedMesh(new T3.BoxGeometry(0.2, 0.05, 3), basic(0xfff2d0), 180), M = new T3.Matrix4(); for (let i = 0; i < 180; i++) { M.setPosition(0, 0.05, 30 - i * 9); dash.setMatrixAt(i, M); } scene.add(dash);
    // city (left) — window-lit blocks in 5 neon tints; a few rooftop signs
    const wt = windows(); wt.wrapS = wt.wrapT = T3.RepeatWrapping; const tints = [0xff9ad0, 0x9ae8ff, 0xffc89a, 0xc89aff, 0xffffff].map((c) => basic(c, { map: wt }));
    for (let i = 0, z = 40; z > -820; i++) { const w = 8 + rnd(i) * 7, d = 9 + rnd(i + 50) * 6, h = 9 + Math.pow(rnd(i + 90), 1.6) * 46; scene.add(building(-(12.5 + w / 2 + rnd(i + 7) * 4), z - d / 2, w, d, h, tints[i % 5])); if (rnd(i + 300) < 0.3) scene.add(mesh(new T3.BoxGeometry(w * 0.7, 0.6, 0.6), basic([0xff3d9a, 0x3de8ff, 0xffe45e][i % 3]), [-(12.5 + w / 2), h + 0.5, z - d / 2])); z -= d + 1.2 + rnd(i + 20) * 2; }
    for (let i = 0, z = 40; z > -820; i++) { const w = 7 + rnd(i + 400) * 5, d = 8 + rnd(i + 450) * 4, h = 14 + Math.pow(rnd(i + 470), 1.5) * 60; scene.add(building(-(52 + w / 2 + rnd(i + 5) * 12), z - d / 2, w, d, h, tints[(i + 2) % 5])); z -= d + 4 + rnd(i + 22) * 6; }
    // beach hotels on the right, low and pastel
    for (let i = 0, z = 20; z > -820; i++) { const w = 8 + rnd(i + 600) * 6, d = 9 + rnd(i + 650) * 5, h = 7 + rnd(i + 700) * 14; scene.add(building(14 + w / 2 + rnd(i + 9) * 4, z - d / 2, w, d, h, tints[(i + 1) % 5])); z -= d + 8 + rnd(i + 25) * 14; }
    // palms (silhouettes): both sidewalks + beach
    for (let i = 0, z = 36; z > -800; i++, z -= 9 + rnd(i) * 3) { scene.add(palm(-9.1, z, 1 + rnd(i + 5) * 0.4, i), palm(9.1, z - 4, 1 + rnd(i + 8) * 0.4, i + 40)); if (i % 3 === 0) scene.add(palm(17 + rnd(i) * 8, z - 2, 1.1, i + 90)); }
    // traffic that we overtake
    const cs = [0xff3d9a, 0x3de8ff, 0xfff2d0, 0xffe45e, 0xb06aff, 0xff7a3d].map(car); cs.forEach((c, i) => { scene.add(c); const z0 = -50 - i * 34, v = 5 + (i % 3) * 1.6, x = i % 2 ? 3.4 : -3.4; upd.push((t) => c.position.set(x, 0, z0 - v * t)); });

    // ----- stage props: calendar, consoles, monitor, price tags, heroes, gift -----
    const zAt = (id, dt = 0, ahead = 16) => Zc(L[id].t + dt) - ahead;
    { // calendar
      const z = zAt('date', 0.5, 16), g = grp(mesh(new T3.BoxGeometry(8, 8.8, 0.7), std(0xffffff, { emissive: 0x442266, emissiveIntensity: 0.3 })), mesh(new T3.BoxGeometry(8, 2.2, 0.8), std(0xff2e7a, { emissive: 0xff2e7a, emissiveIntensity: 0.5 }), [0, 3.3, 0.05]), panel(7.4, 6.3, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.textAlign = 'center'; c.fillStyle = '#120A2E'; c.font = '400 ' + h * 0.5 + 'px Bungee'; c.fillText('19', w / 2, h * 0.62); c.font = '400 ' + h * 0.13 + 'px Bungee'; c.fillStyle = '#ff2e7a'; c.fillText('NOVEMBER', w / 2, h * 0.88); }), panel(7, 1.7, (c, w, h) => { c.textAlign = 'center'; c.fillStyle = '#fff'; c.font = '400 ' + h * 0.55 + 'px Bungee'; c.fillText('2026', w / 2, h * 0.7); }));
      g.children[2].position.set(0, -0.6, 0.45); g.children[3].position.set(0, 3.3, 0.5); scene.add(g); upd.push((t) => { const k = pop(t, L.date.t + 0.45, 0.5, 2.2); g.visible = k > 0.001 && t < L.price.t; g.scale.setScalar(Math.max(0.001, k) * 0.8); g.position.set(0, 7.6 + 0.25 * Math.sin(t * 2), Zc(t) - 25); g.rotation.y = 0.35 * Math.sin(t * 1.1 - 0.5); });
    }
    { // two console-shaped slabs (generic) either side of the road
      const z = zAt('date', 1.4, 14), a = grp(mesh(new T3.BoxGeometry(1.3, 4.6, 2.6), std(0xf2f4ff, { emissive: 0x334466, emissiveIntensity: 0.25 })), mesh(new T3.BoxGeometry(1.0, 4.4, 2.3), std(0x1a1d3a, { emissive: 0x3a5cff, emissiveIntensity: 0.6 }), [0.42, 0, 0])), b = grp(mesh(new T3.BoxGeometry(3.4, 4.2, 3.4), std(0x15151b, { emissive: 0x0a2a0a, emissiveIntensity: 0.3 })), mesh(new T3.BoxGeometry(2.6, 0.2, 2.6), std(0x20ff6a, { emissive: 0x20ff6a, emissiveIntensity: 1.2 }), [0, 2.15, 0]));
      a.position.set(-6.5, 3, z); b.position.set(6.5, 3, z); scene.add(a, b); upd.push((t) => { const k = pop(t, ev.consoles, 0.45, 2.4); a.visible = b.visible = k > 0.001 && t < L.pc.t + 0.2; a.scale.setScalar(Math.max(0.001, k) * 0.8); b.scale.setScalar(Math.max(0.001, k) * 0.8); a.rotation.y = t * 0.9; b.rotation.y = -t * 0.9; a.position.set(-4.4, 4.4 + 0.3 * Math.sin(t * 2), Zc(t) - 24); b.position.set(4.4, 4.4 + 0.3 * Math.sin(t * 2 + 1), Zc(t) - 24); });
    }
    { // PC monitor with a question mark
      const z = zAt('pc', 0.2, 14), g = grp(mesh(new T3.BoxGeometry(6.4, 4, 0.4), std(0x15151b)), panel(5.9, 3.5, (c, w, h) => { c.fillStyle = '#0c0624'; c.fillRect(0, 0, w, h); c.textAlign = 'center'; c.fillStyle = '#ff3d6e'; c.font = '400 ' + h * 0.78 + 'px Bungee'; c.fillText('?', w / 2, h * 0.78); }), mesh(new T3.BoxGeometry(0.5, 1.2, 0.4), std(0x15151b), [0, -2.5, 0]), mesh(new T3.BoxGeometry(2.4, 0.2, 1.2), std(0x15151b), [0, -3.1, 0]));
      g.children[1].position.z = 0.25; g.position.set(0, 5, z); scene.add(g); upd.push((t) => { const k = pop(t, ev.pcx, 0.4, 2.4); g.visible = k > 0.001 && t < L.price.t - 0.1; g.scale.setScalar(Math.max(0.001, k) * 0.72); g.rotation.y = 0.25 * Math.sin(t * 1.5); g.position.set(0, 6 + 0.2 * Math.sin(t * 2), Zc(t) - 24); });
    }
    { // price tags
      const z = zAt('price', 1.2, 15), tag = (txt1, txt2, c1, c2) => grp(mesh(new T3.BoxGeometry(6.2, 3.4, 0.5), std(c1, { emissive: c1, emissiveIntensity: 0.55 })), panel(5.8, 3.0, (c, w, h) => { c.textAlign = 'center'; c.fillStyle = '#fff'; c.font = '400 ' + h * 0.42 + 'px Bungee'; c.fillText(txt1, w / 2, h * 0.52); c.font = '400 ' + h * 0.17 + 'px Bungee'; c.fillStyle = c2; c.fillText(txt2, w / 2, h * 0.84); })), a = tag('$79.99', 'STANDARD', 0xff2e7a, '#fff2d0'), b = tag('$99.99', 'ULTIMATE', 0xffb000, '#2a1450');
      a.children[1].position.z = 0.3; b.children[1].position.z = 0.3; a.position.set(-4.6, 4.2, z); b.position.set(4.6, 6.4, z - 2); scene.add(a, b);
      upd.push((t) => { const ka = pop(t, ev.tag1 - 0.15, 0.4, 2.4), kb = pop(t, ev.tag2 - 0.15, 0.4, 2.4); a.visible = ka > 0.001 && t < L.setting.t; b.visible = kb > 0.001 && t < L.setting.t; a.scale.setScalar(Math.max(0.001, ka) * 0.78); b.scale.setScalar(Math.max(0.001, kb) * 0.78); a.rotation.y = 0.4 * Math.sin(t * 1.3); b.rotation.y = 0.4 * Math.sin(t * 1.3 + 1.5); a.position.set(-2.6, 5.0 + 0.25 * Math.sin(t * 2), Zc(t) - 26); b.position.set(2.6, 8.6 + 0.25 * Math.sin(t * 2 + 1), Zc(t) - 28); });
    }
    { // the heroes on a neon stage (stylised silhouettes: no likeness of any game character)
      const stage = grp(mesh(new T3.CylinderGeometry(5.2, 5.4, 0.5, 40), std(0x1a1040, { emissive: 0x3a1a90, emissiveIntensity: 0.5 }), [0, 0.25, 0]), mesh(new T3.TorusGeometry(5.3, 0.1, 6, 60), basic(0xff3d9a), [0, 0.55, 0], [Math.PI / 2, 0, 0]), mesh(new T3.TorusGeometry(4.6, 0.07, 6, 60), basic(0x3de8ff), [0, 0.58, 0], [Math.PI / 2, 0, 0]));
      const glowTex = (col) => mkTex(128, 128, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }), black = basic(0x050212, { fog: false }), hero = (w, rim, tail) => { const g = grp(mesh(new T3.CapsuleGeometry(0.62 * w, 2.0, 4, 10), black, [0, 2.1, 0]), mesh(new T3.SphereGeometry(0.52, 12, 10), black, [0, 4.15, 0]), mesh(new T3.CylinderGeometry(0.2, 0.2, 1.5, 6), black, [-0.32 * w, 0.75, 0]), mesh(new T3.CylinderGeometry(0.2, 0.2, 1.5, 6), black, [0.32 * w, 0.75, 0])); if (tail) g.add(mesh(new T3.CapsuleGeometry(0.16, 1.1, 4, 6), black, [0, 3.7, -0.55], [0.7, 0, 0])); g.add(mesh(new T3.PlaneGeometry(9, 9), basic(0xffffff, { map: glowTex(rim), transparent: true, opacity: 0.85, blending: T3.AdditiveBlending, depthWrite: false, fog: false }), [0, 2.8, -1.2])); return g; };
      const J = hero(1.25, 'rgba(61,232,255,0.8)', false), Lu = hero(1.0, 'rgba(255,61,154,0.8)', true); J.position.set(-2.3, 0.5, 0); Lu.position.set(2.3, 0.5, 0);
      const star = mesh(new T3.OctahedronGeometry(1, 0), basic(0xffe45e), [2.3, 6.9, 0.2], [0, 0, 0], [0.7, 1.0, 0.18]);
      const g = grp(stage, J, Lu, star); g.position.set(PO.x, 0, PO.z); scene.add(g);
      upd.push((t) => { const k = pop(t, L.leads.t - 0.4, 0.5, 1.8) * (1 - sstep(ev.open - 0.5, ev.open - 0.1, t)); g.visible = k > 0.001; g.scale.setScalar(Math.max(0.001, k)); J.scale.setScalar(Math.max(0.001, pop(t, ev.jason - 0.3, 0.35, 2.4))); Lu.scale.setScalar(Math.max(0.001, pop(t, ev.lucia - 0.1, 0.35, 2.4))); J.visible = t > ev.jason - 0.3; Lu.visible = t > ev.lucia - 0.1; star.visible = t > ev.star; star.scale.setScalar(Math.max(0.001, pop(t, ev.star, 0.4, 3))); star.rotation.y = t * 3; J.rotation.y = 0.2 * Math.sin(t * 1.2); Lu.rotation.y = -0.2 * Math.sin(t * 1.2); });
      // the gift box replaces the heroes at centre stage
      const box = mesh(new T3.BoxGeometry(3.2, 2.6, 3.2), std(0xff2e7a, { emissive: 0xff2e7a, emissiveIntensity: 0.5 }), [0, 1.3, 0]), lid = grp(mesh(new T3.BoxGeometry(3.5, 0.8, 3.5), std(0xff5a9a, { emissive: 0xff2e7a, emissiveIntensity: 0.5 })), mesh(new T3.BoxGeometry(0.7, 0.85, 3.55), basic(0x3de8ff)), mesh(new T3.BoxGeometry(3.55, 0.85, 0.7), basic(0x3de8ff))), rib1 = mesh(new T3.BoxGeometry(0.7, 2.62, 3.25), basic(0x3de8ff), [0, 1.3, 0]), rib2 = mesh(new T3.BoxGeometry(3.25, 2.62, 0.7), basic(0x3de8ff), [0, 1.3, 0]);
      const beam = mesh(new T3.ConeGeometry(2.2, 22, 24, 1, true), additive(0xffe9a0, 0.35), [0, 13, 0]); beam.rotation.x = Math.PI; const gift = grp(box, rib1, rib2, lid, beam); const spk = new T3.InstancedMesh(new T3.OctahedronGeometry(0.22, 0), basic(0xfff2a0, { fog: false }), 40); spk.frustumCulled = false; gift.add(spk);
      gift.position.set(PO.x, 0.4, PO.z); scene.add(gift);
      upd.push((t) => { const k = pop(t, L.preorder.t + 0.1, 0.5, 2.2); gift.visible = k > 0.001; gift.scale.setScalar(Math.max(0.001, k)); gift.rotation.y = 0.3 * Math.sin(t * 1.4); const a = t - ev.open, o = a > 0; lid.position.set(0, 3.0 + (o ? 5 * (1 - Math.exp(-a * 3)) : 0.25 * Math.sin(t * 25) * clamp((t - ev.open + 1.2) / 1.2) * (t < ev.open ? 1 : 0)), 0); lid.rotation.set(o ? 1.4 * (1 - Math.exp(-a * 2.5)) : 0, 0, o ? 0.5 * (1 - Math.exp(-a * 2.5)) : 0); beam.visible = o; beam.material.opacity = o ? 0.35 * Math.exp(-Math.max(0, a - 1.6) * 1.1) : 0; spk.visible = o; for (let i = 0; i < 40; i++) { const ang = rnd(i) * TAU, sp = 2 + rnd(i + 3) * 6, y = 2.6 + sp * a - 3.2 * a * a, r = sp * Math.min(a, 1.4) * 0.5; M.compose(new T3.Vector3(Math.cos(ang) * r, Math.max(0.1, y), Math.sin(ang) * r), new T3.Quaternion().setFromEuler(new T3.Euler(a * 5 + i, a * 4, 0)), new T3.Vector3().setScalar(o ? Math.max(0.001, 1 - a / 2.8) : 0.001)); spk.setMatrixAt(i, M); } spk.instanceMatrix.needsUpdate = true; });
    }
  }

  function render3d(t) {
    const zc = Zc(t), ok = orbitK(t), hook = 1 - sstep(3.6, 5.0, t), shake = ev.ticks.reduce((a, x) => a + (t >= x ? Math.exp(-(t - x) * 7) : 0), 0);
    const bDate = sstep(L.date.t - 0.2, L.date.t + 1.2, t) * (1 - sstep(L.pc.t + 0.4, L.pc.t + 1.6, t));
    const bAir = sstep(L.setting.t - 0.3, L.setting.t + 1.9, t) * (1 - sstep(L.leads.t - 1.1, L.leads.t - 0.1, t));
    const px = 1.6 * Math.sin(t * 0.4) * (1 - ok), py = 3.0 + 1.0 * sstep(0, 5, t) + 3.0 * bDate + 56 * bAir + 0.3 * Math.sin(t * 0.9);
    const path = new T3.Vector3(px + 12 * bAir, py - 0.6 * hook, zc), look = new T3.Vector3(px * 0.3 + 3 * bAir, lerp(py + 1.0, 1.0, bAir * 0.92) + 6 * hook - 1.5 * bDate, zc - 30 - 14 * bAir);
    const u = clamp((t - (L.leads.t - 0.5)) / (ev.end - (L.leads.t - 0.5))), ang = lerp(-0.35, 1.25, sstep(0, 1, u) * 0.85 + u * 0.15), rad = 21 - 6 * sstep(L.preorder.t - 0.2, L.preorder.t + 1.2, t);
    const orb = new T3.Vector3(PO.x + Math.sin(ang) * rad, 3.2 + 1.3 * sstep(L.preorder.t, L.preorder.t + 2, t), PO.z + Math.cos(ang) * rad), olook = new T3.Vector3(PO.x, 2.6 + 0.8 * sstep(L.preorder.t, ev.open, t), PO.z);
    cam.position.lerpVectors(path, orb, ok); const lk = new T3.Vector3().lerpVectors(look, olook, ok); cam.position.x += shake * 0.18 * Math.sin(t * 70); cam.position.y += shake * 0.22 * Math.sin(t * 83); cam.lookAt(lk); cam.rotation.z += 0.015 * Math.sin(t * 0.6) * (1 - ok) + 0.02 * shake * Math.sin(t * 40);
    sky.position.copy(cam.position); sunM.position.set(cam.position.x, cam.position.y + 26, cam.position.z - 360); sunM.userData.halo.position.set(cam.position.x, cam.position.y + 26, cam.position.z - 358);
    upd.forEach((f) => f(t)); R.render(scene, cam);
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
  const CARDS = [
    [L.date.t + 0.5, L.date.end + 0.2, 'NOVEMBER 19', 'PS5 · XBOX SERIES X|S', '#FFE45E'],
    [L.pc.t + 0.3, L.pc.end + 0.3, 'PC: NO DATE YET', 'consoles only at launch', '#FF6E9A'],
    [ev.tag1 - 0.2, ev.tag2 - 0.25, '$79.99', 'STANDARD EDITION', '#FF6E9A'],
    [ev.tag2 - 0.2, L.price.end + 0.35, '$99.99', 'ULTIMATE EDITION', '#FFC53D'],
    [L.setting.t + 0.6, L.setting.end + 0.1, 'LEONIDA', 'Florida-inspired · a modern Vice City', '#7BE8FF'],
    [ev.jason - 0.3, ev.lucia - 0.15, 'JASON DUVAL', 'main character', '#7BE8FF'],
    [ev.lucia - 0.15, ev.star - 0.1, 'LUCIA CAMINOS', 'main character', '#FF6E9A'],
    [ev.star, L.lucia.end + 0.25, 'FIRST FEMALE LEAD', 'in a mainline GTA game', '#FFE45E'],
    [ev.open - 0.3, L.preorder.end + 0.35, 'VINTAGE VICE CITY PACK', 'pre-order before November 20', '#FFE45E'],
  ];
  function hud(c, t) {
    const a = 1 - sstep(ev.end - 0.4, ev.end, t); if (a <= 0) return; c.save(); c.globalAlpha = a;
    let g = c.createLinearGradient(0, 0, 0, 520); g.addColorStop(0, 'rgba(10,4,30,0.55)'); g.addColorStop(1, 'rgba(10,4,30,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 520);
    g = c.createLinearGradient(0, 1180, 0, H); g.addColorStop(0, 'rgba(10,4,30,0)'); g.addColorStop(0.45, 'rgba(10,4,30,0.62)'); g.addColorStop(1, 'rgba(10,4,30,0.82)'); c.fillStyle = g; c.fillRect(0, 1180, W, H - 1180);
    // persistent badge
    const ha = sstep(3.8, 4.6, t); c.save(); c.globalAlpha = a * ha; c.font = '800 38px Inter'; const bw = 470; c.beginPath(); c.roundRect(540 - bw / 2, 250, bw, 70, 35); c.fillStyle = '#FF2E7A'; c.fill(); c.lineWidth = 6; c.strokeStyle = INK; c.stroke(); c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('GTA 6 · 6 DAYS TO GO', 540, 286); c.restore();
    // the hook: GTA 6 / giant 6 / DAYS TO GO — fully on screen at t=0
    const hk = 1 - sstep(3.4, 4.3, t);
    if (hk > 0) { const slam = ev.ticks.reduce((s, x) => s + (t >= x ? Math.exp(-(t - x) * 9) : 0), 0), sc = 1 + 0.22 * slam;
      text(c, 'GTA 6', 540, 330, 190, '#FFFFFF', { font: 'Bungee', weight: 400, lw: 28, shadow: '#FF2E7A', alpha: hk * a, scale: sc });
      text(c, '6', 540, 790, 640, '#FFE45E', { font: 'Bungee', weight: 400, lw: 60, shadow: '#FF2E7A', alpha: hk * a, scale: sc, rot: -0.04 });
      text(c, 'DAYS TO GO', 540, 1150, 130, '#FFFFFF', { font: 'Bungee', weight: 400, lw: 22, shadow: '#3A0F70', alpha: hk * a, scale: 1 + 0.08 * slam }); }
    CARDS.forEach(([t0, t1, title, sub, col]) => { if (t < t0 || t > t1) return; const out = 1 - sstep(t1 - 0.25, t1, t); text(c, title, 540, 1325, 100, col, { font: 'Bungee', weight: 400, lw: 18, scale: pop(t, t0, 0.35, 2.2) * out, maxW: 880, shadow: '#3A0F70', alpha: a }); text(c, sub, 540, 1430, 46, '#FFFFFF', { font: 'Inter', weight: 800, lw: 10, scale: pop(t, t0 + 0.2, 0.3, 1.6) * out, maxW: 880, alpha: a }); });
    text(c, 'Unofficial explainer · not affiliated with Rockstar Games', 540, 1480, 28, 'rgba(255,255,255,0.75)', { font: 'Inter', weight: 700, lw: 6, alpha: a * sstep(1, 2, t) });
    if (t >= ev.open && t < ev.open + 0.22) { c.fillStyle = `rgba(255,255,255,${0.7 * (1 - (t - ev.open) / 0.22)})`; c.fillRect(0, 0, W, H); }
    c.restore();
  }
  function endCard(c, t) {
    const a = sstep(ev.end - 0.4, ev.end, t); if (a <= 0) return; c.save(); c.globalAlpha = a; c.fillStyle = '#131C3D'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 18; i++) { const p = ((t * 0.12 + rnd(i)) % 1), x = rnd(i + 3) * W + Math.sin(t + i) * 20, y = H + 100 - p * (H + 300); c.beginPath(); c.arc(x, y, 14 + rnd(i + 6) * 30, 0, TAU); c.lineWidth = 5; c.strokeStyle = `rgba(120,200,255,${0.35 * Math.sin(p * Math.PI)})`; c.stroke(); }
    const k = pop(t, ev.end + 0.1, 0.5, 1.8); if (LOGO && k > 0) { c.save(); c.translate(540, 760); c.scale(k, k); c.drawImage(LOGO, -430, -430, 860, 860); c.restore(); }
    text(c, 'FOLLOW FOR', 540, 1210, 80, '#FFFFFF', { scale: pop(t, ev.end + 0.6, 0.3), lw: 14 }); text(c, 'MORE GAMING NEWS!', 540, 1310, 84, '#FFD23F', { scale: pop(t, ev.end + 0.8, 0.3) * (1 + 0.03 * Math.sin(t * 6)), lw: 16, shadow: '#FF6B4A', maxW: 900 }); c.restore();
  }
  Studio.film({ post: { vignette: 0.14, grain: 0, paper: 0 }, fadeOut: 0.4,
    async init() { await Studio.loadFont('Baloo', 'assets/baloo-700.woff2', 700); LOGO = await Studio.loadImage('assets/logo.png'); try { await document.fonts.load('400 40px Bungee'); await document.fonts.load('800 40px Inter'); } catch (e) { /* ignore */ } build(); },
    draw(ctx, t) { if (t < ev.end + 0.05) { render3d(t); ctx.drawImage(R.domElement, 0, 0, W, H); } hud(ctx, t); endCard(ctx, t); } });
})();
