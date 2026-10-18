// ===== Game logic: 600ms ticks, all skills, combat (melee/ranged/magic), quests, interfaces =====
const Game = (() => {
  const now = () => performance.now();
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const S = {
    tick: 0, lastTick: 0, name: 'Player', scene: null,
    skills: {}, inv: new Array(28).fill(null), equip: {}, ammoQty: 0, bank: [],
    quests: {}, questPoints: 0, slayer: null, agilityNext: 0,
    style: 0, autoRetaliate: true, autocast: null, spellSel: null, prayers: {}, settings: { brightness: 2 },
    messages: [], dialog: null, iface: null, selected: -1,
    npcs: [], ground: [], traps: [], player: null, shops: {}, levelFx: [], patches: {},
    loggedIn: false,
  };
  for (const q of QUESTS) S.quests[q.id] = 0;

  function msg(text, color) { S.messages.push({ text, color: color || '#000000', t: now() }); if (S.messages.length > 120) S.messages.shift(); }

  // ---------- skills ----------
  const lvl = id => levelForXp(S.skills[id].xp);
  const cur = id => S.skills[id].cur;
  function combatLevel() {
    const base = 0.25 * (lvl('defence') + lvl('hitpoints') + Math.floor(lvl('prayer') / 2));
    const melee = 0.325 * (lvl('attack') + lvl('strength'));
    const range = 0.325 * Math.floor(lvl('ranged') * 1.5);
    const mage = 0.325 * Math.floor(lvl('magic') * 1.5);
    return Math.floor(base + Math.max(melee, range, mage));
  }
  const totalLevel = () => SKILLS.reduce((s, k) => s + lvl(k), 0);
  function addXp(id, amt) {
    const before = lvl(id);
    S.skills[id].xp = Math.min(200000000, S.skills[id].xp + amt);
    const after = lvl(id);
    if (after > before) {
      S.skills[id].cur += after - before;
      const name = SKILL_NAMES[id], an = /^[AEIOU]/.test(name) ? 'an' : 'a';
      msg(`Congratulations, you just advanced ${an} ${name} level.`);
      S.dialog = { kind: 'levelup', skill: id, lines: [`Congratulations, you just advanced ${an} ${name} level.`, `Your ${name} level is now ${after}.`] };
      S.levelFx.push({ t: now() });
      Sfx.levelUp();
    }
  }

  // ---------- inventory ----------
  function invCount(id) { let n = 0; for (const s of S.inv) if (s && s.id === id) n += s.qty; return n; }
  const has = id => invCount(id) > 0;
  const freeSlots = () => S.inv.filter(s => !s).length;
  function invAdd(id, qty) {
    qty = qty || 1;
    if (ITEMS[id].stackable) {
      const s = S.inv.find(s => s && s.id === id);
      if (s) { s.qty += qty; return true; }
      const i = S.inv.indexOf(null); if (i < 0) return false;
      S.inv[i] = { id, qty }; return true;
    }
    if (freeSlots() < qty) return false;
    for (let k = 0; k < qty; k++) S.inv[S.inv.indexOf(null)] = { id, qty: 1 };
    return true;
  }
  function invRemove(id, qty) {
    qty = qty || 1;
    for (let i = 0; i < 28 && qty > 0; i++) {
      const s = S.inv[i]; if (!s || s.id !== id) continue;
      const take = Math.min(qty, s.qty); s.qty -= take; qty -= take;
      if (s.qty <= 0) S.inv[i] = null;
    }
    return qty === 0;
  }
  function invAddOrDrop(id, qty) { if (!invAdd(id, qty)) { dropGround(id, qty, S.player.x, S.player.z); msg('Your inventory is full, so the item drops to the floor.'); } }

  // ---------- equipment ----------
  function bonuses() {
    const b = { att: 0, str: 0, def: 0, rng: 0, rstr: 0, mag: 0 };
    for (const k of EQUIP_SLOTS) { const id = S.equip[k]; if (!id) continue; const e = ITEMS[id].equip; for (const s in b) b[s] += e[s] || 0; }
    return b;
  }
  const weaponDef = () => S.equip.weapon ? ITEMS[S.equip.weapon] : null;
  const weaponKind = () => { const w = weaponDef(); return w ? (w.equip.kind || 'melee') : 'melee'; };
  const weaponSpeed = () => { const w = weaponDef(); return (w ? w.equip.speed || 4 : 4) - (weaponKind() === 'bow' && S.style === 1 ? 1 : 0); };
  const weaponType = () => { const w = weaponDef(); return w ? w.icon.t : 'unarmed'; };
  const STYLE_NAMES = {
    unarmed: ['Punch', 'Kick', 'Block'], dagger: ['Stab', 'Lunge', 'Block'], sword: ['Stab', 'Slash', 'Block'],
    scimitar: ['Chop', 'Slash', 'Block'], axe: ['Chop', 'Hack', 'Block'], pickaxe: ['Spike', 'Impale', 'Block'],
    bow: ['Accurate', 'Rapid', 'Longrange'], staff: ['Bash', 'Pound', 'Focus'],
  };
  const styleNames = () => STYLE_NAMES[weaponType()] || STYLE_NAMES.sword;
  function equipItem(slot) {
    const it = S.inv[slot]; if (!it) return;
    const def = ITEMS[it.id], e = def.equip;
    for (const k in e.req) if (lvl(k) < e.req[k]) { msg(`You need a${/^[AEIOU]/.test(SKILL_NAMES[k]) ? 'n' : ''} ${SKILL_NAMES[k]} level of ${e.req[k]} to wear this.`); return; }
    if (e.slot === 'ammo') {
      if (S.equip.ammo === it.id) { S.ammoQty += it.qty; S.inv[slot] = null; return; }
      const old = S.equip.ammo, oq = S.ammoQty;
      S.equip.ammo = it.id; S.ammoQty = it.qty; S.inv[slot] = null;
      if (old) invAddOrDrop(old, oq);
      return;
    }
    const old = S.equip[e.slot];
    S.equip[e.slot] = it.id;
    S.inv[slot] = old ? { id: old, qty: 1 } : null;
    if (e.slot === 'weapon') { S.style = Math.min(S.style, 2); if (e.kind !== 'staff') S.autocast = null; }
    Models.applyEquipment(S.player.model, S.equip);
    Sfx.play('equip');
  }
  function unequip(slotName) {
    const id = S.equip[slotName]; if (!id) return;
    if (!invAdd(id, slotName === 'ammo' ? S.ammoQty : 1)) { msg('You don\'t have enough free inventory space to do that.'); return; }
    delete S.equip[slotName];
    if (slotName === 'ammo') S.ammoQty = 0;
    if (slotName === 'weapon') S.autocast = null;
    Models.applyEquipment(S.player.model, S.equip);
  }

  // ---------- prayer ----------
  function prayerMult(key) { let m = 1; for (const p of PRAYERS) if (S.prayers[p.id] && p[key]) m = Math.max(m, p[key]); return m; }
  function togglePrayer(p) {
    if (S.prayers[p.id]) { delete S.prayers[p.id]; Sfx.play('prayoff'); return; }
    if (lvl('prayer') < p.level) { msg(`You need a Prayer level of ${p.level} to use ${p.name}.`); return; }
    if (cur('prayer') < 1) { msg('You have run out of Prayer points, you can recharge at an altar.'); return; }
    for (const q of PRAYERS) if (q !== p && ((p.att && q.att) || (p.str && q.str) || (p.def && q.def))) delete S.prayers[q.id];
    S.prayers[p.id] = true;
    Sfx.play('prayon');
  }

  // ---------- regions ----------
  function region(x, z) {
    if (x < 36) return 'wilderness';
    if (z > 130 + Math.sin(x * 0.2) * 3) return 'desert';
    if (x >= 124 && z < 52) return 'swamp';
    if (z < 41 && x >= 36 && x < 124) return 'elderwood';
    return 'mainland';
  }
  const wildLevel = (x) => x < 36 ? Math.floor((36 - x) / 2) + 1 : 0;

  // ---------- entities ----------
  function makeEntity(o) { return Object.assign({ x: 0, z: 0, path: [], from: null, steps: [], face: 0, anim: null, loop: null, splats: [], hpBarUntil: 0, overhead: null }, o); }
  function setAnim(e, name) { e.anim = { name, t0: now() }; }
  function say(e, text) { e.overhead = { text, until: now() + 3000 }; }

  function initPlayer() {
    const p = makeEntity({ isPlayer: true, x: World.SPAWN.x, z: World.SPAWN.z, run: false, energy: 100, pending: null, combat: null, attackTimer: 0, task: null, stun: 0, eatDelay: 0, dead: 0, forced: null });
    p.model = Models.humanoid({ skin: '#c8915c', hair: '#5a3418', shirt: '#4a6aa0', pants: '#5a4430', boots: '#3a2a1a', hairStyle: 1 });
    S.scene.add(p.model);
    S.player = p;
  }

  function spawnNpc(id, x, z) {
    const def = NPCS[id];
    const n = makeEntity({ isNpc: true, id, def, x, z, sx: x, sz: z, hp: def.hp || 1, dead: false, deathAt: 0, respawnAt: 0, target: null, attackTimer: 0, wanderGoal: null });
    n.model = Models.npcModel(def.model);
    n.model.userData.ent = n;
    n.face = Math.random() * 6;
    S.scene.add(n.model);
    World.pickables.push(n.model);
    S.npcs.push(n);
    return n;
  }

  // ---------- ground items ----------
  function dropGround(id, qty, x, z, ticks) {
    if (ITEMS[id].stackable) {
      const g = S.ground.find(g => g.id === id && g.x === x && g.z === z);
      if (g) { g.qty += qty; g.until = S.tick + (ticks || 200); return g; }
    }
    const g = { id, qty, x, z, until: S.tick + (ticks || 200) };
    g.mesh = Render.groundMesh(g);
    S.ground.push(g);
    return g;
  }
  function removeGround(g) { const i = S.ground.indexOf(g); if (i >= 0) S.ground.splice(i, 1); if (g.mesh && g.mesh.parent) g.mesh.parent.remove(g.mesh); }

  // ---------- reach ----------
  function locReach(p, loc) {
    const ag = loc.def.agility;
    if (ag) return p.x === ag.start[0] && p.z === ag.start[1];
    if (loc.type === 'fire' || loc.type === 'snare' || loc.type === 'boxtrap' || loc.type === 'flax') return World.adjacentTo(p.x, p.z, loc.x, loc.z, 1, 1) || (p.x === loc.x && p.z === loc.z);
    if (loc.type === 'fishing_spot') return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => p.x === loc.x + dx && p.z === loc.z + dz);
    return World.adjacentTo(p.x, p.z, loc.x, loc.z, loc.w, loc.d);
  }
  const npcReach = (p, n) => World.adjacentTo(p.x, p.z, n.x, n.z, 1, 1);
  const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.z - b.z));
  function pathTo(goalFn, tx, tz) { const p = S.player; const path = World.findPath(p.x, p.z, goalFn, tx, tz); p.path = path || []; return path; }
  const pathToLoc = loc => pathTo((x, z) => locReach({ x, z }, loc), loc.x, loc.z);
  const pathToNpc = n => pathTo((x, z) => npcReach({ x, z }, n), n.x, n.z);

  // ---------- commands ----------
  function stopTask() { const p = S.player; p.task = null; p.loop = null; Models.setHeldTool(p.model, null); }
  function resetActions() {
    const p = S.player;
    p.pending = null; p.combat = null; p.castOnce = null;
    stopTask();
    S.dialog = null; S.iface = null;
  }
  function busy() { const p = S.player; return p.dead || p.forced; }
  function walkTo(x, z) {
    const p = S.player;
    if (busy()) return;
    if (p.stun) { msg('You\'re stunned!'); return; }
    resetActions();
    pathTo((a, b) => a === x && b === z, x, z);
  }
  function interact(kind, ent, op, useSlot) {
    const p = S.player;
    if (busy()) return;
    if (p.stun) { msg('You\'re stunned!'); return; }
    resetActions();
    S.selected = -1;
    if (kind === 'npc' && op === 'Attack') { startCombat(ent); return; }
    p.pending = { kind, ent, op, useSlot };
    if (kind === 'loc') pathToLoc(ent);
    else if (kind === 'npc') pathToNpc(ent);
    else if (kind === 'ground') pathTo((x, z) => x === ent.x && z === ent.z, ent.x, ent.z);
  }
  function castOn(n, spell) {
    if (busy()) return;
    resetActions();
    S.spellSel = null;
    if (!canCast(spell, true)) return;
    S.player.castOnce = spell;
    startCombat(n, true);
  }
  function startCombat(n, keepCast) {
    const p = S.player;
    if (n.dead) return;
    if (!n.def.hp) return;
    if (n.target && n.target !== p) { msg('Someone else is fighting that.'); return; }
    p.combat = n;
    const mode = attackMode();
    if (mode.type === 'melee') pathToNpc(n);
  }

  function pendingReached() {
    const p = S.player, pe = p.pending;
    if (pe.kind === 'loc') return locReach(p, pe.ent);
    if (pe.kind === 'npc') return npcReach(p, pe.ent);
    if (pe.kind === 'ground') return p.x === pe.ent.x && p.z === pe.ent.z;
    return false;
  }
  function facePos(e, x, z) { e.face = Math.atan2(x - (e.x + 0.5), z - (e.z + 0.5)); }
  function faceEnt(e, t) { facePos(e, t.w ? t.x + t.w / 2 : t.x + 0.5, t.d ? t.z + t.d / 2 : t.z + 0.5); }
  function processPending() {
    const p = S.player, pe = p.pending;
    if (!pe) return;
    if ((pe.kind === 'npc' && pe.ent.dead) || (pe.kind === 'loc' && World.locs.indexOf(pe.ent) < 0) || (pe.kind === 'ground' && S.ground.indexOf(pe.ent) < 0)) { p.pending = null; return; }
    if (pendingReached()) {
      p.path = []; p.pending = null;
      if (pe.kind !== 'ground' && !pe.ent.def.agility) faceEnt(p, pe.ent);
      execute(pe);
      return;
    }
    if (p.path.length === 0) {
      if (pe.kind === 'npc') { if (!pathToNpc(pe.ent) || !p.path.length) { p.pending = null; msg('I can\'t reach that!'); } }
      else { p.pending = null; msg('I can\'t reach that!'); }
    } else if (pe.kind === 'npc' && S.tick % 2 === 0) pathToNpc(pe.ent);
  }
  function execute(pe) {
    if (pe.useSlot != null) return useItemOn(pe.useSlot, pe.kind, pe.ent);
    if (pe.kind === 'ground') return takeGround(pe.ent);
    if (pe.kind === 'loc') return locAction(pe.ent, pe.op);
    if (pe.kind === 'npc') return npcAction(pe.ent, pe.op);
  }
  function takeGround(g) {
    if (!invAdd(g.id, g.qty)) { msg('You don\'t have enough inventory space to hold that item.'); return; }
    removeGround(g); setAnim(S.player, 'pickup'); Sfx.play('pickup');
  }
  function bestTool(kind) {
    let best = null;
    const cands = S.inv.filter(Boolean).map(s => s.id);
    if (S.equip.weapon) cands.push(S.equip.weapon);
    for (const id of cands) { const t = ITEMS[id].tool; if (t && t[kind] && (!best || t.power > ITEMS[best].tool.power)) best = id; }
    return best;
  }
  function startLoop(name, tool, interval, fn, first) {
    const p = S.player;
    p.loop = name; p.loopStart = now();
    Models.setHeldTool(p.model, tool || null);
    p.task = { timer: first || interval, interval, fn };
  }
  function options(title, opts) { S.dialog = { kind: 'options', title, options: opts.concat([{ text: 'Nothing.', fn: () => { } }]).slice(0, 7) }; }

  // ---------- locations ----------
  function locOps(loc) {
    if (loc.patch) {
      const st = loc.patch.state;
      if (st === 'weeds') return ['Rake', 'Inspect'];
      if (st === 'ready') return [loc.type === 'herbpatch' ? 'Pick' : 'Harvest', 'Inspect'];
      return ['Inspect'];
    }
    return loc.def.ops;
  }
  function locAction(loc, op) {
    const p = S.player, T = loc.type;
    if (op === 'Read') { msg('North: Elderwood & the Runestone Circle. South: Ardenvale Mine, Al Kharid.'); msg('East: Port Sarrow. West: The Old Bridge & the Wilderness (beware!).'); return; }
    if (op === 'Prospect') {
      if (loc.depletedUntil > S.tick) { msg('There is currently no ore available in this rock.'); return; }
      msg('You examine the rock for ores...'); setTimeout(() => msg(`This rock contains ${ITEMS[ROCKS[T].ore].name.replace(' ore', '').toLowerCase()}.`), 1200); return;
    }
    if (loc.def.agility) return doAgility(loc.def.agility);
    if (TREES[T]) return woodcut(loc);
    if (ROCKS[T]) return mine(loc);
    if (T === 'essence') {
      const pick = bestTool('mine');
      if (!pick) { msg('You need a pickaxe to mine this rock.'); return; }
      msg('You swing your pick at the rock.');
      startLoop('mine', pick, 3, () => {
        if (!freeSlots()) { msg('Your inventory is too full to hold any more essence.'); return false; }
        invAdd('rune_essence'); addXp('mining', 5); Sfx.play('mine'); return true;
      });
      return;
    }
    if (loc.def.rune) return craftRunes(loc);
    if (T === 'fishing_spot') {
      if (!has('small_net')) { msg('You need a net to catch these fish.'); return; }
      if (!freeSlots()) { msg('You can\'t carry any more fish.'); return; }
      msg('You cast out your net...');
      startLoop('fish', 'small_net', 5, () => {
        if (World.locs.indexOf(loc) < 0 || !locReach(p, loc)) return false;
        if (!freeSlots()) { msg('You can\'t carry any more fish.'); return false; }
        if (Math.random() < Math.min(0.85, 0.3 + lvl('fishing') * 0.01)) {
          const anch = lvl('fishing') >= 15 && Math.random() < 0.45;
          invAdd(anch ? 'raw_anchovies' : 'raw_shrimps'); addXp('fishing', anch ? 40 : 10);
          msg(anch ? 'You catch some anchovies.' : 'You catch some shrimps.'); Sfx.play('splash');
        }
        return true;
      });
      return;
    }
    if (T === 'furnace') return smeltMenu();
    if (T === 'anvil') return openSmithing();
    if (T === 'range') { const raw = S.inv.find(s => s && COOKING[s.id]); if (!raw) { msg('You have nothing to cook.'); return; } return startCooking(raw.id, loc); }
    if (T === 'bank_booth') return openBank();
    if (T === 'altar') {
      setAnim(p, 'pray');
      if (cur('prayer') >= lvl('prayer')) { msg('You already have full Prayer points.'); return; }
      S.skills.prayer.cur = lvl('prayer'); msg('You recharge your Prayer points.'); Sfx.play('prayon'); return;
    }
    if (T === 'bakery_stall' || T === 'silk_stall') return stealStall(loc);
    if (T === 'spinning_wheel') {
      if (!has('flax')) { msg('You need some flax to spin.'); return; }
      if (lvl('crafting') < 10) { msg('You need a Crafting level of 10 to spin flax.'); return; }
      startLoop('spin', null, 3, () => { if (!has('flax')) return false; invRemove('flax'); invAdd('bow_string'); addXp('crafting', 15); msg('You make a bow string.'); return has('flax'); }, 2);
      return;
    }
    if (T === 'flax') {
      if (loc.depletedUntil > S.tick) return;
      if (!freeSlots()) { msg('You can\'t carry any more flax.'); return; }
      setAnim(p, 'pickup'); invAdd('flax'); msg('You pick some flax.');
      if (Math.random() < 0.2) loc.depletedUntil = S.tick + 30;
      return;
    }
    if (loc.patch) return patchAction(loc, op);
    if (T === 'snare' || T === 'boxtrap') return trapAction(loc, op);
  }

  function woodcut(loc) {
    if (loc.depletedUntil > S.tick) return;
    const tr = TREES[loc.type], axe = bestTool('wc');
    if (!axe) { msg('You do not have an axe which you have the woodcutting level to use.'); return; }
    if (lvl('woodcutting') < tr.level) { msg(`You need a Woodcutting level of ${tr.level} to chop down this tree.`); return; }
    if (!freeSlots()) { msg('Your inventory is too full to hold any more logs.'); return; }
    msg('You swing your axe at the tree.');
    startLoop('chop', axe, 4, () => {
      if (loc.depletedUntil > S.tick) return false;
      if (!freeSlots()) { msg('Your inventory is too full to hold any more logs.'); return false; }
      Sfx.play('chop');
      const chance = Math.min(0.92, tr.base + (lvl('woodcutting') - tr.level) * 0.008 + ITEMS[axe].tool.power * 0.07);
      if (Math.random() < chance) {
        invAdd(tr.log); addXp('woodcutting', tr.xp);
        msg(`You get some ${ITEMS[tr.log].name.toLowerCase()}.`);
        if (Math.random() < tr.deplete) { loc.depletedUntil = S.tick + ri(tr.respawn[0], tr.respawn[1]); Sfx.play('timber'); return false; }
      }
      return true;
    });
  }
  function mine(loc) {
    if (loc.depletedUntil > S.tick) { msg('There is currently no ore available in this rock.'); return; }
    const rk = ROCKS[loc.type], pick = bestTool('mine');
    if (!pick) { msg('You need a pickaxe to mine this rock.'); return; }
    if (lvl('mining') < rk.level) { msg(`You need a Mining level of ${rk.level} to mine this rock.`); return; }
    if (!freeSlots()) { msg('Your inventory is too full to hold any more ore.'); return; }
    msg('You swing your pick at the rock.');
    startLoop('mine', pick, 4, () => {
      if (loc.depletedUntil > S.tick) return false;
      if (!freeSlots()) { msg('Your inventory is too full to hold any more ore.'); return false; }
      Sfx.play('mine');
      if (Math.random() < Math.min(0.9, rk.base + (lvl('mining') - rk.level) * 0.01 + ITEMS[pick].tool.power * 0.08)) {
        invAdd(rk.ore); addXp('mining', rk.xp);
        msg(`You manage to mine some ${ITEMS[rk.ore].name.replace(' ore', '').toLowerCase()}.`);
        loc.depletedUntil = S.tick + rk.respawn;
        return false;
      }
      return true;
    });
  }
  function craftRunes(loc) {
    const k = loc.def.rune, a = RC_ALTARS[k];
    if (lvl('runecrafting') < a.level) { msg(`You need a Runecrafting level of ${a.level} to craft ${k} runes.`); return; }
    const n = invCount('rune_essence');
    if (!n) { msg('You don\'t have any rune essence to bind.'); return; }
    const mult = 1 + Math.floor(lvl('runecrafting') / a.multi);
    invRemove('rune_essence', n); invAdd(k + '_rune', n * mult); addXp('runecrafting', a.xp * n);
    setAnim(S.player, 'craftrune'); Sfx.play('teleport');
    msg(`You bind the temple's power into ${k} runes.`);
  }
  function stealStall(loc) {
    const p = S.player;
    const cake = loc.type === 'bakery_stall';
    const req = cake ? 5 : 20;
    if (lvl('thieving') < req) { msg(`You need a Thieving level of ${req} to steal from this stall.`); return; }
    if (loc.depletedUntil > S.tick) { msg('The stall has nothing left to steal right now.'); return; }
    if (!freeSlots()) { msg('You don\'t have enough inventory space.'); return; }
    setAnim(p, 'pickup');
    invAdd(cake ? 'cake' : 'silk'); addXp('thieving', cake ? 16 : 24);
    msg(`You steal ${cake ? 'a cake' : 'some silk'} from the stall.`);
    loc.depletedUntil = S.tick + (cake ? 4 : 8);
  }

  // ---------- agility ----------
  function doAgility(a) {
    const p = S.player;
    msg(a.msg);
    const fail = a.fail && Math.random() < a.fail * Math.max(0.2, 1 - lvl('agility') / 40);
    p.forced = { path: fail ? a.path.slice(0, 2) : a.path.slice(), anim: a.anim, a, fail };
  }
  function forcedTick() {
    const p = S.player, f = p.forced;
    if (f.path.length) { moveEnt(p, [f.path.shift()]); p.moveAnim = f.anim; return; }
    p.forced = null; p.moveAnim = null;
    const a = f.a;
    if (f.fail) {
      p.x = a.start[0]; p.z = a.start[1]; p.from = null; p.steps = [];
      msg('You lose your footing and fall!'); damagePlayer(ri(1, 3), null); return;
    }
    addXp('agility', a.xp);
    if (a.i === S.agilityNext || a.i === 0) S.agilityNext = a.i + 1; else S.agilityNext = 0;
    if (a.bonus && S.agilityNext === AGILITY.length) { addXp('agility', a.bonus); msg('You complete the Ardenvale Agility Course!', '#000080'); S.agilityNext = 0; }
  }

  // ---------- farming ----------
  function patchAction(loc, op) {
    const pt = loc.patch;
    if (op === 'Inspect') {
      const st = { weeds: 'The patch needs weeding.', empty: 'The patch has been raked and is ready for planting.', growing: `${ITEMS[SEEDS[pt.crop] ? SEEDS[pt.crop].crop : 'potato'].name} is growing here.`, ready: 'The crop is ready to harvest!' }[pt.state];
      msg(`This is ${loc.type === 'herbpatch' ? 'a herb patch' : 'an allotment'}. ${st}`); return;
    }
    if (op === 'Rake') {
      if (!has('rake')) { msg('You need a rake to clear the weeds.'); return; }
      startLoop('rake', 'rake', 3, () => {
        if (pt.state !== 'weeds') return false;
        pt.stage--; addXp('farming', 4); invAddOrDrop('weeds', 1);
        if (pt.stage <= 0) { pt.state = 'empty'; msg('You have successfully cleared this patch.'); }
        World.refreshLoc(loc);
        return pt.state === 'weeds';
      });
      return;
    }
    if (op === 'Harvest' || op === 'Pick') {
      if (loc.type === 'allotment' && !has('spade')) { msg('You need a spade to harvest this.'); return; }
      const sd = SEEDS[pt.crop];
      startLoop('harvest', loc.type === 'allotment' ? 'spade' : null, 2, () => {
        if (pt.state !== 'ready') return false;
        if (!freeSlots() && !ITEMS[sd.crop].stackable) { msg('You don\'t have enough inventory space.'); return false; }
        invAdd(sd.crop); addXp('farming', sd.harvestXp); pt.lives--;
        msg(`You harvest ${/s$/.test(ITEMS[sd.crop].name) ? 'some' : 'a'} ${ITEMS[sd.crop].name.toLowerCase()}.`);
        if (pt.lives <= 0) { pt.state = 'empty'; pt.crop = null; World.refreshLoc(loc); msg('The patch is now empty.'); return false; }
        return true;
      }, 1);
    }
  }
  function plantSeed(slot, loc) {
    const it = S.inv[slot], sd = SEEDS[it.id], pt = loc.patch;
    if ((loc.type === 'herbpatch') !== (sd.patch === 'herb')) { msg(`You can't plant that in ${loc.type === 'herbpatch' ? 'a herb patch' : 'an allotment'}.`); return; }
    if (pt.state === 'weeds') { msg('This patch needs weeding first.'); return; }
    if (pt.state !== 'empty') { msg('Something is already growing here.'); return; }
    if (lvl('farming') < sd.level) { msg(`You need a Farming level of ${sd.level} to plant this.`); return; }
    if (!has('seed_dibber')) { msg('You need a seed dibber to plant seeds.'); return; }
    if (invCount(it.id) < sd.need) { msg(`You need ${sd.need} seeds to plant an allotment.`); return; }
    invRemove(it.id, sd.need); addXp('farming', sd.plantXp);
    Object.assign(pt, { state: 'growing', crop: it.id, stage: 0, lives: sd.patch === 'herb' ? ri(3, 5) : ri(3, 6) });
    setAnim(S.player, 'plant');
    msg(`You plant ${sd.need > 1 ? sd.need + ' ' + sd.name.toLowerCase() + 's' : 'a ' + sd.name.toLowerCase()} in the patch.`);
    World.refreshLoc(loc);
  }
  function growPatches() {
    for (const loc of World.locs) {
      const pt = loc.patch; if (!pt || pt.state !== 'growing') continue;
      pt.stage++;
      if (pt.stage >= 4) { pt.state = 'ready'; if (loc.dist === undefined) msg('You sense that one of your crops is ready to harvest.', '#005000'); }
      World.refreshLoc(loc);
    }
  }

  // ---------- hunter ----------
  function layTrap(slot) {
    const p = S.player, it = S.inv[slot];
    const h = HUNTER[it.id];
    const reg = region(p.x, p.z);
    const c = h.catches.find(c => c.region === reg) || h.catches[0];
    if (lvl('hunter') < c.level) { msg(`You need a Hunter level of ${c.level} to set this trap here.`); return; }
    const max = 1 + Math.floor(lvl('hunter') / 20);
    if (S.traps.length >= max) { msg(`You can only have ${max} trap${max > 1 ? 's' : ''} set at your Hunter level.`); return; }
    if (World.locAt(p.x, p.z) || World.roofAt(p.x, p.z) >= 0) { msg('You can\'t lay a trap here.'); return; }
    resetActions();
    S.inv[slot] = null;
    const loc = World.addLocLive(h.loc, p.x, p.z);
    Object.assign(loc, { item: it.id, catchDef: h.catches.find(c => c.region === reg) || null, catchAt: S.tick + ri(15, 40), caught: false, collapse: S.tick + 400 });
    S.traps.push(loc);
    setAnim(p, 'plant');
    msg(`You set up the ${ITEMS[it.id].name.toLowerCase()}.`);
    for (const [dx, dz] of [[-1, 0], [1, 0], [0, 1], [0, -1]]) if (World.canStep(p.x, p.z, dx, dz)) { p.path = [[p.x + dx, p.z + dz]]; break; }
  }
  function trapAction(loc, op) {
    const p = S.player;
    const remove = () => { World.removeLocLive(loc); S.traps.splice(S.traps.indexOf(loc), 1); };
    if (op === 'Dismantle' || (op === 'Check' && !loc.caught)) {
      if (op === 'Check') { msg('Nothing has been caught yet.'); return; }
      remove(); invAddOrDrop(loc.item, 1); setAnim(p, 'pickup'); msg('You dismantle the trap.'); return;
    }
    const c = loc.catchDef;
    remove(); setAnim(p, 'pickup');
    for (const [id, q] of c.loot) invAddOrDrop(id, Array.isArray(q) ? ri(q[0], q[1]) : q);
    invAddOrDrop(loc.item, 1);
    addXp('hunter', c.xp);
    msg(`You've caught a ${c.name.toLowerCase()}.`);
  }
  function trapTick() {
    for (const t of S.traps.slice()) {
      if (S.tick >= t.collapse && !t.caught) { World.removeLocLive(t); S.traps.splice(S.traps.indexOf(t), 1); dropGround(t.item, 1, t.x, t.z); msg('Your trap has collapsed.'); continue; }
      if (!t.caught && t.catchDef && S.tick >= t.catchAt) {
        if (Math.random() < Math.min(0.9, 0.5 + (lvl('hunter') - t.catchDef.level) * 0.02)) { t.caught = true; World.refreshLoc(t); }
        else t.catchAt = S.tick + ri(10, 30);
      }
    }
  }

  // ---------- production ----------
  function hasMats(r) { for (const k in r.needs) if (invCount(k) < r.needs[k]) return false; return true; }
  function smeltMenu() {
    const can = SMELTING.filter(hasMats);
    if (has('gold_bar')) { craftGold(); return; }
    if (!can.length) { msg('You don\'t have any ore to smelt.'); return; }
    if (can.length === 1) return startSmelting(can[0]);
    options('What would you like to smelt?', can.map(r => ({ text: ITEMS[r.out].name, fn: () => startSmelting(r) })));
  }
  function startSmelting(r) {
    if (lvl('smithing') < r.level) { msg(`You need a Smithing level of ${r.level} to smelt ${ITEMS[r.out].name.toLowerCase()}s.`); return; }
    if (!hasMats(r)) { msg(`You don't have the ores to make a ${ITEMS[r.out].name.toLowerCase()}.`); return; }
    msg('You place the ore into the furnace.');
    startLoop('smelt', null, 4, () => {
      if (!hasMats(r)) return false;
      for (const k in r.needs) invRemove(k, r.needs[k]);
      if (Math.random() < r.success) { invAdd(r.out); addXp('smithing', r.xp); msg(`You retrieve a bar of ${ITEMS[r.out].name.replace(' bar', '').toLowerCase()}.`); }
      else msg('The ore is too impure and you fail to refine it.');
      Sfx.play('smelt');
      return hasMats(r);
    }, 2);
  }
  function craftGold() {
    options('What would you like to make?', [['gold_ring', 5, 15], ['gold_amulet', 8, 30]].map(([id, lv, xp]) => ({
      text: ITEMS[id].name, fn: () => {
        if (lvl('crafting') < lv) { msg(`You need a Crafting level of ${lv} to make this.`); return; }
        startLoop('smelt', null, 3, () => { if (!has('gold_bar')) return false; invRemove('gold_bar'); invAdd(id); addXp('crafting', xp); msg(`You make a ${ITEMS[id].name.toLowerCase()}.`); return has('gold_bar'); }, 2);
      },
    })));
  }
  const METALS = ['bronze', 'iron', 'steel', 'mithril', 'adamant', 'rune'];
  const barOf = m => (m === 'adamant' ? 'adamantite' : m === 'rune' ? 'runite' : m) + '_bar';
  function openSmithing(metal) {
    if (!has('hammer')) { msg('You need a hammer to work the metal with.'); return; }
    if (!metal) metal = METALS.slice().reverse().find(m => has(barOf(m)));
    if (!metal) { msg('You don\'t have any bars to smith with.'); return; }
    S.iface = { type: 'smith', metal };
  }
  function smith(recipe, count) {
    S.iface = null;
    if (lvl('smithing') < recipe.level) { msg(`You need a Smithing level of ${recipe.level} to make that.`); return; }
    if (invCount(recipe.bar) < recipe.bars) { msg(`You don't have enough bars to make ${ITEMS[recipe.out].name.toLowerCase()}.`); return; }
    let left = count;
    startLoop('smith', 'hammer', 4, () => {
      if (invCount(recipe.bar) < recipe.bars) return false;
      invRemove(recipe.bar, recipe.bars); invAdd(recipe.out, recipe.qty); addXp('smithing', recipe.xp);
      msg(`You hammer the ${recipe.metal} and make ${recipe.qty > 1 ? 'some' : 'a'} ${ITEMS[recipe.out].name.toLowerCase().replace(recipe.metal + ' ', '')}.`);
      Sfx.play('anvil');
      return --left > 0 && invCount(recipe.bar) >= recipe.bars;
    }, 2);
  }
  function startCooking(rawId, loc) {
    const c = COOKING[rawId];
    if (lvl('cooking') < c.level) { msg(`You need a Cooking level of ${c.level} to cook this.`); return; }
    const onRange = loc.type === 'range';
    startLoop('cook', null, 4, () => {
      if (World.locs.indexOf(loc) < 0 || !has(rawId)) return false;
      invRemove(rawId);
      const L = lvl('cooking');
      const burn = L >= c.stopBurn ? 0 : Math.max(0, 0.55 * (1 - (L - c.level) / (c.stopBurn - c.level))) * (onRange ? 0.8 : 1);
      if (Math.random() < burn) { invAdd(c.burnt); msg(`You accidentally burn the ${ITEMS[c.out].name.toLowerCase()}.`); }
      else { invAdd(c.out); addXp('cooking', c.xp); msg(`You successfully cook ${/s$/.test(ITEMS[c.out].name) ? 'some' : 'a'} ${ITEMS[c.out].name.toLowerCase()}.`); }
      Sfx.play('cook');
      return has(rawId);
    }, 2);
  }
  COOKING.raw_bird_meat = { out: 'cooked_bird_meat', burnt: 'burnt_meat', level: 11, xp: 62, stopBurn: 44 };
  function lightFire(logId) {
    const p = S.player, fm = FIREMAKING[logId];
    if (lvl('firemaking') < fm.level) { msg(`You need a Firemaking level of ${fm.level} to burn these logs.`); return; }
    if (World.roofAt(p.x, p.z) >= 0 || World.locAt(p.x, p.z) || World.locs.some(l => l.type === 'fire' && l.x === p.x && l.z === p.z)) { msg('You can\'t light a fire here.'); return; }
    resetActions();
    msg('You attempt to light the logs.');
    startLoop('firemake', 'tinderbox', 3, () => {
      if (!has(logId)) return false;
      if (Math.random() < Math.min(0.95, 0.45 + (lvl('firemaking') - fm.level) * 0.015)) {
        invRemove(logId);
        const f = World.addLocLive('fire', p.x, p.z);
        f.expire = S.tick + ri(60, 110);
        addXp('firemaking', fm.xp);
        msg('The fire catches and the logs begin to burn.'); Sfx.play('fire');
        for (const [dx, dz] of [[-1, 0], [1, 0], [0, 1], [0, -1]]) if (World.canStep(p.x, p.z, dx, dz)) { p.path = [[p.x + dx, p.z + dz]]; break; }
        faceEnt(p, f);
        return false;
      }
      return true;
    });
  }
  function makeLoop(name, tool, need, fn) { resetActions(); startLoop(name, tool, 3, () => { if (!need()) return false; fn(); return need(); }, 2); }
  function fletchMenu(logId) {
    const opts = [];
    const sh = SHAFTS[logId];
    if (sh) opts.push({ text: `${sh.qty} Arrow shafts`, fn: () => { if (lvl('fletching') < sh.level) return msg(`You need a Fletching level of ${sh.level}.`); makeLoop('fletch', 'knife', () => has(logId), () => { invRemove(logId); invAdd('arrow_shaft', sh.qty); addXp('fletching', sh.xp); msg(`You carefully cut the wood into ${sh.qty} arrow shafts.`); }); } });
    for (const b of FLETCH_BOW.filter(b => b.log === logId)) opts.push({ text: ITEMS[b.out].name, fn: () => { if (lvl('fletching') < b.level) return msg(`You need a Fletching level of ${b.level} to make that.`); makeLoop('fletch', 'knife', () => has(logId), () => { invRemove(logId); invAdd(b.out); addXp('fletching', b.xp); msg(`You carefully cut the wood into ${/^[AEIOU]/i.test(ITEMS[b.out].name) ? 'an' : 'a'} ${ITEMS[b.out].name.toLowerCase()}.`); }); } });
    options('What would you like to make?', opts);
  }
  function craftLeather() {
    options('What would you like to make?', CRAFT_LEATHER.map(r => ({
      text: `${ITEMS[r.out].name} (lvl ${r.level})`, fn: () => {
        if (lvl('crafting') < r.level) return msg(`You need a Crafting level of ${r.level} to make this.`);
        makeLoop('craft', 'needle', () => has('leather') && has('thread'), () => { invRemove('leather'); invRemove('thread'); invAdd(r.out); addXp('crafting', r.xp); msg(`You make ${/s$/.test(ITEMS[r.out].name) ? 'some' : 'a'} ${ITEMS[r.out].name.toLowerCase()}.`); });
      },
    })));
  }

  // ---------- item-on-thing ----------
  function useItemOn(slot, kind, ent) {
    const it = S.inv[slot]; S.selected = -1;
    if (!it) return;
    if (kind === 'loc') {
      faceEnt(S.player, ent);
      if (COOKING[it.id] && (ent.type === 'fire' || ent.type === 'range')) return startCooking(it.id, ent);
      if (ent.type === 'furnace') { if (it.id === 'gold_bar') return craftGold(); const r = SMELTING.find(r => r.needs[it.id] && hasMats(r)); if (r) return startSmelting(r); }
      if (ent.type === 'anvil' && /_bar$/.test(it.id)) { const m = METALS.find(m => barOf(m) === it.id); if (m) return openSmithing(m); }
      if (/bones/.test(it.id) && ent.type === 'altar') { invRemove(it.id); addXp('prayer', ITEMS[it.id].bury * 3); setAnim(S.player, 'pray'); msg('The gods are very pleased with your offering.'); return; }
      if (it.id === 'vial' && (ent.type === 'fountain' || ent.type === 'well')) { const n = invCount('vial'); invRemove('vial', n); invAdd('vial_water', n); msg('You fill the vial' + (n > 1 ? 's' : '') + ' with water.'); return; }
      if (SEEDS[it.id] && ent.patch) return plantSeed(slot, ent);
      if (it.id === 'strange_talisman' && ent.type === 'rc_air') { S.inv[slot] = { id: 'charged_talisman', qty: 1 }; setAnim(S.player, 'craftrune'); Sfx.play('teleport'); msg('The talisman glows as it absorbs the power of the altar!', '#000080'); return; }
      if (it.id === 'rune_essence' && ent.def.rune) return craftRunes(ent);
    }
    if (kind === 'npc') { if (ent.def.talk) return npcAction(ent, 'Talk-to'); }
    msg('Nothing interesting happens.');
  }
  function useItemOnItem(a, b) {
    const A = S.inv[a], B = S.inv[b];
    S.selected = -1;
    if (!A || !B || a === b) return;
    const ids = [A.id, B.id];
    const pair = (x, test) => (A.id === x && test(B.id)) ? B.id : (B.id === x && test(A.id)) ? A.id : null;
    let o;
    if ((o = pair('tinderbox', id => !!FIREMAKING[id]))) return lightFire(o);
    if ((o = pair('knife', id => !!SHAFTS[id]))) return fletchMenu(o);
    if ((o = pair('bow_string', id => /_u$/.test(id)))) {
      const b = FLETCH_BOW.find(b => b.out === o);
      if (lvl('fletching') < b.level) return msg(`You need a Fletching level of ${b.level} to string this bow.`);
      return makeLoop('fletch', null, () => has('bow_string') && has(o), () => { invRemove('bow_string'); invRemove(o); invAdd(b.bow); addXp('fletching', b.xp); msg(`You add a string to the bow.`); });
    }
    if (pair('feather', id => id === 'arrow_shaft')) return makeLoop('fletch', null, () => has('feather') && has('arrow_shaft'), () => { const n = Math.min(15, invCount('feather'), invCount('arrow_shaft')); invRemove('feather', n); invRemove('arrow_shaft', n); invAdd('headless_arrow', n); addXp('fletching', n); msg(`You attach feathers to ${n} arrow shafts.`); });
    if ((o = pair('headless_arrow', id => /_arrowtips$/.test(id)))) {
      const m = o.replace('_arrowtips', ''), ar = ARROWS.find(a => a[0] === m);
      if (lvl('fletching') < ar[1]) return msg(`You need a Fletching level of ${ar[1]} to make these arrows.`);
      return makeLoop('fletch', null, () => has('headless_arrow') && has(o), () => { const n = Math.min(15, invCount(o), invCount('headless_arrow')); invRemove(o, n); invRemove('headless_arrow', n); invAdd(m + '_arrow', n); addXp('fletching', n * ar[2]); msg(`You attach arrow heads to ${n} arrows.`); });
    }
    if (pair('needle', id => id === 'leather')) { if (!has('thread')) return msg('You need some thread to sew with.'); return craftLeather(); }
    // herblore
    const herb = ids.find(id => /_leaf$/.test(id)), unf = ids.find(id => /_unf$/.test(id));
    if (herb && ids.includes('vial_water')) {
      const h = herb.replace('_leaf', ''), pot = POTIONS.find(p => p.unf === h + '_unf');
      const lv = pot ? pot.level : 1;
      if (lvl('herblore') < lv) return msg(`You need a Herblore level of ${lv} to make this potion.`);
      return makeLoop('herb', null, () => has(herb) && has('vial_water'), () => { invRemove(herb); invRemove('vial_water'); invAdd(h + '_unf'); msg(`You put the ${ITEMS[herb].name.toLowerCase()} into the vial of water.`); });
    }
    if (unf) {
      const pot = POTIONS.find(p => p.unf === unf && ids.includes(p.sec));
      if (pot) {
        if (lvl('herblore') < pot.level) return msg(`You need a Herblore level of ${pot.level} to make this potion.`);
        return makeLoop('herb', null, () => has(unf) && has(pot.sec), () => { invRemove(unf); invRemove(pot.sec); invAdd(pot.id + '3'); addXp('herblore', pot.xp); msg(`You mix the ${ITEMS[pot.sec].name.toLowerCase()} into your potion.`); });
      }
    }
    msg('Nothing interesting happens.');
  }

  // ---------- inventory options ----------
  function itemOps(it) {
    const d = ITEMS[it.id], ops = [];
    if (d.food) ops.push('Eat');
    if (d.potion) ops.push('Drink');
    if (d.herb) ops.push('Clean');
    if (d.bury) ops.push('Bury');
    if (HUNTER[it.id]) ops.push('Lay');
    if (d.equip) ops.push(d.equip.slot === 'weapon' ? 'Wield' : 'Wear');
    if (FIREMAKING[it.id]) ops.push('Light');
    ops.push('Use', 'Drop');
    return ops;
  }
  function invAction(slot, op) {
    const p = S.player, it = S.inv[slot];
    if (!it || p.dead) return;
    const d = ITEMS[it.id];
    if (op === 'Use') { S.selected = slot; S.spellSel = null; return; }
    if (op === 'Drop') { S.inv[slot] = null; dropGround(it.id, it.qty, p.x, p.z); Sfx.play('drop'); if (p.task) stopTask(); return; }
    if (op === 'Examine') { msg(d.examine); return; }
    if (op === 'Eat') {
      if (p.eatDelay > 0) return;
      S.inv[slot] = null;
      S.skills.hitpoints.cur = Math.min(lvl('hitpoints'), cur('hitpoints') + d.food);
      msg(`You eat the ${d.name.toLowerCase()}.`); msg('It heals some health.');
      setAnim(p, 'eat'); p.eatDelay = 3; p.attackTimer = Math.max(p.attackTimer, 3); Sfx.play('eat');
      return;
    }
    if (op === 'Drink') {
      if (p.eatDelay > 0) return;
      const { p: pot, dose } = d.potion;
      const k = pot.boost, L = lvl(k);
      S.skills[k].cur = Math.max(cur(k), L + Math.floor(pot.base + L * pot.pct));
      S.inv[slot] = dose > 1 ? { id: pot.id + (dose - 1), qty: 1 } : { id: 'vial', qty: 1 };
      msg(`You drink some of your ${pot.name.toLowerCase()}.`); msg(dose > 1 ? `You have ${dose - 1} dose${dose > 2 ? 's' : ''} of potion left.` : 'You have finished your potion.');
      setAnim(p, 'eat'); p.eatDelay = 3; Sfx.play('eat');
      return;
    }
    if (op === 'Clean') {
      if (lvl('herblore') < d.herb.level) { msg(`You need a Herblore level of ${d.herb.level} to clean this herb.`); return; }
      S.inv[slot] = { id: d.herb.clean, qty: 1 }; addXp('herblore', d.herb.xp); msg(`You clean the dirt from the ${ITEMS[d.herb.clean].name.toLowerCase()}.`); return;
    }
    if (op === 'Bury') {
      if (p.eatDelay > 0) return;
      S.inv[slot] = null; addXp('prayer', d.bury); msg('You dig a hole in the ground...'); msg('You bury the bones.');
      setAnim(p, 'bury'); p.eatDelay = 2; Sfx.play('bury');
      return;
    }
    if (op === 'Lay') return layTrap(slot);
    if (op === 'Wield' || op === 'Wear') return equipItem(slot);
    if (op === 'Light') { if (!has('tinderbox')) { msg('You need a tinderbox to light a fire.'); return; } return lightFire(it.id); }
  }
  function swapInv(a, b) { const t = S.inv[a]; S.inv[a] = S.inv[b]; S.inv[b] = t; }

  // ---------- magic ----------
  function runesFor(spell) {
    const prov = weaponDef() && weaponDef().equip.provides;
    const need = {};
    for (const r in spell.runes) if (r !== prov) need[r + '_rune'] = spell.runes[r];
    return need;
  }
  function canCast(spell, verbose) {
    if (lvl('magic') < spell.level) { if (verbose) msg(`You need a Magic level of ${spell.level} to cast this spell.`); return false; }
    const need = runesFor(spell);
    for (const r in need) if (invCount(r) < need[r]) { if (verbose) msg('You do not have enough ' + ITEMS[r].name + 's to cast this spell.'); return false; }
    return true;
  }
  function payRunes(spell) { const need = runesFor(spell); for (const r in need) invRemove(r, need[r]); }
  function castSpell(spell) {
    const p = S.player;
    if (busy()) return;
    if (spell.type === 'combat' || spell.type === 'item') { S.spellSel = spell; S.selected = -1; return; }
    if (spell.id === 'home') return homeTeleport();
    if (!canCast(spell, true)) return;
    if (spell.type === 'tele') {
      if (wildLevel(p.x) > 20) { msg('A mysterious force prevents you from teleporting.'); return; }
      payRunes(spell); addXp('magic', spell.xp); resetActions();
      p.loop = 'teleport'; p.loopStart = now(); Sfx.play('teleport');
      p.task = { timer: 3, interval: 3, fn: () => { p.x = World.SPAWN.x; p.z = World.SPAWN.z; p.from = null; p.steps = []; p.path = []; return false; } };
      return;
    }
    if (spell.id === 'bones_bananas') {
      const n = invCount('bones'); if (!n) { msg('You aren\'t holding any bones!'); return; }
      payRunes(spell); invRemove('bones', n); invAdd('banana', n); addXp('magic', spell.xp); setAnim(p, 'cast'); Sfx.play('teleport');
    }
  }
  function castOnItem(slot, spell) {
    S.spellSel = null;
    const it = S.inv[slot]; if (!it) return;
    if (it.id === 'coins') { msg('You can\'t cast this spell on coins.'); return; }
    if (!canCast(spell, true)) return;
    const p = S.player;
    if (p.eatDelay > 0) return;
    payRunes(spell);
    const val = Math.max(1, Math.floor(ITEMS[it.id].value * spell.mult) * (it.qty && ITEMS[it.id].stackable ? 1 : 1));
    invRemove(it.id, 1); invAddOrDrop('coins', val); addXp('magic', spell.xp);
    setAnim(p, 'cast'); Sfx.play('teleport'); p.eatDelay = 3;
  }
  function homeTeleport() {
    const p = S.player;
    if (p.combat || S.npcs.some(n => n.target === p)) { msg('You can\'t teleport during combat.'); return; }
    if (wildLevel(p.x) > 20) { msg('A mysterious force prevents you from teleporting.'); return; }
    resetActions();
    p.loop = 'teleport'; p.loopStart = now();
    msg('You begin casting Home Teleport...');
    p.task = { timer: 6, interval: 6, fn: () => { p.x = World.SPAWN.x; p.z = World.SPAWN.z; p.from = null; p.steps = []; p.path = []; Sfx.play('teleport'); return false; } };
  }

  // ---------- NPC dialogue ----------
  function npcAction(n, op) {
    faceEnt(n, S.player);
    n.wanderGoal = null; n.talkUntil = S.tick + 8;
    if (op === 'Talk-to') return talkTo(n);
    if (op === 'Bank') return openBank();
    if (op === 'Trade') return openShop(n.def.shop);
    if (op === 'Pickpocket') return pickpocket(n);
    if (op === 'Assignment') return slayerTalk(n, true);
  }
  function chat(n, steps, done) {
    let i = 0;
    const next = () => {
      if (i >= steps.length) { S.dialog = null; if (done) done(); return; }
      const st = steps[i++];
      if (typeof st === 'function') { st(); return; }
      if (st.options) { S.dialog = { kind: 'options', title: st.title || 'Select an Option', options: st.options }; return; }
      const [who, text] = st;
      S.dialog = { kind: who, name: who === 'npc' ? n.def.name : S.name, lines: wrap(text, 56), next, npc: n };
    };
    next();
  }
  function wrap(text, w) {
    const words = text.split(' '), lines = []; let line = '';
    for (const wd of words) { if ((line + ' ' + wd).trim().length > w) { lines.push(line.trim()); line = wd; } else line += ' ' + wd; }
    if (line.trim()) lines.push(line.trim());
    return lines;
  }
  const end = () => { S.dialog = null; };
  function questDone(id, rewards, fn) {
    S.quests[id] = 2; S.questPoints++;
    if (fn) fn();
    const q = QUESTS.find(q => q.id === id);
    S.dialog = null;
    S.iface = { type: 'questdone', quest: q.name, rewards: ['1 Quest Point'].concat(rewards) };
    Sfx.questDone();
    msg('Congratulations! Quest complete!', '#7f0000');
  }
  function talkTo(n) {
    const t = n.def.talk;
    if (t === 'man') {
      const lines = ['Hello there! Lovely weather in Ardenvale today.', 'Have you been to the mine down south? Mind the rats by the river.', 'I hear the Elder is looking for someone to fix that old bridge.', 'Never go into the Wilderness with anything you can\'t afford to lose.', 'They say the furnace in Al Kharid is the best in the land.', 'Mind your pockets, adventurer. Not everyone around here is honest.'];
      chat(n, [['player', 'Hello, how\'s it going?'], ['npc', lines[ri(0, lines.length - 1)]]]);
    } else if (t === 'banker') {
      chat(n, [['npc', 'Good day, how may I help you?'], { options: [
        { text: 'I\'d like to access my bank account, please.', fn: openBank },
        { text: 'What is this place?', fn: () => chat(n, [['player', 'What is this place?'], ['npc', 'This is a branch of the Bank of Ardenvale. We keep your belongings safe, free of charge!']]) },
        { text: 'Nothing, thanks.', fn: end }] }]);
    } else if (t === 'shop') {
      chat(n, [['npc', 'Can I help you at all?'], { options: [{ text: 'Yes please. What are you selling?', fn: () => openShop(n.def.shop) }, { text: 'No thanks.', fn: end }] }]);
    } else if (t === 'generic') {
      const opts = [];
      if (n.def.shop) opts.push({ text: 'What do you have for sale?', fn: () => openShop(n.def.shop) });
      if (n.id === 'mage') opts.unshift({ text: 'Do you need any help?', fn: () => runesQuest(n) });
      opts.push({ text: 'Goodbye.', fn: end });
      chat(n, [['npc', n.def.greet || 'Hello.'], { options: opts }]);
    } else if (t === 'smith') {
      chat(n, [['npc', 'Welcome to my forge! The furnace is hot and the anvils are ready.'], { options: [
        { text: 'What do you have for sale?', fn: () => openShop('smith') },
        { text: 'Do you need any help?', fn: () => forgeQuest(n) },
        { text: 'How do I smith?', fn: () => chat(n, [['npc', 'Mine copper and tin, smelt them into bronze bars in the furnace, then hammer the bars on an anvil. Iron needs level 15, steel 30 with two coal per bar.']]) },
        { text: 'Goodbye.', fn: end }] }]);
    } else if (t === 'tanner') {
      chat(n, [['npc', 'Greetings! I can tan your cowhides into leather for just 1 coin each.'], { options: [
        { text: 'Please tan my hides.', fn: () => { const c = Math.min(invCount('cowhide'), invCount('coins')); if (!c) { chat(n, [['npc', 'You need cowhides and coins, friend.']]); return; } invRemove('cowhide', c); invRemove('coins', c); invAdd('leather', c); S.dialog = { kind: 'msg', lines: [`The tanner tans ${c} cowhide${c > 1 ? 's' : ''} for you.`] }; } },
        { text: 'Let\'s trade.', fn: () => openShop('crafting') },
        { text: 'Goodbye.', fn: end }] }]);
    } else if (t === 'elder') elderDialog(n);
    else if (t === 'priest') bonesQuest(n);
    else if (t === 'harbour') catchQuest(n);
    else if (t === 'slayer') slayerTalk(n);
  }
  function elderDialog(n) {
    const q = S.quests.bridge;
    if (q === 0) {
      chat(n, [
        ['npc', 'Ah, a new face in Ardenvale! Welcome, welcome.'],
        ['player', 'Thank you. Is there anything I can do to help around here?'],
        ['npc', 'The old bridge to the western woods collapsed in last winter\'s storms. Beyond it lie iron, bandits... and the Wilderness.'],
        ['npc', 'If you could bring me 10 logs and 3 bronze bars, my workers could rebuild it.'],
        { title: 'Start Bridge to the West?', options: [
          { text: 'I\'ll get them for you.', fn: () => { S.quests.bridge = 1; Sfx.play('quest'); chat(n, [['player', 'I\'ll get them for you.'], ['npc', 'Splendid! Trees grow all around the village, and the mine is to the south. Hilda at the smithy can help with smelting.']]); } },
          { text: 'Not right now.', fn: end }] }]);
    } else if (q === 1) {
      const logs = invCount('logs'), bars = invCount('bronze_bar');
      if (logs >= 10 && bars >= 3) chat(n, [['npc', 'Do you have the materials for the bridge?'], ['player', 'Yes! Ten logs and three bronze bars, as you asked.'], ['npc', 'Wonderful! My workers will have the bridge rebuilt by sundown. Here, take this for your trouble.'],
        () => { invRemove('logs', 10); invRemove('bronze_bar', 3); questDone('bridge', ['400 Smithing XP', '400 Woodcutting XP', '500 Coins', 'Access to the Western Woods'], () => { World.setBridgeOpen(true); invAddOrDrop('coins', 500); addXp('smithing', 400); addXp('woodcutting', 400); }); }]);
      else chat(n, [['npc', `How goes it? I still need ${Math.max(0, 10 - logs)} more logs and ${Math.max(0, 3 - bars)} more bronze bars.`], ['player', 'I\'m working on it.']]);
    } else chat(n, [['npc', 'Thanks to you, the bridge stands strong once more. Be careful in the west - beyond the woods lies the Wilderness!']]);
  }
  function bonesQuest(n) {
    const q = S.quests.bones;
    if (q === 0) chat(n, [['npc', 'Bless you, traveller. A troubled spirit haunts this chapel at night.'], ['npc', 'Its skull was stolen by the skeletons of the Wilderness, far to the west. Could you bring it back so the spirit may rest?'],
      { title: 'Start The Restless Bones?', options: [{ text: 'I\'ll find the skull.', fn: () => { S.quests.bones = 1; Sfx.play('quest'); chat(n, [['npc', 'Thank you! The skeletons roam beyond the western woods. Be careful - the Wilderness is a lawless place.']]); } }, { text: 'Sounds too dangerous.', fn: end }] }]);
    else if (q === 1) {
      if (has('ancient_skull')) chat(n, [['player', 'I found the ancient skull!'], ['npc', 'Praise be! Let us lay this poor soul to rest.'], () => { invRemove('ancient_skull'); questDone('bones', ['1,500 Prayer XP'], () => addXp('prayer', 1500)); }]);
      else chat(n, [['npc', 'Have you found the skull? The skeletons in the Wilderness must have it.']]);
    } else chat(n, [['npc', 'The chapel is peaceful again, thanks to you. You may pray at our altar any time.']]);
  }
  function forgeQuest(n) {
    const q = S.quests.forge;
    if (q === 0) chat(n, [['npc', 'Actually, yes! A knight ordered a bronze platebody and I\'m short on iron. Could you bring me a bronze platebody and 2 iron bars?'],
      { title: 'Start Forging Ahead?', options: [{ text: 'Leave it to me.', fn: () => { S.quests.forge = 1; Sfx.play('quest'); chat(n, [['npc', 'You\'ll need Smithing level 18 for the platebody. Iron ore can be found in the mine south of the village.']]); } }, { text: 'Maybe later.', fn: end }] }]);
    else if (q === 1) {
      if (has('bronze_platebody') && invCount('iron_bar') >= 2) chat(n, [['player', 'Here\'s your platebody and the iron bars.'], ['npc', 'Fine work! You\'ve the makings of a master smith. Take this pickaxe.'], () => { invRemove('bronze_platebody'); invRemove('iron_bar', 2); questDone('forge', ['2,000 Smithing XP', 'Iron pickaxe'], () => { addXp('smithing', 2000); invAddOrDrop('iron_pickaxe', 1); }); }]);
      else chat(n, [['npc', 'I still need a bronze platebody and 2 iron bars.']]);
    } else chat(n, [['npc', 'Thanks again for your help! Come by any time.']]);
  }
  function runesQuest(n) {
    const q = S.quests.runes;
    if (q === 0) chat(n, [['npc', 'Hmm! I found this talisman, but its power is dormant. Legend says the altars of the Runestone Circle in the Elderwood can awaken it.'],
      { title: 'Start Secrets of the Stones?', options: [{ text: 'I\'ll take it there.', fn: () => { invAddOrDrop('strange_talisman', 1); S.quests.runes = 1; Sfx.play('quest'); chat(n, [['npc', 'Use it on the Air altar - follow the road north out of the village.']]); } }, { text: 'Not now.', fn: end }] }]);
    else if (q === 1) {
      if (has('charged_talisman')) chat(n, [['player', 'The talisman awakened at the Air altar!'], ['npc', 'Incredible! You have a gift for runecraft. Take some runes to start you off.'], () => { invRemove('charged_talisman'); questDone('runes', ['500 Runecrafting XP', '250 Magic XP', '100 Air runes', '50 Mind runes'], () => { addXp('runecrafting', 500); addXp('magic', 250); invAddOrDrop('air_rune', 100); invAddOrDrop('mind_rune', 50); }); }]);
      else { if (!has('strange_talisman')) invAddOrDrop('strange_talisman', 1); chat(n, [['npc', 'Take the talisman to the Air altar in the Runestone Circle, north through the Elderwood.']]); }
    } else chat(n, [['npc', 'Mine rune essence at the circle and bind it at the altars. Higher altars need more skill!']]);
  }
  function catchQuest(n) {
    const q = S.quests.catch;
    if (q === 0) chat(n, [['npc', 'Ahoy! My crew is half-starved. Bring me 10 shrimps and 5 cooked chickens and I\'ll make it worth your while.'],
      { title: 'Start Sarrow\'s Catch?', options: [{ text: 'Aye aye, Captain.', fn: () => { S.quests.catch = 1; Sfx.play('quest'); end(); } }, { text: 'No thanks.', fn: end }] }]);
    else if (q === 1) {
      if (invCount('shrimps') >= 10 && invCount('cooked_chicken') >= 5) chat(n, [['npc', 'A feast fit for a crew! Here\'s your reward.'], () => { invRemove('shrimps', 10); invRemove('cooked_chicken', 5); questDone('catch', ['1,000 Fishing XP', '1,000 Cooking XP', '600 Coins'], () => { addXp('fishing', 1000); addXp('cooking', 1000); invAddOrDrop('coins', 600); }); }]);
      else chat(n, [['npc', `Still waiting on that food: ${invCount('shrimps')}/10 shrimps, ${invCount('cooked_chicken')}/5 cooked chickens.`]]);
    } else chat(n, [['npc', 'The crew sends their thanks, matey!']]);
  }
  function slayerTalk(n, direct) {
    const st = S.slayer;
    const assign = () => {
      const cl = combatLevel();
      const pool = SLAYER_TASKS.filter(t => cl >= t.min);
      const t = pool[ri(0, pool.length - 1)];
      S.slayer = { npc: t.npc, left: ri(t.n[0], t.n[1]) };
      chat(n, [['npc', `Your new task is to kill ${S.slayer.left} ${NPCS[t.npc].name.toLowerCase()}${/s$/.test(NPCS[t.npc].name) ? '' : 's'}.`]]);
    };
    if (direct) { if (st && st.left > 0) chat(n, [['npc', `You're still hunting ${NPCS[st.npc].name.toLowerCase()}s; you have ${st.left} to go.`]]); else assign(); return; }
    chat(n, [['npc', 'Greetings. I am Master Kael. What do you want?'], { options: [
      { text: 'I need another assignment.', fn: () => { if (st && st.left > 0) chat(n, [['npc', `You're still hunting ${NPCS[st.npc].name.toLowerCase()}s; you have ${st.left} to go.`]]); else assign(); } },
      { text: 'What is Slayer?', fn: () => chat(n, [['npc', 'Slayer is the art of hunting specific creatures. Kill what I assign you and you\'ll gain Slayer experience for every kill.']]) },
      { text: 'Goodbye.', fn: end }] }]);
  }
  function pickpocket(n) {
    const p = S.player, pp = n.def.pickpocket;
    if (lvl('thieving') < pp.level) { msg(`You need a Thieving level of ${pp.level} to pickpocket the ${n.def.name.toLowerCase()}.`); return; }
    if (n.target) { msg('You can\'t pickpocket during combat.'); return; }
    msg(`You attempt to pick the ${n.def.name.toLowerCase()}'s pocket.`);
    setAnim(p, 'pickup');
    p.task = { timer: 2, interval: 2, fn: () => {
      if (Math.random() < Math.min(0.95, 0.55 + (lvl('thieving') - pp.level) * 0.02)) { invAddOrDrop('coins', pp.coins); addXp('thieving', pp.xp); msg(`You pick the ${n.def.name.toLowerCase()}'s pocket.`); }
      else { msg(`You fail to pick the ${n.def.name.toLowerCase()}'s pocket.`); say(n, 'What do you think you\'re doing?'); faceEnt(n, p); setAnim(n, 'punch'); damagePlayer(pp.stun, null); p.stun = 5; p.path = []; msg('You have been stunned.'); }
      return false;
    } };
  }

  // ---------- bank & shop ----------
  function openBank() { S.iface = { type: 'bank' }; S.dialog = null; }
  function bankDeposit(slot, n) {
    const it = S.inv[slot]; if (!it) return;
    n = Math.min(n, invCount(it.id));
    let b = S.bank.find(b => b.id === it.id);
    if (!b) { if (S.bank.length >= 400) { msg('Your bank is full.'); return; } b = { id: it.id, qty: 0 }; S.bank.push(b); }
    invRemove(it.id, n); b.qty += n;
  }
  function bankDepositAll() { for (let i = 0; i < 28; i++) if (S.inv[i]) bankDeposit(i, 1e9); }
  function bankDepositEquip() { for (const k of EQUIP_SLOTS) if (S.equip[k]) { const id = S.equip[k], q = k === 'ammo' ? S.ammoQty : 1; let b = S.bank.find(b => b.id === id); if (!b) { b = { id, qty: 0 }; S.bank.push(b); } b.qty += q; delete S.equip[k]; } S.ammoQty = 0; Models.applyEquipment(S.player.model, S.equip); }
  function bankWithdraw(bi, n) {
    const b = S.bank[bi]; if (!b) return;
    n = Math.min(n, b.qty);
    if (!ITEMS[b.id].stackable) n = Math.min(n, freeSlots());
    if (n <= 0 || !invAdd(b.id, n)) { msg('You don\'t have enough inventory space.'); return; }
    b.qty -= n; if (b.qty <= 0) S.bank.splice(bi, 1);
  }
  function openShop(id) {
    if (!S.shops[id]) S.shops[id] = SHOPS[id].stock.map(([iid, q]) => ({ id: iid, qty: q, base: q }));
    S.iface = { type: 'shop', shop: id }; S.dialog = null;
  }
  const buyPrice = id => Math.max(1, ITEMS[id].value);
  const sellPrice = id => Math.floor(ITEMS[id].value * 0.4);
  function shopBuy(id, si, n) {
    const st = S.shops[id][si]; if (!st) return;
    for (let k = 0; k < n; k++) {
      if (st.qty <= 0) { msg('The shop has run out of stock.'); break; }
      if (invCount('coins') < buyPrice(st.id)) { msg('You don\'t have enough coins.'); break; }
      if (!ITEMS[st.id].stackable && !freeSlots()) { msg('You don\'t have enough inventory space.'); break; }
      invRemove('coins', buyPrice(st.id)); invAdd(st.id); st.qty--;
    }
    if (st.qty <= 0 && !st.base) S.shops[id].splice(si, 1);
  }
  function shopSell(id, slot, n) {
    const it = S.inv[slot]; if (!it) return;
    if (it.id === 'coins' || !ITEMS[it.id].value) { msg('You can\'t sell this item.'); return; }
    const stock = S.shops[id];
    let st = stock.find(s => s.id === it.id);
    if (!st && id !== 'general') { msg('You can\'t sell this item to this shop.'); return; }
    const iid = it.id;
    n = Math.min(n, invCount(iid));
    for (let k = 0; k < n; k++) {
      if (!st) { if (stock.length >= 40) break; st = { id: iid, qty: 0, base: 0 }; stock.push(st); }
      invRemove(iid); st.qty++; invAddOrDrop('coins', sellPrice(iid));
    }
  }

  // ---------- combat ----------
  function damagePlayer(dmg, src) {
    const p = S.player;
    if (p.dead) return;
    dmg = Math.min(dmg, cur('hitpoints'));
    S.skills.hitpoints.cur -= dmg;
    p.splats.push({ dmg, t: now() }); p.hpBarUntil = now() + 6000;
    if (dmg > 0) Sfx.play('hit');
    if (S.skills.hitpoints.cur <= 0) { playerDie(); return; }
    if (src && !p.combat && S.autoRetaliate && !p.pending && !p.path.length && !src.dead && !p.forced) { p.combat = src; stopTask(); }
    if (src && !p.anim) setAnim(p, 'block');
  }
  function playerDie() {
    const p = S.player;
    p.dead = 4; p.path = []; p.combat = null; p.pending = null; stopTask(); p.forced = null;
    setAnim(p, 'death');
    for (const n of S.npcs) if (n.target === p) n.target = null;
    p.deathWild = wildLevel(p.x) > 0;
    p.deathPos = [p.x, p.z];
    S.prayers = {};
  }
  function respawnPlayer() {
    const p = S.player;
    if (p.deathWild) {
      // lose everything except the 3 most valuable items (4 with Protect Item)
      const all = [];
      S.inv.forEach((s, i) => { if (s) all.push({ id: s.id, qty: s.qty, where: 'inv' }); });
      for (const k of EQUIP_SLOTS) if (S.equip[k]) all.push({ id: S.equip[k], qty: k === 'ammo' ? S.ammoQty : 1, where: k });
      const single = [];
      for (const a of all) { if (ITEMS[a.id].stackable) single.push(a); else for (let i = 0; i < a.qty; i++) single.push({ id: a.id, qty: 1, where: a.where }); }
      single.sort((a, b) => ITEMS[b.id].value * (ITEMS[b.id].stackable ? b.qty : 1) - ITEMS[a.id].value * (ITEMS[a.id].stackable ? a.qty : 1));
      const keepN = 3;
      const keep = single.slice(0, keepN), lose = single.slice(keepN);
      S.inv = new Array(28).fill(null); S.equip = {}; S.ammoQty = 0;
      for (const k of keep) invAdd(k.id, k.qty);
      for (const l of lose) dropGround(l.id, l.qty, p.deathPos[0], p.deathPos[1], 300);
      Models.applyEquipment(p.model, S.equip);
      msg('You have lost your items in the Wilderness! Your 3 most valuable items were kept.', '#7f0000');
    }
    p.x = World.SPAWN.x; p.z = World.SPAWN.z; p.from = null; p.steps = [];
    S.skills.hitpoints.cur = lvl('hitpoints'); S.skills.prayer.cur = lvl('prayer');
    for (const k of SKILLS) if (k !== 'hitpoints' && k !== 'prayer') S.skills[k].cur = lvl(k);
    p.anim = null; p.energy = 100;
    msg('Oh dear, you are dead!');
  }
  function attackMode() {
    const p = S.player;
    if (p.castOnce) return { type: 'magic', spell: p.castOnce, range: 10 };
    if (S.autocast && weaponKind() === 'staff') return { type: 'magic', spell: SPELLS.find(s => s.id === S.autocast), range: 10 };
    if (weaponKind() === 'bow') return { type: 'ranged', range: S.style === 2 ? 9 : 7 };
    return { type: 'melee', range: 1 };
  }
  function hitChance(attRoll, defRoll) { return attRoll > defRoll ? 1 - (defRoll + 2) / (2 * (attRoll + 1)) : attRoll / (2 * (defRoll + 1)); }
  function playerCombat() {
    const p = S.player, n = p.combat;
    if (!n) return;
    if (n.dead) { p.combat = null; p.castOnce = null; return; }
    if (n.target && n.target !== p) { p.combat = null; msg('Someone else is fighting that.'); return; }
    const mode = attackMode();
    if (p.x === n.x && p.z === n.z) { for (const [dx, dz] of [[-1, 0], [1, 0], [0, 1], [0, -1]]) if (World.canStep(p.x, p.z, dx, dz)) { p.path = [[p.x + dx, p.z + dz]]; break; } return; }
    const inRange = mode.type === 'melee' ? npcReach(p, n) : cheb(p, n) <= mode.range;
    if (!inRange) {
      if (p.path.length === 0 || S.tick % 2 === 0) {
        const goal = mode.type === 'melee' ? (x, z) => npcReach({ x, z }, n) : (x, z) => Math.max(Math.abs(x - n.x), Math.abs(z - n.z)) <= mode.range && !(x === n.x && z === n.z);
        if (!pathTo(goal, n.x, n.z)) { p.combat = null; msg('I can\'t reach that!'); }
      }
      return;
    }
    p.path = [];
    faceEnt(p, n);
    if (p.attackTimer > 0) return;
    const b = bonuses();
    let dmg = 0, xpSkill = null, delay = 0;
    if (mode.type === 'melee') {
      const styleAtt = [3, 0, 0][S.style], styleStr = [0, 3, 0][S.style];
      const effAtt = Math.floor(cur('attack') * prayerMult('att')) + styleAtt + 8;
      const effStr = Math.floor(cur('strength') * prayerMult('str')) + styleStr + 8;
      const maxHit = Math.max(1, Math.floor(0.5 + effStr * (b.str + 64) / 640));
      if (Math.random() < hitChance(effAtt * (b.att + 64), (n.def.def + 9) * 64)) dmg = ri(0, maxHit);
      const wt = weaponType();
      setAnim(p, wt === 'unarmed' ? 'punch' : (wt === 'dagger' || (wt === 'sword' && S.style === 0)) ? 'stab' : 'slash');
      Sfx.play('swing');
      xpSkill = ['attack', 'strength', 'defence'][S.style];
      p.attackTimer = weaponSpeed();
    } else if (mode.type === 'ranged') {
      if (!S.equip.ammo || S.ammoQty <= 0) { msg('There is no ammo left in your quiver.'); p.combat = null; return; }
      const effR = cur('ranged') + (S.style === 0 ? 3 : 0) + 8;
      const maxHit = Math.max(1, Math.floor(0.5 + effR * (b.rstr + 64) / 640));
      if (Math.random() < hitChance(effR * (b.rng + 64), (n.def.def + 9) * 64)) dmg = ri(0, maxHit);
      const ammo = S.equip.ammo;
      S.ammoQty--; if (S.ammoQty <= 0) { delete S.equip.ammo; }
      if (Math.random() < 0.75) setTimeout(() => dropGround(ammo, 1, n.x, n.z), 600);
      setAnim(p, 'shoot');
      Render.projectile(p, n, 'arrow', ITEMS[ammo].icon.c);
      xpSkill = S.style === 2 ? 'longrange' : 'ranged';
      delay = 300 + cheb(p, n) * 70;
      p.attackTimer = weaponSpeed();
    } else {
      const sp = mode.spell;
      if (!canCast(sp, true)) { p.combat = null; p.castOnce = null; S.autocast = null; return; }
      payRunes(sp);
      const effM = cur('magic') + 8;
      const hit = Math.random() < hitChance(effM * (b.mag + 64), (n.def.def + 9) * 64);
      dmg = hit ? ri(0, sp.max) : -1;
      setAnim(p, 'cast');
      Render.projectile(p, n, 'magic', sp.col);
      addXp('magic', sp.xp);
      xpSkill = 'magic';
      delay = 500 + cheb(p, n) * 60;
      p.attackTimer = 5;
      p.castOnce = null;
      Sfx.play('teleport');
    }
    const applyHit = () => {
      if (n.dead) return;
      const real = Math.max(0, Math.min(dmg, n.hp));
      n.hp -= real;
      n.splats.push({ dmg: dmg < 0 ? 0 : real, t: now(), splash: dmg < 0 }); n.hpBarUntil = now() + 6000;
      if (real > 0) {
        if (xpSkill === 'magic') addXp('magic', real * 2);
        else if (xpSkill === 'longrange') { addXp('ranged', real * 2); addXp('defence', real * 2); }
        else addXp(xpSkill, real * 4);
        addXp('hitpoints', real * 1.33);
      }
      if (n.target !== p) { n.target = p; n.attackTimer = Math.max(n.attackTimer, 2); }
      if (n.hp <= 0) killNpc(n);
    };
    if (delay) setTimeout(applyHit, delay); else applyHit();
    if (n.target !== p) { n.target = p; n.attackTimer = Math.max(n.attackTimer, 2); }
  }
  function killNpc(n) {
    n.dead = true; n.deathAt = S.tick; setAnim(n, 'death');
    n.target = null; n.path = [];
    if (S.player.combat === n) S.player.combat = null;
    Sfx.play('death');
    if (S.slayer && S.slayer.npc === n.id && S.slayer.left > 0) {
      S.slayer.left--; addXp('slayer', n.def.hp);
      if (S.slayer.left === 0) { msg('You\'ve completed your task; return to a Slayer master.', '#7f0000'); }
    }
  }
  function npcDrops(n) {
    for (const d of n.def.drops || []) {
      if (d.always || Math.random() < d.chance) {
        const q = d.qty ? ri(d.qty[0], d.qty[1]) : 1;
        if (ITEMS[d.id].stackable) dropGround(d.id, q, n.x, n.z);
        else for (let k = 0; k < q; k++) dropGround(d.id, 1, n.x, n.z);
      }
    }
    if (n.id === 'skeleton' && S.quests.bones === 1 && !has('ancient_skull') && !S.ground.some(g => g.id === 'ancient_skull') && Math.random() < 0.4) dropGround('ancient_skull', 1, n.x, n.z);
  }
  function stepToward(e, tx, tz, avoidX, avoidZ) {
    const dx = Math.sign(tx - e.x), dz = Math.sign(tz - e.z);
    for (const [a, b] of [[dx, dz], [dx, 0], [0, dz]]) {
      if (a === 0 && b === 0) continue;
      const nx = e.x + a, nz = e.z + b;
      if (nx === avoidX && nz === avoidZ) continue;
      if (!World.canStep(e.x, e.z, a, b)) continue;
      if (S.npcs.some(o => o !== e && !o.dead && o.x === nx && o.z === nz)) continue;
      return [nx, nz];
    }
    return null;
  }
  function npcTick(n) {
    const p = S.player;
    if (n.dead) {
      if (n.deathAt === S.tick - 2) { n.model.visible = false; npcDrops(n); n.respawnAt = S.tick + (n.def.level > 30 ? 60 : 25); }
      if (n.respawnAt && S.tick >= n.respawnAt) { n.dead = false; n.respawnAt = 0; n.hp = n.def.hp; n.x = n.sx; n.z = n.sz; n.from = null; n.steps = []; n.model.visible = true; n.anim = null; }
      return;
    }
    // far away NPCs sleep
    if (Math.abs(n.x - p.x) > 40 || Math.abs(n.z - p.z) > 40) { n.target = null; return; }
    if (n.attackTimer > 0) n.attackTimer--;
    const d = n.def;
    if (d.aggressive && !n.target && !p.dead && !p.forced && Math.abs(p.x - n.x) <= 3 && Math.abs(p.z - n.z) <= 3 && (combatLevel() <= d.level * 2 + 1 || wildLevel(p.x) > 0) &&
      !S.npcs.some(o => o.target === p && !o.dead) && World.roofAt(p.x, p.z) < 0) {
      n.target = p;
      say(n, { ogre: 'RAAARGH!', bandit: 'Hand over your coins!', skeleton: '*rattle*', lesser_demon: 'Graaagh!' }[d.model === 'ogre' ? 'ogre' : n.id] || '');
      if (!n.overhead.text) n.overhead = null;
    }
    if (n.target) {
      if (p.dead || Math.abs(n.x - n.sx) > 14 || Math.abs(n.z - n.sz) > 14) { n.target = null; return; }
      if (npcReach(n, p)) {
        faceEnt(n, p);
        if (n.attackTimer <= 0 && !p.forced) {
          n.attackTimer = d.speed;
          setAnim(n, n.model.userData.kind === 'humanoid' ? (['guard', 'skeleton', 'slayer'].includes(d.model) ? 'slash' : 'punch') : 'attack');
          const b = bonuses();
          const effDef = Math.floor(cur('defence') * prayerMult('def')) + [0, 0, 3][S.style] + 8;
          let dmg = Math.random() < hitChance((d.att + 9) * 64, effDef * (b.def + 64)) ? ri(0, d.maxHit) : 0;
          if (S.prayers.protect_melee) dmg = 0;
          setTimeout(() => damagePlayer(dmg, n), 250);
        }
      } else {
        const opts = [[p.x - 1, p.z], [p.x + 1, p.z], [p.x, p.z - 1], [p.x, p.z + 1]];
        opts.sort((a, b) => (Math.abs(a[0] - n.x) + Math.abs(a[1] - n.z)) - (Math.abs(b[0] - n.x) + Math.abs(b[1] - n.z)));
        const st = stepToward(n, opts[0][0], opts[0][1], p.x, p.z);
        if (st) moveEnt(n, [st]);
      }
      return;
    }
    if (n.talkUntil && S.tick < n.talkUntil) return;
    if (!d.wander) return;
    if (Math.abs(n.x - n.sx) > d.wander + 2 || Math.abs(n.z - n.sz) > d.wander + 2) n.wanderGoal = [n.sx, n.sz];
    if (!n.wanderGoal && Math.random() < 0.08) n.wanderGoal = [n.sx + ri(-d.wander, d.wander), n.sz + ri(-d.wander, d.wander)];
    if (n.wanderGoal) {
      const [gx, gz] = n.wanderGoal;
      if (gx === n.x && gz === n.z) { n.wanderGoal = null; return; }
      const st = stepToward(n, gx, gz, p.x, p.z);
      if (st) moveEnt(n, [st]); else n.wanderGoal = null;
    }
  }

  // ---------- movement ----------
  function moveEnt(e, tiles) {
    e.from = [e.x, e.z];
    e.steps = tiles.slice();
    const last = tiles[tiles.length - 1];
    const prev = tiles.length > 1 ? tiles[tiles.length - 2] : e.from;
    e.face = Math.atan2(last[0] - prev[0], last[1] - prev[1]);
    e.x = last[0]; e.z = last[1];
    e.moveTick = S.tick;
  }
  function playerMove() {
    const p = S.player;
    if (!p.path.length || p.stun > 0) return;
    const n = (p.run && p.energy >= 1 && p.path.length >= 2) ? 2 : 1;
    const tiles = [];
    for (let i = 0; i < n && p.path.length; i++) {
      const [nx, nz] = p.path[0];
      const cx = tiles.length ? tiles[tiles.length - 1][0] : p.x, cz = tiles.length ? tiles[tiles.length - 1][1] : p.z;
      if (!World.canStep(cx, cz, nx - cx, nz - cz)) { p.path = []; break; }
      tiles.push(p.path.shift());
    }
    if (tiles.length) {
      moveEnt(p, tiles);
      p.runningStep = tiles.length === 2;
      if (tiles.length === 2) { p.energy = Math.max(0, p.energy - 0.67); if (p.energy <= 0) p.run = false; }
      if (p.task && p.loop) stopTask();
      p.anim = null;
    }
  }

  // ---------- main tick ----------
  function tick() {
    S.tick++;
    const p = S.player;
    for (const e of [p, ...S.npcs]) if (e.moveTick !== S.tick - 1) { e.from = null; e.steps = []; }
    if (p.dead) { p.dead--; if (p.dead === 0) respawnPlayer(); }
    else if (p.forced) forcedTick();
    else {
      p.moveAnim = null;
      if (p.stun > 0) { p.stun--; if (p.stun === 0) p.anim = null; }
      if (p.attackTimer > 0) p.attackTimer--;
      if (p.eatDelay > 0) p.eatDelay--;
      processPending();
      const before = [p.x, p.z];
      playerMove();
      if (before[0] !== p.x || before[1] !== p.z) processPending();
      else if (!p.steps.length) p.runningStep = false;
      if (p.task && p.path.length === 0) {
        if (--p.task.timer <= 0) {
          p.task.timer = p.task.interval;
          const t = p.task;
          if (!t.fn() && p.task === t) stopTask();
        }
      }
      playerCombat();
    }
    for (const n of S.npcs) npcTick(n);
    if (S.tick % (S.prayers.rapid_heal ? 50 : 100) === 0 && cur('hitpoints') < lvl('hitpoints') && !p.dead) S.skills.hitpoints.cur++;
    if (S.tick % 100 === 0) for (const k of SKILLS) { if (k === 'hitpoints' || k === 'prayer') continue; if (S.skills[k].cur < lvl(k)) S.skills[k].cur++; else if (S.skills[k].cur > lvl(k)) S.skills[k].cur--; }
    if (!p.runningStep) p.energy = Math.min(100, p.energy + 0.45 + lvl('agility') * 0.01);
    let drain = 0; for (const pr of PRAYERS) if (S.prayers[pr.id]) drain += pr.drain / 3;
    if (drain > 0) { S.skills.prayer.cur = Math.max(0, S.skills.prayer.cur - drain); if (S.skills.prayer.cur <= 0) { S.prayers = {}; msg('You have run out of Prayer points, you can recharge at an altar.'); Sfx.play('prayoff'); } }
    for (const loc of World.locs.slice()) if (loc.type === 'fire' && S.tick >= loc.expire) { World.removeLocLive(loc); dropGround('ashes', 1, loc.x, loc.z); }
    for (const g of S.ground.slice()) if (S.tick >= g.until) removeGround(g);
    if (S.tick % 60 === 0) for (const id in S.shops) for (const st of S.shops[id]) { if (st.qty < st.base) st.qty++; else if (st.qty > st.base) st.qty--; }
    if (S.tick % 30 === 0) moveFishingSpot();
    if (S.tick % 50 === 0) growPatches();
    trapTick();
    if (S.tick % 10 === 0) save();
    S.lastTick = now();
  }
  function moveFishingSpot() {
    const spots = World.locs.filter(l => l.type === 'fishing_spot');
    if (!spots.length || Math.random() < 0.5) return;
    const s = spots[ri(0, spots.length - 1)];
    const free = World.fishTiles.filter(([x, z]) => !World.locAt(x, z));
    if (!free.length) return;
    const [x, z] = free[ri(0, free.length - 1)];
    World.removeLocLive(s); World.fishTiles.push([s.x, s.z]);
    World.fishTiles.splice(World.fishTiles.findIndex(t => t[0] === x && t[1] === z), 1);
    World.addLocLive('fishing_spot', x, z);
  }

  // ---------- save / load (persists in browser storage, auto-login on refresh) ----------
  const KEY = n => 'ardenvale_' + n.toLowerCase();
  function save() {
    if (!S.loggedIn) return;
    const p = S.player;
    const patches = {};
    for (const l of World.locs) if (l.patch) patches[l.x + ',' + l.z] = l.patch;
    const data = { v: 2, skills: S.skills, inv: S.inv, equip: S.equip, ammo: S.ammoQty, bank: S.bank, quests: S.quests, qp: S.questPoints, x: p.x, z: p.z, style: S.style, run: p.run, energy: p.energy, ar: S.autoRetaliate, slayer: S.slayer, patches, gift: S.gift, autocast: S.autocast, bright: S.settings.brightness };
    try { localStorage.setItem(KEY(S.name), JSON.stringify(data)); localStorage.setItem('ardenvale_last', S.name); } catch (e) { }
  }
  function load(name) {
    S.name = name;
    for (const k of SKILLS) S.skills[k] = { xp: 0, cur: 1 };
    S.skills.hitpoints = { xp: XP_TABLE[10], cur: 10 };
    let data = null;
    try { data = JSON.parse(localStorage.getItem(KEY(name))); } catch (e) { }
    for (const l of World.locs) if (l.type === 'allotment' || l.type === 'herbpatch') l.patch = { state: 'weeds', stage: 3 };
    if (data) {
      for (const k of SKILLS) if (data.skills[k]) S.skills[k] = data.skills[k];
      S.inv = data.inv.map(s => s && ITEMS[s.id] ? s : null); S.equip = data.equip || {}; for (const k in S.equip) if (!ITEMS[S.equip[k]]) delete S.equip[k];
      S.ammoQty = data.ammo || 0; S.bank = (data.bank || []).filter(b => ITEMS[b.id]);
      Object.assign(S.quests, data.quests || {}); S.questPoints = data.qp || 0;
      S.style = data.style || 0; S.autoRetaliate = data.ar !== false; S.slayer = data.slayer || null; S.gift = data.gift; S.autocast = data.autocast || null;
      S.settings.brightness = data.bright == null ? 2 : data.bright;
      for (const l of World.locs) if (l.patch && data.patches && data.patches[l.x + ',' + l.z]) { l.patch = data.patches[l.x + ',' + l.z]; World.refreshLoc(l); }
    } else {
      S.inv = new Array(28).fill(null);
      for (const [id, q] of [['bronze_axe', 1], ['tinderbox', 1], ['small_net', 1], ['shrimps', 1], ['bronze_pickaxe', 1], ['hammer', 1], ['knife', 1], ['shrimps', 1], ['bronze_dagger', 1], ['shortbow', 1], ['bronze_arrow', 50], ['air_rune', 30], ['mind_rune', 30], ['coins', 25]]) invAdd(id, q);
    }
    initPlayer();
    // starter armour gift for everyone (once)
    if (!S.gift) {
      S.gift = 1;
      const set = { head: 'bronze_full_helm', body: 'bronze_platebody', legs: 'bronze_platelegs', shield: 'bronze_kiteshield', weapon: 'bronze_scimitar' };
      let banked = false;
      for (const k in set) { if (!S.equip[k]) S.equip[k] = set[k]; else { S.bank.push({ id: set[k], qty: 1 }); banked = true; } }
      msg('You have been given a set of bronze armour and a scimitar' + (banked ? ' (some pieces were sent to your bank).' : '.'), '#000080');
    }
    if (data) {
      if (data.v === 2 && World.walkable(data.x, data.z)) { S.player.x = data.x; S.player.z = data.z; }
      S.player.run = !!data.run; S.player.energy = data.energy == null ? 100 : data.energy;
      if (S.quests.bridge === 2) World.setBridgeOpen(true);
      msg('Welcome back to ' + WORLD_NAME + '.');
    } else {
      msg('Welcome to ' + WORLD_NAME + '.');
      msg('Talk to Elder Brannoc, west of the fountain, to begin your adventure.', '#0000ff');
    }
    Models.applyEquipment(S.player.model, S.equip);
    S.loggedIn = true;
    S.lastTick = now();
    save();
  }
  function logout() { save(); try { localStorage.removeItem('ardenvale_last'); } catch (e) { } location.reload(); }

  function init(scene) {
    S.scene = scene;
    for (const [id, x, z] of World.NPC_SPAWNS) if (NPCS[id]) spawnNpc(id, x, z);
  }
  function emote(name) { const p = S.player; if (p.dead) return; resetActions(); p.path = []; setAnim(p, name); }

  return {
    S, tick, msg, lvl, cur, combatLevel, totalLevel, invCount, freeSlots, itemOps, invAction, swapInv, unequip, bonuses, locOps,
    walkTo, interact, useItemOn, useItemOnItem, togglePrayer, openBank, bankDeposit, bankDepositAll, bankDepositEquip, bankWithdraw,
    shopBuy, shopSell, buyPrice, sellPrice, smith, openSmithing, load, logout, save, init, styleNames, weaponType, weaponKind,
    homeTeleport, emote, resetActions, dropGround, castSpell, castOn, castOnItem, canCast, region, wildLevel, METALS, barOf,
  };
})();
