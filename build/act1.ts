// ACT I — "Lake's Camp". See docs/storybook.md.
import { Scenario, t, and, or, CONTINUE, PASS, FAIL } from './lib.js';
import { addMythos, danforthHint } from './systems.js';

const SPECIMEN_TOKENS = ['TokenSpecimenCavern', 'TokenSpecimenHangar', 'TokenSpecimenTent'];
const ET_SPAWNS = ['SpawnETCavern', 'SpawnETHangar', 'SpawnETTent'];

/** A "photograph it" button, available once per subject */
function photo(s: Scenario, key: string, back: string, text: string) {
  s.event(`EventPhoto${key}`, {
    text: `${text}\n\n<i>Photographing takes an action. (Evidence +1)</i>`,
    ops: `Photos,+,1 photo${key},=,1`, audio: 'AudioClick1',
    buttons: [{ to: back }],
  });
  return { label: 'Photograph it', to: `EventPhoto${key}`, cond: t(`photo${key}`, '==', 0) };
}

export function act1(s: Scenario) {
  // ── Map: the camp in the middle, the rest revealed as the party explores
  s.tile('TileCamp', 'TileSideCampsite');
  s.tile('TileTent', 'TileSideRuinedHut', { tile: 'TileCamp', dir: 'west' });
  s.tile('TileHangar', 'TileSideWarehouse', { tile: 'TileCamp', dir: 'east' });
  s.tile('TileKennel', 'TileSideClearing1', { tile: 'TileCamp', dir: 'south' });
  s.tile('TileMounds', 'TileSideClearing2', { tile: 'TileKennel', dir: 'south' });
  s.tile('TileBore', 'TileSideTunnel', { tile: 'TileMounds', dir: 'east' });
  s.tile('TileCavern', 'TileSideBurialChamber', { tile: 'TileBore', dir: 'east' });

  // ── Items: the expedition's kit, and what the camp gives up
  s.item('QItemRifle', { itemname: 'ItemCommonCarbineRifle', starting: 'True' });
  s.item('QItemLantern', { itemname: 'ItemCommonKeroseneLantern', starting: 'True' });
  s.item('QItemSurvivalPack', { itemname: 'ItemCommonSurvivalPack', starting: 'True' });
  s.item('QItemWhiskey', { itemname: 'ItemCommonWhiskey' });
  s.item('QItemDynamite', { itemname: 'ItemCommonDynamite' });

  // ── Setup
  const campTokens = ['TokenStove', 'TokenWreckage', 'TokenWireless', 'TokenExpTent', 'TokenExpHangar', 'TokenExpKennel'];
  s.token('TokenInvestigators', 'TokenInvestigators', s.at('TileCamp', 0.5, 0.5));
  s.event('EventAct1Setup', {
    add: ['TileCamp', 'TokenInvestigators', ...campTokens], audio: 'AudioSetup',
    text: `The plane skids to a halt on hard-packed snow beside what is left of Lake's camp. The engine ticks as it cools. Nothing else moves.

Place {c:TileCamp}. Place all investigators on the start space.

<i>The wind has torn the tents to rags and the dogs' snow-walled corral is breached. Of Lake's eleven men there is no sign — not yet.</i>`,
    buttons: [{ label: 'Step out into the wind', to: 'EventAct1Begin' }],
  });
  s.jump('EventAct1Begin', 'EventHudOn', { remove: 'TokenInvestigators' });

  // ── Camp: the stove (a free but slow heat source)
  s.token('TokenStove', 'TokenInteract', s.at('TileCamp', 0.3, 0.25), {
    customImage: 'img/TokenStove.png',
    text: `Lake's big camp stove, knocked over but sound. Getting it lit takes an action.\n\nExposure <b>{var:Cold}</b> / 10`,
    buttons: [
      { label: 'Warm up (Exposure −1)', to: 'EventStoveWarm' },
      { label: 'Feed it petrol (−1 petrol, Exposure −3)', to: 'EventPrimusBurn', cond: t('Fuel', '>=', 1) },
      { label: 'Leave it', to: 'EventHud' },
    ],
  });
  s.event('EventStoveWarm', {
    text: 'Stiff fingers fumble with frozen matches until the stove catches. The warmth is thin, but it is warmth.',
    ops: 'Cold,-,1', buttons: [{ to: 'EventColdSettle' }],
  });

  // ── Camp: sift the wreckage (event loop over a random pool, each outcome once)
  s.token('TokenWreckage', 'TokenSearch', s.at('TileCamp', 0.5, 0.25), {
    text: `Wind-scattered wreckage: canvas, crates, instruments, drifts that hide who knows what. Sifting through it takes an action; there may be more to find each time.`,
    buttons: [{ label: 'Dig through the wreckage', to: 'EventSiftDraw' }, { label: 'Leave it', to: 'EventHud' }],
  });
  const sift: Array<[string, string, Partial<Parameters<Scenario['event']>[1]>]> = [
    ['Petrol', 'Under a collapsed tent, a two-gallon can of petrol: dented, frozen to the ground, and full. <b>Petrol +2.</b>', { ops: 'Fuel,+,2' }],
    ['Furs', 'A bale of spare fur suits, stiff with frost but whole. The party pulls them on over their own. <b>Exposure −2.</b>', { ops: 'Cold,-,2' }],
    ['Dynamite', 'Pabodie\'s blasting kit, still sealed in oilcloth. Somebody has opened one box, taken out a stick, and put it back very precisely. <b>Gain Dynamite.</b>', { add: 'QItemDynamite', ops: 'hasDynamite,=,1' }],
    ['Blots', 'Sheets of Lake\'s notepaper, spattered with ink — but not at random. The blots sit in careful clusters, <b>dots in groups</b>, like the marks on the soapstones in Lake\'s message. Someone was trying to write. <b>Understanding +1.</b>', { ops: 'Understanding,+,1 dotClue1,=,1' }],
    ['Dog', 'Half-buried in a drift: one of the huskies. Its body has been opened with a surgeon\'s care, and closed again.\n\nEach investigator in this space tests {will}. On a failure, suffer 1 horror.', {}],
    ['Engine', 'A plane\'s heater lies in pieces on a tarpaulin — not smashed, but <i>taken apart</i>, every screw laid out in rows of five. <b>Understanding +1.</b>', { ops: 'Understanding,+,1' }],
    ['Books', 'Lake\'s textbooks, the illustrated ones, are missing. The two left behind lie open at plates of the human nervous system.\n\nTest {lore}. On a success, <b>Understanding +1</b>. On a failure, suffer 1 horror.', {}],
    ['Plates', 'A tin of exposed photographic plates, Lake\'s own, undeveloped. Whatever he photographed in the cavern is on them. <b>Evidence +1.</b>', { ops: 'Photos,+,1' }],
  ];
  const siftEvents = sift.map(([k]) => `EventSift${k}`);
  for (const [k, text, extra] of sift) {
    const seen = `sift${k}`;
    s.event(`EventSift${k}`, {
      ...extra, text, tests: t(seen, '==', 0),
      ops: [`${seen},=,1 siftCount,+,1`, (extra.ops as string) ?? ''].filter(Boolean).join(' '),
      audio: 'AudioGenericItem1',
      buttons: k === 'Books'
        ? [{ label: PASS, to: 'EventSiftBooksPass', color: 'green' }, { label: FAIL, to: 'EventSiftCheck', color: 'red' }]
        : [{ to: 'EventSiftCheck' }],
    });
  }
  s.jump('EventSiftBooksPass', 'EventSiftCheck', { ops: 'Understanding,+,1' });
  s.jump('EventSiftDraw', siftEvents, { random: true });
  s.jump('EventSiftCheck', ['EventSiftExhausted', 'EventColdSettle']);
  s.event('EventSiftExhausted', {
    tests: t('siftCount', '>=', sift.length), remove: 'TokenWreckage',
    text: 'There is nothing left in the wreckage but snow.', buttons: [{ to: 'EventColdSettle' }],
  });

  // ── Camp: Lake's wireless (CODE puzzle: band, dial, trim)
  s.token('TokenWireless', 'TokenInteract', s.at('TileCamp', 0.7, 0.25), {
    customImage: 'img/TokenWireless.png', ops: 'wirelessSeen,=,1',
    text: `Lake's short-wave set, blown off its crate but in one piece. Three dials — band, dial and trim, each marked one to six. Tuned right, it might still reach the <i>Arkham</i> at McMurdo Sound.\n\nTest {observation}: you may make as many changes as your result. McTighe's slips may help.`,
    buttons: [{ label: 'Work the dials', to: 'PuzzleWireless' }, { label: 'Leave it', to: 'EventHud' }],
  });
  s.puzzle('PuzzleWireless', { class: 'code', skill: '{observation}', puzzlelevel: '3', puzzlealtlevel: '6', puzzlesolution: '4 2 5' },
    'Call the Arkham', 'EventWirelessSolved');
  s.event('EventWirelessSolved', {
    remove: 'TokenWireless', ops: 'wirelessSolved,=,1 Fuel,+,2 Understanding,+,1', audio: 'AudioElectric3',
    text: `Static, then a voice: McTighe, faint as a ghost.

"—picked up Lake at two a.m., just a carrier and noise. Then something went out on his band that wasn't Lake. <i>Whistling</i>, like a flute, up and down the scale. It went on a long while."

He tells you where Lake cached reserve petrol, under the drill derrick. <b>Petrol +2. Understanding +1.</b>`,
    buttons: [{ to: 'EventHud' }],
  });

  // ── Explore: dissection tent
  s.token('TokenExpTent', 'TokenExplore', s.door('TileCamp', 'TileTent'), {
    text: 'West of the stove, a larger tent slumps under its own snow-load: Lake\'s dissecting tent.',
    buttons: [{ label: 'Duck inside', to: 'EventTentReveal' }],
  });
  s.event('EventTentReveal', {
    add: ['TileTent', 'TokenLakeTable', 'TokenSearchTent'], remove: 'TokenExpTent', audio: 'AudioRevealTile1',
    text: 'Place {c:TileTent}.\n\nThe smell is the first thing: chemical, and under it something like the sea.',
    buttons: [{ to: ['EventSpecimenAppearsTent', 'EventHud'] }],
  });
  s.token('TokenLakeTable', 'TokenInteract', s.at('TileTent', 0.45, 0.4), {
    text: `Lake's dissecting table. One specimen was laid out here, and Lake's notebook lies beside it, open and weighted with a stone.`,
    buttons: [{ label: 'Read the notebook', to: 'EventLakeNotebook' }, { label: 'Leave it', to: 'EventHud' }],
  });
  s.event('EventLakeNotebook', {
    remove: 'TokenLakeTable', add: 'QItemLakesLog', audio: 'AudioPapers2',
    text: `The last pages are Lake's dissection notes: tissue impossibly tough, a brain of five lobes, <i>"organs suggesting a sense we have no name for."</i>

Then the entries change. Different pencil strokes cut the pages — careful incisions, the specimen's own anatomy drawn beside a <b>man's</b>.

<b>Gain Lake's Log.</b> Test {lore}.`,
    buttons: [{ label: PASS, to: 'EventLakeNotebookPass', color: 'green' }, { label: FAIL, to: 'EventLakeNotebookFail', color: 'red' }],
  });
  s.event('EventLakeNotebookPass', {
    ops: 'Understanding,+,1',
    text: 'You understand what you are looking at, and wish you did not: someone compared the two anatomies with the same patient curiosity Lake brought to theirs. <b>Understanding +1.</b>',
    buttons: [{ to: 'EventHud' }],
  });
  s.event('EventLakeNotebookFail', { text: 'The drawings swim before your eyes. Suffer 1 horror.', buttons: [{ to: 'EventHud' }] });
  s.item('QItemLakesLog', { itemname: 'ItemCommonExpeditionLog', inspect: 'EventReadLakesLog' });
  s.ui('UILakeSketch', { image: 'img/LakeSketch.jpg', xposition: '0', yposition: '0.13', size: '0.66' });
  s.event('EventReadLakesLog', {
    add: 'UILakeSketch',
    text: 'Lake\'s field sketch: a barrel-shaped body, five ridges, folded fan-wings, a starfish head with five red-irised eyes on stalks. <i>"Uncanny resemblance to creatures of primal myth."</i>',
    buttons: [{ to: 'EventHideLakeSketch' }],
  });
  s.stop('EventHideLakeSketch', { remove: 'UILakeSketch' });
  s.token('TokenSearchTent', 'TokenSearch', s.at('TileTent', 0.7, 0.75), {
    text: 'Lake\'s surgical chest, half under a fallen tent pole.',
    buttons: [{ label: 'Search it', to: 'EventSearchTent' }],
  });
  s.item('QItemTentFind', { traits: 'common' });
  s.event('EventSearchTent', { remove: 'TokenSearchTent', add: 'QItemTentFind', text: 'Among the instruments, something useful. <b>Gain the item shown.</b>', audio: 'AudioGainItem', buttons: [{ to: 'EventHud' }] });

  // ── Explore: the snowbound hangar (SLIDE puzzle, or dynamite)
  s.token('TokenExpHangar', 'TokenExplore', s.door('TileCamp', 'TileHangar'), {
    text: 'East stands the snow-block shelter Atwood designed for the planes. Its roof has come down.',
    buttons: [{ label: 'Go to the hangar', to: 'EventHangarReveal' }],
  });
  s.event('EventHangarReveal', {
    add: ['TileHangar', 'TokenDrift', 'TokenSearchHangar'], remove: 'TokenExpHangar', audio: 'AudioRevealTile2',
    ops: 'hangarSeen,=,1',
    text: 'Place {c:TileHangar}.\n\nLake\'s second plane is buried to the wings in drift, crates and a sledge wedged against the fuselage.',
    buttons: [{ to: ['EventSpecimenAppearsHangar', 'EventHud'] }],
  });
  s.token('TokenDrift', 'TokenInteract', s.at('TileHangar', 0.5, 0.45), {
    customImage: 'img/TokenPlane.png', size: 'huge',
    text: `The plane is your way over the range — and home. Crates, a sledge and packed drift pin it in.\n\nClear it by hand: test {strength} and make as many moves as your result. Or blast it.`,
    buttons: [
      { label: 'Dig it clear', to: ['PuzzleDriftLarge', 'PuzzleDriftSmall'] },
      { label: 'Blast it with dynamite', to: 'EventDriftBlast', cond: t('hasDynamite', '==', 1) },
      { label: 'Leave it for now', to: 'EventHud' },
    ],
  });
  // More investigators means more moves each round, so the drift is deeper
  s.puzzle('PuzzleDriftSmall', { class: 'slide', skill: '{strength}', puzzlelevel: '5' }, 'The plane is free', 'EventDriftCleared');
  s.puzzle('PuzzleDriftLarge', { class: 'slide', skill: '{strength}', puzzlelevel: '7', vartests: t('#heroes', '>=', 4) }, 'The plane is free', 'EventDriftCleared');
  s.event('EventDriftBlast', {
    remove: 'QItemDynamite', ops: 'hasDynamite,=,0 Piping,+,3', audio: 'AudioHeavy1',
    text: `The charge goes off with a flat crack that rolls away across the plateau and comes back from the mountains, again and again, fainter each time.

The drift is gone. Everything within fifty miles heard it.`,
    buttons: [{ to: 'EventDriftCleared' }],
  });
  s.event('EventDriftCleared', {
    remove: 'TokenDrift', add: 'TokenPlane', ops: 'planeReady,=,1', audio: 'AudioComplete',
    text: 'The plane rocks free. The mechanic checks the struts, spits, and pronounces her fit to fly. <b>The plane is ready.</b>',
    buttons: [{ to: 'EventHud' }],
  });
  s.token('TokenSearchHangar', 'TokenSearch', s.at('TileHangar', 0.2, 0.8), {
    text: 'A locker of emergency stores.', buttons: [{ label: 'Search it', to: 'EventSearchHangar' }],
  });
  s.item('QItemFlareGun', { itemname: 'ItemCommonFlareGun' });
  s.event('EventSearchHangar', { remove: 'TokenSearchHangar', add: 'QItemFlareGun', text: 'A Very pistol and a box of flares. <b>Gain the Flare Gun.</b>', audio: 'AudioGainItem', buttons: [{ to: 'EventHud' }] });

  // ── Explore: the kennel
  s.token('TokenExpKennel', 'TokenExplore', s.door('TileCamp', 'TileKennel'), {
    text: 'South, the dogs\' corral: a wall of snow blocks, broken outward.',
    buttons: [{ label: 'Go to the corral', to: 'EventKennelReveal' }],
  });
  s.event('EventKennelReveal', {
    add: ['TileKennel', 'TokenKennel', 'TokenExpMounds'], remove: 'TokenExpKennel', audio: 'AudioRevealTile1',
    text: 'Place {c:TileKennel}.', buttons: [{ to: 'EventHud' }],
  });
  s.token('TokenKennel', 'TokenInteract', s.at('TileKennel', 0.35, 0.5), {
    text: 'The dogs fought something here. Most of them lost.',
    buttons: [{ label: 'Look closer', to: 'EventKennel' }, { label: 'Look away', to: 'EventHud' }],
  });
  s.event('EventKennel', {
    remove: 'TokenKennel', audio: 'AudioDog',
    text: 'The huskies lie where they fell, some torn, some — like the one in the wreckage — opened with care. Each investigator in this space tests {will}. On a failure, suffer 1 horror.',
    buttons: [{ to: ['EventKennelDog', 'EventKennelNoDog'] }],
  });
  s.item('QItemDuke', { itemname: 'ItemUniqueDukeTheDog' });
  s.event('EventKennelDog', {
    tests: t('dogHere', '==', 1), add: 'QItemDuke', ops: 'dogFound,=,1',
    text: 'A whimper, from under an overturned sledge. One husky survived, curled in a hollow of snow. He comes to your hand at once and will not leave it. <b>Gain the dog.</b>\n\n<i>He growls, low, whenever the wind comes from the west.</i>',
    buttons: [{ to: 'EventHud' }],
  });
  s.event('EventKennelNoDog', {
    text: 'You count them twice. <b>One dog is missing</b> — and so, the camp tells you, is one man: <b>Gedney</b>.',
    buttons: [{ to: 'EventHud' }],
  });

  // ── Explore: the star mounds and the tracks west
  s.token('TokenExpMounds', 'TokenExplore', s.door('TileKennel', 'TileMounds'), {
    text: 'Beyond the corral the snow rises in regular shapes.', buttons: [{ label: 'Walk out to them', to: 'EventMoundsReveal' }],
  });
  s.event('EventMoundsReveal', {
    add: ['TileMounds', 'TokenMounds', 'TokenTracks', 'TokenExpBore'], remove: 'TokenExpMounds', audio: 'AudioRevealTile2',
    text: 'Place {c:TileMounds}.\n\nSix mounds of packed snow, nine feet long. Each is patterned with dots in groups, arranged as a five-pointed star.',
    buttons: [{ to: 'EventHud' }],
  });
  s.token('TokenMounds', 'TokenInteract', s.at('TileMounds', 0.4, 0.4), {
    customImage: 'img/TokenMound.png',
    text: 'The six star-patterned mounds. Graves, if you let yourself think the word.',
    buttons: [{ label: 'Dig one open', to: 'EventMoundsDig', cond: t('moundsDug', '==', 0) }, photo(s, 'Mounds', 'EventHud', 'Six graves in the snow, patterned with dots. The shutter clicks loud as a shot.'), { label: 'Leave them', to: 'EventHud' }],
  });
  s.test('EventMoundsDig', 'The snow is packed hard as brick. Test {strength}.', 'EventMoundsDug', 'EventMoundsHard');
  s.event('EventMoundsHard', { text: 'Your spade rings off it. You can try again with another action.', buttons: [{ to: 'EventHud' }] });
  s.event('EventMoundsDug', {
    ops: 'moundsDug,=,1 Understanding,+,1 Nerve,-,1', audio: 'AudioNegativeStory',
    text: `One of the six damaged specimens lies inside, laid straight, its broken parts gathered beside it.

It has not been thrown in a hole. It has been <b>buried</b> — with the care one gives one's own dead.

Danforth says nothing for a long time. <b>Understanding +1.</b> (Danforth's Nerve −1.)`,
    buttons: [{ to: 'EventHud' }],
  });
  s.token('TokenTracks', 'TokenInteract', s.at('TileMounds', 0.8, 0.75), {
    text: 'The snow west of the mounds is scoured, but here and there something shows through the drift.',
    buttons: [{ label: 'Read the ground', to: 'EventTracks' }, { label: 'Leave it', to: 'EventHud' }],
  });
  s.test('EventTracks', 'Drifting snow has half filled whatever was here. Test {observation}.', 'EventTracksFound', 'EventTracksLost');
  s.event('EventTracksLost', { text: 'Wind-ripples, nothing more. Look again with another action.', buttons: [{ to: 'EventHud' }] });
  s.event('EventTracksFound', {
    remove: 'TokenTracks', ops: 'tracksFound,=,1', audio: 'AudioImportant1',
    text: `Sledge runners, three sets of them, heading west-northwest toward the black range. Beside them, prints that no boot made: <b>broad, triangular, five-toed paddles</b>.

And one set of dog prints, and the scuffs of a man's boots being dragged.

<b>You know which way they went.</b>`,
    buttons: [{ to: 'EventHud' }],
  });

  // ── Explore: Pabodie's bore and the fossil cavern
  s.token('TokenExpBore', 'TokenExplore', s.door('TileMounds', 'TileBore'), {
    text: 'East, the derrick of Pabodie\'s drill stands over Lake\'s blasted shaft.', buttons: [{ label: 'Climb down', to: 'EventBoreReveal' }],
  });
  s.event('EventBoreReveal', {
    add: ['TileBore', 'TokenBore', 'TokenExpCavern'], remove: 'TokenExpBore', audio: 'AudioStoneOpen1',
    text: 'Place {c:TileBore}.\n\nA ladder of lashed rods goes down the shaft into a limestone passage. Your lantern finds prints in the walls.',
    buttons: [{ to: 'EventHud' }],
  });
  s.token('TokenBore', 'TokenInteract', s.at('TileBore', 0.3, 0.5), {
    customImage: 'img/TokenDerrick.png',
    text: 'The triangular prints Lake radioed about, pressed into rock a thousand million years old. The same shape as the tracks in the snow.',
    buttons: [photo(s, 'Prints', 'EventHud', 'The flashpowder goes off; for an instant the prints stand out sharp as yesterday\'s.'), { label: 'Leave them', to: 'EventHud' }],
  });
  s.token('TokenExpCavern', 'TokenExplore', s.door('TileBore', 'TileCavern'), {
    text: 'The passage opens into the cavern where Lake found them.', buttons: [{ label: 'Go in', to: 'EventCavernReveal' }],
  });
  s.event('EventCavernReveal', {
    add: ['TileCavern', 'TokenSoapstones'], remove: 'TokenExpCavern', audio: 'AudioRevealTile1',
    text: 'Place {c:TileCavern}.\n\nStalactites hacked away; niches in the limestone where fourteen bodies lay for fifty million years. It is warmer down here.',
    buttons: [{ to: ['EventSpecimenAppearsCavern', 'EventHud'] }],
  });
  s.token('TokenSoapstones', 'TokenInteract', s.at('TileCavern', 0.3, 0.5), {
    customImage: 'img/TokenSoapstone.png',
    text: 'Green soapstones, star-shaped, set in the niches like grave goods. Each is covered in groups of tiny dots.',
    buttons: [{ label: 'Study the dots', to: 'EventSoapstones' }, { label: 'Leave them', to: 'EventHud' }],
  });
  s.test('EventSoapstones', 'Test {lore}.', 'EventSoapstonesPass', 'EventSoapstonesFail');
  s.event('EventSoapstonesPass', {
    remove: 'TokenSoapstones', ops: 'Understanding,+,1 dotClue2,=,1', audio: 'AudioImportant2',
    text: 'The groups repeat. Ones, twos, up to fives, never more — <b>they count in fives</b>. It is a number system, and someone carved it as carefully as a signpost. <b>Understanding +1.</b>',
    buttons: [{ to: 'EventHud' }],
  });
  s.event('EventSoapstonesFail', { text: 'The patterns crawl when you stare at them. Suffer 1 horror.', buttons: [{ to: 'EventHud' }] });

  // ── The ninth specimen: lies in one of three places (specLoc), thaws a round after it is found
  const specimenPlaces: Array<[string, string, number, [number, number]]> = [
    ['Cavern', 'TileCavern', 1, s.at('TileCavern', 0.72, 0.5)],
    ['Hangar', 'TileHangar', 2, s.at('TileHangar', 0.8, 0.25)],
    ['Tent', 'TileTent', 3, s.at('TileTent', 0.25, 0.75)],
  ];
  for (const [place, , n, pos] of specimenPlaces) {
    s.token(`TokenSpecimen${place}`, 'TokenInteract', pos, {
      customImage: 'img/TokenSpecimen.png',
      text: `Under a frozen tarpaulin: a ninth specimen. It is not on Lake's list. Unlike the six in the snow, it is whole — and the frost on its ridges is beading into water.\n\nExposure makes no difference to it. Warmth does.`,
      buttons: [
        { label: 'Study it', to: 'EventSpecimenStudy', cond: t('specStudied', '==', 0) },
        photo(s, `Specimen${place}`, 'EventHud', 'Five ridges, folded wings, the starfish head tucked down like a sleeping bird\'s.'),
        { label: 'Burn it (−1 petrol)', to: 'EventSpecimenBurn', cond: t('Fuel', '>=', 1) },
        { label: 'Leave it', to: 'EventHud' },
      ],
    });
    s.jump(`EventSpecimenAppears${place}`, 'EventHud', {
      tests: t('specLoc', '==', n), add: `TokenSpecimen${place}`, ops: 'specPlaced,=,1 specRound,=,#round',
    });
  }
  s.test('EventSpecimenStudy', 'Test {lore}.', 'EventSpecimenStudyPass', 'EventSpecimenStudyFail', { ops: 'specStudied,=,1' });
  s.event('EventSpecimenStudyPass', {
    ops: 'Understanding,+,1',
    text: 'The tissue gives under your thumb like something asleep, not dead. Lake\'s <i>Elder Ones</i> were not fossils. They were <b>hibernating</b>. <b>Understanding +1.</b>',
    buttons: [{ to: 'EventHud' }],
  });
  s.event('EventSpecimenStudyFail', { text: 'One of the eye-stalks twitches. You are almost sure it twitched. Suffer 1 horror.', buttons: [{ to: 'EventHud' }] });
  s.event('EventSpecimenBurn', {
    remove: SPECIMEN_TOKENS, ops: 'Fuel,-,1 Mercy,=,0 specDone,=,1 Nerve,-,1', audio: 'AudioSpell3',
    text: `Petrol, a match. The flame takes slowly on the leathery hide, then all at once.

It does not scream. It <b>pipes</b>: a thin, fluting whistle that climbs the scale, and climbs, and stops.

Danforth is sick in the snow. (Danforth's Nerve −1.)`,
    buttons: [{ to: 'EventHud' }],
  });

  // It thaws at the end of the round after it was found (never before round 3)
  s.jump('EventThaw', ['EventThawCavern', 'EventThawHangar', 'EventThawTent'], {
    trigger: 'EndRound',
    tests: and(t('specPlaced', '==', 1), t('specDone', '==', 0), t('#round', '>', 'specRound'), t('#round', '>=', 3)),
    ops: 'specDone,=,1',
  });
  for (const [place, tile, n, pos] of specimenPlaces) {
    s.event(`EventThaw${place}`, {
      tests: t('specLoc', '==', n), remove: SPECIMEN_TOKENS, audio: 'AudioSpawnFirstMonster',
      text: `Water sheets from the ridges of the ninth specimen. The folded wings shudder, and open.

The starfish head unfurls. Five red-irised eyes swivel on their stalks and find you — one after another, as if counting.

<b>The Elder Thing is awake.</b> It is in {c:${tile}}.`,
      buttons: [{ label: 'Stand your ground', to: `SpawnET${place}` }],
    });
    s.spawn(`SpawnET${place}`, 'CustomMonsterElderThing', { at: pos, buttons: [{ to: 'EventHud' }] });
  }

  // ── The Elder Thing: curious, not cruel, until it is hurt
  s.monster('CustomMonsterElderThing', {
    base: 'MonsterMiGo', health: '4', healthperhero: '1', horror: '3', awareness: '4', traits: 'beast',
    image: 'img/ElderThing.jpg', activation: 'EventETActivation',
  }, 'Elder Thing', 'Eight feet of tough, dark-grey barrel-body, five-ridged, with membranous wings and a starfish head of five red eyes. It was a scientist once, a thousand million years ago. Perhaps it still is.');
  s.jump('EventETActivation', ['EventETCurious', 'EventETCurious', 'EventETWarmth', 'EventETWounded', 'EventETWest'], { random: true });
  s.event('EventETCurious', {
    text: 'The Elder Thing glides 1 space toward the nearest investigator, cilia rippling, tentacles unfolding in slow fans of five.',
    buttons: [{ label: 'It reached an investigator', to: 'EventETExamine' }, { label: 'No one in reach' }],
  });
  s.event('EventETExamine', {
    text: 'Twenty-five tendrils explore your coat, your face, the things in your pockets — curious, not cruel. Test {agility}. On a failure, it takes one of your items: discard a Common item of your choice. If you have none, suffer 1 horror.',
    buttons: [{ label: CONTINUE }],
  });
  s.event('EventETWarmth', {
    text: 'The Elder Thing moves 2 spaces toward {c:TileCamp}, where the stove stands — toward warmth.',
    buttons: [{ label: 'It reached the camp', to: 'EventETStove' }, { label: 'It did not' }],
  });
  s.event('EventETStove', {
    ops: 'Cold,+,2', text: 'It folds itself over the stove as if it were a hearth of its own, smothering the flame. <b>Exposure +2.</b>',
    buttons: [{ to: 'EventColdSettle' }],
  });
  s.event('EventETWounded', {
    text: 'The Elder Thing\'s wings snap wide.',
    buttons: [{ label: 'It has been wounded', to: 'EventETLash' }, { label: 'It is unharmed', to: 'EventETCurious' }],
  });
  s.event('EventETLash', {
    text: 'Cornered and hurt, it lashes out with five tough arms. It moves 1 space toward the nearest investigator. That investigator tests {strength}. On a failure, suffer 2 damage.',
    buttons: [{ label: CONTINUE }],
  });
  s.event('EventETWest', {
    tests: t('etSpared', '==', 0),
    text: 'The Elder Thing turns toward the west — toward the black range — wings half spread, as if listening for something across all that distance.\n\nThen its eye-stalks swivel back to you. It waits.',
    buttons: [{ label: 'Let it go', to: 'EventETSpared' }, { label: 'Stop it', to: 'EventETLash' }],
  });
  s.event('EventETSpared', {
    remove: ET_SPAWNS, ops: 'etSpared,=,1 Understanding,+,1', audio: 'AudioPositive1',
    text: `You step aside. It glides past you, close enough to touch, and out into the snow; then the wings open fully and it is gone into the wind, flying west.

Danforth lets out a breath he has been holding for a minute. <i>"It could have killed us. It didn't want to."</i> <b>Understanding +1.</b> Remove the Elder Thing.`,
    buttons: [{ to: 'EventHud' }],
  });
  for (const [place] of specimenPlaces) {
    s.jump(`EventETDefeated${place}`, 'EventETDies', { trigger: `DefeatedSpawnET${place}` });
  }
  s.event('EventETDies', {
    ops: 'Mercy,=,0 Understanding,+,1', audio: 'AudioNegativeStory',
    text: `It dies slowly, folding in on itself, and at the last it pipes — a thin fluting whistle up and down the scale — like a word in a language made for five throats.

Up close, its body is a marvel. Danforth sketches it with a shaking hand. <b>Understanding +1.</b>`,
    buttons: [{ to: 'EventHud' }],
  });

  // ── Leaving: the plane, once the tracks are found
  s.token('TokenPlane', 'TokenInteract', s.at('TileHangar', 0.5, 0.45), {
    customImage: 'img/TokenPlane.png', size: 'huge',
    text: 'The plane waits, engine warm. West lies the range.',
    buttons: [{ label: 'Board the plane', to: ['EventBoardReady', 'EventBoardNoTracks'] }, { label: 'Not yet', to: 'EventHud' }],
  });
  s.event('EventBoardNoTracks', {
    text: 'Fly where? Someone took three sledges, Gedney and a dog out of this camp. Until you know which way they went, the range is five hundred miles of wrong directions.',
    buttons: [{ to: 'EventHud' }],
  });
  s.event('EventBoardReady', {
    tests: t('tracksFound', '==', 1),
    text: 'The mechanic swings the propeller. All investigators must be in {c:TileHangar} to board.\n\nWhatever you have not found here, you will not find now.',
    buttons: [{ label: 'Take off', to: 'EventAct1End' }, { label: 'Wait', to: 'EventHud' }],
  });

  // ── Danforth's thoughts in act I, most urgent first
  danforthHint(s, 'EventDanforthA1Specimen', and(t('Act', '==', 1), t('specPlaced', '==', 1), t('specDone', '==', 0)),
    '"The ninth one. Lake said the tissue was not dead — only waiting. When it warms, it wakes. Burn it, or be ready for it. I don\'t know which frightens me more."');
  danforthHint(s, 'EventDanforthA1Tracks', and(t('Act', '==', 1), t('tracksFound', '==', 0)),
    '"Whoever took the sledges went somewhere. The wind comes off the range — it will have scoured the east faces. Look on the ground past those graves."');
  danforthHint(s, 'EventDanforthA1Drift', and(t('Act', '==', 1), t('hangarSeen', '==', 1), t('planeReady', '==', 0)),
    '"The sledge is wedged behind the small crates. Shift those first and it slides free. Or Pabodie\'s dynamite — though God knows what else would hear it."');
  danforthHint(s, 'EventDanforthA1Wireless', and(t('Act', '==', 1), t('wirelessSeen', '==', 1), t('wirelessSolved', '==', 0)),
    '"McTighe\'s slips: band four, dial two. And Lake always ran his trim high. Five, I think."');

  // ── The gale deck (act I mythos): each drawn once, the lull may repeat
  addMythos(s, 1, 'EventGaleGust', 'The wind screams down off the range and through every seam of your furs. <b>Exposure +1.</b>', { ops: 'Cold,+,1' });
  addMythos(s, 1, 'EventGaleBlind', 'A wall of blown snow rolls across the camp; for a while there is no up or down. Each investigator tests {observation}. On a failure, become Dazed.');
  addMythos(s, 1, 'EventGaleHowl', 'Somewhere out on the plateau a dog is howling. Every dog in this camp is accounted for.\n\nEach investigator tests {will}. On a failure, suffer 1 horror.', { audio: 'AudioDog' });
  addMythos(s, 1, 'EventGaleStatic', 'The wireless — or what is left of it — crackles by itself: a carrier wave, and on it something like a flute, running up and down a scale no human throat could hold.', { audio: 'AudioElectric4', ops: 'Piping,+,1' });
  addMythos(s, 1, 'EventGaleMirage', 'Above the western peaks the air shimmers into towers: cubes, ramparts, cones, a city hung upside down in the sky. It is a mirage. It must be. <b>Understanding +1.</b>\n\nEach investigator tests {will}. On a failure, suffer 1 horror.', { ops: 'Understanding,+,1' });
  addMythos(s, 1, 'EventGaleCanvas', 'A gust tears a sheet of frozen canvas loose and sends it tumbling like a blade. The investigator nearest {c:TileCamp} suffers 1 damage.');
  addMythos(s, 1, 'EventGaleFrost', 'The petrol has begun to jell in the cans, and one splits along its seam. <b>Petrol −1.</b>', { ops: 'Fuel,-,1', tests: t('Fuel', '>=', 1) });
  addMythos(s, 1, 'EventGaleDrift', 'The wind is filling in everything that was written on the snow. Whatever tracks lead away from here will not last much longer. <b>Exposure +1.</b>', { ops: 'Cold,+,1', tests: t('tracksFound', '==', 0) });
  addMythos(s, 1, 'EventGalePiping', 'For a moment, between gusts, you hear it — a thin musical piping, very far off, from the direction of the mountains. Then only wind.\n\nEach investigator tests {will}. On a failure, suffer 1 horror.', { ops: 'Piping,+,1' });
  addMythos(s, 1, 'EventGaleLull', 'The gale drops. For a few breaths there is absolute silence, and the low sun on the black peaks is too bright to look at.', { repeatable: true });
}
