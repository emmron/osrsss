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
    stonefloor: (g, r) => { noise(g, r, [104, 100, 94], 18); for (let row = 0; row < 4; row++) { g.fillStyle = 'rgba(36,34,30,0.7)'; g.fillRect(0, row * 16 + 15, 64, 1); for (let x = (row % 2) * 8; x < 64; x += 16) g.fillRect(x, row * 16, 1, 16); } },
    cobble: (g, r) => { noise(g, r, [92, 88, 82], 10); for (let i = 0; i < 46; i++) { const x = r() * 64, y = r() * 64, w = 5 + r() * 5; const v = 100 + r() * 34 | 0; g.fillStyle = `rgb(${v},${v - 3},${v - 8})`; g.beginPath(); g.ellipse(x, y, w / 2, w / 2.6, r() * 3, 0, 7); g.fill(); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x - 2, y + 2, 4, 1); } },
    water: (g, r) => { noise(g, r, [44, 74, 132], 10); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(150,190,240,${0.15 + r() * 0.25})`; g.fillRect(r() * 64, r() * 64, 4 + r() * 8, 1); } },
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
    const key = color + (opts ? JSON.stringify(opts, (k, v) => (v && v.isTexture) ? v.uuid : v) : '');
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
    } else if (t === 'knife' || t === 'tinderbox' || t === 'rake' || t === 'spade' || t === 'dibber') {
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
    for (const l of [P.legL, P.legR]) { l.userData.upper.material = cmat(legCol); l.userData.knee.material = cmat(legCol); l.userData.foot.material = cmat(equip.feet ? '#6a3a1a' : o.boots); }
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
      case 'priest': return humanoid({ skin: '#d0a070', hair: '#5a4a3a', shirt: '#1a1a1a', pants: '#1a1a1a', robe: '#1a1a1a' });
      case 'hunter': return humanoid({ skin: '#b07a4c', hair: '#5a3a18', shirt: '#6a5a2a', pants: '#4a3a1a', hood: null, cape: '#3a5a2a', beard: '#5a3a18' });
      case 'demon': { const d = humanoid({ skin: '#a01a10', hair: null, shirt: '#a01a10', pants: '#801408', boots: '#401008', scale: 1.5, sleeves: false, ears: true });
        const P = d.userData.parts; for (const s of [-1, 1]) { const h = Models.cone(0.05, 0.25, 4); const m = new THREE.Mesh(h, mat('#e8e0c0')); m.position.set(s * 0.1, 0.42, 0); m.rotation.z = -s * 0.4; P.head.add(m); const w = box(0.04, 0.6, 0.5, '#601008', s * 0.25, 1.15, -0.25, P.body); w.rotation.y = s * 0.6; } return d; }
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
  function tree(type, r) {
    const g = new THREE.Group();
    if (type === 'tree') {
      mesh(cyl(0.1, 0.17, 1.3, 6), barkMat('#6b4a2a'), 0, 0.65, 0, g);
      const greens = ['#3f7a26', '#4a8a2c', '#386e22'];
      for (let i = 0; i < 4; i++) { const b = mesh(blobGeo, leafMat(greens[i % 3]), (r() - 0.5) * 0.4, 1.45 + r() * 0.45, (r() - 0.5) * 0.4, g); b.scale.setScalar(0.42 + r() * 0.18); b.rotation.set(r() * 3, r() * 3, r() * 3); }
    } else if (type === 'oak') {
      mesh(cyl(0.16, 0.26, 1.5, 7), barkMat('#5a3e22'), 0, 0.75, 0, g);
      const br = mesh(cyl(0.06, 0.1, 0.8, 5), barkMat('#5a3e22'), 0.3, 1.4, 0, g); br.rotation.z = -0.8;
      const greens = ['#3d6a22', '#467a28', '#355e1c'];
      for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; const b = mesh(blobGeo, leafMat(greens[i % 3]), Math.cos(a) * 0.5 * r(), 1.7 + r() * 0.6, Math.sin(a) * 0.5 * r(), g); b.scale.setScalar(0.5 + r() * 0.2); b.rotation.set(r() * 3, r() * 3, r() * 3); }
    } else if (type === 'willow') {
      mesh(cyl(0.12, 0.22, 1.6, 6), barkMat('#5a4a2a'), 0, 0.8, 0, g);
      const crown = mesh(blobGeo, leafMat('#6a8a2a'), 0, 1.8, 0, g); crown.scale.set(0.7, 0.4, 0.7);
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + r() * 0.3; const c = mesh(cone(0.18, 1.1, 4), leafMat(i % 2 ? '#7a9a34' : '#6a8a2c'), Math.cos(a) * 0.55, 1.4, Math.sin(a) * 0.55, g); c.rotation.x = Math.PI; c.rotation.z = Math.cos(a) * 0.25; c.rotation.y = r(); }
    } else if (type === 'maple') {
      mesh(cyl(0.14, 0.22, 1.5, 7), barkMat('#5a3a22'), 0, 0.75, 0, g);
      const cols = ['#a0461a', '#b85a20', '#8a3a14', '#c06a28'];
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const b = mesh(blobGeo, leafMat(cols[i % 4]), Math.cos(a) * 0.4 * r(), 1.8 + r() * 0.5, Math.sin(a) * 0.4 * r(), g); b.scale.setScalar(0.48 + r() * 0.2); b.rotation.set(r() * 3, r() * 3, r() * 3); }
    } else if (type === 'yew') {
      mesh(cyl(0.22, 0.34, 1.6, 8), barkMat('#4a3a26'), 0, 0.8, 0, g);
      for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; const b = mesh(blobGeo, leafMat(i % 2 ? '#2a4a1e' : '#30561f'), Math.cos(a) * 0.7 * (0.5 + r() * 0.5), 1.7 + r() * 0.8, Math.sin(a) * 0.7 * (0.5 + r() * 0.5), g); b.scale.setScalar(0.6 + r() * 0.2); b.rotation.set(r() * 3, r() * 3, r() * 3); }
      g.scale.setScalar(1.15);
    } else if (type === 'magic') {
      mesh(cyl(0.16, 0.26, 1.8, 7), barkMat('#8a8a7a'), 0, 0.9, 0, g);
      for (let i = 0; i < 5; i++) { const b = mesh(cyl(0.04, 0.08, 0.9, 5), barkMat('#8a8a7a'), 0, 1.6, 0, g); b.rotation.z = 0.9; b.rotation.y = i * 1.25; b.position.set(Math.cos(i * 1.25) * 0.3, 1.8, -Math.sin(i * 1.25) * 0.3); }
      for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; const b = mesh(blobGeo, mat(i % 2 ? '#40a0d0' : '#5ac0e8', { map: Tex.get('leaves'), emissive: '#103048' }), Math.cos(a) * 0.6, 2.1 + r() * 0.5, Math.sin(a) * 0.6, g); b.scale.setScalar(0.38 + r() * 0.15); }
    } else if (type === 'pine') {
      mesh(cyl(0.1, 0.15, 0.8, 5), barkMat('#4a3420'), 0, 0.4, 0, g);
      for (let i = 0; i < 3; i++) mesh(cone(0.75 - i * 0.18, 1.0, 6), leafMat(i % 2 ? '#2a5a26' : '#244e22'), 0, 1.0 + i * 0.6, 0, g);
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
  function bones() { const g = new THREE.Group(); for (let i = 0; i < 4; i++) { const b = box(0.4, 0.05, 0.05, '#e0dccc', (i - 1.5) * 0.12, 0.03, (i % 2) * 0.15, g); b.rotation.y = i * 0.8; } mesh(G('skull', () => new THREE.IcosahedronGeometry(0.1, 0)), '#e0dccc', 0.1, 0.08, -0.1, g); return g; }

  return {
    mat, tmat, box, mesh, taper, cyl, cone, humanoid, applyEquipment, setHeldTool, npcModel, animate, weaponMesh,
    tree, stump, rock, essenceRock, runeAltar, furnace, anvil, range, bankBooth, altar, fountain, fishingSpot, fire, crate, barrel, signpost,
    flowers, bush, trap, stall, spinningWheel, flaxPlant, patch, agility, tent, boat, well, lamp, bones,
  };
})();
