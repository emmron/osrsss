// ===== Static game data: skills, items, NPCs, recipes =====
const TICK_MS = 600;
const WORLD_NAME = 'Ardenvale';

// ---- Skills (2005 stats tab order, 3 columns) ----
const SKILLS = [
  'attack', 'hitpoints', 'mining',
  'strength', 'agility', 'smithing',
  'defence', 'herblore', 'fishing',
  'ranged', 'thieving', 'cooking',
  'prayer', 'crafting', 'firemaking',
  'magic', 'fletching', 'woodcutting',
  'runecrafting', 'slayer', 'farming',
  'hunter',
];
const SKILL_NAMES = {};
SKILLS.forEach(s => SKILL_NAMES[s] = s.charAt(0).toUpperCase() + s.slice(1));

const XP_TABLE = (() => {
  const t = [0, 0];
  let pts = 0;
  for (let l = 1; l < 99; l++) { pts += Math.floor(l + 300 * Math.pow(2, l / 7)); t.push(Math.floor(pts / 4)); }
  return t;
})();
function levelForXp(xp) { for (let l = 99; l >= 1; l--) if (xp >= XP_TABLE[l]) return l; return 1; }

// ---- Items ----
const ITEMS = {};
function defItem(id, o) { ITEMS[id] = Object.assign({ id, stackable: false, value: 1, examine: 'An item.' }, o); }
const BRONZE = '#9a6a3a', IRON = '#6e6a66';
const EQ = (slot, o) => Object.assign({ slot, att: 0, str: 0, def: 0, rng: 0, rstr: 0, mag: 0, req: {} }, o);

defItem('coins', { name: 'Coins', stackable: true, icon: { t: 'coins' }, examine: 'Lovely money!' });
// tools
defItem('bronze_axe', { name: 'Bronze axe', value: 16, icon: { t: 'axe', c: BRONZE }, tool: { wc: 1, power: 1 }, equip: EQ('weapon', { att: 4, str: 5, speed: 5 }), examine: 'A woodcutter\'s axe.' });
defItem('iron_axe', { name: 'Iron axe', value: 56, icon: { t: 'axe', c: IRON }, tool: { wc: 1, power: 2 }, equip: EQ('weapon', { att: 6, str: 7, speed: 5 }), examine: 'A sturdy woodcutter\'s axe.' });
defItem('bronze_pickaxe', { name: 'Bronze pickaxe', value: 1, icon: { t: 'pickaxe', c: BRONZE }, tool: { mine: 1, power: 1 }, equip: EQ('weapon', { att: 4, str: 5, speed: 5 }), examine: 'Used for mining.' });
defItem('iron_pickaxe', { name: 'Iron pickaxe', value: 140, icon: { t: 'pickaxe', c: IRON }, tool: { mine: 1, power: 2 }, equip: EQ('weapon', { att: 5, str: 7, speed: 5 }), examine: 'Used for mining. Faster than bronze.' });
defItem('small_net', { name: 'Small fishing net', value: 5, icon: { t: 'net' }, examine: 'Useful for catching small fish.' });
defItem('tinderbox', { name: 'Tinderbox', value: 1, icon: { t: 'tinderbox' }, examine: 'Useful for lighting a fire.' });
defItem('hammer', { name: 'Hammer', value: 1, icon: { t: 'hammer' }, examine: 'Good for hitting things!' });
defItem('knife', { name: 'Knife', value: 6, icon: { t: 'knife' }, examine: 'A dangerous looking knife.' });
defItem('needle', { name: 'Needle', value: 1, icon: { t: 'needle' }, examine: 'Used with a thread to make clothes.' });
defItem('thread', { name: 'Thread', stackable: true, value: 1, icon: { t: 'thread' }, examine: 'Use with a needle to make clothes.' });
defItem('rake', { name: 'Rake', value: 6, icon: { t: 'rake' }, examine: 'Use this to clear weeds.' });
defItem('seed_dibber', { name: 'Seed dibber', value: 6, icon: { t: 'dibber' }, examine: 'Use this to plant seeds with.' });
defItem('spade', { name: 'Spade', value: 3, icon: { t: 'spade' }, examine: 'A slightly muddy spade.' });
defItem('vial', { name: 'Vial', value: 2, icon: { t: 'vial', c: null }, examine: 'An empty glass vial.' });
defItem('vial_water', { name: 'Vial of water', value: 2, icon: { t: 'vial', c: '#6080e0' }, examine: 'A glass vial containing water.' });

// woodcutting / fletching
defItem('logs', { name: 'Logs', value: 4, icon: { t: 'logs', c: '#7a5230' }, examine: 'A number of wooden logs.' });
defItem('oak_logs', { name: 'Oak logs', value: 20, icon: { t: 'logs', c: '#9a7040' }, examine: 'Logs cut from an oak tree.' });
defItem('willow_logs', { name: 'Willow logs', value: 32, icon: { t: 'logs', c: '#7d7a3a' }, examine: 'Logs cut from a willow tree.' });
defItem('maple_logs', { name: 'Maple logs', value: 50, icon: { t: 'logs', c: '#a0562a' }, examine: 'Logs cut from a maple tree.' });
defItem('yew_logs', { name: 'Yew logs', value: 160, icon: { t: 'logs', c: '#6a5a30' }, examine: 'Logs cut from a yew tree.' });
defItem('magic_logs', { name: 'Magic logs', value: 320, icon: { t: 'logs', c: '#3a6aa0' }, examine: 'Logs made from magic wood.' });
defItem('ashes', { name: 'Ashes', value: 2, icon: { t: 'ashes' }, examine: 'A heap of ashes.' });
defItem('arrow_shaft', { name: 'Arrow shaft', stackable: true, value: 1, icon: { t: 'shafts' }, examine: 'A wooden arrow shaft.' });
defItem('headless_arrow', { name: 'Headless arrow', stackable: true, value: 1, icon: { t: 'arrows', c: null }, examine: 'An arrow shaft with feathers.' });
defItem('bow_string', { name: 'Bow string', value: 10, icon: { t: 'bowstring' }, examine: 'I need a bow stave to attach this to.' });
defItem('flax', { name: 'Flax', value: 5, icon: { t: 'flax' }, examine: 'I should use this with a spinning wheel.' });
const BOWS = [
  ['shortbow', 'Shortbow', '#8a5a2a', 5, 5, 8, 1, 4],
  ['longbow', 'Longbow', '#8a5a2a', 10, 10, 8, 1, 6],
  ['oak_shortbow', 'Oak shortbow', '#a07a40', 20, 16.5, 14, 5, 4],
  ['oak_longbow', 'Oak longbow', '#a07a40', 25, 25, 14, 5, 6],
  ['willow_shortbow', 'Willow shortbow', '#8a8a3a', 35, 33.3, 20, 20, 4],
  ['willow_longbow', 'Willow longbow', '#8a8a3a', 40, 41.5, 20, 20, 6],
  ['maple_shortbow', 'Maple shortbow', '#a0562a', 50, 50, 29, 30, 4],
  ['maple_longbow', 'Maple longbow', '#a0562a', 55, 58.3, 29, 30, 6],
  ['yew_shortbow', 'Yew shortbow', '#6a5a30', 65, 67.5, 47, 40, 4],
  ['yew_longbow', 'Yew longbow', '#6a5a30', 70, 75, 47, 40, 6],
  ['magic_shortbow', 'Magic shortbow', '#3a6aa0', 80, 83.3, 69, 50, 4],
  ['magic_longbow', 'Magic longbow', '#3a6aa0', 85, 91.5, 69, 50, 6],
];
const BOW_LOG = {}; for (const [id] of BOWS) BOW_LOG[id] = id.includes('_') ? id.split('_')[0] + '_logs' : 'logs';
for (const [id, name, col, lv, xp, rng, req, speed] of BOWS) {
  const long = id.includes('long');
  defItem(id + '_u', { name: name + ' (u)', value: lv * 4, icon: { t: 'bow', c: col, long, unstrung: true }, examine: 'I need to find a string for this.' });
  defItem(id, { name, value: lv * 10, icon: { t: 'bow', c: col, long }, equip: EQ('weapon', { kind: 'bow', rng, speed, req: { ranged: req } }), examine: long ? 'A nice sturdy bow.' : 'Short but effective.' });
}
const FLETCH_BOW = BOWS.map(([id, name, c, level, xp]) => ({ out: id + '_u', bow: id, log: BOW_LOG[id], level, xp }));

// mining / smithing
defItem('copper_ore', { name: 'Copper ore', value: 3, icon: { t: 'ore', c: '#c0703a' }, examine: 'This needs refining.' });
defItem('tin_ore', { name: 'Tin ore', value: 3, icon: { t: 'ore', c: '#b8b8b0' }, examine: 'This needs refining.' });
defItem('iron_ore', { name: 'Iron ore', value: 17, icon: { t: 'ore', c: '#7a3d2a' }, examine: 'This needs refining.' });
defItem('coal', { name: 'Coal', value: 45, icon: { t: 'ore', c: '#1a1a1a' }, examine: 'Hmm a non-renewable energy source!' });
defItem('gold_ore', { name: 'Gold ore', value: 150, icon: { t: 'ore', c: '#e8c030' }, examine: 'This needs refining.' });
defItem('mithril_ore', { name: 'Mithril ore', value: 162, icon: { t: 'ore', c: '#4a4aa0' }, examine: 'This needs refining.' });
defItem('adamantite_ore', { name: 'Adamantite ore', value: 400, icon: { t: 'ore', c: '#3a6a3a' }, examine: 'This needs refining.' });
defItem('runite_ore', { name: 'Runite ore', value: 3200, icon: { t: 'ore', c: '#40a0c0' }, examine: 'This needs refining.' });
defItem('steel_bar', { name: 'Steel bar', value: 100, icon: { t: 'bar', c: '#9aa0a8' }, examine: "It's a bar of steel." });
defItem('gold_bar', { name: 'Gold bar', value: 300, icon: { t: 'bar', c: '#e8c030' }, examine: "It's a bar of gold." });
defItem('mithril_bar', { name: 'Mithril bar', value: 300, icon: { t: 'bar', c: '#4a4aa0' }, examine: "It's a bar of mithril." });
defItem('adamantite_bar', { name: 'Adamantite bar', value: 640, icon: { t: 'bar', c: '#3a6a3a' }, examine: "It's a bar of adamantite." });
defItem('runite_bar', { name: 'Runite bar', value: 3200, icon: { t: 'bar', c: '#40a0c0' }, examine: "It's a bar of runite." });
defItem('gold_ring', { name: 'Gold ring', value: 350, icon: { t: 'ring', c: '#e8c030' }, equip: EQ('ring', {}), examine: 'A valuable ring.' });
defItem('gold_amulet', { name: 'Gold amulet', value: 350, icon: { t: 'amulet', c: '#e8c030' }, equip: EQ('neck', { att: 1, str: 1, def: 1 }), examine: 'A plain gold amulet.' });
defItem('ancient_skull', { name: 'Ancient skull', value: 0, icon: { t: 'skull' }, examine: 'It belongs to a restless soul.' });
defItem('strange_talisman', { name: 'Strange talisman', value: 0, icon: { t: 'talisman', c: '#a0a0a0' }, examine: 'A dull stone talisman from Orla.' });
defItem('charged_talisman', { name: 'Charged talisman', value: 0, icon: { t: 'talisman', c: '#e8e8f8' }, examine: 'It hums with the power of air.' });
// hunter
defItem('bird_snare', { name: 'Bird snare', value: 6, icon: { t: 'snare' }, examine: 'A simple bird catcher.' });
defItem('box_trap', { name: 'Box trap', value: 38, icon: { t: 'boxtrap' }, examine: 'A box trap for catching small animals.' });
defItem('raw_bird_meat', { name: 'Raw bird meat', value: 3, icon: { t: 'drumstick', c: '#e09080' }, examine: 'I need to cook this first.' });
defItem('cooked_bird_meat', { name: 'Roast bird meat', value: 6, icon: { t: 'drumstick', c: '#a05a28' }, food: 6, examine: 'A tasty roasted bird.' });
defItem('crimson_feather', { name: 'Crimson swift feather', stackable: true, value: 4, icon: { t: 'feather', c: '#d03020' }, examine: 'A bright red feather.' });
defItem('yellow_feather', { name: 'Golden warbler feather', stackable: true, value: 6, icon: { t: 'feather', c: '#e8c030' }, examine: 'A bright yellow feather.' });
defItem('ferret', { name: 'Ferret', value: 30, icon: { t: 'ferret', c: '#c8a070' }, examine: 'A furry little ferret. Kinda cute.' });
defItem('chinchompa', { name: 'Chinchompa', stackable: true, value: 120, icon: { t: 'ferret', c: '#a0a0a0' }, examine: 'An explosive little critter.' });
defItem('rune_essence', { name: 'Rune essence', value: 4, icon: { t: 'essence' }, examine: 'An uncharged rune stone.' });
defItem('bronze_bar', { name: 'Bronze bar', value: 8, icon: { t: 'bar', c: BRONZE }, examine: 'It\'s a bar of bronze.' });
defItem('iron_bar', { name: 'Iron bar', value: 28, icon: { t: 'bar', c: IRON }, examine: 'It\'s a bar of iron.' });
defItem('bronze_arrowtips', { name: 'Bronze arrowtips', stackable: true, value: 1, icon: { t: 'tips', c: BRONZE }, examine: 'I can make some arrows with these.' });
defItem('iron_arrowtips', { name: 'Iron arrowtips', stackable: true, value: 3, icon: { t: 'tips', c: IRON }, examine: 'I can make some arrows with these.' });
defItem('bronze_arrow', { name: 'Bronze arrow', stackable: true, value: 1, icon: { t: 'arrows', c: BRONZE }, equip: EQ('ammo', { rstr: 7 }), examine: 'Arrows with bronze heads.' });
defItem('iron_arrow', { name: 'Iron arrow', stackable: true, value: 3, icon: { t: 'arrows', c: IRON }, equip: EQ('ammo', { rstr: 10 }), examine: 'Arrows with iron heads.' });
defItem('steel_arrowtips', { name: 'Steel arrowtips', stackable: true, value: 6, icon: { t: 'tips', c: '#9aa0a8' }, examine: 'I can make some arrows with these.' });
defItem('mithril_arrowtips', { name: 'Mithril arrowtips', stackable: true, value: 16, icon: { t: 'tips', c: '#4a4aa0' }, examine: 'I can make some arrows with these.' });
defItem('steel_arrow', { name: 'Steel arrow', stackable: true, value: 12, icon: { t: 'arrows', c: '#9aa0a8' }, equip: EQ('ammo', { rstr: 16 }), examine: 'Arrows with steel heads.' });
defItem('mithril_arrow', { name: 'Mithril arrow', stackable: true, value: 32, icon: { t: 'arrows', c: '#4a4aa0' }, equip: EQ('ammo', { rstr: 22 }), examine: 'Arrows with mithril heads.' });
const ARROWS = [['bronze', 1, 1.3], ['iron', 15, 2.5], ['steel', 30, 5], ['mithril', 45, 7.5]];

// fishing / cooking / food
defItem('raw_shrimps', { name: 'Raw shrimps', value: 5, icon: { t: 'shrimp', c: '#c89080' }, examine: 'I should try cooking this.' });
defItem('shrimps', { name: 'Shrimps', value: 5, icon: { t: 'shrimp', c: '#e07040' }, food: 3, examine: 'Some nicely cooked shrimp.' });
defItem('burnt_shrimp', { name: 'Burnt shrimp', value: 1, icon: { t: 'shrimp', c: '#3a2a20' }, examine: 'Oops!' });
defItem('raw_anchovies', { name: 'Raw anchovies', value: 15, icon: { t: 'fish', c: '#8a9aa8' }, examine: 'I should try cooking this.' });
defItem('anchovies', { name: 'Anchovies', value: 15, icon: { t: 'fish', c: '#8a6a50' }, food: 1, examine: 'Some tasty anchovies.' });
defItem('burnt_fish', { name: 'Burnt fish', value: 1, icon: { t: 'fish', c: '#3a2a20' }, examine: 'Oops!' });
defItem('raw_beef', { name: 'Raw beef', value: 1, icon: { t: 'meat', c: '#c04848' }, examine: 'I need to cook this first.' });
defItem('cooked_meat', { name: 'Cooked meat', value: 4, icon: { t: 'meat', c: '#8a4a2a' }, food: 3, examine: 'Mmm, this looks tasty.' });
defItem('burnt_meat', { name: 'Burnt meat', value: 1, icon: { t: 'meat', c: '#2e2420' }, examine: 'Oh dear, it\'s totally burnt!' });
defItem('raw_chicken', { name: 'Raw chicken', value: 1, icon: { t: 'drumstick', c: '#e8b0a0' }, examine: 'I need to cook this first.' });
defItem('cooked_chicken', { name: 'Cooked chicken', value: 4, icon: { t: 'drumstick', c: '#b06a30' }, food: 3, examine: 'Mmm, this looks tasty.' });
defItem('burnt_chicken', { name: 'Burnt chicken', value: 1, icon: { t: 'drumstick', c: '#2e2420' }, examine: 'Oh dear, it\'s totally burnt!' });
defItem('cake', { name: 'Cake', value: 50, icon: { t: 'cake' }, food: 4, examine: 'A plain sponge cake.' });
defItem('banana', { name: 'Banana', value: 2, icon: { t: 'banana' }, food: 2, examine: 'Mmm this looks tasty.' });
defItem('potato', { name: 'Potato', value: 1, icon: { t: 'veg', c: '#b08a50' }, food: 1, examine: 'A potato.' });
defItem('onion', { name: 'Onion', value: 3, icon: { t: 'veg', c: '#d8c8a0', onion: true }, food: 1, examine: 'A strong smelling onion.' });
defItem('cabbage', { name: 'Cabbage', value: 1, icon: { t: 'veg', c: '#6aa040', cabbage: true }, food: 2, examine: 'Yuck, I don\'t like cabbage.' });

// drops / misc
defItem('bones', { name: 'Bones', value: 1, icon: { t: 'bones' }, bury: 4.5, examine: 'Bones are for burying!' });
defItem('big_bones', { name: 'Big bones', value: 1, icon: { t: 'bones', big: true }, bury: 15, examine: 'Ooh, those are big bones!' });
defItem('cowhide', { name: 'Cowhide', value: 1, icon: { t: 'hide' }, examine: 'I should take this to a tanner.' });
defItem('leather', { name: 'Leather', value: 1, icon: { t: 'leather' }, examine: 'It\'s a piece of leather.' });
defItem('feather', { name: 'Feather', stackable: true, value: 2, icon: { t: 'feather' }, examine: 'Used for fly-fishing and fletching.' });
defItem('silk', { name: 'Silk', value: 60, icon: { t: 'silk' }, examine: 'It\'s a sheet of silk.' });
defItem('repair_kit', { name: 'Bridge planks', value: 0, icon: { t: 'planks' }, examine: 'Planks for repairing the old bridge.' });

// runes / magic
const RUNES = { air: '#e8e8f8', mind: '#e8a040', water: '#3a70e0', earth: '#8a5a2a', fire: '#e03018', body: '#6a6af0', chaos: '#f0c020', nature: '#30b030', law: '#3040c0' };
for (const r in RUNES) defItem(r + '_rune', { name: r.charAt(0).toUpperCase() + r.slice(1) + ' rune', stackable: true, value: { air: 4, mind: 3, water: 4, earth: 4, fire: 4, body: 5, chaos: 90, nature: 180, law: 240 }[r], icon: { t: 'rune', c: RUNES[r], r }, examine: `One of the 4 basic elemental runes.`.replace('One of the 4 basic elemental runes.', `A ${r} rune.`) });
defItem('staff', { name: 'Staff', value: 15, icon: { t: 'staff', c: '#7a5a3a' }, equip: EQ('weapon', { kind: 'staff', att: 2, str: 2, def: 2, mag: 2, speed: 5 }), examine: 'It\'s a slightly magical stick.' });
defItem('staff_of_air', { name: 'Staff of air', value: 1500, icon: { t: 'staff', c: '#7a5a3a', orb: '#e8e8f8' }, equip: EQ('weapon', { kind: 'staff', att: 2, str: 3, def: 2, mag: 10, speed: 5, provides: 'air' }), examine: 'A magical staff.' });
defItem('staff_of_fire', { name: 'Staff of fire', value: 1500, icon: { t: 'staff', c: '#7a5a3a', orb: '#ff5020' }, equip: EQ('weapon', { kind: 'staff', att: 2, str: 3, def: 2, mag: 10, speed: 5, provides: 'fire' }), examine: 'A magical staff.' });
defItem('wizard_hat', { name: 'Wizard hat', value: 2, icon: { t: 'wizhat', c: '#2a3a9a' }, equip: EQ('head', { mag: 2 }), examine: 'A silly pointed hat.' });
defItem('wizard_robe', { name: 'Wizard robe top', value: 15, icon: { t: 'robe', c: '#2a3a9a' }, equip: EQ('body', { mag: 3, color: '#2a3a9a' }), examine: 'I can do magic better in this.' });

// herblore
const HERBS = [['guam', 'Guam leaf', '#4a9a2a', 3, 2.5], ['tarromin', 'Tarromin', '#5a8a3a', 11, 5], ['harralander', 'Harralander', '#6a8a1a', 20, 6.3]];
for (const [id, name, col, lv, xp] of HERBS) {
  defItem('grimy_' + id, { name: 'Grimy ' + name.toLowerCase().replace(' leaf', ''), value: 10, icon: { t: 'herb', c: '#5a5a2a' }, herb: { clean: id + '_leaf', level: lv, xp }, examine: 'I need to clean this herb before I can use it.' });
  defItem(id + '_leaf', { name, value: 15, icon: { t: 'herb', c: col }, examine: 'A fresh herb.' });
  defItem(id + '_unf', { name: name.replace(' leaf', '') + ' potion (unf)', value: 10, icon: { t: 'vial', c: col }, examine: 'I need another ingredient to finish this potion.' });
}
defItem('eye_of_newt', { name: 'Eye of newt', value: 3, icon: { t: 'eye' }, examine: 'It seems to be looking at me.' });
defItem('limpwurt_root', { name: 'Limpwurt root', value: 7, icon: { t: 'root' }, examine: 'The root of a limpwurt plant.' });
defItem('white_berries', { name: 'White berries', value: 10, icon: { t: 'berries' }, examine: 'Poisonous berries.' });
const POTIONS = [
  { id: 'attack_potion', name: 'Attack potion', col: '#40c0d0', unf: 'guam_unf', sec: 'eye_of_newt', level: 3, xp: 25, boost: 'attack', base: 3, pct: 0.1 },
  { id: 'strength_potion', name: 'Strength potion', col: '#c0c040', unf: 'tarromin_unf', sec: 'limpwurt_root', level: 12, xp: 50, boost: 'strength', base: 3, pct: 0.1 },
  { id: 'defence_potion', name: 'Defence potion', col: '#40c040', unf: 'harralander_unf', sec: 'white_berries', level: 30, xp: 75, boost: 'defence', base: 3, pct: 0.1 },
];
for (const p of POTIONS) for (let d = 1; d <= 4; d++) defItem(`${p.id}${d}`, { name: `${p.name}(${d})`, value: 20 * d, icon: { t: 'vial', c: p.col, dose: d }, potion: { p, dose: d }, examine: `${d} dose${d > 1 ? 's' : ''} of ${p.name.toLowerCase()}.` });

// farming
const SEEDS = {
  potato_seed: { name: 'Potato seed', crop: 'potato', level: 1, plantXp: 8, harvestXp: 9, need: 3, patch: 'allotment', col: '#b08a50' },
  onion_seed: { name: 'Onion seed', crop: 'onion', level: 5, plantXp: 9.5, harvestXp: 10.5, need: 3, patch: 'allotment', col: '#d8c8a0' },
  cabbage_seed: { name: 'Cabbage seed', crop: 'cabbage', level: 7, plantXp: 10, harvestXp: 11.5, need: 3, patch: 'allotment', col: '#6aa040' },
  guam_seed: { name: 'Guam seed', crop: 'grimy_guam', level: 9, plantXp: 11, harvestXp: 12.5, need: 1, patch: 'herb', col: '#4a9a2a' },
  tarromin_seed: { name: 'Tarromin seed', crop: 'grimy_tarromin', level: 19, plantXp: 19, harvestXp: 21.5, need: 1, patch: 'herb', col: '#5a8a3a' },
  harralander_seed: { name: 'Harralander seed', crop: 'grimy_harralander', level: 26, plantXp: 21.5, harvestXp: 27, need: 1, patch: 'herb', col: '#6a8a1a' },
};
for (const id in SEEDS) defItem(id, { name: SEEDS[id].name, stackable: true, value: 4, icon: { t: 'seed', c: SEEDS[id].col }, examine: 'Plant this in a farming patch.' });
defItem('weeds', { name: 'Weeds', value: 1, icon: { t: 'weeds' }, examine: 'A handful of weeds.' });

// crafting (leather)
defItem('leather_gloves', { name: 'Leather gloves', value: 6, icon: { t: 'gloves' }, equip: EQ('hands', { def: 1 }), examine: 'These will keep my hands warm.' });
defItem('leather_boots', { name: 'Leather boots', value: 6, icon: { t: 'boots' }, equip: EQ('feet', { def: 1 }), examine: 'Comfortable leather boots.' });
defItem('leather_cowl', { name: 'Leather cowl', value: 24, icon: { t: 'cowl' }, equip: EQ('head', { def: 2, rng: 1 }), examine: 'Made from leather.' });
defItem('leather_vambraces', { name: 'Leather vambraces', value: 18, icon: { t: 'vambs' }, equip: EQ('hands', { def: 2, rng: 4 }), examine: 'These look pretty sturdy.' });
defItem('leather_body', { name: 'Leather body', value: 21, icon: { t: 'leatherbody' }, equip: EQ('body', { def: 8, rng: 2, color: '#8a5a30' }), examine: 'Better than nothing.' });
defItem('leather_chaps', { name: 'Leather chaps', value: 20, icon: { t: 'chaps' }, equip: EQ('legs', { def: 4, rng: 4, color: '#8a5a30' }), examine: 'Better than no armour!' });
const CRAFT_LEATHER = [
  { out: 'leather_gloves', level: 1, xp: 13.8 }, { out: 'leather_boots', level: 7, xp: 16.3 }, { out: 'leather_cowl', level: 9, xp: 18.5 },
  { out: 'leather_vambraces', level: 11, xp: 22 }, { out: 'leather_body', level: 14, xp: 25 }, { out: 'leather_chaps', level: 18, xp: 27 },
];

// Metal equipment sets
function metalSet(prefix, name, col, m) {
  defItem(prefix + '_dagger', { name: name + ' dagger', value: 10 * m * m, icon: { t: 'dagger', c: col }, equip: EQ('weapon', { att: 4 * m, str: 3 * m, speed: 4 }), examine: 'Short but pointy.' });
  defItem(prefix + '_sword', { name: name + ' sword', value: 26 * m * m, icon: { t: 'sword', c: col }, equip: EQ('weapon', { att: 6 * m + 1, str: 5 * m, speed: 4 }), examine: 'A razor sharp sword.' });
  defItem(prefix + '_scimitar', { name: name + ' scimitar', value: 32 * m * m, icon: { t: 'scimitar', c: col }, equip: EQ('weapon', { att: 7 * m + 1, str: 6 * m + 1, speed: 4 }), examine: 'A vicious, curved sword.' });
  defItem(prefix + '_full_helm', { name: name + ' full helm', value: 44 * m * m, icon: { t: 'helm', c: col }, equip: EQ('head', { def: 4 * m, mag: -3 }), examine: 'A full face helmet.' });
  defItem(prefix + '_platebody', { name: name + ' platebody', value: 160 * m * m, icon: { t: 'platebody', c: col }, equip: EQ('body', { def: 15 * m, mag: -15, rng: -10, color: col }), examine: 'Provides excellent protection.' });
  defItem(prefix + '_platelegs', { name: name + ' platelegs', value: 80 * m * m, icon: { t: 'platelegs', c: col }, equip: EQ('legs', { def: 8 * m, mag: -10, color: col }), examine: 'Big, bulky and heavy.' });
  defItem(prefix + '_kiteshield', { name: name + ' kiteshield', value: 68 * m * m, icon: { t: 'kiteshield', c: col }, equip: EQ('shield', { def: 8 * m, mag: -8 }), examine: 'A large metal shield.' });
}
metalSet('bronze', 'Bronze', BRONZE, 1);
metalSet('iron', 'Iron', IRON, 2);
metalSet('steel', 'Steel', '#9aa0a8', 3);
metalSet('mithril', 'Mithril', '#4a4aa0', 4);
metalSet('adamant', 'Adamant', '#3a6a3a', 5);
metalSet('rune', 'Rune', '#40a0c0', 6.5);
for (const [m, a] of [['steel', 5], ['mithril', 20], ['adamant', 30], ['rune', 40]]) {
  ['dagger', 'sword', 'scimitar'].forEach(t => ITEMS[m + '_' + t].equip.req = { attack: a });
  ['full_helm', 'platebody', 'platelegs', 'kiteshield'].forEach(t => ITEMS[m + '_' + t].equip.req = { defence: a });
}
['dagger', 'sword', 'scimitar'].forEach(t => ITEMS['iron_' + t].equip.req = { attack: 10 });
['full_helm', 'platebody', 'platelegs', 'kiteshield'].forEach(t => ITEMS['iron_' + t].equip.req = { defence: 10 });
defItem('ember_amulet', { name: 'Ember amulet', value: 400, icon: { t: 'amulet', c: '#e04020' }, equip: EQ('neck', { att: 5, str: 4, def: 3, mag: 4, rng: 4 }), examine: 'It feels warm to the touch.' });
defItem('wooden_shield', { name: 'Wooden shield', value: 20, icon: { t: 'woodshield' }, equip: EQ('shield', { def: 4 }), examine: 'A solid wooden shield.' });

const EQUIP_SLOTS = ['head', 'cape', 'neck', 'ammo', 'weapon', 'body', 'shield', 'legs', 'hands', 'feet', 'ring'];

// ---- Smithing ----
const SMITHING = [];
(function () {
  const pieces = [['dagger', 1, 0], ['sword', 1, 4], ['scimitar', 2, 5], ['arrowtips', 1, 5], ['full_helm', 2, 7], ['kiteshield', 3, 12], ['platelegs', 3, 16], ['platebody', 5, 18]];
  for (const [metal, base, xp] of [['bronze', 1, 12.5], ['iron', 15, 25], ['steel', 30, 37.5], ['mithril', 50, 50], ['adamant', 70, 62.5], ['rune', 85, 75]]) {
    for (const [p, bars, lv] of pieces) if (ITEMS[metal + '_' + p]) SMITHING.push({ metal, out: metal + '_' + p, bar: (metal === 'adamant' ? 'adamantite' : metal === 'rune' ? 'runite' : metal) + '_bar', bars, level: Math.min(99, base + lv), xp: xp * bars, qty: p === 'arrowtips' ? 15 : 1 });
  }
})();
const SMELTING = [
  { out: 'bronze_bar', level: 1, xp: 6.2, needs: { copper_ore: 1, tin_ore: 1 }, success: 1 },
  { out: 'iron_bar', level: 15, xp: 12.5, needs: { iron_ore: 1 }, success: 0.8 },
  { out: 'steel_bar', level: 30, xp: 17.5, needs: { iron_ore: 1, coal: 2 }, success: 1 },
  { out: 'gold_bar', level: 40, xp: 22.5, needs: { gold_ore: 1 }, success: 1 },
  { out: 'mithril_bar', level: 50, xp: 30, needs: { mithril_ore: 1, coal: 4 }, success: 1 },
  { out: 'adamantite_bar', level: 70, xp: 37.5, needs: { adamantite_ore: 1, coal: 6 }, success: 1 },
  { out: 'runite_bar', level: 85, xp: 50, needs: { runite_ore: 1, coal: 8 }, success: 1 },
];
const COOKING = {
  raw_shrimps: { out: 'shrimps', burnt: 'burnt_shrimp', level: 1, xp: 30, stopBurn: 34 },
  raw_anchovies: { out: 'anchovies', burnt: 'burnt_fish', level: 1, xp: 30, stopBurn: 34 },
  raw_beef: { out: 'cooked_meat', burnt: 'burnt_meat', level: 1, xp: 30, stopBurn: 31 },
  raw_chicken: { out: 'cooked_chicken', burnt: 'burnt_chicken', level: 1, xp: 30, stopBurn: 31 },
};
const FIREMAKING = { logs: { level: 1, xp: 40 }, oak_logs: { level: 15, xp: 60 }, willow_logs: { level: 30, xp: 90 }, maple_logs: { level: 45, xp: 135 }, yew_logs: { level: 60, xp: 202.5 }, magic_logs: { level: 75, xp: 303.8 } };
const SHAFTS = { logs: { level: 1, xp: 5, qty: 15 }, oak_logs: { level: 15, xp: 10, qty: 30 }, willow_logs: { level: 30, xp: 15, qty: 45 } };

const TREES = {
  tree: { name: 'Tree', level: 1, xp: 25, log: 'logs', deplete: 1, respawn: [15, 30], base: 0.32 },
  oak: { name: 'Oak', level: 15, xp: 37.5, log: 'oak_logs', deplete: 0.125, respawn: [14, 20], base: 0.2 },
  willow: { name: 'Willow', level: 30, xp: 67.5, log: 'willow_logs', deplete: 0.125, respawn: [14, 20], base: 0.16 },
  maple: { name: 'Maple tree', level: 45, xp: 100, log: 'maple_logs', deplete: 0.1, respawn: [50, 60], base: 0.12 },
  yew: { name: 'Yew', level: 60, xp: 175, log: 'yew_logs', deplete: 0.1, respawn: [80, 100], base: 0.08 },
  magic: { name: 'Magic tree', level: 75, xp: 250, log: 'magic_logs', deplete: 0.1, respawn: [150, 200], base: 0.05 },
};
const ROCKS = {
  copper: { name: 'Copper rocks', level: 1, xp: 17.5, ore: 'copper_ore', respawn: 4, col: '#c0703a', base: 0.35 },
  tin: { name: 'Tin rocks', level: 1, xp: 17.5, ore: 'tin_ore', respawn: 4, col: '#c8c8c0', base: 0.35 },
  iron: { name: 'Iron rocks', level: 15, xp: 35, ore: 'iron_ore', respawn: 9, col: '#8a4430', base: 0.25 },
  coal: { name: 'Coal rocks', level: 30, xp: 50, ore: 'coal', respawn: 30, col: '#1a1a1a', base: 0.2 },
  gold: { name: 'Gold rocks', level: 40, xp: 65, ore: 'gold_ore', respawn: 60, col: '#e8c030', base: 0.18 },
  mithril: { name: 'Mithril rocks', level: 55, xp: 80, ore: 'mithril_ore', respawn: 100, col: '#4a4aa0', base: 0.12 },
  adamantite: { name: 'Adamantite rocks', level: 70, xp: 95, ore: 'adamantite_ore', respawn: 200, col: '#3a6a3a', base: 0.08 },
  runite: { name: 'Runite rocks', level: 85, xp: 125, ore: 'runite_ore', respawn: 600, col: '#40a0c0', base: 0.05 },
};

// ---- Runecrafting altars ----
const RC_ALTARS = {
  air: { level: 1, xp: 5, multi: 11 }, mind: { level: 2, xp: 5.5, multi: 14 }, water: { level: 5, xp: 6, multi: 19 },
  earth: { level: 9, xp: 6.5, multi: 26 }, fire: { level: 14, xp: 7, multi: 35 }, body: { level: 20, xp: 7.5, multi: 46 },
  chaos: { level: 35, xp: 8.5, multi: 74 }, nature: { level: 44, xp: 9, multi: 91 },
};

// ---- Spells (standard spellbook, 2005 style) ----
const SPELLS = [
  { id: 'home', name: 'Home Teleport', level: 0, runes: {}, xp: 0, type: 'tele', col: '#40c0ff', glyph: 'H' },
  { id: 'wind_strike', name: 'Wind Strike', level: 1, runes: { air: 1, mind: 1 }, xp: 5.5, max: 2, type: 'combat', col: '#e8e8f8', glyph: 'W' },
  { id: 'water_strike', name: 'Water Strike', level: 5, runes: { water: 1, air: 1, mind: 1 }, xp: 7.5, max: 4, type: 'combat', col: '#3a70e0', glyph: 'W' },
  { id: 'earth_strike', name: 'Earth Strike', level: 9, runes: { earth: 2, air: 1, mind: 1 }, xp: 9.5, max: 6, type: 'combat', col: '#8a5a2a', glyph: 'E' },
  { id: 'fire_strike', name: 'Fire Strike', level: 13, runes: { fire: 3, air: 2, mind: 1 }, xp: 11.5, max: 8, type: 'combat', col: '#e03018', glyph: 'F' },
  { id: 'bones_bananas', name: 'Bones to Bananas', level: 15, runes: { earth: 2, water: 2, nature: 1 }, xp: 25, type: 'self', col: '#e8d040', glyph: 'B' },
  { id: 'wind_bolt', name: 'Wind Bolt', level: 17, runes: { air: 2, chaos: 1 }, xp: 13.5, max: 9, type: 'combat', col: '#e8e8f8', glyph: 'W' },
  { id: 'low_alch', name: 'Low Level Alchemy', level: 21, runes: { fire: 3, nature: 1 }, xp: 31, type: 'item', mult: 0.4, col: '#ffd040', glyph: 'L' },
  { id: 'water_bolt', name: 'Water Bolt', level: 23, runes: { water: 2, air: 2, chaos: 1 }, xp: 16.5, max: 10, type: 'combat', col: '#3a70e0', glyph: 'W' },
  { id: 'ardenvale_tele', name: 'Ardenvale Teleport', level: 25, runes: { law: 1, air: 3, fire: 1 }, xp: 35, type: 'tele', col: '#a060ff', glyph: 'A' },
  { id: 'earth_bolt', name: 'Earth Bolt', level: 29, runes: { earth: 3, air: 2, chaos: 1 }, xp: 19.5, max: 11, type: 'combat', col: '#8a5a2a', glyph: 'E' },
  { id: 'fire_bolt', name: 'Fire Bolt', level: 35, runes: { fire: 4, air: 3, chaos: 1 }, xp: 22.5, max: 12, type: 'combat', col: '#e03018', glyph: 'F' },
  { id: 'high_alch', name: 'High Level Alchemy', level: 55, runes: { fire: 5, nature: 1 }, xp: 65, type: 'item', mult: 0.6, col: '#ffd040', glyph: 'H' },
];

// ---- Agility course (start tile, end tile, path) ----
const AGILITY = [
  { name: 'Log balance', op: 'Walk-across', start: [30, 58], path: [[31, 58], [32, 58], [33, 58], [34, 58], [35, 58], [36, 58], [37, 58]], xp: 7.5, anim: 'balance', msg: 'You walk carefully across the slippery log...' },
  { name: 'Obstacle net', op: 'Climb-over', start: [37, 59], path: [[38, 59], [39, 59]], xp: 7.5, anim: 'climb', msg: 'You climb over the netting...' },
  { name: 'Balancing rope', op: 'Walk-on', start: [39, 60], path: [[39, 61], [39, 62], [39, 63], [39, 64], [39, 65]], xp: 7.5, anim: 'balance', fail: 0.15, msg: 'You carefully cross the tightrope.' },
  { name: 'Obstacle pipe', op: 'Squeeze-through', start: [38, 66], path: [[37, 66], [36, 66], [35, 66], [34, 66], [33, 66], [32, 66]], xp: 7.5, anim: 'crawl', msg: 'You squeeze into the pipe...' },
  { name: 'Rope swing', op: 'Swing-on', start: [31, 65], path: [[31, 64], [31, 63], [31, 62], [31, 61], [31, 60]], xp: 7.5, anim: 'swing', fail: 0.1, msg: 'You skillfully swing across.', bonus: 39 },
];

// ---- Prayers ----
const PRAYERS = [
  { id: 'thick_skin', name: 'Thick Skin', level: 1, drain: 1 / 12, def: 1.05, glyph: 'skin' },
  { id: 'burst_str', name: 'Burst of Strength', level: 4, drain: 1 / 12, str: 1.05, glyph: 'str' },
  { id: 'clarity', name: 'Clarity of Thought', level: 7, drain: 1 / 12, att: 1.05, glyph: 'att' },
  { id: 'rock_skin', name: 'Rock Skin', level: 10, drain: 1 / 6, def: 1.10, glyph: 'skin2' },
  { id: 'superhuman', name: 'Superhuman Strength', level: 13, drain: 1 / 6, str: 1.10, glyph: 'str2' },
  { id: 'reflexes', name: 'Improved Reflexes', level: 16, drain: 1 / 6, att: 1.10, glyph: 'att2' },
  { id: 'rapid_restore', name: 'Rapid Restore', level: 19, drain: 1 / 36, glyph: 'heal' },
  { id: 'rapid_heal', name: 'Rapid Heal', level: 22, drain: 1 / 18, heal: true, glyph: 'heal' },
  { id: 'protect_item', name: 'Protect Item', level: 25, drain: 1 / 18, glyph: 'skin' },
  { id: 'steel_skin', name: 'Steel Skin', level: 28, drain: 1 / 3, def: 1.15, glyph: 'skin3' },
  { id: 'ultimate_str', name: 'Ultimate Strength', level: 31, drain: 1 / 3, str: 1.15, glyph: 'str3' },
  { id: 'incredible', name: 'Incredible Reflexes', level: 34, drain: 1 / 3, att: 1.15, glyph: 'att3' },
  { id: 'protect_melee', name: 'Protect from Melee', level: 43, drain: 1 / 3, protect: true, glyph: 'prot' },
];

// ---- NPCs ----
const HERB_DROPS = [{ id: 'grimy_guam', chance: 0.06 }, { id: 'grimy_tarromin', chance: 0.03 }, { id: 'grimy_harralander', chance: 0.02 }];
const NPCS = {
  chicken: { name: 'Chicken', level: 1, hp: 3, att: 1, str: 1, def: 1, maxHit: 1, speed: 4, model: 'chicken', wander: 3,
    drops: [{ id: 'bones', always: true }, { id: 'raw_chicken', always: true }, { id: 'feather', qty: [5, 15], chance: 0.8 }], examine: 'Yep, definitely a chicken.' },
  cow: { name: 'Cow', level: 2, hp: 8, att: 1, str: 1, def: 1, maxHit: 1, speed: 4, model: 'cow', wander: 4,
    drops: [{ id: 'bones', always: true }, { id: 'cowhide', always: true }, { id: 'raw_beef', always: true }], examine: 'Converts grass to beef.' },
  goblin: { name: 'Goblin', level: 2, hp: 5, att: 1, str: 1, def: 1, maxHit: 1, speed: 4, model: 'goblin', wander: 4,
    drops: [{ id: 'bones', always: true }, { id: 'coins', qty: [1, 12], chance: 0.5 }, { id: 'bronze_sword', chance: 0.03 }, { id: 'wooden_shield', chance: 0.03 }, { id: 'air_rune', qty: [3, 8], chance: 0.08 }, { id: 'potato_seed', qty: [1, 3], chance: 0.06 }, ...HERB_DROPS], examine: 'An ugly green creature.' },
  man: { name: 'Man', level: 2, hp: 7, att: 1, str: 1, def: 1, maxHit: 1, speed: 4, model: 'man', wander: 5, talk: 'man', pickpocket: { level: 1, xp: 8, coins: 3, stun: 1 },
    drops: [{ id: 'bones', always: true }, { id: 'coins', qty: [3, 15], chance: 0.6 }, { id: 'mind_rune', qty: [2, 6], chance: 0.08 }], examine: 'One of the locals.' },
  rat: { name: 'Giant rat', level: 3, hp: 5, att: 2, str: 2, def: 2, maxHit: 1, speed: 4, model: 'rat', wander: 4,
    drops: [{ id: 'bones', always: true }], examine: 'Overgrown vermin.' },
  bandit: { name: 'Bandit', level: 13, hp: 17, att: 10, str: 9, def: 8, maxHit: 3, speed: 4, model: 'bandit', wander: 4, aggressive: true,
    drops: [{ id: 'bones', always: true }, { id: 'coins', qty: [8, 60], chance: 0.7 }, { id: 'iron_ore', chance: 0.1 }, { id: 'iron_dagger', chance: 0.04 }, { id: 'chaos_rune', qty: [1, 4], chance: 0.08 }, { id: 'limpwurt_root', chance: 0.06 }, { id: 'onion_seed', qty: [1, 3], chance: 0.06 }, ...HERB_DROPS], examine: 'A ruffian of the western woods.' },
  guard: { name: 'Guard', level: 21, hp: 22, att: 19, str: 18, def: 14, maxHit: 4, speed: 5, model: 'guard', wander: 3, pickpocket: { level: 25, xp: 46.8, coins: 30, stun: 2 },
    drops: [{ id: 'bones', always: true }, { id: 'coins', qty: [10, 40], chance: 0.8 }, { id: 'iron_full_helm', chance: 0.02 }, { id: 'iron_bar', chance: 0.05 }, { id: 'iron_arrow', qty: [3, 10], chance: 0.1 }, { id: 'tarromin_seed', chance: 0.04 }, ...HERB_DROPS], examine: 'He tries to keep order around here.' },
  ogre: { name: 'Cinder Ogre', level: 42, hp: 60, att: 40, str: 42, def: 30, maxHit: 7, speed: 6, model: 'ogre', wander: 3, aggressive: true,
    drops: [{ id: 'big_bones', always: true }, { id: 'coins', qty: [50, 250], always: true }, { id: 'ember_amulet', chance: 0.08 }, { id: 'staff_of_fire', chance: 0.04 }, { id: 'iron_platebody', chance: 0.05 }, { id: 'nature_rune', qty: [3, 10], chance: 0.2 }, { id: 'harralander_seed', qty: [1, 2], chance: 0.1 }, { id: 'iron_bar', qty: [2, 5], chance: 0.2 }], examine: 'A hulking brute, smouldering with heat.' },
  woman: { name: 'Woman', level: 2, hp: 7, att: 1, str: 1, def: 1, maxHit: 1, speed: 4, model: 'woman', wander: 5, talk: 'man', pickpocket: { level: 1, xp: 8, coins: 3, stun: 1 },
    drops: [{ id: 'bones', always: true }, { id: 'coins', qty: [3, 15], chance: 0.6 }], examine: 'One of the locals.' },
  skeleton: { name: 'Skeleton', level: 22, hp: 24, att: 17, str: 20, def: 17, maxHit: 3, speed: 4, model: 'skeleton', wander: 4, aggressive: true,
    drops: [{ id: 'bones', always: true }, { id: 'coins', qty: [5, 50], chance: 0.6 }, { id: 'chaos_rune', qty: [2, 6], chance: 0.1 }, { id: 'iron_scimitar', chance: 0.03 }, { id: 'steel_bar', chance: 0.03 }, { id: 'coal', chance: 0.08 }, { id: 'mithril_scimitar', chance: 0.01 }, ...HERB_DROPS], examine: 'Could do with gaining a few pounds.' },
  scorpion: { name: 'Scorpion', level: 14, hp: 17, att: 11, str: 12, def: 11, maxHit: 3, speed: 4, model: 'scorpion', wander: 4, aggressive: true,
    drops: [{ id: 'gold_ore', chance: 0.05 }, { id: 'nature_rune', qty: [1, 3], chance: 0.06 }], examine: 'An extremely vicious scorpion.' },
  lesser_demon: { name: 'Lesser demon', level: 82, hp: 79, att: 68, str: 70, def: 71, maxHit: 8, speed: 4, model: 'demon', wander: 3, aggressive: true,
    drops: [{ id: 'ashes', always: true }, { id: 'coins', qty: [100, 600], always: true }, { id: 'rune_full_helm', chance: 0.02 }, { id: 'adamant_scimitar', chance: 0.04 }, { id: 'rune_scimitar', chance: 0.008 }, { id: 'runite_ore', chance: 0.03 }, { id: 'fire_rune', qty: [30, 80], chance: 0.3 }], examine: 'Lesser, but still pretty scary.' },
  kharid_warrior: { name: 'Al Kharid warrior', level: 9, hp: 19, att: 7, str: 8, def: 6, maxHit: 2, speed: 4, model: 'kharid', wander: 4,
    drops: [{ id: 'bones', always: true }, { id: 'coins', qty: [5, 30], chance: 0.7 }, { id: 'bronze_scimitar', chance: 0.04 }, { id: 'iron_scimitar', chance: 0.02 }, ...HERB_DROPS], examine: 'A warrior of Al Kharid.' },
  zeke: { name: 'Zeke', level: 0, model: 'zeke', wander: 1, talk: 'generic', shop: 'scimitars', examine: 'A sharp-dressed merchant.', greet: 'A thousand greetings! Can I interest you in a superior scimitar?' },
  kharid_banker: { name: 'Banker', level: 0, model: 'banker', wander: 0, talk: 'banker', bank: true, examine: 'Good with money.' },
  priest: { name: 'Father Aldous', level: 0, model: 'priest', wander: 1, talk: 'priest', examine: 'A kindly man of the cloth.' },
  harbourmaster: { name: 'Captain Rourke', level: 0, model: 'sailor', wander: 1, talk: 'harbour', examine: 'He runs the harbour of Port Sarrow.' },
  sailor: { name: 'Sailor', level: 0, model: 'sailor', wander: 2, talk: 'generic', examine: 'He smells of salt and fish.', greet: 'Fancy a spot of fishing off the pier? The shrimp and anchovies are biting.' },
  huntsman: { name: 'Huntsman Garrick', level: 0, model: 'hunter', wander: 1, talk: 'generic', shop: 'hunter', examine: 'He knows the woods better than anyone.', greet: 'Lay a bird snare in the Elderwood for crimson swifts, or in the desert for golden warblers. Box traps catch ferrets in the swamp, and chinchompas in the Ashlands!' },
  banker: { name: 'Banker', level: 0, model: 'banker', wander: 0, talk: 'banker', bank: true, examine: 'Good with money.' },
  shopkeeper: { name: 'Shopkeeper', level: 0, model: 'shopkeeper', wander: 1, talk: 'shop', shop: 'general', examine: 'Maybe he\'d like to buy some of my junk.' },
  elder: { name: 'Elder Brannoc', level: 0, model: 'elder', wander: 2, talk: 'elder', examine: 'The wise old leader of Ardenvale.' },
  smith: { name: 'Hilda the Smith', level: 0, model: 'smith', wander: 1, talk: 'smith', shop: 'smith', examine: 'Strong arms, warm heart.' },
  mage: { name: 'Orla the Mage', level: 0, model: 'mage', wander: 1, talk: 'generic', shop: 'magic', examine: 'She smells faintly of brimstone.', greet: 'Runes, staves and robes! All the tools of the arcane, right here.' },
  fletcher: { name: 'Bryn the Fletcher', level: 0, model: 'fletcher', wander: 1, talk: 'generic', shop: 'archery', examine: 'A keen-eyed archer.', greet: 'Bows and arrows, the finest in the land. Have a look!' },
  herbalist: { name: 'Wren the Herbalist', level: 0, model: 'herbalist', wander: 1, talk: 'generic', shop: 'herbs', examine: 'She knows her leaves.', greet: 'Clean your herbs, add them to a vial of water, then add the secondary ingredient. Simple!' },
  farmer: { name: 'Farmer Ada', level: 0, model: 'farmer', wander: 2, talk: 'generic', shop: 'farming', examine: 'A hard-working farmer.', greet: 'Rake the weeds, plant your seeds with a dibber, then wait. Harvest with a spade!' },
  tanner: { name: 'Tanner Ellis', level: 0, model: 'tanner', wander: 1, talk: 'tanner', shop: 'crafting', examine: 'He tans hides into leather.' },
  slayer: { name: 'Master Kael', level: 0, model: 'slayer', wander: 1, talk: 'slayer', examine: 'A battle-scarred Slayer Master.' },
};

const SHOPS = {
  scimitars: { name: 'Zeke\'s Superior Scimitars', stock: [['bronze_scimitar', 5], ['iron_scimitar', 3], ['steel_scimitar', 2], ['mithril_scimitar', 1], ['adamant_scimitar', 1]] },
  hunter: { name: 'Garrick\'s Hunting Supplies', stock: [['bird_snare', 20], ['box_trap', 10], ['knife', 5]] },
  general: { name: 'Ardenvale General Store', stock: [['vial', 10], ['bird_snare', 10], ['bronze_axe', 5], ['bronze_pickaxe', 5], ['small_net', 5], ['tinderbox', 5], ['hammer', 5], ['knife', 5], ['shrimps', 10], ['bronze_dagger', 3], ['wooden_shield', 2], ['spade', 5]] },
  smith: { name: 'Hilda\'s Forge', stock: [['iron_axe', 2], ['iron_pickaxe', 2], ['hammer', 10], ['bronze_bar', 10], ['iron_bar', 5], ['bronze_scimitar', 2], ['iron_scimitar', 1], ['bronze_platebody', 1]] },
  magic: { name: 'Orla\'s Rune Emporium', stock: [['air_rune', 500], ['mind_rune', 500], ['water_rune', 300], ['earth_rune', 300], ['fire_rune', 300], ['body_rune', 100], ['chaos_rune', 50], ['law_rune', 20], ['nature_rune', 20], ['staff', 5], ['staff_of_air', 1], ['wizard_hat', 5], ['wizard_robe', 5]] },
  archery: { name: 'Bryn\'s Archery Supplies', stock: [['shortbow', 4], ['longbow', 3], ['oak_shortbow', 2], ['bronze_arrow', 800], ['iron_arrow', 300], ['feather', 500], ['bow_string', 20], ['leather_cowl', 3]] },
  herbs: { name: 'Wren\'s Herbs & Vials', stock: [['vial', 50], ['vial_water', 30], ['eye_of_newt', 50], ['limpwurt_root', 10], ['white_berries', 10], ['grimy_guam', 10], ['attack_potion4', 2]] },
  farming: { name: 'Ada\'s Farming Supplies', stock: [['rake', 5], ['seed_dibber', 5], ['spade', 5], ['potato_seed', 100], ['onion_seed', 50], ['cabbage_seed', 50], ['guam_seed', 10], ['tarromin_seed', 5]] },
  crafting: { name: 'Ellis\'s Leatherworks', stock: [['needle', 10], ['thread', 200], ['leather', 20], ['leather_gloves', 3], ['leather_boots', 3]] },
};

const QUESTS = [
  { id: 'bridge', name: 'Bridge to the West', giver: 'Elder Brannoc in his house in Ardenvale' },
  { id: 'bones', name: 'The Restless Bones', giver: 'Father Aldous in the Ardenvale chapel' },
  { id: 'forge', name: 'Forging Ahead', giver: 'Hilda at the Ardenvale smithy' },
  { id: 'runes', name: 'Secrets of the Stones', giver: 'Orla in her rune shop, north of the bank' },
  { id: 'catch', name: "Sarrow's Catch", giver: 'Captain Rourke in Port Sarrow' },
];

// Hunter: traps and what they catch, by region
const HUNTER = {
  bird_snare: { loc: 'snare', catches: [
    { region: 'elderwood', name: 'Crimson swift', level: 1, xp: 34, loot: [['raw_bird_meat', 1], ['bones', 1], ['crimson_feather', [5, 10]]] },
    { region: 'desert', name: 'Golden warbler', level: 5, xp: 47, loot: [['raw_bird_meat', 1], ['bones', 1], ['yellow_feather', [5, 10]]] }] },
  box_trap: { loc: 'boxtrap', catches: [
    { region: 'swamp', name: 'Ferret', level: 27, xp: 115, loot: [['ferret', 1]] },
    { region: 'ashlands', name: 'Chinchompa', level: 53, xp: 198.3, loot: [['chinchompa', 1]] }] },
};

const SLAYER_TASKS = [
  { npc: 'chicken', min: 0, n: [10, 20] }, { npc: 'cow', min: 0, n: [10, 20] }, { npc: 'goblin', min: 0, n: [10, 20] },
  { npc: 'rat', min: 0, n: [10, 20] }, { npc: 'bandit', min: 15, n: [10, 20] }, { npc: 'scorpion', min: 18, n: [10, 20] }, { npc: 'skeleton', min: 25, n: [10, 20] }, { npc: 'lesser_demon', min: 60, n: [5, 12] }, { npc: 'guard', min: 25, n: [8, 15] }, { npc: 'ogre', min: 40, n: [3, 6] },
];
