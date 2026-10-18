// ===== World: big tile map, textured terrain, walls, roofs, locs, chunks, pathfinding =====
const World = (() => {
  const W = 240, H = 264;
  const OX = 40, OZ = 36; // offset of the original Ardenvale village layout
  const WATER_H = -0.35;
  const U = { GRASS: 1, FOREST: 2, DIRT: 3, SAND: 4, DARK: 5, SWAMP: 6, DESERT: 7, JUNGLE: 8, ESS: 9, SNOW: 10, CAVE: 11, CAVEROCK: 12 };
  const UCOL = { 1: [84, 114, 40], 2: [66, 94, 32], 3: [108, 90, 62], 4: [172, 156, 100], 5: [58, 50, 42], 6: [70, 80, 44], 7: [196, 170, 108], 8: [50, 98, 28], 9: [150, 150, 170], 10: [214, 222, 232], 11: [96, 84, 66], 12: [58, 52, 46] };
  // underground area (Stronghold of Security + Edgeville Dungeon) lives in the sealed-off south-east
  const CAVE = { x0: 162, z0: 134, x1: 239, z1: 184 };
  const inCave = (x, z) => x >= CAVE.x0 && x <= CAVE.x1 && z >= CAVE.z0 && z <= CAVE.z1;
  const O = { PATH: 1, WATER: 2, WOOD: 3, STONE: 4, BRIDGE: 5, MUD: 6, COBBLE: 7, LAVA: 8, PIER: 9, SANDPATH: 10 };
  const OCOL = { 1: [122, 100, 66], 2: [40, 66, 120], 3: [104, 72, 40], 4: [96, 92, 86], 5: [40, 66, 120], 6: [80, 66, 46], 7: [112, 108, 100], 8: [220, 90, 20], 9: [40, 66, 120], 10: [170, 140, 90] };

  const under = new Uint8Array(W * H).fill(U.GRASS);
  const over = new Uint8Array(W * H);
  const blocked = new Uint8Array(W * H);
  const wall = new Uint8Array(W * H);
  const roofOf = new Int16Array(W * H).fill(-1);
  const locAt = new Array(W * H).fill(null);
  const vh = new Float32Array((W + 1) * (H + 1));
  const tileNoise = new Float32Array(W * H);
  const idx = (x, z) => z * W + x;
  const inb = (x, z) => x >= 0 && z >= 0 && x < W && z < H;

  let seed = 1337;
  function rnd() { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }

  const buildings = [], wallSegs = [], fenceSegs = [], locs = [], bridgeTiles = [], mapIcons = [], labels = [];
  let bridgeOpen = false;
  const SPAWN = { x: 90, z: 84 };
  const NPC_SPAWNS = [];
  const npc = (id, x, z) => NPC_SPAWNS.push([id, x, z]);
  const vnpc = (id, x, z) => npc(id, x + OX, z + OZ);

  function setU(x, z, u) { if (inb(x, z)) under[idx(x, z)] = u; }
  function setO(x, z, o) { if (inb(x, z)) over[idx(x, z)] = o; }
  function rectU(x0, z0, x1, z1, u) { for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) setU(x, z, u); }
  function rectO(x0, z0, x1, z1, o) { for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) setO(x, z, o); }
  const ov = (x, z) => inb(x, z) ? over[idx(x, z)] : 0;
  const isWater = (x, z) => { const o = ov(x, z); return o === O.WATER || o === O.BRIDGE || o === O.PIER; };
  const isLiquid = (x, z) => isWater(x, z) || ov(x, z) === O.LAVA;

  function addWall(x, z, side, list, style) {
    if (!inb(x, z)) return;
    const bits = { N: 1, E: 2, S: 4, W: 8 };
    wall[idx(x, z)] |= bits[side];
    const nb = { N: [0, -1, 4], E: [1, 0, 8], S: [0, 1, 1], W: [-1, 0, 2] }[side];
    if (inb(x + nb[0], z + nb[1])) wall[idx(x + nb[0], z + nb[1])] |= nb[2];
    list.push({ x, z, side, style });
  }

  // ---------- heights ----------
  function baseH(x, z) {
    let h = 0.45 * Math.sin(x * 0.09 + 1) * Math.cos(z * 0.08) + 0.22 * Math.sin(x * 0.23 + z * 0.17) + 0.12 * Math.cos(x * 0.37 - z * 0.29);
    for (const [cx, cz, r] of [[90, 82, 20], [145, 82, 16], [100, 22, 10]]) {
      const dv = Math.hypot(x - cx, z - cz);
      if (dv < r) { const w = dv < r * 0.6 ? 1 : 1 - (dv - r * 0.6) / (r * 0.4); h = h * (1 - w) + 0.1 * w; }
    }
    if (z > 130) h += Math.sin(x * 0.15) * Math.cos(z * 0.2) * 0.4;
    const dvol = Math.hypot(x - 216, z - 58);
    if (dvol < 11) h += (11 - dvol) * 0.55 - (dvol < 3 ? (3 - dvol) * 1.2 : 0);
    for (const [cx, cz, r] of [[77, 20, 14], [196, 88, 9]]) { const dv = Math.hypot(x - cx, z - cz); if (dv < r) { const w = dv < r * 0.7 ? 1 : 1 - (dv - r * 0.7) / (r * 0.3); h = h * (1 - w) + 0.15 * w; } }
    if (x < 36 && z < 170) h += 0.3 * Math.sin(z * 0.2) + 0.2;
    for (const [cx, cz, r] of [[154, 216, 26], [92, 236, 16]]) { const dv = Math.hypot(x - cx, z - cz); if (dv < r) { const w = dv < r * 0.7 ? 1 : 1 - (dv - r * 0.7) / (r * 0.3); h = h * (1 - w) + 0.12 * w; } }
    const de = Math.min(x, z, H - z);
    if (de < 6) h += (6 - de) * 0.45;
    return h;
  }
  const V = (x, z) => vh[z * (W + 1) + x];
  function heightAt(fx, fz) {
    const tx = Math.floor(fx), tz = Math.floor(fz);
    const o = ov(tx, tz);
    if (o === O.BRIDGE || o === O.PIER) return 0.05;
    const x = Math.max(0, Math.min(W - 0.001, fx)), z = Math.max(0, Math.min(H - 0.001, fz));
    const x0 = Math.floor(x), z0 = Math.floor(z), ax = x - x0, az = z - z0;
    const h00 = V(x0, z0), h10 = V(x0 + 1, z0), h01 = V(x0, z0 + 1), h11 = V(x0 + 1, z0 + 1);
    if (ax + az <= 1) return h00 + (h10 - h00) * ax + (h01 - h00) * az;
    return h11 + (h01 - h11) * (1 - ax) + (h10 - h11) * (1 - az);
  }

  // ---------- loc definitions ----------
  const LOCDEF = {
    tree: { name: 'Tree', ops: ['Chop down'], examine: 'A commonly found tree.' },
    teak: { name: 'Teak', ops: ['Chop down'], examine: 'A beautiful old teak tree.' },
    mahogany: { name: 'Mahogany', ops: ['Chop down'], examine: 'A strong old mahogany tree.' },
    banana: { name: 'Banana tree', ops: ['Pick'], examine: 'A tree full of bananas.' },
    guild_door: { name: 'Door', ops: ['Open'], examine: 'The door to the Mining Guild. Mining level 60 required.' },
    portal: { name: 'Portal', ops: ['Use'], examine: 'A magical portal out of the mine.' },
    gnome_hut: { name: 'Gnome hut', w: 2, d: 2, ops: [], examine: 'A cosy gnome home.' },
    goblin_hut: { name: 'Goblin hut', w: 2, d: 2, ops: [], examine: 'A smelly goblin hut.' },
    grand_tree: { name: 'Grand Tree', w: 3, d: 3, ops: [], examine: 'An enormous ancient tree, home of the gnomes.' },
    spirit_tree: { name: 'Spirit tree', w: 2, d: 2, ops: ['Travel'], examine: 'An ancient, wise spirit tree.' },
    trade_board: { name: 'Trading board', ops: ['Read'], examine: 'Adverts from players buying and selling.' },
    fairy_ring: { name: 'Fairy ring', block: false, ops: ['Use'], examine: 'A mystical ring of mushrooms.' },
    gem_stall: { name: 'Gem stall', w: 2, d: 1, ops: ['Steal-from'], examine: 'A stall selling fine gems.' },
    maple: { name: 'Maple tree', ops: ['Chop down'], examine: 'It\'ll be nice and colourful in autumn.' },
    yew: { name: 'Yew', ops: ['Chop down'], examine: 'A tough looking yew tree.' },
    magic: { name: 'Magic tree', ops: ['Chop down'], examine: 'The tree shimmers with a magical force.' },
    adamantite: { name: 'Rocks', ops: ['Mine', 'Prospect'], examine: 'A rocky outcrop.' },
    runite: { name: 'Rocks', ops: ['Mine', 'Prospect'], examine: 'A rocky outcrop.' },
    snare: { name: 'Bird snare', block: false, ops: ['Check', 'Dismantle'], examine: 'A bird snare.' },
    boxtrap: { name: 'Box trap', block: false, ops: ['Check', 'Dismantle'], examine: 'A box trap.' },
    oak: { name: 'Oak', ops: ['Chop down'], examine: 'A beautiful old oak.' },
    willow: { name: 'Willow', ops: ['Chop down'], examine: 'A droopy tree.' },
    pine: { name: 'Evergreen', ops: [], examine: 'A tall evergreen tree.' },
    deadtree: { name: 'Dead tree', ops: [], examine: 'It\'s seen better days.' },
    palm: { name: 'Palm tree', ops: [], examine: 'It provides some welcome shade.' },
    cactus: { name: 'Cactus', ops: [], examine: 'It looks prickly.' },
    copper: { name: 'Rocks', ops: ['Mine', 'Prospect'], examine: 'A rocky outcrop.' },
    tin: { name: 'Rocks', ops: ['Mine', 'Prospect'], examine: 'A rocky outcrop.' },
    iron: { name: 'Rocks', ops: ['Mine', 'Prospect'], examine: 'A rocky outcrop.' },
    coal: { name: 'Rocks', ops: ['Mine', 'Prospect'], examine: 'A rocky outcrop.' },
    gold: { name: 'Rocks', ops: ['Mine', 'Prospect'], examine: 'A rocky outcrop.' },
    mithril: { name: 'Rocks', ops: ['Mine', 'Prospect'], examine: 'A rocky outcrop.' },
    essence: { name: 'Rune Essence', w: 2, d: 2, ops: ['Mine'], examine: 'A strange, pale stone humming with power.' },
    fishing_spot: { name: 'Fishing spot', block: false, ops: ['Net'], examine: 'There are fish swimming here.' },
    furnace: { name: 'Furnace', w: 2, d: 2, ops: ['Smelt'], examine: 'A red hot furnace.' },
    anvil: { name: 'Anvil', ops: ['Smith'], examine: 'Used for fashioning metal items.' },
    range: { name: 'Cooking range', ops: ['Cook'], examine: 'A hot range for cooking on.' },
    bank_booth: { name: 'Bank booth', ops: ['Bank'], examine: 'The bank teller will serve you from here.' },
    altar: { name: 'Altar', w: 2, d: 1, ops: ['Pray-at'], examine: 'An altar to the gods of light.' },
    fountain: { name: 'Fountain', w: 2, d: 2, ops: [], examine: 'The village fountain. The water looks clean.' },
    well: { name: 'Well', ops: [], examine: 'A deep stone well.' },
    fire: { name: 'Fire', block: false, ops: [], examine: 'Hot!' },
    crate: { name: 'Crate', ops: [], examine: 'A sturdy wooden crate.' },
    barrel: { name: 'Barrel', ops: [], examine: 'It smells of old ale.' },
    signpost: { name: 'Signpost', ops: ['Read'], examine: 'A wooden signpost.' },
    lamp: { name: 'Lamp post', ops: [], examine: 'It lights the streets at night.' },
    flowers: { name: 'Flowers', block: false, ops: [], examine: 'Pretty flowers.', deco: true },
    bush: { name: 'Bush', block: false, ops: [], examine: 'A leafy bush.', deco: true },
    bonepile: { name: 'Bones', block: false, ops: [], examine: 'The remains of some poor soul.', deco: true },
    bakery_stall: { name: 'Bakery stall', w: 2, d: 1, ops: ['Steal-from'], examine: 'A stall selling freshly baked cakes.' },
    silk_stall: { name: 'Silk stall', w: 2, d: 1, ops: ['Steal-from'], examine: 'A stall selling fine silk.' },
    spinning_wheel: { name: 'Spinning wheel', ops: ['Spin'], examine: 'I can spin flax into bow string here.' },
    flax: { name: 'Flax', block: false, ops: ['Pick'], examine: 'A flax plant.' },
    allotment: { name: 'Allotment', w: 3, d: 2, ops: ['Inspect'], examine: 'A patch of earth for growing vegetables.' },
    herbpatch: { name: 'Herb patch', w: 2, d: 2, ops: ['Inspect'], examine: 'A patch for growing herbs.' },
    tent: { name: 'Tent', w: 2, d: 2, ops: [], examine: 'A sturdy canvas tent.' },
    boat: { name: 'Ship', w: 3, d: 5, ops: [], examine: 'The Sea Maiden. She looks seaworthy enough.' },
    sos_entrance: { name: 'Entrance', ops: ['Climb-down'], examine: 'A dark hole leading to the Stronghold of Security.' },
    trapdoor: { name: 'Trapdoor', ops: ['Climb-down'], examine: 'A trapdoor leading down into the Edgeville Dungeon.' },
    ladder_up: { name: 'Ladder', ops: ['Climb-up'], examine: 'It leads back to the surface.' },
    ladder_down: { name: 'Ladder', ops: ['Climb-down'], examine: 'It leads deeper underground.' },
    sos_gate: { name: 'Gate of War', ops: ['Open'], examine: 'A heavily guarded gate. Answer its question to pass.' },
    sos_gift: { name: 'Gift of Peace', ops: ['Open'], examine: 'A reward for completing the Vault of War.' },
    sos_grain: { name: 'Grain of Plenty', ops: ['Search'], examine: 'A reward for completing the Catacomb of Famine.' },
    sos_box: { name: 'Box of Health', ops: ['Open'], examine: 'A reward for completing the Pit of Pestilence.' },
    sos_cradle: { name: 'Cradle of Life', ops: ['Search'], examine: 'The final reward of the Stronghold of Security.' },
    wild_ditch: { name: 'Wilderness Ditch', ops: ['Cross'], examine: 'Beyond this ditch lies the Wilderness. Danger!' },
    chaos_altar: { name: 'Chaos altar', w: 2, d: 1, ops: ['Pray-at'], examine: 'An altar to the dark god Zamorak. Bones offered here are blessed.' },
    gravestone: { name: 'Gravestone', ops: [], examine: 'Here lies a fallen adventurer.' },
    warn_sign: { name: 'Warning sign', ops: ['Read'], examine: 'DANGER: Wilderness ahead!' },
    stalagmite: { name: 'Stalagmite', ops: [], examine: 'A rocky spike rising from the cave floor.' },
    cave_torch: { name: 'Torch', ops: [], examine: 'It lights the dark tunnels.' },
  };
  for (const k in RC_ALTARS) LOCDEF['rc_' + k] = { name: k.charAt(0).toUpperCase() + k.slice(1) + ' altar', w: 2, d: 2, ops: ['Craft-rune'], examine: `A mysterious altar humming with ${k} energy.`, rune: k };
  const AG = AGILITY.map((a, i) => a.abs ? Object.assign({}, a, { i }) : Object.assign({}, a, { i, start: [a.start[0] + OX, a.start[1] + OZ], path: a.path.map(([x, z]) => [x + OX, z + OZ]) }));
  AG.forEach((a, i) => { LOCDEF['agility' + i] = { name: a.name, ops: [a.op], examine: 'An obstacle on the agility course.', agility: a }; });
  for (const k in LOCDEF) { const d = LOCDEF[k]; d.w = d.w || 1; d.d = d.d || 1; if (d.block === undefined) d.block = true; }

  function canPlace(x, z, w, d) {
    for (let j = 0; j < d; j++) for (let i = 0; i < w; i++) {
      const xx = x + i, zz = z + j;
      if (!inb(xx, zz) || blocked[idx(xx, zz)] || locAt[idx(xx, zz)] || isLiquid(xx, zz)) return false;
    }
    return true;
  }
  function addLoc(type, x, z, opts) {
    const def = LOCDEF[type];
    const loc = Object.assign({ type, x, z, w: def.w, d: def.d, def, depletedUntil: 0, rot: 0 }, opts || {});
    if (loc.rot % 2) { const t = loc.w; loc.w = loc.d; loc.d = t; }
    for (let j = 0; j < loc.d; j++) for (let i = 0; i < loc.w; i++) {
      if (!inb(x + i, z + j)) continue;
      const k = idx(x + i, z + j);
      if (!def.deco) locAt[k] = loc;
      if (def.block) blocked[k] = 1;
    }
    locs.push(loc);
    return loc;
  }
  function removeLoc(loc) {
    const i = locs.indexOf(loc); if (i >= 0) locs.splice(i, 1);
    for (let j = 0; j < loc.d; j++) for (let ii = 0; ii < loc.w; ii++) {
      const k = idx(loc.x + ii, loc.z + j);
      if (locAt[k] === loc) locAt[k] = null;
      if (loc.def.block) blocked[k] = 0;
    }
  }

  // ---------- map design ----------
  function riverLum(z) { return 113 + 2 * Math.sin(z * 0.1) + Math.sin(z * 0.27); }
  function riverX(z) { return 61 + 2.2 * Math.sin((z - OZ) * 0.11) + 1.0 * Math.sin((z - OZ) * 0.29 + 1); }

  function design() {
    // regions
    rectU(36, 3, 124, 40, U.FOREST);
    rectU(40, 40, 58, 124, U.FOREST);
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      if (x < 36 && z < 170) setU(x, z, U.DARK);
      if (x >= 124 && z < 52) setU(x, z, U.SWAMP);
      const dz = 130 + Math.sin(x * 0.2) * 3;
      if (z > dz && z < 184 + Math.sin(x * 0.17) * 3 && x >= 36) setU(x, z, U.DESERT);
    }
    // river from north to the desert oasis
    for (let z = 0; z <= 140; z++) { const cx = riverX(z); for (let x = 0; x < W; x++) if (Math.abs(x + 0.5 - cx) <= 1.9) setO(x, z, O.WATER); }
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      if (Math.hypot(x - 71, z - 47) < 5.6) setO(x, z, O.WATER);
      if (Math.hypot((x - 62) / 1.4, z - 145) < 6) setO(x, z, O.WATER);
      if (x >= 160 && z < 186) setO(x, z, O.WATER);
      // Saltreach Isle
      const ie = Math.hypot((x - 209) / 25, (z - 86) / 46) + Math.sin(z * 0.3 + x * 0.1) * 0.04;
      if (ie < 1) { setO(x, z, 0); setU(x, z, U.JUNGLE); }
    }
    rectU(64, 6, 90, 34, U.GRASS);
    rectU(38, 146, 58, 168, U.GRASS); rectU(38, 224, 70, 252, U.GRASS);
    for (let z = 190; z < 223; z++) for (let x = 40; x < 76; x++) if (Math.hypot(x - 57, z - 206) < 13) setU(x, z, U.GRASS);
    for (let z = 48; z < 68; z++) for (let x = 118; x < 142; x++) if (Math.hypot(x - 130, z - 58) < 9) setU(x, z, U.DIRT);
    for (let z = 3; z < 34; z++) for (let x = 37; x < 59; x++) if (!isWater(x, z) && x < riverX(z) - 3) setU(x, z, U.SNOW);
    // southern kingdom: woods, River Lum, Lumbridge swamp, essence mine island
    rectU(38, 190, 78, 222, U.FOREST); rectU(160, 238, 196, 262, U.FOREST);
    rectU(68, 250, 108, 262, U.SWAMP);
    for (let z = 190; z < H; z++) for (let x = 196; x < W; x++) if (x > 198 + Math.sin(z * 0.2) * 3) setU(x, z, U.SWAMP);
    for (let i = 0; i < 70; i++) { const cx = 202 + rnd() * 34, cz = 194 + rnd() * 66, r = 1 + rnd() * 2.8; for (let z = cz - 4; z < cz + 4; z++) for (let x = cx - 4; x < cx + 4; x++) if (Math.hypot(x - cx, z - cz) < r && x < W - 3 && z < H - 3) setO(Math.floor(x), Math.floor(z), i % 3 ? O.MUD : O.WATER); }
    for (let i = 0; i < 25; i++) { const cx = 70 + rnd() * 38, cz = 250 + rnd() * 12, r = 1 + rnd() * 1.6; for (let z = cz - 3; z < cz + 3; z++) for (let x = cx - 3; x < cx + 3; x++) if (Math.hypot(x - cx, z - cz) < r && z < H - 3) setO(Math.floor(x), Math.floor(z), i % 2 ? O.MUD : O.WATER); }
    for (let z = 186; z < H; z++) { const cx = riverLum(z); for (let x = 100; x < 126; x++) if (Math.abs(x + 0.5 - cx) <= 1.7) setO(x, z, O.WATER); }
    rectO(2, 228, 34, H - 1, O.WATER);
    for (let z = 234; z < 261; z++) for (let x = 6; x < 31; x++) { setO(x, z, 0); setU(x, z, U.ESS); }
    for (let z = 44; z < 50; z++) for (let x = 62; x < 68; x++) if (Math.abs(z - 47) < 1.6) setO(x, z, O.WATER);
    // swamp pools & mud
    for (let i = 0; i < 40; i++) { const cx = 128 + rnd() * 28, cz = 6 + rnd() * 40, r = 1 + rnd() * 2.4; for (let z = cz - 4; z < cz + 4; z++) for (let x = cx - 4; x < cx + 4; x++) { const d = Math.hypot(x - cx, z - cz); if (d < r) setO(Math.floor(x), Math.floor(z), i % 3 ? O.MUD : O.WATER); } }
    // ashlands lava
    for (const [cx, cz, r] of [[14, 40, 3.2], [22, 98, 2.6], [10, 120, 3.6], [26, 140, 2.2], [18, 70, 1.8]]) for (let z = cz - 5; z < cz + 5; z++) for (let x = cx - 5; x < cx + 5; x++) if (Math.hypot(x - cx, z - cz) < r) setO(Math.floor(x), Math.floor(z), O.LAVA);
    // banks/beaches
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      if (isWater(x, z)) continue;
      let near = false;
      for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) if (isWater(x + dx, z + dz)) near = true;
      if (near && rnd() < 0.85 && under[idx(x, z)] !== U.SWAMP) setU(x, z, U.SAND);
      if (x >= 155 && x < 160 && z < 186) setU(x, z, U.SAND);
    }
    // mines & lairs
    for (let z = 96; z < 120; z++) for (let x = 76; x < 100; x++) if (Math.hypot((x - 87) / 1.2, z - 108) < 8 + rnd()) setU(x, z, U.DIRT);
    for (let z = 104; z < 116; z++) for (let x = 124; x < 138; x++) if (Math.hypot(x - 130, z - 109) < 5.5 + rnd()) setU(x, z, U.DIRT);
    for (let z = 140; z < 156; z++) for (let x = 98; x < 116; x++) if (Math.hypot(x - 106, z - 147) < 6.5 + rnd()) setU(x, z, U.DIRT);
    for (let z = 106; z < 120; z++) for (let x = 43; x < 57; x++) if (Math.hypot(x - 50, z - 113) < 6 + rnd()) setU(x, z, U.DARK);
    for (let z = 84; z < 94; z++) for (let x = 45; x < 55; x++) if (Math.hypot(x - 50, z - 89) < 4.5) setU(x, z, U.DIRT);
    // roads
    for (let x = 30; x < 160; x++) for (const z of [80, 81]) if (!isWater(x, z) && ov(x, z) !== O.LAVA) setO(x, z, under[idx(x, z)] === U.DESERT ? O.SANDPATH : O.PATH);
    for (let z = 10; z < 152; z++) for (const x of [90, 91]) if (!isWater(x, z)) setO(x, z, under[idx(x, z)] === U.DESERT ? O.SANDPATH : O.PATH);
    for (let x = 92; x < 108; x++) setO(x, 94, O.PATH);
    for (let z = 82; z < 104; z++) setO(140, z, O.PATH);
    for (let x = 128; x < 140; x++) setO(x, 104, O.PATH);
    rectO(86, 76, 95, 85, O.COBBLE);
    // Whitecliff streets
    rectO(67, 19, 87, 21, O.COBBLE); rectO(76, 9, 78, 31, O.COBBLE); rectO(77, 32, 78, 40, O.PATH); for (let x = 79; x < 90; x++) setO(x, 20, O.PATH);
    // Saltreach paths & volcano lava
    rectO(188, 85, 205, 87, O.PATH); rectO(203, 88, 205, 112, O.PATH);
    for (let z = 52; z < 65; z++) for (let x = 210; x < 223; x++) if (Math.hypot(x - 216, z - 58) < 2.6) setO(x, z, O.LAVA);
    for (let x = 176; x < 186; x++) for (const z of [86, 87]) setO(x, z, O.PIER);
    rectO(136, 76, 152, 86, O.COBBLE);
    // bridge over the river
    for (const z of [80, 81]) for (let x = 0; x < W; x++) if (ov(x, z) === O.WATER && x > 52 && x < 70) { setO(x, z, O.BRIDGE); bridgeTiles.push([x, z]); }
    // pier into the sea
    for (let x = 160; x < 171; x++) for (const z of [82, 83]) setO(x, z, O.PIER);
    // southern roads + bridges over the Lum
    for (let z = 150; z < 228; z++) for (const x of [90, 91]) if (!isWater(x, z)) setO(x, z, under[idx(x, z)] === U.DESERT ? O.SANDPATH : O.PATH);
    for (let x = 92; x < 132; x++) for (const z of [214, 215]) setO(x, z, isWater(x, z) ? O.PIER : O.PATH);
    for (let x = 96; x < 156; x++) for (const z of [234, 235]) setO(x, z, isWater(x, z) ? O.PIER : O.PATH);
    rectO(154, 228, 155, 236, O.PATH);
    rectO(146, 208, 164, 222, O.COBBLE); rectO(131, 214, 177, 215, O.COBBLE); rectO(154, 206, 155, 235, O.COBBLE);
    rectO(96, 228, 99, 240, O.COBBLE);
    // Draynor & Edgeville streets and connecting roads
    rectO(44, 236, 62, 241, O.COBBLE); rectO(60, 242, 97, 243, O.PATH); rectO(52, 226, 53, 236, O.PATH);
    rectO(40, 156, 56, 158, O.COBBLE); for (let x = 56; x < 90; x++) setO(x, 157, isWater(x, 157) ? O.PIER : O.PATH);
    for (let z = 0; z < H; z++) for (let x = 180; x < W; x++) if (under[idx(x, z)] === U.JUNGLE && !ov(x, z)) { let nearSea = false; for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) if (ov(x + dx, z + dz) === O.WATER) nearSea = true; if (nearSea) setU(x, z, U.SAND); }
  }

  function building(b) {
    buildings.push(b);
    const id = buildings.length - 1;
    rectO(b.x0, b.z0, b.x1, b.z1, b.floor);
    for (let z = b.z0; z <= b.z1; z++) for (let x = b.x0; x <= b.x1; x++) roofOf[idx(x, z)] = id;
    const isDoor = (x, z, s) => b.doors.some(d => d.x === x && d.z === z && d.s === s);
    for (let x = b.x0; x <= b.x1; x++) { if (!isDoor(x, b.z0, 'N')) addWall(x, b.z0, 'N', wallSegs, b.style); if (!isDoor(x, b.z1, 'S')) addWall(x, b.z1, 'S', wallSegs, b.style); }
    for (let z = b.z0; z <= b.z1; z++) { if (!isDoor(b.x0, z, 'W')) addWall(b.x0, z, 'W', wallSegs, b.style); if (!isDoor(b.x1, z, 'E')) addWall(b.x1, z, 'E', wallSegs, b.style); }
    for (const d of b.doors) b.doorSegs = (b.doorSegs || []).concat([d]);
    return b;
  }
  // building with village-offset coordinates
  function vbuilding(b) {
    b.x0 += OX; b.x1 += OX; b.z0 += OZ; b.z1 += OZ;
    b.doors = b.doors.map(d => ({ x: d.x + OX, z: d.z + OZ, s: d.s }));
    return building(b);
  }
  const vloc = (t, x, z, o) => addLoc(t, x + OX, z + OZ, o);
  const vicon = (x, z, icon) => mapIcons.push({ x: x + OX, z: z + OZ, icon });
  function fence(x0, z0, x1, z1, gates) {
    const isGate = (x, z) => gates.some(g => g[0] === x && g[1] === z);
    for (let x = x0; x <= x1; x++) { if (!isGate(x, z0)) addWall(x, z0, 'N', fenceSegs); if (!isGate(x, z1)) addWall(x, z1, 'S', fenceSegs); }
    for (let z = z0; z <= z1; z++) { if (!isGate(x0, z)) addWall(x0, z, 'W', fenceSegs); if (!isGate(x1, z)) addWall(x1, z, 'E', fenceSegs); }
  }

  function placeStructures() {
    // ===== Ardenvale (original layout, offset) =====
    vbuilding({ name: 'Bank', x0: 41, z0: 33, x1: 48, z1: 38, style: 'stone', roof: 'slate', floor: O.STONE, doors: [{ x: 44, z: 38, s: 'S' }, { x: 45, z: 38, s: 'S' }] });
    for (const x of [42, 44, 45, 47]) vloc('bank_booth', x, 35);
    vicon(44.5, 36, 'bank');
    vbuilding({ name: 'General Store', x0: 54, z0: 33, x1: 59, z1: 38, style: 'wood', roof: 'rooftile', floor: O.WOOD, doors: [{ x: 56, z: 38, s: 'S' }] });
    vloc('crate', 54, 33); vloc('barrel', 59, 33); vloc('crate', 55, 33);
    vicon(57, 36, 'store');
    vbuilding({ name: 'Smithy', x0: 54, z0: 51, x1: 60, z1: 55, style: 'stone', roof: 'slate', floor: O.STONE, doors: [{ x: 55, z: 51, s: 'N' }, { x: 56, z: 51, s: 'N' }] });
    vloc('furnace', 58, 53, { rot: 2 }); vloc('anvil', 55, 54); vloc('anvil', 56, 54);
    vicon(59, 54, 'furnace'); vicon(55.5, 54.5, 'anvil');
    vbuilding({ name: 'Cottage', x0: 41, z0: 51, x1: 46, z1: 55, style: 'wood', roof: 'thatch', floor: O.WOOD, doors: [{ x: 44, z: 51, s: 'N' }] });
    vloc('range', 42, 55, { rot: 2 }); vloc('spinning_wheel', 46, 53);
    vicon(42.5, 55.5, 'range'); vicon(46.5, 53.5, 'spin');
    vbuilding({ name: 'Chapel', x0: 62, z0: 39, x1: 68, z1: 47, style: 'stone', roof: 'rooftile', floor: O.STONE, doors: [{ x: 62, z: 44, s: 'W' }, { x: 62, z: 43, s: 'W' }] });
    vloc('altar', 66, 40, { rot: 1 }); vicon(66.5, 41, 'altar');
    vbuilding({ name: 'Elder\'s House', x0: 34, z0: 39, x1: 39, z1: 42, style: 'wood', roof: 'thatch', floor: O.WOOD, doors: [{ x: 37, z: 42, s: 'S' }] });
    vicon(36.5, 40.5, 'quest');
    vbuilding({ name: 'Orla\'s Runes', x0: 41, z0: 26, x1: 46, z1: 30, style: 'stone', roof: 'slate', floor: O.STONE, doors: [{ x: 43, z: 30, s: 'S' }] });
    vicon(43.5, 28, 'rune');
    vbuilding({ name: 'Bryn\'s Archery', x0: 54, z0: 26, x1: 59, z1: 30, style: 'wood', roof: 'rooftile', floor: O.WOOD, doors: [{ x: 56, z: 30, s: 'S' }] });
    vloc('barrel', 59, 26); vicon(57, 28, 'archery');
    vbuilding({ name: 'Wren\'s Herbs', x0: 34, z0: 33, x1: 38, z1: 37, style: 'wood', roof: 'thatch', floor: O.WOOD, doors: [{ x: 38, z: 35, s: 'E' }] });
    vicon(36, 35, 'herb');
    vbuilding({ name: 'Tannery', x0: 58, z0: 61, x1: 62, z1: 64, style: 'wood', roof: 'rooftile', floor: O.WOOD, doors: [{ x: 60, z: 61, s: 'N' }] });
    vicon(60, 63, 'tanner');
    vloc('fountain', 50, 43); vloc('signpost', 48, 47);
    vloc('bakery_stall', 53, 41); vloc('silk_stall', 53, 47);
    vicon(54, 41.5, 'stall'); vicon(54, 47.5, 'stall');
    for (const [x, z] of [[46, 44], [55, 44], [49, 39], [52, 49]]) vloc('lamp', x, z);
    fence(64 + OX, 28 + OZ, 72 + OX, 35 + OZ, [[64 + OX, 31 + OZ], [64 + OX, 32 + OZ]]);
    fence(66 + OX, 52 + OZ, 80 + OX, 66 + OZ, [[66 + OX, 58 + OZ]]);
    vloc('crate', 46, 40); vloc('barrel', 46, 41);
    // Farming
    vloc('allotment', 31, 47); vloc('allotment', 35, 47); vloc('herbpatch', 38, 47);
    vicon(35, 48, 'farm');
    for (let z = 50; z < 56; z++) for (let x = 25; x < 30; x++) if (!isWater(x + OX, z + OZ) && (x + z) % 2 === 0) vloc('flax', x, z);
    // Agility course
    const agBlock = [[1, 0, 6, 1], [1, 0, 1, 3], [0, 1, 1, 4], [1, 0, 5, 1], [0, 1, 1, 4]];
    const ardRects = [[71, 94, 6, 1], [78, 94, 1, 3], [79, 97, 1, 4], [73, 102, 5, 1], [71, 97, 1, 4]];
    AG.forEach((a, i) => {
      const rect = a.rect || ardRects[i];
      addLoc('agility' + i, rect[0], rect[1], { w: rect[2], d: rect[3] });
    });
    mapIcons.push({ x: 98, z: 191, icon: 'agility' }, { x: 23, z: 152, icon: 'agility' });
    for (let x = 22; x <= 25; x++) setO(x, 146, O.LAVA);
    mapIcons.push({ x: 75, z: 97, icon: 'agility' });
    // Slayer master's tent near the goblin camp
    addLoc('tent', 100, 109); mapIcons.push({ x: 101, z: 110, icon: 'slayer' });
    mapIcons.push({ x: 87, z: 108, icon: 'mine' }, { x: 50, z: 89, icon: 'mine' });

    // ===== Port Sarrow (east coast) =====
    building({ name: 'Sarrow Bank', x0: 137, z0: 70, x1: 143, z1: 74, style: 'stone', roof: 'slate', floor: O.STONE, doors: [{ x: 140, z: 74, s: 'S' }] });
    addLoc('bank_booth', 139, 71); addLoc('bank_booth', 141, 71);
    mapIcons.push({ x: 140, z: 72, icon: 'bank' });
    building({ name: 'Harbourmaster', x0: 146, z0: 70, x1: 151, z1: 74, style: 'wood', roof: 'rooftile', floor: O.WOOD, doors: [{ x: 148, z: 74, s: 'S' }] });
    mapIcons.push({ x: 148.5, z: 72, icon: 'quest' });
    building({ name: 'Fish House', x0: 146, z0: 88, x1: 151, z1: 92, style: 'wood', roof: 'thatch', floor: O.WOOD, doors: [{ x: 148, z: 88, s: 'N' }] });
    addLoc('range', 150, 91); mapIcons.push({ x: 150.5, z: 91.5, icon: 'range' });
    building({ name: 'Sarrow Forge', x0: 136, z0: 88, x1: 141, z1: 92, style: 'stone', roof: 'slate', floor: O.STONE, doors: [{ x: 138, z: 88, s: 'N' }] });
    addLoc('furnace', 139, 90); addLoc('anvil', 137, 91);
    mapIcons.push({ x: 140, z: 91, icon: 'furnace' }, { x: 137.5, z: 91.5, icon: 'anvil' });
    addLoc('well', 144, 80); addLoc('signpost', 135, 79);
    for (const [x, z] of [[137, 77], [152, 77], [137, 85], [152, 85]]) addLoc('lamp', x, z);
    addLoc('boat', 164, 85, { w: 3, d: 5 });
    for (const [x, z] of [[156, 79], [157, 86], [155, 84]]) addLoc('crate', x, z);
    addLoc('barrel', 156, 78);
    mapIcons.push({ x: 165, z: 82.5, icon: 'fish' });
    addLoc('copper', 127, 107); addLoc('tin', 128, 110); addLoc('iron', 131, 106); addLoc('coal', 133, 108); addLoc('coal', 130, 112); addLoc('iron', 134, 111); addLoc('coal', 127, 113);
    mapIcons.push({ x: 130, z: 109, icon: 'mine' });

    // ===== Runestone circle (Elderwood) =====
    const rc = [['air', 93, 15], ['mind', 99, 12], ['water', 105, 15], ['earth', 107, 21], ['fire', 105, 27], ['body', 93, 27]];
    for (const [k, x, z] of rc) { addLoc('rc_' + k, x, z); mapIcons.push({ x: x + 1, z: z + 1, icon: 'rc' }); }
    addLoc('essence', 99, 20); mapIcons.push({ x: 100, z: 21, icon: 'essence' });
    addLoc('rc_chaos', 16, 56); mapIcons.push({ x: 17, z: 57, icon: 'rc' });
    addLoc('rc_nature', 146, 22); mapIcons.push({ x: 147, z: 23, icon: 'rc' });

    // ===== Desert =====
    for (const [t, x, z] of [['gold', 102, 144], ['gold', 105, 142], ['mithril', 108, 146], ['mithril', 110, 149], ['coal', 103, 149], ['coal', 106, 151], ['iron', 101, 147], ['coal', 111, 145]]) addLoc(t, x, z);
    mapIcons.push({ x: 106, z: 147, icon: 'mine' });
    // western woods iron
    for (const [t, x, z] of [['iron', 48, 88], ['iron', 50, 87], ['iron', 52, 89], ['iron', 49, 91], ['copper', 51, 92], ['tin', 47, 90], ['coal', 53, 91]]) addLoc(t, x, z);
    // village mine
    for (const [t, x, z] of [['copper', 43, 69], ['copper', 44, 70], ['copper', 42, 72], ['copper', 45, 74], ['copper', 47, 68], ['tin', 49, 70], ['tin', 50, 73], ['tin', 52, 71], ['tin', 48, 75], ['tin', 53, 74], ['iron', 46, 77], ['iron', 51, 77], ['coal', 54, 69]]) vloc(t, x, z);

    // ===== Al Kharid (desert town) =====
    building({ name: 'Al Kharid Bank', x0: 126, z0: 137, x1: 133, z1: 141, style: 'stone', roof: 'sandstone', floor: O.STONE, doors: [{ x: 129, z: 141, s: 'S' }, { x: 130, z: 141, s: 'S' }] });
    for (const x of [127, 129, 130, 132]) addLoc('bank_booth', x, 138);
    mapIcons.push({ x: 129.5, z: 139, icon: 'bank' });
    building({ name: 'Al Kharid Furnace', x0: 137, z0: 137, x1: 142, z1: 141, style: 'stone', roof: 'sandstone', floor: O.STONE, doors: [{ x: 139, z: 141, s: 'S' }] });
    addLoc('furnace', 139, 138); mapIcons.push({ x: 140, z: 139, icon: 'furnace' });
    building({ name: 'Zeke\'s Scimitars', x0: 126, z0: 146, x1: 130, z1: 150, style: 'stone', roof: 'sandstone', floor: O.WOOD, doors: [{ x: 128, z: 146, s: 'N' }] });
    mapIcons.push({ x: 128, z: 148, icon: 'scimitar' });
    building({ name: 'Kebab House', x0: 137, z0: 146, x1: 141, z1: 150, style: 'stone', roof: 'sandstone', floor: O.WOOD, doors: [{ x: 139, z: 146, s: 'N' }] });
    addLoc('range', 140, 149); addLoc('anvil', 138, 149); mapIcons.push({ x: 140.5, z: 149.5, icon: 'range' });
    rectO(124, 142, 154, 145, O.SANDPATH);
    building({ name: 'Al Kharid Palace', x0: 144, z0: 147, x1: 154, z1: 156, style: 'stone', roof: 'sandstone', floor: O.STONE, doors: [{ x: 148, z: 147, s: 'N' }, { x: 149, z: 147, s: 'N' }] });
    rectO(148, 146, 149, 146, O.SANDPATH);
    npc('emir', 149, 154); for (const [x, z] of [[146, 150], [152, 150], [146, 154], [152, 154]]) npc('kharid_warrior', x, z);
    building({ name: 'Ellis\'s Tannery', x0: 125, z0: 153, x1: 129, z1: 157, style: 'stone', roof: 'sandstone', floor: O.WOOD, doors: [{ x: 127, z: 153, s: 'N' }] });
    npc('tanner', 127, 155); mapIcons.push({ x: 127, z: 155, icon: 'tanner' });
    addLoc('gem_stall', 131, 147); addLoc('silk_stall', 132, 150); mapIcons.push({ x: 132, z: 148.5, icon: 'stall' });
    npc('karim', 139, 148); npc('border_guard', 123, 141); npc('border_guard', 123, 146);
    // Duel Arena
    rectO(125, 159, 137, 169, O.SANDPATH); rectO(135, 146, 135, 158, O.SANDPATH);
    for (let x = 125; x <= 137; x++) { if (x < 134 || x > 136) addWall(x, 159, 'N', fenceSegs); addWall(x, 169, 'S', fenceSegs); }
    for (let z = 159; z <= 169; z++) { addWall(125, z, 'W', fenceSegs); addWall(137, z, 'E', fenceSegs); }
    for (const [x, z] of [[128, 163], [133, 166], [130, 161]]) npc('duellist', x, z);
    for (const [x, z] of [[128, 157], [131, 157], [139, 162], [139, 166]]) npc(x % 2 ? 'man' : 'woman', x, z);
    mapIcons.push({ x: 131, z: 164, icon: 'duel' }, { x: 149, z: 151, icon: 'quest' });
    labels.push(['Duel Arena', 131, 172, 0], ['Al Kharid Palace', 149, 158, 0]);
    for (const [x, z] of [[118, 164], [114, 158], [120, 172]]) npc('camel', x, z);
    for (let x = 92; x < 124; x++) for (const z of [143, 144]) if (!isWater(x, z)) setO(x, z, O.SANDPATH);
    for (const [x, z] of [[124, 136], [145, 136], [134, 146], [135, 140], [143, 157], [155, 146], [124, 150], [140, 157]]) if (canPlace(x, z, 1, 1)) addLoc('palm', x, z);
    for (let z = 134; z < 156; z++) { if (z < 142 || z > 145) { addWall(122, z, 'W', fenceSegs); } }
    // Wilderness ditch
    for (let z = 3; z < 168; z++) if (!isLiquid(36, z)) { setO(36, z, O.MUD); if (!locAt[idx(36, z)]) { blocked[idx(36, z)] = 1; addLoc('wild_ditch', 36, z); } }
    for (const z of [40, 80, 120, 157]) if (canPlace(37, z - 2, 1, 1)) addLoc('warn_sign', 37, z - 2);
    const ruin = (x0, z0, x1, z1, keep, gaps) => {
      const gap = (x, z) => (gaps || []).some(([gx, gz]) => gx === x && gz === z);
      for (let x = x0; x <= x1; x++) { if (!gap(x, z0) && rnd() < keep) addWall(x, z0, 'N', wallSegs, 'stone'); if (!gap(x, z1) && rnd() < keep) addWall(x, z1, 'S', wallSegs, 'stone'); }
      for (let z = z0; z <= z1; z++) { if (!gap(x0, z) && rnd() < keep) addWall(x0, z, 'W', wallSegs, 'stone'); if (!gap(x1, z) && rnd() < keep) addWall(x1, z, 'E', wallSegs, 'stone'); }
    };
    // Chaos Temple
    rectO(22, 50, 28, 56, O.STONE); ruin(22, 50, 28, 56, 0.75, [[28, 53], [28, 54]]);
    addLoc('chaos_altar', 24, 52); mapIcons.push({ x: 25, z: 52.5, icon: 'altar' }); labels.push(['Chaos Temple', 25, 48, 0]);
    for (const [x, z] of [[20, 52], [30, 56], [26, 59], [19, 57]]) npc('chaos_druid', x, z);
    // Graveyard of Shadows
    for (let z = 80; z <= 90; z += 2) for (let x = 6; x <= 16; x += 2) if ((x + z) % 4 === 0 || rnd() < 0.4) { if (canPlace(x, z, 1, 1)) addLoc('gravestone', x, z); }
    for (const [x, z] of [[9, 83], [13, 87], [7, 89], [15, 81]]) npc('zombie', x, z); npc('skeleton', 11, 85);
    labels.push(['Graveyard of Shadows', 11, 77, 0]);
    // Dark Warriors' Fortress
    rectO(22, 106, 32, 116, O.STONE); ruin(22, 106, 32, 116, 1, [[32, 110], [32, 111]]);
    for (const [x, z] of [[24, 108], [29, 109], [25, 114], [30, 114], [27, 111]]) npc('dark_warrior', x, z);
    labels.push(['Dark Warriors\' Fortress', 27, 104, 0]);
    // Green dragons
    for (const [x, z] of [[6, 58], [10, 62], [7, 68], [12, 66]]) npc('green_dragon', x, z);
    labels.push(['Green Dragons', 9, 55, 0]);
    // ruins in the far north
    ruin(24, 6, 32, 14, 0.5); ruin(8, 12, 14, 18, 0.45); labels.push(['Ruins', 28, 18, 0]);
    // player killers roam the deep wilderness
    for (const [i, x, z] of [[0, 20, 40], [1, 30, 76], [2, 24, 96], [3, 22, 128], [4, 16, 20], [5, 14, 106]]) npc('pker' + i, x, z);
    labels.push(['PKers!', 22, 92, 0]);
    // ===== Whitecliff (walled white city) =====
    for (let x = 66; x <= 88; x++) { addWall(x, 8, 'N', wallSegs, 'white'); if (x !== 77 && x !== 78) addWall(x, 32, 'S', wallSegs, 'white'); }
    for (let z = 8; z <= 32; z++) { addWall(66, z, 'W', wallSegs, 'white'); if (z !== 20) addWall(88, z, 'E', wallSegs, 'white'); }
    building({ name: 'Whitecliff Castle', x0: 68, z0: 10, x1: 75, z1: 17, style: 'white', roof: 'slate', floor: O.STONE, doors: [{ x: 75, z: 14, s: 'E' }] });
    building({ name: 'Whitecliff Bank', x0: 80, z0: 10, x1: 86, z1: 14, style: 'white', roof: 'slate', floor: O.STONE, doors: [{ x: 83, z: 14, s: 'S' }] });
    for (const x of [81, 83, 85]) addLoc('bank_booth', x, 11);
    mapIcons.push({ x: 83, z: 12, icon: 'bank' });
    building({ name: 'Armoury', x0: 80, z0: 23, x1: 86, z1: 27, style: 'white', roof: 'rooftile', floor: O.WOOD, doors: [{ x: 80, z: 25, s: 'W' }] });
    mapIcons.push({ x: 83, z: 25, icon: 'armour' });
    building({ name: 'Gem Store', x0: 68, z0: 23, x1: 73, z1: 27, style: 'white', roof: 'rooftile', floor: O.WOOD, doors: [{ x: 73, z: 25, s: 'E' }] });
    mapIcons.push({ x: 70.5, z: 25, icon: 'gem' });
    building({ name: 'Mining Guild', x0: 68, z0: 28, x1: 74, z1: 31, style: 'stone', roof: 'slate', floor: O.STONE, doors: [{ x: 74, z: 29, s: 'E' }] });
    addLoc('guild_door', 74, 29);
    for (const [t, x, z] of [['coal', 69, 29], ['coal', 70, 31], ['mithril', 72, 29], ['adamantite', 71, 31], ['coal', 69, 31], ['mithril', 73, 31]]) addLoc(t, x, z);
    mapIcons.push({ x: 71, z: 30, icon: 'guild' });
    addLoc('furnace', 80, 29); addLoc('anvil', 83, 30); addLoc('gem_stall', 74, 21); addLoc('fountain', 77, 21, { rot: 0 });
    mapIcons.push({ x: 81, z: 30, icon: 'furnace' }, { x: 75, z: 21.5, icon: 'stall' });
    for (const [x, z] of [[67, 18], [87, 18], [67, 22], [87, 22]]) addLoc('lamp', x, z);
    // ===== Saltreach Isle =====
    building({ name: 'Saltreach Store', x0: 191, z0: 79, x1: 196, z1: 83, style: 'wood', roof: 'thatch', floor: O.WOOD, doors: [{ x: 193, z: 83, s: 'S' }] });
    building({ name: 'Saltreach Bank', x0: 198, z0: 79, x1: 202, z1: 83, style: 'wood', roof: 'thatch', floor: O.WOOD, doors: [{ x: 200, z: 83, s: 'S' }] });
    addLoc('bank_booth', 199, 80); addLoc('bank_booth', 201, 80);
    building({ name: 'Fishing Hut', x0: 191, z0: 89, x1: 196, z1: 93, style: 'wood', roof: 'thatch', floor: O.WOOD, doors: [{ x: 193, z: 89, s: 'N' }] });
    addLoc('range', 192, 92);
    mapIcons.push({ x: 193.5, z: 81, icon: 'store' }, { x: 200, z: 81, icon: 'bank' }, { x: 192.5, z: 92.5, icon: 'range' }, { x: 181, z: 86.5, icon: 'boat' }, { x: 166, z: 81, icon: 'boat' });
    addLoc('boat', 178, 88, { w: 3, d: 5 });
    for (let z = 100; z < 112; z += 3) for (let x = 207; x < 216; x += 3) addLoc('banana', x, z);
    mapIcons.push({ x: 211, z: 105, icon: 'farm' });
    // ===== Varrock =====
    for (let x = 130; x <= 178; x++) { addWall(x, 196, 'N', wallSegs, 'stone'); if (x !== 154 && x !== 155) addWall(x, 236, 'S', wallSegs, 'stone'); }
    for (let z = 196; z <= 236; z++) { if (z !== 214 && z !== 215) { addWall(130, z, 'W', wallSegs, 'stone'); addWall(178, z, 'E', wallSegs, 'stone'); } }
    building({ name: 'Varrock Palace', x0: 146, z0: 198, x1: 163, z1: 205, style: 'stone', roof: 'slate', floor: O.STONE, doors: [{ x: 154, z: 205, s: 'S' }, { x: 155, z: 205, s: 'S' }] });
    building({ name: 'Varrock West Bank', x0: 133, z0: 206, x1: 139, z1: 211, style: 'stone', roof: 'slate', floor: O.STONE, doors: [{ x: 139, z: 209, s: 'E' }] });
    for (const x of [134, 135, 137]) addLoc('bank_booth', x, 207);
    building({ name: 'Varrock East Bank', x0: 168, z0: 208, x1: 174, z1: 213, style: 'stone', roof: 'slate', floor: O.STONE, doors: [{ x: 168, z: 211, s: 'W' }] });
    for (const z of [209, 210, 212]) addLoc('bank_booth', 173, z);
    building({ name: 'Aubury\'s Rune Shop', x0: 167, z0: 218, x1: 172, z1: 222, style: 'stone', roof: 'rooftile', floor: O.WOOD, doors: [{ x: 167, z: 220, s: 'W' }] });
    building({ name: 'Zaff\'s Staffs', x0: 134, z0: 218, x1: 139, z1: 222, style: 'wood', roof: 'rooftile', floor: O.WOOD, doors: [{ x: 139, z: 220, s: 'E' }] });
    building({ name: 'Lowe\'s Archery', x0: 143, z0: 226, x1: 148, z1: 231, style: 'wood', roof: 'thatch', floor: O.WOOD, doors: [{ x: 146, z: 226, s: 'N' }] });
    building({ name: 'Horvik\'s Armour', x0: 160, z0: 226, x1: 165, z1: 231, style: 'stone', roof: 'slate', floor: O.STONE, doors: [{ x: 162, z: 226, s: 'N' }] });
    building({ name: 'Varrock Church', x0: 133, z0: 225, x1: 139, z1: 233, style: 'stone', roof: 'slate', floor: O.STONE, doors: [{ x: 139, z: 229, s: 'E' }] });
    addLoc('altar', 134, 226, { rot: 1 });
    addLoc('fountain', 154, 211); addLoc('anvil', 142, 210); addLoc('anvil', 142, 212); addLoc('signpost', 152, 216);
    for (const [x, z] of [[146, 208], [164, 208], [146, 222], [164, 222], [140, 214], [170, 215]]) addLoc('lamp', x, z);
    mapIcons.push({ x: 136, z: 208, icon: 'bank' }, { x: 171, z: 210.5, icon: 'bank' }, { x: 170, z: 220, icon: 'rune' }, { x: 136.5, z: 220, icon: 'staff' }, { x: 145.5, z: 228.5, icon: 'archery' },
      { x: 162.5, z: 228.5, icon: 'armour' }, { x: 135, z: 226.5, icon: 'altar' }, { x: 142.5, z: 211.5, icon: 'anvil' });
    for (const [t, x, z] of [['copper', 184, 226], ['copper', 186, 228], ['tin', 188, 226], ['tin', 190, 229], ['iron', 185, 231], ['iron', 188, 232], ['coal', 191, 225], ['coal', 183, 229]]) addLoc(t, x, z);
    mapIcons.push({ x: 187, z: 229, icon: 'mine' });
    addLoc('tent', 98, 198); addLoc('tent', 104, 202); mapIcons.push({ x: 101, z: 200, icon: 'quest' });
    // ===== Lumbridge =====
    building({ name: 'Lumbridge Castle', x0: 82, z0: 228, x1: 95, z1: 239, style: 'stone', roof: 'slate', floor: O.STONE, doors: [{ x: 95, z: 233, s: 'E' }, { x: 95, z: 234, s: 'E' }] });
    addLoc('range', 83, 229);
    building({ name: 'Lumbridge Church', x0: 100, z0: 223, x1: 106, z1: 229, style: 'stone', roof: 'slate', floor: O.STONE, doors: [{ x: 103, z: 229, s: 'S' }] });
    addLoc('altar', 102, 224);
    building({ name: 'Lumbridge General Store', x0: 98, z0: 244, x1: 103, z1: 248, style: 'wood', roof: 'thatch', floor: O.WOOD, doors: [{ x: 100, z: 244, s: 'N' }] });
    building({ name: 'Bob\'s Brilliant Axes', x0: 84, z0: 245, x1: 89, z1: 249, style: 'wood', roof: 'thatch', floor: O.WOOD, doors: [{ x: 86, z: 245, s: 'N' }] });
    fence(100, 208, 106, 214, [[100, 211]]); fence(116, 220, 128, 230, [[116, 225]]);
    addLoc('fountain', 97, 232); addLoc('signpost', 97, 236);
    for (const [x, z] of [[96, 229], [96, 240]]) addLoc('lamp', x, z);
    mapIcons.push({ x: 84, z: 229.5, icon: 'range' }, { x: 103, z: 224.5, icon: 'altar' }, { x: 100.5, z: 246, icon: 'store' }, { x: 86.5, z: 247, icon: 'axe' }, { x: 88, z: 232, icon: 'quest' });
    for (const [t, x, z] of [['copper', 82, 254], ['copper', 84, 256], ['tin', 87, 254], ['tin', 89, 257], ['copper', 91, 255], ['tin', 85, 259]]) addLoc(t, x, z);
    mapIcons.push({ x: 86, z: 256, icon: 'mine' });
    // ===== Draynor Village =====
    building({ name: 'Draynor Bank', x0: 46, z0: 228, x1: 52, z1: 232, style: 'wood', roof: 'rooftile', floor: O.WOOD, doors: [{ x: 49, z: 232, s: 'S' }] });
    for (const x of [47, 49, 51]) addLoc('bank_booth', x, 229);
    building({ name: 'Draynor Jail', x0: 56, z0: 244, x1: 62, z1: 249, style: 'stone', roof: 'slate', floor: O.STONE, doors: [{ x: 59, z: 244, s: 'N' }] });
    building({ name: 'Wise Old Man\'s House', x0: 40, z0: 244, x1: 45, z1: 248, style: 'wood', roof: 'thatch', floor: O.WOOD, doors: [{ x: 42, z: 244, s: 'N' }] });
    addLoc('bakery_stall', 47, 238); addLoc('silk_stall', 51, 238); addLoc('gem_stall', 55, 238);
    addLoc('fountain', 58, 237); addLoc('signpost', 62, 240);
    for (const [x, z] of [[44, 236], [62, 236], [44, 241]]) addLoc('lamp', x, z);
    for (let z = 228; z < 252; z += 3) if (canPlace(36, z, 1, 1)) addLoc('willow', 36, z);
    mapIcons.push({ x: 49, z: 230, icon: 'bank' }, { x: 51, z: 238.5, icon: 'stall' }, { x: 59, z: 246, icon: 'quest' });
    // ===== Canifis (Morrow Mire) =====
    const clearArea = (x0, z0, x1, z1, u) => { for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) { setO(x, z, 0); if (u) setU(x, z, u); } };
    clearArea(203, 211, 229, 235, U.DIRT); clearArea(218, 235, 234, 252, U.DIRT);
    rectO(212, 220, 219, 226, O.COBBLE); rectO(204, 222, 229, 223, O.PATH); rectO(226, 224, 227, 237, O.PATH);
    for (let x = 178; x < 204; x++) for (const z of [222, 223]) setO(x, z, isWater(x, z) ? O.PIER : O.PATH);
    building({ name: 'Canifis Bank', x0: 205, z0: 213, x1: 211, z1: 218, style: 'wood', roof: 'slate', floor: O.WOOD, doors: [{ x: 208, z: 218, s: 'S' }] });
    for (const x of [206, 208, 210]) addLoc('bank_booth', x, 215);
    building({ name: 'The Rising Sun Inn', x0: 220, z0: 213, x1: 227, z1: 218, style: 'wood', roof: 'slate', floor: O.WOOD, doors: [{ x: 223, z: 218, s: 'S' }] });
    addLoc('range', 221, 214);
    building({ name: 'Canifis General Store', x0: 205, z0: 227, x1: 211, z1: 232, style: 'wood', roof: 'slate', floor: O.WOOD, doors: [{ x: 208, z: 227, s: 'N' }] });
    building({ name: 'Canifis House', x0: 214, z0: 228, x1: 219, z1: 233, style: 'wood', roof: 'slate', floor: O.WOOD, doors: [{ x: 216, z: 228, s: 'N' }] });
    building({ name: 'Slayer Tower', x0: 220, z0: 238, x1: 232, z1: 250, style: 'stone', roof: 'slate', floor: O.STONE, doors: [{ x: 226, z: 238, s: 'N' }, { x: 227, z: 238, s: 'N' }] });
    addLoc('well', 216, 221); for (const [x, z] of [[212, 220], [219, 226], [204, 224]]) addLoc('lamp', x, z);
    for (const x of [206, 208, 210]) npc('banker', x, 214);
    npc('canifis_shop', 208, 230); for (const [x, z] of [[214, 224], [218, 222], [210, 221], [223, 221], [216, 226], [224, 230]]) npc('werewolf', x, z);
    for (const [x, z] of [[223, 242], [229, 242], [223, 247]]) npc('crawling_hand', x, z);
    for (const [x, z] of [[229, 247], [226, 245]]) npc('banshee', x, z);
    for (const [x, z] of [[212, 240], [208, 246], [214, 250]]) npc('ghast', x, z);
    mapIcons.push({ x: 208, z: 216, icon: 'bank' }, { x: 208, z: 230, icon: 'store' }, { x: 222, z: 215, icon: 'range' }, { x: 226, z: 244, icon: 'slayer' });
    labels.push(['Canifis', 216, 209, 1], ['Slayer Tower', 226, 254, 0]);
    // ===== Pollnivneach (desert) =====
    rectO(86, 167, 110, 168, O.SANDPATH); rectO(97, 156, 98, 182, O.SANDPATH);
    building({ name: 'Pollnivneach Bank', x0: 88, z0: 159, x1: 94, z1: 164, style: 'stone', roof: 'sandstone', floor: O.STONE, doors: [{ x: 91, z: 164, s: 'S' }] });
    for (const x of [89, 91, 93]) addLoc('bank_booth', x, 161);
    building({ name: 'Pollnivneach Store', x0: 101, z0: 159, x1: 106, z1: 164, style: 'stone', roof: 'sandstone', floor: O.WOOD, doors: [{ x: 103, z: 164, s: 'S' }] });
    building({ name: 'Desert House', x0: 88, z0: 171, x1: 93, z1: 176, style: 'stone', roof: 'sandstone', floor: O.WOOD, doors: [{ x: 90, z: 171, s: 'N' }] });
    building({ name: 'Desert House', x0: 102, z0: 171, x1: 107, z1: 176, style: 'stone', roof: 'sandstone', floor: O.WOOD, doors: [{ x: 104, z: 171, s: 'N' }] });
    addLoc('well', 100, 170); addLoc('range', 106, 175); addLoc('silk_stall', 94, 166);
    for (const x of [89, 91, 93]) npc('banker', x, 160);
    npc('polln_shop', 103, 161); for (const [x, z] of [[96, 172], [100, 165], [108, 169], [86, 166]]) npc('thug', x, z);
    for (const [x, z] of [[95, 162], [99, 175]]) npc('camel', x, z);
    for (const [x, z] of [[86, 158], [110, 158], [86, 178], [110, 178], [95, 170], [109, 164]]) if (canPlace(x, z, 1, 1)) addLoc('palm', x, z);
    mapIcons.push({ x: 91, z: 162, icon: 'bank' }, { x: 103.5, z: 161.5, icon: 'store' }, { x: 95, z: 166.5, icon: 'stall' });
    labels.push(['Pollnivneach', 98, 155, 1]);
    // ===== Taverley (druid village) =====
    rectO(92, 49, 116, 50, O.PATH);
    building({ name: 'Taverley Herbs', x0: 101, z0: 43, x1: 106, z1: 47, style: 'stone', roof: 'thatch', floor: O.WOOD, doors: [{ x: 103, z: 47, s: 'S' }] });
    building({ name: 'Druid House', x0: 109, z0: 43, x1: 114, z1: 47, style: 'stone', roof: 'thatch', floor: O.WOOD, doors: [{ x: 111, z: 47, s: 'S' }] });
    building({ name: 'Druid House', x0: 101, z0: 52, x1: 106, z1: 56, style: 'stone', roof: 'thatch', floor: O.WOOD, doors: [{ x: 103, z: 52, s: 'N' }] });
    building({ name: 'Taverley Smithy', x0: 109, z0: 52, x1: 114, z1: 56, style: 'stone', roof: 'thatch', floor: O.STONE, doors: [{ x: 111, z: 52, s: 'N' }] });
    addLoc('anvil', 112, 55); addLoc('furnace', 109, 53);
    npc('kaqemeex', 103, 45); for (const [x, z] of [[99, 48], [108, 51], [114, 49], [104, 54]]) npc('druid', x, z);
    for (const [x, z] of [[100, 46], [100, 53], [116, 46], [116, 53]]) if (canPlace(x, z, 1, 1)) addLoc('flowers', x, z);
    mapIcons.push({ x: 103.5, z: 45, icon: 'herb' }, { x: 112, z: 55, icon: 'anvil' }, { x: 110, z: 54, icon: 'furnace' });
    labels.push(['Taverley', 108, 40, 1]);
    // ===== Extra mines =====
    const mineField = (name, cx, cz, list, rad) => {
      for (const [t, n] of list) for (let k = 0; k < n; k++) {
        for (let tries = 0; tries < 40; tries++) { const x = Math.round(cx + (rnd() - 0.5) * 2 * rad), z = Math.round(cz + (rnd() - 0.5) * 2 * rad); if (canPlace(x, z, 1, 1) && !ov(x, z)) { addLoc(t, x, z); break; } }
      }
      mapIcons.push({ x: cx, z: cz, icon: 'mine' }); labels.push([name, cx, cz - rad - 2, 0]);
    };
    for (let z = 160; z < 180; z++) for (let x = 138; x < 156; x++) setO(x, z, 0);
    mineField('Al Kharid Mine', 147, 170, [['iron', 7], ['copper', 4], ['tin', 4], ['coal', 4], ['gold', 3], ['mithril', 2], ['adamantite', 1]], 7);
    mineField('Dwarven Mine', 47, 26, [['coal', 4], ['iron', 3], ['mithril', 2], ['gold', 1], ['adamantite', 1]], 4);
    mineField('Rimmington Mine', 77, 240, [['copper', 3], ['tin', 2], ['iron', 3], ['gold', 2]], 4);
    mineField('Varrock West Mine', 124, 226, [['copper', 3], ['tin', 4], ['iron', 2]], 3);
    mineField('Swamp Mine', 74, 252, [['coal', 4], ['mithril', 2]], 3);
    // ===== Edgeville =====
    building({ name: 'Edgeville Bank', x0: 40, z0: 149, x1: 46, z1: 153, style: 'stone', roof: 'slate', floor: O.STONE, doors: [{ x: 43, z: 153, s: 'S' }] });
    for (const x of [41, 43, 45]) addLoc('bank_booth', x, 150);
    building({ name: 'Edgeville Store', x0: 48, z0: 149, x1: 53, z1: 153, style: 'wood', roof: 'thatch', floor: O.WOOD, doors: [{ x: 50, z: 153, s: 'S' }] });
    building({ name: 'Edgeville House', x0: 40, z0: 161, x1: 45, z1: 165, style: 'wood', roof: 'thatch', floor: O.WOOD, doors: [{ x: 42, z: 161, s: 'N' }] });
    addLoc('range', 44, 164); addLoc('furnace', 49, 160); addLoc('anvil', 52, 160); addLoc('signpost', 38, 157);
    for (const [x, z] of [[40, 156], [56, 156]]) addLoc('lamp', x, z);
    mapIcons.push({ x: 43, z: 151, icon: 'bank' }, { x: 50.5, z: 151, icon: 'store' }, { x: 50, z: 161, icon: 'furnace' }, { x: 44.5, z: 164.5, icon: 'range' });
    // ===== Tree Gnome Village =====
    addLoc('grand_tree', 55, 203);
    for (const [x, z] of [[46, 198], [64, 198], [45, 209], [66, 210], [51, 214], [60, 215]]) addLoc('gnome_hut', x, z);
    addLoc('spirit_tree', 60, 205);
    rectO(52, 207, 53, 225, O.PATH); rectO(48, 207, 64, 208, O.PATH);
    for (const [x, z] of [[49, 204], [62, 202], [57, 211]]) addLoc('flowers', x, z);
    mapIcons.push({ x: 56.5, z: 204.5, icon: 'quest' }, { x: 61, z: 206, icon: 'spirit' });
    // spirit tree network
    addLoc('spirit_tree', 86, 42); addLoc('spirit_tree', 184, 208); addLoc('spirit_tree', 196, 100);
    mapIcons.push({ x: 87, z: 43, icon: 'spirit' }, { x: 185, z: 209, icon: 'spirit' }, { x: 197, z: 101, icon: 'spirit' });
    // ===== Goblin Village =====
    for (const [x, z] of [[126, 53], [133, 52], [136, 59], [124, 60], [130, 63]]) addLoc('goblin_hut', x, z);
    // trade boards
    addLoc('trade_board', 92, 86); addLoc('trade_board', 151, 219); addLoc('trade_board', 145, 86); addLoc('trade_board', 61, 238);
    mapIcons.push({ x: 92.5, z: 86.5, icon: 'board' }, { x: 151.5, z: 219.5, icon: 'board' }, { x: 145.5, z: 86.5, icon: 'board' }, { x: 61.5, z: 238.5, icon: 'board' });
    // ===== New runecrafting altars, essence mine =====
    addLoc('rc_cosmic', 224, 74); addLoc('rc_law', 118, 46); addLoc('rc_death', 6, 112);
    mapIcons.push({ x: 225, z: 75, icon: 'rc' }, { x: 119, z: 47, icon: 'rc' }, { x: 7, z: 113, icon: 'rc' });
    for (const [x, z] of [[10, 239], [22, 239], [10, 252], [22, 252], [16, 256]]) addLoc('essence', x, z);
    addLoc('portal', 16, 246); mapIcons.push({ x: 16.5, z: 246.5, icon: 'essence' });
    addLoc('essence', 7, 245); addLoc('essence', 26, 245);
    for (const code in FAIRY) {
      const f = FAIRY[code];
      let fx = f.x, fz = f.z;
      for (let r = 0; r < 8 && !(canPlace(fx, fz, 1, 1) && !over[idx(fx, fz)]); r++) { fx = f.x + Math.round((rnd() - 0.5) * r * 2); fz = f.z + Math.round((rnd() - 0.5) * r * 2); }
      const loc = addLoc('fairy_ring', fx, fz, { code });
      f.x = fx; f.z = fz;
      mapIcons.push({ x: fx + 0.5, z: fz + 0.5, icon: 'ring' });
    }
    // labels for the world map
    labels.push(['Ardenvale', 90, 74, 1], ['Port Sarrow', 144, 66, 1], ['Elderwood', 85, 8, 0], ['Runestone Circle', 100, 34, 0], ['Duskmoor Swamp', 140, 14, 0],
      ['Kharidian Desert', 100, 136, 1], ['Al Kharid', 135, 133, 1], ['Wilderness', 18, 30, 1], ['Whitecliff', 77, 4, 1], ['Saltreach Isle', 209, 44, 1], ['Mount Ember', 216, 66, 0], ['Saltreach', 196, 76, 0], ['Mining Guild', 71, 36, 0], ['Varrock', 154, 192, 1], ['Lumbridge', 92, 222, 1], ['River Lum', 118, 250, 0], ['Rune Essence Mine', 18, 232, 0], ['Barbarian Camp', 101, 194, 0], ['Hill Giants', 123, 194, 0], ['Dark Wizards', 155, 244, 0], ['Lumbridge Swamp', 86, 262, 0], ['Kingdom of Misthal', 160, 186, 1], ['Morrow Mire', 216, 200, 1], ['Tree Gnome Village', 57, 188, 1], ['Goblin Village', 130, 46, 0], ['Draynor Village', 52, 222, 1], ['Edgeville', 47, 144, 1], ['Frozen Peaks', 48, 4, 1], ['Black Knights\' Camp', 114, 2, 0], ['Moss Giants', 216, 130, 0], ['Graveyard', 130, 246, 0], ['Barbarian Agility', 98, 184, 0], ['Wilderness Agility', 23, 162, 0], ['Western Woods', 49, 64, 0], ['Ardenvale Mine', 87, 120, 0], ['Goblin Camp', 112, 122, 0],
      ['Cinder Lair', 50, 122, 0], ['Demon Pit', 18, 140, 0], ['Agility Course', 74, 106, 0], ['Farm', 75, 90, 0], ['Oasis', 62, 156, 0]);

    // ===== NPCs =====
    [['chicken', 66, 30], ['chicken', 68, 32], ['chicken', 70, 31], ['chicken', 67, 34], ['chicken', 69, 29],
      ['cow', 70, 56], ['cow', 74, 60], ['cow', 77, 54], ['cow', 72, 63], ['cow', 76, 64], ['cow', 69, 61],
      ['goblin', 66, 74], ['goblin', 70, 77], ['goblin', 74, 72], ['goblin', 68, 80], ['goblin', 76, 79], ['goblin', 72, 82],
      ['man', 48, 44], ['man', 53, 45], ['woman', 47, 48], ['man', 54, 42], ['woman', 44, 46],
      ['guard', 45, 40], ['guard', 52, 50], ['guard', 30, 46],
      ['banker', 42, 34], ['banker', 44, 34], ['banker', 45, 34], ['banker', 47, 34],
      ['shopkeeper', 57, 35], ['elder', 36, 40], ['smith', 57, 52], ['mage', 44, 28], ['fletcher', 57, 28], ['herbalist', 36, 35],
      ['farmer', 34, 50], ['tanner', 60, 63], ['priest', 65, 44], ['rat', 28, 72], ['rat', 31, 76], ['rat', 27, 80], ['rat', 33, 70]].forEach(([id, x, z]) => vnpc(id, x, z));
    npc('slayer', 102, 111);
    for (const [x, z] of [[49, 76], [52, 72], [47, 84], [51, 96], [53, 100], [48, 70]]) npc('bandit', x, z);
    npc('ogre', 50, 113);
    for (const [x, z] of [[20, 50], [26, 62], [14, 80], [24, 90], [18, 110], [28, 125], [12, 134], [22, 30]]) npc('skeleton', x, z);
    for (const [x, z] of [[96, 140], [110, 140], [84, 150], [120, 148], [100, 156], [74, 140]]) npc('scorpion', x, z);
    for (const [x, z] of [[132, 20], [140, 34], [150, 12], [136, 44]]) npc('rat', x, z);
    for (const [x, z] of [[139, 75], [141, 75]]) npc('banker', x, z - 3);
    npc('huntsman', 92, 30); npc('lesser_demon', 14, 128); npc('lesser_demon', 22, 134);
    for (const [x, z] of [[131, 144], [136, 143], [142, 144], [128, 152], [140, 153]]) npc('kharid_warrior', x, z);
    npc('zeke', 128, 148); for (const x of [127, 129, 130, 132]) npc('kharid_banker', x, 137);
    for (const [x, z] of [[72, 20], [80, 21], [77, 15], [84, 19], [70, 19]]) npc('white_knight', x, z);
    npc('armourer', 83, 25); npc('gem_trader', 70, 25); npc('man', 79, 26); npc('woman', 75, 23);
    for (const [x, z] of [[76, 88], [80, 88], [72, 91]]) npc('farmer_npc', x, z);
    npc('fishmonger', 149, 90); npc('sailor_sarrow', 168, 82);
    npc('sailor_saltreach', 184, 86); npc('island_shop', 194, 81); npc('banker', 199, 79); npc('banker', 201, 79);
    for (const [x, z] of [[210, 120], [200, 126], [218, 112], [222, 95], [196, 110]]) npc('jogre', x, z);
    for (const [x, z] of [[206, 72], [220, 80], [198, 64], [224, 106]]) npc('jungle_spider', x, z);
    for (const [x, z] of [[130, 30], [138, 22], [144, 40], [150, 30]]) npc('crawling_hand', x, z);
    for (const [x, z] of [[134, 12], [146, 16], [140, 46]]) npc('banshee', x, z);
    npc('green_dragon', 10, 20); npc('green_dragon', 18, 14);
    // Varrock & Lumbridge people and monsters
    npc('aubury', 170, 220); npc('zaff', 136, 220); npc('lowe', 145, 229); npc('horvik', 162, 229);
    for (const x of [134, 135, 137]) npc('banker', x, 206); for (const z of [209, 210, 212]) npc('banker', 174, z);
    for (const [x, z] of [[150, 202], [158, 202], [152, 216], [158, 212], [132, 214], [176, 215]]) npc('varrock_guard', x, z);
    for (const [x, z] of [[148, 210], [160, 218], [150, 219], [162, 211], [156, 224], [144, 215]]) npc(Math.random() < 0.5 ? 'man' : 'woman', x, z);
    npc('priest2', 136, 228);
    for (const [x, z] of [[152, 244], [157, 246], [154, 249], [150, 248]]) npc('dark_wizard', x, z);
    for (const [x, z] of [[120, 198], [125, 200], [122, 204], [127, 197]]) npc('hill_giant', x, z);
    for (const [x, z] of [[100, 200], [106, 199], [102, 204], [97, 203]]) npc('barbarian', x, z);
    for (const [x, z] of [[138, 240], [170, 244], [128, 226]]) npc('mugger', x, z);
    for (const [x, z] of [[60, 200], [110, 250], [180, 210], [70, 230]]) npc('imp', x, z);
    npc('hans', 98, 234); npc('duke', 90, 236); npc('cook', 85, 230); npc('bob', 86, 247); npc('lumby_shop', 100, 246); npc('priest', 104, 226);
    for (const [x, z] of [[102, 210], [104, 212], [101, 213], [105, 209]]) npc('chicken', x, z);
    for (const [x, z] of [[119, 223], [123, 226], [126, 228], [120, 229]]) npc('cow', x, z);
    for (const [x, z] of [[120, 242], [124, 246], [128, 243], [118, 248]]) npc('goblin', x, z);
    for (const [x, z] of [[78, 256], [94, 258], [100, 254]]) npc('rat', x, z);
    for (const [x, z] of [[92, 226], [98, 238], [104, 242]]) npc(Math.random() < 0.5 ? 'man' : 'woman', x, z);
    for (const [x, z] of [[210, 210], [222, 222], [214, 238], [228, 246], [206, 252], [230, 204]]) npc('ghast', x, z);
    for (const [x, z] of [[204, 200], [216, 214], [226, 232], [208, 244], [88, 258], [76, 254]]) npc('giant_frog', x, z);
    npc('swamp_wizard', 72, 14);
    // more monsters
    for (const [x, z] of [[140, 238], [130, 242], [122, 236], [96, 260], [102, 262]]) npc('zombie', x, z);
    for (const [x, z] of [[78, 214], [84, 218], [70, 208], [106, 240]]) npc('giant_spider', x, z);
    for (const [x, z] of [[184, 204], [190, 214], [186, 220], [120, 70]]) npc('unicorn', x, z);
    for (const [x, z] of [[46, 22], [54, 30], [110, 8], [118, 30]]) npc('bear', x, z);
    for (const [x, z] of [[40, 8], [48, 14], [56, 8], [44, 30], [52, 20]]) npc('wolf', x, z);
    for (const [x, z] of [[62, 104], [66, 110], [58, 116], [64, 120]]) npc('hobgoblin', x, z);
    for (const [x, z] of [[108, 6], [114, 8], [120, 6], [112, 12]]) npc('black_knight', x, z);
    for (const [x, z] of [[220, 112], [228, 100], [204, 118], [216, 124]]) npc('moss_giant', x, z);
    for (const [x, z] of [[42, 6], [50, 10], [38, 18], [58, 14]]) npc('ice_warrior', x, z);
    for (const [x, z] of [[46, 12], [54, 6], [40, 26]]) npc('ice_giant', x, z);
    npc('greater_demon', 8, 28); npc('greater_demon', 14, 36); npc('greater_demon', 6, 44);
    npc('blue_dragon', 222, 52); npc('blue_dragon', 210, 50);
    for (const x of [47, 49, 51]) npc('banker', x, 228); for (const x of [41, 43, 45]) npc('banker', x, 149);
    npc('wise_old_man', 43, 246); npc('draynor_shop', 49, 240); npc('edge_shop', 50, 151);
    for (const [x, z] of [[46, 240], [56, 241], [60, 234], [54, 245]]) npc(Math.random() < 0.5 ? 'man' : 'woman', x, z);
    for (const [x, z] of [[58, 247], [60, 248]]) npc('varrock_guard', x, z);
    for (const [x, z] of [[46, 157], [54, 155], [44, 159]]) npc(Math.random() < 0.5 ? 'man' : 'woman', x, z);
    npc('guard', 39, 152);
    npc('guide', 88, 85);
    for (const [x, z] of [[50, 202], [61, 200], [48, 212], [58, 213], [63, 207], [53, 196]]) npc('gnome', x, z);
    for (const [x, z] of [[52, 206], [58, 200], [54, 218]]) npc('gnome_guard', x, z);
    npc('gnome_king', 56, 201); npc('gnome_trader', 47, 205);
    for (const [x, z] of [[128, 56], [131, 58], [134, 56], [129, 61], [132, 54], [127, 58], [135, 62]]) npc('goblin', x, z);
    for (const [x, z] of [[130, 56], [133, 60], [126, 62]]) npc('goblin_warrior', x, z);
    npc('harbourmaster', 148, 72); npc('sailor', 166, 82); npc('man', 145, 82); npc('woman', 150, 79); npc('guard', 140, 80); npc('man', 143, 86);
  }

  // ===== Underground: Stronghold of Security (4 floors) and Edgeville Dungeon =====
  const CAVE_LINKS = {};
  function buildCave() {
    for (let z = CAVE.z0; z <= CAVE.z1; z++) for (let x = CAVE.x0; x <= CAVE.x1; x++) { setO(x, z, 0); setU(x, z, U.CAVEROCK); blocked[idx(x, z)] = 1; }
    const carve = (x0, z0, x1, z1) => { for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) { setU(x, z, U.CAVE); blocked[idx(x, z)] = 0; } };
    const rough = (x0, z0, x1, z1) => { carve(x0, z0, x1, z1); for (let z = z0; z <= z1; z++) for (const x of [x0, x1]) if (rnd() < 0.3) { setU(x, z, U.CAVEROCK); blocked[idx(x, z)] = 1; } };
    const deco = (x0, z0, x1, z1, n) => { for (let i = 0; i < n; i++) { const x = x0 + 1 + Math.floor(rnd() * (x1 - x0 - 1)), z = z0 + 1 + Math.floor(rnd() * (z1 - z0 - 1)); if (canPlace(x, z, 1, 1)) addLoc('stalagmite', x, z); } };
    const torches = (x0, z0, x1, z1) => { for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) if (canPlace(x, z, 1, 1)) addLoc('cave_torch', x, z); };
    const floors = [
      { x: 169, name: 'Vault of War', mons: [['goblin_warrior', 3], ['minotaur', 4]], reward: 'sos_gift' },
      { x: 186, name: 'Catacomb of Famine', mons: [['zombie', 3], ['flesh_crawler', 4]], reward: 'sos_grain' },
      { x: 203, name: 'Pit of Pestilence', mons: [['pit_spider', 3], ['catablepon', 3]], reward: 'sos_box' },
      { x: 220, name: 'Sepulchre of Death', mons: [['skeleton', 3], ['ankou', 3]], reward: 'sos_cradle' },
    ];
    const surface = [104, 199];
    floors.forEach((f, i) => {
      const x0 = f.x, x1 = f.x + 13;
      rough(x0, 139, x1, 147); rough(x0, 151, x1, 159);
      carve(x0 + 6, 147, x0 + 6, 151);
      addLoc('sos_gate', x0 + 6, 149, { floor: i });
      deco(x0, 139, x1, 147, 3); deco(x0, 151, x1, 159, 3);
      torches(x0 + 1, 140, x1 - 1, 146); torches(x0 + 1, 152, x1 - 1, 158);
      addLoc('ladder_up', x0 + 1, 140, { dest: [surface[0] + 1, surface[1]] });
      addLoc(f.reward, x0 + 1, 158);
      if (i < 3) addLoc('ladder_down', x1 - 1, 158, { dest: [floors[i + 1].x + 2, 141] });
      const [m1, n1] = f.mons[0], [m2, n2] = f.mons[1];
      for (let k = 0; k < n1; k++) npc(m1, x0 + 3 + k * 3, 143 + (k % 2) * 2);
      for (let k = 0; k < n2; k++) npc(m2, x0 + 2 + k * 3, 154 + (k % 2) * 2);
      labels.push([f.name, x0 + 7, 137, 0]);
    });
    // surface entrance at the Barbarian Camp
    addLoc('sos_entrance', surface[0], surface[1], { dest: [floors[0].x + 2, 141] });
    mapIcons.push({ x: surface[0] + 0.5, z: surface[1] + 0.5, icon: 'dungeon' });
    labels.push(['Stronghold of Security', surface[0], surface[1] + 4, 0]);
    // Edgeville Dungeon: one long winding cave
    rough(169, 164, 186, 175); rough(186, 167, 200, 172); rough(200, 164, 234, 176);
    for (let i = 0; i < 14; i++) { const x = 172 + Math.floor(rnd() * 60), z = 165 + Math.floor(rnd() * 10); if (rnd() < 0.6) { setU(x, z, U.CAVEROCK); blocked[idx(x, z)] = 1; } }
    carve(169, 165, 172, 168);
    addLoc('ladder_up', 170, 165, { dest: [54, 162] });
    addLoc('trapdoor', 54, 163, { dest: [171, 166] });
    mapIcons.push({ x: 54.5, z: 163.5, icon: 'dungeon' });
    labels.push(['Edgeville Dungeon', 202, 179, 0], ['Underground', 200, 150, 1]);
    deco(169, 164, 234, 176, 14); torches(170, 165, 185, 174); torches(201, 165, 233, 175);
    for (const [id, x, z] of [['chaos_druid', 178, 168], ['chaos_druid', 182, 172], ['chaos_druid', 176, 173], ['zombie', 190, 169], ['zombie', 195, 170], ['skeleton', 205, 168], ['skeleton', 210, 172], ['hill_giant', 216, 167], ['hill_giant', 220, 173], ['hill_giant', 224, 168], ['moss_giant', 230, 172], ['rat', 184, 166]]) npc(id, x, z);
    for (const [t, x, z] of [['iron', 228, 165], ['iron', 230, 166], ['coal', 232, 165], ['coal', 233, 168], ['mithril', 233, 174], ['iron', 226, 175]]) if (canPlace(x, z, 1, 1)) addLoc(t, x, z);
  }
  function scatterNature() {
    const free = (x, z) => canPlace(x, z, 1, 1) && !over[idx(x, z)] && roofOf[idx(x, z)] < 0 && !wall[idx(x, z)];
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      const de = Math.min(x, z, H - 1 - z, (x >= 160 && z < 186) ? 99 : W - 1 - x);
      if (de <= 2) { blocked[idx(x, z)] = 1; if (de >= 1 && !isWater(x, z) && rnd() < 0.55) addLoc(under[idx(x, z)] === U.DESERT ? 'cactus' : under[idx(x, z)] === U.DARK ? 'deadtree' : 'pine', x, z); }
    }
    const nearRC = (x, z) => Math.hypot(x - 100, z - 21) < 11;
    for (let z = 3; z < H - 3; z++) for (let x = 3; x < W - 3; x++) {
      if (!free(x, z)) continue;
      const u = under[idx(x, z)], r = rnd();
      if (Math.hypot(x - 90, z - 82) < 15 || Math.hypot(x - 144, z - 81) < 13 || nearRC(x, z) || (x >= 64 && x <= 90 && z >= 6 && z <= 34) || (x >= 186 && x <= 206 && z >= 76 && z <= 96) || (x >= 126 && x <= 180 && z >= 192 && z <= 238) || (x >= 78 && x <= 110 && z >= 206 && z <= 250) || (x < 36 && z > 226) || (x >= 90 && x <= 108 && z >= 184 && z <= 198) || (x >= 16 && x <= 30 && z >= 142 && z <= 164) || Math.hypot(x - 57, z - 206) < 13 || Math.hypot(x - 130, z - 58) < 9 || (x >= 38 && x <= 66 && z >= 224 && z <= 252) || (x >= 37 && x <= 58 && z >= 146 && z <= 168) || (x >= 202 && x <= 234 && z >= 210 && z <= 252) || (x >= 85 && x <= 111 && z >= 156 && z <= 180) || (x >= 99 && x <= 117 && z >= 41 && z <= 58)) continue;
      if (x >= 64 && x <= 81 && z >= 82 && z <= 104) continue; // farm + agility
      if (x >= 103 && x <= 121 && z >= 63 && z <= 103) continue; // pens
      if (u === U.FOREST) { if (r < 0.1) addLoc('tree', x, z); else if (r < 0.125) addLoc('oak', x, z); else if (r < 0.15) addLoc('pine', x, z); else if (r < 0.17) addLoc('bush', x, z); }
      else if (u === U.GRASS) { if (r < 0.018) addLoc('tree', x, z); else if (r < 0.024) addLoc('oak', x, z); else if (r < 0.034) addLoc('flowers', x, z); else if (r < 0.04) addLoc('bush', x, z); }
      else if (u === U.DARK) { if (r < 0.04) addLoc('deadtree', x, z); else if (r < 0.05) addLoc('bonepile', x, z); }
      else if (u === U.SWAMP) { if (r < 0.06) addLoc('deadtree', x, z); else if (r < 0.1) addLoc('willow', x, z); }
      else if (u === U.SNOW) { if (r < 0.06) addLoc('pine', x, z); }
      else if (u === U.JUNGLE) { if (r < 0.06) addLoc('palm', x, z); else if (r < 0.1) addLoc('teak', x, z); else if (r < 0.12) addLoc('mahogany', x, z); else if (r < 0.16) addLoc('bush', x, z); }
      else if (u === U.DESERT) { if (r < 0.012) addLoc('cactus', x, z); else if (r < 0.016) addLoc('bonepile', x, z); }
    }
    // special trees
    for (const [x, z] of [[72, 20], [80, 14], [86, 30], [110, 26], [116, 12], [76, 32], [118, 34]]) if (free(x, z)) addLoc('maple', x, z);
    for (const [x, z] of [[112, 86], [124, 74], [128, 92], [100, 64], [134, 60]]) if (free(x, z)) addLoc('yew', x, z);
    for (const [x, z] of [[30, 26], [24, 76], [70, 152], [56, 150]]) if (free(x, z)) addLoc('magic', x, z);
    for (const [t, x, z] of [['adamantite', 12, 100], ['adamantite', 15, 103], ['runite', 9, 130], ['mithril', 20, 104], ['coal', 17, 99]]) if (free(x, z)) addLoc(t, x, z);
    for (let a = 0; a < 6.28; a += 0.5) { const x = Math.round(62 + Math.cos(a) * 11), z = Math.round(145 + Math.sin(a) * 9); if (free(x, z)) addLoc('palm', x, z); }
    for (let z = 40; z < 140; z += 3) { const cx = Math.floor(riverX(z)); for (const x of [cx + 3, cx - 4]) if (free(x, z) && rnd() < 0.6) addLoc('willow', x, z); }
  }

  // ---------- chunks ----------
  const CH = 16;
  const chunks = [];
  let scene, terrainMesh, bridgeGroup, waterTex;
  function chunkFor(x, z) {
    const cx = Math.max(0, Math.min(Math.floor(W / CH), Math.floor(x / CH))), cz = Math.max(0, Math.min(Math.floor(H / CH), Math.floor(z / CH)));
    const k = cz * 100 + cx;
    if (!chunks[k]) { const g = new THREE.Group(); g.userData.cx = cx * CH + CH / 2; g.userData.cz = cz * CH + CH / 2; chunks[k] = g; scene.add(g); }
    return chunks[k];
  }
  function updateChunks(px, pz, radius) {
    for (const g of chunks) if (g) g.visible = Math.abs(g.userData.cx - px) < radius + CH / 2 && Math.abs(g.userData.cz - pz) < radius + CH / 2;
  }

  // ---------- meshes ----------
  const roofMeshes = [];
  const pickables = [];
  function tileUnderCol(x, z) { const c = UCOL[under[idx(x, z)]], n = tileNoise[idx(x, z)]; return [c[0] * n, c[1] * n, c[2] * n]; }

  function buildTerrain() {
    for (let z = 0; z <= H; z++) for (let x = 0; x <= W; x++) {
      let h = baseH(x, z), wet = false;
      for (let dz = -1; dz <= 0; dz++) for (let dx = -1; dx <= 0; dx++) if (isLiquid(x + dx, z + dz)) wet = true;
      if (wet) h = WATER_H;
      if ((x === 36 || x === 37) && z >= 3 && z <= 168 && !wet) h -= 0.5;
      let cf = 0, cr = 0;
      for (let dz = -1; dz <= 0; dz++) for (let dx = -1; dx <= 0; dx++) { const tx = x + dx, tz = z + dz; if (!inb(tx, tz) || !inCave(tx, tz)) continue; if (under[idx(tx, tz)] === U.CAVEROCK) cr++; else cf++; }
      if (cf) h = 0.05 + Math.sin(x * 1.7 + z * 2.3) * 0.04;
      else if (cr) h = 2.6 + Math.abs(Math.sin(x * 0.9) * Math.cos(z * 1.3)) * 0.9;
      vh[z * (W + 1) + x] = h;
    }
    for (const b of buildings) {
      let s = 0, n = 0;
      for (let z = b.z0; z <= b.z1 + 1; z++) for (let x = b.x0; x <= b.x1 + 1; x++) { s += V(x, z); n++; }
      b.h = s / n;
      for (let z = b.z0; z <= b.z1 + 1; z++) for (let x = b.x0; x <= b.x1 + 1; x++) vh[z * (W + 1) + x] = b.h;
    }
    for (let i = 0; i < W * H; i++) tileNoise[i] = 0.93 + rnd() * 0.12;
    const vnorm = (x, z) => { const hl = V(Math.max(0, x - 1), z), hr = V(Math.min(W, x + 1), z), hu = V(x, Math.max(0, z - 1)), hd = V(x, Math.min(H, z + 1)); const n = new THREE.Vector3(hl - hr, 2, hu - hd); return n.normalize(); };
    const vcache = [];
    for (let z = 0; z <= H; z++) for (let x = 0; x <= W; x++) {
      let r = 0, g = 0, b = 0, n = 0;
      for (let dz = -1; dz <= 0; dz++) for (let dx = -1; dx <= 0; dx++) { if (!inb(x + dx, z + dz)) continue; const c = tileUnderCol(x + dx, z + dz); r += c[0]; g += c[1]; b += c[2]; n++; }
      vcache.push([r / n, g / n, b / n]);
    }
    const VC = (x, z) => vcache[z * (W + 1) + x];
    const TEXO = { [O.WATER]: 'water', [O.BRIDGE]: 'water', [O.PIER]: 'water', [O.WOOD]: 'planks', [O.STONE]: 'stonefloor', [O.COBBLE]: 'cobble' };
    const pos = [], col = [], nor = [];
    const tex = {}; // texture overlays
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      const o = over[idx(x, z)];
      const corners = [[x, z], [x, z + 1], [x + 1, z], [x + 1, z], [x, z + 1], [x + 1, z + 1]];
      const tname = TEXO[o];
      if (tname) {
        const T = tex[tname] || (tex[tname] = { pos: [], nor: [], uv: [] });
        for (const [cx, cz] of corners) {
          const wtr = tname === 'water';
          T.pos.push(cx, wtr ? WATER_H : V(cx, cz), cz);
          const n = wtr ? { x: 0, y: 1, z: 0 } : vnorm(cx, cz); T.nor.push(n.x, n.y, n.z);
          T.uv.push(cx / 2, cz / 2);
        }
        continue;
      }
      let oc = null;
      if (o) { const c = OCOL[o], n = tileNoise[idx(x, z)]; oc = [c[0] * n, c[1] * n, c[2] * n]; }
      for (const [cx, cz] of corners) {
        pos.push(cx, V(cx, cz), cz);
        const n = vnorm(cx, cz); nor.push(n.x, n.y, n.z);
        const c = oc || VC(cx, cz); col.push(c[0] / 255, c[1] / 255, c[2] / 255);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    terrainMesh = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true }));
    scene.add(terrainMesh);
    for (const t in tex) {
      const gg = new THREE.BufferGeometry();
      gg.setAttribute('position', new THREE.Float32BufferAttribute(tex[t].pos, 3));
      gg.setAttribute('normal', new THREE.Float32BufferAttribute(tex[t].nor, 3));
      gg.setAttribute('uv', new THREE.Float32BufferAttribute(tex[t].uv, 2));
      let m;
      if (t === 'water') { waterTex = Tex.get('water').clone(); waterTex.needsUpdate = true; m = new THREE.MeshLambertMaterial({ map: waterTex }); }
      else m = new THREE.MeshLambertMaterial({ map: Tex.get(t), color: t === 'planks' ? '#d8c0a0' : '#ffffff' });
      const tm = new THREE.Mesh(gg, m); scene.add(tm); if (t === 'water') World.waterMesh = tm;
    }
    // lava glow
    const lava = [];
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (ov(x, z) === O.LAVA) for (const [cx, cz] of [[x, z], [x, z + 1], [x + 1, z], [x + 1, z], [x, z + 1], [x + 1, z + 1]]) lava.push(cx, WATER_H + 0.02, cz);
    if (lava.length) { const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(lava, 3)); const luv = []; for (let i = 0; i < lava.length; i += 3) luv.push(lava[i] / 3, lava[i + 2] / 3); lg.setAttribute('uv', new THREE.Float32BufferAttribute(luv, 2)); lg.computeVertexNormals(); const lt = Tex.get('lava').clone(); lt.needsUpdate = true; World.lavaTex = lt; scene.add(new THREE.Mesh(lg, new THREE.MeshBasicMaterial({ map: lt }))); }
  }

  function edgeEnds(x, z, side) {
    switch (side) {
      case 'N': return [[x, z], [x + 1, z]];
      case 'S': return [[x, z + 1], [x + 1, z + 1]];
      case 'W': return [[x, z], [x, z + 1]];
      case 'E': return [[x + 1, z], [x + 1, z + 1]];
    }
  }
  function buildWalls() {
    const done = new Set();
    const WH = 1.9;
    const brick = Models.tmat('brick', '#ffffff'), plaster = Models.tmat('plaster', '#ffffff');
    for (const s of wallSegs) {
      const [[ax, az], [bx, bz]] = edgeEnds(s.x, s.z, s.side);
      const key = ax + ',' + az + ',' + bx + ',' + bz;
      if (done.has(key)) continue; done.add(key);
      const grp = chunkFor(ax, az);
      const h = Math.min(V(ax, az), V(bx, bz));
      const horiz = az === bz;
      const white = s.style === 'white';
      const stone = s.style === 'stone' || white;
      const mx = (ax + bx) / 2, mz = (az + bz) / 2;
      Models.box(horiz ? 1.0 : 0.14, white ? WH * 1.25 : WH, horiz ? 0.14 : 1.0, white ? Models.tmat('whitestone', '#ffffff') : stone ? brick : plaster, mx, h + (white ? WH * 1.25 : WH) / 2, mz, grp);
      if (!stone) {
        Models.box(horiz ? 1.02 : 0.16, 0.1, horiz ? 0.16 : 1.02, '#5a3a1e', mx, h + WH - 0.05, mz, grp);
        Models.box(horiz ? 1.02 : 0.16, 0.1, horiz ? 0.16 : 1.02, '#5a3a1e', mx, h + 0.05, mz, grp);
        if ((s.x + s.z) % 2) { const d = Models.box(horiz ? 0.08 : 0.16, WH * 1.05, horiz ? 0.16 : 0.08, '#5a3a1e', mx, h + WH / 2, mz, grp); d.rotation[horiz ? 'z' : 'x'] = 0.5; }
      } else Models.box(horiz ? 1.02 : 0.18, 0.12, horiz ? 0.18 : 1.02, '#6e695e', mx, h + 0.06, mz, grp);
      if (((s.x * 7 + s.z * 13) % 3) === 0) {
        Models.box(horiz ? 0.4 : 0.17, 0.46, horiz ? 0.17 : 0.4, '#1a1c22', mx, h + 1.1, mz, grp);
        Models.box(horiz ? 0.04 : 0.18, 0.46, horiz ? 0.18 : 0.04, '#5a3a1e', mx, h + 1.1, mz, grp);
      }
      for (const [px, pz] of [[ax, az], [bx, bz]]) {
        const pk = 'p' + px + ',' + pz; if (done.has(pk)) continue; done.add(pk);
        Models.box(0.2, WH + 0.02, 0.2, stone ? '#7a7468' : '#5a3a1e', px, h + WH / 2, pz, grp);
      }
    }
    // door frames
    for (const b of buildings) for (const d of b.doors) {
      const [[ax, az], [bx, bz]] = edgeEnds(d.x, d.z, d.s);
      const grp = chunkFor(ax, az);
      const horiz = az === bz;
      Models.box(horiz ? 1.0 : 0.16, 0.3, horiz ? 0.16 : 1.0, b.style === 'stone' ? Models.tmat('brick', '#ffffff') : '#5a3a1e', (ax + bx) / 2, b.h + 1.75, (az + bz) / 2, grp);
    }
    for (const s of fenceSegs) {
      const [[ax, az], [bx, bz]] = edgeEnds(s.x, s.z, s.side);
      const key = 'f' + ax + ',' + az + ',' + bx + ',' + bz;
      if (done.has(key)) continue; done.add(key);
      const grp = chunkFor(ax, az);
      const ha = V(ax, az), hb = V(bx, bz), horiz = az === bz;
      for (const [px, pz, ph] of [[ax, az, ha], [bx, bz, hb]]) { const pk = 'fp' + px + ',' + pz; if (done.has(pk)) continue; done.add(pk); Models.box(0.09, 0.8, 0.09, '#6b4a2a', px, ph + 0.4, pz, grp); }
      for (const y of [0.35, 0.65]) {
        const r = Models.box(horiz ? 1.0 : 0.05, 0.07, horiz ? 0.05 : 1.0, '#7a5530', (ax + bx) / 2, (ha + hb) / 2 + y, (az + bz) / 2, grp);
        if (horiz) r.rotation.z = Math.atan2(hb - ha, 1); else r.rotation.x = -Math.atan2(hb - ha, 1);
      }
    }
  }

  function buildRoofs() {
    for (const b of buildings) {
      const x0 = b.x0 - 0.2, x1 = b.x1 + 1.2, z0 = b.z0 - 0.2, z1 = b.z1 + 1.2;
      const base = b.h + 1.9;
      const alongX = (x1 - x0) >= (z1 - z0);
      const span = alongX ? (z1 - z0) : (x1 - x0);
      const peak = base + span * 0.42;
      const verts = [], uvs = [];
      const q = (a, b2, c, d) => { verts.push(...a, ...b2, ...c, ...a, ...c, ...d); };
      const t = (a, b2, c) => verts.push(...a, ...b2, ...c);
      if (alongX) {
        const zm = (z0 + z1) / 2;
        q([x0, base, z1], [x1, base, z1], [x1, peak, zm], [x0, peak, zm]);
        q([x1, base, z0], [x0, base, z0], [x0, peak, zm], [x1, peak, zm]);
        t([x0, base, z0], [x0, base, z1], [x0, peak, zm]); t([x1, base, z1], [x1, base, z0], [x1, peak, zm]);
      } else {
        const xm = (x0 + x1) / 2;
        q([x0, base, z0], [x0, base, z1], [xm, peak, z1], [xm, peak, z0]);
        q([x1, base, z1], [x1, base, z0], [xm, peak, z0], [xm, peak, z1]);
        t([x1, base, z0], [x0, base, z0], [xm, peak, z0]); t([x0, base, z1], [x1, base, z1], [xm, peak, z1]);
      }
      for (let i = 0; i < verts.length; i += 3) { const x = verts[i], y = verts[i + 1], z = verts[i + 2]; uvs.push((alongX ? x : z) / 1.5, (y - base) * 1.6 + (alongX ? 0 : 0)); }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      g.computeVertexNormals();
      const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: Tex.get(b.roof), flatShading: true, side: THREE.DoubleSide }));
      chunkFor(b.x0, b.z0).add(m);
      roofMeshes.push(m);
    }
  }

  function buildBridge() {
    if (bridgeGroup) bridgeGroup.parent.remove(bridgeGroup);
    bridgeGroup = new THREE.Group();
    let minX = 999, maxX = 0;
    for (const [x] of bridgeTiles) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
    const mid = Math.floor((minX + maxX) / 2);
    const pl = Models.tmat('planks', '#ffffff');
    for (let x = minX - 1; x <= maxX + 1; x++) {
      if (!bridgeOpen && (x === mid || x === mid + 1)) continue;
      const p = Models.box(1.0, 0.08, 2.2, pl, x + 0.5, 0.02, 81, bridgeGroup);
      if (!bridgeOpen && (x === mid - 1 || x === mid + 2)) p.rotation.x = 0.25;
      for (const zz of [79.95, 82.05]) { Models.box(0.08, 0.6, 0.08, '#5a3a1e', x + 0.5, 0.3, zz, bridgeGroup); Models.box(1.0, 0.07, 0.06, '#6b4a2a', x + 0.5, 0.55, zz, bridgeGroup); }
    }
    chunkFor(minX, 80).add(bridgeGroup);
  }
  function buildPier() {
    const pl = Models.tmat('planks', '#ffffff');
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      if (ov(x, z) !== O.PIER) continue;
      const g = chunkFor(x, z);
      Models.box(1.0, 0.1, 1.0, pl, x + 0.5, 0.0, z + 0.5, g);
      if ((x + z) % 2 === 0) Models.box(0.16, 1.2, 0.16, '#4a3018', x + 0.5, -0.4, z + 0.5, g);
    }
  }
  function setBridgeOpen(v) { bridgeOpen = v; if (scene) buildBridge(); }

  // ---------- loc meshes ----------
  function locModel(loc) {
    const r = () => rnd();
    const t = loc.type;
    if (TREES[t] || ['pine', 'deadtree', 'palm', 'cactus', 'banana'].includes(t)) return Models.tree(t, r);
    if (ROCKS[t]) return Models.rock(t, r);
    if (t.startsWith('rc_')) return Models.runeAltar(t.slice(3));
    if (t.startsWith('agility')) { const a = AG[+t.slice(7)]; const m = Models.agility(a.model); if (a.rot) m.rotation.y = Math.PI / 2; const wrap = new THREE.Group(); wrap.add(m); return wrap; }
    switch (t) {
      case 'essence': return Models.essenceRock();
      case 'guild_door': return Models.guildDoor();
      case 'portal': return Models.portal();
      case 'fairy_ring': return Models.fairyRing();
      case 'trade_board': return Models.board();
      case 'sos_entrance': return Models.dungeon('hole');
      case 'trapdoor': return Models.dungeon('trapdoor');
      case 'ladder_up': return Models.dungeon('ladder');
      case 'ladder_down': return Models.dungeon('ladder_down');
      case 'sos_gate': return Models.dungeon('gate');
      case 'sos_gift': case 'sos_box': return Models.dungeon('chest');
      case 'sos_grain': { const g = Models.dungeon('chest'); g.scale.set(1, 0.8, 1); return g; }
      case 'sos_cradle': return Models.dungeon('cradle');
      case 'stalagmite': return Models.dungeon('stalagmite');
      case 'cave_torch': return Models.dungeon('torch');
      case 'wild_ditch': return Models.dungeon('ditch');
      case 'gravestone': return Models.dungeon('gravestone');
      case 'warn_sign': return Models.dungeon('warnsign');
      case 'chaos_altar': { const a = Models.altar(); a.traverse(o => { if (o.material && o.material.color) { o.material = o.material.clone(); o.material.color.multiplyScalar(0.45); } }); return a; }
      case 'gnome_hut': return Models.gnomeHut();
      case 'goblin_hut': return Models.gnomeHut('#8a6a3a');
      case 'grand_tree': return Models.grandTree();
      case 'spirit_tree': return Models.spiritTree();
      case 'gem_stall': return Models.stall('#8040c0');
      case 'fishing_spot': return Models.fishingSpot();
      case 'furnace': return Models.furnace();
      case 'anvil': return Models.anvil();
      case 'range': return Models.range();
      case 'bank_booth': return Models.bankBooth();
      case 'altar': return Models.altar();
      case 'fountain': return Models.fountain();
      case 'well': return Models.well();
      case 'fire': return Models.fire();
      case 'crate': return Models.crate();
      case 'barrel': return Models.barrel();
      case 'signpost': return Models.signpost();
      case 'lamp': return Models.lamp();
      case 'flowers': return Models.flowers(r);
      case 'bush': return Models.bush(r);
      case 'bonepile': return Models.bones();
      case 'bakery_stall': return Models.stall('#c04040');
      case 'silk_stall': return Models.stall('#4060c0');
      case 'spinning_wheel': return Models.spinningWheel();
      case 'flax': return Models.flaxPlant(r);
      case 'allotment': case 'herbpatch': { const p = loc.patch || { state: 'weeds', stage: 3 }; return Models.patch(loc.w, loc.d, p.state, p.crop, p.stage); }
      case 'tent': return Models.tent('#7a2a1e');
      case 'boat': return Models.boat();
      case 'snare': case 'boxtrap': return Models.trap(loc.type, loc.caught ? 'caught' : 'set');
    }
    return new THREE.Group();
  }
  function spawnLocMesh(loc) {
    const m = locModel(loc);
    const cx = loc.x + loc.w / 2, cz = loc.z + loc.d / 2;
    m.position.set(cx, heightAt(cx, cz), cz);
    if (loc.type === 'fishing_spot') m.position.y = WATER_H + 0.02;
    if (loc.type === 'boat') m.position.y = WATER_H;
    if (loc.rot) m.rotation.y = -loc.rot * Math.PI / 2;
    if (loc.type.startsWith('agility') && loc.w > loc.d && loc.type !== 'agility0' && loc.type !== 'agility3') m.rotation.y = Math.PI / 2;
    if ((loc.type === 'agility1' || loc.type === 'agility2' || loc.type === 'agility4')) m.rotation.y = 0;
    if (loc.type === 'agility4') m.rotation.y = Math.PI / 2;
    m.userData.ent = loc;
    loc.mesh = m;
    const grp = chunkFor(loc.x, loc.z);
    if (TREES[loc.type]) { const st = Models.stump(loc.type); st.position.copy(m.position); st.visible = false; st.userData.ent = loc; loc.stump = st; grp.add(st); pickables.push(st); }
    grp.add(m);
    if (!loc.def.deco) pickables.push(m);
  }
  function addLocLive(type, x, z, opts) { const loc = addLoc(type, x, z, opts); spawnLocMesh(loc); return loc; }
  function removeLocLive(loc) {
    removeLoc(loc);
    for (const m of [loc.mesh, loc.stump]) { if (!m) continue; const i = pickables.indexOf(m); if (i >= 0) pickables.splice(i, 1); if (m.parent) m.parent.remove(m); }
  }
  function refreshLoc(loc) {
    for (const m of [loc.mesh]) { const i = pickables.indexOf(m); if (i >= 0) pickables.splice(i, 1); if (m.parent) m.parent.remove(m); }
    spawnLocMesh(loc);
  }

  function build(sc) {
    scene = sc;
    design();
    placeStructures();
    buildCave();
    scatterNature();
    const spots = [];
    for (let z = 50; z < 76; z++) { const cx = riverX(z); const x = Math.floor(cx + 1.4); if (isWater(x, z) && !isWater(x + 1, z) && ov(x, z) === O.WATER) spots.push([x, z, 'river']); }
    for (let z = 42; z < 53; z++) for (let x = 73; x < 78; x++) if (ov(x, z) === O.WATER && !isWater(x + 1, z)) spots.push([x, z, 'river']);
    for (let z = 64; z < 100; z += 2) spots.push([160, z, 'coast']);
    for (let x = 161; x < 171; x++) for (const z of [81, 84]) spots.push([x, z, 'sea']);
    for (let x = 177; x < 186; x++) for (const z of [85, 88]) if (ov(x, z) === O.WATER) spots.push([x, z, 'sea']);
    for (let z = 70; z < 110; z += 3) for (let x = 182; x < 192; x++) if (ov(x, z) === O.WATER && !isWater(x + 1, z)) { spots.push([x, z, 'coast']); break; }
    for (let z = 190; z < 262; z += 2) { const x = Math.floor(riverLum(z) + 1.3); if (ov(x, z) === O.WATER && !isWater(x + 1, z)) spots.push([x, z, z % 4 ? 'river' : 'coast']); }
    for (let z = 138; z < 153; z++) for (let x = 50; x < 75; x++) if (ov(x, z) === O.WATER && !isWater(x + 1, z) && Math.abs(z - 145) < 6) spots.push([x, z, 'river']);
    for (let z = 226; z < 252; z += 2) if (ov(34, z) === O.WATER) spots.push([34, z, z % 4 ? 'coast' : 'river']);
    for (let z = 44; z < 52; z++) for (let x = 64; x < 72; x++) if (ov(x, z) === O.WATER && !isWater(x - 1, z)) spots.push([x, z, 'river']);
    for (let z = 60; z < 120; z += 4) for (let x = 230; x > 215; x--) if (ov(x, z) === O.WATER && !isWater(x - 1, z)) { spots.push([x, z, 'sea']); break; }
    World.fishTiles = spots;
    const want = { river: 22, coast: 20, sea: 14 };
    for (const k in want) for (let i = 0; i < want[k]; i++) { const pool = spots.filter(s => s[2] === k); if (!pool.length) break; const s = pool[Math.floor(rnd() * pool.length)]; spots.splice(spots.indexOf(s), 1); addLoc('fishing_spot', s[0], s[1], { kind: k }); }
    buildTerrain();
    buildWalls();
    buildRoofs();
    buildBridge();
    buildPier();
    for (const loc of locs) spawnLocMesh(loc);
  }

  // ---------- movement / pathfinding ----------
  function walkable(x, z) {
    if (!inb(x, z) || blocked[idx(x, z)]) return false;
    const o = over[idx(x, z)];
    if (o === O.WATER || o === O.LAVA) return false;
    if (o === O.BRIDGE) return bridgeOpen;
    return true;
  }
  function edgeOpen(x, z, dx, dz) {
    const w = wall[idx(x, z)];
    if (dx === 1) return !(w & 2); if (dx === -1) return !(w & 8);
    if (dz === 1) return !(w & 4); return !(w & 1);
  }
  function canStep(x, z, dx, dz) {
    if (!walkable(x + dx, z + dz)) return false;
    if (dx !== 0 && dz !== 0) return canStep(x, z, dx, 0) && canStep(x, z, 0, dz) && canStep(x + dx, z, 0, dz) && canStep(x, z + dz, dx, 0);
    return edgeOpen(x, z, dx, dz);
  }
  const DIRS = [[-1, 0], [1, 0], [0, 1], [0, -1], [-1, 1], [1, 1], [-1, -1], [1, -1]];
  const prev = new Int32Array(W * H), dist = new Int32Array(W * H), q = new Int32Array(W * H);
  // BFS limited to a 128x128 region around the start (like the original client)
  function findPath(sx, sz, isGoal, tx, tz) {
    const R = 64;
    const x0 = Math.max(0, sx - R), x1 = Math.min(W - 1, sx + R), z0 = Math.max(0, sz - R), z1 = Math.min(H - 1, sz + R);
    for (let z = z0; z <= z1; z++) dist.fill(-1, idx(x0, z), idx(x1, z) + 1);
    let qh = 0, qt = 0;
    const s = idx(sx, sz);
    dist[s] = 0; q[qt++] = s;
    let found = -1;
    if (isGoal(sx, sz)) return [];
    while (qh < qt) {
      const c = q[qh++];
      const cx = c % W, cz = (c / W) | 0;
      for (const [dx, dz] of DIRS) {
        const nx = cx + dx, nz = cz + dz;
        if (nx < x0 || nx > x1 || nz < z0 || nz > z1) continue;
        const n = idx(nx, nz);
        if (dist[n] >= 0 || !canStep(cx, cz, dx, dz)) continue;
        dist[n] = dist[c] + 1; prev[n] = c; q[qt++] = n;
        if (isGoal(nx, nz)) { found = n; break; }
      }
      if (found >= 0) break;
    }
    if (found < 0) {
      let best = -1, bd = 1e9, bl = 1e9;
      for (let z = Math.max(z0, tz - 10); z <= Math.min(z1, tz + 10); z++) for (let x = Math.max(x0, tx - 10); x <= Math.min(x1, tx + 10); x++) {
        const n = idx(x, z); if (dist[n] < 0) continue;
        const d = (x - tx) * (x - tx) + (z - tz) * (z - tz);
        if (d < bd || (d === bd && dist[n] < bl)) { bd = d; bl = dist[n]; best = n; }
      }
      if (best < 0) {
        // nothing near the target: head for the reachable tile that gets closest to it
        for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) {
          const n = idx(x, z); if (dist[n] < 0) continue;
          const d = (x - tx) * (x - tx) + (z - tz) * (z - tz);
          if (d < bd || (d === bd && dist[n] < bl)) { bd = d; bl = dist[n]; best = n; }
        }
      }
      if (best < 0 || best === s) return null;
      found = best;
    }
    const path = [];
    let c = found;
    while (c !== s && c >= 0) { path.push([c % W, (c / W) | 0]); c = prev[c]; }
    path.reverse();
    return path;
  }
  function adjacentTo(px, pz, rx, rz, rw, rd) {
    for (let j = 0; j < rd; j++) for (let i = 0; i < rw; i++) {
      const tx = rx + i, tz = rz + j;
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (px === tx + dx && pz === tz + dz && inb(px, pz) && edgeOpen(px, pz, -dx, -dz)) return true;
    }
    return false;
  }
  function roofAt(x, z) { return inb(x, z) ? roofOf[idx(x, z)] : -1; }
  function minimapColor(x, z) {
    const o = over[idx(x, z)];
    if (o === O.BRIDGE) return bridgeOpen ? [120, 86, 50] : OCOL[2];
    if (o === O.PIER) return [120, 86, 50];
    if (inCave(x, z) && under[idx(x, z)] === U.CAVEROCK) return [14, 12, 10];
    const c = o ? OCOL[o] : UCOL[under[idx(x, z)]];
    const n = tileNoise[idx(x, z)];
    return [Math.min(255, c[0] * n * 1.05), Math.min(255, c[1] * n * 1.05), Math.min(255, c[2] * n * 1.05)];
  }
  // ray-march the heightfield (fast tile picking)
  function rayTile(origin, dir) {
    let t = 0;
    for (let i = 0; i < 600; i++) {
      t += 0.08;
      const x = origin.x + dir.x * t, y = origin.y + dir.y * t, z = origin.z + dir.z * t;
      if (x < 0 || z < 0 || x >= W || z >= H) { if (t > 60) break; continue; }
      if (y <= heightAt(x, z)) return [Math.floor(x), Math.floor(z)];
    }
    return null;
  }

  return {
    W, H, OX, OZ, WATER_H, SPAWN, NPC_SPAWNS, build, heightAt, walkable, canStep, findPath, adjacentTo, roofAt, locs, buildings, roofMeshes,
    pickables, wallSegs, fenceSegs, mapIcons, labels, minimapColor, edgeEnds, LOCDEF, AG, addLocLive, removeLocLive, refreshLoc, canPlace,
    setBridgeOpen, get bridgeOpen() { return bridgeOpen; }, isWater, locAt: (x, z) => inb(x, z) ? locAt[idx(x, z)] : null,
    rnd, inb, riverX, updateChunks, rayTile, get waterTex() { return waterTex; }, chunkFor,
  };
})();
