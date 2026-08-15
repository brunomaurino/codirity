/**
 * Founder-alert channel stub. Bundle 4 wires the real delivery mechanism at
 * `lib/onboarding/ops.ts` per the HANDOFF (§4 O4 — email to
 * maurinobruno7@gmail.com, no Slack); this bundle only needs a callable stub
 * so the unknown-price-id / missing-identity paths have somewhere to route
 * instead of crashing. Bundle 4 should fold this export into ops.ts rather
 * than importing across both files — this module is throwaway scaffolding,
 * not the final module boundary. No secrets or full payloads — message text
 * only.
 */
export async function alertFounder(message: string): Promise<void> {
  console.log(`[onboarding founder-alert stub] ${message}`);
}
