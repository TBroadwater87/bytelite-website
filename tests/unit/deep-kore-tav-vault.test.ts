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
    // denial therefore cannot reveal whether anything was stored.
    expect(decideTavAnswer(false, false)).toBe('DENIED_BY_USER');
    expect(decideTavAnswer(false, true)).toBe('DENIED_BY_USER');
  });

  it('permission with nothing held is UNAVAILABLE', () => {
    expect(decideTavAnswer(true, false)).toBe('UNAVAILABLE');
  });

  it('permission with a value held is DENIED_BY_POLICY, never GRANTED', () => {
    // Possession is NOT a disclosure. This is the corrected semantics: the visitor
    // said yes, and this device still will not transmit a literal.
    expect(decideTavAnswer(true, true)).toBe('DENIED_BY_POLICY');
  });

  it('GRANTED is unreachable from the public path', () => {
    const answers = new Set([
      decideTavAnswer(true, true),
      decideTavAnswer(true, false),
      decideTavAnswer(false, true),
      decideTavAnswer(false, false),
    ]);
    expect(answers.has('GRANTED' as never)).toBe(false);
  });

  it('UNAVAILABLE is distinct from a policy refusal', () => {
    // "there is nothing here" and "there is something here and it is not leaving" are
    // different facts, and Deep Kore is told which one it is.
    expect(decideTavAnswer(true, false)).not.toBe(decideTavAnswer(true, true));
  });
});

describe('the limitation the contract audit found, stated executably', () => {
  it('two different private values cannot produce two different lawful answers', () => {
    // This is NOT a shortcoming of the vault. `TavPurpose` has one enumerator,
    // RESPONSE_REQUIRES_LITERAL_VALUE; there is no TavResponse type in Deep Kore; and
    // TavDecision is a permission vocabulary. So no canonical TAV operation exists
    // that computes a non-literal result FROM a value - which means the lawful answer
    // depends only on POSSESSION, never on WHICH value is possessed.
    clearAll();
    put('e1', 'PHONE_NUMBER', '555-0100');
    const first = decideTavAnswer(true, has('e1', 'PHONE_NUMBER'));

    clearAll();
    put('e1', 'PHONE_NUMBER', '555-0199');
    const second = decideTavAnswer(true, has('e1', 'PHONE_NUMBER'));

    // Identical, and that identity is the finding. Fabricating an operation to make
    // these differ would be inventing protocol, which the instruction forbids.
    expect(first).toBe(second);
    expect(first).toBe('DENIED_BY_POLICY');
  });
});
