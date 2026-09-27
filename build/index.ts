// Builds the scenario folder from scratch: npm run build (add --package for the .valkyrie file)
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { saveScenario, setQuestConfig, buildScenario } from '@thijshakkenberg/valkyrie-mom-mcp/dist/tools/lifecycle.js';
import { validateScenario } from '@thijshakkenberg/valkyrie-mom-mcp/dist/validation/validator.js';
import { Scenario } from './lib.js';
import { systems, finishSystems } from './systems.js';
import { prologue } from './prologue.js';
import { act1 } from './act1.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dir = path.join(root, 'AtTheMountainsOfMadness');

const s = new Scenario(dir);
setQuestConfig(s.m, { difficulty: 0.6, lengthmin: 120, lengthmax: 180, minhero: 2, maxhero: 4, image: 'img/Intro.jpg' });
s.loc({
  'quest.name': 'At the Mountains of Madness',
  'quest.synopsys': 'Antarctica, 1931. Lake\'s camp has gone silent. Fly west, over the highest mountains on earth, into a city older than mankind.',
  'quest.description': 'The relief party of the Miskatonic University Expedition flies to Lake\'s silent camp, follows a trail over an unknown range into a dead city of the Old Ones, learns their history from the carvings, and runs from what even they feared. Three acts: the camp, the city, the abyss. After H. P. Lovecraft\'s novella.\n\nRequires the base game, Path of the Serpent, and Recurring Nightmares.',
  'quest.authors': 'Thijs Hakkenberg, with Claude. After H. P. Lovecraft (1936).',
  'quest.authors_short': 'Thijs Hakkenberg',
});

systems(s);
prologue(s);
act1(s);

// Act I checkpoint: the flight over the range is built next
s.event('EventAct1End', {
  text: '<b>End of Act I (preview build).</b>\n\nThe plane lifts off Lake\'s camp and turns toward the black range. The flight over the mountains, the city of the Old Ones and the abyss beneath it follow in the next build.',
  ops: '$end,=,1', buttons: [{ label: 'The End' }],
});

finishSystems(s);

if (s.problems.length) {
  console.error('Build problems:\n  ' + s.problems.join('\n  '));
  process.exit(1);
}
await saveScenario(s.m);

const results = validateScenario(s.m);
const errors = results.filter(r => r.severity === 'error');
const warnings = results.filter(r => r.severity === 'warning');
for (const r of [...errors, ...warnings]) console.log(`${r.severity.toUpperCase()} [${r.rule}] ${r.component ?? ''}: ${r.message}`);
console.log(`\n${s.m.getAll().length} components · ${errors.length} errors · ${warnings.length} warnings · packs=${s.m.questConfig.packs}`);

if (process.argv.includes('--package')) {
  if (errors.length) { console.error('Not packaging: fix the errors first'); process.exit(1); }
  const out = path.join(root, 'dist', 'AtTheMountainsOfMadness.valkyrie');
  await buildScenario(s.m, out);
  console.log(`Packaged ${out}`);
}
