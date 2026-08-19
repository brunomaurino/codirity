/**
 * The queue scene's scroll quantizer (redesign-v4 Bundle W3).
 *
 * Extracted from Queue.tsx as a PURE function so the "steps 0→3 fire" contract
 * has a committed, mechanical gate (scripts/w3-quantizer-test.ts). It previously
 * had only an ad-hoc browser harness, which proved the behaviour once and left
 * nothing behind to catch a regression — and it is not re-runnable in CI, since
 * a headless pane reports prefers-reduced-motion and never attaches the scroll
 * listener at all (Phase 4/5 review).
 *
 * The contract this function exists to hold:
 *   - it returns a DISCRETE INTEGER step, never a scroll-proportional value;
 *   - it is clamped to [0, steps] outside the scene;
 *   - it returns null when the scene cannot travel, so the caller writes nothing.
 */

/**
 * @param sceneTop   the scene's `getBoundingClientRect().top` (negative once its
 *                   top has passed above the viewport's top edge)
 * @param sceneHeight the scene's full scroll-track height
 * @param viewportH   the viewport height the sticky stage occupies
 * @param steps       the LAST step index (chips - 1), not the count
 * @returns the step to display, or null when the scene has no travel
 */
export function stepForScroll(
  sceneTop: number,
  sceneHeight: number,
  viewportH: number,
  steps: number
): number | null {
  // Travel available to the sticky stage = the track minus the one viewport the
  // stage itself occupies. Non-positive means the scene is not taller than the
  // viewport (a very short window, or the collapsed reduced-motion/no-JS
  // tableau), so there is no progression to compute and the caller must leave
  // the rendered step alone rather than snapping it to 0.
  const travel = sceneHeight - viewportH;
  if (travel <= 0) return null;

  const progress = Math.min(1, Math.max(0, -sceneTop / travel));
  return Math.round(progress * steps);
}
