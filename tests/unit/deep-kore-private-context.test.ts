import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  add,
  all,
  get,
  size,
  setIncluded,
  forget,
  clearAll,
  toDeviceEntities,
  includedIds,
  isEmpty,
} from '../../src/components/deep-kore/privateContext';
import {
  RELATIONSHIP_ROLES,
  DEVICE_ENTITY_KINDS,
} from '../../api/_lib/deep-kore-codes';

/**
 * THE PRIVATE CONTEXT STORE.
 *
 * This is the only place structural evidence enters the system from a browser, so what is
 * under test is mostly what it REFUSES to do: it does not infer, it does not persist, and
 * it does not transmit the one field a visitor is most likely to type a real name into.
 *
 * The owner's authorisation was for the SMALLEST lawful surface. These rows are how that
 * stays small: every one of them fails if the module starts doing more than record what
 * somebody deliberately said.
 */

beforeEach(() => {
  clearAll();
});

describe('every fact is one the visitor stated', () => {
  it('records a role the visitor chose, and nothing it was not given', () => {
    const e = add('Alex', 'PARTNER');
    expect(e).not.toBeNull();
    expect(e!.role).toBe('PARTNER');
    // No kind was supplied, so none exists. The module does not fill one in.
    expect(e!.kind).toBeUndefined();
    expect(size()).toBe(1);
  });

  it('refuses a role that is not a canonical enumerator', () => {
    // The interface offers only canonical values, and this is the second guard: a
    // control able to offer something the engine does not define is one that can be
    // wrong in a way only the origin notices.
    for (const role of ['SPOUSE', 'COLLEAGUE', 'partner', 'Partner', '', 'OTHER_PERSON']) {
      expect(add('Alex', role), `${role} must not be recorded`).toBeNull();
    }
    expect(size()).toBe(0);
  });

  it('refuses a kind that is not a canonical device enumerator', () => {
    // BUSINESS / ORGANIZATION / EVENT / MEDICATION are StructuralEntityKind - what Deep
    // Kore RESOLVES TO by elimination. A device sending one asserts the conclusion.
    for (const kind of ['BUSINESS', 'ORGANIZATION', 'EVENT', 'MEDICATION', 'ROBOT', 'person']) {
      expect(add('Alex', 'FRIEND', kind), `${kind} must not be recorded`).toBeNull();
    }
    expect(size()).toBe(0);
  });

  it('accepts every canonical enumerator the interface offers', () => {
    for (const role of RELATIONSHIP_ROLES) {
      clearAll();
      expect(add('x', role), `${role} is canonical`).not.toBeNull();
    }
    for (const kind of DEVICE_ENTITY_KINDS) {
      clearAll();
      expect(add('x', 'OTHER', kind), `${kind} is canonical`).not.toBeNull();
    }
  });

  it('a new entity is NOT attached to the next message on its own', () => {
    // Saying who someone is and saying a message is about them are two different
    // statements. Only the visitor makes the second one.
    const e = add('Alex', 'PARTNER')!;
    expect(e.included).toBe(false);
    expect(includedIds()).toEqual([]);

    setIncluded(e.id, true);
    expect(includedIds()).toEqual([e.id]);
  });
});

describe('the opaque id carries nothing', () => {
  it('is random, not derived from the label', () => {
    const a = add('Alexandra Example', 'FRIEND')!;
    clearAll();
    const b = add('Alexandra Example', 'FRIEND')!;
    // The same label twice gives two different ids, so the id is not a hash of it.
    expect(a.id).not.toBe(b.id);
    expect(a.id).not.toContain('Alex');
  });

  it('is a plain token the server will accept', () => {
    // The server refuses anything that is not /^[A-Za-z0-9_-]+$/ and at most 64 chars,
    // so an id this module invents must satisfy that or the turn dies at the boundary.
    for (let i = 0; i < 25; i += 1) {
      clearAll();
      const e = add('x', 'SELF')!;
      expect(e.id).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(e.id.length).toBeLessThanOrEqual(64);
    }
  });
});

describe('the label never leaves', () => {
  it('is absent from the wire shape, whatever it contains', () => {
    const e = add('Alexandra Example', 'PARTNER', 'PERSON')!;
    setIncluded(e.id, true);

    const wire = JSON.stringify(toDeviceEntities());
    expect(wire).not.toContain('Alexandra');
    expect(wire).not.toContain('Example');
    expect(wire).not.toContain('label');

    // What IS sent: the opaque reference and the enumerators they chose.
    expect(toDeviceEntities()).toEqual([
      { entity_id: e.id, relationship_role: 'PARTNER', entity_kind: 'PERSON' },
    ]);
  });

  it('is still absent when the visitor typed something that looks private', () => {
    const e = add('555-0100 alex@example.invalid 12 Example Street', 'FAMILY')!;
    const wire = JSON.stringify(toDeviceEntities());
    for (const fragment of ['555-0100', 'alex@example.invalid', 'Example Street']) {
      expect(wire, `${fragment} must not be transmitted`).not.toContain(fragment);
    }
    // And the visitor can still see it in their own tab.
    expect(get(e.id)!.label).toContain('555-0100');
  });

  it('omits a kind that was never chosen rather than inventing UNKNOWN', () => {
    const e = add('Alex', 'MATCH')!;
    expect(toDeviceEntities()).toEqual([{ entity_id: e.id, relationship_role: 'MATCH' }]);
  });
});

/**
 * The module's CODE, with comments removed.
 *
 * The scans below are about what the file can DO, so they must not read what it says
 * about itself: the header explains at length that `localStorage` and friends are absent,
 * and a naive text search would find those very words and fail. Stripping comments first
 * is what makes the assertion mean "there is no such call" rather than "nobody mentioned
 * it" - and it keeps the explanation, which is worth more than the convenience of a
 * simpler grep.
 */
function contextCode(): string {
  const src = readFileSync(
    resolve(process.cwd(), 'src/components/deep-kore/privateContext.ts'),
    'utf8'
  );
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

describe('what the store will not do', () => {
  it('touches no durable browser storage anywhere in its code', () => {
    const src = contextCode();
    for (const forbidden of [
      'localStorage',
      'sessionStorage',
      'indexedDB',
      'IndexedDB',
      'document.cookie',
      'fetch(',
      'XMLHttpRequest',
      'navigator.sendBeacon',
      'console.',
      'window.location',
      'history.pushState',
    ]) {
      expect(src, `privateContext must not reference ${forbidden}`).not.toContain(forbidden);
    }
  });

  it('has no parser, lexicon or inference of any kind', () => {
    const src = contextCode();
    // Inference would have to read the conversation. Nothing here can: the module is
    // never given a message, and these are the shapes a guess would need.
    for (const forbidden of ['transcript', 'entries', 'message.', 'match(', 'RegExp', 'includes(']) {
      expect(src, `privateContext must not contain ${forbidden}`).not.toContain(forbidden);
    }
  });
});

describe('taking it back is a real deletion', () => {
  it('forgetting one entity removes it from the wire shape', () => {
    const a = add('A', 'FRIEND')!;
    const b = add('B', 'FAMILY')!;
    forget(a.id);

    expect(size()).toBe(1);
    expect(get(a.id)).toBeUndefined();
    expect(toDeviceEntities()).toEqual([{ entity_id: b.id, relationship_role: 'FAMILY' }]);
  });

  it('clearing everything leaves nothing to send', () => {
    add('A', 'FRIEND');
    add('B', 'FAMILY');
    expect(isEmpty()).toBe(false);

    clearAll();
    expect(isEmpty()).toBe(true);
    expect(all()).toEqual([]);
    expect(toDeviceEntities()).toEqual([]);
    expect(includedIds()).toEqual([]);
  });

  it('every declared entity is sent, and only the included ones are referenced', () => {
    // The entity list is what the engine resolves against, so a segment referencing an
    // entity absent from it would be a dangling reference. The inclusion choice
    // controls the SEGMENT - what this message is about - and nothing else.
    const a = add('A', 'PARTNER')!;
    const b = add('B', 'FRIEND')!;
    setIncluded(b.id, true);

    expect(toDeviceEntities().map((e) => e['entity_id']).sort()).toEqual([a.id, b.id].sort());
    expect(includedIds()).toEqual([b.id]);
  });
});
