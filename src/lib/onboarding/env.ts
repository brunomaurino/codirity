/** Shared across onboarding modules (trello.ts, email.ts, and future ops.ts) so the
 * env-guard behavior/message can't drift between copies. */
export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} not configured`);
  }
  return value;
}
