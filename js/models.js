// ===== Low-poly models + procedural RS2-style textures =====
const Tex = (() => {
  const cache = {};
  function canvas(n, fn) {
    if (cache[n]) return cache[n];
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d');
    let s = n.length * 977 + 13; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    fn(g, r);
    const t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestMipmapNearestFilter; // unfiltered, like the software renderer
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    cache[n] = t;
    return t;
  }
  const noise = (g, r, base, amt, a) => { for (let y = 0; y < 64; y += 2) for (let x = 0; x < 64; x += 2) { const v = (r() - 0.5) * amt; g.fillStyle = `rgba(${base[0] + v | 0},${base[1] + v | 0},${base[2] + v | 0},${a || 1})`; g.fillRect(x, y, 2, 2); } };
  const defs = {
    brick: (g, r) => { noise(g, r, [120, 116, 104], 16); for (let row = 0; row < 8; row++) { const off = row % 2 ? 8 : 0; g.fillStyle = 'rgba(40,36,30,0.75)'; g.fillRect(0, row * 8 + 7, 64, 1); for (let x = off; x < 64; x += 16) g.fillRect(x, row * 8, 1, 8); for (let x = off; x < 64; x += 16) { g.fillStyle = `rgba(255,250,230,${0.04 + r() * 0.06})`; g.fillRect(x + 1, row * 8, 15, 1); } } },
    plaster: (g, r) => { noise(g, r, [214, 204, 178], 14); },
    rooftile: (g, r) => { noise(g, r, [140, 58, 40], 18); for (let row = 0; row < 8; row++) { g.fillStyle = 'rgba(50,16,10,0.7)'; g.fillRect(0, row * 8 + 7, 64, 1); const off = row % 2 ? 4 : 0; for (let x = off; x < 64; x += 8) g.fillRect(x, row * 8, 1, 7); g.fillStyle = 'rgba(255,180,140,0.12)'; g.fillRect(0, row * 8, 64, 1); } },
    slate: (g, r) => { noise(g, r, [84, 90, 104], 14); for (let row = 0; row < 8; row++) { g.fillStyle = 'rgba(20,22,30,0.7)'; g.fillRect(0, row * 8 + 7, 64, 1); const off = row % 2 ? 6 : 0; for (let x = off; x < 64; x += 12) g.fillRect(x, row * 8, 1, 7); } },
    thatch: (g, r) => { noise(g, r, [168, 140, 76], 20); for (let i = 0; i < 260; i++) { const x = r() * 64, y = r() * 64; g.fillStyle = r() < 0.5 ? 'rgba(90,70,30,0.6)' : 'rgba(220,200,120,0.5)'; g.fillRect(x, y, 1, 4 + r() * 5); } for (let row = 0; row < 4; row++) { g.fillStyle = 'rgba(70,52,20,0.6)'; g.fillRect(0, row * 16 + 15, 64, 1); } },
    planks: (g, r) => { noise(g, r, [126, 88, 50], 14); for (let row = 0; row < 8; row++) { g.fillStyle = 'rgba(40,24,10,0.8)'; g.fillRect(0, row * 8 + 7, 64, 1); g.fillRect(((row * 23) % 48) + 8, row * 8, 1, 7); } for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(70,44,20,0.35)'; g.fillRect(r() * 64, r() * 64, 6, 1); } },
    whitestone: (g, r) => { noise(g, r, [226, 226, 222], 12); for (let row = 0; row < 4; row++) { g.fillStyle = 'rgba(120,120,130,0.6)'; g.fillRect(0, row * 16 + 15, 64, 1); for (let x = (row % 2) * 16; x < 64; x += 32) g.fillRect(x, row * 16, 1, 16); } },
    stonefloor: (g, r) => { noise(g, r, [104, 100, 94], 18); for (let row = 0; row < 4; row++) { g.fillStyle = 'rgba(36,34,30,0.7)'; g.fillRect(0, row * 16 + 15, 64, 1); for (let x = (row % 2) * 8; x < 64; x += 16) g.fillRect(x, row * 16, 1, 16); } },
    cobble: (g, r) => { noise(g, r, [92, 88, 82], 10); for (let i = 0; i < 46; i++) { const x = r() * 64, y = r() * 64, w = 5 + r() * 5; const v = 100 + r() * 34 | 0; g.fillStyle = `rgb(${v},${v - 3},${v - 8})`; g.beginPath(); g.ellipse(x, y, w / 2, w / 2.6, r() * 3, 0, 7); g.fill(); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x - 2, y + 2, 4, 1); } },
    water: (g, r) => { noise(g, r, [44, 74, 132], 10); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(150,190,240,${0.15 + r() * 0.25})`; g.fillRect(r() * 64, r() * 64, 4 + r() * 8, 1); } },
    lava: (g, r) => { noise(g, r, [230, 96, 24], 50); for (let i = 0; i < 26; i++) { g.fillStyle = r() < 0.5 ? 'rgba(60,16,8,0.55)' : 'rgba(255,220,80,0.6)'; g.beginPath(); g.ellipse(r() * 64, r() * 64, 2 + r() * 6, 1 + r() * 3, r() * 3, 0, 7); g.fill(); } },
    rsleaf: (g, r) => { g.fillStyle = 'rgb(176,186,160)'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 70; i++) { g.fillStyle = 'rgba(20,30,10,0.55)'; g.beginPath(); g.ellipse(r() * 64, r() * 64, 2 + r() * 3, 1 + r() * 2, r() * 3, 0, 7); g.fill(); }
      for (let i = 0; i < 260; i++) { const k = r(); g.fillStyle = k < 0.35 ? 'rgba(255,255,225,0.55)' : k < 0.7 ? 'rgba(210,225,180,0.6)' : 'rgba(60,80,40,0.6)'; g.beginPath(); g.ellipse(r() * 64, r() * 64, 2.2, 1.1, r() * 3, 0, 7); g.fill(); } },
    leaves: (g, r) => { noise(g, r, [255, 255, 255], 40); for (let i = 0; i < 90; i++) { const x = r() * 64, y = r() * 64; g.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,220,0.25)'; g.beginPath(); g.ellipse(x, y, 2.5, 1.5, r() * 3, 0, 7); g.fill(); } },
    bark: (g, r) => { noise(g, r, [235, 235, 235], 30); for (let x = 0; x < 64; x += 4 + (r() * 3 | 0)) { g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(x, 0, 1, 64); } },
    rock: (g, r) => { noise(g, r, [235, 235, 235], 50); for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(r() * 64, r() * 64, 3, 2); } },
    sand: (g, r) => { noise(g, r, [255, 255, 255], 30); },
    sandstone: (g, r) => { noise(g, r, [196, 168, 112], 16); for (let row = 0; row < 8; row++) { g.fillStyle = 'rgba(90,70,40,0.5)'; g.fillRect(0, row * 8 + 7, 64, 1); } },
    cloth: (g, r) => { noise(g, r, [240, 240, 240], 12); for (let i = 0; i < 64; i += 8) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(i, 0, 4, 64); } },
  };
  function get(n) { return canvas(n, defs[n]); }
  return { get };
})();

const Models = (() => {
  const mats = {};
  function mat(color, opts) {
    let key = color;
    if (opts) for (const k in opts) { const v = opts[k]; key += '|' + k + ':' + (v && v.isTexture ? v.uuid : String(v)); }
    if (!mats[key]) mats[key] = new THREE.MeshLambertMaterial(Object.assign({ color, flatShading: true }, opts || {}));
    return mats[key];
  }
  function tmat(tex, color, opts) { return mat(color || '#ffffff', Object.assign({ map: Tex.get(tex) }, opts || {})); }
  const geos = {};
  const G = (k, fn) => geos[k] || (geos[k] = fn());
  function boxGeo(w, h, d) { return G('b' + w + ',' + h + ',' + d, () => new THREE.BoxGeometry(w, h, d)); }
  function box(w, h, d, color, x, y, z, parent) {
    const m = new THREE.Mesh(boxGeo(w, h, d), typeof color === 'string' ? mat(color) : color);
    m.position.set(x || 0, y || 0, z || 0);
    if (parent) parent.add(m);
    return m;
  }
  function taper(wTop, wBot, h, d, color, x, y, z, parent) {
    const g = G(`t${wTop},${wBot},${h},${d}`, () => { const g = new THREE.CylinderGeometry(wTop * 0.7071, wBot * 0.7071, h, 4, 1); g.rotateY(Math.PI / 4); g.scale(1, 1, d / ((wTop + wBot) / 2)); return g; });
    const m = new THREE.Mesh(g, typeof color === 'string' ? mat(color) : color);
    m.position.set(x || 0, y || 0, z || 0);
    if (parent) parent.add(m);
    return m;
  }
  function mesh(geo, color, x, y, z, parent) {
    const m = new THREE.Mesh(geo, typeof color === 'string' ? mat(color) : color);
    m.position.set(x || 0, y || 0, z || 0);
    if (parent) parent.add(m);
    return m;
  }
  const cyl = (a, b, h, s, hs, open) => G(`c${a},${b},${h},${s},${open ? 1 : 0}`, () => new THREE.CylinderGeometry(a, b, h, s, hs || 1, !!open));
  const cone = (r, h, s) => G(`k${r},${h},${s}`, () => new THREE.ConeGeometry(r, h, s));
  function pivot(parent, x, y, z) { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; }

  // smooth-shaded character material (RS2 models used gouraud shading, not flat blocks)
  const cmats = {};
  // OSRS characters: low-poly shapes with smooth (gouraud) shading across them
  function cmat(color) { return cmats[color] || (cmats[color] = new THREE.MeshLambertMaterial({ color })); }
  const sph = (r, w, h, ps, pl, ts, tl) => G(`s${r},${w},${h},${ps},${pl},${ts},${tl}`, () => new THREE.SphereGeometry(r, w, h, ps || 0, pl || Math.PI * 2, ts || 0, tl || Math.PI));
  function part(geo, color, x, y, z, parent, sx, sy, sz) {
    const m = new THREE.Mesh(geo, cmat(color));
    m.position.set(x || 0, y || 0, z || 0);
    if (sx) m.scale.set(sx, sy, sz);
    if (parent) parent.add(m);
    return m;
  }
  // ---------- Humanoid (RS2-style proportions: broad chest, tapered limbs, rounded head) ----------
  function humanoid(o) {
    o = Object.assign({ skin: '#c8915c', hair: '#4a2e16', shirt: '#6a4a8a', pants: '#3c4a6a', boots: '#3a2a1a', scale: 1, sleeves: true }, o);
    const root = new THREE.Group();
    const body = new THREE.Group(); root.add(body);
    body.scale.setScalar(o.scale);
    const P = { body, smooth: true };
    // Proportions measured from OSRS NPC renders (fractions of total height H ~ 1.75):
    // head 0.14H tall / 0.105H wide, shoulders at 0.80H, belt 0.55H, crotch 0.48H, chest 0.2H wide, legs 0.1H thick.
    const loft = (key, rings, N) => G(key, () => {
      N = N || 10; const pos = [], idx = [];
      rings.forEach(([y, w, d, zo]) => { for (let k = 0; k < N; k++) { const an = k / N * Math.PI * 2; const c = Math.cos(an), sn = Math.sin(an); const sq = Math.pow(Math.abs(c), 0.8) * Math.sign(c); pos.push(sq * w, y, sn * d + (zo || 0)); } });
      for (let r = 0; r < rings.length - 1; r++) for (let k = 0; k < N; k++) { const a0 = r * N + k, a1 = r * N + (k + 1) % N, b0 = a0 + N, b1 = a1 + N; idx.push(a0, b0, a1, a1, b0, b1); }
      const bot = pos.length / 3; const B = rings[0]; pos.push(0, B[0], B[3] || 0); for (let k = 0; k < N; k++) idx.push(bot, k, (k + 1) % N);
      const top = pos.length / 3; const T = rings[rings.length - 1]; pos.push(0, T[0] + 0.005, T[3] || 0); for (let k = 0; k < N; k++) idx.push((rings.length - 1) * N + k, top, (rings.length - 1) * N + (k + 1) % N);
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; });
    P.legL = pivot(body, -0.095, 0.88, 0);
    P.legR = pivot(body, 0.095, 0.88, 0);
    for (const leg of [P.legL, P.legR]) {
      // loose trousers: thick and fairly even down to the boot
      leg.userData.upper = part(loft('rsThigh2', [[-0.45, 0.082, 0.086], [-0.22, 0.088, 0.092], [0.0, 0.098, 0.1]], 8), o.pants, 0, 0, 0, leg);
      leg.userData.kneeP = pivot(leg, 0, -0.44, 0);
      leg.userData.knee = part(loft('rsKnee', [[-0.03, 0.074, 0.078], [0.03, 0.076, 0.08]], 8), o.pants, 0, 0, 0, leg.userData.kneeP);
      leg.userData.shin = part(loft('rsShin2', [[-0.33, 0.088, 0.09], [-0.17, 0.078, 0.08], [0.0, 0.082, 0.085]], 8), o.pants, 0, 0, 0, leg.userData.kneeP);
      // boot: wedge, wider than the leg, toe pointing forward
      leg.userData.foot = part(G('rsBoot', () => { const g = new THREE.BoxGeometry(0.19, 0.2, 0.31, 1, 1, 1); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { if (p.getZ(i) > 0 && p.getY(i) > 0) p.setY(i, p.getY(i) - 0.11); if (p.getZ(i) > 0) p.setX(i, p.getX(i) * 0.82); if (p.getY(i) > 0) p.setX(i, p.getX(i) * 0.92); } g.computeVertexNormals(); return g; }), o.boots, 0, -0.335, 0.045, leg.userData.kneeP);
    }
    if (o.robe) { P.skirt = part(loft('rsRobe', [[0.0, 0.25, 0.2], [0.45, 0.2, 0.15], [0.96, 0.165, 0.11]], 10), o.robe, 0, 0, 0, body); for (const l of [P.legL, P.legR]) { l.userData.upper.visible = false; l.userData.knee.visible = false; l.userData.shin.visible = false; } }
    P.hips = part(loft('rsHips3', [[0.83, 0.12, 0.08], [0.9, 0.172, 0.104], [0.96, 0.172, 0.104]]), o.pants, 0, 0, 0, body);
    // trunk: narrow waist, swelling chest, broad sloped shoulders into a short neck
    P.torso = part(loft('rsTrunk2', [[0.93, 0.172, 0.104], [1.04, 0.158, 0.1, 0.004], [1.15, 0.17, 0.108, 0.01], [1.26, 0.19, 0.115, 0.014], [1.35, 0.212, 0.115, 0.01], [1.405, 0.205, 0.1], [1.435, 0.13, 0.08], [1.45, 0.06, 0.05]]), o.shirt, 0, 0, 0, body);
    P.chest = part(G('rsNone', () => new THREE.BufferGeometry()), o.shirt, 0, 0, 0, body);
    P.belt = part(loft('rsBelt', [[0.935, 0.17, 0.107], [0.975, 0.168, 0.105]]), Icons.shade(o.pants, 0.55), 0, 0, 0, body);
    P.armL = pivot(body, -0.22, 1.37, 0);
    P.armR = pivot(body, 0.22, 1.37, 0);
    for (const arm of [P.armL, P.armR]) {
      const c = o.sleeves ? o.shirt : o.skin;
      arm.userData.shoulder = part(G('rsShoulder2', () => { const g = new THREE.IcosahedronGeometry(0.06, 1); g.scale(1, 0.8, 1); return g; }), c, -Math.sign(arm.position.x) * 0.012, -0.005, 0, arm);
      // sleeve: puffs slightly toward the elbow like OSRS shirts
      arm.userData.upper = part(loft('rsUpperArm2', [[-0.235, 0.056, 0.056], [-0.12, 0.05, 0.052], [0.0, 0.055, 0.058]], 7), c, 0, 0, 0, arm);
      arm.userData.elbow = pivot(arm, 0, -0.22, 0);
      arm.userData.fore = part(loft('rsForearm', [[-0.2, 0.034, 0.036], [-0.09, 0.042, 0.044], [0.0, 0.05, 0.05]], 7), o.sleeves && o.longSleeves !== false ? c : o.skin, 0, 0, 0, arm.userData.elbow);
      arm.userData.hand = part(G('rsFist', () => { const g = new THREE.IcosahedronGeometry(0.058, 0); g.scale(0.85, 1.15, 1.0); return g; }), o.skin, 0, -0.235, 0.008, arm.userData.elbow);
    }
    P.handR = pivot(P.armR.userData.elbow, 0, -0.24, 0.02);
    P.handL = pivot(P.armL.userData.elbow, 0, -0.13, 0);
    P.head = pivot(body, 0, 1.47, 0);
    P.neck = part(cyl(0.085, 0.1, 0.16, 6), o.skin, 0, 0.02, 0, P.head);
    // skull: 8-sided block that narrows to the jaw, as on the 2005 player model (no drawn eyes or mouth)
    P.face = part(G('rsHead', () => { const g = new THREE.CylinderGeometry(0.155, 0.12, 0.32, 8, 1); g.rotateY(Math.PI / 8); g.scale(1, 1, 1.05); return g; }), o.skin, 0, 0.2, 0, P.head);
    part(G('rsHeadTop', () => { const g = new THREE.CylinderGeometry(0.11, 0.155, 0.07, 8, 1); g.rotateY(Math.PI / 8); return g; }), o.skin, 0, 0.395, 0, P.head);
    { const n = part(G('rsNose', () => new THREE.ConeGeometry(0.03, 0.09, 4)), o.skin, 0, 0.18, 0.15, P.head); n.rotation.x = Math.PI / 2 + 0.35; }
    for (const s of [-1, 1]) { const e = part(G('rsEye', () => new THREE.BoxGeometry(0.05, 0.014, 0.012)), '#1a1210', s * 0.058, 0.235, 0.142, P.head); e.rotation.z = s * 0.22; }
    P.head.scale.setScalar(0.56);
    if (o.hair) {
      P.hair = new THREE.Group(); P.head.add(P.hair);
      part(G('rsHairTop', () => { const g = new THREE.CylinderGeometry(0.135, 0.175, 0.12, 8, 1); g.rotateY(Math.PI / 8); return g; }), o.hair, 0, 0.38, -0.01, P.hair);
      part(G('rsHairBack2', () => new THREE.BoxGeometry(0.33, 0.34, 0.12)), o.hair, 0, 0.22, -0.11, P.hair);
      for (const s of [-1, 1]) { const sd = part(G('rsHairSide2', () => new THREE.BoxGeometry(0.045, 0.26, 0.22)), o.hair, s * 0.157, 0.24, -0.02, P.hair); sd.rotation.z = s * 0.06; }
      const fr = part(G('rsFringe2', () => { const g = new THREE.BoxGeometry(0.32, 0.07, 0.07); const p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getX(i) > 0.05 && p.getY(i) < 0) p.setY(i, p.getY(i) - 0.07); g.computeVertexNormals(); return g; }), o.hair, 0.0, 0.37, 0.12, P.hair); fr.rotation.z = -0.05;
    }
    if (o.beard) { part(G('rsBeard', () => new THREE.BoxGeometry(0.25, 0.13, 0.1)), o.beard, 0, 0.09, 0.1, P.head); part(G('rsBeard2', () => new THREE.BoxGeometry(0.17, 0.08, 0.08)), o.beard, 0, 0.01, 0.1, P.head); }
    if (o.ears) for (const s of [-1, 1]) { const e = part(G('ear', () => new THREE.ConeGeometry(0.05, 0.18, 4)), o.skin, s * 0.17, 0.24, 0, P.head); e.rotation.z = -s * 1.1; }
    if (o.hat) { part(cyl(0.2, 0.2, 0.03, 7), o.hat, 0, 0.37, 0, P.head); part(cyl(0.13, 0.15, 0.16, 7), o.hat, 0, 0.45, 0, P.head); }
    if (o.strawhat) { part(cyl(0.3, 0.3, 0.025, 7), '#d8c070', 0, 0.36, 0, P.head); part(cyl(0.13, 0.15, 0.13, 7), '#d8c070', 0, 0.43, 0, P.head); }
    if (o.wizhat) { part(cyl(0.34, 0.36, 0.035, 9), o.wizhat, 0, 0.4, 0, P.head); const c = part(G('wh2', () => new THREE.ConeGeometry(0.19, 0.62, 9)), o.wizhat, 0, 0.7, -0.05, P.head); c.rotation.x = -0.3; const t = part(G('wh3', () => new THREE.ConeGeometry(0.07, 0.25, 6)), o.wizhat, 0, 1.0, -0.22, P.head); t.rotation.x = -1.1; }
    if (o.hood) { part(sph(0.185, 7, 5, 0, Math.PI * 2, 0, Math.PI * 0.75), o.hood, 0, 0.2, -0.02, P.head, 1, 1.25, 1.1); }
    if (o.cape) { P.cape = part(cyl(0.16, 0.26, 0.9, 8, 1, true), o.cape, 0, 0.96, -0.1, body, 1, 1, 0.25); }
    if (o.apron) part(G('apron', () => new THREE.BoxGeometry(0.3, 0.55, 0.02)), o.apron, 0, 1.0, 0.115, body);
    P.equip = {};
    P.base = o;
    root.userData.parts = P;
    root.userData.kind = 'humanoid';
    return root;
  }

  function weaponMesh(id) {
    const g = new THREE.Group();
    const def = ITEMS[id];
    if (!def) return g;
    const col = def.icon.c || '#888888';
    const t = def.icon.t;
    if (t === 'axe' || t === 'pickaxe') {
      box(0.05, 0.6, 0.05, '#6b4523', 0, 0, 0.22, g).rotation.x = Math.PI / 2;
      if (t === 'axe') box(0.04, 0.16, 0.14, col, 0, -0.06, 0.45, g);
      else box(0.04, 0.05, 0.5, col, 0, -0.04, 0.48, g).rotation.x = Math.PI / 2;
    } else if (t === 'dagger' || t === 'sword' || t === 'scimitar') {
      const len = t === 'dagger' ? 0.32 : def.icon.big ? 1.0 : def.icon.long ? 0.78 : 0.62;
      box(0.05, 0.05, 0.12, '#4a3020', 0, 0, 0.0, g);
      box(0.2, 0.04, 0.04, Icons.shade(col, 0.8), 0, 0, 0.07, g);
      const b = box(0.03, 0.08, len, col, 0, t === 'scimitar' ? 0.03 : 0, 0.08 + len / 2, g);
      if (t === 'scimitar') b.rotation.x = -0.15;
    } else if (t === 'mace' || t === 'warhammer') {
      box(0.04, 0.04, 0.5, '#5a3c20', 0, 0, 0.2, g);
      if (t === 'mace') { const h = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 0), mat(col)); h.position.set(0, 0, 0.48); g.add(h); for (const [x, y] of [[0.09, 0], [-0.09, 0], [0, 0.09], [0, -0.09]]) box(0.04, 0.04, 0.04, Icons.shade(col, 1.3), x, y, 0.48, g); }
      else box(0.09, 0.22, 0.11, col, 0, 0, 0.46, g);
    } else if (t === 'battleaxe') {
      box(0.04, 0.04, 0.7, '#5a3c20', 0, 0, 0.3, g);
      for (const s of [-1, 1]) box(0.03, 0.2, 0.18, col, 0, s * 0.11, 0.56, g);
    } else if (t === 'hammer') {
      box(0.05, 0.05, 0.4, '#6b4523', 0, 0, 0.15, g); box(0.1, 0.1, 0.18, '#707078', 0, 0, 0.35, g).rotation.x = Math.PI / 2;
    } else if (t === 'net') {
      box(0.04, 0.04, 0.5, '#6b4523', 0, 0, 0.2, g); box(0.3, 0.02, 0.3, '#c8b48a', 0, 0, 0.55, g);
    } else if (t === 'bow') {
      const L = def.icon.long ? 0.62 : 0.48;
      for (const s of [-1, 1]) { const limb = box(0.04, L, 0.05, col, 0, s * L / 2 * 0.9, 0.08 - Math.abs(s) * 0.0, g); limb.rotation.x = s * 0.25; limb.position.z = 0.12; }
      box(0.01, L * 1.7, 0.01, '#e8e8e8', 0, 0, 0.02, g);
      g.rotation.z = Math.PI / 2; g.rotation.y = 0;
    } else if (t === 'staff') {
      box(0.05, 0.05, 1.2, col, 0, 0, 0.1, g).rotation.x = 0;
      g.children[0].rotation.x = Math.PI / 2 * 0; g.rotation.x = -Math.PI / 2 + 0.2;
      if (def.icon.orb) mesh(G('orb', () => new THREE.IcosahedronGeometry(0.07, 0)), mat(def.icon.orb, { emissive: def.icon.orb }), 0, 0, 0.72, g);
    } else if (t === 'rod' || t === 'harpoon') {
      const r = box(0.03, 0.03, t === 'rod' ? 1.3 : 0.9, t === 'rod' ? '#6b4523' : '#7a5a3a', 0, 0, 0.5, g); r.rotation.x = -0.6; r.position.y = 0.3;
      if (t === 'harpoon') box(0.08, 0.08, 0.15, '#a0a0a8', 0, 0.55, 0.85, g);
    } else if (t === 'pot') {
      box(0.35, 0.3, 0.35, '#7a5530', 0, -0.1, 0.15, g);
    } else if (t === 'knife' || t === 'tinderbox' || t === 'rake' || t === 'spade' || t === 'dibber' || t === 'chisel') {
      box(0.04, 0.04, t === 'knife' ? 0.25 : 0.6, t === 'knife' ? '#b0b0b8' : '#6b4523', 0, 0, 0.15, g);
      if (t === 'spade') box(0.16, 0.02, 0.18, '#8a8a92', 0, 0, 0.5, g);
      if (t === 'rake') box(0.3, 0.04, 0.04, '#808088', 0, 0, 0.45, g);
    }
    return g;
  }

  function applyEquipment(root, equip) {
    const P = root.userData.parts, o = P.base;
    const col = id => { const d = ITEMS[id]; return (d.equip && d.equip.color) || d.icon.c || '#8a5a30'; };
    const bodyCol = equip.body ? col(equip.body) : o.shirt;
    const legCol = equip.legs ? col(equip.legs) : o.pants;
    P.torso.material = cmat(bodyCol); P.chest.material = cmat(bodyCol);
    for (const a of [P.armL, P.armR]) {
      const ac = equip.body ? bodyCol : (o.sleeves ? o.shirt : o.skin);
      a.userData.upper.material = cmat(ac); a.userData.shoulder.material = cmat(ac); a.userData.fore.material = cmat(ac);
      a.userData.hand.material = cmat(equip.hands ? '#7a4a24' : o.skin);
    }
    for (const l of [P.legL, P.legR]) { l.userData.upper.material = cmat(legCol); l.userData.knee.material = cmat(legCol); l.userData.shin.material = cmat(legCol); l.userData.foot.material = cmat(equip.feet ? ((ITEMS[equip.feet].equip && ITEMS[equip.feet].equip.color) || '#6a3a1a') : o.boots); }
    P.hips.material = cmat(legCol);
    // armour detail: pauldrons + chest plate for platebodies, tassets for platelegs
    if (P.equip.extra) for (const [par, m] of P.equip.extra) par.remove(m);
    P.equip.extra = [];
    const add = (par, m) => { P.equip.extra.push([par, m]); return m; };
    const isPlate = id => id && (/_platebody$|^bk_body$|^wk_body$/.test(id));
    const slab = (key, w, h, d, taperOut) => G(key, () => { const g = new THREE.BoxGeometry(w, h, d); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { if (p.getY(i) < 0) { p.setX(i, p.getX(i) * taperOut); p.setZ(i, p.getZ(i) * (taperOut * 0.95)); } } g.computeVertexNormals(); return g; });
    if (isPlate(equip.body)) {
      const lt = Icons.shade(bodyCol, 1.18), dk = Icons.shade(bodyCol, 0.58);
      // breastplate is the lighter tone; sleeves stay plate, wrists get a darker cuff
      P.torso.material = cmat(lt);
      for (const [arm, s] of [[P.armL, -1], [P.armR, 1]]) {
        // pauldron: a flat angular slab angled down over the shoulder, darker than the chest
        const pd = add(arm, part(G('rsPauldShell', () => { const g = new THREE.SphereGeometry(0.125, 6, 4, 0, Math.PI * 2, 0, Math.PI * 0.62); g.scale(1.25, 1.05, 1.2); return g; }), dk, s * 0.012, -0.005, 0, arm)); pd.rotation.z = -s * 0.32;
        const pd2 = add(arm, part(G('rsPauldLip', () => { const g = new THREE.CylinderGeometry(0.15, 0.16, 0.035, 6, 1, true); g.scale(1.0, 1, 1.12); return g; }), Icons.shade(bodyCol, 0.5), s * 0.03, -0.065, 0, arm)); pd2.rotation.z = -s * 0.32; pd2.material = new THREE.MeshLambertMaterial({ color: Icons.shade(bodyCol, 0.5), side: THREE.DoubleSide });
        add(arm.userData.elbow, part(G('rsCuff', () => new THREE.CylinderGeometry(0.05, 0.048, 0.06, 7)), dk, 0, -0.19, 0, arm.userData.elbow));
        arm.userData.upper.material = cmat(bodyCol); arm.userData.fore.material = cmat(lt);
      }
      // breastplate drops to a V point over the belt, as on OSRS plate
      add(P.body, part(G('rsPlateV', () => { const sh = new THREE.Shape(); sh.moveTo(-0.17, 0); sh.lineTo(0.17, 0); sh.lineTo(0.12, -0.07); sh.lineTo(0, -0.13); sh.lineTo(-0.12, -0.07); sh.closePath(); const g = new THREE.ExtrudeGeometry(sh, { depth: 0.2, bevelEnabled: false }); g.translate(0, 0, -0.1); g.computeVertexNormals(); return g; }), lt, 0, 1.0, 0.012, P.body));
      // flared plate rim over the hips
      add(P.body, part(G('rsPlateRim', () => { const g = new THREE.CylinderGeometry(0.17, 0.205, 0.07, 9); g.scale(1, 1, 0.66); return g; }), Icons.shade(bodyCol, 0.9), 0, 0.93, 0.005, P.body));
      add(P.body, part(G('rsCollar', () => { const g = new THREE.CylinderGeometry(0.085, 0.12, 0.05, 8); g.scale(1, 1, 0.8); return g; }), bodyCol, 0, 1.445, 0, P.body));
    }
    if (equip.legs && /_platelegs$|^bk_legs$|^wk_legs$/.test(equip.legs)) {
      const lt = Icons.shade(legCol, 1.35), dk = Icons.shade(legCol, 0.75);
      for (const l of [P.legL, P.legR]) { l.userData.upper.material = cmat(dk); l.userData.shin.material = cmat(dk); l.userData.knee.material = cmat(dk); }
      P.hips.material = cmat(dk);
      // fauld: light plate wrapping the hips, flaring over the thighs
      add(P.body, part(G('rsFauld', () => { const g = new THREE.CylinderGeometry(0.176, 0.2, 0.09, 9); g.scale(1, 1, 0.66); return g; }), Icons.shade(legCol, 1.15), 0, 0.905, 0.005, P.body));
      for (const l of [P.legL, P.legR]) {
        // big octagonal knee cop
        const kc = add(l.userData.kneeP, part(G('rsKneeCop2', () => { const g = new THREE.CylinderGeometry(0.078, 0.07, 0.07, 8); g.rotateX(Math.PI / 2); g.rotateZ(Math.PI / 8); g.scale(0.9, 0.85, 1); return g; }), Icons.shade(legCol, 1.12), 0, 0.0, 0.058, l.userData.kneeP));
      }
    }
    if (P.equip.head) { P.head.remove(P.equip.head); P.equip.head = null; }
    if (P.hair) P.hair.visible = !equip.head;
    if (equip.head) {
      const d = ITEMS[equip.head], c = d.icon.c || '#8a5a30';
      const h = new THREE.Group();
      if (d.icon.t === 'wizhat') { part(cyl(0.25, 0.25, 0.025, 12), c, 0, 0.35, 0, h); const k = part(cone(0.15, 0.48, 10), c, 0, 0.6, -0.03, h); k.rotation.x = -0.25; }
      else if (d.icon.t === 'cowl') { part(sph(0.185, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.75), '#8a5a30', 0, 0.2, -0.02, h, 1, 1.25, 1.1); }
      else {
        const dk = Icons.shade(c, 0.72);
        part(G('rsHelm2', () => { const g = new THREE.CylinderGeometry(0.182, 0.165, 0.3, 9, 1); g.rotateY(Math.PI / 9); return g; }), c, 0, 0.2, -0.005, h);
        part(G('rsHelmDome', () => { const g = new THREE.SphereGeometry(0.182, 9, 4, 0, Math.PI * 2, 0, Math.PI / 2); g.scale(1, 0.78, 1.02); return g; }), c, 0, 0.35, -0.005, h);
        // visor juts forward like a box face-guard
        part(G('rsVisor', () => { const g = new THREE.BoxGeometry(0.27, 0.19, 0.1); const p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getZ(i) > 0) { p.setX(i, p.getX(i) * 0.86); if (p.getY(i) < 0) p.setY(i, p.getY(i) * 0.7); } g.computeVertexNormals(); return g; }), Icons.shade(c, 1.08), 0, 0.2, 0.15, h);
        for (let k = 0; k < 4; k++) part(G('rsSlit', () => new THREE.BoxGeometry(0.026, 0.12, 0.012)), '#101010', -0.075 + k * 0.05, 0.215, 0.2, h);
        part(G('rsHelmRim', () => { const g = new THREE.CylinderGeometry(0.168, 0.168, 0.03, 9); return g; }), dk, 0, 0.06, 0, h);
        // plume
        if (d.icon.t === 'helm' && !d.icon.med) {
          const pl = new THREE.Group(); pl.position.set(0, 0.47, -0.02); h.add(pl);
          for (let k = 0; k < 4; k++) { const f = part(G('rsPlume' + k, () => new THREE.BoxGeometry(0.06, 0.13 - k * 0.012, 0.11 - k * 0.012)), k % 2 ? '#5a1a8a' : '#6e22a8', 0, 0.06 + k * 0.1, -0.04 - k * 0.06, pl); f.rotation.x = -0.35 - k * 0.22; }
        }
      }
      P.head.add(h); P.equip.head = h;
    }
    if (P.equip.neck) { P.body.remove(P.equip.neck); P.equip.neck = null; }
    if (equip.neck) P.equip.neck = part(sph(0.03, 6, 4), ITEMS[equip.neck].icon.c, 0, 1.36, 0.11, P.body);
    if (P.equip.cape) { P.body.remove(P.equip.cape); P.equip.cape = null; }
    if (equip.cape) { P.equip.cape = part(cyl(0.16, 0.26, 0.9, 8, 1, true), col(equip.cape), 0, 0.96, -0.1, P.body, 1, 1, 0.25); }
    if (P.equip.shield) { P.handL.remove(P.equip.shield); P.equip.shield = null; }
    if (equip.shield) {
      const def = ITEMS[equip.shield];
      const s = new THREE.Group();
      const c = def.icon.c || '#8a5a2a';
      if (def.icon.t === 'woodshield') { const cy = part(cyl(0.22, 0.22, 0.04, 12), c, 0, 0, 0, s); cy.rotation.z = Math.PI / 2; }
      else if (def.icon.t === 'kiteshield') {
        const kite = (sc) => { const sh = new THREE.Shape(); sh.moveTo(0, 0.3 * sc); sh.lineTo(0.22 * sc, 0.12 * sc); sh.lineTo(0.17 * sc, -0.12 * sc); sh.lineTo(0, -0.36 * sc); sh.lineTo(-0.17 * sc, -0.12 * sc); sh.lineTo(-0.22 * sc, 0.12 * sc); sh.closePath(); return sh; };
        const frameC = /^rune|^adamant|^mithril/.test(equip.shield) ? '#7a5a18' : Icons.shade(c, 0.6);
        const plate = new THREE.Group(); s.add(plate);
        const back = new THREE.Mesh(G('rsKiteBack', () => new THREE.ExtrudeGeometry(kite(1), { depth: 0.03, bevelEnabled: false })), cmat(frameC)); plate.add(back);
        const face = new THREE.Mesh(G('rsKiteFace', () => new THREE.ExtrudeGeometry(kite(0.86), { depth: 0.012, bevelEnabled: false })), cmat(c)); face.position.set(0, -0.006, 0.03); plate.add(face);
        const v = new THREE.Mesh(G('rsKiteV', () => new THREE.BoxGeometry(0.035, 0.6, 0.016)), cmat(frameC)); v.position.set(0, -0.03, 0.042); plate.add(v);
        const hz = new THREE.Mesh(G('rsKiteH', () => new THREE.BoxGeometry(0.38, 0.035, 0.016)), cmat(frameC)); hz.position.set(0, 0.07, 0.042); plate.add(hz);
        plate.scale.setScalar(1.3); plate.rotation.set(0, -0.35, 0.72); plate.position.set(-0.03, 0.04, 0.14);
      }
      else { const k = taper(0.38, 0.12, 0.52, 0.04, c, 0, -0.05, 0, s); k.rotation.y = Math.PI / 2; k.material = cmat(c); }
      s.position.set(-0.09, 0, 0.05);
      P.handL.add(s); P.equip.shield = s;
    }
    if (P.equip.weapon) { P.handR.remove(P.equip.weapon); P.equip.weapon = null; }
    if (equip.weapon) { P.equip.weapon = weaponMesh(equip.weapon); P.handR.add(P.equip.weapon); }
  }
  function setHeldTool(root, id) {
    const P = root.userData.parts;
    if (P.tool) { P.handR.remove(P.tool); P.tool = null; }
    if (P.equip.weapon) P.equip.weapon.visible = !id;
    P.toolId = id || null;
    if (id) { P.tool = weaponMesh(id); P.handR.add(P.tool); }
  }

  // Pose channels: arms (shoulder x/z, elbow), legs (hip, knee), body lean/twist/height, head.
  const POSE0 = { aRx: 0.1, aRz: 0.2, eR: -0.5, aLx: 0.1, aLz: -0.2, eL: -0.5, lLx: 0, kL: 0.04, lRx: 0, kR: 0.04, bX: 0, bY: 0, bZ: 0, bH: 0, hX: 0, hY: 0 };
  const ease = u => u * u * (3 - 2 * u);
  function keyed(t, frames) { // frames: [[time, pose], ...] looping over the last frame's time
    const T = frames[frames.length - 1][0], c = t % T;
    for (let i = 0; i < frames.length - 1; i++) { const [t0, p0] = frames[i], [t1, p1] = frames[i + 1]; if (c >= t0 && c <= t1) return mixPose(p0, p1, ease((c - t0) / Math.max(1e-6, t1 - t0))); }
    return frames[0][1];
  }
  function mixPose(p, q, u) { const o = {}; for (const k in POSE0) { const a = p[k] ?? POSE0[k], b = q[k] ?? POSE0[k]; o[k] = a + (b - a) * u; } return o; }
  function applyPose(P, q) {
    const g = k => q[k] ?? POSE0[k];
    P.armR.rotation.set(g('aRx'), 0, g('aRz')); P.armL.rotation.set(g('aLx'), 0, g('aLz'));
    P.armR.userData.elbow.rotation.set(g('eR'), 0, 0); P.armL.userData.elbow.rotation.set(g('eL'), 0, 0);
    P.legL.rotation.set(g('lLx'), 0, -0.11); P.legR.rotation.set(g('lRx'), 0, 0.11);
    P.legL.userData.foot.rotation.set(0, -0.3, 0.11); P.legR.userData.foot.rotation.set(0, 0.3, -0.11);
    P.legL.userData.kneeP.rotation.set(g('kL'), 0, 0); P.legR.userData.kneeP.rotation.set(g('kR'), 0, 0);
    P.body.rotation.set(g('bX'), g('bY'), g('bZ')); P.body.position.y = g('bH'); P.body.position.z = 0;
    P.head.rotation.set(g('hX'), g('hY'), 0);
  }
  // crouch helper: bends hips and knees together so the feet stay planted
  const crouch = (d, extra) => Object.assign({ lLx: -0.9 * d, kL: 1.7 * d, lRx: -0.9 * d, kR: 1.7 * d, bH: -0.2 * d, bX: 0.35 * d }, extra || {});
  function walkPose(time, moving, moveAnim) {
    const run = moving === 2, sp = run ? 10.5 : 7.9, ph = time * sp, s = Math.sin(ph), c = Math.cos(ph);
    if (moveAnim === 'crawl') return { bX: 1.3, bH: -0.55, aLx: -2.6 + s * 0.4, aRx: -2.6 - s * 0.4, lLx: s * 0.3, lRx: -s * 0.3, kL: 0.6, kR: 0.6 };
    if (moveAnim === 'climb') return { aLx: -2.6 + s * 0.5, aRx: -2.6 - s * 0.5, eL: -0.4, eR: -0.4, lLx: -0.6 + s * 0.5, lRx: -0.6 - s * 0.5, kL: 0.8, kR: 0.8, bH: 0.3 + Math.abs(s) * 0.2 };
    if (moveAnim === 'swing') return { aLx: -3.0, aRx: -3.0, lLx: -0.4, lRx: -0.4, kL: 0.5, kR: 0.5, bH: 0.2 + Math.sin(time * 4) * 0.15, bX: Math.sin(time * 4) * 0.3 };
    const amp = run ? 0.8 : 0.5;
    const q = {
      lLx: s * amp, lRx: -s * amp,
      kL: 0.08 + Math.max(0, -c) * (run ? 1.5 : 0.85), kR: 0.08 + Math.max(0, c) * (run ? 1.5 : 0.85),
      aLx: -s * amp * 0.75, aRx: s * amp * 0.75,
      eL: -(run ? 1.25 : 0.3) - Math.max(0, s) * 0.3, eR: -(run ? 1.25 : 0.3) - Math.max(0, -s) * 0.3,
      bH: Math.abs(c) * (run ? 0.07 : 0.035) - (run ? 0.03 : 0.01), bY: s * (run ? 0.1 : 0.06), bX: run ? 0.16 : 0.03, hY: -s * 0.05,
    };
    if (moveAnim === 'balance') Object.assign(q, { aLz: -1.4 + s * 0.15, aRz: 1.4 + s * 0.15, aLx: 0, aRx: 0, eL: 0, eR: 0, lLx: q.lLx * 0.5, lRx: q.lRx * 0.5, bZ: s * 0.08 });
    return q;
  }
  function actionPose(P, a, t, time) {
    const once = (d, frames) => { const tt = Math.min(t, d - 1e-3); return keyed(tt, frames); };
    switch (a) {
      case 'attack': case 'slash': return once(0.6, [[0, {}], [0.22, { aRx: -2.6, aRz: -0.5, eR: -1.3, bY: 0.4, aLx: -0.4 }], [0.36, { aRx: -1.0, aRz: 0.5, eR: -0.2, bY: -0.35, bX: 0.1, aLx: -0.2 }], [0.6, {}]]);
      case 'stab': return once(0.55, [[0, {}], [0.2, { aRx: -1.1, eR: -1.6, bY: 0.25 }], [0.32, { aRx: -1.55, eR: -0.05, bY: -0.3, bX: 0.12, lLx: -0.3, kL: 0.4 }], [0.55, {}]]);
      case 'punch': return once(0.45, [[0, {}], [0.15, { aRx: -1.2, eR: -1.8, bY: 0.2 }], [0.25, { aRx: -1.55, eR: 0, bY: -0.35 }], [0.45, {}]]);
      case 'block': return once(0.5, [[0, {}], [0.2, { aLx: -1.3, eL: -1.0, bX: -0.08 }], [0.5, {}]]);
      case 'shoot': return once(0.7, [[0, {}], [0.15, { aLx: -1.55, eL: 0, aRx: -1.55, eR: -0.6, bY: -0.45, hY: 0.45 }], [0.45, { aLx: -1.55, eL: 0, aRx: -1.5, aRz: 0.2, eR: -2.1, bY: -0.45, hY: 0.45 }], [0.55, { aLx: -1.55, eL: 0, aRx: -1.3, eR: -0.8, bY: -0.45, hY: 0.45 }], [0.7, {}]]);
      case 'cast': return once(0.8, [[0, {}], [0.25, { aRx: -2.4, eR: -0.8, aLx: -2.2, eL: -0.8, bX: -0.12 }], [0.45, { aRx: -1.5, eR: 0, aLx: -1.4, eL: 0, bX: 0.08 }], [0.8, {}]]);
      case 'chop': return keyed(t, [[0, { aRx: -1.25, aRz: 0.35, eR: -0.25, aLx: -1.2, aLz: -0.45, eL: -0.3, bY: -0.3, lLx: -0.25, kL: 0.3 }],
        [0.55, { aRx: -2.4, aRz: -0.2, eR: -1.25, aLx: -2.2, aLz: 0.35, eL: -1.2, bY: 0.55, bX: -0.08, lLx: -0.25, kL: 0.3, hY: -0.3 }],
        [0.75, { aRx: -1.2, aRz: 0.4, eR: -0.15, aLx: -1.15, aLz: -0.45, eL: -0.25, bY: -0.35, bX: 0.12, lLx: -0.25, kL: 0.3 }],
        [1.2, { aRx: -1.25, aRz: 0.35, eR: -0.25, aLx: -1.2, aLz: -0.45, eL: -0.3, bY: -0.3, lLx: -0.25, kL: 0.3 }]]);
      case 'mine': return keyed(t, [[0, { aRx: -0.9, eR: -0.3, aLx: -0.85, eL: -0.35, bX: 0.35, lLx: -0.35, kL: 0.5, kR: 0.2, bH: -0.04 }],
        [0.6, { aRx: -2.95, eR: -0.7, aLx: -2.8, eL: -0.7, bX: -0.15, lLx: -0.35, kL: 0.5, kR: 0.2, hX: -0.2 }],
        [0.82, { aRx: -0.8, eR: -0.2, aLx: -0.75, eL: -0.25, bX: 0.45, lLx: -0.35, kL: 0.5, kR: 0.2, bH: -0.06 }],
        [1.2, { aRx: -0.9, eR: -0.3, aLx: -0.85, eL: -0.35, bX: 0.35, lLx: -0.35, kL: 0.5, kR: 0.2, bH: -0.04 }]]);
      case 'fish': {
        const tool = P.toolId || '';
        if (/net/.test(tool)) return keyed(t, [[0, crouch(0.35, { aRx: -0.7, eR: -0.5, aLx: -0.7, eL: -0.5, hX: 0.3 })], [1.0, crouch(0.6, { aRx: -0.35, eR: -0.2, aLx: -0.35, eL: -0.2, bX: 0.6, hX: 0.4 })], [2.0, crouch(0.35, { aRx: -0.7, eR: -0.5, aLx: -0.7, eL: -0.5, hX: 0.3 })]]);
        if (/harpoon/.test(tool)) return keyed(t, [[0, { aRx: -1.4, eR: -0.6, aLx: -1.0, eL: -0.8, bX: 0.15 }], [0.7, { aRx: -2.6, eR: -1.4, aLx: -1.0, eL: -0.8, bX: -0.1, bY: 0.2 }], [0.9, { aRx: -1.0, eR: -0.1, aLx: -0.9, eL: -0.6, bX: 0.4, bY: -0.15, lLx: -0.3, kL: 0.4 }], [1.6, { aRx: -1.4, eR: -0.6, aLx: -1.0, eL: -0.8, bX: 0.15 }]]);
        if (/pot/.test(tool)) return keyed(t, [[0, crouch(0.3, { aRx: -1.0, eR: -0.4, aLx: -1.0, eL: -0.4 })], [1.4, crouch(0.6, { aRx: -0.5, eR: -0.1, aLx: -0.5, eL: -0.1, bX: 0.55 })], [2.8, crouch(0.3, { aRx: -1.0, eR: -0.4, aLx: -1.0, eL: -0.4 })]]);
        // rod: hold it out, with a flick every few seconds
        return keyed(t, [[0, { aRx: -1.0, eR: -0.7, aLx: -0.5, eL: -0.9, bX: 0.08, hX: 0.15 }], [2.2, { aRx: -1.05, eR: -0.75, aLx: -0.5, eL: -0.9, bX: 0.1, hX: 0.15 }], [2.45, { aRx: -1.7, eR: -1.1, aLx: -0.5, eL: -0.9, bX: -0.05 }], [2.7, { aRx: -0.9, eR: -0.5, aLx: -0.5, eL: -0.9, bX: 0.1 }], [3.2, { aRx: -1.0, eR: -0.7, aLx: -0.5, eL: -0.9, bX: 0.08, hX: 0.15 }]]);
      }
      case 'cook': return Object.assign(crouch(0.15), { aRx: -1.05, eR: -0.55, aRz: Math.sin(time * 3) * 0.15, aLx: -0.4, eL: -0.6, bX: 0.2, hX: 0.35 });
      case 'smith': return keyed(t, [[0, { aRx: -0.8, eR: -0.3, aLx: -0.9, eL: -0.9, bX: 0.25, hX: 0.35 }], [0.5, { aRx: -2.3, eR: -1.4, aLx: -0.9, eL: -0.9, bX: 0.05, hX: 0.3 }], [0.62, { aRx: -0.7, eR: -0.2, aLx: -0.9, eL: -0.9, bX: 0.3, hX: 0.4 }], [1.0, { aRx: -0.8, eR: -0.3, aLx: -0.9, eL: -0.9, bX: 0.25, hX: 0.35 }]]);
      case 'smelt': return { aRx: -1.3 + Math.sin(time * 2) * 0.1, eR: -0.3, aLx: -1.3 + Math.sin(time * 2) * 0.1, eL: -0.3, bX: 0.2, lLx: -0.3, kL: 0.4 };
      case 'fletch': return { aLx: -0.85, aLz: 0.2, eL: -1.0, aRx: -0.75 + Math.sin(time * 8) * 0.12, aRz: -0.25, eR: -1.1 + Math.sin(time * 8) * 0.3, hX: 0.45, bX: 0.08 };
      case 'firemake': return { lLx: -1.45, kL: 1.5, lRx: 0.35, kR: 2.0, bH: -0.4, bX: 0.35, aRx: -0.8 + Math.sin(time * 11) * 0.2, eR: -0.6, aLx: -0.7, eL: -0.8, hX: 0.4 };
      case 'craft': case 'herb': case 'spin': return { aRx: -0.85, aRz: 0.35, eR: -0.95 + Math.sin(time * 5) * 0.15, aLx: -0.85, aLz: -0.35, eL: -0.95 - Math.sin(time * 5) * 0.15, hX: 0.4, bX: 0.08 };
      case 'rake': { const s = Math.sin(time * 5); return { aRx: -0.9 + s * 0.4, eR: -0.4, aLx: -0.8 + s * 0.4, eL: -0.5, bX: 0.3, lLx: -0.3, kL: 0.4 }; }
      case 'harvest': case 'plant': return crouch(0.85, { aRx: -0.9 + Math.sin(time * 5) * 0.25, eR: -0.3, aLx: -0.9 - Math.sin(time * 5) * 0.25, eL: -0.3, bX: 0.65, hX: 0.3 });
      case 'bury': case 'pickup': { const u = Math.sin(Math.min(1, t / 0.9) * Math.PI); return crouch(u, { aRx: -1.0 * u, eR: -0.2, aLx: -0.8 * u, eL: -0.2, bX: 0.55 * u, hX: 0.3 * u }); }
      case 'eat': return once(0.9, [[0, {}], [0.3, { aRx: -1.6, eR: -2.0, aRz: 0.3, hX: -0.1 }], [0.6, { aRx: -1.6, eR: -2.0, aRz: 0.3 }], [0.9, {}]]);
      case 'pray': case 'craftrune': return { aRx: -0.9, aRz: 0.45, eR: -1.3, aLx: -0.9, aLz: -0.45, eL: -1.3, hX: 0.35 };
      case 'wave': return { aRx: -0.2, aRz: 2.6 + Math.sin(t * 10) * 0.35, eR: -0.5 };
      case 'bow': { const u = Math.sin(Math.min(1, t / 1.6) * Math.PI); return { bX: 0.8 * u, aRx: -0.9 * u, aRz: -0.5 * u, eR: -1.2 * u }; }
      case 'cheer': return { aLz: -2.7, aRz: 2.7, eL: -0.3, eR: -0.3, bH: Math.abs(Math.sin(t * 6)) * 0.18, kL: 0.3, kR: 0.3 };
      case 'dance': { const s = Math.sin(t * 8); return { bY: s * 0.5, aLz: -1.5 + s * 0.6, aRz: 1.5 + s * 0.6, eL: -0.6, eR: -0.6, kL: Math.max(0, s) * 0.8, kR: Math.max(0, -s) * 0.8, bH: Math.abs(s) * 0.08 }; }
      case 'yes': return { hX: Math.sin(t * 9) * 0.35 };
      case 'no': return { hY: Math.sin(t * 9) * 0.5 };
      case 'think': return { aRx: -1.5, aRz: 0.5, eR: -2.2, hX: 0.2 };
      case 'stunned': return { bZ: Math.sin(time * 6) * 0.05, hX: 0.2, aRz: -0.3, aLz: 0.3 };
      case 'death': { const p = Math.min(1, t / 1.0); return { bX: -p * Math.PI / 2, bH: p * 0.15, kL: p * 0.5, kR: p * 0.3, aRz: -p * 0.8, aLz: p * 0.8 }; }
      case 'teleport': return { aLz: -2.4, aRz: 2.4, eL: -0.3, eR: -0.3, hX: -0.4, bH: Math.min(0.4, t * 0.2) };
    }
    return null;
  }
  function animateHumanoid(root, anim, moving, time, moveAnim) {
    const P = root.userData.parts;
    const blend = root.userData.walkBlend ?? (moving ? 1 : 0), mv = moving || root.userData.lastMove || 1;
    if (P.cape) P.cape.rotation.x = 0.05 + 0.25 * blend;
    let q = { bH: Math.sin(time * 2) * 0.005 - 0.012, aRx: 0.12, aLx: 0.06, eR: -0.52, eL: -0.42, aRz: 0.22 + Math.sin(time * 1.6) * 0.01, aLz: -0.2 - Math.sin(time * 1.6) * 0.01, kL: 0.14, kR: 0.08, lLx: -0.08, lRx: -0.03, bY: 0.06, hY: -0.08 };
    const a = anim && anim.name;
    if (a && !(moving && !['attack', 'slash', 'stab', 'punch', 'shoot', 'cast', 'block', 'eat'].includes(a))) { const ap = actionPose(P, a, anim.t, time); if (ap) q = Object.assign({}, POSE0, ap); }
    if (blend > 0.001) {
      const w = walkPose(time, mv, moveAnim);
      if (a && moving) { // attacking while moving: legs walk, upper body acts
        const ap = actionPose(P, a, anim.t, time) || {};
        q = Object.assign({}, POSE0, w, { aRx: ap.aRx ?? w.aRx, aRz: ap.aRz ?? 0, eR: ap.eR ?? w.eR, aLx: ap.aLx ?? w.aLx, eL: ap.eL ?? w.eL, bY: ap.bY ?? w.bY });
      } else q = mixPose(q, w, Math.min(1, blend));
    }
    applyPose(P, q);
  }

  // ---------- Animals / monsters ----------
  function chicken() {
    const root = new THREE.Group(); const body = new THREE.Group(); root.add(body);
    const P = { body };
    box(0.3, 0.26, 0.42, '#f0ece0', 0, 0.32, 0, body);
    box(0.06, 0.2, 0.18, '#e4ddcf', 0, 0.45, -0.22, body).rotation.x = -0.5;
    P.head = pivot(body, 0, 0.5, 0.18);
    box(0.16, 0.18, 0.16, '#f4f0e6', 0, 0.05, 0, P.head);
    box(0.06, 0.09, 0.12, '#d02020', 0, 0.17, 0, P.head);
    box(0.07, 0.05, 0.09, '#e8b020', 0, 0.04, 0.12, P.head);
    box(0.02, 0.03, 0.02, '#101010', 0.07, 0.08, 0.04, P.head); box(0.02, 0.03, 0.02, '#101010', -0.07, 0.08, 0.04, P.head);
    P.legL = pivot(body, -0.07, 0.2, 0); P.legR = pivot(body, 0.07, 0.2, 0);
    for (const l of [P.legL, P.legR]) { box(0.03, 0.2, 0.03, '#e8b020', 0, -0.1, 0, l); box(0.08, 0.02, 0.1, '#e8b020', 0, -0.2, 0.03, l); }
    P.wingL = box(0.04, 0.18, 0.3, '#e4dcca', -0.17, 0.33, 0, body); P.wingR = box(0.04, 0.18, 0.3, '#e4dcca', 0.17, 0.33, 0, body);
    root.userData.parts = P; root.userData.kind = 'chicken';
    return root;
  }
  function quadBase(o) {
    const root = new THREE.Group(); const body = new THREE.Group(); root.add(body);
    const P = { body, legs: [] };
    root.userData.parts = P; root.userData.kind = 'quad';
    return [root, body, P];
  }
  function cow() {
    const [root, body, P] = quadBase();
    box(0.6, 0.55, 1.1, '#ecebe4', 0, 0.85, 0, body);
    box(0.62, 0.3, 0.35, '#2a2420', 0.0, 0.95, 0.15, body);
    box(0.4, 0.35, 0.3, '#2a2420', 0.12, 0.8, -0.32, body);
    box(0.25, 0.15, 0.2, '#e8b0b0', 0, 0.55, -0.2, body);
    P.head = pivot(body, 0, 1.0, 0.55);
    box(0.32, 0.34, 0.36, '#ecebe4', 0, 0, 0.12, P.head);
    box(0.33, 0.12, 0.12, '#d8a8a0', 0, -0.1, 0.32, P.head);
    box(0.34, 0.12, 0.2, '#2a2420', 0, 0.12, 0.05, P.head);
    box(0.06, 0.06, 0.12, '#e8e0c8', -0.19, 0.17, 0.0, P.head).rotation.x = -0.4;
    box(0.06, 0.06, 0.12, '#e8e0c8', 0.19, 0.17, 0.0, P.head).rotation.x = -0.4;
    box(0.04, 0.05, 0.02, '#101010', -0.12, 0.05, 0.3, P.head); box(0.04, 0.05, 0.02, '#101010', 0.12, 0.05, 0.3, P.head);
    for (const [x, z] of [[-0.2, 0.4], [0.2, 0.4], [-0.2, -0.4], [0.2, -0.4]]) { const l = pivot(body, x, 0.6, z); box(0.13, 0.6, 0.13, '#ecebe4', 0, -0.3, 0, l); box(0.14, 0.08, 0.14, '#3a3028', 0, -0.58, 0, l); P.legs.push(l); }
    P.tail = box(0.04, 0.4, 0.04, '#2a2420', 0, 0.8, -0.56, body);
    return root;
  }
  function rat() {
    const [root, body, P] = quadBase();
    box(0.3, 0.26, 0.55, '#6a6058', 0, 0.22, 0, body);
    P.head = pivot(body, 0, 0.26, 0.28);
    taper(0.08, 0.22, 0.25, 0.2, '#6a6058', 0, 0, 0.1, P.head).rotation.x = Math.PI / 2;
    box(0.06, 0.06, 0.04, '#e0a0a0', 0, 0, 0.24, P.head);
    box(0.08, 0.1, 0.02, '#c09090', -0.09, 0.12, 0.0, P.head); box(0.08, 0.1, 0.02, '#c09090', 0.09, 0.12, 0.0, P.head);
    box(0.03, 0.03, 0.02, '#ff2020', -0.07, 0.05, 0.12, P.head); box(0.03, 0.03, 0.02, '#ff2020', 0.07, 0.05, 0.12, P.head);
    P.tail = box(0.03, 0.03, 0.5, '#d0a0a0', 0, 0.18, -0.5, body);
    for (const [x, z] of [[-0.12, 0.18], [0.12, 0.18], [-0.12, -0.18], [0.12, -0.18]]) { const l = pivot(body, x, 0.12, z); box(0.06, 0.12, 0.06, '#5a5048', 0, -0.06, 0, l); P.legs.push(l); }
    return root;
  }
  function scorpion() {
    const [root, body, P] = quadBase();
    box(0.45, 0.2, 0.6, '#2a2018', 0, 0.25, 0, body);
    P.head = pivot(body, 0, 0.25, 0.32);
    box(0.3, 0.14, 0.2, '#3a2a1e', 0, 0, 0.05, P.head);
    for (const s of [-1, 1]) { box(0.08, 0.08, 0.35, '#3a2a1e', s * 0.25, 0, 0.25, P.head); box(0.14, 0.08, 0.14, '#4a3a2a', s * 0.27, 0, 0.45, P.head); }
    P.tail = new THREE.Group(); P.tail.position.set(0, 0.3, -0.3); body.add(P.tail);
    for (let i = 0; i < 4; i++) box(0.1, 0.1, 0.18, '#3a2a1e', 0, 0.12 + i * 0.13, -0.05 - i * 0.05 + (i > 2 ? 0.2 : 0), P.tail).rotation.x = -0.6 - i * 0.4;
    box(0.06, 0.12, 0.06, '#d0b040', 0, 0.62, 0.12, P.tail);
    for (let i = 0; i < 4; i++) { const l = pivot(body, (i % 2 ? 1 : -1) * 0.25, 0.2, (i < 2 ? 0.15 : -0.15)); box(0.25, 0.04, 0.04, '#2a2018', (i % 2 ? 1 : -1) * 0.1, -0.08, 0, l).rotation.z = (i % 2 ? -0.6 : 0.6); P.legs.push(l); }
    return root;
  }
  // ---------- shaped quadrupeds (rounded bodies, real heads, ears, horns, tails) ----------
  function beast(o) {
    const [root, body, P] = quadBase();
    const c = o.col, sh = k => Icons.shade(c, k);
    const L = o.len, Wd = o.wid, BH = o.bodyH, Y = o.legLen + BH * 0.42;
    // body: main barrel + chest + rump for a less "box" silhouette
    part(sph(0.5, 8, 6), c, 0, Y, 0, body, Wd, BH, L);
    part(sph(0.5, 7, 5), c, 0, Y + BH * 0.04, L * 0.28, body, Wd * 1.04, BH * 1.04, L * 0.45);
    part(sph(0.5, 7, 5), sh(0.95), 0, Y + BH * 0.02, -L * 0.3, body, Wd * 1.02, BH * 1.0, L * 0.45);
    if (o.belly) part(sph(0.5, 7, 4), o.belly, 0, Y - BH * 0.28, 0, body, Wd * 0.8, BH * 0.45, L * 0.75);
    if (o.patches) for (const [x, y, z, r] of o.patches) part(sph(r, 6, 4), o.patches.col || '#2a2420', x * Wd, Y + y * BH, z * L, body, 1, 0.7, 1.3);
    if (o.udder) part(sph(0.09, 6, 4), o.udder, 0, Y - BH * 0.5, -L * 0.2, body, 1.3, 0.8, 1.2);
    if (o.hump) part(sph(0.5, 7, 5), c, 0, Y + BH * 0.5, -L * 0.05, body, Wd * 0.7, BH * 0.8, L * 0.4);
    // legs: thigh + shin + hoof/paw
    const lx = Wd * 0.32, lz = L * 0.33;
    for (const [x, z] of [[-lx, lz], [lx, lz], [-lx, -lz], [lx, -lz]]) {
      const l = pivot(body, x, Y - BH * 0.15, z);
      part(cyl(o.legW * 1.35, o.legW, o.legLen * 0.55, 6), z > 0 ? c : sh(0.95), 0, -o.legLen * 0.25, 0, l);
      part(cyl(o.legW, o.legW * 0.85, o.legLen * 0.55, 6), o.lower || c, 0, -o.legLen * 0.7, 0, l);
      part(G('hoof' + o.legW, () => new THREE.BoxGeometry(o.legW * 2.3, 0.07, o.legW * 2.6)), o.hoof || sh(0.4), 0, -o.legLen - BH * 0.12 + 0.035, o.paw ? o.legW * 0.5 : 0, l);
      P.legs.push(l);
    }
    // neck + head
    const nk = pivot(body, 0, Y + BH * 0.2, L * 0.42);
    if (o.neckLen) { const n = part(cyl(o.neckW || Wd * 0.22, o.neckW * 1.3 || Wd * 0.3, o.neckLen, 6), c, 0, o.neckLen * 0.4, o.neckLen * 0.25, nk); n.rotation.x = o.neckTilt ?? 0.6; }
    P.head = pivot(nk, 0, o.neckLen ? o.neckLen * 0.8 : BH * 0.15, o.neckLen ? o.neckLen * 0.5 : 0.05);
    const hl = o.headLen, hw = o.headW;
    part(sph(0.5, 7, 5), c, 0, 0, hl * 0.25, P.head, hw, hw * 0.95, hl * 0.7);
    part(sph(0.5, 7, 5), o.snoutCol || c, 0, -hw * 0.12, hl * 0.62, P.head, hw * (o.snoutW || 0.7), hw * 0.62, hl * 0.55);
    part(sph(0.03, 4, 3), '#1a1010', -hw * 0.15, -hw * 0.05, hl * 0.9, P.head); part(sph(0.03, 4, 3), '#1a1010', hw * 0.15, -hw * 0.05, hl * 0.9, P.head);
    for (const s of [-1, 1]) {
      part(sph(0.035, 5, 4), o.eye || '#101010', s * hw * 0.38, hw * 0.18, hl * 0.42, P.head);
      if (o.ears === 'pointy') { const e = part(cone(hw * 0.2, hw * 0.55, 4), sh(0.9), s * hw * 0.28, hw * 0.55, hl * 0.12, P.head); e.rotation.z = -s * 0.25; }
      else if (o.ears === 'round') part(sph(hw * 0.17, 5, 4), sh(0.85), s * hw * 0.38, hw * 0.45, hl * 0.1, P.head, 1, 1, 0.5);
      else if (o.ears === 'side') { const e = part(sph(hw * 0.2, 5, 4), sh(0.92), s * hw * 0.6, hw * 0.25, hl * 0.05, P.head, 1.4, 0.55, 0.8); e.rotation.z = s * 0.3; }
      if (o.horns) { const h = part(cone(hw * 0.09, hw * 0.55, 5), o.horns, s * hw * 0.45, hw * 0.45, hl * 0.12, P.head); h.rotation.z = -s * 1.0; h.rotation.x = -0.3; }
    }
    if (o.horn) { const h = part(cone(hw * 0.09, hw * 0.9, 6), o.horn, 0, hw * 0.55, hl * 0.4, P.head); h.rotation.x = 0.5; }
    if (o.mane) for (let i = 0; i < 4; i++) part(G('mane', () => new THREE.BoxGeometry(0.05, 0.16, 0.12)), o.mane, 0, (o.neckLen || 0.3) * (0.2 + i * 0.22), -0.02 + i * 0.05, nk);
    // tail
    P.tail = new THREE.Group(); P.tail.position.set(0, Y + BH * 0.25, -L * 0.5); body.add(P.tail);
    if (o.tail === 'bushy') { const t = part(sph(0.5, 6, 4), o.tailCol || c, 0, -0.08, -0.22, P.tail, 0.14, 0.14, 0.5); t.rotation.x = -0.5; }
    else if (o.tail) { const t = part(cyl(0.025, 0.02, o.tailLen || 0.45, 4), o.tailCol || c, 0, -(o.tailLen || 0.45) * 0.45, -0.05, P.tail); t.rotation.x = 0.25; if (o.tail === 'tuft') part(sph(0.06, 5, 4), o.tailCol || '#2a2420', 0, -(o.tailLen || 0.45) * 0.92, -0.12, P.tail, 1, 1.6, 1); }
    if (o.scale) root.scale.setScalar(o.scale);
    return root;
  }
  const BEASTS = {
    jackal: { col: '#c8a060', len: 0.8, wid: 0.36, bodyH: 0.36, legLen: 0.42, legW: 0.045, headLen: 0.44, headW: 0.24, snoutW: 0.5, ears: 'pointy', tail: 'bushy', tailCol: '#a08048', neckLen: 0.16, neckTilt: 0.9, paw: true, hoof: '#5a4a30', belly: '#e0c890' },
    crocodile: { col: '#3a5a2a', len: 1.6, wid: 0.55, bodyH: 0.3, legLen: 0.18, legW: 0.07, headLen: 0.8, headW: 0.3, snoutW: 0.75, ears: null, tail: 'thin', tailLen: 1.1, tailCol: '#34522a', neckLen: 0.05, neckTilt: 1.5, paw: true, hoof: '#2a3a1a', belly: '#a8a878', eye: '#e0c020' },
    hellhound: { col: '#5a1a12', len: 1.15, wid: 0.5, bodyH: 0.52, legLen: 0.6, legW: 0.065, headLen: 0.55, headW: 0.34, snoutW: 0.55, ears: 'pointy', tail: 'thin', tailLen: 0.6, tailCol: '#3a0a08', neckLen: 0.22, neckTilt: 0.8, paw: true, hoof: '#1a0a08', belly: '#7a2a18', eye: '#ffcc00', horns: '#2a1a10', scale: 1.15 },
    cow: { col: '#ecebe4', len: 1.15, wid: 0.62, bodyH: 0.6, legLen: 0.55, legW: 0.065, headLen: 0.42, headW: 0.34, snoutCol: '#d8a8a0', ears: 'side', horns: '#e8e0c8', tail: 'tuft', tailCol: '#2a2420', udder: '#e8b0b0', neckLen: 0.22, neckTilt: 1.0, lower: '#e0dcd0', hoof: '#3a3028',
      patches: Object.assign([[0.45, 0.2, 0.15, 0.17], [-0.42, 0.05, -0.2, 0.2], [0.2, 0.42, -0.32, 0.14], [-0.3, 0.38, 0.3, 0.12]], { col: '#2a2420' }) },
    bear: { col: '#5a3a1e', len: 1.2, wid: 0.8, bodyH: 0.75, legLen: 0.45, legW: 0.1, headLen: 0.42, headW: 0.42, snoutCol: '#8a6a44', snoutW: 0.55, ears: 'round', tail: null, neckLen: 0.12, neckTilt: 1.2, paw: true, hoof: '#2a1a10' },
    wolf: { col: '#c8c8d0', len: 0.95, wid: 0.42, bodyH: 0.42, legLen: 0.5, legW: 0.05, headLen: 0.5, headW: 0.28, snoutW: 0.55, ears: 'pointy', tail: 'bushy', neckLen: 0.2, neckTilt: 0.9, paw: true, hoof: '#4a4a50', belly: '#e8e8ee', eye: '#c0a020' },
    camel: { col: '#c8a060', len: 1.1, wid: 0.5, bodyH: 0.55, legLen: 1.0, legW: 0.06, headLen: 0.4, headW: 0.24, snoutW: 0.6, ears: 'round', hump: true, tail: 'tuft', tailCol: '#8a6a3a', neckLen: 0.7, neckTilt: 0.5, hoof: '#6a5030' },
    unicorn: { col: '#ececf4', len: 1.1, wid: 0.45, bodyH: 0.5, legLen: 0.8, legW: 0.055, headLen: 0.5, headW: 0.26, snoutW: 0.6, ears: 'pointy', horn: '#e8c030', mane: '#c8b8ff', tail: 'tuft', tailCol: '#c8b8ff', tailLen: 0.6, neckLen: 0.5, neckTilt: 0.5, hoof: '#a09070' },
    catablepon: { col: '#3a4a2a', len: 1.25, wid: 0.72, bodyH: 0.7, legLen: 0.55, legW: 0.08, headLen: 0.48, headW: 0.4, snoutCol: '#4a5a3a', ears: 'side', horns: '#d8d0b0', tail: 'tuft', neckLen: 0.15, neckTilt: 1.3, hoof: '#1a1a10', eye: '#e02020' },
  };

  // ---------- dragon: long neck, horned head, membrane wings, tapering tail ----------
  function dragonModel() {
    const [root, body, P] = quadBase();
    const c = '#2a7a2a', w = '#3a8a3a', belly = '#c8b880';
    part(sph(0.5, 8, 6), c, 0, 1.25, 0, body, 1.0, 0.85, 2.0);
    part(sph(0.5, 7, 5), belly, 0, 1.0, 0.1, body, 0.8, 0.4, 1.6);
    for (let i = 0; i < 6; i++) { const sp = part(cone(0.08, 0.25, 4), '#1a4a1a', 0, 1.7 - Math.abs(i - 1.5) * 0.04, 0.6 - i * 0.3, body); sp.rotation.x = -0.3; }
    // neck from segments
    const nk = pivot(body, 0, 1.45, 0.85);
    for (let i = 0; i < 4; i++) part(sph(0.5, 6, 5), i % 2 ? c : Icons.shade(c, 0.92), 0, 0.12 + i * 0.16, 0.08 + i * 0.1, nk, 0.38 - i * 0.03, 0.34, 0.38);
    P.head = pivot(nk, 0, 0.72, 0.5);
    part(sph(0.5, 7, 5), c, 0, 0, 0, P.head, 0.42, 0.36, 0.55);
    part(sph(0.5, 7, 5), c, 0, -0.05, 0.36, P.head, 0.3, 0.22, 0.5);
    part(sph(0.5, 6, 4), belly, 0, -0.16, 0.3, P.head, 0.26, 0.1, 0.48);
    for (const s of [-1, 1]) {
      part(sph(0.045, 5, 4), '#ff3010', s * 0.15, 0.08, 0.18, P.head);
      const h = part(cone(0.05, 0.38, 5), '#e8e0c8', s * 0.12, 0.2, -0.12, P.head); h.rotation.x = -1.0; h.rotation.z = -s * 0.25;
      part(cone(0.02, 0.07, 4), '#f0f0e0', s * 0.08, -0.15, 0.55, P.head).rotation.x = Math.PI;
    }
    // wings: bones + membrane triangles
    const memb = new THREE.BufferGeometry();
    memb.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1.8, 0.5, -0.2, 1.4, -0.1, -0.9, 0, 0, 0, 1.4, -0.1, -0.9, 0.6, -0.25, -1.1], 3));
    memb.computeVertexNormals();
    const wm = new THREE.MeshLambertMaterial({ color: w, side: THREE.DoubleSide, flatShading: true });
    P.wings = [];
    for (const s of [-1, 1]) {
      const wg = pivot(body, s * 0.35, 1.6, 0.35); P.wings.push(wg);
      const m = new THREE.Mesh(memb, wm); m.scale.x = s; wg.add(m);
      const bone = part(cyl(0.035, 0.05, 1.9, 5), '#1a4a1a', s * 0.9, 0.25, -0.1, wg); bone.rotation.z = -s * 1.3;
      wg.rotation.z = s * 0.25;
    }
    // legs
    for (const [x, z] of [[-0.4, 0.65], [0.4, 0.65], [-0.42, -0.6], [0.42, -0.6]]) {
      const l = pivot(body, x, 1.05, z);
      part(cyl(0.16, 0.12, 0.55, 6), c, 0, -0.25, 0, l); part(cyl(0.11, 0.09, 0.5, 6), Icons.shade(c, 0.9), 0, -0.7, 0.05, l);
      for (let k = -1; k <= 1; k++) part(cone(0.035, 0.14, 4), '#e8e0c8', k * 0.07, -0.95, 0.16, l).rotation.x = Math.PI / 2;
      P.legs.push(l);
    }
    // tapering tail
    P.tail = new THREE.Group(); P.tail.position.set(0, 1.15, -0.95); body.add(P.tail);
    for (let i = 0; i < 6; i++) part(sph(0.5, 6, 4), i % 2 ? c : Icons.shade(c, 0.9), 0, -i * 0.06, -0.2 - i * 0.28, P.tail, 0.32 - i * 0.045, 0.28 - i * 0.04, 0.4);
    const tip = part(cone(0.1, 0.3, 4), '#1a4a1a', 0, -0.36, -1.9, P.tail); tip.rotation.x = -Math.PI / 2;
    return root;
  }

  function animateAnimal(root, anim, moving, time) {
    const P = root.userData.parts;
    const kind = root.userData.kind;
    P.body.rotation.set(0, 0, 0); P.body.position.y = 0;
    if (P.head) P.head.rotation.set(0, 0, 0);
    const a = anim && anim.name, t = anim ? anim.t : 0;
    if (kind === 'chicken') {
      P.legL.rotation.x = 0; P.legR.rotation.x = 0;
      if (moving) { const s = Math.sin(time * 14); P.legL.rotation.x = s * 0.7; P.legR.rotation.x = -s * 0.7; P.body.position.y = Math.abs(s) * 0.03; P.head.rotation.x = s * 0.2; }
      else if (Math.sin(time * 0.7 + root.id) > 0.85) P.head.rotation.x = 0.9;
      P.wingL.rotation.z = 0; P.wingR.rotation.z = 0;
      if (a === 'attack') { const sw = Math.sin(Math.min(1, t / 0.4) * Math.PI); P.wingL.rotation.z = sw; P.wingR.rotation.z = -sw; P.head.rotation.x = sw * 0.8; P.body.position.y = sw * 0.1; }
    } else {
      for (const l of P.legs) l.rotation.x = 0;
      if (moving) { const s = Math.sin(time * 8); P.legs.forEach((l, i) => { l.rotation.x = (i === 0 || i === 3 ? 1 : -1) * s * 0.5; }); }
      else if (P.head && Math.sin(time * 0.4 + root.id) > 0.6) P.head.rotation.x = 0.6;
      if (P.tail) P.tail.rotation.z = Math.sin(time * 3) * 0.3;
      if (P.wings) P.wings.forEach((w, i) => { w.rotation.z = (i ? 1 : -1) * (0.25 + Math.sin(time * (moving ? 6 : 1.5)) * (moving ? 0.35 : 0.08)); });
      if (a === 'attack') { const sw = Math.sin(Math.min(1, t / 0.4) * Math.PI); if (P.head) P.head.rotation.x = -0.4 * sw; P.body.rotation.x = -0.15 * sw; if (P.tail && root.userData.sting) P.tail.rotation.x = 0.6 * sw; }
    }
    if (a === 'death') { const p = Math.min(1, t / 0.8); P.body.rotation.z = p * Math.PI / 2; P.body.position.y = p * 0.1; }
  }

  const pickC = a => a[Math.floor(Math.random() * a.length)];
  const MAN_SHIRTS = ['#7a2a2a', '#2a5a7a', '#5a6a2a', '#6a4a2a', '#4a2a6a', '#8a6a2a'];
  let manI = 0;
  function npcModel(kind) {
    switch (kind) {
      case 'chicken': return chicken();
      case 'cow': return beast(BEASTS.cow);
      case 'rat': return rat();
      case 'scorpion': { const s = scorpion(); s.userData.sting = true; return s; }
      case 'goblin': { const g = humanoid({ skin: '#5c8a3a', hair: null, shirt: '#7a6a4a', pants: '#5a4a32', boots: '#3a2a1a', scale: 0.78, ears: true, sleeves: false }); const P = g.userData.parts; P.head.scale.setScalar(1.3); const n = part(cone(0.05, 0.16, 5), '#4c7a2a', 0, 0.16, 0.2, P.head); n.rotation.x = Math.PI / 2; part(G('gtooth', () => new THREE.BoxGeometry(0.02, 0.04, 0.02)), '#f0f0d0', 0.04, 0.09, 0.15, P.head); return g; }
      case 'man': { const c = MAN_SHIRTS[manI++ % MAN_SHIRTS.length]; return humanoid({ skin: manI % 3 ? '#c8915c' : '#a06a40', hair: manI % 2 ? '#3a2410' : '#7a5a30', shirt: c, pants: '#5a4a3a', beard: manI % 4 === 0 ? '#3a2410' : null }); }
      case 'woman': { const c = MAN_SHIRTS[(manI++ + 3) % MAN_SHIRTS.length]; return humanoid({ skin: '#d0a070', hair: '#8a4a1a', shirt: c, pants: c, robe: Icons.shade(c, 0.85) }); }
      case 'bandit': return humanoid({ skin: '#b07a4c', hair: '#201810', shirt: '#4a4a3a', pants: '#2a2a2a', hood: '#2a2a22' });
      case 'skeleton': {
        const s = humanoid({ skin: '#e0dccc', hair: null, shirt: '#d8d4c4', pants: '#d0ccbc', boots: '#c8c4b4', scale: 1.0, sleeves: false });
        s.userData.parts.torso.scale.set(0.7, 1, 0.45); s.userData.parts.chest.scale.set(0.8, 0.7, 0.5);
        for (const l of [s.userData.parts.legL, s.userData.parts.legR]) { l.userData.upper.scale.set(0.55, 1, 0.55); l.userData.shin.scale.set(0.55, 1, 0.55); }
        for (const a of [s.userData.parts.armL, s.userData.parts.armR]) { a.userData.upper.scale.set(0.6, 1, 0.6); a.userData.fore.scale.set(0.6, 1, 0.6); }
        applyEquipment(s, { weapon: 'iron_scimitar' }); return s;
      }
      case 'guard': {
        const g = humanoid({ skin: '#c8915c', hair: '#4a2e16', shirt: '#6e6a66', pants: '#5a5650', boots: '#2a2a2a', beard: '#4a2e16' });
        applyEquipment(g, { head: 'iron_full_helm', body: 'iron_platebody', legs: 'iron_platelegs', weapon: 'iron_sword', shield: 'iron_kiteshield' });
        return g;
      }
      case 'ogre': return humanoid({ skin: '#a0603a', hair: '#2a1a10', shirt: '#5a3a1a', pants: '#4a3a2a', boots: '#2a1a10', scale: 1.55, ears: true, sleeves: false });
      case 'banker': return humanoid({ skin: '#c8915c', hair: '#8a8a8a', shirt: '#2a3a7a', pants: '#20202a', boots: '#151515' });
      case 'shopkeeper': return humanoid({ skin: '#c8915c', hair: '#6a4020', shirt: '#2a6a3a', pants: '#4a3a2a', beard: '#6a4020', apron: '#e8e0d0' });
      case 'elder': return humanoid({ skin: '#d0a070', hair: '#e0e0e0', shirt: '#5a2a6a', pants: '#5a2a6a', beard: '#e8e8e8', robe: '#5a2a6a' });
      case 'smith': return humanoid({ skin: '#c08050', hair: '#b04a20', shirt: '#6a5040', pants: '#3a3028', sleeves: false, apron: '#4a3020' });
      case 'mage': return humanoid({ skin: '#d0a070', hair: '#c0c0c0', shirt: '#2a3a9a', pants: '#2a3a9a', robe: '#2a3a9a', wizhat: '#2a3a9a', beard: null });
      case 'fletcher': return humanoid({ skin: '#c8915c', hair: '#5a3a18', shirt: '#2a6a2a', pants: '#5a4a2a', hood: '#2a5a2a' });
      case 'herbalist': return humanoid({ skin: '#d0a070', hair: '#3a2a10', shirt: '#4a7a3a', pants: '#4a7a3a', robe: '#3a6a2a' });
      case 'farmer': return humanoid({ skin: '#c8915c', hair: '#8a5a20', shirt: '#8a7a5a', pants: '#3a4a6a', strawhat: true });
      case 'tanner': return humanoid({ skin: '#b07a4c', hair: '#3a2410', shirt: '#7a6a5a', pants: '#4a3a2a', apron: '#6a4020', beard: '#3a2410' });
      case 'slayer': { const g = humanoid({ skin: '#b07a4c', hair: '#202020', shirt: '#2a2a2a', pants: '#2a2a2a', cape: '#5a0a0a', beard: '#202020' }); applyEquipment(g, { body: 'iron_platebody', weapon: 'iron_scimitar' }); return g; }
      case 'kharid': return humanoid({ skin: '#a06a40', hair: '#1a1a1a', shirt: '#6a2a7a', pants: '#e8e0c8', hood: '#e8e0c8' });
      case 'zeke': return humanoid({ skin: '#a06a40', hair: '#1a1a1a', shirt: '#c08020', pants: '#e8e0c8', beard: '#1a1a1a', hat: '#c02020' });
      case 'white_knight': { const g = humanoid({ skin: '#c8915c', hair: '#4a2e16', shirt: '#e8e8e8', pants: '#e0e0e0', boots: '#d0d0d0' }); applyEquipment(g, { head: 'wk_helm', body: 'wk_body', legs: 'wk_legs', weapon: 'mithril_sword', shield: 'wk_shield' }); return g; }
      case 'jogre': return humanoid({ skin: '#6a8a3a', hair: null, shirt: '#5a4a2a', pants: '#4a3a1a', boots: '#3a2a1a', scale: 1.45, ears: true, sleeves: false });
      case 'banshee': { const g = humanoid({ skin: '#c0c8d8', hair: '#e8e8f0', shirt: '#a0a8b8', pants: '#a0a8b8', robe: '#909aac' }); g.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.75; } }); return g; }
      case 'hand': { const [root, body, P] = quadBase(); box(0.3, 0.12, 0.35, '#c8a888', 0, 0.12, 0, body); for (let i = 0; i < 4; i++) { const f = pivot(body, -0.12 + i * 0.08, 0.1, 0.18); box(0.05, 0.05, 0.25, '#c8a888', 0, -0.03, 0.1, f); P.legs.push(f); } box(0.07, 0.05, 0.18, '#c8a888', 0.2, 0.1, 0.05, body).rotation.y = -0.6; return root; }
      case 'spider': { const [root, body, P] = quadBase(); box(0.5, 0.3, 0.6, '#2a2a1a', 0, 0.4, -0.15, body); P.head = pivot(body, 0, 0.4, 0.25); box(0.32, 0.24, 0.3, '#3a3a20', 0, 0, 0, P.head); box(0.05, 0.05, 0.02, '#ff2020', -0.08, 0.05, 0.15, P.head); box(0.05, 0.05, 0.02, '#ff2020', 0.08, 0.05, 0.15, P.head);
        for (let i = 0; i < 8; i++) { const s = i < 4 ? -1 : 1, k = i % 4; const l = pivot(body, s * 0.22, 0.42, 0.2 - k * 0.15); const seg = box(0.55, 0.05, 0.05, '#1a1a10', s * 0.25, 0.05, 0, l); seg.rotation.z = -s * 0.5; P.legs.push(l); } return root; }
      case 'dragon': return dragonModel();
      case 'dark_wizard': return humanoid({ skin: '#c8a080', hair: '#1a1a1a', shirt: '#2a1a4a', pants: '#2a1a4a', robe: '#2a1a4a', wizhat: '#1a1a2a', beard: '#3a3a3a' });
      case 'hill_giant': return humanoid({ skin: '#c8a070', hair: '#5a3a1a', shirt: '#7a5a3a', pants: '#5a4028', boots: '#3a2a18', scale: 1.7, sleeves: false });
      case 'barbarian': return humanoid({ skin: '#d0a070', hair: '#c08030', shirt: '#7a6a5a', pants: '#5a4a3a', beard: '#c08030', sleeves: false });
      case 'imp': return humanoid({ skin: '#c03020', hair: null, shirt: '#c03020', pants: '#a02818', boots: '#601810', scale: 0.55, ears: true, sleeves: false });
      case 'hans': return humanoid({ skin: '#c8915c', hair: '#3a2a1a', shirt: '#6a2a8a', pants: '#3a2a4a' });
      case 'duke': return humanoid({ skin: '#d0a070', hair: '#8a8a8a', shirt: '#8a1a1a', pants: '#2a2a2a', cape: '#2a3aa0', beard: '#9a9a9a' });
      case 'cook': return humanoid({ skin: '#d0a070', hair: '#5a3a1a', shirt: '#f0f0f0', pants: '#e8e8e8', hat: '#f8f8f8', apron: '#ffffff' });
      case 'bot': return humanoid(arguments[1]);
      case 'ghast': { const g = humanoid({ skin: '#a0c090', hair: null, shirt: '#80a070', pants: '#80a070', robe: '#6a8a5a', ears: true }); g.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.7; } }); return g; }
      case 'frog': { const [root, body, P] = quadBase(); box(0.8, 0.5, 0.9, '#4a8a2a', 0, 0.4, 0, body); P.head = pivot(body, 0, 0.55, 0.45); box(0.7, 0.3, 0.4, '#5a9a3a', 0, 0, 0.1, P.head); for (const s of [-1, 1]) { mesh(G('feye', () => new THREE.SphereGeometry(0.1, 6, 4)), '#e8e040', s * 0.25, 0.18, 0.1, P.head); }
        for (const [x, z] of [[-0.4, 0.3], [0.4, 0.3], [-0.45, -0.35], [0.45, -0.35]]) { const l = pivot(body, x, 0.3, z); box(0.18, 0.3, 0.35, '#3a7a22', 0, -0.15, 0, l); P.legs.push(l); } return root; }
      case 'zombie': return humanoid({ skin: '#7a9a6a', hair: '#2a2a1a', shirt: '#4a4a3a', pants: '#3a3a2a', boots: '#2a2a1a' });
      case 'spider_small': { const s = npcModel('spider'); s.scale.setScalar(0.45); return s; }
      case 'unicorn': return beast(BEASTS.unicorn);
      case 'bear': return beast(BEASTS.bear);
      case 'wolf': return beast(BEASTS.wolf);
      case 'hobgoblin': return humanoid({ skin: '#8a7a4a', hair: null, shirt: '#6a3a2a', pants: '#4a3a2a', boots: '#2a1a10', scale: 1.15, ears: true, sleeves: false });
      case 'black_knight': { const g = humanoid({ skin: '#c8915c', hair: '#1a1a1a', shirt: '#2a2a2a', pants: '#2a2a2a' }); applyEquipment(g, { head: 'bk_helm', body: 'bk_body', legs: 'bk_legs', weapon: 'iron_sword', shield: 'bk_shield' }); return g; }
      case 'moss_giant': return humanoid({ skin: '#a08a60', hair: '#4a7a2a', shirt: '#4a6a2a', pants: '#3a5a1a', boots: '#2a2a1a', beard: '#4a8a2a', scale: 1.8, sleeves: false });
      case 'ice_giant': return humanoid({ skin: '#a0c0e0', hair: '#e0f0ff', shirt: '#7aa0c8', pants: '#5a80a8', boots: '#3a5a80', beard: '#e0f0ff', scale: 1.8, sleeves: false });
      case 'ice_warrior': { const g = humanoid({ skin: '#a0d0f0', hair: null, shirt: '#80c0e8', pants: '#80c0e8', boots: '#60a0d0' }); g.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.85; } }); return g; }
      case 'greater_demon': { const d = npcModel('demon'); d.scale.setScalar(1.25); return d; }
      case 'blue_dragon': { const d = npcModel('dragon'); d.traverse(o => { if (o.material && o.material.color) { const c = o.material.color.getHexString(); if (c === '2a7a2a' || c === '3a8a3a') { o.material = o.material.clone(); o.material.color.set(c === '2a7a2a' ? '#2a4a9a' : '#3a5ab0'); } } }); d.scale.setScalar(1.15); return d; }
      case 'guide': return humanoid({ skin: '#c8915c', hair: '#6a4a2a', shirt: '#2a5aa0', pants: '#3a3a5a', cape: '#c0a010', hat: '#2a5aa0' });
      case 'gnome': return humanoid({ skin: '#c8a070', hair: '#8a5a20', shirt: pickC(['#4a8a2a', '#8a2a2a', '#2a4a8a', '#8a6a2a']), pants: '#5a4a2a', scale: 0.6, ears: true, hat: pickC(['#c03020', '#2a6aa0', '#4a8a2a']) });
      case 'gnome_guard': { const g = humanoid({ skin: '#c8a070', hair: '#5a3a10', shirt: '#4a6a2a', pants: '#3a4a2a', scale: 0.62, ears: true }); applyEquipment(g, { weapon: 'iron_sword', head: 'iron_full_helm' }); return g; }
      case 'gnome_king': return humanoid({ skin: '#c8a070', hair: '#e0e0e0', shirt: '#8a1a8a', pants: '#5a1a5a', scale: 0.65, ears: true, beard: '#e8e8e8', hat: '#e8c030', cape: '#c02020' });
      case 'goblin_warrior': { const g = humanoid({ skin: '#5c8a3a', hair: null, shirt: '#8a6a3a', pants: '#5a4a32', boots: '#3a2a1a', scale: 0.85, ears: true, sleeves: false }); applyEquipment(g, { weapon: 'bronze_scimitar', head: 'bronze_full_helm', shield: 'wooden_shield' }); return g; }
      case 'priest': return humanoid({ skin: '#d0a070', hair: '#5a4a3a', shirt: '#1a1a1a', pants: '#1a1a1a', robe: '#1a1a1a' });
      case 'hunter': return humanoid({ skin: '#b07a4c', hair: '#5a3a18', shirt: '#6a5a2a', pants: '#4a3a1a', hood: null, cape: '#3a5a2a', beard: '#5a3a18' });
      case 'demon': { const d = humanoid({ skin: '#a01a10', hair: null, shirt: '#a01a10', pants: '#801408', boots: '#401008', scale: 1.5, sleeves: false, ears: true });
        const P = d.userData.parts; for (const s of [-1, 1]) { const h = Models.cone(0.05, 0.25, 4); const m = new THREE.Mesh(h, mat('#e8e0c0')); m.position.set(s * 0.1, 0.42, 0); m.rotation.z = -s * 0.4; P.head.add(m); const w = box(0.04, 0.6, 0.5, '#601008', s * 0.25, 1.15, -0.25, P.body); w.rotation.y = s * 0.6; } return d; }
      case 'knight_ardy': { const g = humanoid({ skin: '#c8915c', hair: '#4a2e16', shirt: '#2a4a9a', pants: '#3a3a3a', cape: '#2a4a9a' }); applyEquipment(g, { head: 'steel_full_helm', body: 'steel_platebody', legs: 'steel_platelegs', weapon: 'steel_sword', shield: 'steel_kiteshield' }); return g; }
      case 'paladin': { const g = humanoid({ skin: '#c8915c', hair: '#8a6a3a', shirt: '#e8e8e8', pants: '#e0e0e0', cape: '#e8e8f0' }); applyEquipment(g, { head: 'wk_helm', body: 'wk_body', legs: 'wk_legs', weapon: 'mithril_sword', shield: 'wk_shield' }); return g; }
      case 'lathas': return humanoid({ skin: '#d0a070', hair: '#5a3a1a', shirt: '#5a1a7a', pants: '#3a1a4a', cape: '#8a1a1a', beard: '#5a3a1a', hat: '#e8c030' });
      case 'seer': return humanoid({ skin: '#d0a070', hair: '#c0c0c0', shirt: '#4a3a7a', pants: '#4a3a7a', robe: '#3a2a6a', hood: '#3a2a6a', beard: '#d0d0d0' });
      case 'tribesman': return humanoid({ skin: '#5a3a22', hair: '#1a1a1a', shirt: '#5a3a22', pants: '#8a6a3a', boots: '#4a2a14', sleeves: false });
      case 'jackal': return beast(BEASTS.jackal);
      case 'rock_crab': {
        const [root, body, P] = quadBase();
        const sh = mesh(dodeGeo, tmat('rock', '#7a6e62'), 0, 0.32, 0, body); sh.scale.set(0.55, 0.3, 0.48);
        const sh2 = mesh(dodeGeo, tmat('rock', '#6a6056'), 0.1, 0.48, -0.05, body); sh2.scale.set(0.3, 0.18, 0.28);
        P.head = pivot(body, 0, 0.28, 0.35);
        for (const s of [-1, 1]) { box(0.08, 0.06, 0.25, '#8a4a2a', s * 0.2, 0, 0.1, P.head); box(0.14, 0.1, 0.14, '#9a5a32', s * 0.24, 0.02, 0.26, P.head); part(sph(0.03, 4, 3), '#101010', s * 0.07, 0.08, 0.02, P.head); }
        for (let i = 0; i < 4; i++) { const s = i % 2 ? 1 : -1, z = i < 2 ? 0.12 : -0.12; const l = pivot(body, s * 0.38, 0.22, z); const seg = box(0.3, 0.04, 0.04, '#7a4024', s * 0.12, -0.08, 0, l); seg.rotation.z = -s * 0.7; P.legs.push(l); }
        return root;
      }
      case 'fremennik': return humanoid({ skin: '#e0b088', hair: pickC(['#e8c870', '#c89040', '#a05a20']), shirt: '#7a6a5a', pants: '#4a3a2a', boots: '#3a2a1a', beard: pickC(['#e8c870', '#c89040', '#a05a20']), cape: '#5a4a3a', sleeves: false });
      case 'ghost': case 'ghost_guard': { const g = humanoid({ skin: '#d8e8e0', hair: '#e8f0ec', shirt: '#c8d8d0', pants: '#c8d8d0', robe: kind === 'ghost' ? '#b8ccc4' : null, boots: '#c8d8d0' }); if (kind === 'ghost_guard') applyEquipment(g, { head: 'iron_full_helm', weapon: 'iron_sword' }); g.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.6; o.material.emissive = new THREE.Color('#203028'); } }); return g; }
      case 'hetty': return humanoid({ skin: '#c8a888', hair: '#3a3a3a', shirt: '#2a2a2a', pants: '#2a2a2a', robe: '#1a1a1a', wizhat: '#1a1a1a' });
      case 'crocodile': return beast(BEASTS.crocodile);
      case 'hellhound': return beast(BEASTS.hellhound);
      case 'fire_giant': { const g = humanoid({ skin: '#c84a1a', hair: '#ffa020', shirt: '#7a2a10', pants: '#5a1a08', boots: '#2a0a04', beard: '#ff8020', scale: 1.9, sleeves: false }); return g; }
      case 'black_demon': { const d = npcModel('demon'); d.traverse(o => { if (o.material && o.material.color) { o.material = o.material.clone(); const h = {}; o.material.color.getHSL(h); if (h.s > 0.3) o.material.color.setHSL(0, 0, Math.max(0.06, h.l * 0.35)); } }); d.scale.setScalar(1.15); return d; }
      case 'troll': { const g = humanoid({ skin: '#7a8a6a', hair: '#3a3a2a', shirt: '#5a4a3a', pants: '#4a3a2a', boots: '#3a2a1a', scale: 1.6, sleeves: false, ears: true }); const P = g.userData.parts; const n = part(cone(0.07, 0.2, 5), '#6a7a5a', 0, 0.15, 0.2, P.head); n.rotation.x = Math.PI / 2; return g; }
      case 'werewolf': { const g = humanoid({ skin: '#a08870', hair: '#5a4a3a', shirt: pickC(['#5a4a3a', '#3a3a4a', '#4a3a2a']), pants: '#3a3028', beard: '#6a5a4a', ears: true }); return g; }
      case 'druid': return humanoid({ skin: '#d0a070', hair: '#e0e0e0', shirt: '#e8e8e0', pants: '#e8e8e0', robe: '#f0f0e8', beard: '#e8e8e8', hood: null });
      case 'thug': return humanoid({ skin: '#a06a40', hair: '#1a1a1a', shirt: '#4a3a5a', pants: '#2a2a2a', hood: '#2a2a2a', beard: '#1a1a1a' });
      case 'pker': { const sets = { rune: ['rune_full_helm', 'rune_platebody', 'rune_platelegs', 'rune_scimitar', 'rune_kiteshield'], mithril: ['mithril_full_helm', null, 'mithril_platelegs', 'mithril_scimitar', null], adamant: ['adamant_full_helm', 'adamant_platebody', 'adamant_platelegs', 'adamant_scimitar', 'adamant_kiteshield'], black: ['bk_helm', 'bk_body', 'bk_legs', 'steel_scimitar', null] };
        const gear = sets[arguments[1]] || sets.rune; const g = humanoid({ skin: pickC(['#c8915c', '#a06a40', '#d0a070']), hair: pickC(['#1a1a1a', '#6a4020', '#c0a040']), shirt: pickC(['#202020', '#6a1a1a', '#1a2a6a']), pants: '#202020', cape: pickC(['#c02020', '#202020', '#2a2a8a', null]) });
        applyEquipment(g, { head: gear[0], body: gear[1], legs: gear[2], weapon: gear[3], shield: gear[4] }); return g; }
      case 'emir': return humanoid({ skin: '#a06a40', hair: '#1a1a1a', shirt: '#e8e0c8', pants: '#e8e0c8', robe: '#d8c890', beard: '#1a1a1a', hat: '#e8c030', cape: '#8a1a8a' });
      case 'duellist': { const g = humanoid({ skin: '#b07a4c', hair: '#3a2410', shirt: '#8a2a2a', pants: '#3a3028', sleeves: false }); applyEquipment(g, { weapon: 'steel_scimitar', shield: 'steel_kiteshield' }); return g; }
      case 'camel': return beast(BEASTS.camel);
      case 'minotaur': { const g = humanoid({ skin: '#6a4428', hair: '#3a2414', shirt: '#6a4428', pants: '#4a3018', boots: '#2a1a0a', scale: 1.15, sleeves: false, ears: true });
        for (const s of [-1, 1]) { const h = new THREE.Mesh(Models.cone(0.05, 0.3, 5), mat('#e8e0c0')); h.position.set(s * 0.16, 0.38, 0); h.rotation.z = -s * 1.0; g.userData.parts.head.add(h); }
        applyEquipment(g, { weapon: 'iron_scimitar' }); return g; }
      case 'flesh_crawler': { const s = npcModel('spider'); s.traverse(o => { if (o.material && o.material.color) { o.material = o.material.clone(); o.material.color.multiply(new THREE.Color('#ff9a80')).multiplyScalar(2.4); } }); s.scale.setScalar(0.75); return s; }
      case 'catablepon': return beast(BEASTS.catablepon);
      case 'pit_spider': { const s = npcModel('spider'); s.scale.setScalar(0.85); return s; }
      case 'ankou': { const g = humanoid({ skin: '#e0dce8', hair: null, shirt: '#3a1a5a', pants: '#3a1a5a', robe: '#2a1048', hood: '#2a1048' }); g.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.82; } }); applyEquipment(g, { weapon: 'steel_scimitar' }); return g; }
      case 'chaos_druid': return humanoid({ skin: '#c8a080', hair: '#5a5a4a', shirt: '#2a2a2a', pants: '#2a2a2a', robe: '#3a3a2a', hood: '#1a1a1a', beard: '#8a8a7a' });
      case 'sailor': return humanoid({ skin: '#b07a4c', hair: '#202020', shirt: '#e8e8e8', pants: '#2a3a6a', hat: '#2a3a6a', beard: '#3a2a1a' });
    }
    return humanoid({});
  }
  function animate(root, anim, moving, time, moveAnim) {
    if (root.userData.kind === 'humanoid') animateHumanoid(root, anim, moving, time, moveAnim);
    else animateAnimal(root, anim, moving, time);
  }

  // ---------- Scenery ----------
  const blobGeo = new THREE.IcosahedronGeometry(1, 0);
  const dodeGeo = new THREE.DodecahedronGeometry(1, 0);
  const leafMat = c => tmat('leaves', c);
  const barkMat = c => tmat('bark', c);
  // RS2-style trees: tall trunk, branches reaching into several leafy clumps.
  // Each type has 6 pre-merged variants (one canopy + one bark mesh per tree) to stay fast.
  const TREE_SPECS = {
    tree: { h: 1.7, rb: 0.2, rt: 0.13, bark: '#6b4a2a', n: 6, ring: 0.62, size: 0.56, cy: 2.55, ys: 0.8, top: '#5a962e', bot: '#183410', crown: 0.72 },
    oak: { h: 1.8, rb: 0.32, rt: 0.22, bark: '#5a3e22', n: 8, ring: 0.95, size: 0.68, cy: 2.75, ys: 0.75, top: '#548a2a', bot: '#152e0c', crown: 0.95 },
    maple: { h: 1.8, rb: 0.24, rt: 0.15, bark: '#5a3a22', n: 7, ring: 0.72, size: 0.58, cy: 2.7, ys: 0.8, top: '#e08a2c', bot: '#5a1e0c', crown: 0.78 },
    yew: { h: 1.9, rb: 0.4, rt: 0.27, bark: '#4a3a26', n: 9, ring: 1.05, size: 0.74, cy: 2.85, ys: 0.78, top: '#3e6e28', bot: '#0c1e08', crown: 1.0 },
    willow: { h: 1.9, rb: 0.26, rt: 0.16, bark: '#5a4a2a', n: 5, ring: 0.55, size: 0.55, cy: 2.65, ys: 0.6, top: '#9ab842', bot: '#3a5a18', crown: 0.7, fronds: '#7a9a30' },
    magic: { h: 2.0, rb: 0.26, rt: 0.16, bark: '#9a9a8a', n: 6, ring: 0.68, size: 0.46, cy: 2.65, ys: 0.85, top: '#80e0ff', bot: '#14507a', crown: 0.6, glow: true },
    teak: { h: 2.0, rb: 0.2, rt: 0.13, bark: '#7a6040', n: 5, ring: 0.68, size: 0.56, cy: 2.6, ys: 0.48, top: '#5e8e2e', bot: '#223e12', crown: 0.75 },
    mahogany: { h: 2.2, rb: 0.26, rt: 0.17, bark: '#6a3a24', n: 6, ring: 0.78, size: 0.62, cy: 2.9, ys: 0.5, top: '#4e7e28', bot: '#183410', crown: 0.85 },
  };
  function mergeGeos(list) {
    const pos = [], nor = [], uv = [], col = [];
    for (const [geo, m, c] of list) {
      const g = (geo.index ? geo.toNonIndexed() : geo.clone()); g.applyMatrix4(m);
      const P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, C = g.attributes.color;
      for (let i = 0; i < P.count; i++) {
        pos.push(P.getX(i), P.getY(i), P.getZ(i)); nor.push(N.getX(i), N.getY(i), N.getZ(i));
        uv.push(U ? U.getX(i) : 0, U ? U.getY(i) : 0);
        if (C) col.push(C.getX(i), C.getY(i), C.getZ(i)); else { const cc = new THREE.Color(c || '#ffffff'); col.push(cc.r, cc.g, cc.b); }
      }
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    out.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); out.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    out.computeBoundingSphere();
    return out;
  }
  const treeVariants = {};
  function treeVariant(type, v) {
    const k = type + v; if (treeVariants[k]) return treeVariants[k];
    const sp = TREE_SPECS[type];
    let seed = (type.length * 7919 + v * 104729) % 2147483647 || 1; const r = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const M = (x, y, z, sx, sy, sz, ry) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry || 0, 0)), new THREE.Vector3(sx, sy, sz));
    const bark = [], leaf = [];
    // trunk, root flare and roots
    bark.push([new THREE.CylinderGeometry(sp.rt, sp.rb, sp.h, 7), M(0, sp.h / 2, 0, 1, 1, 1)]);
    bark.push([new THREE.CylinderGeometry(sp.rb, sp.rb * 1.7, 0.25, 7), M(0, 0.12, 0, 1, 1, 1)]);
    const branch = (from, to, r0, r1) => {
      const dir = new THREE.Vector3().subVectors(to, from), len = dir.length();
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
      bark.push([new THREE.CylinderGeometry(r1, r0, len, 5), new THREE.Matrix4().compose(mid, q, new THREE.Vector3(1, 1, 1))]);
    };
    for (let i = 0; i < 3; i++) { const a = i * 2.1 + r(); branch(new THREE.Vector3(0, 0.15, 0), new THREE.Vector3(Math.cos(a) * sp.rb * 2.2, 0.0, Math.sin(a) * sp.rb * 2.2), sp.rb * 0.45, sp.rb * 0.25); }
    // clumps around a ring, each fed by a branch
    const T = new THREE.Color(sp.top), Bc = new THREE.Color(sp.bot);
    const clump = (x, y, z, sz, ysc) => {
      const g = new THREE.IcosahedronGeometry(1, 1), P = g.attributes.position, cols = [], c = new THREE.Color();
      const hsh = (a, b, cc) => { const t = Math.sin(a * 12.99 + b * 78.23 + cc * 37.7 + v * 5.1 + x * 3.3) * 43758.55; return t - Math.floor(t); };
      for (let i = 0; i < P.count; i++) { const px = P.getX(i), py = P.getY(i), pz = P.getZ(i); const d = 0.8 + hsh(Math.round(px * 100), Math.round(py * 100), Math.round(pz * 100)) * 0.38; P.setXYZ(i, px * d, py * d * (py < 0 ? 0.65 : 1), pz * d); }
      for (let i = 0; i < P.count; i += 3) {
        const wy = y + (P.getY(i) + P.getY(i + 1) + P.getY(i + 2)) / 3 * sz * ysc;
        const t = Math.max(0, Math.min(1, (wy - (sp.cy - sp.size * 1.4)) / (sp.size * 2.6)));
        c.copy(Bc).lerp(T, t).multiplyScalar(0.84 + hsh(i, 1, 2) * 0.32);
        for (let j = 0; j < 3; j++) cols.push(c.r, c.g, c.b);
      }
      g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
      leaf.push([g, M(x, y, z, sz, sz * ysc, sz, r() * 6.28)]);
    };
    const top = new THREE.Vector3(0, sp.h - 0.05, 0);
    for (let i = 0; i < sp.n; i++) {
      const a = i / sp.n * Math.PI * 2 + r() * 0.5, rr = sp.ring * (0.75 + r() * 0.35);
      const x = Math.cos(a) * rr, z = Math.sin(a) * rr, y = sp.cy - 0.15 + (r() - 0.5) * 0.45;
      clump(x, y, z, sp.size * (0.85 + r() * 0.3), sp.ys);
      if (i < 4) branch(top, new THREE.Vector3(x * 0.75, y - sp.size * 0.35, z * 0.75), sp.rt * 0.6, sp.rt * 0.3);
    }
    clump((r() - 0.5) * 0.2, sp.cy + sp.size * 0.55, (r() - 0.5) * 0.2, sp.crown, sp.ys);
    if (sp.fronds) for (let i = 0; i < 16; i++) {
      const a = i / 16 * Math.PI * 2 + r() * 0.2, rr = sp.ring + 0.25 + r() * 0.15, len = 1.2 + r() * 0.5;
      const g = new THREE.BoxGeometry(0.16, len, 0.05);
      leaf.push([g, new THREE.Matrix4().compose(new THREE.Vector3(Math.cos(a) * rr, sp.cy - len / 2 + 0.1, Math.sin(a) * rr), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.sin(a) * 0.15, -a, -Math.cos(a) * 0.15)), new THREE.Vector3(1, 1, 1)), i % 2 ? sp.fronds : sp.top]);
    }
    return treeVariants[k] = { bark: mergeGeos(bark), leaf: mergeGeos(leaf) };
  }
  const rsLeafTex = () => { if (!rsLeafTex.t) { rsLeafTex.t = Tex.get('rsleaf').clone(); rsLeafTex.t.needsUpdate = true; rsLeafTex.t.repeat.set(2, 2); } return rsLeafTex.t; };
  function tree(type, r) {
    if (TREE_SPECS[type]) {
      const sp = TREE_SPECS[type], tv = treeVariant(type, Math.floor(r() * 6));
      const g = new THREE.Group();
      g.add(new THREE.Mesh(tv.bark, mat('#ffffff', { map: Tex.get('bark'), vertexColors: true, color: sp.bark })));
      g.add(new THREE.Mesh(tv.leaf, sp.glow ? mat('#ffffff', { map: rsLeafTex(), vertexColors: true, emissive: '#103048' }) : mat('#ffffff', { map: rsLeafTex(), vertexColors: true })));
      g.rotation.y = r() * Math.PI * 2; g.scale.setScalar((type === 'yew' ? 1.12 : 1) * (0.9 + r() * 0.2));
      return g;
    }
    const g = new THREE.Group();
    if (type === 'banana') {
      for (let i = 0; i < 4; i++) mesh(cyl(0.08, 0.1, 0.4, 5), barkMat('#7a8a3a'), 0, 0.2 + i * 0.4, 0, g);
      for (let i = 0; i < 6; i++) { const f = box(0.3, 0.03, 1.1, leafMat('#5aa030'), Math.sin(i * 1.05) * 0.45, 1.75, Math.cos(i * 1.05) * 0.45, g); f.rotation.y = i * 1.05; f.rotation.x = 0.5; }
      const fr = new THREE.Group(); g.add(fr); g.userData.goods = fr;
      for (let i = 0; i < 4; i++) box(0.06, 0.18, 0.06, '#f0d040', Math.cos(i * 1.6) * 0.12, 1.45, Math.sin(i * 1.6) * 0.12, fr);
    } else if (type === 'pine') {
      mesh(cyl(0.1, 0.17, 0.9, 6), barkMat('#4a3420'), 0, 0.45, 0, g);
      for (let i = 0; i < 4; i++) { const c = mesh(cone(0.85 - i * 0.18, 0.95, 7), leafMat(['#2a5a26', '#2e6228', '#244e22', '#30682a'][i]), 0, 0.95 + i * 0.5, 0, g); c.rotation.y = i * 0.4; }
      g.scale.setScalar(0.9 + r() * 0.5);
    } else if (type === 'deadtree') {
      mesh(cyl(0.08, 0.16, 1.6, 5), barkMat('#4a3a2a'), 0, 0.8, 0, g);
      for (let i = 0; i < 3; i++) { const b = mesh(cyl(0.03, 0.06, 0.7, 4), barkMat('#4a3a2a'), 0, 1.1 + i * 0.2, 0, g); b.rotation.z = (i % 2 ? 1 : -1) * 0.9; b.rotation.y = r() * 3; }
    } else if (type === 'palm') {
      const tr = new THREE.Group(); g.add(tr);
      for (let i = 0; i < 5; i++) { const s = mesh(cyl(0.09, 0.11, 0.42, 5), barkMat('#8a6a3a'), i * 0.04, 0.21 + i * 0.4, 0, tr); s.rotation.z = -0.05; }
      for (let i = 0; i < 6; i++) { const f = box(0.25, 0.03, 1.0, leafMat('#4a8a2a'), 0.2, 2.0, 0, g); f.geometry = boxGeo(0.25, 0.03, 1.0); f.rotation.y = i * 1.05; f.rotation.x = 0.4; f.position.set(0.2 + Math.sin(i * 1.05) * 0.45, 1.95, Math.cos(i * 1.05) * 0.45); }
    } else if (type === 'cactus') {
      mesh(cyl(0.14, 0.16, 1.2, 6), '#4a8a3a', 0, 0.6, 0, g);
      const a1 = mesh(cyl(0.08, 0.08, 0.4, 6), '#4a8a3a', 0.2, 0.7, 0, g); a1.rotation.z = Math.PI / 2; mesh(cyl(0.08, 0.08, 0.35, 6), '#4a8a3a', 0.35, 0.88, 0, g);
    }
    g.rotation.y = r() * Math.PI * 2;
    return g;
  }
  function stump(type) {
    const g = new THREE.Group();
    const rad = type === 'oak' ? 0.26 : 0.18;
    mesh(cyl(rad, rad * 1.2, 0.25, 7), barkMat('#6b4a2a'), 0, 0.12, 0, g);
    mesh(cyl(rad * 0.85, rad * 0.85, 0.02, 7), '#c8a070', 0, 0.255, 0, g);
    return g;
  }
  function rock(type, r) {
    const g = new THREE.Group();
    const base = mesh(dodeGeo, tmat('rock', '#6e6a62'), 0, 0.25, 0, g);
    base.scale.set(0.5, 0.38, 0.46); base.rotation.set(r(), r() * 3, r());
    const b2 = mesh(dodeGeo, tmat('rock', '#625e57'), 0.2, 0.18, -0.15, g); b2.scale.set(0.28, 0.25, 0.3);
    const ore = new THREE.Group(); g.add(ore);
    const col = ROCKS[type].col;
    for (let i = 0; i < 5; i++) { const a = r() * Math.PI * 2; const o = mesh(G('oct', () => new THREE.OctahedronGeometry(0.09, 0)), col, Math.cos(a) * 0.32, 0.25 + r() * 0.2, Math.sin(a) * 0.3, ore); o.rotation.set(r() * 3, r() * 3, 0); }
    g.userData.ore = ore;
    return g;
  }
  function essenceRock() {
    const g = new THREE.Group();
    const b = mesh(dodeGeo, mat('#b8b8c8', { emissive: '#202030' }), 0, 0.6, 0, g); b.scale.set(0.95, 0.7, 0.9);
    for (let i = 0; i < 6; i++) { const c = mesh(G('ess', () => new THREE.OctahedronGeometry(0.22, 0)), mat('#d8d8f0', { emissive: '#303050' }), Math.cos(i) * 0.6, 0.8 + (i % 3) * 0.2, Math.sin(i) * 0.6, g); c.scale.y = 1.8; }
    return g;
  }
  function runeAltar(kind) {
    const g = new THREE.Group();
    const col = RUNES[kind] || '#ffffff';
    mesh(cyl(0.95, 1.0, 0.15, 10), tmat('stonefloor', '#9a9690'), 0, 0.07, 0, g);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const s = box(0.18, 0.9, 0.12, tmat('rock', '#8a8680'), Math.cos(a) * 0.8, 0.45, Math.sin(a) * 0.8, g); s.rotation.y = -a; }
    box(0.5, 0.5, 0.5, tmat('rock', '#a8a49a'), 0, 0.4, 0, g);
    const glow = mesh(G('rglow', () => new THREE.IcosahedronGeometry(0.2, 0)), mat(col, { emissive: col }), 0, 0.85, 0, g);
    g.userData.spin = glow;
    return g;
  }
  function furnace() {
    const g = new THREE.Group();
    box(1.7, 1.3, 1.5, tmat('brick', '#a09a90'), 0, 0.65, 0, g);
    box(1.8, 0.15, 1.6, '#5a554e', 0, 1.35, 0, g);
    box(0.5, 1.2, 0.5, tmat('brick', '#8a857c'), 0.4, 1.9, -0.3, g);
    box(0.7, 0.5, 0.05, mat('#ff7a20', { emissive: '#ff5000' }), 0, 0.45, 0.76, g);
    box(0.9, 0.12, 0.1, '#4a453e', 0, 0.76, 0.76, g);
    return g;
  }
  function anvil() { const g = new THREE.Group(); box(0.3, 0.35, 0.3, '#3e3a38', 0, 0.17, 0, g); box(0.5, 0.15, 0.25, '#4a4644', 0, 0.42, 0, g); taper(0.12, 0.2, 0.2, 0.15, '#4a4644', 0.32, 0.42, 0, g).rotation.z = Math.PI / 2; return g; }
  function range() {
    const g = new THREE.Group();
    box(0.9, 0.75, 0.8, tmat('brick', '#8a8580'), 0, 0.37, 0, g);
    box(0.92, 0.06, 0.82, '#2a2826', 0, 0.77, 0, g);
    box(0.5, 0.3, 0.02, mat('#ff8a30', { emissive: '#ff5a10' }), 0, 0.3, 0.41, g);
    box(0.2, 1.2, 0.2, tmat('brick', '#8a8580'), 0, 1.3, -0.3, g);
    return g;
  }
  function bankBooth() {
    const g = new THREE.Group();
    const wd = tmat('planks', '#ffffff');
    box(0.95, 0.9, 0.7, wd, 0, 0.45, 0, g);
    box(1.0, 0.07, 0.75, '#8a6238', 0, 0.92, 0, g);
    box(0.08, 0.9, 0.08, '#5a3c20', -0.45, 1.4, 0, g); box(0.08, 0.9, 0.08, '#5a3c20', 0.45, 1.4, 0, g);
    box(0.98, 0.15, 0.7, '#5a3c20', 0, 1.88, 0, g);
    box(0.8, 0.5, 0.02, mat('#a0c8d8', { transparent: true, opacity: 0.35 }), 0, 1.4, 0, g);
    return g;
  }
  function altar() {
    const g = new THREE.Group();
    box(1.6, 0.8, 0.8, tmat('stonefloor', '#c0bcb4'), 0, 0.4, 0, g);
    box(1.65, 0.05, 0.85, '#f0f0f0', 0, 0.82, 0, g);
    box(0.3, 0.1, 0.86, '#c04040', 0, 0.82, 0, g);
    box(0.06, 0.4, 0.06, '#e8c030', 0, 1.05, 0, g); box(0.25, 0.06, 0.06, '#e8c030', 0, 1.15, 0, g);
    return g;
  }
  function fountain() {
    const g = new THREE.Group();
    const st = tmat('stonefloor', '#b0aca4');
    mesh(cyl(1.0, 1.05, 0.4, 10), st, 0, 0.2, 0, g);
    mesh(cyl(0.88, 0.88, 0.05, 10), tmat('water', '#ffffff', { emissive: '#0a1a3a' }), 0, 0.36, 0, g);
    mesh(cyl(0.15, 0.2, 0.9, 6), st, 0, 0.6, 0, g);
    mesh(cyl(0.4, 0.3, 0.12, 8), st, 0, 1.05, 0, g);
    const w = mesh(cone(0.1, 0.3, 5), mat('#7ab0e8', { emissive: '#203a5a' }), 0, 1.25, 0, g);
    g.userData.water = w;
    return g;
  }
  function fishingSpot() {
    const g = new THREE.Group();
    const rings = [];
    for (let i = 0; i < 3; i++) { const r = mesh(G('torus', () => new THREE.TorusGeometry(0.2, 0.025, 3, 12)), mat('#d8ecff', { emissive: '#4a6a8a' }), (i - 1) * 0.15, 0.03, (i % 2) * 0.12, g); r.rotation.x = Math.PI / 2; rings.push(r); }
    g.userData.rings = rings;
    return g;
  }
  function fire() {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) { const l = box(0.08, 0.08, 0.5, '#5a3a1a', 0, 0.05, 0, g); l.rotation.y = i * 1.05; }
    const flames = [];
    const cols = [['#ff6a10', '#ff3a00'], ['#ffaa20', '#ff6a00'], ['#ffe050', '#ffaa00']];
    for (let i = 0; i < 3; i++) flames.push(mesh(cone(0.22 - i * 0.05, 0.6 - i * 0.12, 5), mat(cols[i][0], { emissive: cols[i][1] }), 0, 0.3, 0, g));
    g.userData.flames = flames;
    return g;
  }
  function crate() { const g = new THREE.Group(); box(0.6, 0.6, 0.6, tmat('planks', '#e0c8a0'), 0, 0.3, 0, g); box(0.62, 0.08, 0.62, '#6b4a2a', 0, 0.55, 0, g); box(0.62, 0.08, 0.62, '#6b4a2a', 0, 0.05, 0, g); return g; }
  function barrel() { const g = new THREE.Group(); mesh(cyl(0.25, 0.25, 0.7, 8), tmat('planks', '#d0a878'), 0, 0.35, 0, g); mesh(cyl(0.27, 0.27, 0.06, 8), '#4a4a4a', 0, 0.55, 0, g); mesh(cyl(0.27, 0.27, 0.06, 8), '#4a4a4a', 0, 0.15, 0, g); return g; }
  function signpost() { const g = new THREE.Group(); box(0.08, 1.4, 0.08, '#6b4a2a', 0, 0.7, 0, g); box(0.6, 0.18, 0.04, tmat('planks', '#e0c8a0'), 0.2, 1.2, 0, g); box(0.5, 0.16, 0.04, tmat('planks', '#e0c8a0'), -0.15, 0.95, 0.03, g).rotation.y = 0.5; return g; }
  function flowers(r) {
    const g = new THREE.Group();
    const cols = ['#e04040', '#e8e040', '#a050e0', '#f0f0f0', '#ff8020'];
    const c = cols[Math.floor(r() * cols.length)];
    for (let i = 0; i < 4; i++) { const x = (r() - 0.5) * 0.7, z = (r() - 0.5) * 0.7; box(0.02, 0.18, 0.02, '#3a7a2a', x, 0.09, z, g); box(0.08, 0.06, 0.08, c, x, 0.2, z, g); }
    return g;
  }
  function bush(r) { const g = new THREE.Group(); for (let i = 0; i < 3; i++) { const b = mesh(blobGeo, leafMat(i ? '#3a6a24' : '#447a2a'), (r() - 0.5) * 0.4, 0.25, (r() - 0.5) * 0.4, g); b.scale.setScalar(0.3 + r() * 0.1); } return g; }
  function stall(color) {
    const g = new THREE.Group();
    box(1.8, 0.8, 0.9, tmat('planks', '#e0c8a0'), 0, 0.4, 0.2, g);
    for (const [x, z] of [[-0.85, -0.4], [0.85, -0.4], [-0.85, 0.6], [0.85, 0.6]]) box(0.08, 1.9, 0.08, '#5a3c20', x, 0.95, z, g);
    const roof = box(2.0, 0.08, 1.4, tmat('cloth', color), 0, 1.95, 0.1, g); roof.rotation.x = 0.15;
    const goods = new THREE.Group(); g.add(goods);
    for (let i = 0; i < 5; i++) box(0.22, 0.12, 0.22, color === '#c04040' ? '#e8c070' : '#e8e8f8', -0.7 + i * 0.35, 0.86, 0.2, goods);
    g.userData.goods = goods;
    return g;
  }
  function spinningWheel() {
    const g = new THREE.Group();
    box(0.6, 0.1, 0.3, '#6b4a2a', 0, 0.35, 0, g);
    for (const x of [-0.25, 0.25]) box(0.05, 0.35, 0.05, '#5a3c20', x, 0.17, 0, g);
    const w = mesh(G('wheel', () => new THREE.TorusGeometry(0.3, 0.03, 4, 12)), '#7a5530', 0.1, 0.75, 0, g);
    for (let i = 0; i < 4; i++) { const s = box(0.02, 0.58, 0.02, '#7a5530', 0, 0, 0, w); s.rotation.z = i * Math.PI / 4; }
    g.userData.spin = w;
    return g;
  }
  function flaxPlant(r) { const g = new THREE.Group(); for (let i = 0; i < 5; i++) { const x = (r() - 0.5) * 0.5, z = (r() - 0.5) * 0.5; box(0.03, 0.6, 0.03, '#6a8a2a', x, 0.3, z, g); box(0.07, 0.07, 0.07, '#6a7ae0', x, 0.62, z, g); } return g; }
  function patch(w, d, state, crop, stage) {
    const g = new THREE.Group();
    box(w - 0.1, 0.12, d - 0.1, tmat('sand', '#6a4a2a'), 0, 0.06, 0, g);
    for (const [x, z, ww, dd] of [[0, -d / 2 + 0.03, w, 0.06], [0, d / 2 - 0.03, w, 0.06], [-w / 2 + 0.03, 0, 0.06, d], [w / 2 - 0.03, 0, 0.06, d]]) box(ww, 0.18, dd, tmat('planks', '#c0a070'), x, 0.09, z, g);
    const n = Math.round(w * d * 2);
    let s = 7; const rr = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    if (state === 'weeds') {
      for (let i = 0; i < n * stage; i++) { const c = mesh(cone(0.06, 0.3, 3), i % 2 ? '#6a7a2a' : '#5a6a20', (rr() - 0.5) * (w - 0.4), 0.25, (rr() - 0.5) * (d - 0.4), g); c.rotation.z = (rr() - 0.5) * 0.6; }
    } else if (state === 'growing' || state === 'ready') {
      const sd = SEEDS[crop];
      const sc = state === 'ready' ? 1 : 0.25 + stage * 0.2;
      const herb = sd.patch === 'herb';
      for (let i = 0; i < n; i++) {
        const x = (i % Math.ceil(w * 1.5) / Math.ceil(w * 1.5) - 0.5 + 0.2) * (w - 0.3), z = (Math.floor(i / Math.ceil(w * 1.5)) / Math.ceil(d * 1.4) - 0.5 + 0.25) * (d - 0.3);
        const p = new THREE.Group(); p.position.set(x, 0.12, z); p.scale.setScalar(sc); g.add(p);
        for (let k = 0; k < 3; k++) { const l = box(0.06, 0.35, 0.14, herb ? '#3a8a2a' : '#4a9a30', 0, 0.17, 0, p); l.rotation.y = k * 1.05; l.rotation.x = 0.4; }
        if (state === 'ready') box(0.16, 0.14, 0.16, sd.col, 0, 0.08, 0, p);
      }
    }
    return g;
  }
  function agility(kind) {
    const g = new THREE.Group();
    if (kind === 'log') { const l = mesh(cyl(0.18, 0.18, 6.4, 7), barkMat('#7a5530'), 0, 0.15, 0, g); l.rotation.z = Math.PI / 2; }
    else if (kind === 'net') {
      for (const z of [-1.4, 1.4]) box(0.12, 2.2, 0.12, '#5a3c20', 0, 1.1, z, g);
      box(0.12, 0.12, 2.9, '#5a3c20', 0, 2.2, 0, g);
      for (let i = 0; i < 7; i++) { box(0.02, 2.1, 0.02, '#c8b48a', 0, 1.05, -1.3 + i * 0.43, g); box(0.02, 0.02, 2.8, '#c8b48a', 0, 0.2 + i * 0.3, 0, g); }
    } else if (kind === 'rope') {
      for (const z of [-2.2, 2.2]) box(0.14, 1.4, 0.14, '#5a3c20', 0, 0.7, z, g);
      box(0.03, 0.03, 4.4, '#d8c8a0', 0, 1.2, 0, g);
    } else if (kind === 'pipe') {
      const p = mesh(G('pipe', () => new THREE.CylinderGeometry(0.4, 0.4, 5.6, 10, 1, true)), mat('#707070', { side: THREE.DoubleSide }), 0, 0.4, 0, g); p.rotation.z = Math.PI / 2;
    } else if (kind === 'stones') {
      for (let i = 0; i < 5; i++) { const s = mesh(cyl(0.32, 0.38, 0.5, 7), tmat('rock', '#7a7470'), -2 + i * 1.0, 0.0, (i % 2) * 0.15, g); s.rotation.y = i; }
    } else if (kind === 'ledge') {
      box(0.35, 0.12, 3.2, tmat('stonefloor', '#b0aca4'), 0.2, 0.6, 0, g); box(0.15, 2.2, 3.4, tmat('brick', '#ffffff'), -0.15, 1.1, 0, g);
    } else if (kind === 'wall') {
      box(0.4, 0.9, 1.0, tmat('brick', '#c0b8a8'), 0, 0.45, 0, g); box(0.42, 0.12, 1.02, '#6e695e', 0, 0.92, 0, g);
    } else if (kind === 'swing') {
      for (const x of [-0.7, 0.7]) box(0.14, 3.2, 0.14, '#5a3c20', x, 1.6, 0, g);
      box(1.6, 0.14, 0.14, '#5a3c20', 0, 3.2, 0, g);
      const r = box(0.03, 2.6, 0.03, '#d8c8a0', 0, 1.9, 0, g); g.userData.rope = r;
    }
    return g;
  }
  function tent(color) {
    const g = new THREE.Group();
    const c = mesh(G('tent', () => new THREE.ConeGeometry(1.6, 2.2, 4)), tmat('cloth', color), 0, 1.1, 0, g); c.rotation.y = Math.PI / 4;
    box(0.06, 2.4, 0.06, '#5a3c20', 0, 1.2, 0, g);
    return g;
  }
  function boat() {
    const g = new THREE.Group();
    const hull = taper(1.4, 1.0, 0.7, 4.5, tmat('planks', '#c09060'), 0, 0.1, 0, g); hull.rotation.x = 0;
    box(1.2, 0.05, 4.0, tmat('planks', '#e0c090'), 0, 0.45, 0, g);
    box(0.12, 4.0, 0.12, '#5a3c20', 0, 2.4, 0.3, g);
    const sail = box(0.04, 2.4, 1.8, tmat('cloth', '#e8e0d0'), 0.05, 2.6, 0.3, g); sail.rotation.y = Math.PI / 2;
    return g;
  }
  function well() { const g = new THREE.Group(); mesh(cyl(0.5, 0.55, 0.6, 8), tmat('brick', '#b0aca4'), 0, 0.3, 0, g); mesh(cyl(0.42, 0.42, 0.02, 8), tmat('water', '#ffffff'), 0, 0.5, 0, g); for (const x of [-0.45, 0.45]) box(0.08, 1.2, 0.08, '#5a3c20', x, 0.9, 0, g); const r = mesh(cone(0.75, 0.5, 4), tmat('rooftile', '#ffffff'), 0, 1.65, 0, g); r.rotation.y = Math.PI / 4; return g; }
  function lamp() { const g = new THREE.Group(); box(0.08, 1.8, 0.08, '#2a2a2a', 0, 0.9, 0, g); box(0.22, 0.25, 0.22, mat('#ffe080', { emissive: '#a08020' }), 0, 1.9, 0, g); box(0.28, 0.05, 0.28, '#2a2a2a', 0, 2.05, 0, g); return g; }
  function trap(kind, state) {
    const g = new THREE.Group();
    if (kind === 'snare') {
      for (const x of [-0.15, 0.15]) box(0.03, 0.4, 0.03, '#6b4a2a', x, 0.2, 0, g);
      box(0.33, 0.03, 0.03, '#6b4a2a', 0, 0.4, 0, g);
      const loop = mesh(Models.cyl(0.12, 0.12, 0.01, 8), '#d8c8a0', 0, 0.02, 0, g);
      if (state === 'caught') { box(0.18, 0.12, 0.25, '#c03020', 0, 0.12, 0, g); box(0.1, 0.1, 0.1, '#c03020', 0, 0.2, 0.12, g); }
    } else {
      box(0.5, 0.35, 0.6, Models.tmat('planks', '#e0c8a0'), 0, 0.18, 0, g);
      box(0.52, 0.03, 0.62, '#5a3a1e', 0, state === 'caught' ? 0.36 : 0.45, state === 'caught' ? 0 : -0.2, g);
      if (state === 'caught') box(0.15, 0.15, 0.04, '#e8c030', 0, 0.2, 0.31, g);
    }
    return g;
  }
  function guildDoor() { const g = new THREE.Group(); box(0.12, 1.75, 0.95, tmat('planks', '#c09060'), 0, 0.88, 0, g); box(0.16, 0.08, 0.08, '#e8c030', 0.05, 0.9, 0.3, g); return g; }
  function fairyRing() {
    const g = new THREE.Group();
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * Math.PI * 2, x = Math.cos(a) * 0.85, z = Math.sin(a) * 0.85;
      mesh(cyl(0.04, 0.05, 0.18, 5), '#f0e8d0', x, 0.09, z, g);
      const cap = mesh(G('mcap', () => new THREE.SphereGeometry(0.11, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2)), i % 2 ? '#c03020' : '#e8d8c0', x, 0.17, z, g);
    }
    const glow = mesh(G('fglow', () => new THREE.CircleGeometry(0.75, 16)), mat('#a0ffb0', { emissive: '#30a050', transparent: true, opacity: 0.25, side: THREE.DoubleSide }), 0, 0.02, 0, g);
    glow.rotation.x = -Math.PI / 2;
    return g;
  }
  function board() {
    const g = new THREE.Group();
    for (const x of [-0.45, 0.45]) box(0.08, 1.6, 0.08, '#5a3c20', x, 0.8, 0, g);
    box(1.1, 0.8, 0.06, tmat('planks', '#d0b080'), 0, 1.15, 0, g);
    for (let i = 0; i < 6; i++) box(0.22, 0.16, 0.02, ['#f0f0e0', '#f0e8c0', '#e8f0f0'][i % 3], -0.35 + (i % 3) * 0.35, 1.3 - Math.floor(i / 3) * 0.3, 0.04, g);
    return g;
  }
  function gnomeHut(roof) {
    const g = new THREE.Group();
    mesh(cyl(0.9, 1.0, 1.3, 10), tmat('plaster', '#e8dcc0'), 0, 0.65, 0, g);
    mesh(cone(1.25, 1.2, 10), tmat('thatch', roof || '#ffffff'), 0, 1.9, 0, g);
    box(0.4, 0.8, 0.1, '#5a3a1e', 0, 0.4, 0.97, g);
    box(0.25, 0.25, 0.05, '#2a2a3a', 0.55, 0.85, 0.76, g).rotation.y = 0.6;
    return g;
  }
  function grandTree(rr) {
    const g = new THREE.Group();
    mesh(cyl(0.9, 1.4, 7, 10), barkMat('#6a4a2a'), 0, 3.5, 0, g);
    for (let i = 0; i < 4; i++) { const r = mesh(cyl(0.2, 0.4, 2.2, 6), barkMat('#6a4a2a'), Math.cos(i * 1.57) * 1.2, 0.5, Math.sin(i * 1.57) * 1.2, g); r.rotation.z = Math.cos(i * 1.57) * 0.8; r.rotation.x = -Math.sin(i * 1.57) * 0.8; }
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const b = mesh(blobGeo, leafMat(i % 3 ? '#3a7a24' : '#4a8a2c'), Math.cos(a) * 2.2, 7 + (i % 3) * 0.7, Math.sin(a) * 2.2, g); b.scale.setScalar(1.6); b.rotation.set(i, i * 2, i); }
    mesh(blobGeo, leafMat('#3f7f26'), 0, 8.5, 0, g).scale.setScalar(2.2);
    box(0.8, 1.4, 0.1, '#3a2410', 0, 0.7, 1.32, g);
    return g;
  }
  function spiritTree() {
    const g = new THREE.Group();
    mesh(cyl(0.45, 0.7, 2.6, 8), barkMat('#5a4a3a'), 0, 1.3, 0, g);
    for (let i = 0; i < 6; i++) { const b = mesh(blobGeo, leafMat(i % 2 ? '#2a5a2a' : '#3a6a3a'), Math.cos(i) * 0.8, 3 + (i % 2) * 0.4, Math.sin(i) * 0.8, g); b.scale.setScalar(0.9); }
    for (const s of [-1, 1]) box(0.12, 0.1, 0.05, '#101010', s * 0.18, 1.8, 0.6, g);
    box(0.3, 0.08, 0.05, '#101010', 0, 1.5, 0.62, g);
    return g;
  }
  // dungeon scenery
  function dungeon(kind) {
    const g = new THREE.Group();
    if (kind === 'ladder') {
      for (const x of [-0.25, 0.25]) box(0.07, 2.4, 0.07, '#7a5228', x, 1.2, -0.35, g);
      for (let i = 0; i < 7; i++) box(0.5, 0.05, 0.05, '#8a6232', 0, 0.25 + i * 0.32, -0.35, g);
    } else if (kind === 'ladder_down') {
      const h = new THREE.Mesh(cyl(0.45, 0.45, 0.03, 10), mat('#050505')); h.position.y = 0.02; g.add(h);
      for (const x of [-0.2, 0.2]) box(0.06, 0.5, 0.06, '#7a5228', x, 0.2, 0, g);
      for (let i = 0; i < 2; i++) box(0.4, 0.04, 0.04, '#8a6232', 0, 0.12 + i * 0.25, 0, g);
    } else if (kind === 'hole') {
      const h = new THREE.Mesh(cyl(0.48, 0.48, 0.03, 10), mat('#050505')); h.position.y = 0.02; g.add(h);
      for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; const r = mesh(dodeGeo, tmat('rock', '#6a645a'), Math.cos(a) * 0.5, 0.1, Math.sin(a) * 0.5, g); r.scale.set(0.16, 0.14, 0.16); r.rotation.set(a, a * 2, 0); }
    } else if (kind === 'trapdoor') {
      box(0.9, 0.06, 0.9, tmat('planks', '#a07848'), 0, 0.03, 0, g);
      box(0.95, 0.04, 0.08, '#4a3a2a', 0, 0.07, -0.3, g); box(0.95, 0.04, 0.08, '#4a3a2a', 0, 0.07, 0.3, g);
      box(0.1, 0.05, 0.1, '#2a2a2a', 0.3, 0.1, 0, g);
    } else if (kind === 'gate') {
      for (const x of [-0.48, 0.48]) box(0.14, 2.0, 0.24, tmat('rock', '#7a7268'), x, 1.0, 0, g);
      box(1.1, 0.2, 0.26, tmat('rock', '#7a7268'), 0, 2.05, 0, g);
      for (let i = 0; i < 5; i++) box(0.05, 1.9, 0.05, '#3a3a3e', -0.32 + i * 0.16, 0.95, 0, g);
      for (let i = 0; i < 3; i++) box(0.84, 0.05, 0.05, '#3a3a3e', 0, 0.4 + i * 0.6, 0, g);
    } else if (kind === 'chest') {
      box(0.7, 0.4, 0.45, tmat('planks', '#8a5a2a'), 0, 0.2, 0, g);
      const lid = box(0.72, 0.14, 0.47, tmat('planks', '#9a6a32'), 0, 0.47, 0, g);
      box(0.74, 0.05, 0.05, '#c8a030', 0, 0.3, 0.23, g); box(0.1, 0.12, 0.03, '#e8c040', 0, 0.36, 0.24, g);
    } else if (kind === 'cradle') {
      box(0.8, 0.12, 0.5, tmat('whitestone', '#e8e0f0'), 0, 0.5, 0, g);
      for (const x of [-0.3, 0.3]) box(0.12, 0.5, 0.12, tmat('whitestone', '#d8d0e0'), x, 0.25, 0, g);
      const glow = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 1), new THREE.MeshBasicMaterial({ color: '#c0a0ff' })); glow.position.y = 0.75; g.add(glow); g.userData.spin = glow;
    } else if (kind === 'stalagmite') {
      for (let i = 0; i < 3; i++) { const c = mesh(cone(0.22 - i * 0.05, 1.3 - i * 0.35, 6), tmat('rock', '#6a6056'), (i - 1) * 0.22, (1.3 - i * 0.35) / 2, (i % 2) * 0.15, g); c.rotation.y = i; }
    } else if (kind === 'dummy') {
      box(0.08, 1.3, 0.08, '#5a3c20', 0, 0.65, 0, g); box(0.6, 0.07, 0.07, '#5a3c20', 0, 1.1, 0, g);
      const body = new THREE.Mesh(cyl(0.2, 0.24, 0.6, 8), mat('#c8a860', { map: Tex.get('thatch') })); body.position.y = 0.85; g.add(body);
      const head = new THREE.Mesh(sph(0.15, 8, 6), mat('#d8b870', { map: Tex.get('thatch') })); head.position.y = 1.3; g.add(head);
      box(0.3, 0.3, 0.02, '#a02020', 0, 0.9, 0.22, g); box(0.15, 0.15, 0.03, '#f0f0f0', 0, 0.9, 0.23, g);
    } else if (kind === 'ditch') {
      box(1.0, 0.04, 1.0, '#3a2c20', 0, -0.02, 0, g);
      for (let i = 0; i < 3; i++) { const r = mesh(dodeGeo, tmat('rock', '#5a5048'), -0.3 + i * 0.3, 0.02, (i % 2 ? 0.25 : -0.2), g); r.scale.set(0.1, 0.07, 0.1); }
    } else if (kind === 'gravestone') {
      box(0.45, 0.7, 0.12, tmat('rock', '#8a8680'), 0, 0.35, 0, g); box(0.55, 0.08, 0.3, tmat('rock', '#7a7670'), 0, 0.04, 0.05, g);
      box(0.06, 0.25, 0.02, '#4a4640', 0, 0.48, 0.07, g); box(0.18, 0.06, 0.02, '#4a4640', 0, 0.52, 0.07, g);
    } else if (kind === 'warnsign') {
      box(0.08, 1.3, 0.08, '#5a3c20', 0, 0.65, 0, g); box(0.7, 0.45, 0.05, '#c8b070', 0, 1.15, 0, g);
      box(0.5, 0.06, 0.02, '#a01010', 0, 1.22, 0.03, g); box(0.5, 0.06, 0.02, '#a01010', 0, 1.08, 0.03, g);
    } else if (kind === 'torch') {
      box(0.06, 1.2, 0.06, '#4a3420', 0, 0.6, 0, g);
      const f = new THREE.Mesh(cone(0.09, 0.28, 5), new THREE.MeshBasicMaterial({ color: '#ffa020' })); f.position.y = 1.32; g.add(f); g.userData.flames = [f];
    }
    return g;
  }
  function portal() { const g = new THREE.Group(); const r = mesh(G('portal', () => new THREE.TorusGeometry(0.7, 0.12, 6, 14)), mat('#b0a0ff', { emissive: '#6050c0' }), 0, 1.0, 0, g); const c = mesh(G('portalc', () => new THREE.CircleGeometry(0.62, 14)), mat('#8070e0', { emissive: '#4030a0', transparent: true, opacity: 0.7, side: THREE.DoubleSide }), 0, 1.0, 0, g); g.userData.spin = c; return g; }
  function bones() { const g = new THREE.Group(); for (let i = 0; i < 4; i++) { const b = box(0.4, 0.05, 0.05, '#e0dccc', (i - 1.5) * 0.12, 0.03, (i % 2) * 0.15, g); b.rotation.y = i * 0.8; } mesh(G('skull', () => new THREE.IcosahedronGeometry(0.1, 0)), '#e0dccc', 0.1, 0.08, -0.1, g); return g; }

  return {
    mat, tmat, box, mesh, taper, cyl, cone, humanoid, applyEquipment, setHeldTool, npcModel, animate, weaponMesh,
    tree, stump, rock, essenceRock, runeAltar, furnace, anvil, range, bankBooth, altar, fountain, fishingSpot, fire, crate, barrel, signpost,
    flowers, bush, trap, stall, guildDoor, portal, fairyRing, board, dungeon, gnomeHut, grandTree, spiritTree, spinningWheel, flaxPlant, patch, agility, tent, boat, well, lamp, bones,
  };
})();
