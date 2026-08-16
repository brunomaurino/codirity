import { Redis } from "@upstash/redis";
import type { PlanId } from "./plans";

const redis = Redis.fromEnv();

export interface OnboardingEventRecord {
  eventId: string;
  customerId: string;
  email: string;
  name: string | null;
  plan: PlanId | null;
  unmappedPriceId?: string;
  boardId?: string;
  boardUrl?: string;
  inviteSent?: boolean;
  emailSent?: boolean;
  alertSent?: boolean;
  cardId?: string;
  // Bundle 5 (lifecycle events) — the subscription this record is about. Absent on a
  // signup (checkout.session.completed) record. Reuses `cardId`/`alertSent` above for the
  // revoke-access card + founder alert rather than adding parallel fields: each lifecycle
  // event gets its OWN record keyed by ITS OWN eventId, so there's no collision with a
  // signup record's day-5 `cardId` — a single record only ever produces one card of one kind.
  subscriptionId?: string;
  status: "reserved" | "done";
  lease_until: number;
}

// Hygiene TTL only — NEVER the lease mechanism. A key TTL would delete the whole
// durable record (per-step resume flags, status, customerId association) at expiry,
// making the lease-expired state unreachable (spec-review BLOCKER, 2026-08-10). This
// TTL exists solely so old completed records don't accumulate in the store forever.
// The HANDOFF explicitly permits a hygiene TTL of >= 90 days (never seconds).
const HYGIENE_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days
const KEY_PREFIX = "onboarding:event:";

// Bounds the retry-once-on-NX-miss loop below at a small, explicit depth instead of
// unbounded recursion — a repeating null-read (stale replica, key churn) fails loudly
// past this many attempts rather than growing the call stack indefinitely.
const MAX_RESERVE_ATTEMPTS = 3;

function keyFor(eventId: string): string {
  return `${KEY_PREFIX}${eventId}`;
}

function parseRecord(raw: string | OnboardingEventRecord): OnboardingEventRecord {
  return typeof raw === "string" ? (JSON.parse(raw) as OnboardingEventRecord) : raw;
}

// Atomic compare-and-set on the OLD lease_until — the mutual-exclusion mechanism for
// lease takeover. Two workers racing the same expired lease cannot both win: the CAS
// only succeeds for whichever caller's `expectedOldLeaseUntil` still matches what's
// stored, and the loser re-reads and lands in the lease-valid branch.
const CAS_LEASE_LUA = `
local current = redis.call("GET", KEYS[1])
if not current then
  return 0
end
local ok, decoded = pcall(cjson.decode, current)
if not ok then
  return 0
end
if tostring(decoded.lease_until) ~= ARGV[1] then
  return 0
end
redis.call("SET", KEYS[1], ARGV[2], "KEEPTTL")
return 1
`;

async function compareAndSetLease(
  key: string,
  expectedOldLeaseUntil: number,
  updated: OnboardingEventRecord
): Promise<boolean> {
  const result = await redis.eval(CAS_LEASE_LUA, [key], [String(expectedOldLeaseUntil), JSON.stringify(updated)]);
  return result === 1;
}

// Atomic compare-and-set patch, fenced on the caller's OWN lease_until (a fencing
// token). This is what markDone/updateRecord must go through instead of a plain
// GET-then-SET: without the fence, a worker whose lease already expired and was taken
// over by another worker could still blindly overwrite the new owner's in-progress
// record, permanently stranding it — the exact duplicate/dropped-customer scenario the
// lease exists to prevent. Merges `patch` into the stored record only if `lease_until`
// still matches what this caller last observed; returns false if it lost the fence.
const CAS_PATCH_LUA = `
local current = redis.call("GET", KEYS[1])
if not current then
  return 0
end
local ok, decoded = pcall(cjson.decode, current)
if not ok then
  return 0
end
if tostring(decoded.lease_until) ~= ARGV[1] then
  return 0
end
local ok2, patch = pcall(cjson.decode, ARGV[2])
if not ok2 then
  return 0
end
for k, v in pairs(patch) do
  decoded[k] = v
end
redis.call("SET", KEYS[1], cjson.encode(decoded), "KEEPTTL")
return 1
`;

/**
 * Apply a partial update to an event's record, but ONLY if the caller still holds the
 * lease it observed at `expectedLeaseUntil` (fencing token). Returns false if another
 * worker has since taken over the lease — the caller must NOT treat its own work as
 * committed in that case (its record write lost the race).
 */
export async function updateRecordIfLeaseHeld(
  eventId: string,
  expectedLeaseUntil: number,
  patch: Partial<Omit<OnboardingEventRecord, "eventId" | "lease_until">>
): Promise<boolean> {
  const key = keyFor(eventId);
  const result = await redis.eval(CAS_PATCH_LUA, [key], [String(expectedLeaseUntil), JSON.stringify(patch)]);
  return result === 1;
}

export type ReserveResult =
  | { outcome: "done"; record: OnboardingEventRecord }
  | { outcome: "lease-valid" }
  | { outcome: "reserved"; record: OnboardingEventRecord }
  | { outcome: "lease-expired-took-over"; record: OnboardingEventRecord };

/**
 * Reserve an event id with an atomic set-if-absent + lease. Only the delivery that
 * wins the set-if-absent (or a subsequent lease takeover) proceeds; every other
 * concurrent/replayed delivery follows the deterministic §1.1(b) rule below. The
 * caller MUST carry the winning outcome's `record.lease_until` forward and use it as
 * the fencing token for every subsequent `updateRecordIfLeaseHeld` call this delivery
 * makes — never re-derive or assume it.
 */
export async function reserveEvent(
  eventId: string,
  initial: Omit<OnboardingEventRecord, "eventId" | "status" | "lease_until">,
  leaseSeconds: number,
  attempt = 1
): Promise<ReserveResult> {
  const key = keyFor(eventId);
  const leaseUntil = Date.now() + leaseSeconds * 1000;
  const record: OnboardingEventRecord = { ...initial, eventId, status: "reserved", lease_until: leaseUntil };

  const set = await redis.set(key, JSON.stringify(record), { nx: true, ex: HYGIENE_TTL_SECONDS });
  if (set === "OK") {
    return { outcome: "reserved", record };
  }

  // Key already present — apply the deterministic rule: done → no-op; lease valid →
  // another worker is live; lease expired → take over via CAS and resume.
  const existingRaw = await redis.get<string | OnboardingEventRecord>(key);
  if (existingRaw === null) {
    // Deleted between the failed NX and this GET (hygiene TTL edge) — bounded retry.
    if (attempt >= MAX_RESERVE_ATTEMPTS) {
      throw new Error(`reserveEvent: exhausted ${MAX_RESERVE_ATTEMPTS} attempts for event ${eventId} (repeated null read after NX miss)`);
    }
    return reserveEvent(eventId, initial, leaseSeconds, attempt + 1);
  }
  const existing = parseRecord(existingRaw);

  if (existing.status === "done") {
    return { outcome: "done", record: existing };
  }

  const now = Date.now();
  if (existing.lease_until > now) {
    return { outcome: "lease-valid" };
  }

  const newLeaseUntil = now + leaseSeconds * 1000;
  const updated: OnboardingEventRecord = { ...existing, lease_until: newLeaseUntil };
  const casOk = await compareAndSetLease(key, existing.lease_until, updated);
  if (!casOk) {
    // Another worker won the takeover race — back off, Stripe will retry again.
    return { outcome: "lease-valid" };
  }
  return { outcome: "lease-expired-took-over", record: updated };
}
