// Thin helpers over the valkyrie-mom-mcp library: the same functions the MCP tools call,
// wrapped so a component, its localization and its buttons are written in one place.
import { ScenarioModel } from '@thijshakkenberg/valkyrie-mom-mcp/dist/model/scenario-model.js';
import {
  upsertEvent, upsertTile, upsertToken, upsertSpawn, upsertItem, upsertPuzzle, upsertUI,
  upsertCustomMonster,
} from '@thijshakkenberg/valkyrie-mom-mcp/dist/tools/upsert.js';
import { placeTileRelative } from '@thijshakkenberg/valkyrie-mom-mcp/dist/tools/map.js';
import { layoutTiles, findBoundaries, type Rect } from '@thijshakkenberg/valkyrie-mom-mcp/dist/map/layout.js';

type Upsert = (m: ScenarioModel, name: string, data: Record<string, string>) => { success: boolean; errors: Array<{ message: string }> };

export interface Button {
  label?: string;
  /** Next component(s); with several, Valkyrie runs the first whose vartests pass */
  to?: string | string[];
  color?: string;
  /** vartests that enable this button */
  cond?: string;
  condAction?: 'hide' | 'disable' | 'none';
}

export interface EventSpec {
  text?: string;
  hidden?: boolean;
  buttons?: Button[];
  trigger?: string;
  add?: string | string[];
  remove?: string | string[];
  ops?: string | string[];
  tests?: string;
  random?: boolean;
  quota?: number | string;
  audio?: string;
  highlight?: boolean;
  extra?: Record<string, string>;
}

// ── vartests ──
export const t = (v: string, op: string, val: string | number) => `VarOperation:${v},${op},${val}`;
export const and = (...xs: string[]) => xs.join(' VarTestsLogicalOperator:AND ');
export const or = (...xs: string[]) => xs.join(' VarTestsLogicalOperator:OR ');

const list = (x?: string | string[]) => (Array.isArray(x) ? x.join(' ') : x ?? '');

export const CONTINUE = '{qst:CONTINUE}';
export const PASS = '{qst:PASS}';
export const FAIL = '{qst:FAIL}';

export class Scenario {
  readonly m: ScenarioModel;
  readonly problems: string[] = [];

  constructor(dir: string) {
    this.m = new ScenarioModel(undefined, dir);
    this.loc({ CONTINUE: 'Continue', PASS: 'Pass', FAIL: 'Fail' });
  }

  private put(fn: Upsert, name: string, data: Record<string, string>) {
    const r = fn(this.m, name, data);
    for (const e of r.errors) this.problems.push(`${name}: ${e.message}`);
  }

  loc(entries: Record<string, string>) {
    for (const [k, v] of Object.entries(entries)) this.m.localization.set(k, v);
  }

  /** Event-like fields shared by events, tokens, spawns, puzzles and UI */
  private eventData(name: string, s: EventSpec): Record<string, string> {
    const d: Record<string, string> = { ...(s.extra ?? {}) };
    const buttons = s.buttons ?? (s.hidden ? [] : [{}]);
    if (s.hidden) d.display = 'false';
    d.buttons = String(buttons.length);
    buttons.forEach((b, i) => {
      const n = i + 1;
      d[`event${n}`] = list(b.to);
      if (b.color) d[`buttoncolor${n}`] = b.color;
      if (b.cond) {
        d[`event${n}Condition`] = b.cond;
        d[`event${n}ConditionAction`] = b.condAction ?? 'hide';
      }
      if (!s.hidden) this.m.localization.set(`${name}.button${n}`, b.label ?? CONTINUE);
    });
    if (s.trigger) d.trigger = s.trigger;
    if (s.add) d.add = list(s.add);
    if (s.remove) d.remove = list(s.remove);
    if (s.ops) d.operations = list(s.ops);
    if (s.tests) d.vartests = s.tests;
    if (s.random) d.randomevents = 'true';
    if (s.quota !== undefined) d.quota = String(s.quota);
    if (s.audio) d.audio = s.audio;
    if (s.highlight) d.highlight = 'true';
    this.m.localization.set(`${name}.text`, s.text ?? (s.hidden ? '.' : ''));
    return d;
  }

  event(name: string, s: EventSpec) {
    this.put(upsertEvent, name, this.eventData(name, s));
  }

  /** A hidden event that only moves on (to one target, or the first of several whose tests pass) */
  jump(name: string, to: string | string[], s: Omit<EventSpec, 'hidden' | 'buttons'> = {}) {
    this.event(name, { ...s, hidden: true, buttons: [{ to }] });
  }

  /** A hidden event that ends the chain */
  stop(name: string, s: Omit<EventSpec, 'hidden' | 'buttons'> = {}) {
    this.event(name, { ...s, hidden: true, buttons: [] });
  }

  /** A skill test: Pass / Fail buttons */
  test(name: string, text: string, pass: string | string[], fail: string | string[], s: Omit<EventSpec, 'text' | 'buttons'> = {}) {
    this.event(name, { ...s, text, buttons: [
      { label: PASS, to: pass, color: 'green' },
      { label: FAIL, to: fail, color: 'red' },
    ] });
  }

  token(name: string, type: string, at: [number, number], s: EventSpec & { customImage?: string; size?: string; rotation?: number; clickable?: boolean } = {}) {
    const d = this.eventData(name, s);
    d.type = type;
    d.xposition = String(at[0]);
    d.yposition = String(at[1]);
    if (s.customImage) d.customImage = s.customImage;
    if (s.size) d.tokensize = s.size;
    if (s.rotation) d.rotation = String(s.rotation);
    if (s.clickable === false) d.clickeffect = 'false';
    this.put(upsertToken, name, d);
  }

  spawn(name: string, monster: string, s: EventSpec & { at?: [number, number]; uniquehealth?: number; uniquehealthhero?: number; unique?: boolean } = {}) {
    const d = this.eventData(name, { hidden: true, buttons: [], ...s });
    d.monster = monster;
    if (s.at) { d.xposition = String(s.at[0]); d.yposition = String(s.at[1]); }
    if (s.unique) d.unique = 'true';
    if (s.uniquehealth !== undefined) d.uniquehealth = String(s.uniquehealth);
    if (s.uniquehealthhero !== undefined) d.uniquehealthhero = String(s.uniquehealthhero);
    this.put(upsertSpawn, name, d);
  }

  puzzle(name: string, data: Record<string, string>, finishLabel: string, next: string | string[]) {
    const d = { ...data, buttons: '1', event1: list(next) };
    this.m.localization.set(`${name}.button1`, finishLabel);
    this.put(upsertPuzzle, name, d);
  }

  ui(name: string, data: Record<string, string>, text?: string, onClick?: string) {
    const d: Record<string, string> = { vunits: 'True', display: 'false', buttons: '0', ...data };
    if (onClick) { d.buttons = '1'; d.event1 = onClick; this.m.localization.set(`${name}.button1`, text ?? '.'); }
    if (text !== undefined) this.m.localization.set(`${name}.uitext`, text);
    this.m.localization.set(`${name}.text`, '.');
    this.put(upsertUI, name, d);
  }

  item(name: string, data: Record<string, string>) {
    this.put(upsertItem, name, { starting: 'false', ...data });
  }

  monster(name: string, data: Record<string, string>, title: string, info: string) {
    this.put(upsertCustomMonster, name, data);
    this.loc({ [`${name}.monstername`]: title, [`${name}.info`]: info });
  }

  /** Place `name` against `anchor` with a door lined up, taking the first candidate that overlaps nothing */
  tile(name: string, side: string, anchor?: { tile: string; dir: 'north' | 'south' | 'east' | 'west'; rotation?: number; pick?: number }) {
    let x = 0, y = 0, rotation = 0;
    if (anchor) {
      const c = placeTileRelative(this.m, anchor.tile, anchor.dir, side, anchor.rotation, 12)
        .filter(c => c.overlaps.length === 0 && c.passages.length > 0);
      const pick = c[anchor.pick ?? 0];
      if (!pick) throw new Error(`No free spot for ${name} (${side}) ${anchor.dir} of ${anchor.tile}`);
      ({ x, y, rotation } = pick);
    }
    this.put(upsertTile, name, { side, xposition: String(x), yposition: String(y), ...(rotation ? { rotation: String(rotation) } : {}) });
  }

  rect(tile: string): Rect {
    const r = layoutTiles(this.m).find(p => p.name === tile)?.rect;
    if (!r) throw new Error(`Unknown tile ${tile}`);
    return r;
  }

  /** A point inside `tile`: fx 0 = west edge .. 1 = east edge, fy 0 = north edge .. 1 = south edge */
  at(tile: string, fx: number, fy: number): [number, number] {
    const r = this.rect(tile);
    return [round(r.minX + (r.maxX - r.minX) * fx), round(r.maxY - (r.maxY - r.minY) * fy)];
  }

  /** Just inside `from`, in the middle of the passage it shares with `to` (where an explore token goes) */
  door(from: string, to: string, inset = 0.9): [number, number] {
    const b = findBoundaries(layoutTiles(this.m)).find(b => (b.a === from && b.b === to) || (b.a === to && b.b === from));
    if (!b || b.passages.length === 0) throw new Error(`No passage between ${from} and ${to}`);
    const p = b.passages.reduce((a, c) => (c.to - c.from > a.to - a.from ? c : a));
    const mid = (p.from + p.to) / 2;
    const r = this.rect(from);
    // side of `from` facing `to`
    const side = b.a === from ? b.side : ({ N: 'S', S: 'N', E: 'W', W: 'E' } as const)[b.side];
    switch (side) {
      case 'N': return [round(mid), round(r.maxY - inset)];
      case 'S': return [round(mid), round(r.minY + inset)];
      case 'E': return [round(r.maxX - inset), round(mid)];
      default: return [round(r.minX + inset), round(mid)];
    }
  }
}

const round = (n: number) => Math.round(n * 100) / 100;
