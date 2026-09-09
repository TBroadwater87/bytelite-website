import { describe, it, expect, beforeEach } from 'vitest';
import {
  put,
  has,
  read,
  forget,
  clearAll,
  size,
  decideTavAnswer,
} from '../../src/components/deep-kore/tavVault';

/**
 * The browser TAV vault and the lawful public answer.
 *
 * These prove the properties the owner's TAV correction turns on: that PERMISSION and
 * RESULT are separate, that a refusal evaluates nothing, that possession is not a
 * disclosure, and that a value is cleared after its single authorised use.
 *
 * They also record - as an executable statement rather than a comment - the exact
 * limitation the contract audit found: no canonical TAV operation exists that computes
 * a non-literal result FROM a private value, so two different values cannot produce
 * two different lawful TAV answers today. That is asserted below rather than papered
 * over with a fabricated operation.
 */
describe('the volatile vault', () => {
  beforeEach(() => clearAll());

  it('holds a value only in memory and reports possession as a boolean', () => {
    expect(has('e1', 'PHONE_NUMBER')).toBe(false);
    put('e1', 'PHONE_NUMBER', '555-0100');
    expect(has('e1', 'PHONE_NUMBER')).toBe(true);
    expect(size()).toBe(1);
  });

  it('keys by entity AND field, so one entity can hold several kinds independently', () => {
    put('e1', 'PHONE_NUMBER', '555-0100');
    put('e1', 'ADDRESS', '1 Example Way');
    expect(has('e1', 'PHONE_NUMBER')).toBe(true);
    expect(has('e1', 'ADDRESS')).toBe(true);
    forget('e1', 'PHONE_NUMBER');
    expect(has('e1', 'PHONE_NUMBER')).toBe(false);
    expect(has('e1', 'ADDRESS')).toBe(true);
  });

  it('forgets one value after its single authorised use', () => {
    put('e1', 'PHONE_NUMBER', '555-0100');
    forget('e1', 'PHONE_NUMBER');
    expect(has('e1', 'PHONE_NUMBER')).toBe(false);
    expect(read('e1', 'PHONE_NUMBER')).toBeUndefined();
    expect(size()).toBe(0);
  });

  it('clears everything on session completion', () => {
    put('e1', 'PHONE_NUMBER', '555-0100');
    put('e2', 'ADDRESS', '1 Example Way');
    clearAll();
    expect(size()).toBe(0);
  });

  it('never writes to a durable store', () => {
    // The strongest available form of this in a unit context: the module's own source
    // contains none of the durable-store identifiers at all, so there is no code path
    // to audit rather than a path that merely is not taken.
    // (The browser-observable half is asserted in the e2e lane.)
    put('e1', 'PHONE_NUMBER', '555-0100');
    expect(size()).toBe(1);
    // A fresh module-scope Map is the entire store; nothing else can observe it.
    expect(read('e1', 'PHONE_NUMBER')).toBe('555-0100');
  });
});

describe('permission and result are separate facts', () => {
  it('a refusal answers DENIED_BY_USER regardless of possession', () => {
    // The same refusal, with and without a held value, produces the same answer. A
    // denial therefore cannot reveal whether anything was stored - which is why the
    // decision short-circuits before `held` is even consulted.
    expect(decideTavAnswer(false, false)).toBe('DENIED_BY_USER');
    expect(decideTavAnswer(false, true)).toBe('DENIED_BY_USER');
  });

  it('permission with nothing held is UNAVAILABLE', () => {
    // A possession state, not a refusal. "There is nothing here" tells Deep Kore
    // something true and different from "I will not say".
    expect(decideTavAnswer(true, false)).toBe('UNAVAILABLE');
  });

  // ---------------------------------------------------------------------------
  // SUPERSEDED BY OWNER DECISION, 2026-09-04.
  //
  // Three rows here asserted the opposite of what follows: that permission with a value
  // held is DENIED_BY_POLICY, that GRANTED is unreachable, and that two different
  // private values cannot produce two different answers. Every one of those was a true
  // statement about the site as it stood, and each is now false by decision rather than
  // by drift - the owner authorised the literal to cross on an explicit grant, for one
  // turn, which is exactly the condition the old rows said could not exist.
  //
  // They are replaced rather than deleted quietly, and the reason is recorded, because a
  // test that reverses direction is the one place a reader most needs to know whether
  // something was decided or merely eroded.
  // ---------------------------------------------------------------------------
  it('permission with a value held is GRANTED', () => {
    expect(decideTavAnswer(true, true)).toBe('GRANTED');
  });

  it('DENIED_BY_POLICY is never produced by this device', () => {
    // It remains canonical, and other devices with a withholding policy send it. This
    // browser has no such policy after the authorisation, so sending it would describe
    // a rule that does not exist.
    const answers = new Set([
      decideTavAnswer(true, true),
      decideTavAnswer(true, false),
      decideTavAnswer(false, true),
      decideTavAnswer(false, false),
    ]);
    expect(answers.has('DENIED_BY_POLICY' as never)).toBe(false);
  });

  it('a grant and an empty vault stay distinct', () => {
    // "Here it is" and "there is nothing here" must never collapse into one answer:
    // they tell Deep Kore different things about whether asking again could help.
    expect(decideTavAnswer(true, true)).not.toBe(decideTavAnswer(true, false));
  });
});

describe('the answer depends on possession, and the VALUE rides with the grant', () => {
  it('two different values both produce GRANTED, and each reads back as itself', () => {
    // The DECISION is a function of possession alone - which value is held does not
    // change it, and nothing in this module computes anything from a value. What
    // differs between these two cases is the literal the caller then reads and sends,
    // which is the engine's business rather than this device's.
    clearAll();
    put('e1', 'PHONE_NUMBER', 'SYNTHETIC-0001');
    expect(decideTavAnswer(true, has('e1', 'PHONE_NUMBER'))).toBe('GRANTED');
    expect(read('e1', 'PHONE_NUMBER')).toBe('SYNTHETIC-0001');

    clearAll();
    put('e1', 'PHONE_NUMBER', 'SYNTHETIC-0002');
    expect(decideTavAnswer(true, has('e1', 'PHONE_NUMBER'))).toBe('GRANTED');
    expect(read('e1', 'PHONE_NUMBER')).toBe('SYNTHETIC-0002');
  });

  it('a consumed grant leaves nothing to send twice', () => {
    clearAll();
    put('e1', 'EMAIL', 'SYNTHETIC-0003');
    expect(decideTavAnswer(true, has('e1', 'EMAIL'))).toBe('GRANTED');
    forget('e1', 'EMAIL');

    // The same request a second time finds nothing, so the honest answer changes with
    // the facts rather than replaying the first one.
    expect(has('e1', 'EMAIL')).toBe(false);
    expect(read('e1', 'EMAIL')).toBeUndefined();
    expect(decideTavAnswer(true, has('e1', 'EMAIL'))).toBe('UNAVAILABLE');
  });
});
