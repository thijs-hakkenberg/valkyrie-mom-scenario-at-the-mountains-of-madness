// Systems that run through the whole scenario: variables, the primus stove,
// Danforth, the mythos deck and the cold. See docs/storybook.md, "Persistent systems".
import { Scenario, t, and, CONTINUE } from './lib.js';

/** Variables and their starting values (set by EventStart) */
export const START_VARS: Record<string, number> = {
  Cold: 1,            // Exposure 0-10, party-wide
  Fuel: 5,            // petrol units; takeoff needs 3
  Understanding: 0,   // what the carvings and bodies taught
  Piping: 0,          // hidden Tekeli-li clock
  Nerve: 5,           // Danforth
  Photos: 0,          // evidence for Dyer's warning
  Mercy: 1,           // 0 once an Elder Thing has been killed or burned
  Act: 1,
  danforthAsked: 0,
};

/** Danforth's hints, most urgent first; acts register theirs before build() */
const danforthHints: string[] = [];
export function addDanforthHint(event: string) { danforthHints.push(event); }

/** Mythos decks per act: each pool event is drawn once, the filler can repeat */
const mythosPools: Record<number, string[]> = { 1: [], 2: [], 3: [] };
export function addMythos(s: Scenario, act: number, name: string, text: string, opts: { ops?: string; tests?: string; audio?: string; repeatable?: boolean } = {}) {
  const seen = `seen${name.replace(/^Event/, '')}`;
  const tests = opts.repeatable ? opts.tests : and(t(seen, '==', 0), ...(opts.tests ? [opts.tests] : []));
  s.event(name, {
    text,
    tests,
    ops: [opts.repeatable ? '' : `${seen},=,1`, opts.ops ?? ''].filter(Boolean).join(' '),
    audio: opts.audio,
    buttons: [{ to: 'EventColdEffects' }],
  });
  mythosPools[act].push(name);
}

export function systems(s: Scenario) {
  // ── Danforth travels with the party as a token (acts place him). His notebook is the expedition's
  // status sheet: dialog text reads {var:} each time it opens. No UI overlay: any UI on the board
  // stops Valkyrie's "next phase" button (Quest.UIItemsPresent), so UI is only for cutscenes and handouts.
  s.event('EventDanforthMenu', {
    text: `Danforth looks up from the expedition log he keeps for Dyer.

<b>Exposure</b> {var:Cold} / 10   ·   <b>Petrol</b> {var:Fuel} <size=80%>(the flight home needs 3)</size>
<b>Understanding</b> {var:Understanding}   ·   <b>Evidence</b> {var:Photos}   ·   <b>His nerve</b> {var:Nerve}`,
    buttons: [
      { label: 'Ask what he thinks', to: 'EventDanforth' },
      { label: 'Light the primus stove (−1 petrol, Exposure −3)', to: 'EventPrimusBurn', cond: t('Fuel', '>=', 1) },
      { label: 'Carry on', to: 'EventDone' },
    ],
  });
  s.stop('EventDone');

  // Keep Exposure within 0..10 (list these before whatever comes next)
  s.jump('EventColdClampHigh', 'EventDone', { tests: t('Cold', '>', 10), ops: 'Cold,=,10' });
  s.jump('EventColdClampLow', 'EventDone', { tests: t('Cold', '<', 0), ops: 'Cold,=,0' });
  s.jump('EventColdSettle', ['EventColdClampHigh', 'EventColdClampLow', 'EventDone']);

  // ── The primus stove: a portable heat source anywhere, at the price of petrol (and an action)
  s.event('EventPrimusBurn', {
    text: 'Hands held to the flame, the party feels the blood return to their fingers. Every can burned here is a can the plane will not have.',
    ops: 'Fuel,-,1 Cold,-,3', audio: 'AudioSpell1',
    buttons: [{ to: 'EventColdSettle' }],
  });

  // ── Danforth: once a round, a hint that costs him a little of himself
  s.event('EventDanforthBroken', {
    tests: t('Nerve', '<=', 0),
    text: 'Danforth does not look up. He is drawing the same shape over and over in the margin of his notebook, and whispering a word that is not a word.\n\n<i>"Tekeli-li..."</i>',
    buttons: [{ to: 'EventDone' }],
  });
  s.event('EventDanforthResting', {
    tests: t('danforthAsked', '==', 1),
    text: 'Danforth is still turning over your last question, lips moving silently. <i>(Danforth can be asked once each round.)</i>',
    buttons: [{ to: 'EventDone' }],
  });
  s.event('EventDanforthIdle', {
    text: '"I don\'t know," Danforth admits, pushing his spectacles up with a gloved finger. "Look around more. There is always something we\'ve not seen."',
    buttons: [{ to: 'EventDone' }],
  });
  s.stop('EventEndRoundReset', { trigger: 'EndRound', ops: 'danforthAsked,=,0' });

  // ── Cold effects at the end of each mythos phase
  s.event('EventCold10', {
    tests: t('Cold', '>=', 10),
    text: '<b>FREEZING.</b> Breath crystallises on beards and scarves; thought itself grows slow. Each investigator suffers 2 damage and 1 horror.\n\n<i>Get warm: a heat source, or the primus stove.</i>',
    buttons: [{ to: 'EventMythosDone' }],
  });
  s.event('EventCold8', {
    tests: t('Cold', '>=', 8),
    text: '<b>FROSTBITE.</b> White patches bloom on cheeks and fingertips. Each investigator suffers 1 damage and 1 horror.',
    buttons: [{ to: 'EventMythosDone' }],
  });
  s.event('EventCold5', {
    tests: t('Cold', '>=', 5),
    text: '<b>NUMB.</b> The cold has found its way inside the furs. Each investigator suffers 1 damage.',
    buttons: [{ to: 'EventMythosDone' }],
  });
  s.jump('EventColdEffects', ['EventColdClampHigh2', 'EventCold10', 'EventCold8', 'EventCold5', 'EventMythosDone']);
  s.jump('EventColdClampHigh2', ['EventCold10'], { tests: t('Cold', '>', 10), ops: 'Cold,=,10' });
  s.stop('EventMythosDone');

  // ── Eliminated: the ice keeps them
  s.event('EventDefeatEliminated', {
    trigger: 'Eliminated',
    text: 'One of the party falls and does not rise. There is no carrying anyone across this country; the living turn back toward the plane, and the plateau keeps the rest.\n\n<b>The expedition has failed.</b> Whatever lies west of Lake\'s camp will wait for the next men foolish enough to go looking.',
    ops: '$end,=,1', audio: 'AudioGameOver',
    buttons: [{ label: 'The End' }],
  });
}

/** Wire the registries once every act has added to them */
export function finishSystems(s: Scenario) {
  s.jump('EventDanforth', ['EventDanforthBroken', 'EventDanforthResting', ...danforthHints, 'EventDanforthIdle']);

  for (const act of [1, 2, 3]) {
    // Above ground the cold climbs every round; the abyss (act 3) breathes warm air
    s.jump(`EventMythosDeck${act}`, mythosPools[act], { tests: t('Act', '==', act), random: true, ops: act < 3 ? 'Cold,+,1' : undefined });
  }
  // Piping (the Tekeli-li clock) does not tick by itself: only noise and the things that hear it raise it
  s.jump('EventMythos', ['EventMythosDeck3', 'EventMythosDeck2', 'EventMythosDeck1'], { trigger: 'Mythos' });
}

/** A Danforth hint: shown when `tests` pass; costs 1 Nerve */
export function danforthHint(s: Scenario, name: string, tests: string, text: string) {
  s.event(name, {
    tests: and(t('danforthAsked', '==', 0), tests),
    text: `${text}\n\n<i>Danforth's hands are not quite steady. (Nerve −1)</i>`,
    ops: 'Nerve,-,1 danforthAsked,=,1',
    buttons: [{ label: CONTINUE, to: 'EventDone' }],
  });
  addDanforthHint(name);
}
