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
defItem('teak_logs', { name: 'Teak logs', value: 80, icon: { t: 'logs', c: '#8a6a3a' }, examine: 'Some well-cut teak logs.' });
defItem('mahogany_logs', { name: 'Mahogany logs', value: 200, icon: { t: 'logs', c: '#7a3a20' }, examine: 'Some well-cut mahogany logs.' });
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
defItem('chisel', { name: 'Chisel', value: 1, icon: { t: 'chisel' }, examine: 'Good for detailed crafting.' });
const GEMS = [['sapphire', 'Sapphire', '#3050e0', 20, 50, 20, 24], ['emerald', 'Emerald', '#20b040', 27, 67.5, 27, 31], ['ruby', 'Ruby', '#d02020', 34, 85, 34, 50], ['diamond', 'Diamond', '#e8e8f8', 43, 107.5, 43, 70]];
const JEWEL = [];
for (const [id, name, col, cutLv, cutXp, ringLv, amLv] of GEMS) {
  defItem('uncut_' + id, { name: 'Uncut ' + name.toLowerCase(), value: cutLv * 8, icon: { t: 'gem', c: col, uncut: true }, examine: 'An uncut ' + name.toLowerCase() + '.' });
  defItem(id, { name, value: cutLv * 20, icon: { t: 'gem', c: col }, cut: { from: 'uncut_' + id, level: cutLv, xp: cutXp }, examine: 'This looks valuable.' });
  const tier = GEMS.findIndex(g => g[0] === id) + 1;
  defItem(id + '_ring', { name: name + ' ring', value: cutLv * 40, icon: { t: 'ring', c: col }, equip: EQ('ring', { def: tier, mag: tier }), examine: 'A valuable ring.' });
  defItem(id + '_amulet', { name: name + ' amulet', value: cutLv * 50, icon: { t: 'amulet', c: col }, equip: EQ('neck', { att: tier * 2, str: tier * 2, def: tier * 2, mag: tier * 2, rng: tier * 2 }), examine: 'A very nice amulet.' });
  JEWEL.push({ out: id + '_ring', gem: id, level: ringLv, xp: cutXp * 0.8 }, { out: id + '_amulet', gem: id, level: amLv, xp: cutXp * 1.3 });
}
const GEM_TABLE = [['uncut_sapphire', 0.5], ['uncut_emerald', 0.27], ['uncut_ruby', 0.17], ['uncut_diamond', 0.06]];
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
defItem('pure_essence', { name: 'Pure essence', value: 6, icon: { t: 'essence', pure: true }, examine: 'A pure, uncharged rune stone.' });
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
const DARTS = [['bronze', 10, 1.8, 1, '#9a6a3a'], ['iron', 22, 3.8, 3, '#6e6a66'], ['steel', 37, 7.5, 6, '#9aa0a8'], ['mithril', 52, 11.2, 9, '#4a4aa0']];
for (const [m, lv, xp, rs, col] of DARTS) {
  defItem(m + '_dart_tip', { name: m.charAt(0).toUpperCase() + m.slice(1) + ' dart tip', stackable: true, value: 2 * rs, icon: { t: 'tips', c: col }, examine: 'Fletch with feathers to make darts.' });
  defItem(m + '_dart', { name: m.charAt(0).toUpperCase() + m.slice(1) + ' dart', stackable: true, value: 4 * rs, icon: { t: 'dart', c: col }, equip: EQ('weapon', { kind: 'thrown', rstr: rs, rng: 2 + rs, speed: 3, req: { ranged: Math.max(1, lv - 10) } }), examine: 'A deadly throwing dart.' });
}
// capes
for (const [c, col] of [['red', '#a01a1a'], ['blue', '#1a3aa0'], ['green', '#1a7a1a'], ['yellow', '#c0a010'], ['purple', '#6a1a8a'], ['black', '#1a1a1a'], ['orange', '#d06010']]) defItem(c + '_cape', { name: c.charAt(0).toUpperCase() + c.slice(1) + ' cape', value: 20, icon: { t: 'cape', c: col }, equip: EQ('cape', { def: 1, color: col }), examine: 'A thick ' + c + ' cape.' });
for (const [k, name, col, dest] of [['ardenvale', 'Ardenvale', '#a060ff', [90, 84]], ['varrock', 'Varrock', '#6080ff', [154, 217]], ['lumbridge', 'Lumbridge', '#40c0a0', [99, 235]], ['whitecliff', 'Whitecliff', '#f0f0f0', [77, 22]], ['gnome', 'Gnome Village', '#60c040', [56, 207]], ['draynor', 'Draynor', '#c0a040', [54, 238]]])
  defItem('tab_' + k, { name: name + ' teleport', stackable: true, value: 40, icon: { t: 'tab', c: col }, tab: dest, examine: `A tablet containing a magic spell to teleport you to ${name}.` });
for (const [id, name, heal, col] of [['worm_batta', 'Worm batta', 11, '#c0a060'], ['toad_crunchies', 'Toad crunchies', 8, '#8aa040'], ['chocolate_bomb', 'Chocolate bomb', 15, '#6a3a1a'], ['fruit_blast', 'Fruit blast', 9, '#f0a030']])
  defItem(id, { name, value: heal * 10, icon: { t: 'gnomefood', c: col }, food: heal, examine: 'A gnome delicacy.' });
defItem('xp_lamp', { name: 'Lamp', value: 0, icon: { t: 'lamp' }, examine: 'I wonder what happens if I rub it.' });

// fishing / cooking / food
defItem('fishing_rod', { name: 'Fishing rod', value: 5, icon: { t: 'rod' }, examine: 'Useful for catching sardine or herring.' });
defItem('fly_fishing_rod', { name: 'Fly fishing rod', value: 5, icon: { t: 'rod', fly: true }, examine: 'Useful for fly fishing.' });
defItem('fishing_bait', { name: 'Fishing bait', stackable: true, value: 3, icon: { t: 'bait' }, examine: 'For use with a fishing rod.' });
defItem('big_net', { name: 'Big fishing net', value: 20, icon: { t: 'net', big: true }, examine: 'Useful for catching lots of fish.' });
defItem('harpoon', { name: 'Harpoon', value: 5, icon: { t: 'harpoon' }, examine: 'Useful for catching really big fish.' });
defItem('lobster_pot', { name: 'Lobster pot', value: 20, icon: { t: 'pot' }, examine: 'Useful for catching lobsters.' });
const FISH = [
  // id, name, colour raw, colour cooked, fish level, fish xp, cook level, cook xp, heal, stopBurn, icon
  ['sardine', 'Sardine', '#a0b0b8', '#8a7050', 5, 20, 1, 40, 4, 38, 'fish'],
  ['herring', 'Herring', '#8a9a80', '#7a6040', 10, 30, 5, 50, 5, 41, 'fish'],
  ['trout', 'Trout', '#9a8a70', '#a06a40', 20, 50, 15, 70, 7, 50, 'fish'],
  ['salmon', 'Salmon', '#c08070', '#c0603a', 30, 70, 25, 90, 9, 58, 'fish'],
  ['tuna', 'Tuna', '#7080a0', '#906050', 35, 80, 30, 100, 10, 63, 'fish'],
  ['lobster', 'Lobster', '#5a5a8a', '#d04020', 40, 90, 40, 120, 12, 74, 'lobster'],
  ['swordfish', 'Swordfish', '#8090c0', '#a07060', 50, 100, 45, 140, 14, 86, 'swordfish'],
  ['pike', 'Pike', '#7a8a5a', '#8a6a40', 25, 60, 20, 80, 8, 64, 'fish'],
  ['mackerel', 'Mackerel', '#6a8aa0', '#8a7050', 16, 20, 10, 60, 6, 45, 'fish'],
  ['cod', 'Cod', '#8a9a90', '#a08060', 23, 45, 18, 75, 7, 52, 'fish'],
  ['bass', 'Bass', '#5a6a80', '#9a6a50', 46, 100, 43, 130, 13, 80, 'fish'],
  ['shark', 'Shark', '#6a7080', '#8a6050', 76, 110, 80, 210, 20, 99, 'swordfish'],
];
for (const [id, name, cr, cc, fl, fx, cl, cx, heal, sb, ic] of FISH) {
  defItem('raw_' + id, { name: 'Raw ' + name.toLowerCase(), value: fl * 3, icon: { t: ic, c: cr }, examine: 'I should try cooking this.' });
  defItem(id, { name, value: fl * 4, icon: { t: ic, c: cc }, food: heal, examine: `Some nicely cooked ${name.toLowerCase()}.` });
}
defItem('burnt_lobster', { name: 'Burnt lobster', value: 1, icon: { t: 'lobster', c: '#2a2020' }, examine: 'Oops!' });
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
defItem('jogre_bones', { name: 'Jogre bones', value: 1, icon: { t: 'bones', big: true }, bury: 15, examine: 'Bones of a jungle ogre.' });
defItem('dragon_bones', { name: 'Dragon bones', value: 1500, icon: { t: 'bones', big: true, c: '#e8e0b0' }, bury: 72, examine: 'These would feed a dogfish for a month!' });
defItem('unicorn_horn', { name: 'Unicorn horn', value: 60, icon: { t: 'horn' }, examine: 'This horn has restorative properties. Grind it with a pestle.' });
defItem('bear_fur', { name: 'Bear fur', value: 20, icon: { t: 'hide', c: '#6a4a2a' }, examine: 'This would make warm clothing.' });
defItem('wolf_bones', { name: 'Wolf bones', value: 1, icon: { t: 'bones' }, bury: 4.5, examine: 'Bones of a wolf.' });
defItem('blue_dhide', { name: 'Blue dragonhide', value: 1500, icon: { t: 'hide', c: '#3050b0' }, examine: 'The scaly hide of a blue dragon.' });
defItem('cowhide', { name: 'Cowhide', value: 1, icon: { t: 'hide' }, examine: 'I should take this to a tanner.' });
defItem('leather', { name: 'Leather', value: 1, icon: { t: 'leather' }, examine: 'It\'s a piece of leather.' });
defItem('feather', { name: 'Feather', stackable: true, value: 2, icon: { t: 'feather' }, examine: 'Used for fly-fishing and fletching.' });
defItem('silk', { name: 'Silk', value: 60, icon: { t: 'silk' }, examine: 'It\'s a sheet of silk.' });
defItem('repair_kit', { name: 'Bridge planks', value: 0, icon: { t: 'planks' }, examine: 'Planks for repairing the old bridge.' });

// runes / magic
const RUNES = { air: '#e8e8f8', mind: '#e8a040', water: '#3a70e0', earth: '#8a5a2a', fire: '#e03018', body: '#6a6af0', cosmic: '#e8e040', chaos: '#f0c020', nature: '#30b030', law: '#3040c0', death: '#e8e8e8' };
for (const r in RUNES) defItem(r + '_rune', { name: r.charAt(0).toUpperCase() + r.slice(1) + ' rune', stackable: true, value: { air: 4, mind: 3, water: 4, earth: 4, fire: 4, body: 5, cosmic: 50, chaos: 90, nature: 180, law: 240, death: 300 }[r], icon: { t: 'rune', c: RUNES[r], r }, examine: `One of the 4 basic elemental runes.`.replace('One of the 4 basic elemental runes.', `A ${r} rune.`) });
for (const r in RUNES) {
  defItem(r + '_talisman', { name: r.charAt(0).toUpperCase() + r.slice(1) + ' talisman', value: 20, icon: { t: 'talisman', c: RUNES[r] }, talisman: r, examine: `A mysterious power emanates from the talisman.` });
  defItem(r + '_tiara', { name: r.charAt(0).toUpperCase() + r.slice(1) + ' tiara', value: 50, icon: { t: 'tiara', c: RUNES[r] }, equip: EQ('head', { mag: 1 }), tiara: r, examine: `A tiara infused with the properties of ${r}.` });
}
defItem('tiara', { name: 'Tiara', value: 30, icon: { t: 'tiara', c: '#c0c0c8' }, equip: EQ('head', {}), examine: 'Makes me feel like a princess.' });
const POUCHES = { small_pouch: { name: 'Small pouch', level: 1, cap: 3 }, medium_pouch: { name: 'Medium pouch', level: 25, cap: 6 }, large_pouch: { name: 'Large pouch', level: 50, cap: 9 }, giant_pouch: { name: 'Giant pouch', level: 75, cap: 12 } };
for (const id in POUCHES) defItem(id, { name: POUCHES[id].name, value: POUCHES[id].cap * 500, icon: { t: 'pouch', c: ['#a07040', '#8a6a3a', '#7a5a30', '#6a4a28'][Object.keys(POUCHES).indexOf(id)] }, pouch: POUCHES[id], examine: `A pouch that can hold ${POUCHES[id].cap} rune essence.` });
defItem('staff_of_water', { name: 'Staff of water', value: 1500, icon: { t: 'staff', c: '#7a5a3a', orb: '#3a70e0' }, equip: EQ('weapon', { kind: 'staff', att: 2, str: 3, def: 2, mag: 10, speed: 5, provides: 'water' }), examine: 'A magical staff.' });
defItem('staff_of_earth', { name: 'Staff of earth', value: 1500, icon: { t: 'staff', c: '#7a5a3a', orb: '#8a5a2a' }, equip: EQ('weapon', { kind: 'staff', att: 2, str: 3, def: 2, mag: 10, speed: 5, provides: 'earth' }), examine: 'A magical staff.' });
defItem('mystic_robe', { name: 'Mystic robe top', value: 12000, icon: { t: 'robe', c: '#3a2a8a' }, equip: EQ('body', { mag: 20, def: 20, req: { magic: 40, defence: 20 }, color: '#3a2a8a' }), examine: 'The robe top of a powerful sorcerer.' });
defItem('mystic_hat', { name: 'Mystic hat', value: 6000, icon: { t: 'wizhat', c: '#3a2a8a' }, equip: EQ('head', { mag: 4, def: 2, req: { magic: 40, defence: 20 } }), examine: 'A magical hat.' });
for (const [m, col, p, lv] of [['steel', '#9aa0a8', 3, 5], ['mithril', '#4a4aa0', 4, 20], ['adamant', '#3a6a3a', 5, 30], ['rune', '#40a0c0', 6, 40]]) {
  defItem(m + '_axe', { name: m.charAt(0).toUpperCase() + m.slice(1) + ' axe', value: 100 * p * p, icon: { t: 'axe', c: col }, tool: { wc: 1, power: p }, equip: EQ('weapon', { att: 3 + p * 2, str: 4 + p * 2, speed: 5, req: { attack: lv } }), examine: 'A powerful axe.' });
  defItem(m + '_pickaxe', { name: m.charAt(0).toUpperCase() + m.slice(1) + ' pickaxe', value: 250 * p * p, icon: { t: 'pickaxe', c: col }, tool: { mine: 1, power: p }, equip: EQ('weapon', { att: 3 + p * 2, str: 4 + p * 2, speed: 5, req: { attack: lv } }), examine: 'A powerful pickaxe.' });
}
// cook's quest ingredients
defItem('egg', { name: 'Egg', value: 4, icon: { t: 'egg' }, examine: 'A nice fresh egg.' });
defItem('bucket', { name: 'Bucket', value: 2, icon: { t: 'bucket' }, examine: 'It\'s a wooden bucket.' });
defItem('bucket_milk', { name: 'Bucket of milk', value: 6, icon: { t: 'bucket', milk: true }, examine: 'It\'s a bucket of milk.' });
defItem('pot', { name: 'Pot', value: 1, icon: { t: 'flourpot' }, examine: 'This pot is empty.' });
defItem('pot_flour', { name: 'Pot of flour', value: 14, icon: { t: 'flourpot', flour: true }, examine: 'There is flour in this pot.' });
defItem('staff', { name: 'Staff', value: 15, icon: { t: 'staff', c: '#7a5a3a' }, equip: EQ('weapon', { kind: 'staff', att: 2, str: 2, def: 2, mag: 2, speed: 5 }), examine: 'It\'s a slightly magical stick.' });
defItem('staff_of_air', { name: 'Staff of air', value: 1500, icon: { t: 'staff', c: '#7a5a3a', orb: '#e8e8f8' }, equip: EQ('weapon', { kind: 'staff', att: 2, str: 3, def: 2, mag: 10, speed: 5, provides: 'air' }), examine: 'A magical staff.' });
defItem('staff_of_fire', { name: 'Staff of fire', value: 1500, icon: { t: 'staff', c: '#7a5a3a', orb: '#ff5020' }, equip: EQ('weapon', { kind: 'staff', att: 2, str: 3, def: 2, mag: 10, speed: 5, provides: 'fire' }), examine: 'A magical staff.' });
defItem('wizard_hat', { name: 'Wizard hat', value: 2, icon: { t: 'wizhat', c: '#2a3a9a' }, equip: EQ('head', { mag: 2 }), examine: 'A silly pointed hat.' });
defItem('wizard_robe', { name: 'Wizard robe top', value: 15, icon: { t: 'robe', c: '#2a3a9a' }, equip: EQ('body', { mag: 3, color: '#2a3a9a' }), examine: 'I can do magic better in this.' });

// herblore
const HERBS = [['guam', 'Guam leaf', '#4a9a2a', 3, 2.5], ['marrentill', 'Marrentill', '#3a8a4a', 5, 3.8], ['tarromin', 'Tarromin', '#5a8a3a', 11, 5], ['harralander', 'Harralander', '#6a8a1a', 20, 6.3], ['ranarr', 'Ranarr weed', '#2a7a2a', 25, 7.5], ['irit', 'Irit leaf', '#8a9a2a', 40, 8.8]];
for (const [id, name, col, lv, xp] of HERBS) {
  defItem('grimy_' + id, { name: 'Grimy ' + name.toLowerCase().replace(' leaf', ''), value: 10, icon: { t: 'herb', c: '#5a5a2a' }, herb: { clean: id + '_leaf', level: lv, xp }, examine: 'I need to clean this herb before I can use it.' });
  defItem(id + '_leaf', { name, value: 15, icon: { t: 'herb', c: col }, examine: 'A fresh herb.' });
  defItem(id + '_unf', { name: name.replace(' leaf', '') + ' potion (unf)', value: 10, icon: { t: 'vial', c: col }, examine: 'I need another ingredient to finish this potion.' });
}
defItem('eye_of_newt', { name: 'Eye of newt', value: 3, icon: { t: 'eye' }, examine: 'It seems to be looking at me.' });
defItem('limpwurt_root', { name: 'Limpwurt root', value: 7, icon: { t: 'root' }, examine: 'The root of a limpwurt plant.' });
defItem('snape_grass', { name: 'Snape grass', value: 30, icon: { t: 'root', c: '#4a9a3a' }, examine: 'Strange spiky grass.' });
defItem('unicorn_horn_dust', { name: 'Unicorn horn dust', value: 20, icon: { t: 'ashes', c: '#f0f0f0' }, examine: 'Finely ground horn of unicorn.' });
defItem('white_berries', { name: 'White berries', value: 10, icon: { t: 'berries' }, examine: 'Poisonous berries.' });
const POTIONS = [
  { id: 'attack_potion', name: 'Attack potion', col: '#40c0d0', unf: 'guam_unf', sec: 'eye_of_newt', level: 3, xp: 25, boost: 'attack', base: 3, pct: 0.1 },
  { id: 'strength_potion', name: 'Strength potion', col: '#c0c040', unf: 'tarromin_unf', sec: 'limpwurt_root', level: 12, xp: 50, boost: 'strength', base: 3, pct: 0.1 },
  { id: 'defence_potion', name: 'Defence potion', col: '#40c040', unf: 'harralander_unf', sec: 'white_berries', level: 30, xp: 75, boost: 'defence', base: 3, pct: 0.1 },
  { id: 'restore_potion', name: 'Restore potion', col: '#e04080', unf: 'marrentill_unf', sec: 'unicorn_horn_dust', level: 5, xp: 37.5, restore: true },
  { id: 'prayer_potion', name: 'Prayer potion', col: '#30c0b0', unf: 'ranarr_unf', sec: 'snape_grass', level: 38, xp: 87.5, prayer: true },
  { id: 'super_attack', name: 'Super attack', col: '#3050e0', unf: 'irit_unf', sec: 'eye_of_newt', level: 45, xp: 100, boost: 'attack', base: 5, pct: 0.15 },
  { id: 'super_strength', name: 'Super strength', col: '#e8e8e8', unf: 'irit_unf', sec: 'limpwurt_root', level: 55, xp: 125, boost: 'strength', base: 5, pct: 0.15 },
];
for (const p of POTIONS) for (let d = 1; d <= 4; d++) defItem(`${p.id}${d}`, { name: `${p.name}(${d})`, value: 20 * d, icon: { t: 'vial', c: p.col, dose: d }, potion: { p, dose: d }, examine: `${d} dose${d > 1 ? 's' : ''} of ${p.name.toLowerCase()}.` });

// farming
const SEEDS = {
  potato_seed: { name: 'Potato seed', crop: 'potato', level: 1, plantXp: 8, harvestXp: 9, need: 3, patch: 'allotment', col: '#b08a50' },
  onion_seed: { name: 'Onion seed', crop: 'onion', level: 5, plantXp: 9.5, harvestXp: 10.5, need: 3, patch: 'allotment', col: '#d8c8a0' },
  cabbage_seed: { name: 'Cabbage seed', crop: 'cabbage', level: 7, plantXp: 10, harvestXp: 11.5, need: 3, patch: 'allotment', col: '#6aa040' },
  guam_seed: { name: 'Guam seed', crop: 'grimy_guam', level: 9, plantXp: 11, harvestXp: 12.5, need: 1, patch: 'herb', col: '#4a9a2a' },
  tarromin_seed: { name: 'Tarromin seed', crop: 'grimy_tarromin', level: 19, plantXp: 19, harvestXp: 21.5, need: 1, patch: 'herb', col: '#5a8a3a' },
  marrentill_seed: { name: 'Marrentill seed', crop: 'grimy_marrentill', level: 14, plantXp: 13.5, harvestXp: 15, need: 1, patch: 'herb', col: '#3a8a4a' },
  ranarr_seed: { name: 'Ranarr seed', crop: 'grimy_ranarr', level: 32, plantXp: 27, harvestXp: 30.5, need: 1, patch: 'herb', col: '#2a7a2a' },
  irit_seed: { name: 'Irit seed', crop: 'grimy_irit', level: 44, plantXp: 43, harvestXp: 48.5, need: 1, patch: 'herb', col: '#8a9a2a' },
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
metalSet('rune', 'Rune', '#3a8aa8', 6.5);
defItem('fancy_boots', { name: 'Fancy boots', value: 1, icon: { t: 'boots', c: '#c060c8' }, equip: EQ('feet', { def: 4, mag: 2, color: '#b050c0' }), examine: 'Stylish boots from the Stronghold of Security.' });
defItem('fighting_boots', { name: 'Fighting boots', value: 1, icon: { t: 'boots', c: '#c83030' }, equip: EQ('feet', { def: 4, str: 1, color: '#b02828' }), examine: 'Tough boots from the Stronghold of Security.' });
for (const [m, a] of [['steel', 5], ['mithril', 20], ['adamant', 30], ['rune', 40]]) {
  ['dagger', 'sword', 'scimitar'].forEach(t => ITEMS[m + '_' + t].equip.req = { attack: a });
  ['full_helm', 'platebody', 'platelegs', 'kiteshield'].forEach(t => ITEMS[m + '_' + t].equip.req = { defence: a });
}
['dagger', 'sword', 'scimitar'].forEach(t => ITEMS['iron_' + t].equip.req = { attack: 10 });
['full_helm', 'platebody', 'platelegs', 'kiteshield'].forEach(t => ITEMS['iron_' + t].equip.req = { defence: 10 });
defItem('ember_amulet', { name: 'Ember amulet', value: 400, icon: { t: 'amulet', c: '#e04020' }, equip: EQ('neck', { att: 5, str: 4, def: 3, mag: 4, rng: 4 }), examine: 'It feels warm to the touch.' });
defItem('wooden_shield', { name: 'Wooden shield', value: 20, icon: { t: 'woodshield' }, equip: EQ('shield', { def: 4 }), examine: 'A solid wooden shield.' });

defItem('wk_helm', { name: 'White full helm', value: 1000, icon: { t: 'helm', c: '#e8e8e8' }, equip: EQ('head', { def: 15, req: { defence: 30 } }), examine: 'A full helm of the White Knights.' });
defItem('wk_body', { name: 'White platebody', value: 4000, icon: { t: 'platebody', c: '#e8e8e8' }, equip: EQ('body', { def: 45, req: { defence: 30 }, color: '#e8e8e8' }), examine: 'A platebody of the White Knights.' });
defItem('wk_legs', { name: 'White platelegs', value: 2000, icon: { t: 'platelegs', c: '#e8e8e8' }, equip: EQ('legs', { def: 25, req: { defence: 30 }, color: '#e8e8e8' }), examine: 'Platelegs of the White Knights.' });
defItem('wk_shield', { name: 'White kiteshield', value: 1700, icon: { t: 'kiteshield', c: '#e8e8e8' }, equip: EQ('shield', { def: 25, req: { defence: 30 } }), examine: 'A kiteshield of the White Knights.' });
defItem('amulet_magic', { name: 'Amulet of magic', value: 900, icon: { t: 'amulet', c: '#3050e0' }, equip: EQ('neck', { mag: 10 }), examine: 'A magical amulet.' });
defItem('amulet_defence', { name: 'Amulet of defence', value: 1300, icon: { t: 'amulet', c: '#20b040' }, equip: EQ('neck', { def: 7 }), examine: 'A protective amulet.' });
defItem('ring_recoil', { name: 'Ring of recoil', value: 900, icon: { t: 'ring', c: '#3050e0' }, equip: EQ('ring', { def: 3 }), examine: 'An enchanted ring.' });
defItem('bk_helm', { name: 'Black full helm', value: 1000, icon: { t: 'helm', c: '#2a2a2e' }, equip: EQ('head', { def: 12, req: { defence: 10 } }), examine: 'A black full helm.' });
defItem('bk_body', { name: 'Black platebody', value: 3800, icon: { t: 'platebody', c: '#2a2a2e' }, equip: EQ('body', { def: 40, req: { defence: 10 }, color: '#2a2a2e' }), examine: 'A black platebody.' });
defItem('bk_legs', { name: 'Black platelegs', value: 1900, icon: { t: 'platelegs', c: '#2a2a2e' }, equip: EQ('legs', { def: 22, req: { defence: 10 }, color: '#2a2a2e' }), examine: 'Black platelegs.' });
defItem('bk_shield', { name: 'Black kiteshield', value: 1600, icon: { t: 'kiteshield', c: '#2a2a2e' }, equip: EQ('shield', { def: 20, req: { defence: 10 } }), examine: 'A black kiteshield.' });
defItem('goblin_mail', { name: 'Goblin mail', value: 15, icon: { t: 'leatherbody', c: '#8a6a3a' }, equip: EQ('body', { def: 6, color: '#7a6a3a' }), examine: 'An orange armour, made for goblins.' });
const EQUIP_SLOTS = ['head', 'cape', 'neck', 'ammo', 'weapon', 'body', 'shield', 'legs', 'hands', 'feet', 'ring'];

// ---- Smithing ----
const SMITHING = [];
(function () {
  const pieces = [['dagger', 1, 0], ['dart_tip', 1, 4], ['sword', 1, 4], ['scimitar', 2, 5], ['arrowtips', 1, 5], ['full_helm', 2, 7], ['kiteshield', 3, 12], ['platelegs', 3, 16], ['platebody', 5, 18]];
  for (const [metal, base, xp] of [['bronze', 1, 12.5], ['iron', 15, 25], ['steel', 30, 37.5], ['mithril', 50, 50], ['adamant', 70, 62.5], ['rune', 85, 75]]) {
    for (const [p, bars, lv] of pieces) if (ITEMS[metal + '_' + p]) SMITHING.push({ metal, out: metal + '_' + p, bar: (metal === 'adamant' ? 'adamantite' : metal === 'rune' ? 'runite' : metal) + '_bar', bars, level: Math.min(99, base + lv), xp: xp * bars, qty: p === 'arrowtips' ? 15 : p === 'dart_tip' ? 10 : 1 });
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
  ...Object.fromEntries(FISH.map(([id, , , , , , cl, cx, , sb, ic]) => ['raw_' + id, { out: id, burnt: ic === 'lobster' ? 'burnt_lobster' : 'burnt_fish', level: cl, xp: cx, stopBurn: sb }])),
  raw_shrimps: { out: 'shrimps', burnt: 'burnt_shrimp', level: 1, xp: 30, stopBurn: 34 },
  raw_anchovies: { out: 'anchovies', burnt: 'burnt_fish', level: 1, xp: 30, stopBurn: 34 },
  raw_beef: { out: 'cooked_meat', burnt: 'burnt_meat', level: 1, xp: 30, stopBurn: 31 },
  raw_chicken: { out: 'cooked_chicken', burnt: 'burnt_chicken', level: 1, xp: 30, stopBurn: 31 },
};
const FIREMAKING = { logs: { level: 1, xp: 40 }, oak_logs: { level: 15, xp: 60 }, willow_logs: { level: 30, xp: 90 }, maple_logs: { level: 45, xp: 135 }, teak_logs: { level: 35, xp: 105 }, mahogany_logs: { level: 50, xp: 157.5 }, yew_logs: { level: 60, xp: 202.5 }, magic_logs: { level: 75, xp: 303.8 } };
const SHAFTS = { logs: { level: 1, xp: 5, qty: 15 }, oak_logs: { level: 15, xp: 10, qty: 30 }, willow_logs: { level: 30, xp: 15, qty: 45 } };

const TREES = {
  tree: { name: 'Tree', level: 1, xp: 25, log: 'logs', deplete: 1, respawn: [15, 30], base: 0.32 },
  oak: { name: 'Oak', level: 15, xp: 37.5, log: 'oak_logs', deplete: 0.125, respawn: [14, 20], base: 0.2 },
  willow: { name: 'Willow', level: 30, xp: 67.5, log: 'willow_logs', deplete: 0.125, respawn: [14, 20], base: 0.16 },
  maple: { name: 'Maple tree', level: 45, xp: 100, log: 'maple_logs', deplete: 0.1, respawn: [50, 60], base: 0.12 },
  teak: { name: 'Teak', level: 35, xp: 85, log: 'teak_logs', deplete: 0.12, respawn: [40, 50], base: 0.12 },
  mahogany: { name: 'Mahogany', level: 50, xp: 125, log: 'mahogany_logs', deplete: 0.1, respawn: [60, 80], base: 0.09 },
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
  cosmic: { level: 27, xp: 8, multi: 59, pure: true }, chaos: { level: 35, xp: 8.5, multi: 74, pure: true }, nature: { level: 44, xp: 9, multi: 91, pure: true }, law: { level: 54, xp: 9.5, multi: 99, pure: true }, death: { level: 65, xp: 10, multi: 99, pure: true },
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
  { id: 'ardenvale_tele', name: 'Ardenvale Teleport', level: 20, runes: { law: 1, air: 3, water: 1 }, xp: 30, type: 'tele', col: '#a060ff', glyph: 'A', dest: [90, 84] },
  { id: 'varrock_tele', name: 'Varrock Teleport', level: 25, runes: { law: 1, air: 3, fire: 1 }, xp: 35, type: 'tele', col: '#a060ff', glyph: 'V', dest: [154, 217] },
  { id: 'lumbridge_tele', name: 'Lumbridge Teleport', level: 31, runes: { law: 1, air: 3, earth: 1 }, xp: 41, type: 'tele', col: '#a060ff', glyph: 'L', dest: [99, 235] },
  { id: 'whitecliff_tele', name: 'Whitecliff Teleport', level: 37, runes: { law: 1, air: 3, water: 1 }, xp: 48, type: 'tele', col: '#a060ff', glyph: 'W', dest: [77, 22] },
  { id: 'earth_bolt', name: 'Earth Bolt', level: 29, runes: { earth: 3, air: 2, chaos: 1 }, xp: 19.5, max: 11, type: 'combat', col: '#8a5a2a', glyph: 'E' },
  { id: 'fire_bolt', name: 'Fire Bolt', level: 35, runes: { fire: 4, air: 3, chaos: 1 }, xp: 22.5, max: 12, type: 'combat', col: '#e03018', glyph: 'F' },
  { id: 'wind_blast', name: 'Wind Blast', level: 41, runes: { air: 3, death: 1 }, xp: 25.5, max: 13, type: 'combat', col: '#e8e8f8', glyph: 'W' },
  { id: 'water_blast', name: 'Water Blast', level: 47, runes: { water: 3, air: 3, death: 1 }, xp: 28.5, max: 14, type: 'combat', col: '#3a70e0', glyph: 'W' },
  { id: 'earth_blast', name: 'Earth Blast', level: 53, runes: { earth: 4, air: 3, death: 1 }, xp: 31.5, max: 15, type: 'combat', col: '#8a5a2a', glyph: 'E' },
  { id: 'fire_blast', name: 'Fire Blast', level: 59, runes: { fire: 5, air: 4, death: 1 }, xp: 34.5, max: 16, type: 'combat', col: '#e03018', glyph: 'F' },
  { id: 'enchant1', name: 'Enchant Sapphire', level: 7, runes: { water: 1, cosmic: 1 }, xp: 17.5, type: 'item', enchant: { sapphire_amulet: 'amulet_magic', sapphire_ring: 'ring_recoil' }, col: '#3050e0', glyph: 'S' },
  { id: 'enchant2', name: 'Enchant Emerald', level: 27, runes: { air: 3, cosmic: 1 }, xp: 37, type: 'item', enchant: { emerald_amulet: 'amulet_defence' }, col: '#20b040', glyph: 'E' },
  { id: 'high_alch', name: 'High Level Alchemy', level: 55, runes: { fire: 5, nature: 1 }, xp: 65, type: 'item', mult: 0.6, col: '#ffd040', glyph: 'H' },
];

// ---- Agility course (start tile, end tile, path) ----
const AGILITY = [
  { course: 'ardenvale', model: 'log', name: 'Log balance', op: 'Walk-across', start: [30, 58], path: [[31, 58], [32, 58], [33, 58], [34, 58], [35, 58], [36, 58], [37, 58]], xp: 7.5, anim: 'balance', msg: 'You walk carefully across the slippery log...' },
  { course: 'ardenvale', model: 'net', name: 'Obstacle net', op: 'Climb-over', start: [37, 59], path: [[38, 59], [39, 59]], xp: 7.5, anim: 'climb', msg: 'You climb over the netting...' },
  { course: 'ardenvale', model: 'rope', name: 'Balancing rope', op: 'Walk-on', start: [39, 60], path: [[39, 61], [39, 62], [39, 63], [39, 64], [39, 65]], xp: 7.5, anim: 'balance', fail: 0.15, msg: 'You carefully cross the tightrope.' },
  { course: 'ardenvale', model: 'pipe', name: 'Obstacle pipe', op: 'Squeeze-through', start: [38, 66], path: [[37, 66], [36, 66], [35, 66], [34, 66], [33, 66], [32, 66]], xp: 7.5, anim: 'crawl', msg: 'You squeeze into the pipe...' },
  { course: 'ardenvale', model: 'swing', name: 'Rope swing', op: 'Swing-on', start: [31, 65], path: [[31, 64], [31, 63], [31, 62], [31, 61], [31, 60]], xp: 7.5, anim: 'swing', fail: 0.1, msg: 'You skillfully swing across.', bonus: 39 },
  // Barbarian Outpost course (level 35)
  { course: 'barbarian', abs: true, level: 35, model: 'swing', rect: [93, 189, 1, 4], name: 'Rope swing', op: 'Swing-on', start: [93, 188], path: [[93, 189], [93, 190], [93, 191], [93, 192], [93, 193]], xp: 22, anim: 'swing', fail: 0.15, msg: 'You grab the rope and swing...' },
  { course: 'barbarian', abs: true, level: 35, model: 'log', rect: [95, 194, 5, 1], name: 'Log balance', op: 'Walk-across', start: [94, 194], path: [[95, 194], [96, 194], [97, 194], [98, 194], [99, 194], [100, 194]], xp: 13.7, anim: 'balance', fail: 0.1, msg: 'You walk carefully across the slippery log...' },
  { course: 'barbarian', abs: true, level: 35, model: 'net', rect: [102, 193, 1, 3], name: 'Obstacle net', op: 'Climb-over', start: [101, 194], path: [[102, 194], [103, 194]], xp: 8.2, anim: 'climb', msg: 'You climb the netting...' },
  { course: 'barbarian', abs: true, level: 35, model: 'ledge', rect: [104, 190, 1, 3], name: 'Balancing ledge', op: 'Walk-across', start: [104, 193], path: [[104, 192], [104, 191], [104, 190], [104, 189]], xp: 22, anim: 'balance', fail: 0.12, msg: 'You put your foot on the ledge and try to edge across...' },
  { course: 'barbarian', abs: true, level: 35, model: 'wall', rect: [102, 188, 1, 1], name: 'Crumbling wall', op: 'Climb-over', start: [103, 188], path: [[102, 188], [101, 188]], xp: 13.7, anim: 'climb', msg: 'You climb over the crumbling wall.', bonus: 46.2 },
  // Wilderness course (level 52)
  { course: 'wilderness', abs: true, level: 52, model: 'pipe', rot: 1, rect: [20, 154, 1, 5], name: 'Obstacle pipe', op: 'Squeeze-through', start: [20, 160], path: [[20, 159], [20, 158], [20, 157], [20, 156], [20, 155], [20, 154], [20, 153]], xp: 12.5, anim: 'crawl', msg: 'You squeeze through the pipe...' },
  { course: 'wilderness', abs: true, level: 52, model: 'swing', rect: [20, 148, 1, 4], name: 'Rope swing', op: 'Swing-on', start: [20, 152], path: [[20, 151], [20, 150], [20, 149], [20, 148], [20, 147]], xp: 20, anim: 'swing', fail: 0.2, msg: 'You swing over the pit of spikes...' },
  { course: 'wilderness', abs: true, level: 52, model: 'stones', rect: [22, 146, 4, 1], name: 'Stepping stones', op: 'Cross', start: [21, 146], path: [[22, 146], [23, 146], [24, 146], [25, 146], [26, 146]], xp: 20, anim: 'balance', fail: 0.2, msg: 'You leap across the stepping stones over the lava...' },
  { course: 'wilderness', abs: true, level: 52, model: 'log', rot: 1, rect: [26, 148, 1, 5], name: 'Log balance', op: 'Walk-across', start: [26, 147], path: [[26, 148], [26, 149], [26, 150], [26, 151], [26, 152], [26, 153]], xp: 20, anim: 'balance', fail: 0.15, msg: 'You walk carefully across the slippery log...' },
  { course: 'wilderness', abs: true, level: 52, model: 'wall', rot: 1, rect: [26, 155, 1, 3], name: 'Rocks', op: 'Climb', start: [26, 154], path: [[26, 155], [26, 156], [26, 157], [26, 158]], xp: 25, anim: 'climb', msg: 'You climb up the rocks.', bonus: 499 },
];
// Fairy rings: 3 dials, code -> destination
const FAIRY_DIALS = [['A', 'B', 'C', 'D'], ['I', 'J', 'K', 'L'], ['P', 'Q', 'R', 'S']];
const FAIRY = {
  AIQ: { name: 'Ardenvale farmland', x: 64, z: 98 },
  AJR: { name: 'Elderwood - Runestone Circle', x: 102, z: 36 },
  AKQ: { name: 'Port Sarrow', x: 153, z: 98 },
  ALP: { name: 'Saltreach Isle jungle', x: 214, z: 96 },
  BIP: { name: 'Kharidian Desert', x: 118, z: 156 },
  BJR: { name: 'Wilderness (level 13)', x: 12, z: 74 },
  BKP: { name: 'Lumbridge Swamp', x: 104, z: 256 },
  BLR: { name: 'Varrock outskirts', x: 124, z: 212 },
  CIP: { name: 'Whitecliff', x: 80, z: 38 },
  CKS: { name: 'Morrow Mire', x: 214, z: 226 },
  DJR: { name: 'Duskmoor Swamp', x: 142, z: 32 },
  DLS: { name: 'Barbarian Agility Course', x: 98, z: 186 },
  DKP: { name: 'Draynor Village', x: 62, z: 232 },
  CLS: { name: 'Tree Gnome Village', x: 66, z: 206 },
  DIP: { name: 'Goblin Village', x: 124, z: 58 },
  CJR: { name: 'Edgeville', x: 58, z: 160 },
};

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
    drops: [{ id: 'bones', always: true }, { id: 'raw_chicken', always: true }, { id: 'feather', qty: [5, 15], chance: 0.8 }, { id: 'egg', chance: 0.3 }], examine: 'Yep, definitely a chicken.' },
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
  kharid_warrior: { name: 'Al Kharid warrior', level: 9, hp: 19, att: 7, str: 8, def: 6, maxHit: 2, speed: 4, model: 'kharid', wander: 4, pickpocket: { level: 25, xp: 26, coins: 18, stun: 2 },
    drops: [{ id: 'bones', always: true }, { id: 'coins', qty: [5, 30], chance: 0.7 }, { id: 'bronze_scimitar', chance: 0.04 }, { id: 'iron_scimitar', chance: 0.02 }, ...HERB_DROPS], examine: 'A warrior of Al Kharid.' },
  zeke: { name: 'Zeke', level: 0, model: 'zeke', wander: 1, talk: 'generic', shop: 'scimitars', examine: 'A sharp-dressed merchant.', greet: 'A thousand greetings! Can I interest you in a superior scimitar?' },
  kharid_banker: { name: 'Banker', level: 0, model: 'banker', wander: 0, talk: 'banker', bank: true, examine: 'Good with money.' },
  farmer_npc: { name: 'Farmer', level: 7, hp: 12, att: 6, str: 6, def: 5, maxHit: 1, speed: 4, model: 'farmer', wander: 4, talk: 'man', pickpocket: { level: 10, xp: 14.5, coins: 9, stun: 1, extra: 'potato_seed' },
    drops: [{ id: 'bones', always: true }, { id: 'potato_seed', qty: [1, 4], chance: 0.4 }, { id: 'onion_seed', qty: [1, 3], chance: 0.2 }], examine: 'He grows the crops in this area.' },
  white_knight: { name: 'White Knight', level: 36, hp: 52, att: 30, str: 30, def: 32, maxHit: 5, speed: 4, model: 'white_knight', wander: 3, pickpocket: { level: 55, xp: 84.3, coins: 50, stun: 3 },
    drops: [{ id: 'bones', always: true }, { id: 'coins', qty: [20, 120], chance: 0.8 }, { id: 'steel_platebody', chance: 0.03 }, { id: 'mithril_full_helm', chance: 0.02 }, { id: 'uncut_sapphire', chance: 0.04 }, { id: 'ranarr_seed', chance: 0.03 }], examine: 'A knight of Whitecliff.' },
  jogre: { name: 'Jogre', level: 53, hp: 60, att: 43, str: 45, def: 40, maxHit: 6, speed: 4, model: 'jogre', wander: 4, aggressive: true,
    drops: [{ id: 'jogre_bones', always: true }, { id: 'coins', qty: [30, 200], chance: 0.6 }, { id: 'uncut_emerald', chance: 0.05 }, { id: 'irit_seed', chance: 0.04 }, { id: 'teak_logs', qty: [2, 6], chance: 0.1 }, { id: 'nature_rune', qty: [5, 15], chance: 0.1 }], examine: 'An aggressive humanoid from the jungle.' },
  jungle_spider: { name: 'Jungle spider', level: 44, hp: 50, att: 38, str: 38, def: 34, maxHit: 5, speed: 4, model: 'spider', wander: 4, aggressive: true,
    drops: [{ id: 'coins', qty: [10, 80], chance: 0.5 }, { id: 'snape_grass', chance: 0.06 }, { id: 'uncut_ruby', chance: 0.02 }], examine: 'A barbarous jungle spider.' },
  crawling_hand: { name: 'Crawling Hand', level: 8, hp: 16, att: 6, str: 6, def: 6, maxHit: 2, speed: 4, model: 'hand', wander: 3, aggressive: true, slayerReq: 5,
    drops: [{ id: 'bones', always: true }, { id: 'coins', qty: [5, 40], chance: 0.6 }, { id: 'leather_gloves', chance: 0.05 }, { id: 'uncut_sapphire', chance: 0.03 }], examine: 'The cadaver of a hand. Crawling.' },
  banshee: { name: 'Banshee', level: 23, hp: 22, att: 20, str: 18, def: 16, maxHit: 3, speed: 4, model: 'banshee', wander: 3, aggressive: true, slayerReq: 15,
    drops: [{ id: 'coins', qty: [20, 100], chance: 0.7 }, { id: 'grimy_ranarr', chance: 0.06 }, { id: 'uncut_emerald', chance: 0.04 }, { id: 'ranarr_seed', chance: 0.05 }], examine: 'A tortured screaming soul.' },
  green_dragon: { name: 'Green dragon', level: 79, hp: 75, att: 68, str: 68, def: 68, maxHit: 9, speed: 4, model: 'dragon', wander: 3, aggressive: true,
    drops: [{ id: 'dragon_bones', always: true }, { id: 'coins', qty: [100, 700], chance: 0.8 }, { id: 'rune_full_helm', chance: 0.02 }, { id: 'uncut_diamond', chance: 0.04 }, { id: 'adamantite_bar', chance: 0.06 }, { id: 'runite_ore', chance: 0.02 }], examine: 'It\'s a dragon.' },
  armourer: { name: 'Sir Vyvin\'s Armourer', level: 0, model: 'smith', wander: 1, talk: 'generic', shop: 'armour', examine: 'He keeps the knights well equipped.', greet: 'Welcome to the Whitecliff Armoury. Only the finest steel and mithril!' },
  gem_trader: { name: 'Gem trader', level: 0, model: 'shopkeeper', wander: 1, talk: 'generic', shop: 'gems', examine: 'He deals in precious stones.', greet: 'Gems, chisels and moulds! Cut them yourself and make your own jewellery at a furnace.' },
  fishmonger: { name: 'Gerrant the Fishmonger', level: 0, model: 'sailor', wander: 1, talk: 'generic', shop: 'fishing', examine: 'He smells like he lives up to his name.', greet: 'Fishing gear for every catch! Rods, harpoons and lobster pots.' },
  sailor_sarrow: { name: 'Captain Tobias', level: 0, model: 'sailor', wander: 0, talk: 'sail', examine: 'A seasoned captain.', sail: 'saltreach' },
  sailor_saltreach: { name: 'Customs officer', level: 0, model: 'sailor', wander: 0, talk: 'sail', examine: 'She checks passengers coming and going.', sail: 'sarrow' },
  island_shop: { name: 'Luthas', level: 0, model: 'shopkeeper', wander: 1, talk: 'generic', shop: 'jungle', examine: 'He runs the plantation store.', greet: 'Welcome to Saltreach! Bananas, supplies and the best fishing in the realm.' },
  dark_wizard: { name: 'Dark wizard', level: 20, hp: 24, att: 17, str: 17, def: 14, maxHit: 4, speed: 5, model: 'dark_wizard', wander: 3, aggressive: true, magic: '#e03018',
    drops: [{ id: 'bones', always: true }, { id: 'coins', qty: [5, 40], chance: 0.6 }, { id: 'chaos_rune', qty: [2, 8], chance: 0.2 }, { id: 'nature_rune', qty: [1, 4], chance: 0.1 }, { id: 'law_rune', qty: [1, 3], chance: 0.08 }, { id: 'cosmic_rune', qty: [2, 6], chance: 0.1 }, { id: 'wizard_hat', chance: 0.05 }, { id: 'mystic_hat', chance: 0.004 }], examine: 'A practitioner of dark arts.' },
  hill_giant: { name: 'Hill Giant', level: 28, hp: 35, att: 18, str: 22, def: 26, maxHit: 4, speed: 6, model: 'hill_giant', wander: 4,
    drops: [{ id: 'big_bones', always: true }, { id: 'coins', qty: [10, 80], chance: 0.6 }, { id: 'limpwurt_root', chance: 0.15 }, { id: 'steel_platelegs', chance: 0.02 }, { id: 'law_rune', qty: [1, 3], chance: 0.06 }, { id: 'grimy_ranarr', chance: 0.04 }], examine: 'A very large foe.' },
  barbarian: { name: 'Barbarian', level: 10, hp: 14, att: 8, str: 9, def: 6, maxHit: 2, speed: 4, model: 'barbarian', wander: 4, talk: 'man',
    drops: [{ id: 'bones', always: true }, { id: 'coins', qty: [5, 30], chance: 0.5 }, { id: 'iron_axe', chance: 0.03 }, { id: 'raw_beef', chance: 0.1 }], examine: 'Not civilised looking.' },
  mugger: { name: 'Mugger', level: 6, hp: 8, att: 5, str: 5, def: 4, maxHit: 1, speed: 4, model: 'bandit', wander: 4, aggressive: true,
    drops: [{ id: 'bones', always: true }, { id: 'coins', qty: [2, 25], chance: 0.6 }, { id: 'knife', chance: 0.05 }], examine: 'He jumps out and attacks people.' },
  imp: { name: 'Imp', level: 2, hp: 8, att: 1, str: 1, def: 3, maxHit: 1, speed: 4, model: 'imp', wander: 6,
    drops: [{ id: 'ashes', always: true }, { id: 'egg', chance: 0.1 }, { id: 'bucket', chance: 0.05 }, { id: 'mind_rune', qty: [1, 5], chance: 0.1 }], examine: 'A cheeky little imp.' },
  varrock_guard: { name: 'Guard', level: 21, hp: 22, att: 19, str: 18, def: 14, maxHit: 4, speed: 5, model: 'guard', wander: 3, pickpocket: { level: 40, xp: 46.8, coins: 30, stun: 2 },
    drops: [{ id: 'bones', always: true }, { id: 'coins', qty: [10, 40], chance: 0.8 }, { id: 'iron_full_helm', chance: 0.02 }, { id: 'steel_arrowtips', qty: [5, 15], chance: 0.05 }], examine: 'He guards Varrock.' },
  aubury: { name: 'Aubury', level: 0, model: 'mage', wander: 1, talk: 'aubury', shop: 'aubury', examine: 'I think he might be a shop keeper.' },
  zaff: { name: 'Zaff', level: 0, model: 'mage', wander: 1, talk: 'generic', shop: 'zaff', examine: 'Trader of staffs.', greet: 'Would you like to buy or sell some staffs?' },
  lowe: { name: 'Lowe', level: 0, model: 'fletcher', wander: 1, talk: 'generic', shop: 'lowe', examine: 'An archery store owner.', greet: 'Welcome to Lowe\'s Archery Emporium. Do you want to see my wares?' },
  horvik: { name: 'Horvik', level: 0, model: 'smith', wander: 1, talk: 'generic', shop: 'horvik', examine: 'He looks strong.', greet: 'Hello, do you need any help? I sell the finest armour in Varrock.' },
  bob: { name: 'Bob', level: 0, model: 'smith', wander: 1, talk: 'generic', shop: 'bob', examine: 'An axe seller.', greet: 'Hello. How can I help you? I sell axes and pickaxes, and I can repair... well, I can sell.' },
  lumby_shop: { name: 'Shop keeper', level: 0, model: 'shopkeeper', wander: 1, talk: 'shop', shop: 'lumby', examine: 'Maybe he\'d like to buy some of my junk.' },
  hans: { name: 'Hans', level: 0, model: 'hans', wander: 8, talk: 'generic', examine: 'Servant of the Duke of Lumbridge.', greet: 'Hello. What are you doing here? I\'ve been walking around this castle for as long as I can remember.' },
  duke: { name: 'Duke Horacio', level: 0, model: 'duke', wander: 1, talk: 'generic', examine: 'Duke Horacio of Lumbridge.', greet: 'Greetings. Welcome to my castle. Mind you don\'t trip over the cook\'s pots.' },
  cook: { name: 'Cook', level: 0, model: 'cook', wander: 1, talk: 'cook', examine: 'The head cook of Lumbridge Castle.' },
  priest2: { name: 'Father Aereth', level: 0, model: 'priest', wander: 1, talk: 'generic', examine: 'A peaceful priest.', greet: 'Welcome to the church of Lumbridge. Feel free to pray at our altar.' },
  ghast: { name: 'Ghast', level: 30, hp: 30, att: 26, str: 24, def: 22, maxHit: 4, speed: 4, model: 'ghast', wander: 4, aggressive: true,
    drops: [{ id: 'coins', qty: [10, 90], chance: 0.6 }, { id: 'grimy_ranarr', chance: 0.06 }, { id: 'ranarr_seed', chance: 0.05 }, { id: 'snape_grass', chance: 0.1 }, { id: 'uncut_emerald', chance: 0.03 }, { id: 'death_rune', qty: [1, 4], chance: 0.08 }], examine: 'A starved ghost of the swamp.' },
  giant_frog: { name: 'Giant frog', level: 13, hp: 18, att: 10, str: 10, def: 8, maxHit: 2, speed: 4, model: 'frog', wander: 4,
    drops: [{ id: 'big_bones', always: true }, { id: 'raw_bird_meat', chance: 0.2 }, { id: 'snape_grass', chance: 0.05 }], examine: 'It looks like it could swallow me whole!' },
  swamp_wizard: { name: 'Wizard Distentor', level: 0, model: 'mage', wander: 1, talk: 'esswizard', examine: 'A wizard who studies rune essence.' },
  zombie: { name: 'Zombie', level: 13, hp: 20, att: 10, str: 10, def: 8, maxHit: 2, speed: 5, model: 'zombie', wander: 3, aggressive: true,
    drops: [{ id: 'bones', always: true }, { id: 'coins', qty: [3, 30], chance: 0.5 }, { id: 'eye_of_newt', chance: 0.1 }, { id: 'grimy_guam', chance: 0.06 }, { id: 'body_rune', qty: [2, 6], chance: 0.08 }], examine: 'The walking dead.' },
  giant_spider: { name: 'Giant spider', level: 2, hp: 5, att: 1, str: 2, def: 1, maxHit: 1, speed: 4, model: 'spider_small', wander: 4, drops: [], examine: 'I think this spider has been genetically modified.' },
  unicorn: { name: 'Unicorn', level: 15, hp: 19, att: 12, str: 12, def: 10, maxHit: 2, speed: 4, model: 'unicorn', wander: 4,
    drops: [{ id: 'bones', always: true }, { id: 'unicorn_horn', always: true }], examine: 'This is meant to be a mythical beast!' },
  bear: { name: 'Grizzly bear', level: 21, hp: 27, att: 18, str: 18, def: 14, maxHit: 3, speed: 4, model: 'bear', wander: 4,
    drops: [{ id: 'bones', always: true }, { id: 'bear_fur', always: true }, { id: 'raw_beef', chance: 0.4 }], examine: 'Eek! A bear!' },
  wolf: { name: 'White wolf', level: 25, hp: 34, att: 22, str: 22, def: 18, maxHit: 4, speed: 4, model: 'wolf', wander: 5, aggressive: true,
    drops: [{ id: 'wolf_bones', always: true }, { id: 'coins', qty: [5, 30], chance: 0.3 }], examine: 'A vicious mountain wolf.' },
  hobgoblin: { name: 'Hobgoblin', level: 28, hp: 29, att: 22, str: 24, def: 20, maxHit: 4, speed: 4, model: 'hobgoblin', wander: 4, aggressive: true,
    drops: [{ id: 'bones', always: true }, { id: 'coins', qty: [10, 60], chance: 0.6 }, { id: 'limpwurt_root', chance: 0.15 }, { id: 'iron_scimitar', chance: 0.04 }, { id: 'grimy_tarromin', chance: 0.06 }, { id: 'law_rune', qty: [1, 3], chance: 0.06 }], examine: 'An ugly smelly creature.' },
  black_knight: { name: 'Black Knight', level: 33, hp: 42, att: 25, str: 25, def: 30, maxHit: 4, speed: 4, model: 'black_knight', wander: 3, aggressive: true,
    drops: [{ id: 'bones', always: true }, { id: 'coins', qty: [10, 120], chance: 0.7 }, { id: 'steel_platelegs', chance: 0.04 }, { id: 'iron_full_helm', chance: 0.05 }, { id: 'mithril_bar', chance: 0.03 }, { id: 'death_rune', qty: [1, 3], chance: 0.06 }], examine: 'A sinister looking knight.' },
  moss_giant: { name: 'Moss giant', level: 42, hp: 60, att: 30, str: 30, def: 30, maxHit: 5, speed: 6, model: 'moss_giant', wander: 4,
    drops: [{ id: 'big_bones', always: true }, { id: 'coins', qty: [20, 200], chance: 0.6 }, { id: 'nature_rune', qty: [3, 12], chance: 0.15 }, { id: 'mithril_sword', chance: 0.03 }, { id: 'steel_kiteshield', chance: 0.03 }, { id: 'uncut_sapphire', chance: 0.05 }, { id: 'ranarr_seed', chance: 0.04 }], examine: 'His beard seems to have a life of its own.' },
  ice_warrior: { name: 'Ice warrior', level: 57, hp: 59, att: 47, str: 47, def: 47, maxHit: 6, speed: 5, model: 'ice_warrior', wander: 4, aggressive: true,
    drops: [{ id: 'coins', qty: [30, 200], chance: 0.7 }, { id: 'adamant_scimitar', chance: 0.02 }, { id: 'mithril_platebody', chance: 0.02 }, { id: 'law_rune', qty: [2, 6], chance: 0.1 }, { id: 'uncut_ruby', chance: 0.03 }], examine: 'A cold-hearted elemental warrior.' },
  ice_giant: { name: 'Ice giant', level: 53, hp: 70, att: 40, str: 40, def: 40, maxHit: 6, speed: 6, model: 'ice_giant', wander: 4, aggressive: true,
    drops: [{ id: 'big_bones', always: true }, { id: 'coins', qty: [40, 300], chance: 0.7 }, { id: 'adamant_platelegs', chance: 0.02 }, { id: 'mithril_kiteshield', chance: 0.03 }, { id: 'death_rune', qty: [2, 6], chance: 0.1 }], examine: 'He\'s got icicles in his beard.' },
  greater_demon: { name: 'Greater demon', level: 92, hp: 87, att: 76, str: 78, def: 81, maxHit: 10, speed: 4, model: 'greater_demon', wander: 3, aggressive: true,
    drops: [{ id: 'ashes', always: true }, { id: 'coins', qty: [200, 1500], always: true }, { id: 'rune_full_helm', chance: 0.03 }, { id: 'rune_scimitar', chance: 0.015 }, { id: 'adamant_platebody', chance: 0.03 }, { id: 'death_rune', qty: [5, 15], chance: 0.2 }, { id: 'runite_bar', chance: 0.02 }], examine: 'Big, red, and incredibly evil.' },
  blue_dragon: { name: 'Blue dragon', level: 111, hp: 105, att: 95, str: 95, def: 95, maxHit: 12, speed: 4, model: 'blue_dragon', wander: 3, aggressive: true,
    drops: [{ id: 'dragon_bones', always: true }, { id: 'blue_dhide', always: true }, { id: 'coins', qty: [300, 2000], chance: 0.8 }, { id: 'rune_platelegs', chance: 0.02 }, { id: 'uncut_diamond', chance: 0.05 }, { id: 'runite_ore', chance: 0.04 }, { id: 'law_rune', qty: [5, 20], chance: 0.15 }], examine: 'A big powerful dragon.' },
  wise_old_man: { name: 'Wise Old Man', level: 0, model: 'elder', wander: 2, talk: 'generic', examine: 'A wise old man.', greet: 'Back in my day, adventurers had to walk everywhere. Now you lot have fairy rings and fancy teleports! Try the fishing on the Draynor shore - willows and shrimps galore.' },
  draynor_shop: { name: 'Market seller', level: 0, model: 'farmer', wander: 1, talk: 'generic', shop: 'draynor', examine: 'He sells farming goods.', greet: 'Seeds! Fresh seeds! Plant them in any patch you like.' },
  edge_shop: { name: 'Shopkeeper', level: 0, model: 'shopkeeper', wander: 1, talk: 'shop', shop: 'edge', examine: 'He supplies adventurers heading into the Wilderness.' },
  guide: { name: 'Adventure Guide', level: 0, model: 'guide', wander: 0, talk: 'guide', examine: 'He helps new adventurers find their feet.' },
  minotaur: { name: 'Minotaur', level: 19, hp: 22, att: 16, str: 16, def: 14, maxHit: 3, speed: 4, model: 'minotaur', wander: 3, aggressive: true,
    drops: [{ id: 'bones', always: true }, { id: 'coins', qty: [10, 60], chance: 0.6 }, { id: 'iron_arrow', qty: [5, 20], chance: 0.2 }, { id: 'iron_full_helm', chance: 0.03 }, ...HERB_DROPS], examine: 'Half man, half bull, all angry.' },
  flesh_crawler: { name: 'Flesh Crawler', level: 28, hp: 25, att: 22, str: 20, def: 18, maxHit: 3, speed: 3, model: 'flesh_crawler', wander: 4, aggressive: true,
    drops: [{ id: 'coins', qty: [10, 90], chance: 0.6 }, { id: 'fire_rune', qty: [5, 20], chance: 0.15 }, { id: 'iron_ore', chance: 0.1 }, { id: 'coal', chance: 0.08 }, ...HERB_DROPS], examine: 'A scuttling horror of the deep.' },
  catablepon: { name: 'Catablepon', level: 49, hp: 50, att: 38, str: 40, def: 35, maxHit: 6, speed: 4, model: 'catablepon', wander: 3, aggressive: true,
    drops: [{ id: 'bones', always: true }, { id: 'coins', qty: [30, 200], chance: 0.6 }, { id: 'steel_platebody', chance: 0.03 }, { id: 'mithril_ore', chance: 0.06 }, { id: 'nature_rune', qty: [3, 9], chance: 0.1 }, ...HERB_DROPS], examine: 'Its gaze makes you feel weaker.' },
  pit_spider: { name: 'Giant spider', level: 27, hp: 32, att: 22, str: 24, def: 20, maxHit: 4, speed: 4, model: 'pit_spider', wander: 4, aggressive: true,
    drops: [{ id: 'coins', qty: [10, 80], chance: 0.5 }, { id: 'eye_of_newt', chance: 0.1 }], examine: 'A very large spider.' },
  ankou: { name: 'Ankou', level: 75, hp: 70, att: 55, str: 60, def: 50, maxHit: 9, speed: 4, model: 'ankou', wander: 3, aggressive: true,
    drops: [{ id: 'bones', always: true }, { id: 'coins', qty: [80, 500], chance: 0.7 }, { id: 'death_rune', qty: [5, 15], chance: 0.2 }, { id: 'chaos_rune', qty: [10, 30], chance: 0.1 }, { id: 'adamant_scimitar', chance: 0.02 }, { id: 'rune_full_helm', chance: 0.005 }, ...HERB_DROPS], examine: 'A spectral servant of death.' },
  chaos_druid: { name: 'Chaos druid', level: 13, hp: 20, att: 8, str: 8, def: 10, maxHit: 2, speed: 4, model: 'chaos_druid', wander: 4, aggressive: true,
    drops: [{ id: 'bones', always: true }, { id: 'law_rune', qty: [1, 3], chance: 0.15 }, { id: 'nature_rune', qty: [1, 3], chance: 0.1 }, { id: 'grimy_guam', chance: 0.15 }, { id: 'grimy_marrentill', chance: 0.12 }, { id: 'grimy_tarromin', chance: 0.1 }, { id: 'grimy_harralander', chance: 0.08 }, { id: 'grimy_ranarr', chance: 0.05 }], examine: 'A crazy, evil druid.' },
  goblin_warrior: { name: 'Goblin', level: 11, hp: 16, att: 9, str: 9, def: 10, maxHit: 2, speed: 4, model: 'goblin_warrior', wander: 4, aggressive: true,
    drops: [{ id: 'bones', always: true }, { id: 'coins', qty: [5, 40], chance: 0.6 }, { id: 'bronze_scimitar', chance: 0.04 }, { id: 'iron_full_helm', chance: 0.02 }, { id: 'goblin_mail', chance: 0.05 }, ...HERB_DROPS], examine: 'An armoured goblin warrior.' },
  gnome: { name: 'Gnome', level: 3, hp: 5, att: 2, str: 2, def: 3, maxHit: 1, speed: 4, model: 'gnome', wander: 5, talk: 'gnome', pickpocket: { level: 75, xp: 198.5, coins: 300, stun: 1, extra: 'chocolate_bomb' },
    drops: [{ id: 'bones', always: true }, { id: 'coins', qty: [2, 25], chance: 0.6 }, { id: 'toad_crunchies', chance: 0.1 }], examine: 'Like a mini man!' },
  gnome_guard: { name: 'Gnome guard', level: 23, hp: 31, att: 18, str: 18, def: 20, maxHit: 3, speed: 4, model: 'gnome_guard', wander: 3,
    drops: [{ id: 'bones', always: true }, { id: 'coins', qty: [10, 60], chance: 0.7 }, { id: 'worm_batta', chance: 0.1 }, { id: 'oak_shortbow', chance: 0.03 }], examine: 'A tree gnome guard.' },
  gnome_king: { name: 'King Bolren', level: 0, model: 'gnome_king', wander: 1, talk: 'generic', examine: 'King of the tree gnomes.', greet: 'Welcome, human, to the Tree Gnome Village! Our Spirit Tree can carry you to its brothers across the land.' },
  gnome_trader: { name: 'Aluft Gianne', level: 0, model: 'gnome', wander: 1, talk: 'generic', shop: 'gnomefood', examine: 'A gnome chef.', greet: 'Hungry, human? Try my worm battas - finest in the land!' },
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
  armour: { name: 'Whitecliff Armoury', stock: [['wk_helm', 1], ['wk_body', 1], ['wk_legs', 1], ['wk_shield', 1], ['steel_full_helm', 3], ['steel_platebody', 2], ['steel_platelegs', 2], ['steel_kiteshield', 2], ['mithril_full_helm', 1], ['mithril_platebody', 1], ['mithril_kiteshield', 1], ['steel_scimitar', 2]] },
  gems: { name: 'Whitecliff Gem Store', stock: [['chisel', 10], ['uncut_sapphire', 5], ['uncut_emerald', 3], ['sapphire', 2], ['gold_bar', 5]] },
  fishing: { name: 'Gerrant\'s Fishy Business', stock: [['small_net', 5], ['fishing_rod', 5], ['fly_fishing_rod', 5], ['fishing_bait', 500], ['feather', 500], ['harpoon', 5], ['lobster_pot', 5], ['big_net', 5], ['raw_shrimps', 0]] },
  jungle: { name: 'Saltreach Supplies', stock: [['banana', 20], ['bird_snare', 5], ['harpoon', 2], ['lobster_pot', 2], ['unicorn_horn_dust', 5], ['snape_grass', 3]] },
  aubury: { name: 'Aubury\'s Rune Shop', stock: [['air_rune', 1000], ['water_rune', 1000], ['earth_rune', 1000], ['fire_rune', 1000], ['mind_rune', 1000], ['body_rune', 500], ['chaos_rune', 100], ['death_rune', 50], ['air_talisman', 5], ['mind_talisman', 5], ['water_talisman', 5], ['earth_talisman', 5], ['fire_talisman', 5], ['body_talisman', 5], ['tiara', 10], ['medium_pouch', 1], ['rune_essence', 200]] },
  zaff: { name: 'Zaff\'s Superior Staffs', stock: [['staff', 5], ['staff_of_air', 2], ['staff_of_water', 2], ['staff_of_earth', 2], ['staff_of_fire', 2]] },
  lowe: { name: 'Lowe\'s Archery Emporium', stock: [['shortbow', 4], ['longbow', 4], ['oak_shortbow', 3], ['oak_longbow', 3], ['willow_shortbow', 2], ['maple_shortbow', 1], ['bronze_arrow', 1000], ['iron_arrow', 500], ['steel_arrow', 200], ['mithril_arrow', 100], ['bronze_dart', 500], ['iron_dart', 300], ['steel_dart', 100]] },
  horvik: { name: 'Horvik\'s Armour Shop', stock: [['bronze_platebody', 5], ['iron_platebody', 3], ['steel_platebody', 2], ['mithril_platebody', 1], ['iron_platelegs', 3], ['steel_platelegs', 2], ['mithril_platelegs', 1], ['leather_body', 5], ['leather_chaps', 5]] },
  bob: { name: 'Bob\'s Brilliant Axes', stock: [['bronze_axe', 10], ['iron_axe', 5], ['steel_axe', 3], ['mithril_axe', 2], ['adamant_axe', 1], ['bronze_pickaxe', 10], ['iron_pickaxe', 5], ['steel_pickaxe', 3], ['mithril_pickaxe', 1]] },
  lumby: { name: 'Lumbridge General Store', stock: [['fishing_bait', 500], ['fishing_rod', 5], ['bucket', 10], ['pot', 10], ['pot_flour', 5], ['tinderbox', 5], ['small_net', 5], ['hammer', 5], ['chisel', 5], ['knife', 5], ['shrimps', 10], ['rune_essence', 0]] },
  draynor: { name: 'Draynor Seed Market', stock: [['potato_seed', 100], ['onion_seed', 50], ['cabbage_seed', 50], ['guam_seed', 10], ['marrentill_seed', 5], ['tarromin_seed', 5], ['rake', 3], ['seed_dibber', 3], ['spade', 3]] },
  edge: { name: 'Edgeville General Store', stock: [['fishing_bait', 300], ['fishing_rod', 3], ['lobster', 20], ['swordfish', 10], ['prayer_potion3', 5], ['super_attack3', 2], ['iron_arrow', 300], ['law_rune', 10], ['tinderbox', 5], ['small_net', 3], ['harpoon', 2]] },
  gnomefood: { name: 'Gnome Restaurant', stock: [['worm_batta', 10], ['toad_crunchies', 10], ['chocolate_bomb', 5], ['fruit_blast', 10], ['oak_shortbow', 2], ['oak_longbow', 2], ['bronze_arrow', 500]] },
  hunter: { name: 'Garrick\'s Hunting Supplies', stock: [['bird_snare', 20], ['box_trap', 10], ['knife', 5]] },
  general: { name: 'Ardenvale General Store', stock: [['red_cape', 5], ['blue_cape', 5], ['green_cape', 5], ['yellow_cape', 3], ['purple_cape', 3], ['black_cape', 3], ['fishing_rod', 5], ['fishing_bait', 200], ['feather', 200], ['vial', 10], ['bird_snare', 10], ['bronze_axe', 5], ['bronze_pickaxe', 5], ['small_net', 5], ['tinderbox', 5], ['hammer', 5], ['knife', 5], ['shrimps', 10], ['bronze_dagger', 3], ['wooden_shield', 2], ['spade', 5]] },
  smith: { name: 'Hilda\'s Forge', stock: [['iron_axe', 2], ['iron_pickaxe', 2], ['hammer', 10], ['bronze_bar', 10], ['iron_bar', 5], ['bronze_scimitar', 2], ['iron_scimitar', 1], ['bronze_platebody', 1]] },
  magic: { name: 'Orla\'s Rune Emporium', stock: [['air_talisman', 5], ['mind_talisman', 5], ['water_talisman', 3], ['earth_talisman', 3], ['fire_talisman', 3], ['body_talisman', 2], ['tiara', 5], ['air_rune', 500], ['mind_rune', 500], ['water_rune', 300], ['earth_rune', 300], ['fire_rune', 300], ['body_rune', 100], ['chaos_rune', 50], ['law_rune', 20], ['nature_rune', 20], ['staff', 5], ['staff_of_air', 1], ['wizard_hat', 5], ['wizard_robe', 5]] },
  archery: { name: 'Bryn\'s Archery Supplies', stock: [['shortbow', 4], ['longbow', 3], ['oak_shortbow', 2], ['bronze_arrow', 800], ['iron_arrow', 300], ['feather', 500], ['bow_string', 20], ['leather_cowl', 3]] },
  herbs: { name: 'Wren\'s Herbs & Vials', stock: [['unicorn_horn_dust', 10], ['snape_grass', 5], ['vial', 50], ['vial_water', 30], ['eye_of_newt', 50], ['limpwurt_root', 10], ['white_berries', 10], ['grimy_guam', 10], ['attack_potion4', 2]] },
  farming: { name: 'Ada\'s Farming Supplies', stock: [['marrentill_seed', 10], ['rake', 5], ['seed_dibber', 5], ['spade', 5], ['potato_seed', 100], ['onion_seed', 50], ['cabbage_seed', 50], ['guam_seed', 10], ['tarromin_seed', 5]] },
  crafting: { name: 'Ellis\'s Leatherworks', stock: [['needle', 10], ['thread', 200], ['leather', 20], ['leather_gloves', 3], ['leather_boots', 3]] },
};

// Fishing spot kinds and what each option catches: [fish id, level, xp]
const FISHING = {
  Net: { tool: 'small_net', anim: 'fish', fish: [['raw_shrimps', 1, 10], ['raw_anchovies', 15, 40]] },
  Bait: { tool: 'fishing_rod', bait: 'fishing_bait', anim: 'fish', fish: [['raw_sardine', 5, 20], ['raw_herring', 10, 30]] },
  'River bait': { tool: 'fishing_rod', bait: 'fishing_bait', anim: 'fish', fish: [['raw_pike', 25, 60]] },
  'Big net': { tool: 'big_net', anim: 'fish', fish: [['raw_mackerel', 16, 20], ['raw_cod', 23, 45], ['raw_bass', 46, 100]] },
  Lure: { tool: 'fly_fishing_rod', bait: 'feather', anim: 'fish', fish: [['raw_trout', 20, 50], ['raw_salmon', 30, 70]] },
  Cage: { tool: 'lobster_pot', anim: 'fish', fish: [['raw_lobster', 40, 90]] },
  Harpoon: { tool: 'harpoon', anim: 'fish', fish: [['raw_tuna', 35, 80], ['raw_swordfish', 50, 100], ['raw_shark', 76, 110]] },
};
const SPOT_OPS = { coast: ['Net', 'Bait'], river: ['Net', 'Lure', 'River bait'], sea: ['Net', 'Cage', 'Harpoon', 'Big net'] };

// Beginner tasks: event counters -> rewards (lamps give XP in a skill of your choice)
const TASKS = [
  { id: 'chop1', text: 'Chop some logs from a tree', ev: 'chop', n: 1, coins: 100 },
  { id: 'fire1', text: 'Light a fire (tinderbox on logs)', ev: 'fire', n: 1, coins: 100 },
  { id: 'fish1', text: 'Catch a fish', ev: 'fish', n: 1, coins: 100 },
  { id: 'cook1', text: 'Cook something on a fire or range', ev: 'cook', n: 1, coins: 100 },
  { id: 'mine1', text: 'Mine some copper or tin ore', ev: 'mine', n: 1, coins: 100 },
  { id: 'smelt1', text: 'Smelt a bar at a furnace', ev: 'smelt', n: 1, coins: 150 },
  { id: 'smith1', text: 'Smith something on an anvil', ev: 'smith', n: 1, coins: 150 },
  { id: 'kill1', text: 'Defeat a monster in combat', ev: 'kill', n: 1, coins: 100 },
  { id: 'bury1', text: 'Bury some bones', ev: 'bury', n: 1, coins: 100 },
  { id: 'fletch1', text: 'Fletch something with a knife', ev: 'fletch', n: 1, coins: 150 },
  { id: 'spell1', text: 'Cast a spell from your spellbook', ev: 'spell', n: 1, coins: 150 },
  { id: 'agil1', text: 'Cross an agility obstacle', ev: 'agility', n: 1, coins: 150 },
  { id: 'thieve1', text: 'Pickpocket someone or steal from a stall', ev: 'thieve', n: 1, coins: 150 },
  { id: 'rc1', text: 'Craft some runes at an altar', ev: 'rc', n: 1, coins: 200, lamp: 1 },
  { id: 'trade1', text: 'Trade with another player', ev: 'trade', n: 1, coins: 200, lamp: 1 },
  { id: 'quest1', text: 'Complete a quest', ev: 'quest', n: 1, coins: 500, lamp: 1 },
  { id: 'chop50', text: 'Chop 50 logs', ev: 'chop', n: 50, coins: 500, lamp: 1 },
  { id: 'fish50', text: 'Catch 50 fish', ev: 'fish', n: 50, coins: 500, lamp: 1 },
  { id: 'mine50', text: 'Mine 50 ores', ev: 'mine', n: 50, coins: 500, lamp: 1 },
  { id: 'kill50', text: 'Defeat 50 monsters', ev: 'kill', n: 50, coins: 800, lamp: 1 },
  { id: 'fletch100', text: 'Fletch 100 items', ev: 'fletch', n: 100, coins: 800, lamp: 1 },
  { id: 'cook50', text: 'Cook 50 meals', ev: 'cook', n: 50, coins: 500, lamp: 1 },
];

const QUESTS = [
  { id: 'bridge', name: 'Bridge to the West', giver: 'Elder Brannoc in his house in Ardenvale' },
  { id: 'bones', name: 'The Restless Bones', giver: 'Father Aldous in the Ardenvale chapel' },
  { id: 'forge', name: 'Forging Ahead', giver: 'Hilda at the Ardenvale smithy' },
  { id: 'runes', name: 'Secrets of the Stones', giver: 'Orla in her rune shop, north of the bank' },
  { id: 'catch', name: "Sarrow's Catch", giver: 'Captain Rourke in Port Sarrow' },
  { id: 'cook', name: "The Cook's Request", giver: 'the Cook in Lumbridge Castle' },
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
  { npc: 'rat', min: 0, n: [10, 20] }, { npc: 'bandit', min: 15, n: [10, 20] }, { npc: 'scorpion', min: 18, n: [10, 20] }, { npc: 'skeleton', min: 25, n: [10, 20] }, { npc: 'lesser_demon', min: 60, n: [5, 12] }, { npc: 'hill_giant', min: 25, n: [10, 25] }, { npc: 'goblin_warrior', min: 8, n: [10, 25] }, { npc: 'gnome_guard', min: 20, n: [10, 20] }, { npc: 'zombie', min: 10, n: [10, 25] }, { npc: 'bear', min: 18, n: [10, 20] }, { npc: 'wolf', min: 22, n: [10, 25] }, { npc: 'hobgoblin', min: 25, n: [10, 25] }, { npc: 'black_knight', min: 30, n: [10, 25] }, { npc: 'moss_giant', min: 38, n: [10, 25] }, { npc: 'ice_warrior', min: 50, n: [10, 20] }, { npc: 'ice_giant', min: 48, n: [10, 20] }, { npc: 'greater_demon', min: 80, n: [8, 15] }, { npc: 'blue_dragon', min: 90, n: [5, 12] }, { npc: 'ghast', min: 30, n: [10, 20] }, { npc: 'giant_frog', min: 10, n: [10, 25] }, { npc: 'dark_wizard', min: 20, n: [10, 20] }, { npc: 'crawling_hand', min: 3, n: [10, 25], slayer: 5 }, { npc: 'banshee', min: 15, n: [10, 25], slayer: 15 }, { npc: 'jogre', min: 45, n: [10, 20] }, { npc: 'jungle_spider', min: 40, n: [10, 20] }, { npc: 'green_dragon', min: 70, n: [5, 10] }, { npc: 'guard', min: 25, n: [8, 15] }, { npc: 'ogre', min: 40, n: [3, 6] },
];
