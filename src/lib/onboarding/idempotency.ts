import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export interface OnboardingEventRecord {
  eventId: string;
  customerId: string;
  email: string;
  name: string | null;
  plan: string | null;
  boardId?: string;
  boardUrl?: string;
  inviteSent?: boolean;
  emailSent?: boolean;
  alertSent?: boolean;
  cardId?: string;
  status: "reserved" | "done";
  lease_until: number;
}

// Hygiene TTL only — NEVER the lease mechanism. A key TTL would delete the whole
// durable record (per-step resume flags, status, customerId association) at expiry,
// making the lease-expired state unreachable (spec-review BLOCKER, 2026-08-10). This
// TTL exists solely so old completed records don't accumulate in the store forever.
const HYGIENE_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days
const KEY_PREFIX = "onboarding:event:";

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

export type ReserveResult =
  | { outcome: "done"; record: OnboardingEventRecord }
  | { outcome: "lease-valid" }
  | { outcome: "reserved"; record: OnboardingEventRecord }
  | { outcome: "lease-expired-took-over"; record: OnboardingEventRecord };

/**
 * Reserve an event id with an atomic set-if-absent + lease. Only the delivery that
 * wins the set-if-absent (or a subsequent lease takeover) proceeds; every other
 * concurrent/replayed delivery follows the deterministic §1.1(b) rule below.
 */
export async function reserveEvent(
  eventId: string,
  initial: Omit<OnboardingEventRecord, "status" | "lease_until">,
  leaseSeconds: number
): Promise<ReserveResult> {
  const key = keyFor(eventId);
  const leaseUntil = Date.now() + leaseSeconds * 1000;
  const record: OnboardingEventRecord = { ...initial, status: "reserved", lease_until: leaseUntil };

  const set = await redis.set(key, JSON.stringify(record), { nx: true, ex: HYGIENE_TTL_SECONDS });
  if (set === "OK") {
    return { outcome: "reserved", record };
  }

  // Key already present — apply the deterministic rule: done → no-op; lease valid →
  // another worker is live; lease expired → take over via CAS and resume.
  const existingRaw = await redis.get<string | OnboardingEventRecord>(key);
  if (existingRaw === null) {
    // Deleted between the failed NX and this GET (hygiene TTL edge) — retry once.
    return reserveEvent(eventId, initial, leaseSeconds);
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

/** Persist a partial update to an already-reserved record (per-step resume state). */
export async function updateRecord(
  eventId: string,
  patch: Partial<OnboardingEventRecord>
): Promise<OnboardingEventRecord> {
  const key = keyFor(eventId);
  const existingRaw = await redis.get<string | OnboardingEventRecord>(key);
  if (existingRaw === null) {
    throw new Error(`updateRecord: no record found for event ${eventId}`);
  }
  const existing = parseRecord(existingRaw);
  const updated: OnboardingEventRecord = { ...existing, ...patch };
  await redis.set(key, JSON.stringify(updated), { ex: HYGIENE_TTL_SECONDS });
  return updated;
}

/** Mark an event's record fully done — only call once every required step is recorded. */
export async function markDone(eventId: string): Promise<OnboardingEventRecord> {
  return updateRecord(eventId, { status: "done" });
}
