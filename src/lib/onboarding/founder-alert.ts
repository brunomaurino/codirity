/**
 * Founder-alert channel stub. Bundle 4 wires the real delivery mechanism
 * (§4 O4 — email to the founder alert address); this bundle only needs a
 * callable stub so the unknown-price-id path has somewhere to route instead
 * of crashing. No secrets or full payloads — message text only.
 */
export async function alertFounder(message: string): Promise<void> {
  console.log(`[onboarding founder-alert stub] ${message}`);
}
