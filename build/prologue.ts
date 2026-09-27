// Prologue: "Silence from the Westward Camp". Intro cutscene, Lake's radio messages, party-size clues.
import { Scenario, t } from './lib.js';
import { START_VARS } from './systems.js';

const INTRO_UI = ['UIIntroBG', 'UIIntroPicture', 'UIIntroText', 'UIIntroButtonFrame', 'UIIntroButton'];

export function prologue(s: Scenario) {
  // Full-screen opening: picture left, story right, Begin button bottom right (added last so it stays clickable)
  s.ui('UIIntroBG', { image: 'ImageCutsceneBG', xposition: '-0.06', yposition: '0', size: '1' });
  s.ui('UIIntroPicture', { image: 'img/Intro.jpg', xposition: '-0.45', yposition: '0', size: '0.9' });
  s.ui('UIIntroText', {
    xposition: '0.35', yposition: '0.05', size: '0.95', textsize: '0.62', textaspect: '0.95',
    textAlignment: 'TOP', richText: 'True', textcolor: 'white',
  }, `<align="left"><b>AT THE MOUNTAINS OF MADNESS</b>
<size=80%><i>McMurdo Sound, Antarctica. January 1931.</i></size>

The Miskatonic University Expedition came south for rock: deep cores from Professor Pabodie's new drill, and nothing stranger than fossils.

Then Lake, the biologist, flew northwest against orders. For a day and a night the short-wave hummed with his messages. Mountains higher than the Himalayas. Prints in rock a thousand million years old. And in a cavern under the ice, fourteen things that should never have existed.

Then a gale came down off the range, and Lake's camp went silent.

<b>You are the relief party.</b> Your plane leaves for Lake's camp at dawn.</align>`);
  s.ui('UIIntroButtonFrame', { image: 'ImageInvestigatorSelectTitle', xposition: '0.4', yposition: '0', size: '0.1', valign: 'bottom' });
  s.ui('UIIntroButton', {
    xposition: '0.4', yposition: '0.04', size: '1', textcolor: 'black', textAlignment: 'BOTTOM', richText: 'True', valign: 'bottom',
  }, 'Read the radio log', 'EventRadio1');

  const startOps = [
    ...Object.entries(START_VARS).map(([k, v]) => `${k},=,${v}`),
    'specLoc,=,#rand3',   // where the ninth specimen lies: 1 cavern, 2 hangar, 3 dissection tent
    'dogHere,=,#rand2',   // 1: a husky survived at the kennel
  ];
  s.event('EventStart', { trigger: 'EventStart', hidden: true, buttons: [], ops: startOps, add: INTRO_UI });

  // McTighe's pencilled slips, one after another over the same handout picture
  s.ui('UIRadioSlip', { image: 'img/RadioSlip.jpg', xposition: '0', yposition: '0.14', size: '0.7' });
  s.event('EventRadio1', {
    remove: INTRO_UI, add: 'UIRadioSlip', audio: 'AudioElectric1',
    text: `<i>McTighe's shorthand, written out fair. Lake's first message from the plateau:</i>

"10:05 P.M. On the wing. After snowstorm, have spied mountain-range ahead higher than any hitherto seen. All peaks black and bare of snow. Gale blowing off them impedes navigation."

<size=85%>In the margin, in McTighe's hand: <b>Lake's set — band 4.</b></size>`,
    buttons: [{ label: 'Next slip', to: 'EventRadio2' }],
  });
  s.event('EventRadio2', {
    audio: 'AudioPapers1',
    text: `"11:30 P.M. Attention, Dyer, Pabodie, Douglas. Matter of highest — I might say transcendent — importance. Cluster of thirteen more, mixed with star-shaped soapstone fragments. <b>Of organic specimens, eight apparently perfect.</b> Have brought all to surface, leading off dogs to distance. They cannot stand the things."

"Soapstones show groups of tiny dots in regular patterns."

<size=85%>Margin: <b>dial 2.</b></size>`,
    buttons: [{ label: 'Next slip', to: 'EventRadio3' }],
  });
  s.event('EventRadio3', {
    audio: 'AudioElectric2',
    text: `"Job now to get fourteen huge specimens to camp. Got to dissect one of these things before we take any rest. Wind rising from the range. Dogs frantic. Will report at—"

<i>The rest of the slip is scribbled over: static, static, static.</i>

<size=85%>Margin: <b>trim — ?</b> (McTighe could not make it out.)</size>`,
    buttons: [{ to: 'EventSilence' }],
  });
  s.event('EventSilence', {
    remove: 'UIRadioSlip',
    text: `No word came at the agreed hour, nor the next. By morning McTighe had tried every band he knew.

Professor Dyer will not wait. The relief party flies to Lake's camp: you, a mechanic to nurse the engine, and young Danforth, the graduate student who has read the <i>Necronomicon</i> in the university library and will not say what he found there.

<i>Danforth sits in the lower left corner of the screen: click him for his thoughts, once each round. The panel in the upper left tracks the cold, your petrol, and what you have come to understand. Click it to light the primus stove.</i>`,
    buttons: [{ label: 'Fly to Lake\'s camp', to: ['EventCluesSmallParty', 'EventAct1Setup'] }],
  });

  // Smaller parties have fewer actions: McTighe remembers more, and there is an extra flask
  s.event('EventCluesSmallParty', {
    tests: t('#heroes', '<=', 2), add: 'QItemWhiskey',
    text: `McTighe presses a flask of whiskey on you at the plane. "One more thing. Lake always ran his trim high — five, maybe six. For what it's worth."`,
    buttons: [{ to: 'EventAct1Setup' }],
  });
}
