/**
 * THE PRIVATE CONTEXT - the visitor's own structural facts, held in this tab and nowhere
 * else.
 *
 * WHY IT EXISTS AT ALL
 * A TAV request is only lawful when the turn's target entity resolves to exactly one
 * structural kind, and on this path the only evidence that can do that comes from the
 * DEVICE. A Cordel device has an entity model. A public web page does not - and this site
 * may not invent one, because inventing a relationship for a stranger is inventing TAV
 * evidence. So the only lawful way to make TAV reachable is for the VISITOR to supply the
 * evidence deliberately, which is what this module holds.
 *
 * EVERY FACT HERE WAS TYPED OR CHOSEN BY THE VISITOR
 * Nothing is inferred, defaulted into meaning, or derived from what they typed in the
 * chat. There is no parser in this file, no lexicon, no heuristic and no "best guess"
 * anywhere in the interface that feeds it. An entity exists because someone pressed a
 * button; its role is set because someone chose one from a list of canonical enumerators.
 *
 * VOLATILE MEMORY ONLY - STRUCTURALLY, NOT BY POLICY
 * The store is a module-scope `Map` in one JavaScript realm. `localStorage`,
 * `sessionStorage`, `indexedDB`, `document.cookie`, `fetch` and `console` do not appear in
 * this file at all, so there is no code path by which a fact here could become durable.
 * It dies when the tab's JavaScript context dies.
 *
 * THE LABEL NEVER LEAVES
 * A visitor needs to recognise which entity they mean, and a name is the natural way to
 * do that - so a name is exactly the kind of thing that must not be transmitted. The
 * label is display-only: `toDeviceEntities()` is the only function that produces wire
 * shape, and it emits the opaque id and the chosen enumerators, never the label. The
 * opaque id is randomly generated and is NOT derived from the label, so it carries
 * nothing about it either.
 */

import {
  isDeviceEntityKind,
  isRelationshipRole,
  type DeviceEntityKind,
  type RelationshipRole,
} from '../../../api/_lib/deep-kore-codes';

/**
 * One entity the visitor declared.
 *
 * `role` is required because it is the evidence: an entity with no relationship role
 * supplies nothing elimination can use, so an entity without one would be a fact the
 * visitor gave that cannot mean anything.
 */
export interface PrivateEntity {
  /** Opaque, browser-generated, and derived from nothing the visitor typed. */
  id: string;
  /** Display only. Never transmitted, never hashed, never sent anywhere. */
  label: string;
  role: RelationshipRole;
  /** Only present when the visitor chose one. */
  kind?: DeviceEntityKind | undefined;
  /** Whether the visitor has said their next message is about this entity. */
  included: boolean;
}

const store = new Map<string, PrivateEntity>();

/**
 * A fresh opaque entity id.
 *
 * `crypto.getRandomValues` rather than a counter or a hash of the label: an id derived
 * from a label would carry the label, and a counter would leak how many entities a
 * visitor has described across sessions if it were ever seeded from anything durable.
 */
function newEntityId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  let hex = '';
  for (const b of bytes) hex += b.toString(16).padStart(2, '0');
  return `e${hex}`;
}

/**
 * Records one entity. Returns it, or null if the choices are not canonical.
 *
 * The vocabulary check is here as well as on the server for the same reason both parsers
 * check the disclosure rule: the interface must not be able to offer a visitor a value
 * the engine does not define, and a guard that exists in only one place is a guard that
 * moves when someone edits the other.
 */
export function add(label: string, role: string, kind?: string): PrivateEntity | null {
  if (!isRelationshipRole(role)) return null;
  if (kind !== undefined && !isDeviceEntityKind(kind)) return null;

  const entity: PrivateEntity = {
    id: newEntityId(),
    label: label.trim(),
    role,
    // `included` starts FALSE. A newly described entity is not silently attached to the
    // next thing the visitor says: saying who someone is and saying a message is about
    // them are two different statements, and only the visitor makes the second one.
    included: false,
  };
  if (kind !== undefined) entity.kind = kind;
  store.set(entity.id, entity);
  return entity;
}

export function all(): PrivateEntity[] {
  return [...store.values()];
}

export function size(): number {
  return store.size;
}

export function get(id: string): PrivateEntity | undefined {
  return store.get(id);
}

/** Toggles whether the visitor's next message is about this entity. */
export function setIncluded(id: string, included: boolean): void {
  const e = store.get(id);
  if (e) e.included = included;
}

/** Forgets one entity. The visitor taking a fact back is a real deletion. */
export function forget(id: string): void {
  store.delete(id);
}

/** Forgets everything. Session end, terminal failure, navigation, unmount. */
export function clearAll(): void {
  store.clear();
}

/**
 * The canonical wire shape for every entity the visitor declared.
 *
 * THE LABEL IS ABSENT FROM WHAT THIS RETURNS, and that is the whole reason this function
 * exists rather than the component assembling entities itself: there is exactly one place
 * that turns private context into wire shape, and it cannot emit a label because it never
 * writes one.
 *
 * Every declared entity is sent, not only the included ones. That is deliberate: the
 * entity list is what the engine resolves against, and a `current_message` segment that
 * referenced an entity absent from `entities` would be a dangling reference. What the
 * visitor's inclusion choice controls is the SEGMENT - what this message is about - which
 * `includedIds()` supplies.
 */
export function toDeviceEntities(): Array<Record<string, string>> {
  return all().map((e) => {
    const out: Record<string, string> = { entity_id: e.id, relationship_role: e.role };
    if (e.kind !== undefined) out.entity_kind = e.kind;
    return out;
  });
}

/** The entities the visitor has said their next message is about. */
export function includedIds(): string[] {
  return all()
    .filter((e) => e.included)
    .map((e) => e.id);
}

/** Whether there is any context at all to send. */
export function isEmpty(): boolean {
  return store.size === 0;
}
