// ===== Rendering, camera, audio, main loop =====
const VW = 512, VH = 334; // 3D viewport size (fixed mode)

const Sfx = (() => {
  let ac = null, master = null, musicGain = null;
  let enabled = true, musicOn = true;
  function ctx() {
    if (!ac) {
      try {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        master = ac.createGain(); master.gain.value = 0.25; master.connect(ac.destination);
        musicGain = ac.createGain(); musicGain.gain.value = 0.12; musicGain.connect(ac.destination);
      } catch (e) { return null; }
    }
    return ac;
  }
  function tone(freq, dur, type, vol, when, dest, slide) {
    const a = ctx(); if (!a) return;
    const t = a.currentTime + (when || 0);
    const o = a.createOscillator(), g = a.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.3, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || master); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol, when, hp) {
    const a = ctx(); if (!a) return;
    const t = a.currentTime + (when || 0);
    const len = Math.floor(a.sampleRate * dur);
    const buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = a.createBufferSource(); s.buffer = buf;
    const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = hp || 800;
    const g = a.createGain(); g.gain.value = vol || 0.3;
    s.connect(f); f.connect(g); g.connect(master); s.start(t);
  }
  const fx = {
    chop: () => { noise(0.08, 0.5, 0, 600); tone(160, 0.08, 'square', 0.15); },
    timber: () => { noise(0.4, 0.4, 0, 300); },
    mine: () => { tone(1400, 0.05, 'square', 0.12); noise(0.06, 0.4, 0, 2500); },
    splash: () => noise(0.25, 0.3, 0, 1200),
    smelt: () => noise(0.4, 0.3, 0, 400),
    anvil: () => { tone(1800, 0.15, 'triangle', 0.25); tone(2400, 0.1, 'triangle', 0.12); },
    cook: () => noise(0.3, 0.2, 0, 3000),
    fire: () => noise(0.5, 0.3, 0, 900),
    hit: () => { noise(0.08, 0.5, 0, 500); tone(110, 0.1, 'square', 0.15); },
    swing: () => noise(0.12, 0.25, 0, 1800),
    death: () => tone(300, 0.4, 'sawtooth', 0.15, 0, null, 80),
    pickup: () => tone(600, 0.06, 'square', 0.1),
    drop: () => tone(300, 0.06, 'square', 0.1),
    equip: () => { tone(700, 0.05, 'square', 0.08); tone(500, 0.05, 'square', 0.08, 0.05); },
    eat: () => { noise(0.06, 0.3, 0, 1500); noise(0.06, 0.3, 0.12, 1500); },
    bury: () => noise(0.3, 0.3, 0, 300),
    prayon: () => { tone(500, 0.15, 'sine', 0.2); tone(750, 0.2, 'sine', 0.2, 0.08); },
    prayoff: () => tone(400, 0.15, 'sine', 0.2, 0, null, 250),
    teleport: () => tone(300, 0.6, 'sine', 0.25, 0, null, 1500),
    click: () => tone(900, 0.02, 'square', 0.05),
    quest: () => { tone(523, 0.1, 'square', 0.12); tone(659, 0.15, 'square', 0.12, 0.1); },
  };
  function play(n) { if (enabled && fx[n]) try { fx[n](); } catch (e) { } }
  function levelUp() {
    if (!enabled) return;
    const notes = [523, 659, 784, 1047, 784, 1047];
    notes.forEach((f, i) => tone(f, i === 5 ? 0.6 : 0.16, 'square', 0.14, i * 0.14));
    notes.forEach((f, i) => tone(f / 2, i === 5 ? 0.6 : 0.16, 'triangle', 0.14, i * 0.14));
  }
  function questDone() {
    if (!enabled) return;
    [392, 523, 659, 784, 659, 784, 1047].forEach((f, i) => { tone(f, 0.22, 'square', 0.12, i * 0.2); tone(f / 2, 0.22, 'triangle', 0.15, i * 0.2); });
  }
  // --- simple procedural music ---
  const TRACKS = {
    'Ardenvale': { tempo: 0.32, mel: 'E4 G4 A4 B4 A4 G4 E4 D4 E4 G4 A4 G4 E4 - - - G4 A4 B4 D5 B4 A4 G4 E4 D4 E4 G4 E4 D4 - - -', bass: 'E2 - - - C3 - - - D3 - - - E2 - - - G2 - - - C3 - - - D3 - - - E2 - - -' },
    'Whispering Woods': { tempo: 0.38, mel: 'A4 - C5 B4 A4 - E4 - F4 E4 D4 - E4 - - - A4 - C5 D5 E5 - D5 C5 B4 C5 A4 - - - - -', bass: 'A2 - - - F2 - - - D2 - - - E2 - - - A2 - - - C3 - - - G2 - - - A2 - - -' },
    'Riverbank': { tempo: 0.3, mel: 'D4 F4 A4 F4 D5 - C5 A4 G4 A4 F4 - D4 - - - D4 F4 A4 C5 D5 - F5 E5 D5 C5 A4 - D4 - - -', bass: 'D3 - A2 - Bb2 - F2 - G2 - C3 - D3 - A2 - D3 - A2 - Bb2 - F2 - G2 - A2 - D3 - - -' },
  };
  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function freq(n) {
    const m = n.match(/^([A-G])(b|#)?(\d)$/); if (!m) return 0;
    const semi = NOTE[m[1]] + (m[2] === 'b' ? -1 : m[2] === '#' ? 1 : 0) + (+m[3] + 1) * 12;
    return 440 * Math.pow(2, (semi - 69) / 12);
  }
  let current = null, timer = null;
  function playTrack(name) {
    current = name;
    if (timer) clearTimeout(timer);
    if (!musicOn || !ctx()) return;
    const tr = TRACKS[name];
    const mel = tr.mel.split(' '), bass = tr.bass.split(' ');
    const len = Math.max(mel.length, bass.length);
    for (let i = 0; i < len; i++) {
      const fm = freq(mel[i % mel.length] || '-'), fb = freq(bass[i % bass.length] || '-');
      if (fm) tone(fm, tr.tempo * 0.95, 'triangle', 0.5, i * tr.tempo, musicGain);
      if (fb) tone(fb, tr.tempo * 3.5, 'sine', 0.6, i * tr.tempo, musicGain);
    }
    timer = setTimeout(() => playTrack(current), len * tr.tempo * 1000 + 2500);
  }
  function setMusic(v) { musicOn = v; if (!v && timer) { clearTimeout(timer); timer = null; } else if (v) playTrack(current || 'Ardenvale'); }
  return {
    play, levelUp, questDone, playTrack, setMusic, TRACKS: Object.keys(TRACKS),
    get current() { return current; }, get musicOn() { return musicOn; }, get enabled() { return enabled; }, set enabled(v) { enabled = v; }, resume: () => ctx() && ac.resume(),
  };
})();

const Render = (() => {
  let renderer, scene, camera, ambient, sun;
  const cam = { yaw: 0, pitch: 0.62, dist: 9.5, keys: {} };
  const raycaster = new THREE.Raycaster();
  const groundTex = {};
  const projectiles = [];
  let time = 0;

  function init(canvas) {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(2);
    renderer.setSize(VW, VH, false);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 18, 32);
    camera = new THREE.PerspectiveCamera(46, VW / VH, 0.1, 60);
    ambient = new THREE.AmbientLight(0xffffff, 0.6);
    sun = new THREE.DirectionalLight(0xfff4e0, 0.8);
    sun.position.set(-40, 80, -25);
    scene.add(ambient, sun);
    return scene;
  }
  function setBrightness(b) { ambient.intensity = [0.42, 0.52, 0.6, 0.74][b]; }

  function groundMesh(g) {
    let tex = groundTex[g.id];
    if (!tex) {
      tex = new THREE.CanvasTexture(Icons.item(g.id, g.qty));
      tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter;
      groundTex[g.id] = tex;
    }
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.55), new THREE.MeshLambertMaterial({ map: tex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2; m.rotation.z = Math.random() * 6;
    const ox = (Math.random() - 0.5) * 0.25, oz = (Math.random() - 0.5) * 0.25;
    m.position.set(g.x + 0.5 + ox, World.heightAt(g.x + 0.5, g.z + 0.5) + 0.03, g.z + 0.5 + oz);
    scene.add(m);
    return m;
  }

  // arrows & spell orbs
  function projectile(from, to, kind, color) {
    let mesh;
    if (kind === 'arrow') {
      mesh = new THREE.Group();
      Models.box(0.03, 0.03, 0.55, '#a07a48', 0, 0, 0, mesh);
      Models.box(0.06, 0.06, 0.1, color || '#9a6a3a', 0, 0, 0.3, mesh);
      Models.box(0.08, 0.01, 0.1, '#f0f0f0', 0, 0, -0.25, mesh);
    } else {
      mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 1), new THREE.MeshBasicMaterial({ color: color || '#ffffff' }));
      const halo = new THREE.Mesh(new THREE.IcosahedronGeometry(0.26, 1), new THREE.MeshBasicMaterial({ color: color || '#ffffff', transparent: true, opacity: 0.35 }));
      mesh.add(halo);
    }
    scene.add(mesh);
    const d = Math.max(Math.abs(from.x - to.x), Math.abs(from.z - to.z));
    projectiles.push({ mesh, from, to, t0: performance.now(), dur: (kind === 'arrow' ? 300 : 500) + d * (kind === 'arrow' ? 70 : 60), kind });
  }
  function updateProjectiles() {
    const nowT = performance.now();
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      const t = (nowT - p.t0) / p.dur;
      if (t >= 1) { scene.remove(p.mesh); projectiles.splice(i, 1); continue; }
      const fx = p.from.rx ?? p.from.x + 0.5, fz = p.from.rz ?? p.from.z + 0.5, tx = p.to.rx ?? p.to.x + 0.5, tz = p.to.rz ?? p.to.z + 0.5;
      const x = fx + (tx - fx) * t, z = fz + (tz - fz) * t;
      const y = World.heightAt(x, z) + 1.1 + Math.sin(t * Math.PI) * (p.kind === 'arrow' ? 0.8 : 0.3);
      p.mesh.position.set(x, y, z);
      if (p.kind === 'arrow') { p.mesh.lookAt(tx, World.heightAt(tx, tz) + 1.1 - (t < 0.5 ? -0.6 : 0.6) * 0.5, tz); }
      else p.mesh.rotation.y += 0.3;
    }
  }

  function entPos(e, t) {
    if (!e.from || !e.steps.length || t >= 1) return [e.x + 0.5, e.z + 0.5];
    const pts = [e.from, ...e.steps];
    const segs = pts.length - 1;
    const f = t * segs, i = Math.min(segs - 1, Math.floor(f)), r = f - i;
    return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * r + 0.5, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * r + 0.5];
  }
  function angLerp(a, b, f) { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return a + d * f; }
  function headHeight(e) {
    const k = e.model.userData.kind;
    if (k === 'chicken') return 0.8;
    if (k === 'quad') return e.def && e.def.model === 'cow' ? 1.5 : 0.65;
    return 1.75 * e.model.userData.parts.body.scale.x;
  }
  const LONG_ANIMS = ['wave', 'bow', 'cheer', 'dance', 'yes', 'no', 'think'];
  function updateEntity(e, t, dt) {
    const [x, z] = entPos(e, t);
    e.rx = x; e.rz = z;
    e.model.position.set(x, World.heightAt(x, z), z);
    e.model.rotation.y = angLerp(e.model.rotation.y, e.face, Math.min(1, dt * 10));
    const moving = (e.steps.length && t < 1) ? (e.steps.length >= 2 ? 2 : 1) : 0;
    let anim = null;
    const nowT = performance.now();
    if (e.dead && e.anim) anim = { name: 'death', t: (nowT - e.anim.t0) / 1000 };
    else if (e.anim && nowT - e.anim.t0 < (LONG_ANIMS.includes(e.anim.name) ? 2400 : 900)) anim = { name: e.anim.name, t: (nowT - e.anim.t0) / 1000 };
    else if (e.stun > 0) anim = { name: 'stunned', t: 0 };
    else if (e.loop) anim = { name: e.loop, t: (nowT - e.loopStart) / 1000 };
    Models.animate(e.model, anim, moving && !e.dead ? moving : 0, time, e.moveAnim);
    e.headY = World.heightAt(x, z) + headHeight(e);
  }

  function update(dt) {
    time += dt;
    const S = Game.S, p = S.player;
    const t = Math.min(1, (performance.now() - S.lastTick) / TICK_MS);
    const k = cam.keys;
    if (k.ArrowLeft) cam.yaw -= dt * 1.9;
    if (k.ArrowRight) cam.yaw += dt * 1.9;
    if (k.ArrowUp) cam.pitch = Math.min(1.3, cam.pitch + dt * 1.2);
    if (k.ArrowDown) cam.pitch = Math.max(0.3, cam.pitch - dt * 1.2);
    let tx, tz, ty;
    if (p && S.loggedIn) { updateEntity(p, t, dt); tx = p.rx; tz = p.rz; ty = World.heightAt(tx, tz) + 0.9; }
    else { cam.yaw += dt * 0.08; tx = 90; tz = 81; ty = 1.5; cam.pitch = 0.5; cam.dist = 14; }
    World.updateChunks(tx, tz, 30);
    for (const n of S.npcs) {
      const near = Math.abs(n.x - tx) < 34 && Math.abs(n.z - tz) < 34;
      n.model.visible = near && (!n.dead || (S.tick - n.deathAt) < 2);
      if (near) updateEntity(n, t, dt);
    }
    camera.position.set(tx + Math.sin(cam.yaw) * Math.cos(cam.pitch) * cam.dist, ty + Math.sin(cam.pitch) * cam.dist, tz + Math.cos(cam.yaw) * Math.cos(cam.pitch) * cam.dist);
    camera.lookAt(tx, ty, tz);
    const inside = p && S.loggedIn ? World.roofAt(p.x, p.z) : -1;
    World.roofMeshes.forEach((m, i) => { m.visible = i !== inside; });
    if (World.waterTex) { World.waterTex.offset.x = time * 0.05; World.waterTex.offset.y = Math.sin(time * 0.6) * 0.06; }
    for (const loc of World.locs) {
      const m = loc.mesh; if (!m || !m.parent || !m.parent.visible) continue;
      const dep = loc.depletedUntil > S.tick;
      if (loc.stump) { m.visible = !dep; loc.stump.visible = dep; }
      if (m.userData.ore) m.userData.ore.visible = !dep;
      if (m.userData.goods) m.userData.goods.visible = !dep;
      if (loc.type === 'flax') m.visible = !dep;
      if (m.userData.rings) m.userData.rings.forEach((r, i) => { const s = 0.6 + ((time * 0.8 + i * 0.33) % 1) * 1.0; r.scale.set(s, s, s); });
      if (m.userData.flames) m.userData.flames.forEach((f, i) => { f.scale.set(1 + Math.sin(time * 13 + i * 2) * 0.15, 1 + Math.sin(time * 17 + i) * 0.25, 1 + Math.cos(time * 11 + i) * 0.15); f.rotation.y = time * (i + 1); });
      if (m.userData.water) m.userData.water.scale.y = 1 + Math.sin(time * 8) * 0.2;
      if (m.userData.spin) m.userData.spin.rotation.y = time * 1.5;
    }
    updateProjectiles();
    renderer.render(scene, camera);
  }

  function visibleChain(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
  const ndc = new THREE.Vector2();
  function pick(vx, vy) {
    ndc.set((vx / VW) * 2 - 1, -(vy / VH) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const ents = [], seen = new Set();
    const cands = World.pickables.filter(m => visibleChain(m));
    const hits = raycaster.intersectObjects(cands, true);
    for (const h of hits) {
      if (!visibleChain(h.object)) continue;
      let o = h.object; while (o && !o.userData.ent) o = o.parent;
      if (!o) continue;
      const e = o.userData.ent;
      if (seen.has(e)) continue; seen.add(e);
      if (e.isNpc && e.dead) continue;
      ents.push({ kind: e.isNpc ? 'npc' : 'loc', ent: e, dist: h.distance });
    }
    const tile = World.rayTile(raycaster.ray.origin, raycaster.ray.direction);
    return { ents, tile };
  }
  const v3 = new THREE.Vector3();
  function project(x, y, z) {
    v3.set(x, y, z).project(camera);
    if (v3.z > 1) return null;
    return [(v3.x + 1) / 2 * VW, (1 - v3.y) / 2 * VH];
  }
  return { init, update, pick, project, groundMesh, projectile, cam, setBrightness, get camera() { return camera; } };
})();

// ===== Boot =====
(function boot() {
  const wrap = document.getElementById('wrap');
  const gl = document.getElementById('gl');
  const ui = document.getElementById('ui');
  const scene = Render.init(gl);
  World.build(scene);
  Game.init(scene);
  UI.init(ui);

  function resize() {
    const s0 = Math.min(window.innerWidth / 765, window.innerHeight / 503);
    const s = s0 >= 2 ? Math.floor(s0 * 4) / 4 : s0;
    wrap.style.transform = `scale(${s})`;
    wrap.style.left = Math.floor((window.innerWidth - 765 * s) / 2) + 'px';
    wrap.style.top = Math.floor((window.innerHeight - 503 * s) / 2) + 'px';
    UI.scale = s;
  }
  window.addEventListener('resize', resize); resize();

  // accounts persist: log straight back in to the last character
  let last = null;
  try { last = localStorage.getItem('ardenvale_last'); } catch (e) { }
  if (last) UI.autoLogin(last);

  let prev = performance.now();
  function frame() {
    const t = performance.now();
    const dt = Math.min(0.1, (t - prev) / 1000); prev = t;
    try {
      if (Game.S.loggedIn && t - Game.S.lastTick >= TICK_MS) Game.tick();
      Render.update(dt);
      UI.draw();
    } catch (e) { console.error(e); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.addEventListener('beforeunload', () => Game.save());
  window.addEventListener('pagehide', () => Game.save());
  document.addEventListener('visibilitychange', () => { if (document.hidden) Game.save(); });
})();
