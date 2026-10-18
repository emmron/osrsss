// ===== 2D interface (765x503 fixed mode, 2005 style) =====
const UI = (() => {
  let cv, ctx;
  const S = () => Game.S;
  const mouse = { x: -1, y: -1 };
  let menu = null, tab = 3, crosses = [], chatInput = '', loginName = '', tooltip = null, drag = null, mapDrag = null;
  let bankScroll = 0, chatScroll = 0, guideScroll = 0, frameCv, parchCv, mmCv, mmBridge = null, hoverOpts = [];
  const worldMap = { open: false, zoom: 2.6, cx: 90, cz: 82 };
  let mmZ = 4, prompt = null, tracker = false, ctrlHeld = false, lastMapClick = null;
  const ORB = { hp: { cx: 532, cy: 64 }, pr: { cx: 532, cy: 90 }, run: { cx: 532, cy: 116 } };
  const F12 = 'bold 12px Arial', F11 = '11px Arial', F11B = 'bold 11px Arial', F13 = 'bold 13px Arial';
  const VP = { x: 4, y: 4, w: 512, h: 334 };
  const XPBOX = { x: VP.x + VP.w - 104, y: VP.y + 4, w: 100, h: 18 };
  const CHAT = { x: 7, y: 345, w: 506, h: 128 };
  const PANEL = { x: 553, y: 205, w: 190, h: 261 };
  const MM = { cx: 643, cy: 84, r: 72 };
  const COMPASS = { cx: 548, cy: 24, r: 17 };
  const MAPBTN = { cx: 540, cy: 150, r: 12 };
  const TABS_TOP = { y: 168, h: 36, x: 522, w: 33 };
  const TABS_BOT = { y: 466, h: 36, x: 522, w: 33 };
  const TAB_NAMES = ['Combat Options', 'Stats', 'Quest List', 'Inventory', 'Worn Equipment', 'Prayer', 'Magic',
    null, 'Friends List', 'Ignore List', 'Logout', 'Game Options', 'Player Controls', 'Music Player'];
  const WIN = { x: 18, y: 16, w: 484, h: 306 };
  const C = { orange: '#ff981f', yellow: '#ffff00', white: '#ffffff', cyan: '#00ffff', itemc: '#ff9040', green: '#00ff00', red: '#ff0000', dred: '#800000', blue: '#0000ff', spell: '#00ff00' };

  // ---------- crisp bitmap-style text (no anti-aliasing, like the old client fonts) ----------
  const tcache = new Map();
  const mctx = document.createElement('canvas').getContext('2d');
  function textImg(s, font, col, shadow) {
    const key = font + '|' + col + '|' + (shadow ? 1 : 0) + '|' + s;
    let c = tcache.get(key);
    if (c) return c;
    if (tcache.size > 5000) tcache.clear();
    mctx.font = font;
    const w = Math.ceil(mctx.measureText(s).width) + 3, size = parseInt(font.match(/(\d+)px/)[1]), h = size + 6;
    c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    g.font = font; g.textBaseline = 'alphabetic';
    if (shadow) { g.fillStyle = '#000'; g.fillText(s, 1, size + 1); }
    g.fillStyle = col; g.fillText(s, 0, size);
    const img = g.getImageData(0, 0, w, h), d = img.data;
    for (let i = 3; i < d.length; i += 4) d[i] = d[i] >= 100 ? 255 : 0;
    g.putImageData(img, 0, 0);
    c.base = size; c.tw = w - 3;
    tcache.set(key, c);
    return c;
  }
  function T(s, x, y, col, font, align, shadow) {
    s = String(s);
    if (!s) return;
    const c = textImg(s, font || F12, col, shadow !== false);
    const ox = align === 'center' ? c.tw / 2 : align === 'right' ? c.tw : 0;
    ctx.drawImage(c, Math.round(x - ox), Math.round(y - c.base));
  }
  function W(s, font) { mctx.font = font || F12; return mctx.measureText(s).width; }
  function rich(segs, x, y, font, shadow) { for (const [s, c] of segs) { T(s, x, y, c, font, 'left', shadow); x += W(s, font); } return x; }
  function richW(segs, font) { return segs.reduce((a, [s]) => a + W(s, font), 0); }
  function inR(x, y, r) { return x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h; }
  function fmt(n) { return Math.floor(n).toLocaleString('en-US'); }
  function qtyText(q) { if (q >= 10000000) return [Math.floor(q / 1000000) + 'M', C.green]; if (q >= 100000) return [Math.floor(q / 1000) + 'K', C.white]; return [String(q), C.yellow]; }
  function bevel(x, y, w, h, fill, light, dark) {
    ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = light; ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y, 1, h);
    ctx.fillStyle = dark; ctx.fillRect(x, y + h - 1, w, 1); ctx.fillRect(x + w - 1, y, 1, h);
  }
  function button(x, y, w, h, label, active, font) {
    bevel(x, y, w, h, active ? '#6e2a1e' : '#4a4134', active ? '#a0503a' : '#6a604e', '#1e1a14');
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.strokeRect(x - 0.5, y - 0.5, w + 1, h + 1);
    T(label, x + w / 2, y + h / 2 + 4, active ? C.white : C.orange, font || F11B, 'center');
  }
  function noiseFill(c2, w, h, base, amt, seed) {
    let s = seed || 7; const rr = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const img = c2.createImageData(w, h);
    for (let i = 0; i < w * h; i++) { const v = (rr() - 0.5) * amt; img.data[i * 4] = base[0] + v; img.data[i * 4 + 1] = base[1] + v; img.data[i * 4 + 2] = base[2] + v * 0.8; img.data[i * 4 + 3] = 255; }
    c2.putImageData(img, 0, 0);
  }
  const stoneCache = {};
  function stoneTexture(w, h, base, seed) {
    const key = w + ',' + h + ',' + seed;
    if (stoneCache[key]) return stoneCache[key];
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    noiseFill(g, w, h, base, 14, seed);
    let s = seed || 3; const rr = () => { s = (s * 48271) % 2147483647; return s / 2147483647; };
    let y = 0;
    while (y < h) {
      const bh = 7 + Math.floor(rr() * 6);
      let x = -Math.floor(rr() * 12);
      while (x < w) {
        const bw = 12 + Math.floor(rr() * 18), v = (rr() - 0.5) * 22;
        g.fillStyle = `rgba(${base[0] + v + 6},${base[1] + v + 5},${base[2] + v + 3},0.55)`; g.fillRect(x + 1, y + 1, bw - 2, bh - 2);
        g.fillStyle = 'rgba(255,240,210,0.07)'; g.fillRect(x + 1, y + 1, bw - 2, 1);
        g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x, y + bh - 1, bw, 1); g.fillRect(x + bw - 1, y, 1, bh);
        x += bw;
      }
      y += bh;
    }
    stoneCache[key] = c;
    return c;
  }

  // ---------- static frame ----------
  function buildFrame() {
    frameCv = document.createElement('canvas'); frameCv.width = 765; frameCv.height = 503;
    const g = frameCv.getContext('2d');
    g.drawImage(stoneTexture(765, 503, [76, 66, 53], 11), 0, 0);
    g.fillStyle = '#000'; g.fillRect(VP.x - 2, VP.y - 2, VP.w + 4, VP.h + 4);
    g.fillStyle = '#2a241b'; g.fillRect(VP.x - 3, VP.y - 3, VP.w + 6, 1); g.fillRect(VP.x - 3, VP.y - 3, 1, VP.h + 6);
    g.clearRect(VP.x, VP.y, VP.w, VP.h);
    parchCv = document.createElement('canvas'); parchCv.width = CHAT.w; parchCv.height = CHAT.h;
    const pg = parchCv.getContext('2d'); noiseFill(pg, CHAT.w, CHAT.h, [200, 184, 146], 16, 5);
    const grd = pg.createLinearGradient(0, 0, 0, CHAT.h); grd.addColorStop(0, 'rgba(120,90,50,0.15)'); grd.addColorStop(0.5, 'rgba(0,0,0,0)'); grd.addColorStop(1, 'rgba(120,90,50,0.2)');
    pg.fillStyle = grd; pg.fillRect(0, 0, CHAT.w, CHAT.h);
    g.fillStyle = '#1e1a14'; g.fillRect(CHAT.x - 2, CHAT.y - 2, CHAT.w + 4, CHAT.h + 4);
    g.drawImage(parchCv, CHAT.x, CHAT.y);
    g.fillStyle = '#7a6440'; g.fillRect(CHAT.x, CHAT.y + 111, CHAT.w, 1);
    g.fillStyle = '#1e1a14'; g.fillRect(PANEL.x - 2, PANEL.y - 2, PANEL.w + 4, PANEL.h + 4);
    g.drawImage(stoneTexture(PANEL.w, PANEL.h, [62, 53, 41], 21), PANEL.x, PANEL.y);
    g.fillStyle = '#000'; g.beginPath(); g.arc(MM.cx, MM.cy, MM.r + 4, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#2a241b'; g.lineWidth = 2; g.beginPath(); g.arc(MM.cx, MM.cy, MM.r + 5, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#000'; g.beginPath(); g.arc(COMPASS.cx, COMPASS.cy, COMPASS.r + 2, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 7; i++) for (const row of [TABS_TOP, TABS_BOT]) {
      const x = row.x + i * row.w;
      g.fillStyle = '#1e1a14'; g.fillRect(x, row.y, row.w, row.h);
      g.drawImage(stoneTexture(row.w - 2, row.h - 2, [70, 61, 48], 30 + i), x + 1, row.y + 1);
      g.fillStyle = 'rgba(255,240,200,0.12)'; g.fillRect(x + 1, row.y + 1, row.w - 2, 1);
    }
    g.fillStyle = '#1e1a14'; g.fillRect(4, 478, 512, 1);
  }

  // ---------- minimap image ----------
  function buildMinimap() {
    const Wd = World.W, Hd = World.H;
    mmCv = document.createElement('canvas'); mmCv.width = Wd * 4; mmCv.height = Hd * 4;
    const g = mmCv.getContext('2d');
    for (let z = 0; z < Hd; z++) for (let x = 0; x < Wd; x++) { const c = World.minimapColor(x, z); g.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`; g.fillRect(x * 4, z * 4, 4, 4); }
    for (const loc of World.locs) {
      const x = loc.x * 4, z = loc.z * 4;
      if (TREES[loc.type] || ['pine', 'palm', 'deadtree'].includes(loc.type)) { g.fillStyle = loc.type === 'pine' ? '#1e3e1a' : loc.type === 'deadtree' ? '#3a2e22' : '#244a1c'; g.fillRect(x, z + 1, 4, 2); g.fillRect(x + 1, z, 2, 4); g.fillStyle = '#3a6a2a'; g.fillRect(x + 1, z + 1, 1, 1); }
      else if (ROCKS[loc.type]) { g.fillStyle = '#6a6460'; g.fillRect(x + 1, z + 1, 2, 2); }
    }
    g.fillStyle = '#f0f0f0';
    for (const s of World.wallSegs) { const [[ax, az], [bx, bz]] = World.edgeEnds(s.x, s.z, s.side); g.fillRect(ax * 4, az * 4, Math.max(1, (bx - ax) * 4), Math.max(1, (bz - az) * 4)); }
    g.fillStyle = '#d8d0c0';
    for (const s of World.fenceSegs) { const [[ax, az], [bx, bz]] = World.edgeEnds(s.x, s.z, s.side); g.fillRect(ax * 4, az * 4, Math.max(1, (bx - ax) * 4), Math.max(1, (bz - az) * 4)); }
    mmBridge = World.bridgeOpen;
  }
  const ICONS = { bank: ['#e8c030', '#5a3a10', '$'], store: ['#c08040', '#3a2a10', 'S'], furnace: ['#ff8020', '#4a1a00', 'F'], anvil: ['#a0a0a8', '#202024', 'A'],
    range: ['#d0d0d0', '#5a2a10', 'C'], altar: ['#ffffff', '#3a3a8a', '+'], quest: ['#6aa0ff', '#0a1a5a', '?'], fish: ['#80c0ff', '#103060', '~'], mine: ['#c0a080', '#3a2a1a', 'M'],
    rune: ['#ff6040', '#3a0a40', 'R'], archery: ['#e0c080', '#2a4a1a', 'B'], herb: ['#80e060', '#1a3a10', 'H'], tanner: ['#e0a060', '#4a2a10', 'T'], spin: ['#f0e0c0', '#4a3a2a', 'W'],
    stall: ['#ffd060', '#4a1a1a', '$'], farm: ['#a0e060', '#3a2a10', 'F'], agility: ['#60c0ff', '#1a2a4a', 'A'], slayer: ['#ff4040', '#200000', 'S'], rc: ['#ffffff', '#2a2a6a', 'O'],
    essence: ['#d0d0ff', '#30305a', 'E'], scimitar: ['#e0e0e0', '#6a1a1a', 'Z'], boat: ['#ffffff', '#1a3a6a', 'P'], gem: ['#60e0ff', '#1a2a4a', 'G'], armour: ['#e0e0e0', '#3a3a5a', 'A'], guild: ['#e8c030', '#3a2a1a', 'M'], staff: ['#c0a0ff', '#2a1a4a', '/'], axe: ['#d0d0d0', '#4a2a1a', 'X'], ring: ['#a0ffb0', '#1a4a2a', '*'], board: ['#f0e0b0', '#5a3a1a', 'T'], spirit: ['#80ff80', '#1a3a1a', 'Y'] };
  function mapIcon(type, x, y, r) {
    const [fg, bg, ch] = ICONS[type] || ICONS.quest;
    r = r || 6;
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(x, y, r - 1, 0, Math.PI * 2); ctx.fill();
    T(ch, x, y + 4, fg, 'bold 10px Arial', 'center', false);
  }

  // ---------- tab icons ----------
  function tabIcon(i, x, y) {
    const cx = x + 16, cy = y + 18;
    const img = (cv2, s) => ctx.drawImage(cv2, cx - s / 2, cy - s / 2, s, s);
    switch (i) {
      case 0: img(Icons.item('bronze_scimitar'), 26); break;
      case 1: for (let k = 0; k < 3; k++) { ctx.fillStyle = '#000'; ctx.fillRect(cx - 9 + k * 7, cy + 7 - (k + 1) * 5, 6, (k + 1) * 5 + 1); ctx.fillStyle = ['#d03020', '#e0c020', '#30b030'][k]; ctx.fillRect(cx - 8 + k * 7, cy + 8 - (k + 1) * 5, 4, (k + 1) * 5 - 1); } break;
      case 2: ctx.fillStyle = '#000'; ctx.fillRect(cx - 8, cy - 10, 16, 20); ctx.fillStyle = '#e8d8a8'; ctx.fillRect(cx - 7, cy - 9, 14, 18); ctx.fillStyle = '#2a4aa0'; for (let k = 0; k < 4; k++) ctx.fillRect(cx - 5, cy - 6 + k * 4, 10, 1); break;
      case 3: ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(cx, cy + 2, 10, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#8a5a2a'; ctx.beginPath(); ctx.ellipse(cx, cy + 2, 9, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#6a4018'; ctx.fillRect(cx - 9, cy - 1, 18, 3); ctx.fillStyle = '#c09040'; ctx.fillRect(cx - 2, cy - 1, 4, 4); ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy - 7, 4, Math.PI, 0); ctx.stroke(); break;
      case 4: img(Icons.item('iron_full_helm'), 26); break;
      case 5: img(Icons.skill('prayer'), 24); break;
      case 6: img(Icons.skill('magic'), 26); break;
      case 8: case 9: ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#f0d040'; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#000'; ctx.fillRect(cx - 4, cy - 4, 2, 3); ctx.fillRect(cx + 2, cy - 4, 2, 3);
        ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.beginPath(); if (i === 8) ctx.arc(cx, cy + 1, 5, 0.2, Math.PI - 0.2); else ctx.arc(cx, cy + 8, 5, Math.PI + 0.4, -0.4); ctx.stroke(); break;
      case 10: ctx.fillStyle = '#000'; ctx.fillRect(cx - 8, cy - 12, 16, 24); ctx.fillStyle = '#7a5028'; ctx.fillRect(cx - 7, cy - 11, 14, 22); ctx.fillStyle = '#5a3818'; ctx.fillRect(cx - 5, cy - 9, 10, 8); ctx.fillRect(cx - 5, cy + 1, 10, 8); ctx.fillStyle = '#e8c030'; ctx.fillRect(cx + 3, cy, 2, 2); break;
      case 11: ctx.save(); ctx.translate(cx, cy); ctx.rotate(0.7); ctx.fillStyle = '#000'; ctx.fillRect(-3, -12, 6, 24); ctx.fillRect(-7, -12, 14, 5); ctx.fillStyle = '#a0a0a8'; ctx.fillRect(-2, -11, 4, 22); ctx.fillRect(-6, -11, 12, 3); ctx.restore(); break;
      case 12: img(Icons.skill('agility'), 24); break;
      case 13: ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(cx - 4, cy + 7, 5, 4, -0.3, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(cx, cy - 10, 3, 17); ctx.fillRect(cx, cy - 10, 8, 4); ctx.fillStyle = '#e8e8e8'; ctx.beginPath(); ctx.ellipse(cx - 4, cy + 7, 4, 3, -0.3, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(cx + 1, cy - 9, 1, 15); ctx.fillRect(cx + 1, cy - 9, 6, 2); break;
    }
  }
  function tabAt(x, y) {
    for (const [row, off] of [[TABS_TOP, 0], [TABS_BOT, 7]]) {
      if (y >= row.y && y < row.y + row.h && x >= row.x && x < row.x + row.w * 7) { const i = Math.floor((x - row.x) / row.w) + off; return TAB_NAMES[i] ? i : -1; }
    }
    return -1;
  }
  function drawTabs() {
    for (let i = 0; i < 14; i++) {
      if (!TAB_NAMES[i]) continue;
      const row = i < 7 ? TABS_TOP : TABS_BOT, x = row.x + (i % 7) * row.w, y = row.y;
      if (i === tab) { ctx.fillStyle = 'rgba(160,40,20,0.55)'; ctx.fillRect(x + 1, y + 1, row.w - 2, row.h - 2); ctx.strokeStyle = '#c05030'; ctx.lineWidth = 1; ctx.strokeRect(x + 1.5, y + 1.5, row.w - 3, row.h - 3); }
      tabIcon(i, x, y);
    }
  }

  // ---------- skill guides ----------
  function guide(skill) {
    const E = [];
    const add = (level, text, icon) => E.push({ level, text, icon });
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
    const metals = ['bronze', 'iron', 'steel', 'mithril', 'adamant', 'rune'];
    switch (skill) {
      case 'attack': for (const m of metals) add(ITEMS[m + '_scimitar'].equip.req.attack || 1, `${cap(m)} weapons`, m + '_scimitar'); break;
      case 'defence': for (const m of metals) add(ITEMS[m + '_platebody'].equip.req.defence || 1, `${cap(m)} armour`, m + '_platebody'); add(1, 'Leather armour', 'leather_body'); break;
      case 'strength': add(1, 'Increases your maximum melee hit', 'bronze_scimitar'); add(12, 'Strength potions (Herblore)', 'strength_potion3'); break;
      case 'hitpoints': add(1, 'Determines how much damage you can take', 'shrimps'); add(10, 'Starting Hitpoints level', 'cooked_meat'); break;
      case 'ranged': for (const [id] of BOWS) add(ITEMS[id].equip.req.ranged || 1, ITEMS[id].name, id); for (const a of ARROWS) add(1, ITEMS[a[0] + '_arrow'].name + 's', a[0] + '_arrow'); break;
      case 'prayer': for (const p of PRAYERS) add(p.level, p.name, null); break;
      case 'magic': for (const s of SPELLS) add(s.level || 1, s.name, null); add(1, 'Staves let you autocast combat spells', 'staff'); break;
      case 'runecrafting': add(1, 'Altars need a matching talisman or tiara', 'air_talisman'); add(27, 'Cosmic, chaos, nature, law and death altars need pure essence', 'pure_essence'); for (const id in POUCHES) add(POUCHES[id].level, POUCHES[id].name + ` (holds ${POUCHES[id].cap})`, id); for (const k in RC_ALTARS) { add(RC_ALTARS[k].level, `${cap(k)} runes`, k + '_rune'); add(RC_ALTARS[k].multi, `Two ${k} runes per essence`, k + '_rune'); } break;
      case 'woodcutting': for (const k in TREES) add(TREES[k].level, TREES[k].name + 's', TREES[k].log); break;
      case 'mining': for (const k in ROCKS) add(ROCKS[k].level, ITEMS[ROCKS[k].ore].name, ROCKS[k].ore); add(1, 'Rune essence', 'rune_essence'); add(30, 'Pure essence (Rune Essence mine)', 'pure_essence'); add(1, 'Chance of finding gems', 'uncut_sapphire'); add(60, 'Enter the Mining Guild (Whitecliff)', 'coal'); break;
      case 'smithing': for (const r of SMELTING) add(r.level, ITEMS[r.out].name, r.out); for (const r of SMITHING) add(r.level, ITEMS[r.out].name, r.out); break;
      case 'fishing': for (const op in FISHING) for (const [id, lv] of FISHING[op].fish) add(lv, `${ITEMS[id].name.replace('Raw ', '')} (${op}, ${ITEMS[FISHING[op].tool].name.toLowerCase()})`, id); break;
      case 'cooking': for (const k in COOKING) add(COOKING[k].level, ITEMS[COOKING[k].out].name, COOKING[k].out); break;
      case 'firemaking': for (const k in FIREMAKING) add(FIREMAKING[k].level, ITEMS[k].name, k); break;
      case 'fletching': for (const k in SHAFTS) add(SHAFTS[k].level, `Arrow shafts (${ITEMS[k].name})`, 'arrow_shaft'); for (const b of FLETCH_BOW) add(b.level, ITEMS[b.bow].name, b.bow); for (const a of ARROWS) add(a[1], ITEMS[a[0] + '_arrow'].name + 's', a[0] + '_arrow'); break;
      case 'crafting': for (const r of CRAFT_LEATHER) add(r.level, ITEMS[r.out].name, r.out); add(5, 'Gold ring', 'gold_ring'); add(8, 'Gold amulet', 'gold_amulet'); add(10, 'Spin bow string', 'bow_string'); for (const g of GEMS) add(g[3], 'Cut ' + g[1].toLowerCase(), g[0]); for (const j of JEWEL) add(j.level, ITEMS[j.out].name, j.out); break;
      case 'herblore': for (const [id, , , lv] of HERBS) add(lv, 'Clean ' + ITEMS[id + '_leaf'].name, 'grimy_' + id); for (const p of POTIONS) add(p.level, p.name, p.id + '3'); break;
      case 'agility': add(1, 'Ardenvale Agility Course', null); add(1, 'Faster run energy restore', null); add(35, 'Barbarian Agility Course (south of the desert)', null); add(52, 'Wilderness Agility Course (dangerous!)', null); break;
      case 'thieving': add(1, 'Pickpocket men and women', 'coins'); add(5, 'Steal from bakery stalls', 'cake'); add(20, 'Steal from silk stalls', 'silk'); add(10, 'Pickpocket farmers', 'potato_seed'); add(25, 'Pickpocket guards & Al Kharid warriors', 'coins'); add(55, 'Pickpocket White Knights', 'coins'); add(75, 'Steal from gem stalls', 'uncut_ruby'); break;
      case 'slayer': for (const t of SLAYER_TASKS) add(t.slayer || 1, `${NPCS[t.npc].name} tasks (combat ${t.min}+)`, null); break;
      case 'farming': for (const k in SEEDS) add(SEEDS[k].level, ITEMS[SEEDS[k].crop].name, k); break;
      case 'hunter': for (const k in HUNTER) for (const c of HUNTER[k].catches) add(c.level, `${c.name} (${c.region})`, k); break;
    }
    E.sort((a, b) => a.level - b.level);
    return E;
  }

  // ---------- options ----------
  const O = (segs, fn, extra) => Object.assign({ segs, fn }, extra || {});
  const act = (a, t, c) => t ? [[a + ' ', C.white], [t, c]] : [[a, C.white]];
  function lvlColor(nl) {
    const d = Game.combatLevel() - nl;
    if (d < -9) return '#ff0000'; if (d < -6) return '#ff3000'; if (d < -3) return '#ff7000'; if (d < 0) return '#ffb000';
    if (d === 0) return '#ffff00'; if (d > 9) return '#00ff00'; if (d > 6) return '#40ff00'; if (d > 3) return '#80ff00'; return '#c0ff00';
  }
  function npcLabel(n) { return n.def.level ? [[n.def.name, C.yellow], [`  (level-${n.def.level})`, lvlColor(n.def.level)]] : [[n.def.name, C.yellow]]; }
  function npcOps(n) {
    const d = n.def, ops = [];
    if (d.talk === 'man') ops.push('Talk-to');
    if (d.hp) ops.push('Attack');
    if (d.talk && d.talk !== 'man') ops.push('Talk-to');
    if (d.bank) ops.push('Bank');
    if (d.shop) ops.push('Trade');
    if (d.talk === 'slayer') ops.push('Assignment');
    if (d.pickpocket) ops.push('Pickpocket');
    return ops;
  }
  function locName(l) {
    if (l.depletedUntil > S().tick) return TREES[l.type] ? 'Tree stump' : ROCKS[l.type] ? 'Rocks' : l.def.name;
    return l.def.name;
  }
  const selName = () => { const it = S().inv[S().selected]; return it ? ITEMS[it.id].name : ''; };

  function worldOptions(vx, vy) {
    const st = S(), opts = [], exam = [];
    const { ents, tile } = Render.pick(vx, vy);
    Render.setHoverTile(tile);
    const sel = st.selected >= 0 && st.inv[st.selected];
    const spell = st.spellSel;
    const useSeg = sel ? [['Use ', C.white], [selName(), C.itemc], [' -> ', C.white]] : null;
    for (const { kind, ent } of ents) {
      if (kind === 'bot') {
        if (spell || sel) continue;
        const label = [[ent.name, C.white], [`  (level-${ent.cl})`, lvlColor(ent.cl)]];
        for (const op of ['Trade with', 'Follow', 'Report']) opts.push(O([[op + ' ', C.white], ...label], () => Game.interact('bot', ent, op), { cross: 'red' }));
        continue;
      }
      if (kind === 'npc') {
        const label = npcLabel(ent);
        if (spell) { if (spell.type === 'combat' && ent.def.hp) opts.push(O([['Cast ', C.white], [spell.name, C.spell], [' -> ', C.white], ...label], () => Game.castOn(ent, spell), { cross: 'red' })); continue; }
        if (sel) { const slot = st.selected; opts.push(O(useSeg.concat(label), () => Game.interact('npc', ent, 'Use', slot), { cross: 'red' })); continue; }
        for (const op of npcOps(ent)) opts.push(O([[op + ' ', C.white], ...label], () => Game.interact('npc', ent, op), { cross: 'red' }));
        exam.push(O([['Examine ', C.white], ...label], () => Game.msg(ent.def.examine)));
      } else {
        if (spell) continue;
        const name = locName(ent);
        if (sel) { const slot = st.selected; opts.push(O(useSeg.concat([[name, C.cyan]]), () => Game.interact('loc', ent, 'Use', slot), { cross: 'red' })); continue; }
        if (!(ent.depletedUntil > st.tick)) for (const op of Game.locOps(ent)) opts.push(O(act(op, name, C.cyan), () => Game.interact('loc', ent, op), { cross: 'red' }));
        exam.push(O(act('Examine', name, C.cyan), () => Game.msg(ent.depletedUntil > st.tick ? (TREES[ent.type] ? 'This tree has been cut down.' : 'There is currently nothing here.') : ent.def.examine)));
      }
    }
    if (tile && !sel && !spell) {
      const items = st.ground.filter(g => g.x === tile[0] && g.z === tile[1]);
      for (let i = items.length - 1; i >= 0; i--) {
        const g = items[i]; const nm = ITEMS[g.id].name + (g.qty > 1 ? ` (${g.qty})` : '');
        opts.push(O(act('Take', nm, C.itemc), () => Game.interact('ground', g, 'Take'), { cross: 'red' }));
        exam.push(O(act('Examine', ITEMS[g.id].name, C.itemc), () => Game.msg(ITEMS[g.id].examine)));
      }
    }
    if (tile) opts.push(O(act('Walk here'), () => { st.spellSel = null; Game.walkTo(tile[0], tile[1], { run: ctrlHeld }); }, { cross: 'yellow' }));
    return opts.concat(exam);
  }

  function invSlotAt(x, y) {
    const lx = x - PANEL.x - 14, ly = y - PANEL.y - 9;
    if (lx < 0 || ly < 0) return -1;
    const c = Math.floor(lx / 42), r = Math.floor(ly / 36);
    if (c > 3 || r > 6 || lx % 42 > 36) return -1;
    return r * 4 + c;
  }
  const invSlotPos = i => [PANEL.x + 14 + (i % 4) * 42, PANEL.y + 9 + Math.floor(i / 4) * 36];
  function invOptions(slot) {
    const st = S(), it = st.inv[slot];
    if (!it) return [];
    const nm = ITEMS[it.id].name;
    const iface = st.iface && st.iface.type;
    if (iface === 'bank') return [1, 5, 10, 'All'].map(n => O(act('Deposit-' + n, nm, C.itemc), () => Game.bankDeposit(slot, n === 'All' ? 1e9 : n))).concat([O(act('Examine', nm, C.itemc), () => Game.msg(ITEMS[it.id].examine))]);
    if (iface === 'trade') {
      if (st.iface.stage !== 1) return [];
      return [1, 5, 10, 'All', 'X'].map(n => O(act('Offer-' + n, nm, C.itemc), () => n === 'X' ? askAmount('Enter amount:', v => Game.offerItem(slot, v)) : Game.offerItem(slot, n === 'All' ? 1e9 : n)))
        .concat([O(act('Value', nm, C.itemc), () => Game.msg(`${nm} is worth about ${fmt(ITEMS[it.id].value)} coins each.`)), O(act('Examine', nm, C.itemc), () => Game.msg(ITEMS[it.id].examine))]);
    }
    if (iface === 'shop') {
      const sid = st.iface.shop;
      return [O(act('Value', nm, C.itemc), () => Game.msg(`${nm}: shop will buy for ${fmt(Game.sellPrice(it.id))} coins.`))]
        .concat([1, 5, 10].map(n => O(act('Sell ' + n, nm, C.itemc), () => Game.shopSell(sid, slot, n))))
        .concat([O(act('Examine', nm, C.itemc), () => Game.msg(ITEMS[it.id].examine))]);
    }
    if (st.spellSel) { const sp = st.spellSel; return sp.type === 'item' ? [O([['Cast ', C.white], [sp.name, C.spell], [' -> ', C.white], [nm, C.itemc]], () => Game.castOnItem(slot, sp))] : []; }
    if (st.selected >= 0) {
      if (st.selected === slot) return [O([['Use ', C.white], [nm, C.itemc]], () => { st.selected = -1; })];
      const s0 = st.selected;
      return [O([['Use ', C.white], [selName(), C.itemc], [' -> ', C.white], [nm, C.itemc]], () => Game.useItemOnItem(s0, slot))];
    }
    const ops = Game.itemOps(it).map(op => O(act(op, nm, C.itemc), () => Game.invAction(slot, op), { keepSel: op === 'Use' }));
    ops.push(O(act('Examine', nm, C.itemc), () => Game.msg(ITEMS[it.id].examine)));
    return ops;
  }

  const EQ_POS = { head: [77, 6], cape: [36, 45], neck: [77, 45], ammo: [118, 45], weapon: [21, 84], body: [77, 84], shield: [133, 84], legs: [77, 123], hands: [21, 162], feet: [77, 162], ring: [133, 162] };
  const SPELL_COLS = 4;
  function panelOptions(x, y) {
    const st = S(), lx = x - PANEL.x, ly = y - PANEL.y;
    tooltip = null;
    if (tab === 3) { const s = invSlotAt(x, y); return s >= 0 ? invOptions(s) : []; }
    if (tab === 4) {
      if (lx >= 40 && ly >= 236 && lx < 150 && ly < 256) return [O(act('Show Equipment Stats'), () => { st.iface = { type: 'equipstats' }; })];
      for (const k in EQ_POS) {
        const [ex, ey] = EQ_POS[k];
        if (lx >= ex && ly >= ey && lx < ex + 36 && ly < ey + 36 && st.equip[k]) {
          const nm = ITEMS[st.equip[k]].name;
          return [O(act('Remove', nm, C.itemc), () => Game.unequip(k)), O(act('Examine', nm, C.itemc), () => Game.msg(ITEMS[st.equip[k]].examine))];
        }
      }
      return [];
    }
    if (tab === 1) {
      const col = Math.floor((lx - 3) / 62), row = Math.floor((ly - 4) / 31), i = row * 3 + col;
      if (lx > 3 && ly > 4 && col < 3 && i >= 0 && i < SKILLS.length) {
        const k = SKILLS[i], xp = st.skills[k].xp, L = Game.lvl(k);
        tooltip = { x, y, lines: [`${SKILL_NAMES[k]} XP: ${fmt(xp)}`, L < 99 ? `Next level at: ${fmt(XP_TABLE[L + 1])}` : 'Maximum level reached', L < 99 ? `Remaining XP: ${fmt(XP_TABLE[L + 1] - xp)}` : '', 'Click for the skill guide'] };
        return [O(act('View', SKILL_NAMES[k] + ' guide', C.orange), () => { st.iface = { type: 'guide', skill: k }; guideScroll = 0; })];
      }
      return [];
    }
    if (tab === 0) {
      for (let i = 0; i < 3; i++) { const bx = 10 + (i % 2) * 88, by = 52 + Math.floor(i / 2) * 50; if (lx >= bx && ly >= by && lx < bx + 82 && ly < by + 42) return [O(act(Game.styleNames()[i]), () => { st.style = i; st.autocast = null; Sfx.play('click'); })]; }
      if (Game.weaponKind() === 'staff' && lx >= 98 && ly >= 102 && lx < 180 && ly < 144) return [O(act('Choose autocast spell'), () => {
        const opts = SPELLS.filter(s => s.type === 'combat' && Game.lvl('magic') >= s.level);
        const i = opts.findIndex(s => s.id === st.autocast);
        const nx = opts[i + 1];
        st.autocast = nx ? nx.id : null;
      })];
      if (lx >= 30 && ly >= 200 && lx < 160 && ly < 230) return [O(act('Auto Retaliate'), () => { st.autoRetaliate = !st.autoRetaliate; Sfx.play('click'); })];
      return [];
    }
    if (tab === 5) {
      const i = Math.floor((lx - 6) / 36) + Math.floor((ly - 8) / 36) * 5;
      if (lx > 6 && ly > 8 && i >= 0 && i < PRAYERS.length && Math.floor((lx - 6) / 36) < 5) {
        const p = PRAYERS[i];
        tooltip = { x, y, lines: [`Level ${p.level}`, p.name] };
        return [O(act(st.prayers[p.id] ? 'Deactivate' : 'Activate', p.name, C.orange), () => Game.togglePrayer(p))];
      }
      return [];
    }
    if (tab === 6) {
      const col = Math.floor((lx - 8) / 44), row = Math.floor((ly - 8) / 40), i = row * SPELL_COLS + col;
      if (lx > 8 && ly > 8 && col < SPELL_COLS && i >= 0 && i < SPELLS.length) {
        const sp = SPELLS[i];
        const runes = Object.entries(sp.runes).map(([r, n]) => `${n} ${r}`).join(', ');
        tooltip = { x, y, lines: [`Level ${sp.level}: ${sp.name}`, runes ? 'Runes: ' + runes : 'No runes required', sp.max ? `Max hit: ${sp.max}` : ''] };
        return [O(act('Cast', sp.name, C.spell), () => Game.castSpell(sp))];
      }
      return [];
    }
    if (tab === 2) {
      const i = Math.floor((ly - 32) / 16);
      if (lx >= 20 && ly >= 176 && lx < 170 && ly < 198) return [O(act('View Beginner Tasks'), () => { st.iface = { type: 'tasks' }; })];
      if (ly >= 32 && i >= 0 && i < QUESTS.length) { const q = QUESTS[i]; return [O(act('Read Journal:', q.name, C.orange), () => { st.iface = { type: 'journal', quest: q.id }; })]; }
      return [];
    }
    if (tab === 10) { if (lx >= 30 && ly >= 120 && lx < 160 && ly < 150) return [O(act('Logout'), () => Game.logout())]; return []; }
    if (tab === 11) {
      for (let b = 0; b < 4; b++) if (lx >= 12 + b * 42 && ly >= 40 && lx < 48 + b * 42 && ly < 64) return [O(act('Adjust Brightness'), () => { st.settings.brightness = b; Render.setBrightness(b); })];
      if (lx >= 12 && ly >= 100 && lx < 178 && ly < 124) return [O(act('Toggle Sound Effects'), () => { Sfx.enabled = !Sfx.enabled; })];
      if (lx >= 12 && ly >= 134 && lx < 178 && ly < 158) return [O(act('Toggle Music'), () => Sfx.setMusic(!Sfx.musicOn))];
      for (const [i, r] of [[0, 1], [1, 2], [2, 5], [3, 10]]) if (lx >= 12 + i * 42 && ly >= 190 && lx < 48 + i * 42 && ly < 214) return [O(act('Set XP rate', r + 'x', C.yellow), () => { st.settings.xpRate = r; Game.msg(`XP rate set to ${r}x.`); })];
      return [];
    }
    if (tab === 12) {
      if (ly >= 30 && ly < 56) { if (lx >= 14 && lx < 92) return [O(act('Walk'), () => { st.player.run = false; })]; if (lx >= 98 && lx < 176) return [O(act('Run'), () => { st.player.run = true; })]; }
      const em = ['yes', 'no', 'bow', 'wave', 'cheer', 'dance', 'think'];
      for (let i = 0; i < em.length; i++) { const bx = 14 + (i % 2) * 84, by = 106 + Math.floor(i / 2) * 32; if (lx >= bx && ly >= by && lx < bx + 78 && ly < by + 26) return [O(act(em[i][0].toUpperCase() + em[i].slice(1)), () => Game.emote(em[i]))]; }
      return [];
    }
    if (tab === 13) {
      const i = Math.floor((ly - 40) / 18);
      if (ly >= 40 && i >= 0 && i < Sfx.TRACKS.length) return [O(act('Play', Sfx.TRACKS[i], C.orange), () => { if (!Sfx.musicOn) Sfx.setMusic(true); Sfx.playTrack(Sfx.TRACKS[i]); })];
      return [];
    }
    return [];
  }

  function minimapOptions(x, y) {
    const p = S().player;
    if (Math.hypot(x - COMPASS.cx, y - COMPASS.cy) <= COMPASS.r) return [O(act('Face North'), () => { Render.cam.yaw = 0; })];
    if (Math.hypot(x - MAPBTN.cx, y - MAPBTN.cy) <= MAPBTN.r) return [O(act('World Map'), () => { worldMap.open = true; worldMap.cx = p.x; worldMap.cz = p.z; })];
    const dx0 = x - MM.cx, dy0 = y - MM.cy;
    if (Math.hypot(dx0, dy0) > MM.r) return null;
    const a = Render.cam.yaw, cs = Math.cos(a), sn = Math.sin(a);
    const dx = dx0 * cs + dy0 * sn, dz = -dx0 * sn + dy0 * cs;
    const tx = Math.floor(p.rx + dx / mmZ), tz = Math.floor(p.rz + dz / mmZ);
    let near = null, nd = 7;
    for (const ic of World.mapIcons) { const d = Math.hypot((ic.x - p.rx) * mmZ - dx, (ic.z - p.rz) * mmZ - dz); if (d < nd) { nd = d; near = ic; } }
    if (near) tooltip = { x: x + 12, y: y + 4, lines: [ICON_NAMES[near.icon] || near.icon] };
    const opts = [O(act('Walk here'), () => Game.walkTo(tx, tz, { run: ctrlHeld }), { cross: 'yellow' })];
    if (mmZ !== 4) opts.push(O(act('Reset zoom'), () => { mmZ = 4; }));
    return opts;
  }
  function chatOptions(x, y) {
    const st = S(), d = st.dialog;
    if (y >= 480) {
      const i = Math.floor((x - 5) / 128);
      const labels = ['Public chat', 'Private chat', 'Trade/compete', 'Report abuse'];
      if (i >= 0 && i < 4) return [O(act(labels[i]), () => { if (i === 3) Game.msg('Thank you, your abuse report has been received.'); })];
      return [];
    }
    if (inR(x, y, CHAT) && !d && y < CHAT.y + 110) {
      const k = Math.floor((CHAT.y + 108 - y) / 14), m = st.messages[st.messages.length - 1 - chatScroll - k];
      if (m && m.tradeReq) return [O([['Accept trade from ', C.white], [m.tradeReq.name, C.white]], () => Game.acceptTradeRequest(m.tradeReq))];
      if (m && m.from && m.from !== st.name) { const b = st.bots.find(b => b.name === m.from); if (b) return [O([['Trade with ', C.white], [b.name, C.white]], () => Game.acceptTradeRequest(b))]; }
      return [];
    }
    if (!inR(x, y, CHAT) || !d) return [];
    if (d.kind === 'options') {
      const n = d.options.length, step = Math.min(16, 84 / n);
      for (let i = 0; i < n; i++) { const oy = CHAT.y + 36 + i * step; if (y >= oy - 12 && y < oy - 12 + step) return [O(act('Continue'), () => { const o = d.options[i]; st.dialog = null; o.fn(); })]; }
      return [];
    }
    if (y >= CHAT.y + 92 && y < CHAT.y + 110) return [O(act('Continue'), continueDialog)];
    return [];
  }
  function continueDialog() { const st = S(), d = st.dialog; if (!d || d.kind === 'options') return; st.dialog = null; if (d.next) d.next(); }

  // ---------- interface windows ----------
  function winFrame(title) {
    ctx.fillStyle = '#000'; ctx.fillRect(WIN.x - 1, WIN.y - 1, WIN.w + 2, WIN.h + 2);
    bevel(WIN.x, WIN.y, WIN.w, WIN.h, '#3e3529', '#6e604a', '#1a160f');
    ctx.fillStyle = '#2a241b'; ctx.fillRect(WIN.x + 6, WIN.y + 24, WIN.w - 12, WIN.h - 30);
    ctx.strokeStyle = '#5a4e3c'; ctx.strokeRect(WIN.x + 6.5, WIN.y + 24.5, WIN.w - 13, WIN.h - 31);
    T(title, WIN.x + WIN.w / 2, WIN.y + 17, C.orange, F13, 'center');
    const cx = WIN.x + WIN.w - 22, cy = WIN.y + 4;
    bevel(cx, cy, 17, 16, '#5a1a10', '#a04030', '#200800');
    T('X', cx + 8.5, cy + 12, C.white, F11B, 'center');
  }
  const closeHit = (x, y) => { const cx = WIN.x + WIN.w - 22, cy = WIN.y + 4; return x >= cx && y >= cy && x < cx + 17 && y < cy + 16; };
  const gridCell = (i, cols, ox, oy, cw, ch) => [ox + (i % cols) * cw, oy + Math.floor(i / cols) * ch];
  const smithRecipes = metal => SMITHING.filter(r => r.metal === metal);
  const SCROLL = { x: 106, y: 38, w: 300, h: 260 };
  function ifaceOptions(x, y) {
    const st = S(), f = st.iface;
    if (f.type === 'questdone' || f.type === 'journal') {
      if (!inR(x, y, SCROLL)) return null;
      if (y > SCROLL.y + SCROLL.h - 26) return [O(act('Close'), () => { st.iface = null; })];
      return [];
    }
    if (!inR(x, y, WIN)) return null;
    if (closeHit(x, y)) return [O(act('Close'), () => { st.iface = null; })];
    if (f.type === 'fairy') {
      for (let i = 0; i < 3; i++) {
        const cx = WIN.x + 70 + i * 90;
        if (inR(x, y, { x: cx - 20, y: WIN.y + 44, w: 40, h: 22 })) return [O(act('Rotate dial'), () => { f.dials[i] = (f.dials[i] + 3) % 4; Sfx.play('click'); })];
        if (inR(x, y, { x: cx - 20, y: WIN.y + 174, w: 40, h: 22 })) return [O(act('Rotate dial'), () => { f.dials[i] = (f.dials[i] + 1) % 4; Sfx.play('click'); })];
      }
      if (inR(x, y, { x: WIN.x + 90, y: WIN.y + 230, w: 120, h: 28 })) { const code = f.dials.map((d, i) => FAIRY_DIALS[i][d]).join(''); return [O(act('Teleport', code, C.green), () => Game.fairyTeleport(code))]; }
      const log = Object.keys(FAIRY).filter(c => (st.fairyLog || []).includes(c));
      for (let i = 0; i < log.length; i++) if (inR(x, y, { x: WIN.x + 300, y: WIN.y + 46 + i * 18, w: 176, h: 18 })) { const c = log[i]; return [O(act('Set code', c, C.yellow), () => { f.dials = c.split('').map((ch, j) => FAIRY_DIALS[j].indexOf(ch)); })]; }
      return [];
    }
    if (f.type === 'board' || f.type === 'tasks' || f.type === 'xptracker') return [];
    if (f.type === 'lamp') {
      for (let i = 0; i < SKILLS.length; i++) { const [cx, cy] = gridCell(i, 7, WIN.x + 30, WIN.y + 50, 64, 56); if (inR(x, y, { x: cx, y: cy, w: 56, h: 48 })) { const k = SKILLS[i]; return [O(act('Choose', SKILL_NAMES[k], C.orange), () => Game.rubLamp(k))]; } }
      return [];
    }
    if (f.type === 'trade') {
      if (inR(x, y, { x: WIN.x + 90, y: WIN.y + WIN.h - 34, w: 96, h: 24 })) return [O(act('Accept'), () => Game.acceptTrade())];
      if (inR(x, y, { x: WIN.x + 194, y: WIN.y + WIN.h - 34, w: 96, h: 24 })) return [O(act('Decline'), () => Game.declineTrade())];
      if (f.stage === 1 && inR(x, y, { x: WIN.x + 298, y: WIN.y + WIN.h - 34, w: 96, h: 24 })) return [O(act('Haggle'), () => Game.haggle())];
      if (f.stage === 1) for (let i = 0; i < (f.bot.sells || []).length; i++) {
        const e = f.bot.sells[i], ry = WIN.y + 154 + i * 20;
        if (inR(x, y, { x: WIN.x + 250, y: ry - 2, w: 228, h: 20 })) { const nm = ITEMS[e.id].name; return [1, 5, 10, 'All', 'X'].map(n => O(act('Request-' + n, nm, C.itemc), () => n === 'X' ? askAmount('How many?', v => Game.requestItem(e.id, v)) : Game.requestItem(e.id, n === 'All' ? e.stock : n))).concat([O(act('Clear', nm, C.itemc), () => Game.requestItem(e.id, 0))]); }
      }
      if (f.stage === 1) for (let i = 0; i < f.my.length; i++) {
        const [cx, cy] = gridCell(i, 5, WIN.x + 16, WIN.y + 46, 42, 36);
        if (x >= cx && y >= cy && x < cx + 36 && y < cy + 32) { const it = f.my[i], nm = ITEMS[it.id].name; return [1, 5, 10, 'All', 'X'].map(n => O(act('Remove-' + n, nm, C.itemc), () => n === 'X' ? askAmount('Enter amount:', v => Game.removeOffer(i, v)) : Game.removeOffer(i, n === 'All' ? 1e9 : n))); }
      }
      if (f.stage === 1) for (let i = 0; i < f.their.length; i++) {
        const [cx, cy] = gridCell(i, 5, WIN.x + 258, WIN.y + 46, 42, 36);
        if (x >= cx && y >= cy && x < cx + 36 && y < cy + 32) { const it = f.their[i], nm = ITEMS[it.id].name; return [O(act('Examine', nm, C.itemc), () => Game.msg(ITEMS[it.id].examine)), O(act('Value', nm, C.itemc), () => Game.msg(`${nm} is worth about ${fmt(Game.mprice(it.id))} coins each.`))]; }
      }
      return [];
    }
    if (f.type === 'bank') {
      if (x >= WIN.x + 330 && y >= WIN.y + WIN.h - 30 && x < WIN.x + 470 && y < WIN.y + WIN.h - 8) return [O(act('Deposit inventory'), () => Game.bankDepositAll())];
      if (x >= WIN.x + 180 && y >= WIN.y + WIN.h - 30 && x < WIN.x + 320 && y < WIN.y + WIN.h - 8) return [O(act('Deposit worn items'), () => Game.bankDepositEquip())];
      for (let i = 0; i < 48; i++) {
        const bi = i + bankScroll * 8, b = st.bank[bi]; if (!b) break;
        const [cx, cy] = gridCell(i, 8, WIN.x + 22, WIN.y + 32, 56, 40);
        if (x >= cx && y >= cy && x < cx + 40 && y < cy + 34) {
          const nm = ITEMS[b.id].name;
          return [1, 5, 10, 'All'].map(n => O(act('Withdraw-' + n, nm, C.itemc), () => Game.bankWithdraw(bi, n === 'All' ? 1e9 : n))).concat([O(act('Examine', nm, C.itemc), () => Game.msg(ITEMS[b.id].examine))]);
        }
      }
      return [];
    }
    if (f.type === 'shop') {
      const stock = st.shops[f.shop];
      for (let i = 0; i < stock.length; i++) {
        const s = stock[i], [cx, cy] = gridCell(i, 8, WIN.x + 22, WIN.y + 32, 56, 44);
        if (x >= cx && y >= cy && x < cx + 40 && y < cy + 34) {
          const nm = ITEMS[s.id].name;
          return [O(act('Value', nm, C.itemc), () => Game.msg(`${nm}: currently costs ${fmt(Game.buyPrice(s.id))} coins.`))]
            .concat([1, 5, 10, 50].map(n => O(act('Buy ' + n, nm, C.itemc), () => Game.shopBuy(f.shop, i, n))))
            .concat([O(act('Examine', nm, C.itemc), () => Game.msg(ITEMS[s.id].examine))]);
        }
      }
      return [];
    }
    if (f.type === 'smith') {
      for (let i = 0; i < Game.METALS.length; i++) { const m = Game.METALS[i]; if (x >= WIN.x + 12 + i * 77 && y >= WIN.y + 30 && x < WIN.x + 85 + i * 77 && y < WIN.y + 50) return [O(act('Select', m.charAt(0).toUpperCase() + m.slice(1), C.orange), () => { f.metal = m; })]; }
      const rs = smithRecipes(f.metal);
      for (let i = 0; i < rs.length; i++) {
        const [cx, cy] = gridCell(i, 4, WIN.x + 14, WIN.y + 58, 116, 116);
        if (x >= cx && y >= cy && x < cx + 110 && y < cy + 110) {
          const r = rs[i], nm = ITEMS[r.out].name;
          return [[1, 1], [5, 5], [10, 10], ['All', 28]].map(([lab, n]) => O(act('Smith ' + lab, nm, C.itemc), () => Game.smith(r, n)));
        }
      }
      return [];
    }
    return [];
  }

  // ---------- world map ----------
  const ICON_NAMES = { bank: 'Bank', store: 'General store', furnace: 'Furnace', anvil: 'Anvil', range: 'Cooking range', altar: 'Altar', quest: 'Quest start', fish: 'Fishing spot', mine: 'Mining site',
    rune: 'Rune shop', archery: 'Archery shop', herb: 'Herbalist', tanner: 'Tannery', spin: 'Spinning wheel', stall: 'Market stall', farm: 'Farming patch', agility: 'Agility course', slayer: 'Slayer master',
    rc: 'Runecrafting altar', essence: 'Rune essence', scimitar: 'Scimitar shop', boat: 'Ship / travel', gem: 'Gem store', armour: 'Armour shop', guild: 'Mining Guild', staff: 'Staff shop', axe: 'Axe shop', ring: 'Fairy ring', board: 'Trading board', spirit: 'Spirit tree' };
  function mapToScreen(wx, wz) { const z = worldMap.zoom; return [310 + (wx - worldMap.cx) * z, 264 + (wz - worldMap.cz) * z]; }
  function drawWorldMap() {
    if (!mmCv || mmBridge !== World.bridgeOpen) buildMinimap();
    ctx.drawImage(stoneTexture(765, 503, [76, 66, 53], 11), 0, 0);
    const R = { x: 10, y: 34, w: 600, h: 460 };
    ctx.fillStyle = '#000'; ctx.fillRect(R.x - 2, R.y - 2, R.w + 4, R.h + 4);
    ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
    ctx.fillStyle = '#10204a'; ctx.fillRect(R.x, R.y, R.w, R.h);
    const z = worldMap.zoom;
    const [ox, oy] = mapToScreen(0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(mmCv, ox, oy, World.W * z, World.H * z);
    const [wx] = mapToScreen(36, 0);
    ctx.fillStyle = 'rgba(120,0,0,0.18)'; ctx.fillRect(R.x, R.y, Math.max(0, wx - R.x), R.h);
    ctx.strokeStyle = 'rgba(255,40,40,0.8)'; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(wx, R.y); ctx.lineTo(wx, R.y + R.h); ctx.stroke(); ctx.setLineDash([]);
    for (const ic of World.mapIcons) { const [x, y] = mapToScreen(ic.x, ic.z); mapIcon(ic.icon, x, y, z > 3 ? 7 : 6); }
    for (const c in FAIRY) { const [x, y] = mapToScreen(FAIRY[c].x + 0.5, FAIRY[c].z + 0.5); T(c, x + 8, y + 4, '#a0ffb0', F11B); }
    for (const [name, x, zz, big] of World.labels) { const [sx, sy] = mapToScreen(x, zz); T(name, sx, sy, big ? '#ffb040' : '#ffe0a0', big ? 'bold 15px Georgia, serif' : F12, 'center'); }
    const p = S().player;
    const [px, py] = mapToScreen(p.x + 0.5, p.z + 0.5);
    const stw = S();
    if (stw.flag) {
      const [fx, fy] = mapToScreen(stw.flag[0] + 0.5, stw.flag[1] + 0.5);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(px, py); for (const [tx, tz] of p.path) { const [sx, sy] = mapToScreen(tx + 0.5, tz + 0.5); ctx.lineTo(sx, sy); } ctx.lineTo(fx, fy); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#000'; ctx.fillRect(fx - 1, fy - 14, 2, 15); ctx.fillStyle = '#ff2020'; ctx.beginPath(); ctx.moveTo(fx + 1, fy - 14); ctx.lineTo(fx + 10, fy - 11); ctx.lineTo(fx + 1, fy - 8); ctx.fill();
    }
    { const z = worldMap.zoom, mx = mouse.x, my = mouse.y; if (mx >= R.x && my >= R.y && mx < R.x + R.w && my < R.y + R.h) { const hx = Math.floor(worldMap.cx + (mx - 310) / z), hz = Math.floor(worldMap.cz + (my - 264) / z); let rg = '', bd = 26; for (const [nm, lx, lz] of World.labels) { const d = Math.hypot(lx - hx, lz - hz); if (d < bd) { bd = d; rg = nm; } } const wl = Game.wildLevel(hx, hz); T((rg || '') + (wl > 0 ? '  (Wilderness lvl ' + wl + ')' : ''), R.x + 6, R.y + R.h - 8, wl > 0 ? '#ff6060' : '#ffffa0', F12); } }
    ctx.fillStyle = Math.floor(performance.now() / 400) % 2 ? '#ffffff' : '#ff0000'; ctx.fillRect(px - 3, py - 3, 7, 7); ctx.strokeStyle = '#000'; ctx.strokeRect(px - 3.5, py - 3.5, 8, 8);
    ctx.restore();
    T(WORLD_NAME + ' World Map', 310, 24, C.orange, 'bold 16px Georgia, serif', 'center');
    const L = { x: 620, y: 34 };
    ctx.fillStyle = '#2a241b'; ctx.fillRect(L.x, L.y, 138, 420);
    ctx.strokeStyle = '#5a4e3c'; ctx.strokeRect(L.x + 0.5, L.y + 0.5, 137, 419);
    T('Key', L.x + 69, L.y + 16, C.orange, F13, 'center');
    const names = ICON_NAMES;
    const _unused = { bank: 'Bank', store: 'General store', furnace: 'Furnace', anvil: 'Anvil', range: 'Cooking range', altar: 'Altar', quest: 'Quest start', fish: 'Fishing spot', mine: 'Mining site',
      rune: 'Rune shop', archery: 'Archery shop', herb: 'Herbalist', tanner: 'Tannery', spin: 'Spinning wheel', stall: 'Market stall', farm: 'Farming patch', agility: 'Agility course', slayer: 'Slayer master',
      rc: 'Runecrafting altar', essence: 'Rune essence', scimitar: 'Scimitar shop', boat: 'Ship / travel', gem: 'Gem store', armour: 'Armour shop', guild: 'Mining Guild', staff: 'Staff shop', axe: 'Axe shop', ring: 'Fairy ring', board: 'Trading board', spirit: 'Spirit tree' };
    Object.keys(names).forEach((k, i) => { mapIcon(k, L.x + 14, L.y + 34 + i * 18); T(names[k], L.x + 26, L.y + 38 + i * 18, C.white, F11); });
    button(632, 462, 114, 26, 'Close map', false, F12);
    T('Drag to move, scroll to zoom, double-click to walk there', 310, 501, '#c0b090', F11, 'center');
  }
  function worldMapDown(x, y) {
    if (x >= 632 && y >= 462 && x < 746 && y < 488) { worldMap.open = false; return; }
    if (x < 610) {
      const now = performance.now();
      if (lastMapClick && now - lastMapClick.t < 350 && Math.hypot(x - lastMapClick.x, y - lastMapClick.y) < 6) {
        const z = worldMap.zoom, wx = Math.floor(worldMap.cx + (x - 310) / z), wz = Math.floor(worldMap.cz + (y - 264) / z);
        Game.walkTo(wx, wz, { run: ctrlHeld }); lastMapClick = null; return;
      }
      lastMapClick = { x, y, t: now };
      mapDrag = { x, y, cx: worldMap.cx, cz: worldMap.cz };
    }
  }

  // ---------- gather options under mouse ----------
  function optionsAt(x, y) {
    const st = S();
    if (!st.loggedIn || worldMap.open) return [];
    tooltip = null;
    if (inR(x, y, VP)) {
      if (st.iface) { const r = ifaceOptions(x, y); if (r) return r; }
      if (inR(x, y, XPBOX)) return [O(act('Open XP tracker'), () => { st.iface = { type: 'xptracker' }; })];
      if (st.player.dead) return [];
      return worldOptions(x - VP.x, y - VP.y);
    }
    if (Math.hypot(x - ORB.run.cx, y - ORB.run.cy) <= 12) return [O(act(st.player.run ? 'Toggle Run (on)' : 'Toggle Run (off)'), () => { st.player.run = !st.player.run; })];
    if (Math.hypot(x - ORB.run.cx, y - ORB.run.cy) <= 12) tooltip = { x, y, lines: [`Run energy: ${Math.floor(st.player.energy)}%`, 'Ctrl-click a tile to run there once'] };
    if (Math.hypot(x - ORB.hp.cx, y - ORB.hp.cy) <= 12) { tooltip = { x, y, lines: [`Hitpoints: ${Game.cur('hitpoints')} / ${Game.lvl('hitpoints')}`] }; return []; }
    if (Math.hypot(x - ORB.pr.cx, y - ORB.pr.cy) <= 12) { tooltip = { x, y, lines: [`Prayer: ${Math.ceil(Game.cur('prayer'))} / ${Game.lvl('prayer')}`] }; return []; }
    const nearMap = Math.hypot(x - MM.cx, y - MM.cy) <= MM.r || Math.hypot(x - COMPASS.cx, y - COMPASS.cy) <= COMPASS.r || Math.hypot(x - MAPBTN.cx, y - MAPBTN.cy) <= MAPBTN.r;
    if (nearMap) { const mm = minimapOptions(x, y); if (mm) return mm; }
    const t = tabAt(x, y);
    if (t >= 0) return [O(act(TAB_NAMES[t]), () => { tab = t; })];
    if (inR(x, y, PANEL)) return panelOptions(x, y);
    if (inR(x, y, CHAT) || (y >= 480 && x < 516)) return chatOptions(x, y);
    return [];
  }
  function exec(o, x, y) {
    const st = S();
    if (!o.keepSel) st.selected = -1;
    if (o.cross) crosses.push({ x, y, t: performance.now(), c: o.cross });
    o.fn();
  }

  // ---------- input ----------
  function toCanvas(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 765, (e.clientY - r.top) / r.height * 503]; }
  let midDrag = null;
  function onDown(e) {
    e.preventDefault();
    Sfx.resume();
    const [x, y] = toCanvas(e);
    mouse.x = x; mouse.y = y; ctrlHeld = e.ctrlKey;
    if (e.button === 1) { midDrag = { x, y, yaw: Render.cam.yaw, pitch: Render.cam.pitch }; return; }
    const st = S();
    if (!st.loggedIn) { loginClick(x, y); return; }
    if (worldMap.open) { worldMapDown(x, y); return; }
    if (menu) {
      if (x >= menu.x && x < menu.x + menu.w && y >= menu.y + 19 && y < menu.y + menu.h) { const o = menu.opts[Math.floor((y - menu.y - 19) / 15)]; if (o) exec(o, menu.ox, menu.oy); }
      menu = null; return;
    }
    const opts = optionsAt(x, y);
    if (e.button === 2) {
      const all = opts.concat([O(act('Cancel'), () => { st.spellSel = null; })]);
      const w = Math.max(W('Choose Option', F12), ...all.map(o => richW(o.segs, F12))) + 8;
      const h = 19 + all.length * 15 + 2;
      const mx = Math.max(0, Math.min(765 - w, Math.round(x - w / 2))), my = Math.max(0, Math.min(503 - h, Math.round(y)));
      menu = { x: mx, y: my, w, h, opts: all, ox: x, oy: y };
      return;
    }
    if (tab === 3 && inR(x, y, PANEL) && !st.iface && !st.spellSel) {
      const s = invSlotAt(x, y);
      if (s >= 0 && st.inv[s]) { drag = { slot: s, x0: x, y0: y, moved: false, opt: opts[0] }; return; }
    }
    if (opts.length) exec(opts[0], x, y);
    else { if (st.selected >= 0) st.selected = -1; if (st.spellSel && !inR(x, y, PANEL)) st.spellSel = null; }
  }
  function onUp(e) {
    const [x, y] = toCanvas(e);
    if (e.button === 1) { midDrag = null; return; }
    mapDrag = null;
    if (drag) {
      const d = drag; drag = null;
      if (d.moved) { const t = invSlotAt(x, y); if (t >= 0 && t !== d.slot) Game.swapInv(d.slot, t); }
      else if (d.opt) exec(d.opt, x, y);
    }
  }
  function onMove(e) {
    const [x, y] = toCanvas(e);
    mouse.x = x; mouse.y = y;
    if (mapDrag) { worldMap.cx = mapDrag.cx - (x - mapDrag.x) / worldMap.zoom; worldMap.cz = mapDrag.cz - (y - mapDrag.y) / worldMap.zoom; return; }
    if (midDrag) { Render.cam.yaw = midDrag.yaw - (x - midDrag.x) * 0.012; Render.cam.pitch = Math.max(0.3, Math.min(1.3, midDrag.pitch + (y - midDrag.y) * 0.01)); }
    if (drag && Math.hypot(x - drag.x0, y - drag.y0) > 5) drag.moved = true;
    if (menu && (x < menu.x - 10 || x > menu.x + menu.w + 10 || y < menu.y - 10 || y > menu.y + menu.h + 10)) menu = null;
  }
  function onWheel(e) {
    e.preventDefault();
    const [x, y] = toCanvas(e);
    const st = S();
    if (worldMap.open) { worldMap.zoom = Math.max(1.5, Math.min(8, worldMap.zoom * (e.deltaY > 0 ? 0.85 : 1.18))); return; }
    if (st.iface && st.iface.type === 'bank' && inR(x, y, WIN)) { bankScroll = Math.max(0, Math.min(Math.max(0, Math.ceil(st.bank.length / 8) - 6), bankScroll + Math.sign(e.deltaY))); return; }
    if (st.iface && st.iface.type === 'guide' && inR(x, y, WIN)) { guideScroll = Math.max(0, guideScroll + Math.sign(e.deltaY)); return; }
    if (Math.hypot(x - MM.cx, y - MM.cy) <= MM.r) { mmZ = Math.max(2, Math.min(8, mmZ + (e.deltaY > 0 ? -0.5 : 0.5))); return; }
    if (inR(x, y, CHAT)) { chatScroll = Math.max(0, Math.min(st.messages.length - 7, chatScroll - Math.sign(e.deltaY))); return; }
    Render.cam.dist = Math.max(4.5, Math.min(16, Render.cam.dist + Math.sign(e.deltaY) * 0.8));
  }
  function onKey(e, down) {
    const st = S();
    if (e.key.startsWith('Arrow')) { Render.cam.keys[e.key] = down; e.preventDefault(); return; }
    if (!down) return;
    if (!st.loggedIn) {
      if (e.key === 'Enter') doLogin();
      else if (e.key === 'Backspace') loginName = loginName.slice(0, -1);
      else if (e.key.length === 1 && /[a-zA-Z0-9 ]/.test(e.key) && loginName.length < 12) loginName += e.key;
      e.preventDefault(); return;
    }
    if (prompt) {
      if (e.key === 'Enter') { const v = prompt.text.toLowerCase(); let n = parseFloat(v); if (/k$/.test(v)) n *= 1000; if (/m$/.test(v)) n *= 1e6; const cb = prompt.cb; prompt = null; if (n > 0) cb(Math.floor(n)); }
      else if (e.key === 'Escape') prompt = null;
      else if (e.key === 'Backspace') prompt.text = prompt.text.slice(0, -1);
      else if (/^[0-9kmKM]$/.test(e.key) && prompt.text.length < 10) prompt.text += e.key;
      e.preventDefault(); return;
    }
    if (e.key === 'Escape') { menu = null; st.selected = -1; st.spellSel = null; st.iface = null; worldMap.open = false; return; }
    const d = st.dialog;
    if (d && !chatInput) {
      if (d.kind === 'options' && /^[1-9]$/.test(e.key)) { const o = d.options[+e.key - 1]; if (o) { st.dialog = null; o.fn(); } return; }
      if (d.kind !== 'options' && e.key === ' ') { continueDialog(); e.preventDefault(); return; }
    }
    const fk = { F1: 3, F2: 1, F3: 4, F4: 5, F5: 6 };
    if (fk[e.key] !== undefined) { tab = fk[e.key]; e.preventDefault(); return; }
    if (e.key === 'Enter') {
      const s = chatInput.trim(); chatInput = '';
      if (s) {
        if (s.startsWith('::')) { command(s.slice(2)); return; }
        st.messages.push({ text: s, from: st.name, t: performance.now() });
        st.player.overhead = { text: s, until: performance.now() + 3000 };
        Game.playerAd(s);
      }
      return;
    }
    if (e.key === 'Backspace') { chatInput = chatInput.slice(0, -1); e.preventDefault(); return; }
    if (e.key.length === 1 && chatInput.length < 80) { chatInput += e.key; e.preventDefault(); }
  }
  function askAmount(label, cb) { prompt = { label, cb, text: '' }; }
  function command(c) {
    const [cmd] = c.split(' ');
    if (cmd === 'pos') Game.msg(`Position: ${S().player.x}, ${S().player.z}`);
    else if (cmd === 'home') Game.homeTeleport();
    else Game.msg('Unknown command.');
  }

  // ---------- login ----------
  const LOGIN_BOX = { x: 202, y: 200, w: 360, h: 200 };
  function savedChars() {
    const out = [];
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('ardenvale_') && k !== 'ardenvale_last') { const d = JSON.parse(localStorage.getItem(k)); out.push({ key: k.slice(10), total: d && d.skills ? Object.values(d.skills).reduce((a, s) => a + levelForXp(s.xp), 0) : 0 }); } } } catch (e) { }
    return out.slice(0, 5);
  }
  function loginClick(x, y) {
    if (inR(x, y, { x: LOGIN_BOX.x + 110, y: LOGIN_BOX.y + 140, w: 140, h: 34 })) return doLogin();
    savedChars().forEach((c, i) => { if (inR(x, y, { x: 222 + i * 66, y: 420, w: 62, h: 34 })) { loginName = c.key; doLogin(c.key); } });
  }
  function doLogin(name) {
    const n = (name || loginName).trim();
    if (!n) return;
    Game.load(n.charAt(0).toUpperCase() + n.slice(1));
    Render.setBrightness(S().settings.brightness);
    Render.cam.pitch = 0.62; Render.cam.dist = 9.5; Render.cam.yaw = 0;
    Sfx.playTrack('Ardenvale');
  }
  function autoLogin(name) { loginName = name; doLogin(name); }
  const flames = [];
  function drawLogin() {
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, 765, 503);
    const t = performance.now() / 1000;
    if (flames.length < 140) for (let i = 0; i < 4; i++) flames.push({ x: (Math.random() < 0.5 ? 150 : 615) + (Math.random() - 0.5) * 50, y: 150, vy: -30 - Math.random() * 40, life: 1 });
    for (let i = flames.length - 1; i >= 0; i--) {
      const f = flames[i]; f.y += f.vy / 60; f.life -= 1 / 50; f.x += Math.sin(t * 5 + i) * 0.4;
      if (f.life <= 0) { flames.splice(i, 1); continue; }
      ctx.fillStyle = `rgba(255,${Math.floor(80 + 160 * f.life)},20,${f.life})`;
      const s = 3 + f.life * 6; ctx.fillRect(f.x - s / 2, f.y - s / 2, s, s);
    }
    ctx.font = 'bold 64px Georgia, "Times New Roman", serif'; ctx.textAlign = 'center';
    ctx.fillStyle = '#000'; ctx.fillText('ARDENVALE', 385, 145);
    const gr = ctx.createLinearGradient(0, 90, 0, 145); gr.addColorStop(0, '#fff2a0'); gr.addColorStop(0.5, '#e0a020'); gr.addColorStop(1, '#8a4a08');
    ctx.fillStyle = gr; ctx.fillText('ARDENVALE', 382, 142);
    ctx.strokeStyle = '#3a1a00'; ctx.lineWidth = 1.5; ctx.strokeText('ARDENVALE', 382, 142);
    ctx.textAlign = 'left';
    T('A world of adventure', 382, 170, '#e0c080', 'italic 15px Georgia, serif', 'center');
    const b = LOGIN_BOX;
    ctx.fillStyle = '#000'; ctx.fillRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4);
    ctx.drawImage(stoneTexture(b.w, b.h, [70, 61, 48], 77), b.x, b.y);
    ctx.strokeStyle = '#a08860'; ctx.strokeRect(b.x + 3.5, b.y + 3.5, b.w - 7, b.h - 7);
    T('Welcome to Ardenvale', b.x + b.w / 2, b.y + 32, C.yellow, F13, 'center');
    T('Your character is saved in this browser. Enter its name.', b.x + b.w / 2, b.y + 54, C.white, F11, 'center');
    T('Username:', b.x + 40, b.y + 95, C.white, F12);
    ctx.fillStyle = '#000'; ctx.fillRect(b.x + 115, b.y + 80, 200, 22);
    ctx.strokeStyle = '#6a604e'; ctx.strokeRect(b.x + 115.5, b.y + 80.5, 199, 21);
    T(loginName + ((Math.floor(t * 2) % 2) ? '*' : ''), b.x + 122, b.y + 96, C.yellow, F12);
    button(b.x + 110, b.y + 140, 140, 34, 'Play', false, F13);
    const chars = savedChars();
    if (chars.length) { T('Saved characters (click to play):', 382, 414, '#e0c080', F11, 'center'); chars.forEach((c, i) => { button(222 + i * 66, 420, 62, 34, '', false); T(c.key.charAt(0).toUpperCase() + c.key.slice(1), 253 + i * 66, 434, C.orange, F11B, 'center'); T('Total ' + c.total, 253 + i * 66, 448, C.yellow, '10px Arial', 'center'); }); }
    T('Arrow keys / middle mouse: camera   Scroll: zoom', 382, 470, '#c0b090', F11, 'center');
  }

  // ---------- per-frame drawing ----------
  function drawHitsplat(x, y, dmg) {
    const red = dmg > 0;
    const pts = [[0, -11], [4, -7], [10, -9], [8, -3], [12, 1], [7, 4], [9, 10], [3, 7], [0, 12], [-3, 7], [-9, 10], [-7, 4], [-12, 1], [-8, -3], [-10, -9], [-4, -7]];
    const blob = (s, col) => { ctx.fillStyle = col; ctx.beginPath(); pts.forEach(([px, py], i) => { const X = x + px * s, Y = y + py * s; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.closePath(); ctx.fill(); };
    blob(1.05, '#000');
    blob(0.92, red ? '#b80c0c' : '#2840c8');
    blob(0.55, red ? '#e02a1a' : '#4a68e8');
    T(String(dmg), x, y + 4, C.white, F12, 'center');
  }
  function drawEntityOverlays(e) {
    if (!e.model.visible || e.headY === undefined) return;
    const nowT = performance.now();
    const top = Render.project(e.rx, e.headY + 0.15, e.rz);
    const mid = Render.project(e.rx, e.headY * 0.55 + World.heightAt(e.rx, e.rz) * 0.45, e.rz);
    if (!top || !mid) return;
    const tx = top[0] + VP.x, ty = top[1] + VP.y, mx = mid[0] + VP.x, my = mid[1] + VP.y;
    if (tx < VP.x - 20 || tx > VP.x + VP.w + 20 || ty < VP.y - 30 || ty > VP.y + VP.h + 30) return;
    if (e.hpBarUntil > nowT) {
      const max = e.isPlayer ? Game.lvl('hitpoints') : e.def.hp, hp = e.isPlayer ? Game.cur('hitpoints') : Math.max(0, e.hp);
      const w = 30, f = Math.round(w * hp / max);
      ctx.fillStyle = '#ff0000'; ctx.fillRect(tx - w / 2, ty - 6, w, 5);
      ctx.fillStyle = '#00ff00'; ctx.fillRect(tx - w / 2, ty - 6, f, 5);
    }
    const offs = [[0, 0], [0, -20], [-16, -10], [16, -10]];
    e.splats = e.splats.filter(s => nowT - s.t < 1200);
    e.splats.slice(-4).forEach((s, i) => {
      if (nowT < s.t) return;
      if (s.splash) { ctx.fillStyle = 'rgba(120,160,255,0.75)'; ctx.beginPath(); ctx.arc(mx, my, 10, 0, 7); ctx.fill(); T('splash', mx, my - 12, '#99ccff', F11, 'center'); }
      else drawHitsplat(mx + offs[i][0], my + offs[i][1], s.dmg);
    });
    if (e.overhead && e.overhead.until > nowT) T(e.overhead.text, tx, ty - 12, C.yellow, F12, 'center');
  }
  function drawViewportOverlays() {
    const st = S();
    ctx.save(); ctx.beginPath(); ctx.rect(VP.x, VP.y, VP.w, VP.h); ctx.clip();
    for (const n of st.npcs) if (n.model.visible) drawEntityOverlays(n);
    for (const b of st.bots) if (b.model.visible) drawEntityOverlays(b);
    if (st.player) drawEntityOverlays(st.player);
    const nowT = performance.now(), p = st.player;
    st.levelFx = st.levelFx.filter(f => nowT - f.t < 2200);
    for (const f of st.levelFx) {
      const pp = Render.project(p.rx, p.headY - 0.6, p.rz); if (!pp) continue;
      const age = (nowT - f.t) / 1000;
      for (let i = 0; i < 24; i++) {
        const a = i / 24 * Math.PI * 2 + age * 2, r = 10 + age * 30 + (i % 3) * 6, s = 3 - age;
        ctx.fillStyle = ['#ffff40', '#ff8020', '#40ff40', '#40c0ff'][i % 4];
        if (s > 0) ctx.fillRect(pp[0] + VP.x + Math.cos(a) * r, pp[1] + VP.y + Math.sin(a) * r * 0.7 - age * 25, s, s);
      }
    }
    crosses = crosses.filter(c => nowT - c.t < 400);
    for (const c of crosses) {
      const s = 6 - Math.floor((nowT - c.t) / 100);
      ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(c.x - s, c.y - s); ctx.lineTo(c.x + s, c.y + s); ctx.moveTo(c.x + s, c.y - s); ctx.lineTo(c.x - s, c.y + s); ctx.stroke();
      ctx.strokeStyle = c.c === 'red' ? '#ff0000' : '#ffff00'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    const wl = Game.wildLevel(p.x, p.z);
    if (wl > 0) {
      const x = VP.x + VP.w - 46, y = VP.y + VP.h - 44;
      ctx.drawImage(Icons.item('ancient_skull'), x + 6, y - 6, 24, 24);
      T(`Level: ${wl}`, x + 18, y + 30, C.yellow, F12, 'center');
    }
    // XP counter + drops
    const totalXp = SKILLS.reduce((a, k) => a + st.skills[k].xp, 0);
    bevel(XPBOX.x, XPBOX.y, XPBOX.w, XPBOX.h, 'rgba(40,34,26,0.85)', '#6a604e', '#1e1a14');
    T('XP: ' + fmt(totalXp), XPBOX.x + XPBOX.w / 2, XPBOX.y + 13, C.white, F11B, 'center');
    st.xpDrops = st.xpDrops.filter(d => nowT - d.t < 1800);
    st.xpDrops.slice(-6).forEach((d, i, arr) => { const age = (nowT - d.t) / 1800, y = XPBOX.y + 40 + (arr.length - 1 - i) * 18 - age * 20; ctx.globalAlpha = 1 - age * 0.6; ctx.drawImage(Icons.skill(d.skill), XPBOX.x + 30, y - 13, 16, 16); T('+' + fmt(d.amt), XPBOX.x + XPBOX.w - 4, y, C.white, F12, 'right'); ctx.globalAlpha = 1; });
    if (st.spellSel) T(`${st.spellSel.name} selected (right-click Cancel)`, VP.x + VP.w - 4, VP.y + 15, C.spell, F11, 'right');
    if (!menu && hoverOpts.length) {
      const segs = hoverOpts[0].segs.slice();
      segs.push([` / ${hoverOpts.length} more option${hoverOpts.length > 1 ? 's' : ''}`, C.white]);
      rich(segs, VP.x + 4, VP.y + 15, F12);
    }
    if (st.iface) drawIface();
    ctx.restore();
  }
  function drawItem(id, qty, x, y, alpha) {
    ctx.globalAlpha = alpha || 1;
    ctx.drawImage(Icons.item(id, qty), x, y);
    ctx.globalAlpha = 1;
    if (ITEMS[id].stackable || qty > 1) { const [s, c] = qtyText(qty); T(s, x, y + 9, c, F11); }
  }
  function drawScroll(title) {
    const r = SCROLL;
    ctx.fillStyle = '#000'; ctx.fillRect(r.x - 2, r.y - 2, r.w + 4, r.h + 4);
    ctx.drawImage(parchCv, 0, 0, 300, 128, r.x, r.y, r.w, r.h);
    ctx.strokeStyle = '#6a4a20'; ctx.lineWidth = 2; ctx.strokeRect(r.x + 4, r.y + 4, r.w - 8, r.h - 8); ctx.lineWidth = 1;
    T(title, r.x + r.w / 2, r.y + 30, C.dred, 'bold 16px Georgia, serif', 'center', false);
    T('Click here to close', r.x + r.w / 2, r.y + r.h - 12, C.blue, F11B, 'center', false);
  }
  function journal(id) {
    const st = S(), q = st.quests[id], qd = QUESTS.find(q => q.id === id);
    if (q === 0) return [['I can start this quest by speaking to', 0], [qd.giver + '.', 0]];
    const L = [], done = q >= 2, has = (i, n) => Game.invCount(i) >= n;
    if (id === 'bridge') L.push(['Elder Brannoc needs materials to rebuild', done], ['the collapsed bridge to the west:', done], [`10 logs (${Math.min(10, Game.invCount('logs'))}/10)`, done || has('logs', 10)], [`3 bronze bars (${Math.min(3, Game.invCount('bronze_bar'))}/3)`, done || has('bronze_bar', 3)]);
    if (id === 'bones') L.push(['Father Aldous asked me to find an', done], ['ancient skull stolen by the skeletons', done], ['of the Wilderness.', done], ['I have found the skull.', done || has('ancient_skull', 1)]);
    if (id === 'forge') L.push(['Hilda needs a bronze platebody', done || has('bronze_platebody', 1)], [`and 2 iron bars (${Math.min(2, Game.invCount('iron_bar'))}/2).`, done || has('iron_bar', 2)]);
    if (id === 'runes') L.push(['Orla gave me a strange talisman to', done], ['take to the Air altar in the', done], ['Runestone Circle north of the village.', done], ['The talisman has been awakened.', done || has('charged_talisman', 1)]);
    if (id === 'catch') L.push(['Captain Rourke wants food for his crew:', done], [`10 shrimps (${Math.min(10, Game.invCount('shrimps'))}/10)`, done || has('shrimps', 10)], [`5 cooked chickens (${Math.min(5, Game.invCount('cooked_chicken'))}/5)`, done || has('cooked_chicken', 5)]);
    if (id === 'cook') L.push(['The Cook needs ingredients for the', done], ["Duke's birthday cake:", done], ['An egg', done || has('egg', 1)], ['A bucket of milk', done || has('bucket_milk', 1)], ['A pot of flour', done || has('pot_flour', 1)]);
    if (done) L.push(['', 0], ['QUEST COMPLETE!', 0]);
    return L;
  }
  function drawIface() {
    const st = S(), f = st.iface;
    if (f.type === 'fairy') {
      winFrame('Fairy Ring');
      for (let i = 0; i < 3; i++) {
        const cx = WIN.x + 70 + i * 90, cy = WIN.y + 120;
        button(cx - 20, WIN.y + 44, 40, 22, '^'); button(cx - 20, WIN.y + 174, 40, 22, 'v');
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx, cy, 40, 0, 7); ctx.fill();
        const gr = ctx.createRadialGradient(cx - 10, cy - 10, 5, cx, cy, 38); gr.addColorStop(0, '#9a9a8a'); gr.addColorStop(1, '#4a4a3a');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(cx, cy, 37, 0, 7); ctx.fill();
        FAIRY_DIALS[i].forEach((ch, j) => { const a = (j - f.dials[i]) * Math.PI / 2 - Math.PI / 2; T(ch, cx + Math.cos(a) * 26, cy + Math.sin(a) * 26 + 5, j === f.dials[i] ? C.yellow : '#c0c0a0', F13, 'center'); });
      }
      const code = f.dials.map((d, i) => FAIRY_DIALS[i][d]).join('');
      T('Code: ' + code, WIN.x + 160, WIN.y + 218, C.yellow, F13, 'center');
      button(WIN.x + 90, WIN.y + 230, 120, 28, 'Teleport', false, F12);
      T('Travel log', WIN.x + 388, WIN.y + 38, C.orange, F12, 'center');
      const log = Object.keys(FAIRY).filter(c => (st.fairyLog || []).includes(c));
      log.forEach((c, i) => { T(c, WIN.x + 304, WIN.y + 58 + i * 18, C.yellow, F11B); T(FAIRY[c].name, WIN.x + 340, WIN.y + 58 + i * 18, C.white, F11); });
      if (!log.length) T('Visit fairy rings to log their codes.', WIN.x + 388, WIN.y + 64, '#c0a070', F11, 'center');
      T('Tip: the code is shown when you look at a ring on the world map.', WIN.x + WIN.w / 2, WIN.y + WIN.h - 10, '#c0a070', F11, 'center');
    } else if (f.type === 'board') {
      winFrame('Trading Board');
      const hubName = b => { let best = '', bd = 1e9; for (const [n, x, z] of World.labels) { const d = Math.hypot(x - b.x, z - b.z); if (d < bd) { bd = d; best = n; } } return best; };
      T('Selling', WIN.x + 120, WIN.y + 40, C.orange, F12, 'center'); T('Buying', WIN.x + 362, WIN.y + 40, C.orange, F12, 'center');
      let si = 0, bi = 0;
      for (const b of st.bots) {
        for (const e of b.sells || []) if (si < 11) { T(`${ITEMS[e.id].name} ${fmt(e.price)}ea`, WIN.x + 14, WIN.y + 58 + si * 14, C.yellow, F11); T(`${b.name} - ${hubName(b)}`, WIN.x + 236, WIN.y + 58 + si++ * 14, '#c0b090', F11, 'right'); }
        for (const e of b.buys || []) if (bi < 11) { T(`${ITEMS[e.id].name} ${fmt(e.price)}ea`, WIN.x + 254, WIN.y + 58 + bi * 14, C.green, F11); T(`${b.name} - ${hubName(b)}`, WIN.x + 476, WIN.y + 58 + bi++ * 14, '#c0b090', F11, 'right'); }
      }
      ctx.fillStyle = '#5a4e3c'; ctx.fillRect(WIN.x + 8, WIN.y + 216, WIN.w - 16, 1);
      T('Your recent trades:', WIN.x + 14, WIN.y + 232, C.orange, F11B);
      (st.tradeLog || []).slice(0, 4).forEach((t, i) => T(`${t.who}: gave ${t.gave} - got ${t.got}`.slice(0, 80), WIN.x + 14, WIN.y + 248 + i * 13, t.profit >= 0 ? C.white : '#ffb0a0', F11));
      if (!(st.tradeLog || []).length) T('Tip: say "selling logs 20ea" or "buying lobster 150ea" in chat - nearby players will reply!', WIN.x + 14, WIN.y + 250, '#c0a070', F11);
    } else if (f.type === 'tasks') {
      winFrame('Beginner Tasks');
      const done = st.tasksDone || {}, prog = st.taskProg || {};
      TASKS.forEach((t, i) => {
        const x = WIN.x + 14 + Math.floor(i / 12) * 236, y = WIN.y + 44 + (i % 12) * 20, d = done[t.id];
        T((d ? '\u2713 ' : '') + t.text, x, y, d ? C.green : C.white, F11);
        T(d ? 'Done' : `${Math.min(prog[t.ev] || 0, t.n)}/${t.n}`, x + 226, y, d ? C.green : C.yellow, F11, 'right');
      });
      T(`Completed ${Object.keys(done).length} / ${TASKS.length}. Rewards: coins and XP lamps.`, WIN.x + WIN.w / 2, WIN.y + WIN.h - 10, '#c0a070', F11, 'center');
    } else if (f.type === 'lamp') {
      winFrame('Choose a skill to gain experience in');
      SKILLS.forEach((k, i) => { const [cx, cy] = gridCell(i, 7, WIN.x + 30, WIN.y + 50, 64, 56); bevel(cx, cy, 56, 48, '#3a3226', '#5a4e3c', '#1e1a14'); ctx.drawImage(Icons.skill(k), cx + 18, cy + 6); T(SKILL_NAMES[k], cx + 28, cy + 42, C.orange, '10px Arial', 'center'); });
    } else if (f.type === 'xptracker') {
      winFrame('Experience Tracker');
      const hrs = Math.max(1 / 3600, (performance.now() - st.sessionStart) / 3600000);
      const rows = Object.entries(st.xpSession).sort((a, b) => b[1] - a[1]);
      T('Skill', WIN.x + 50, WIN.y + 42, C.orange, F11B); T('Gained', WIN.x + 200, WIN.y + 42, C.orange, F11B, 'right'); T('XP / hour', WIN.x + 300, WIN.y + 42, C.orange, F11B, 'right'); T('To next level', WIN.x + 440, WIN.y + 42, C.orange, F11B, 'right');
      rows.slice(0, 12).forEach(([k, v], i) => { const y = WIN.y + 62 + i * 18, L = Game.lvl(k); ctx.drawImage(Icons.skill(k), WIN.x + 22, y - 13, 16, 16); T(SKILL_NAMES[k], WIN.x + 50, y, C.white, F11); T(fmt(v), WIN.x + 200, y, C.yellow, F11, 'right'); T(fmt(v / hrs), WIN.x + 300, y, C.green, F11, 'right'); T(L < 99 ? fmt(XP_TABLE[L + 1] - st.skills[k].xp) : 'Max', WIN.x + 440, y, C.white, F11, 'right'); });
      if (!rows.length) T('Gain some experience and it will be tracked here.', WIN.x + WIN.w / 2, WIN.y + 120, '#c0a070', F12, 'center');
      T(`Session: ${Math.floor(hrs * 60)} min - XP rate ${st.settings.xpRate}x (change in Game Options)`, WIN.x + WIN.w / 2, WIN.y + WIN.h - 10, '#c0a070', F11, 'center');
    } else if (f.type === 'trade') {
      const b = f.bot;
      winFrame('Trading With: ' + b.name);
      if (f.stage === 1) {
        T('Your Offer', WIN.x + 120, WIN.y + 40, C.orange, F12, 'center');
        T('For sale (right-click to request):', WIN.x + 258, WIN.y + 144, C.orange, F11B);
        (b.sells || []).forEach((e, i) => { const ry = WIN.y + 154 + i * 20; ctx.drawImage(Icons.item(e.id, 100), WIN.x + 258, ry - 1, 18, 18); T(`${ITEMS[e.id].name}`, WIN.x + 280, ry + 12, C.white, F11); T(`${fmt(Math.round((e.dealPrice || e.price) * f.disc))}ea (${fmt(e.stock)})`, WIN.x + 470, ry + 12, C.yellow, F11, 'right'); if (f.req[e.id]) T('x' + fmt(f.req[e.id]), WIN.x + 405, ry + 12, C.green, F11B, 'right'); });
        if (!(b.sells || []).length) T('Nothing for sale.', WIN.x + 270, WIN.y + 160, '#c0a070', F11);
        const by = WIN.y + 164 + Math.max(1, (b.sells || []).length) * 20;
        if ((b.buys || []).length) { T('Buying:', WIN.x + 258, by, C.orange, F11B); b.buys.forEach((e, i) => T(`${ITEMS[e.id].name} - ${fmt(Math.round((e.dealPrice || e.price) / f.disc))}ea`, WIN.x + 300, by + i * 14, C.white, F11)); }
        if (f.owe > 0) T(`They want ${fmt(f.owe)} coins (${fmt(f.coinsIn)} offered)`, WIN.x + 120, WIN.y + WIN.h - 60, f.coinsIn >= f.owe ? C.green : C.yellow, F11B, 'center');
        T(b.name + '\'s Offer', WIN.x + 362, WIN.y + 40, C.orange, F12, 'center');
        ctx.fillStyle = '#5a4e3c'; ctx.fillRect(WIN.x + WIN.w / 2 - 1, WIN.y + 28, 2, WIN.h - 70);
        f.my.forEach((it, i) => { const [cx, cy] = gridCell(i, 5, WIN.x + 16, WIN.y + 46, 42, 36); drawItem(it.id, it.qty, cx + 2, cy); });
        f.their.slice(0, 10).forEach((it, i) => { const [cx, cy] = gridCell(i, 5, WIN.x + 258, WIN.y + 46, 42, 36); drawItem(it.id, it.qty, cx + 2, cy); });
        T('Value: ' + fmt(Game.tradeVal(f.my)) + ' coins', WIN.x + 120, WIN.y + WIN.h - 46, '#c0a070', F11, 'center');
        T('Value: ' + fmt(Game.tradeVal(f.their)) + ' coins', WIN.x + 362, WIN.y + 124, '#c0a070', F11, 'center');
      } else {
        T('Are you sure you want to make this trade?', WIN.x + WIN.w / 2, WIN.y + 44, C.white, F12, 'center');
        T('You are about to give:', WIN.x + 120, WIN.y + 70, C.yellow, F12, 'center');
        T('In return you will receive:', WIN.x + 362, WIN.y + 70, C.yellow, F12, 'center');
        const list = (arr, x) => { const grouped = {}; arr.forEach(i => grouped[i.id] = (grouped[i.id] || 0) + i.qty); Object.entries(grouped).slice(0, 10).forEach(([id, q], i) => T(`${ITEMS[id].name}${q > 1 ? ' x ' + fmt(q) : ''}`, x, WIN.y + 92 + i * 15, C.white, F11, 'center')); if (!arr.length) T('Absolutely nothing!', x, WIN.y + 92, C.white, F11, 'center'); };
        list(f.my, WIN.x + 120); list(f.their, WIN.x + 362);
      }
      const status = f.themAcc ? 'Other player has accepted.' : f.meAcc ? 'Waiting for other player...' : '';
      T(status, WIN.x + WIN.w / 2, WIN.y + WIN.h - 40, f.themAcc ? C.green : C.white, F11B, 'center');
      ctx.fillStyle = '#5a4e3c'; ctx.fillRect(WIN.x + 246, WIN.y + 131, 232, 1);
      button(WIN.x + 90, WIN.y + WIN.h - 34, 96, 24, 'Accept', f.meAcc); button(WIN.x + 194, WIN.y + WIN.h - 34, 96, 24, 'Decline'); if (f.stage === 1) button(WIN.x + 298, WIN.y + WIN.h - 34, 96, 24, `Haggle (${3 - f.haggles})`);
    } else if (f.type === 'bank') {
      winFrame('The Bank of Ardenvale');
      for (let i = 0; i < 48; i++) { const b = st.bank[i + bankScroll * 8]; if (!b) break; const [cx, cy] = gridCell(i, 8, WIN.x + 22, WIN.y + 32, 56, 40); drawItem(b.id, b.qty, cx + 4, cy + 1); }
      T(`${st.bank.length} / 400`, WIN.x + 14, WIN.y + WIN.h - 14, C.orange, F11);
      if (st.bank.length > 48) T('(scroll)', WIN.x + 80, WIN.y + WIN.h - 14, '#c0a070', F11);
      button(WIN.x + 180, WIN.y + WIN.h - 30, 140, 22, 'Deposit worn items'); button(WIN.x + 330, WIN.y + WIN.h - 30, 140, 22, 'Deposit inventory');
    } else if (f.type === 'shop') {
      winFrame(SHOPS[f.shop].name);
      st.shops[f.shop].forEach((s, i) => { const [cx, cy] = gridCell(i, 8, WIN.x + 22, WIN.y + 32, 56, 44); drawItem(s.id, s.qty, cx + 4, cy + 1); });
      T('Right-click on items to buy or sell them.', WIN.x + WIN.w / 2, WIN.y + WIN.h - 14, '#c0a070', F11, 'center');
    } else if (f.type === 'smith') {
      winFrame('What would you like to make?');
      Game.METALS.forEach((m, i) => button(WIN.x + 12 + i * 77, WIN.y + 30, 73, 20, m.charAt(0).toUpperCase() + m.slice(1), f.metal === m));
      smithRecipes(f.metal).forEach((r, i) => {
        const [cx, cy] = gridCell(i, 4, WIN.x + 14, WIN.y + 58, 116, 116);
        ctx.fillStyle = '#3a3226'; ctx.fillRect(cx, cy, 110, 110); ctx.strokeStyle = '#5a4e3c'; ctx.strokeRect(cx + 0.5, cy + 0.5, 109, 109);
        drawItem(r.out, r.qty, cx + 39, cy + 8);
        const ok = Game.lvl('smithing') >= r.level, bars = Game.invCount(r.bar) >= r.bars;
        T(ITEMS[r.out].name.replace(/^\w+ /, ''), cx + 55, cy + 58, ok ? C.white : '#000', F11B, 'center', ok);
        T(`${r.bars} bar${r.bars > 1 ? 's' : ''}`, cx + 55, cy + 76, bars ? C.green : C.orange, F11, 'center');
        T(`Level ${r.level}`, cx + 55, cy + 94, ok ? '#c0a070' : '#ff4040', F11, 'center');
      });
    } else if (f.type === 'guide') {
      const k = f.skill, E = guide(k), L = Game.lvl(k);
      winFrame(SKILL_NAMES[k] + ' - Skill Guide');
      ctx.drawImage(Icons.skill(k), WIN.x + 14, WIN.y + 2, 20, 20);
      const per = 9; guideScroll = Math.min(guideScroll, Math.max(0, E.length - per));
      E.slice(guideScroll, guideScroll + per).forEach((e, i) => {
        const y = WIN.y + 28 + i * 30;
        ctx.fillStyle = i % 2 ? '#2e271e' : '#352d22'; ctx.fillRect(WIN.x + 8, y, WIN.w - 16, 30);
        T(String(e.level), WIN.x + 34, y + 20, L >= e.level ? C.green : C.red, F13, 'center');
        if (e.icon && ITEMS[e.icon]) ctx.drawImage(Icons.item(e.icon, 100), WIN.x + 58, y - 1, 32, 32);
        T(e.text, WIN.x + 100, y + 20, L >= e.level ? C.white : '#b0a080', F12);
      });
      if (E.length > per) T(`Scroll for more (${guideScroll + 1}-${Math.min(E.length, guideScroll + per)} of ${E.length})`, WIN.x + WIN.w / 2, WIN.y + WIN.h - 6, '#c0a070', F11, 'center');
    } else if (f.type === 'equipstats') {
      winFrame('Equipment Stats');
      const b = Game.bonuses();
      [['Melee attack', b.att], ['Melee strength', b.str], ['Defence', b.def], ['Ranged attack', b.rng], ['Ranged strength', b.rstr], ['Magic attack', b.mag]]
        .forEach(([n, v], i) => { T(n + ':', WIN.x + 40, WIN.y + 60 + i * 24, C.orange, F12); T((v >= 0 ? '+' : '') + v, WIN.x + 220, WIN.y + 60 + i * 24, v >= 0 ? C.yellow : C.red, F12); });
      EQUIP_SLOTS.forEach((k, i) => { const id = st.equip[k]; if (id) drawItem(id, k === 'ammo' ? st.ammoQty : 1, WIN.x + 290 + (i % 4) * 44, WIN.y + 50 + Math.floor(i / 4) * 44); });
    } else if (f.type === 'questdone') {
      drawScroll('Congratulations!');
      const r = SCROLL;
      T(`You have completed ${f.quest}!`, r.x + r.w / 2, r.y + 52, '#000', F12, 'center', false);
      T('You are awarded:', r.x + r.w / 2, r.y + 80, C.dred, F12, 'center', false);
      f.rewards.forEach((s, i) => T(s, r.x + r.w / 2, r.y + 100 + i * 16, '#000', F11, 'center', false));
      T(`Quest Points: ${st.questPoints}`, r.x + 20, r.y + r.h - 34, '#000', F11B, 'left', false);
    } else if (f.type === 'journal') {
      const q = QUESTS.find(q => q.id === f.quest);
      drawScroll(q.name);
      journal(f.quest).forEach(([s, done], i) => {
        const y = SCROLL.y + 64 + i * 18;
        T(s, SCROLL.x + SCROLL.w / 2, y, s === 'QUEST COMPLETE!' ? C.dred : done ? '#000' : '#000080', F11B, 'center', false);
        if (done && s) { const w = W(s, F11B); ctx.fillStyle = '#000'; ctx.fillRect(SCROLL.x + SCROLL.w / 2 - w / 2, y - 4, w, 1); }
      });
    }
  }

  function drawMinimap() {
    const st = S(), p = st.player;
    if (!mmCv || mmBridge !== World.bridgeOpen) buildMinimap();
    const a = Render.cam.yaw;
    ctx.save();
    ctx.beginPath(); ctx.arc(MM.cx, MM.cy, MM.r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#000'; ctx.fillRect(MM.cx - MM.r, MM.cy - MM.r, MM.r * 2, MM.r * 2);
    ctx.translate(MM.cx, MM.cy); ctx.rotate(a); ctx.scale(mmZ / 4, mmZ / 4);
    ctx.drawImage(mmCv, -p.rx * 4, -p.rz * 4);
    if (st.flag) { const fx = (st.flag[0] + 0.5 - p.rx) * 4, fz = (st.flag[1] + 0.5 - p.rz) * 4; ctx.save(); ctx.translate(fx, fz); ctx.rotate(-a); const k = 4 / mmZ; ctx.scale(k, k); ctx.fillStyle = '#000'; ctx.fillRect(-1, -12, 2, 13); ctx.fillStyle = '#ff2020'; ctx.beginPath(); ctx.moveTo(1, -12); ctx.lineTo(9, -9); ctx.lineTo(1, -6); ctx.fill(); ctx.restore(); }
    if (st.flag && p.path.length) { ctx.fillStyle = 'rgba(255,255,255,0.75)'; for (let i = 0; i < p.path.length; i += 2) { const [tx, tz] = p.path[i]; ctx.fillRect((tx + 0.5 - p.rx) * 4 - 0.75, (tz + 0.5 - p.rz) * 4 - 0.75, 1.5, 1.5); } }
    for (const g of st.ground) { if (Math.abs(g.x - p.x) > 22 || Math.abs(g.z - p.z) > 22) continue; ctx.fillStyle = '#000'; ctx.fillRect((g.x + 0.5 - p.rx) * 4 - 1.5, (g.z + 0.5 - p.rz) * 4 - 1.5, 4, 4); ctx.fillStyle = '#ff0000'; ctx.fillRect((g.x + 0.5 - p.rx) * 4 - 1, (g.z + 0.5 - p.rz) * 4 - 1, 3, 3); }
    for (const b of st.bots) { if (Math.abs(b.x - p.x) > 22 || Math.abs(b.z - p.z) > 22) continue; const x = ((b.rx ?? b.x + 0.5) - p.rx) * 4, z = ((b.rz ?? b.z + 0.5) - p.rz) * 4; ctx.fillStyle = '#000'; ctx.fillRect(x - 1.5, z - 1.5, 4, 4); ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 1, z - 1, 3, 3); }
    for (const n of st.npcs) { if (n.dead || Math.abs(n.x - p.x) > 22 || Math.abs(n.z - p.z) > 22) continue; const x = ((n.rx ?? n.x + 0.5) - p.rx) * 4, z = ((n.rz ?? n.z + 0.5) - p.rz) * 4; ctx.fillStyle = '#000'; ctx.fillRect(x - 1.5, z - 1.5, 4, 4); ctx.fillStyle = '#ffff00'; ctx.fillRect(x - 1, z - 1, 3, 3); }
    { const f = p.face || 0, s = 4 / mmZ, ux = Math.sin(f), uz = Math.cos(f); ctx.save(); ctx.scale(s, s); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(ux * 6, uz * 6); ctx.lineTo(-ux * 3 + uz * 4, -uz * 3 - ux * 4); ctx.lineTo(-ux * 3 - uz * 4, -uz * 3 + ux * 4); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(ux * 4.5, uz * 4.5); ctx.lineTo(-ux * 2 + uz * 2.8, -uz * 2 - ux * 2.8); ctx.lineTo(-ux * 2 - uz * 2.8, -uz * 2 + ux * 2.8); ctx.closePath(); ctx.fill(); ctx.restore(); }
    ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.arc(MM.cx, MM.cy, MM.r, 0, Math.PI * 2); ctx.clip();
    const cs = Math.cos(a), sn = Math.sin(a);
    for (const ic of World.mapIcons) { const dx = (ic.x - p.rx) * mmZ, dz = (ic.z - p.rz) * mmZ; if (Math.hypot(dx, dz) > MM.r + 6) continue; mapIcon(ic.icon, MM.cx + dx * cs - dz * sn, MM.cy + dx * sn + dz * cs); }
    ctx.restore();
    ctx.strokeStyle = '#3a3226'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(MM.cx, MM.cy, MM.r + 0.5, 0, 7); ctx.stroke(); ctx.lineWidth = 1;
    if (mmZ !== 4) T('x' + (mmZ / 4).toFixed(1).replace('.0', ''), MM.cx + MM.r - 18, MM.cy + MM.r - 4, '#ffff00', F11);
    ctx.save(); ctx.beginPath(); ctx.arc(COMPASS.cx, COMPASS.cy, COMPASS.r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#5a5040'; ctx.fillRect(COMPASS.cx - 20, COMPASS.cy - 20, 40, 40);
    ctx.fillStyle = '#7a6e58'; ctx.beginPath(); ctx.arc(COMPASS.cx, COMPASS.cy, COMPASS.r - 3, 0, Math.PI * 2); ctx.fill();
    ctx.translate(COMPASS.cx, COMPASS.cy); ctx.rotate(a);
    ctx.fillStyle = '#c02020'; ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(4, 0); ctx.lineTo(-4, 0); ctx.fill();
    ctx.fillStyle = '#e8e8e8'; ctx.beginPath(); ctx.moveTo(0, 13); ctx.lineTo(4, 0); ctx.lineTo(-4, 0); ctx.fill();
    ctx.restore();
    { const nx = COMPASS.cx + Math.sin(a) * (COMPASS.r - 5), ny = COMPASS.cy - Math.cos(a) * (COMPASS.r - 5); T('N', nx, ny + 4, '#ffff00', 'bold 10px Arial', 'center'); }
    // orbs
    const orb = (o, frac, col, txt, glyph) => {
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(o.cx, o.cy, 12, 0, 7); ctx.fill();
      ctx.fillStyle = '#2a241b'; ctx.beginPath(); ctx.arc(o.cx, o.cy, 11, 0, 7); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(o.cx, o.cy, 11, 0, 7); ctx.clip(); ctx.fillStyle = col; ctx.fillRect(o.cx - 11, o.cy + 11 - 22 * Math.max(0, Math.min(1, frac)), 22, 22); ctx.restore();
      ctx.strokeStyle = '#8a7a5a'; ctx.beginPath(); ctx.arc(o.cx, o.cy, 11.5, 0, 7); ctx.stroke();
      T(txt, o.cx, o.cy + 4, frac < 0.3 ? C.red : C.white, 'bold 10px Arial', 'center');
    };
    orb(ORB.hp, Game.cur('hitpoints') / Game.lvl('hitpoints'), '#a01818', String(Game.cur('hitpoints')));
    orb(ORB.pr, Game.cur('prayer') / Game.lvl('prayer'), '#1a8a9a', String(Math.ceil(Game.cur('prayer'))));
    orb(ORB.run, p.energy / 100, p.run ? '#c0a020' : '#6a6050', String(Math.floor(p.energy)));
    const g = MAPBTN;
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(g.cx, g.cy, g.r + 1, 0, 7); ctx.fill();
    ctx.fillStyle = '#2a5aa0'; ctx.beginPath(); ctx.arc(g.cx, g.cy, g.r - 1, 0, 7); ctx.fill();
    ctx.fillStyle = '#4a9a3a'; ctx.beginPath(); ctx.ellipse(g.cx - 3, g.cy - 3, 5, 4, 0.5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(g.cx + 4, g.cy + 4, 4, 3, -0.3, 0, 7); ctx.fill();
    ctx.strokeStyle = '#c8b070'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(g.cx, g.cy, g.r, 0, 7); ctx.stroke(); ctx.lineWidth = 1;
  }

  function drawPanel() {
    const st = S(), px = PANEL.x, py = PANEL.y;
    ctx.save(); ctx.beginPath(); ctx.rect(PANEL.x, PANEL.y, PANEL.w, PANEL.h); ctx.clip();
    if (tab === 3) {
      for (let i = 0; i < 28; i++) {
        const it = st.inv[i]; if (!it) continue;
        if (drag && drag.moved && drag.slot === i) continue;
        const [x, y] = invSlotPos(i);
        drawItem(it.id, it.qty, x, y);
        if (st.selected === i) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, 31, 31); }
      }
    } else if (tab === 1) {
      SKILLS.forEach((k, i) => {
        const x = px + 3 + (i % 3) * 62, y = py + 4 + Math.floor(i / 3) * 31;
        bevel(x, y, 60, 29, '#3a3226', '#5a4e3c', '#1e1a14');
        ctx.drawImage(Icons.skill(k), x + 4, y + 4);
        const c = Math.floor(Game.cur(k)), L = Game.lvl(k);
        T(String(c), x + 38, y + 13, C.yellow, F11B, 'center');
        T(String(L), x + 50, y + 25, C.yellow, F11B, 'center');
        ctx.save(); ctx.translate(x + 44, y + 17); ctx.rotate(-0.9); ctx.fillStyle = '#000'; ctx.fillRect(-5, 0, 10, 2); ctx.fillStyle = C.yellow; ctx.fillRect(-5, -1, 10, 1); ctx.restore();
      });
      const y = py + 4 + 7 * 31;
      bevel(px + 3 + 62, y, 122, 29, '#3a3226', '#5a4e3c', '#1e1a14');
      T('Total level:', px + 126, y + 13, C.yellow, F11B, 'center');
      T(String(Game.totalLevel()), px + 126, y + 26, C.yellow, F11B, 'center');
    } else if (tab === 0) {
      const w = st.equip.weapon;
      T(w ? ITEMS[w].name : 'Unarmed', px + 95, py + 20, C.orange, F13, 'center');
      T(`Combat Lvl: ${Game.combatLevel()}`, px + 95, py + 38, C.orange, F12, 'center');
      const names = Game.styleNames(), kind = Game.weaponKind();
      const xpTo = kind === 'bow' ? ['(Ranged XP)', '(Ranged XP)', '(Ranged+Def)'] : ['(Attack XP)', '(Strength XP)', '(Defence XP)'];
      for (let i = 0; i < 3; i++) {
        const bx = px + 10 + (i % 2) * 88, by = py + 52 + Math.floor(i / 2) * 50, on = st.style === i && !st.autocast;
        bevel(bx, by, 82, 42, on ? '#6e2a1e' : '#4a4134', on ? '#a0503a' : '#6a604e', '#1e1a14');
        T(names[i], bx + 41, by + 18, on ? C.white : C.orange, F12, 'center');
        T(xpTo[i], bx + 41, by + 33, '#c0a070', F11, 'center');
      }
      if (kind === 'staff') {
        const bx = px + 98, by = py + 102, on = !!st.autocast;
        bevel(bx, by, 82, 42, on ? '#6e2a1e' : '#4a4134', on ? '#a0503a' : '#6a604e', '#1e1a14');
        T('Autocast', bx + 41, by + 18, on ? C.white : C.orange, F12, 'center');
        T(st.autocast ? SPELLS.find(s => s.id === st.autocast).name : '(click)', bx + 41, by + 33, '#c0a070', F11, 'center');
      }
      button(px + 30, py + 200, 130, 30, 'Auto Retaliate: ' + (st.autoRetaliate ? 'On' : 'Off'), st.autoRetaliate);
    } else if (tab === 4) {
      ctx.fillStyle = '#2a241b';
      ctx.fillRect(px + 94, py + 42, 2, 124); ctx.fillRect(px + 38, py + 102, 114, 2);
      const ghosts = { head: 'bronze_full_helm', neck: 'gold_amulet', weapon: 'bronze_sword', body: 'bronze_platebody', shield: 'bronze_kiteshield', legs: 'bronze_platelegs', ammo: 'bronze_arrow', hands: 'leather_gloves', feet: 'leather_boots', ring: 'gold_ring' };
      for (const k in EQ_POS) {
        const [ex, ey] = EQ_POS[k];
        bevel(px + ex, py + ey, 36, 36, '#2e271e', '#1a160f', '#5a4e3c');
        if (st.equip[k]) drawItem(st.equip[k], k === 'ammo' ? st.ammoQty : 1, px + ex + 2, py + ey + 2);
        else if (ghosts[k]) { ctx.globalAlpha = 0.16; ctx.drawImage(Icons.item(ghosts[k]), px + ex + 2, py + ey + 2); ctx.globalAlpha = 1; }
      }
      button(px + 40, py + 236, 110, 20, 'Equipment Stats');
    } else if (tab === 5) {
      PRAYERS.forEach((p, i) => {
        const x = px + 6 + (i % 5) * 36, y = py + 8 + Math.floor(i / 5) * 36;
        const un = Game.lvl('prayer') >= p.level;
        if (st.prayers[p.id]) { ctx.fillStyle = 'rgba(220,190,90,0.35)'; ctx.beginPath(); ctx.arc(x + 16, y + 16, 16, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#e8d070'; ctx.beginPath(); ctx.arc(x + 16, y + 16, 15, 0, Math.PI * 2); ctx.stroke(); }
        ctx.drawImage(Icons.prayer(p, !!st.prayers[p.id], un), x + 4, y + 4);
      });
      T(`Prayer points: ${Math.ceil(Game.cur('prayer'))} / ${Game.lvl('prayer')}`, px + 95, py + 248, C.orange, F12, 'center');
    } else if (tab === 6) {
      SPELLS.forEach((sp, i) => {
        const x = px + 8 + (i % SPELL_COLS) * 44, y = py + 8 + Math.floor(i / SPELL_COLS) * 40;
        const ok = Game.lvl('magic') >= sp.level, canC = ok && Game.canCast(sp, false);
        ctx.globalAlpha = ok ? 1 : 0.3;
        if (st.spellSel === sp) { ctx.strokeStyle = '#ffffff'; ctx.strokeRect(x - 1.5, y - 1.5, 33, 33); }
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(x + 15, y + 15, 14, 0, Math.PI * 2); ctx.fill();
        const gr = ctx.createRadialGradient(x + 11, y + 11, 2, x + 15, y + 15, 13); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, sp.col);
        ctx.fillStyle = canC || sp.level === 0 ? gr : '#505050'; ctx.beginPath(); ctx.arc(x + 15, y + 15, 12, 0, Math.PI * 2); ctx.fill();
        T(sp.glyph, x + 15, y + 20, '#000', F12, 'center', false);
        ctx.globalAlpha = 1;
      });
      T(`Magic Lvl: ${Game.lvl('magic')}`, px + 95, py + 248, C.orange, F12, 'center');
    } else if (tab === 2) {
      T('Quest Points: ' + st.questPoints, px + 95, py + 16, C.orange, F13, 'center');
      QUESTS.forEach((q, i) => { const s = st.quests[q.id]; T(q.name, px + 10, py + 44 + i * 16, s === 0 ? '#ff0000' : s === 1 ? '#ffff00' : '#00ff00', F12); });
      button(px + 20, py + 176, 150, 22, `Beginner Tasks (${Object.keys(st.tasksDone || {}).length}/${TASKS.length})`);
      if (st.slayer && st.slayer.left > 0) { T('Slayer task:', px + 95, py + 214, C.orange, F12, 'center'); T(`${st.slayer.left} x ${NPCS[st.slayer.npc].name}`, px + 95, py + 230, C.yellow, F12, 'center'); }
    } else if (tab === 8 || tab === 9) {
      T(tab === 8 ? 'Friends List' : 'Ignore List', px + 95, py + 18, C.orange, F13, 'center');
      T(tab === 8 ? 'You have no friends.' : 'Your ignore list is empty.', px + 95, py + 110, C.white, F11, 'center');
      button(px + 8, py + 228, 82, 26, tab === 8 ? 'Add Friend' : 'Add Name'); button(px + 100, py + 228, 82, 26, tab === 8 ? 'Del Friend' : 'Del Name');
    } else if (tab === 10) {
      T('When you have finished playing', px + 95, py + 40, C.orange, F12, 'center');
      T(WORLD_NAME + ', always use the', px + 95, py + 56, C.orange, F12, 'center');
      T('button below to logout safely.', px + 95, py + 72, C.orange, F12, 'center');
      button(px + 30, py + 120, 130, 30, 'Click here to logout', false, F12);
      T('(Progress also saves automatically.)', px + 95, py + 180, '#c0a070', F11, 'center');
    } else if (tab === 11) {
      T('Screen Brightness', px + 95, py + 30, C.orange, F12, 'center');
      ['Dark', 'Normal', 'Bright', 'V.Bright'].forEach((s, b) => button(px + 12 + b * 42, py + 40, 36, 24, s.slice(0, 4), st.settings.brightness === b, '9px Arial'));
      button(px + 12, py + 100, 166, 24, 'Sound effects: ' + (Sfx.enabled ? 'On' : 'Off'), Sfx.enabled);
      button(px + 12, py + 134, 166, 24, 'Music: ' + (Sfx.musicOn ? 'On' : 'Off'), Sfx.musicOn);
      T('Experience rate', px + 95, py + 182, C.orange, F12, 'center');
      [1, 2, 5, 10].forEach((r, i) => button(px + 12 + i * 42, py + 190, 36, 24, r + 'x', st.settings.xpRate === r));
    } else if (tab === 12) {
      T('Move speed:', px + 95, py + 20, C.orange, F12, 'center');
      button(px + 14, py + 30, 78, 26, 'Walk', !st.player.run); button(px + 98, py + 30, 78, 26, 'Run', st.player.run);
      T(`Run energy: ${Math.floor(st.player.energy)}%`, px + 95, py + 78, C.orange, F12, 'center');
      T('Emotes', px + 95, py + 98, C.orange, F12, 'center');
      ['Yes', 'No', 'Bow', 'Wave', 'Cheer', 'Dance', 'Think'].forEach((s, i) => button(px + 14 + (i % 2) * 84, py + 106 + Math.floor(i / 2) * 32, 78, 26, s));
    } else if (tab === 13) {
      T('Music Player', px + 95, py + 20, C.orange, F13, 'center');
      Sfx.TRACKS.forEach((n, i) => T(n, px + 95, py + 54 + i * 18, Sfx.current === n && Sfx.musicOn ? C.green : '#ff0000', F12, 'center'));
      T('Now playing:', px + 95, py + 220, C.orange, F11, 'center');
      T(Sfx.musicOn ? (Sfx.current || '-') : '(music off)', px + 95, py + 236, C.yellow, F12, 'center');
    }
    ctx.restore();
  }

  function drawChat() {
    const st = S(), d = st.dialog;
    const x0 = CHAT.x, y0 = CHAT.y;
    ctx.save(); ctx.beginPath(); ctx.rect(CHAT.x, CHAT.y, CHAT.w, CHAT.h); ctx.clip();
    if (d) {
      const cx = x0 + CHAT.w / 2;
      if (d.kind === 'options') {
        T(d.title || 'Select an Option', cx, y0 + 18, C.dred, F12, 'center', false);
        const n = d.options.length, step = Math.min(16, 84 / n);
        d.options.forEach((o, i) => { const oy = y0 + 36 + i * step; const hov = mouse.y >= oy - 12 && mouse.y < oy - 12 + step && inR(mouse.x, mouse.y, CHAT); T(o.text, cx, oy, hov ? C.white : '#000', F12, 'center', hov); });
      } else if (d.kind === 'levelup') {
        ctx.drawImage(Icons.skill(d.skill), x0 + 40, y0 + 30, 40, 40);
        T(d.lines[0], cx + 20, y0 + 36, '#000080', F12, 'center', false);
        T(d.lines[1], cx + 20, y0 + 58, '#000', F12, 'center', false);
        T('Click here to continue', cx + 20, y0 + 104, C.blue, F12, 'center', false);
      } else {
        if (d.name) T(d.name, cx, y0 + 20, C.dred, F12, 'center', false);
        const start = y0 + 50 - (d.lines.length - 1) * 8;
        d.lines.forEach((l, i) => T(l, cx, start + i * 16, '#000', F12, 'center', false));
        T('Click here to continue', cx, y0 + 104, C.blue, F12, 'center', false);
      }
    } else {
      let y = y0 + 104;
      for (let i = st.messages.length - 1 - chatScroll; i >= 0 && y > y0; i--) {
        const m = st.messages[i];
        if (m.from) rich([[m.from + ': ', '#000'], [m.text, C.blue]], x0 + 6, y, F12, false);
        else T(m.text + (m.tradeReq ? '  (click to trade)' : ''), x0 + 6, y, m.color, F12, 'left', false);
        y -= 14;
      }
    }
    const blink = Math.floor(performance.now() / 500) % 2 ? '*' : '';
    if (prompt) rich([[prompt.label + ' ', '#000'], [prompt.text + blink, C.blue]], x0 + 6, y0 + 124, F12, false);
    else rich([[st.name + ': ', '#000'], [chatInput + blink, C.blue]], x0 + 6, y0 + 124, F12, false);
    ctx.restore();
    [['Public chat', 'On'], ['Private chat', 'On'], ['Trade/compete', 'On'], ['Report abuse', '']].forEach(([l, s], i) => {
      const bx = 5 + i * 128, by = 481;
      bevel(bx, by, 122, 21, '#4a4134', '#6a604e', '#1e1a14');
      T(l, bx + 61, by + (s ? 10 : 14), C.white, F11B, 'center');
      if (s) T(s, bx + 61, by + 20, C.green, F11, 'center');
    });
  }
  function drawMenu() {
    if (!menu) return;
    const m = menu;
    ctx.fillStyle = '#5d5447'; ctx.fillRect(m.x, m.y, m.w, m.h);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.strokeRect(m.x + 0.5, m.y + 0.5, m.w - 1, m.h - 1);
    ctx.fillStyle = '#000'; ctx.fillRect(m.x + 1, m.y + 1, m.w - 2, 16);
    T('Choose Option', m.x + 3, m.y + 14, '#5d5447', F12, 'left', false);
    m.opts.forEach((o, i) => {
      const y = m.y + 31 + i * 15;
      const hov = mouse.x >= m.x && mouse.x < m.x + m.w && mouse.y >= y - 12 && mouse.y < y + 3;
      rich(hov ? o.segs.map(([s]) => [s, C.yellow]) : o.segs, m.x + 3, y, F12);
    });
  }
  function drawTooltip() {
    if (!tooltip || menu) return;
    const ls = tooltip.lines.filter(Boolean);
    const w = Math.max(...ls.map(l => W(l, F11))) + 8, h = ls.length * 13 + 5;
    let x = Math.max(2, Math.min(765 - w - 2, tooltip.x - w / 2)), y = tooltip.y + 18;
    if (y + h > 503) y = tooltip.y - h - 6;
    ctx.fillStyle = '#ffffa0'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#000'; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    ls.forEach((l, i) => T(l, x + 4, y + 13 + i * 13, '#000', F11, 'left', false));
  }

  function draw() {
    ctx.clearRect(0, 0, 765, 503);
    const st = S();
    if (!st.loggedIn) { drawLogin(); return; }
    Render.setDestTile(S().loggedIn ? S().flag : null);
    if (worldMap.open) { drawWorldMap(); return; }
    ctx.drawImage(frameCv, 0, 0);
    Render.setHoverTile(null);
    hoverOpts = (mouse.x >= 0 && !menu) ? optionsAt(mouse.x, mouse.y) : [];
    drawViewportOverlays();
    drawMinimap();
    drawTabs();
    drawPanel();
    drawChat();
    if (drag && drag.moved) { const it = st.inv[drag.slot]; if (it) drawItem(it.id, it.qty, mouse.x - 16, mouse.y - 16, 0.6); }
    drawMenu();
    drawTooltip();
  }

  function init(canvas) {
    cv = canvas; ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    buildFrame();
    cv.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    cv.addEventListener('mousemove', onMove);
    cv.addEventListener('mouseleave', () => { mouse.x = -1; });
    cv.addEventListener('wheel', onWheel, { passive: false });
    cv.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('keydown', e => onKey(e, true));
    window.addEventListener('keyup', e => onKey(e, false));
  }
  return { init, draw, autoLogin, scale: 1 };
})();
