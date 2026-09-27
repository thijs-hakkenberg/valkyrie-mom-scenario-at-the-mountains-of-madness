# At the Mountains of Madness — Storybook

A Mansions of Madness 2nd Edition scenario for [Valkyrie](https://github.com/NPBruce/valkyrie), adapted from H. P. Lovecraft's novella (1936). This storybook is the design contract: tone, plot devices and mechanics per act.

**Requires:** Base game, Path of the Serpent, Recurring Nightmares · **Players:** 2–4 · **Length:** ~150 min · **Difficulty:** 0.6


## Premise & player role

It is January 1931. The investigators are the **relief party** of the Miskatonic University Expedition. Lake's sub-expedition radioed about fourteen impossible specimens, then went silent during a gale. Professor **Dyer** stays at the plane as the voice on the radio. The young graduate student **Danforth** comes along as the party's companion. He is the one who has read the *Necronomicon*.

**What the players do across the scenario:** find out what happened at Lake's camp, follow Gedney's trail over the range into the dead city, learn the Old Ones' history from their carvings, and get out alive with the evidence Dyer needs to stop the next expedition.

**Thematic spine:** *"They were men!"* The horror moves from the unknown monster (the Elder Things) to recognising them as fellow scientists, and then to what even they feared (the shoggoth) and what lies beyond the peaks (Danforth's glimpse). Tone and mechanics follow this arc: investigate, then understand, then flee.

## Tone & intensity curve

```
Intensity 10 |                                               ████ ▒
           9 |                                            ███████ ▒
           8 |                                         ██████████ ▒
           7 |                              ▄▄▄▄   █████████████  ▒
           6 |                         ▄▄▄███████████████████████  ▒
           5 |          ▄█▄       ▄▄▄███████████████████████████   ▒
           4 |     ▄▄▄█████▄  ▄▄█████████████████████████████████   ▒
           3 |  ▄▄████████████████████████████████████████████████   ▒
           2 |▄████████████████████████████████████████████████████   ▒▁
             +----------------------------------------------------------
              Prol.  ACT I camp   Intl.  ACT II city        ACT III   Epil.
              clinical dread      sublime  awe→understanding  terror   hush
```

| Stage | Emotion | Intensity | Pacing tools |
|---|---|---|---|
| Prologue | Scientific wonder, unease | 2 | Radio slips as handouts, calm cutscene |
| Act I – Lake's Camp | Dread of absence; "who did this?" | 3 → 5 (spike: thawing specimen) | Slow search loop, cold clock, one surprise fight |
| Interlude – Over the Range | The sublime; breath before the plunge | 5 → 4 | Board-free dialogue choices, mirage art |
| Act II – City of the Old Ones | Awe, then empathy, then creeping wrongness | 4 → 7 | Puzzles, carvings, neutral monsters, "Tekeli-li" clock sounds |
| Act III – Tekeli-li | Pure terror, then desperate flight | 7 → 10 | Unkillable boss, chase loop, collapsing options |
| Epilogue – The Glimpse | Hush; a residue of dread | 10 → 2 | Final horror test, branching endings |

**Rules for the curve:** no monster on the board before round 3; nothing lethal until the Act I spike; Act II has *fewer* fights than Act I finishes with (the lull of wonder); Act III never lets the players rest.

## Persistent systems (thread through all acts)

| System | Variable | Shown as | What it does |
|---|---|---|---|
| **Exposure (Cold)** | `Cold` 0–10 | Danforth's expedition log (his token) and the cold effects | +1 each Mythos, +1–2 on gale events. At 3, 6 and 9 a frostbite event deals damage or horror. At 10, 2 damage per investigator every round. Heat: camp stove, plane cabin, and **the warm air rising from the abyss** (as in the book), so the cold pushes players *down*, toward the shoggoth. |
| **Petrol (Fuel)** | `Fuel` | Danforth's expedition log | Spent on warmth (−2 Cold), firebombs vs. the shoggoth, safe-flight choices. Takeoff needs `Fuel >= 3`. A resource dilemma through the whole game. |
| **Understanding** | `Understanding` 0–8 | Gained from carvings, photos and Danforth | At 3, the Elder Things turn neutral. At 5, "Mimic the piping" works vs. the shoggoth. Also changes the ending. |
| **Tekeli-li clock** | `Piping` (hidden) | Audio/text cues at 4, 8 and 12 | Rises with rounds and loud actions (dynamite, gunfire choices, failed stealth). Sets the shoggoth's start distance and phase-1 health. |
| **Danforth's Nerve** | `Nerve` 5 | Danforth's token: his portrait travels with the party; click for the log, his thoughts and the primus stove | Once per round: "Ask Danforth" gives a puzzle or lore hint for −1 Nerve. At 0 he breaks: hints stop, and the epilogue changes. |
| **Evidence** | `Photos` | Camera starting item | Photographing carvings, specimens and the city adds Evidence. The ending depends on it. |
| **Mercy** | `Mercy` flag | — | Set if the Act I specimen is spared. It unlocks the Act III sacrifice. |

## Prologue (≈5 min) — "Silence from the Westward Camp"

- **Plot device:** Lake's last radio messages, and then silence.
- **Mechanics:** full-screen intro cutscene UI (art + text), then **three handouts** (McTighe's shorthand radio slips, shown as UI images). Clues and starting items are handed out by party size (silent events with `#heroes` vartests). Starting items: Carbine Rifle, Kerosene Lantern, Survival Pack; Petrol 5. Two-player parties also get Whiskey and a hint.
- The slips hold a hidden clue: Lake's message gives the specimen count ("fourteen… eight perfect"). Players will need it in Act I.

## ACT I — "Lake's Camp" (≈40 min, rounds 1–6, intensity 3→5)

**Plot device:** the camp is wrecked. Men and dogs are dead, **Gedney and one dog are missing**, and *eight perfect specimens are missing*. Six damaged specimens lie buried under five-pointed star mounds. Ink blots on papers suggest *someone tried to write*. Everyone blames Gedney's madness. The truth waits in the fossil cavern by Pabodie's drill.

**Map (PotS + base):** landing strip/snowfield → Campsite (Lake's camp) → Ruined Hut (dissection tent) → Tool Shed (supply cache) → Clearing (star mounds) → Tunnel/Cave (Pabodie's boring and the limestone fossil cavern). It unfolds through explore tokens. Custom token art: stove, drill derrick, star mound, dead dog, sledge tracks.

**Beats:**
1. **Landing.** Cold starts at 1. The gale shows through mythos events.
2. **The Search Loop** *(event-loop showcase)*. "Sift the wreckage" is a repeatable interact event that draws from a random pool of 8 outcomes: petrol can, fur coats (−1 Cold), dynamite, an ink-blotted page (Understanding +1), a dead dog (horror), and others. Each outcome is used once (tracked by variables). A quota ends the loop when the pool is empty.
3. **The Dissection Tent.** Lake's notebook is a unique item whose inspect handout shows his anatomical sketch. A lore test reveals that the specimens were *dissected precisely*, by someone who knew anatomy.
4. **The Star Mounds** — *CODE puzzle #1 (easy)*. Five-pointed snow mounds. The six damaged specimens are here, but *which mound is disturbed?* The solution comes from Lake's count (14 − 8 = 6) and the mound pattern handout.
5. **The Snowbound Hangar** — *SLIDE puzzle*. Drift-packed crates and a sledge block the plane. Clearing them (an agility or strength puzzle) makes the plane airworthy, which is needed to leave the act.
6. **Spike: the Thawing Specimen** *(intensity 5)*. In the fossil cavern (its location is random, one of 3 tiles), a ninth specimen thaws. **Custom monster "Elder Thing"** (base `MonsterMiGo`, RN figure). Its activation pool is *curious, not cruel*: it takes an item, flees toward warmth, and attacks only when cornered or burned.
   **Moral choice:** kill it (safe, `Mercy = 0`, the Elder Things turn hostile in Act II) or let it go west (`Mercy = 1`, `Understanding +1`). This is the first "they were men" seed.
7. **Exit.** A sledge trail leads west to the mountains. To leave the act, the hangar must be cleared and the players spend 1 round boarding.

**Act I variability:** fossil cavern location, search-pool order, gale mythos deck (12 events, each once), the specimen's opening activation, and whether the missing dog is found (companion: warns before an Elder Thing activation).

## INTERLUDE — "Over the Range" (≈10 min, between rounds, intensity 5→4)

**Plot device:** the flight across the 20,000 ft range: the **mirage** of the city, the cube-shapes on the peaks, the cave mouths.

**Mechanics** *(multi-question dialogue & branching showcase)*: a board-free chain of 3 decisions over full-screen art.
- **Altitude:** climb high (−1 Fuel, safe) or thread the pass (agility test; on a failure, damage and a horror test).
- **The Mirage:** look closely (lore: Understanding +1, horror) or look away.
- **Landing:** the foothill plateau (safe; the plane is far from the city, +1 round of walking) or the city's edge (observation test; on a failure, Fuel −2, and the landing is close).

The outcome sets Act II's starting tile and where the plane is, which becomes the Act III escape distance.

## ACT II — "The City of the Old Ones" (≈60 min, rounds 7–14, intensity 4→7)

**Plot device:** follow Gedney's sledge trail and the fleeing Elder Things into the dead city. Read its **history in the carvings** to find the way down, and gather **photographic evidence**. The tone turns from awe to empathy: they were scientists, colonists, *men*. Then it creeps into wrongness: the later carvings are decadent, and a *fresher* trail of slime runs through the corridors.

**Map (PotS ruins):** entry at Crumbling Plaza. There are **5 quarters** and a random **3 (or 4 for 4 investigators)** of them appear through explore tokens *(random-event variability)*:

| Quarter (tile) | History panel (carving art) | Special |
|---|---|---|
| Mosaic Chamber | *The Coming* — arrival from the stars | The easiest panel |
| Statue Chamber | *The Making of the Shoggoths* | Horror test; Understanding +2 |
| Hall Chambers | *The Wars* — star-spawn and Mi-Go | Elder Thing patrol lair |
| Cracked Chamber / Pit | *The Retreat to the Sea* | **Pseudopod mini-fight** (see below) |
| Antechamber | *The Decadence* — the palimpsest | Reveals the shoggoth revolt; `Piping +2` |

**Beats & mechanics:**
1. **Reading the carvings.** Each panel is an interact → lore test → handout (custom art) with Understanding +1 and a photo option (+Evidence, but it takes an action).
2. **The Dot-Group Door** — *CODE puzzle #2 (mastermind, 5 symbols, 4 positions)*. The Old Ones counted in base 5. The panels give partial dot-groups, so more panels read means fewer guesses. The door leads to the Great Map room.
3. **The Great Map** — *IMAGE puzzle*. Reassemble the shattered relief map (custom art, 3×3). It shows the tunnel to the abyss.
4. **The Elder Thing patrol.** 1–2 Elder Things, depending on #heroes and `Mercy`. With `Mercy = 1` or `Understanding >= 3` they are **neutral**: they move away from investigators, and attacking them sets them hostile. Otherwise they hunt. Their activations change with `Mercy` (a variable-branching activation event).
5. **The Pseudopod** *(mini-boss foreshadowing)*. A black, iridescent tendril rises from the pit. It is a custom monster (base `MonsterCthonian`, RN), **immobile**, and attacks adjacent investigators. Defeating it gives access to the Retreat panel. It pipes "Tekeli-li" once.
6. **The penguins.** Blind albino penguins, shown as decorative tokens with custom art, lead the way to the tunnel mouth (a hint path).
7. **Gedney's Sledge** *(emotional peak)*. Near the tunnel mouth lies the stolen sledge with Gedney and the dog, *preserved and dissected, the way Lake dissected them*. A horror test. Understanding +1. Danforth's Nerve −1.
8. **Exit:** descend the tunnel, which needs the Great Map *or* following the penguins (+2 rounds). The air grows **warm**: Cold resets toward 0, a tempting relief.

**Act II scaling:** panels needed for the door clue = 3 (2–3 investigators) or 4 (4 investigators). Elder Things = 1 + (#heroes ≥ 3). Pseudopod health = 3 + 1 per hero.

## ACT III — "Tekeli-li!" (≈45 min, rounds 15–20, intensity 7→10)

**Plot device:** at the tunnel's end lie the **headless Old Ones**. Their heads were sucked off, and the stone is coated in slime. From the dark comes the piping: *"Tekeli-li! Tekeli-li!"* The shoggoth, the servant that overthrew its masters, rolls toward them like a subway train. Now it's a **chase back to the plane.**

**Boss: "The Shoggoth"** — custom monster, base `MonsterShoggoth` (RN figure), with a custom portrait. It is **multi-phase**: each `DefeatedSpawnShoggothN` makes it recoil and re-form one tile back, stronger (3 phases). Health per phase = base + per-hero. The `Piping` clock adds +1 health per threshold passed and sets where it enters.

**Activation (one event, random pool, weighted by phase):**
- **Pursuit.** It moves toward the nearest investigator and engulfs: damage plus a stuck condition.
- **Mimicry.** It pipes in its dead masters' voices: a horror test for everyone in range.
- **Flood of Slime.** It blocks a doorway (token swap to a wall) and cuts off a route.
- **Iridescent Eyes.** It forms eyes; the investigator it looks at tests will or becomes Paranoid/Dazed.

**Ways to survive** *(each one pays off an earlier system)*:
- **Firebomb** (Fuel −1): strength or agility test, extra damage. Petrol is tight, and takeoff needs 3.
- **Mimic the piping** (needs `Understanding >= 5`): lore test, and the shoggoth *skips* its next activation. This is Understanding paying off.
- **The Counterweight Gate** — *TOWER puzzle*. Lower the Old Ones' great slab by moving the counterweight stones. It blocks the shoggoth for 2 rounds.
- **The Last Old One** (only with `Mercy = 1`): the Elder Thing spared in Act I appears and sacrifices itself, and phase 2 is skipped. This is the emotional payoff of "they were men".
- **Run:** the investigators reach the plane tile, then take off with `Fuel >= 3`. Without enough fuel, 2 successful strength tests (hand-pumping the reserve) cost rounds under attack.

**Pressure loop:** at every EndRound the tunnel collapse advances and the black mist spreads. The act has no rest round.

## EPILOGUE — "The Glimpse" (≈5 min)

- **Plot device:** over the range, Danforth looks back, past the peaks, at what even the Old Ones feared.
- **Final horror test** for everyone. Its difficulty rises with Understanding: the more you know, the worse it gets.
- **Endings** (each with its own art):
  1. **The Warning.** Escaped, with `Photos` at the threshold or above. Dyer writes his warning, and the world may listen.
  2. **Tekeli-li.** Escaped, but `Nerve = 0`. Danforth only screams the word.
  3. **Unbelieved.** Escaped without evidence. The Starkweather-Moore expedition sets sail anyway.
  4. **Defeat.** Eliminated, stranded without fuel, or the cold at 10 through Act III.

## Balance model (2–4 investigators)

- **Round budget:** 6 + 8 + 6 ≈ 20 rounds (~7.5 min each). Each act gets an *action budget*: required objective actions ≈ 60 % of the available actions (2 per investigator per round). The rest is for searching, healing, fights and warming.
- **Party-size levers:** clue distribution, monster `uniquehealthhero`, the number of patrols, the panels required, starting fuel (`4 + #heroes/2`), and Cold per Mythos (the same for every size; more players means more warming actions but the same heat sources).
- **Soft timers, not hard ones:** Cold and Piping punish dawdling without instant loss. The hard loss is only Cold at 10 plus elimination.
- **Difficulty** is set to 0.6 in quest config. `minheroes = 2`, `maxheroes = 4`.
- **Variability:** 7 random seams: fossil cavern location, search pool, gale deck, Act II quarters (3 or 4 of 5), panel order, shoggoth activation pool, and dog found or not.
- **Paper playtest:** before the art pass, count the actions for each act and each party size from the story graph (`story_graph`), and adjust quotas and health.

## Mechanics showcase checklist

Intro cutscene UI · handouts · clue distribution by party size · starting and unique items with `inspect` · explore, search and interact tokens · token swaps · walls/blocking · skill tests with coloured buttons · horror tests · randomised mythos deck · `EndRound` pressure loop · custom `Var` triggers · repeatable event loop with a quota · variable branching · random events · multi-question dialogue · **all 4 puzzle classes** (code ×2, slide, image, tower) · custom monsters ×3 with custom activations and evade/horror events · a multi-phase boss through Defeated triggers · UI tracker (the thermometer) · 3 expansion tile sets · endings through `$end`.

## Art list (ComfyUI, one fixed house style, ~28 images)

- **Cover/intro:** the *Arkham* at Ross Island, with Erebus smoking.
- **Handouts:** 3 radio slips, Lake's sketch, the star-mound pattern.
- **Scenes:** Lake's camp aftermath, the fossil cavern, the flight through the pass, the mirage city, the city panorama, Gedney's sledge (no gore), the headless Old Ones, the shoggoth reveal.
- **Puzzles:** 5 history carvings, the Great Map (image puzzle), the dot-group door.
- **Monsters:** Elder Thing, Pseudopod and Shoggoth portraits.
- **Tokens (512²):** stove, drill derrick, star mound, sledge, penguin, dot glyph.
- **Endings:** 4.


## Design notes from playtesting

- **No UI stays on the board.** Valkyrie's next phase button does nothing while any UI element is on the board, so an always-on status panel froze the game in the investigator phase. Danforth became a token instead, and his dialog shows the numbers (`{var:}` is filled in each time a dialog opens). ValkyrieMCP 2.3.3 warns about this (`ui-lifetime`).
