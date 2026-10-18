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
    t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 4;
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
    P.legL = pivot(body, -0.1, 0.74, 0);
    P.legR = pivot(body, 0.1, 0.74, 0);
    for (const leg of [P.legL, P.legR]) {
      leg.userData.upper = part(cyl(0.095, 0.065, 0.68, 8), o.pants, 0, -0.33, 0, leg);
      leg.userData.knee = part(sph(0.075, 8, 6), o.pants, 0, -0.33, 0.01, leg);
      leg.userData.foot = part(sph(0.08, 8, 6), o.boots, 0, -0.7, 0.06, leg, 1, 0.7, 1.9);
    }
    if (o.robe) { P.skirt = part(cyl(0.2, 0.34, 0.72, 10), o.robe, 0, 0.38, 0, body); P.legL.userData.upper.visible = P.legR.userData.upper.visible = false; P.legL.userData.knee.visible = P.legR.userData.knee.visible = false; }
    P.torso = part(cyl(0.26, 0.19, 0.56, 10), o.shirt, 0, 1.0, 0, body, 1, 1, 0.62);
    P.chest = part(sph(0.2, 10, 8), o.shirt, 0, 1.12, 0.03, body, 1.25, 0.8, 0.75);
    P.belt = part(cyl(0.2, 0.2, 0.07, 10), Icons.shade(o.pants, 0.7), 0, 0.74, 0, body, 1, 1, 0.7);
    P.hips = part(cyl(0.19, 0.2, 0.14, 10), o.pants, 0, 0.66, 0, body, 1, 1, 0.7);
    P.armL = pivot(body, -0.3, 1.2, 0);
    P.armR = pivot(body, 0.3, 1.2, 0);
    for (const arm of [P.armL, P.armR]) {
      const c = o.sleeves ? o.shirt : o.skin;
      arm.userData.shoulder = part(sph(0.095, 8, 6), c, 0, 0, 0, arm);
      arm.userData.upper = part(cyl(0.075, 0.055, 0.5, 8), c, 0, -0.24, 0, arm);
      arm.userData.hand = part(sph(0.065, 8, 6), o.skin, 0, -0.53, 0, arm, 1, 1.3, 1);
    }
    P.handR = pivot(P.armR, 0, -0.55, 0.02);
    P.handL = pivot(P.armL, 0, -0.42, 0);
    P.head = pivot(body, 0, 1.28, 0);
    P.neck = part(cyl(0.06, 0.07, 0.12, 8), o.skin, 0, 0.0, 0, P.head);
    P.face = part(sph(0.15, 12, 10), o.skin, 0, 0.19, 0, P.head, 1, 1.2, 1.08);
    const nose = part(G('nose', () => new THREE.ConeGeometry(0.028, 0.07, 5)), o.skin, 0, 0.17, 0.165, P.head); nose.rotation.x = Math.PI / 2;
    for (const s of [-1, 1]) {
      part(sph(0.022, 6, 4), '#f0f0f0', s * 0.055, 0.22, 0.135, P.head);
      part(sph(0.013, 6, 4), '#101010', s * 0.055, 0.22, 0.152, P.head);
      part(G('brow', () => new THREE.BoxGeometry(0.06, 0.015, 0.02)), o.hair || '#3a2a1a', s * 0.055, 0.255, 0.145, P.head);
      part(sph(0.03, 6, 4), Icons.shade(o.skin, 0.9), s * 0.152, 0.19, 0, P.head, 0.6, 1.2, 1);
    }
    part(G('mouth', () => new THREE.BoxGeometry(0.06, 0.012, 0.02)), Icons.shade(o.skin, 0.6), 0, 0.12, 0.152, P.head);
    if (o.hair) {
      P.hair = new THREE.Group(); P.head.add(P.hair);
      part(sph(0.162, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), o.hair, 0, 0.21, -0.01, P.hair, 1, 1.25, 1.12);
      part(sph(0.155, 10, 8, Math.PI * 0.6, Math.PI * 0.8, Math.PI * 0.3, Math.PI * 0.45), o.hair, 0, 0.19, -0.005, P.hair, 1, 1.2, 1.1);
    }
    if (o.beard) part(sph(0.12, 10, 8, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5), o.beard, 0, 0.16, 0.04, P.head, 1, 1.1, 1);
    if (o.ears) for (const s of [-1, 1]) { const e = part(G('ear', () => new THREE.ConeGeometry(0.05, 0.18, 4)), o.skin, s * 0.17, 0.24, 0, P.head); e.rotation.z = -s * 1.1; }
    if (o.hat) { part(cyl(0.2, 0.2, 0.03, 12), o.hat, 0, 0.37, 0, P.head); part(cyl(0.13, 0.15, 0.16, 12), o.hat, 0, 0.45, 0, P.head); }
    if (o.strawhat) { part(cyl(0.3, 0.3, 0.025, 12), '#d8c070', 0, 0.36, 0, P.head); part(cyl(0.13, 0.15, 0.13, 12), '#d8c070', 0, 0.43, 0, P.head); }
    if (o.wizhat) { part(cyl(0.25, 0.25, 0.025, 12), o.wizhat, 0, 0.35, 0, P.head); const c = part(G('wh', () => new THREE.ConeGeometry(0.15, 0.48, 10)), o.wizhat, 0, 0.6, -0.03, P.head); c.rotation.x = -0.25; }
    if (o.hood) { part(sph(0.185, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.75), o.hood, 0, 0.2, -0.02, P.head, 1, 1.25, 1.1); }
    if (o.cape) { P.cape = part(cyl(0.2, 0.3, 0.85, 8, 1, true), o.cape, 0, 0.82, -0.12, body, 1, 1, 0.25); }
    if (o.apron) part(G('apron', () => new THREE.BoxGeometry(0.3, 0.5, 0.02)), o.apron, 0, 0.82, 0.13, body);
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
      const len = t === 'dagger' ? 0.32 : 0.62;
      box(0.05, 0.05, 0.12, '#4a3020', 0, 0, 0.0, g);
      box(0.2, 0.04, 0.04, Icons.shade(col, 0.8), 0, 0, 0.07, g);
      const b = box(0.03, 0.08, len, col, 0, t === 'scimitar' ? 0.03 : 0, 0.08 + len / 2, g);
      if (t === 'scimitar') b.rotation.x = -0.15;
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
      a.userData.upper.material = cmat(ac); a.userData.shoulder.material = cmat(ac);
      a.userData.hand.material = cmat(equip.hands ? '#7a4a24' : o.skin);
    }
    for (const l of [P.legL, P.legR]) { l.userData.upper.material = cmat(legCol); l.userData.knee.material = cmat(legCol); l.userData.foot.material = cmat(equip.feet ? ((ITEMS[equip.feet].equip && ITEMS[equip.feet].equip.color) || '#6a3a1a') : o.boots); }
    P.hips.material = cmat(legCol);
    if (P.equip.head) { P.head.remove(P.equip.head); P.equip.head = null; }
    if (P.hair) P.hair.visible = !equip.head;
    if (equip.head) {
      const d = ITEMS[equip.head], c = d.icon.c || '#8a5a30';
      const h = new THREE.Group();
      if (d.icon.t === 'wizhat') { part(cyl(0.25, 0.25, 0.025, 12), c, 0, 0.35, 0, h); const k = part(cone(0.15, 0.48, 10), c, 0, 0.6, -0.03, h); k.rotation.x = -0.25; }
      else if (d.icon.t === 'cowl') { part(sph(0.185, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.75), '#8a5a30', 0, 0.2, -0.02, h, 1, 1.25, 1.1); }
      else {
        part(sph(0.18, 12, 10), c, 0, 0.2, 0, h, 1, 1.22, 1.08);
        part(G('visor', () => new THREE.BoxGeometry(0.2, 0.035, 0.03)), '#111111', 0, 0.22, 0.185, h);
        part(G('visor2', () => new THREE.BoxGeometry(0.035, 0.12, 0.03)), '#111111', 0, 0.15, 0.185, h);
        part(cyl(0.012, 0.03, 0.12, 6), Icons.shade(c, 1.3), 0, 0.44, 0, h);
      }
      P.head.add(h); P.equip.head = h;
    }
    if (P.equip.neck) { P.body.remove(P.equip.neck); P.equip.neck = null; }
    if (equip.neck) P.equip.neck = part(sph(0.035, 6, 4), ITEMS[equip.neck].icon.c, 0, 1.16, 0.15, P.body);
    if (P.equip.cape) { P.body.remove(P.equip.cape); P.equip.cape = null; }
    if (equip.cape) { P.equip.cape = part(cyl(0.2, 0.3, 0.85, 8, 1, true), col(equip.cape), 0, 0.82, -0.12, P.body, 1, 1, 0.25); }
    if (P.equip.shield) { P.handL.remove(P.equip.shield); P.equip.shield = null; }
    if (equip.shield) {
      const def = ITEMS[equip.shield];
      const s = new THREE.Group();
      const c = def.icon.c || '#8a5a2a';
      if (def.icon.t === 'woodshield') { const cy = part(cyl(0.22, 0.22, 0.04, 12), c, 0, 0, 0, s); cy.rotation.z = Math.PI / 2; }
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
    if (id) { P.tool = weaponMesh(id); P.handR.add(P.tool); }
  }

  function animateHumanoid(root, anim, moving, time, moveAnim) {
    const P = root.userData.parts;
    P.legL.rotation.set(0, 0, 0); P.legR.rotation.set(0, 0, 0);
    P.armL.rotation.set(0, 0, 0); P.armR.rotation.set(0, 0, 0);
    P.body.position.y = 0; P.body.position.z = 0; P.body.rotation.set(0, 0, 0); P.head.rotation.set(0, 0, 0);
    if (P.cape) P.cape.rotation.x = moving ? 0.25 : 0.05;
    if (moving) {
      const sp = moving === 2 ? 13 : 8.3;
      const amp = moving === 2 ? 0.85 : 0.55;
      const s = Math.sin(time * sp);
      if (moveAnim === 'crawl') { P.body.rotation.x = 1.3; P.body.position.y = -0.55; P.armL.rotation.x = -2.6 + s * 0.4; P.armR.rotation.x = -2.6 - s * 0.4; P.legL.rotation.x = s * 0.3; P.legR.rotation.x = -s * 0.3; return; }
      if (moveAnim === 'climb') { P.armL.rotation.x = -2.6 + s * 0.5; P.armR.rotation.x = -2.6 - s * 0.5; P.legL.rotation.x = -0.6 + s * 0.5; P.legR.rotation.x = -0.6 - s * 0.5; P.body.position.y = 0.3 + Math.abs(s) * 0.2; return; }
      if (moveAnim === 'swing') { P.armL.rotation.x = -3.0; P.armR.rotation.x = -3.0; P.legL.rotation.x = -0.4; P.legR.rotation.x = -0.4; P.body.position.y = 0.2 + Math.sin(time * 4) * 0.15; P.body.rotation.x = Math.sin(time * 4) * 0.3; return; }
      P.legL.rotation.x = s * amp; P.legR.rotation.x = -s * amp;
      if (moveAnim === 'balance') { P.armL.rotation.z = -1.4 + s * 0.15; P.armR.rotation.z = 1.4 + s * 0.15; P.legL.rotation.x *= 0.5; P.legR.rotation.x *= 0.5; P.body.rotation.z = s * 0.08; return; }
      P.armL.rotation.x = -s * amp * 0.8; P.armR.rotation.x = s * amp * 0.8;
      P.body.position.y = Math.abs(Math.cos(time * sp)) * (moving === 2 ? 0.06 : 0.03);
      if (moving === 2) P.body.rotation.x = 0.12;
      return;
    }
    const a = anim && anim.name;
    const t = anim ? anim.t : 0;
    P.armL.rotation.z = 0.05; P.armR.rotation.z = -0.05;
    P.body.position.y = Math.sin(time * 2) * 0.005;
    if (!a) return;
    const sw1 = d => Math.sin(Math.min(1, t / d) * Math.PI);
    switch (a) {
      case 'attack': case 'slash': { const sw = sw1(0.45); P.armR.rotation.x = -2.6 * sw; P.armR.rotation.z = -0.4 * sw; P.body.rotation.y = 0.35 * sw; break; }
      case 'stab': { const sw = sw1(0.45); P.armR.rotation.x = -1.4 - 0.3 * sw; P.body.rotation.y = -0.3 * sw; break; }
      case 'punch': { const sw = sw1(0.35); P.armR.rotation.x = -1.5 * sw; P.body.rotation.y = -0.3 * sw; break; }
      case 'shoot': { const p = Math.min(1, t / 0.5); P.armL.rotation.x = -1.55; P.armR.rotation.x = -1.55; P.armR.rotation.y = 0; P.armR.rotation.z = p < 0.7 ? 0.5 : 0.2; P.body.rotation.y = -0.4; P.head.rotation.y = 0.4; break; }
      case 'cast': { const sw = sw1(0.6); P.armR.rotation.x = -1.6 * sw; P.armL.rotation.x = -1.2 * sw; P.body.rotation.x = -0.1 * sw; break; }
      case 'block': { const sw = sw1(0.4); P.armL.rotation.x = -1.2 * sw; P.body.rotation.x = -0.1 * sw; break; }
      case 'chop': { const c = (t % 1.2) / 1.2; const sw = c < 0.6 ? c / 0.6 : 1 - (c - 0.6) / 0.4; P.armR.rotation.x = -0.6 - 1.6 * (1 - sw); P.armR.rotation.z = 0.6; P.armL.rotation.x = -0.5 - 1.2 * (1 - sw); P.armL.rotation.z = -0.5; P.body.rotation.y = 0.5 * (1 - sw) - 0.2; break; }
      case 'mine': { const c = (t % 1.2) / 1.2; const sw = c < 0.7 ? c / 0.7 : 1 - (c - 0.7) / 0.3; P.armR.rotation.x = -2.8 + sw * 2.2; P.armL.rotation.x = -2.6 + sw * 2.0; P.body.rotation.x = sw * 0.25; break; }
      case 'rake': { const s = Math.sin(time * 5); P.armR.rotation.x = -0.9 + s * 0.4; P.armL.rotation.x = -0.8 + s * 0.4; P.body.rotation.x = 0.3; break; }
      case 'fish': P.armR.rotation.x = -0.9 + Math.sin(time * 1.5) * 0.08; P.armL.rotation.x = -0.9 + Math.sin(time * 1.5) * 0.08; P.body.rotation.x = 0.2; break;
      case 'cook': case 'smith': case 'smelt': case 'fletch': case 'firemake': case 'craft': case 'herb': case 'spin': {
        const sw = Math.sin(time * (a === 'smith' ? 9 : 4));
        P.armR.rotation.x = -0.9 + (a === 'smith' ? sw * 0.6 : sw * 0.15); P.armL.rotation.x = -0.8;
        if (a === 'firemake') { P.legL.rotation.x = -1.4; P.legR.rotation.x = 1.2; P.body.position.y = -0.3; P.body.rotation.x = 0.3; P.armR.rotation.x = -0.6 + sw * 0.2; }
        break;
      }
      case 'bury': case 'pickup': case 'plant': case 'harvest': { const sw = a === 'harvest' || a === 'plant' ? 0.7 + Math.sin(time * 5) * 0.3 : sw1(0.9); P.body.rotation.x = 0.7 * sw; P.armR.rotation.x = -1.2 * sw; P.armL.rotation.x = -1.2 * sw; P.legL.rotation.x = -0.5 * sw; P.legR.rotation.x = -0.5 * sw; P.body.position.y = -0.18 * sw; break; }
      case 'eat': { const sw = sw1(0.9); P.armR.rotation.x = -2.2 * sw; P.armR.rotation.z = 0.4 * sw; break; }
      case 'pray': case 'craftrune': P.armL.rotation.x = -1.4; P.armR.rotation.x = -1.4; P.armL.rotation.z = -0.3; P.armR.rotation.z = 0.3; P.head.rotation.x = 0.3; break;
      case 'wave': P.armR.rotation.z = 2.6 + Math.sin(t * 10) * 0.35; break;
      case 'bow': { const sw = sw1(1.6); P.body.rotation.x = 0.8 * sw; P.armR.rotation.x = -0.9 * sw; P.armR.rotation.z = -0.5 * sw; break; }
      case 'cheer': P.armL.rotation.z = -2.7; P.armR.rotation.z = 2.7; P.body.position.y = Math.abs(Math.sin(t * 6)) * 0.18; break;
      case 'dance': { const s = Math.sin(t * 8); P.body.rotation.y = s * 0.5; P.armL.rotation.z = -1.5 + s * 0.6; P.armR.rotation.z = 1.5 + s * 0.6; P.legL.rotation.z = Math.max(0, s) * 0.5; P.legR.rotation.z = Math.min(0, s) * 0.5; P.body.position.y = Math.abs(s) * 0.08; break; }
      case 'yes': P.head.rotation.x = Math.sin(t * 9) * 0.35; break;
      case 'no': P.head.rotation.y = Math.sin(t * 9) * 0.5; break;
      case 'think': P.armR.rotation.x = -2.2; P.armR.rotation.z = 0.6; P.head.rotation.x = 0.2; break;
      case 'stunned': P.head.rotation.z = Math.sin(time * 6) * 0.2; P.body.rotation.z = Math.sin(time * 6) * 0.05; break;
      case 'death': { const p = Math.min(1, t / 1.0); P.body.rotation.x = -p * Math.PI / 2; P.body.position.y = p * 0.15; break; }
      case 'teleport': P.armL.rotation.z = -2.4; P.armR.rotation.z = 2.4; P.head.rotation.x = -0.4; P.body.position.y = Math.min(0.4, t * 0.2); break;
    }
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
      case 'cow': return cow();
      case 'rat': return rat();
      case 'scorpion': { const s = scorpion(); s.userData.sting = true; return s; }
      case 'goblin': return humanoid({ skin: '#5c8a3a', hair: null, shirt: '#7a6a4a', pants: '#5a4a32', boots: '#3a2a1a', scale: 0.78, ears: true, sleeves: false });
      case 'man': { const c = MAN_SHIRTS[manI++ % MAN_SHIRTS.length]; return humanoid({ skin: manI % 3 ? '#c8915c' : '#a06a40', hair: manI % 2 ? '#3a2410' : '#7a5a30', shirt: c, pants: '#5a4a3a', beard: manI % 4 === 0 ? '#3a2410' : null }); }
      case 'woman': { const c = MAN_SHIRTS[(manI++ + 3) % MAN_SHIRTS.length]; return humanoid({ skin: '#d0a070', hair: '#8a4a1a', shirt: c, pants: c, robe: Icons.shade(c, 0.85) }); }
      case 'bandit': return humanoid({ skin: '#b07a4c', hair: '#201810', shirt: '#4a4a3a', pants: '#2a2a2a', hood: '#2a2a22' });
      case 'skeleton': {
        const s = humanoid({ skin: '#e0dccc', hair: null, shirt: '#d8d4c4', pants: '#d0ccbc', boots: '#c8c4b4', scale: 1.0, sleeves: false });
        s.userData.parts.torso.scale.set(0.7, 1, 0.45); s.userData.parts.chest.scale.set(0.8, 0.7, 0.5);
        for (const l of [s.userData.parts.legL, s.userData.parts.legR]) l.userData.upper.scale.set(0.55, 1, 0.55);
        for (const a of [s.userData.parts.armL, s.userData.parts.armR]) a.userData.upper.scale.set(0.6, 1, 0.6);
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
      case 'dragon': { const [root, body, P] = quadBase(); const c = '#2a7a2a';
        box(0.9, 0.8, 2.0, c, 0, 1.2, 0, body); P.head = pivot(body, 0, 1.6, 1.1); box(0.45, 0.45, 0.8, c, 0, 0.1, 0.4, P.head); box(0.4, 0.15, 0.4, '#e0d0a0', 0, -0.1, 0.65, P.head); for (const s of [-1, 1]) box(0.06, 0.3, 0.06, '#e0d0a0', s * 0.15, 0.4, 0.1, P.head).rotation.x = -0.5;
        box(0.3, 0.3, 0.7, c, 0, 1.45, 0.7, body).rotation.x = -0.6; P.tail = box(0.3, 0.3, 1.6, c, 0, 1.0, -1.6, body);
        for (const s of [-1, 1]) { const w = box(1.8, 0.05, 1.2, '#3a8a3a', s * 1.2, 1.8, 0, body); w.rotation.z = s * 0.4; }
        for (const [x, z] of [[-0.35, 0.7], [0.35, 0.7], [-0.35, -0.7], [0.35, -0.7]]) { const l = pivot(body, x, 0.9, z); box(0.25, 0.9, 0.25, c, 0, -0.45, 0, l); P.legs.push(l); } return root; }
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
      case 'unicorn': { const c = npcModel('cow'); c.traverse(o => { if (o.material && o.material.color) { o.material = o.material.clone(); const hsl = {}; o.material.color.getHSL(hsl); if (hsl.l < 0.5) o.material.color.set('#e8e8f0'); else o.material.color.set('#f8f8ff'); } }); const P = c.userData.parts; const h = mesh(cone(0.05, 0.4, 5), '#f0e0a0', 0, 0.3, 0.25, P.head); h.rotation.x = 0.5; return c; }
      case 'bear': { const c = npcModel('cow'); c.traverse(o => { if (o.material && o.material.color) { o.material = o.material.clone(); o.material.color.set('#5a3a1e'); } }); c.scale.set(1.1, 0.9, 0.9); return c; }
      case 'wolf': { const c = npcModel('cow'); c.traverse(o => { if (o.material && o.material.color) { o.material = o.material.clone(); o.material.color.set('#d8d8e0'); } }); c.scale.set(0.75, 0.7, 0.85); return c; }
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
      case 'pker': { const sets = { rune: ['rune_full_helm', 'rune_platebody', 'rune_platelegs', 'rune_scimitar', 'rune_kiteshield'], mithril: ['mithril_full_helm', null, 'mithril_platelegs', 'mithril_scimitar', null], adamant: ['adamant_full_helm', 'adamant_platebody', 'adamant_platelegs', 'adamant_scimitar', 'adamant_kiteshield'], black: ['bk_helm', 'bk_body', 'bk_legs', 'steel_scimitar', null] };
        const gear = sets[arguments[1]] || sets.rune; const g = humanoid({ skin: pickC(['#c8915c', '#a06a40', '#d0a070']), hair: pickC(['#1a1a1a', '#6a4020', '#c0a040']), shirt: pickC(['#202020', '#6a1a1a', '#1a2a6a']), pants: '#202020', cape: pickC(['#c02020', '#202020', '#2a2a8a', null]) });
        applyEquipment(g, { head: gear[0], body: gear[1], legs: gear[2], weapon: gear[3], shield: gear[4] }); return g; }
      case 'emir': return humanoid({ skin: '#a06a40', hair: '#1a1a1a', shirt: '#e8e0c8', pants: '#e8e0c8', robe: '#d8c890', beard: '#1a1a1a', hat: '#e8c030', cape: '#8a1a8a' });
      case 'duellist': { const g = humanoid({ skin: '#b07a4c', hair: '#3a2410', shirt: '#8a2a2a', pants: '#3a3028', sleeves: false }); applyEquipment(g, { weapon: 'steel_scimitar', shield: 'steel_kiteshield' }); return g; }
      case 'camel': { const c = npcModel('cow'); c.traverse(o => { if (o.material && o.material.color) { o.material = o.material.clone(); o.material.color.set('#c8a060'); } }); const hump = new THREE.Mesh(blobGeo, mat('#b89050')); hump.scale.set(0.35, 0.3, 0.45); hump.position.set(0, 1.45, 0); c.add(hump); c.scale.set(0.95, 1.1, 1.0); return c; }
      case 'minotaur': { const g = humanoid({ skin: '#6a4428', hair: '#3a2414', shirt: '#6a4428', pants: '#4a3018', boots: '#2a1a0a', scale: 1.15, sleeves: false, ears: true });
        for (const s of [-1, 1]) { const h = new THREE.Mesh(Models.cone(0.05, 0.3, 5), mat('#e8e0c0')); h.position.set(s * 0.16, 0.38, 0); h.rotation.z = -s * 1.0; g.userData.parts.head.add(h); }
        applyEquipment(g, { weapon: 'iron_scimitar' }); return g; }
      case 'flesh_crawler': { const s = npcModel('spider'); s.traverse(o => { if (o.material && o.material.color) { o.material = o.material.clone(); o.material.color.multiply(new THREE.Color('#ff9a80')).multiplyScalar(2.4); } }); s.scale.setScalar(0.75); return s; }
      case 'catablepon': { const c = npcModel('cow'); c.traverse(o => { if (o.material && o.material.color) { o.material = o.material.clone(); o.material.color.set('#3a4a2a'); } }); c.scale.set(1.1, 1.05, 1.0); return c; }
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
  // RS2-style canopy: one lumpy, faceted mass with darker underside, built from a displaced icosphere
  const canopyGeos = {};
  function canopyGeo(key, top, bot, variant) {
    const k = key + variant;
    if (canopyGeos[k]) return canopyGeos[k];
    const g = new THREE.IcosahedronGeometry(1, 1);
    const p = g.attributes.position, cols = [];
    const T = new THREE.Color(top), B = new THREE.Color(bot), c = new THREE.Color();
    const h = (x, y, z) => { const v = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + variant * 11.3) * 43758.5453; return v - Math.floor(v); };
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const d = 0.78 + h(Math.round(x * 100), Math.round(y * 100), Math.round(z * 100)) * 0.42;
      p.setXYZ(i, x * d, y * d * (y < 0 ? 0.62 : 1), z * d);
    }
    for (let i = 0; i < p.count; i += 3) {
      const y = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3;
      const t = Math.max(0, Math.min(1, (y + 0.7) / 1.5));
      c.copy(B).lerp(T, t); const f = 0.88 + h(i, variant, 3) * 0.24; c.multiplyScalar(f);
      for (let j = 0; j < 3; j++) cols.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    g.computeVertexNormals();
    return canopyGeos[k] = g;
  }
  const canopyMat = () => mat('#ffffff', { map: Tex.get('leaves'), vertexColors: true });
  function lump(g, key, top, bot, r, x, y, z, sx, sy, sz) {
    const m = mesh(canopyGeo(key, top, bot, Math.floor(r() * 4)), canopyMat(), x, y, z, g);
    m.scale.set(sx, sy, sz); m.rotation.y = r() * 6.28; return m;
  }
  function trunk(g, h, rb, rt, col, r, branches) {
    mesh(cyl(rt, rb, h, 7), barkMat(col), 0, h / 2, 0, g);
    mesh(cyl(rb, rb * 1.6, 0.22, 7), barkMat(col), 0, 0.11, 0, g); // root flare
    for (let i = 0; i < (branches || 0); i++) {
      const a = i / branches * 6.28 + r(), len = 0.55 + r() * 0.3;
      const b = mesh(cyl(rt * 0.35, rt * 0.7, len, 5), barkMat(col), Math.cos(a) * len * 0.35, h - 0.05 + len * 0.3, Math.sin(a) * len * 0.35, g);
      b.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9);
    }
  }
  function tree(type, r) {
    const g = new THREE.Group();
    if (type === 'tree') {
      trunk(g, 1.25, 0.2, 0.13, '#6b4a2a', r, 3);
      lump(g, 'n', '#4f8a2c', '#244a16', r, 0, 1.95, 0, 0.95, 0.75, 0.95);
      for (let i = 0; i < 3; i++) { const a = i * 2.1 + r(); lump(g, 'n', '#4f8a2c', '#244a16', r, Math.cos(a) * 0.55, 1.75 + r() * 0.35, Math.sin(a) * 0.55, 0.55, 0.48, 0.55); }
    } else if (type === 'oak') {
      trunk(g, 1.45, 0.3, 0.2, '#5a3e22', r, 4);
      lump(g, 'o', '#4c7e28', '#203e16', r, 0, 2.3, 0, 1.25, 0.85, 1.25);
      for (let i = 0; i < 4; i++) { const a = i * 1.57 + r() * 0.5; lump(g, 'o', '#4c7e28', '#203e16', r, Math.cos(a) * 0.8, 1.95 + r() * 0.4, Math.sin(a) * 0.8, 0.65, 0.55, 0.65); }
    } else if (type === 'willow') {
      trunk(g, 1.5, 0.26, 0.16, '#5a4a2a', r, 3);
      lump(g, 'w', '#8aaa3c', '#4a6a20', r, 0, 2.05, 0, 1.0, 0.55, 1.0);
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + r() * 0.3, rr = 0.75 + r() * 0.2; const c = mesh(cone(0.2, 1.3, 4), leafMat(i % 2 ? '#7a9a34' : '#6a8a2c'), Math.cos(a) * rr, 1.35, Math.sin(a) * rr, g); c.rotation.x = Math.PI; c.rotation.z = Math.cos(a) * 0.18; c.rotation.x += Math.sin(a) * 0.18; }
    } else if (type === 'maple') {
      trunk(g, 1.45, 0.24, 0.15, '#5a3a22', r, 3);
      lump(g, 'm', '#d07a2a', '#7a2e10', r, 0, 2.2, 0, 1.0, 0.85, 1.0);
      for (let i = 0; i < 4; i++) { const a = i * 1.57 + r(); lump(g, 'm', '#d07a2a', '#7a2e10', r, Math.cos(a) * 0.6, 1.95 + r() * 0.4, Math.sin(a) * 0.6, 0.55, 0.5, 0.55); }
    } else if (type === 'yew') {
      trunk(g, 1.5, 0.38, 0.26, '#4a3a26', r, 5);
      lump(g, 'y', '#3e6a28', '#183010', r, 0, 2.35, 0, 1.35, 0.95, 1.35);
      for (let i = 0; i < 5; i++) { const a = i * 1.26 + r() * 0.4; lump(g, 'y', '#3e6a28', '#183010', r, Math.cos(a) * 0.95, 1.9 + r() * 0.5, Math.sin(a) * 0.95, 0.7, 0.6, 0.7); }
      g.scale.setScalar(1.12);
    } else if (type === 'magic') {
      trunk(g, 1.8, 0.26, 0.16, '#9a9a8a', r, 5);
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const b = mesh(canopyGeo('mg', '#70d8ff', '#1a5a88', i % 4), mat('#ffffff', { map: Tex.get('leaves'), vertexColors: true, emissive: '#103048' }), Math.cos(a) * 0.65, 2.15 + r() * 0.5, Math.sin(a) * 0.65, g); b.scale.setScalar(0.42 + r() * 0.12); }
      const t = mesh(canopyGeo('mg', '#70d8ff', '#1a5a88', 1), mat('#ffffff', { map: Tex.get('leaves'), vertexColors: true, emissive: '#103048' }), 0, 2.6, 0, g); t.scale.setScalar(0.6);
    } else if (type === 'teak') {
      trunk(g, 1.8, 0.2, 0.13, '#7a6040', r, 3);
      lump(g, 't', '#5a8a2c', '#2a4a16', r, 0, 2.15, 0, 1.0, 0.45, 1.0);
      for (let i = 0; i < 3; i++) { const a = i * 2.1 + r(); lump(g, 't', '#5a8a2c', '#2a4a16', r, Math.cos(a) * 0.6, 2.0 + r() * 0.3, Math.sin(a) * 0.6, 0.55, 0.3, 0.55); }
    } else if (type === 'mahogany') {
      trunk(g, 2.0, 0.26, 0.17, '#6a3a24', r, 4);
      lump(g, 'h', '#4a7a26', '#1e3e12', r, 0, 2.4, 0, 1.15, 0.5, 1.15);
      for (let i = 0; i < 4; i++) { const a = i * 1.57 + r(); lump(g, 'h', '#4a7a26', '#1e3e12', r, Math.cos(a) * 0.7, 2.25 + r() * 0.3, Math.sin(a) * 0.7, 0.6, 0.35, 0.6); }
    } else if (type === 'banana') {
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
