/**
 * Committed regression gate for the queue quantizer — the bundle's
 * "steps 0→3 fire" acceptance criterion.
 *
 * Why this file exists (Phase 4/5 review): the 0→3 behaviour was originally
 * proven only by an ad-hoc browser harness, which verified it once and left
 * nothing behind. Worse, it is not re-runnable: a headless/sandboxed pane
 * reports `prefers-reduced-motion: reduce`, so Queue's scroll listener never
 * attaches and no CI could reproduce the check. Extracting the math into
 * `stepForScroll` makes the contract testable without a browser at all.
 *
 * Run: npx tsx scripts/w3-quantizer-test.ts
 */
import { stepForScroll } from "../src/lib/queueStep";

const CHIPS = 4;
const STEPS = CHIPS - 1; // last index, not the count
const VH = 900;
const SCENE_H = VH * 3.2; // the shipped 320vh scroll track
const TRAVEL = SCENE_H - VH;

let failures = 0;
const check = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) {
    failures++;
    console.log(`  FAIL  ${name}\n          got ${JSON.stringify(got)}  want ${JSON.stringify(want)}`);
  } else {
    console.log(`  ok    ${name}`);
  }
};

// `top` is getBoundingClientRect().top: 0 when the scene's top meets the
// viewport's top, then negative as it scrolls past.
const topAtProgress = (p: number) => -p * TRAVEL;

console.log("steps fire in order across the scene");
for (let n = 0; n <= STEPS; n++) {
  check(`progress ${n}/${STEPS} → step ${n}`, stepForScroll(topAtProgress(n / STEPS), SCENE_H, VH, STEPS), n);
}

console.log("\nthe step is DISCRETE — every offset lands on an integer in range");
{
  const seen = new Set<number>();
  for (let i = 0; i <= 400; i++) {
    const s = stepForScroll(topAtProgress(i / 400), SCENE_H, VH, STEPS);
    if (s === null || !Number.isInteger(s) || s < 0 || s > STEPS) {
      failures++;
      console.log(`  FAIL  offset ${i}/400 produced ${s}`);
      break;
    }
    seen.add(s);
  }
  check("every step 0..3 is reachable", [...seen].sort(), [0, 1, 2, 3]);
}

console.log("\nthe sequence is monotonic — scrolling forward never goes back");
{
  let prev = -1;
  let monotonic = true;
  for (let i = 0; i <= 400; i++) {
    const s = stepForScroll(topAtProgress(i / 400), SCENE_H, VH, STEPS)!;
    if (s < prev) monotonic = false;
    prev = s;
  }
  check("monotonic non-decreasing", monotonic, true);
}

console.log("\nclamped outside the scene");
check("far above (scene below the fold)", stepForScroll(5000, SCENE_H, VH, STEPS), 0);
check("far below (scrolled well past)", stepForScroll(-99999, SCENE_H, VH, STEPS), STEPS);

console.log("\nno travel → null, so the caller leaves the rendered step alone");
check("scene exactly one viewport tall", stepForScroll(0, VH, VH, STEPS), null);
check("scene shorter than the viewport", stepForScroll(0, 200, VH, STEPS), null);
check("collapsed tableau (reduced-motion / no-JS height:auto)", stepForScroll(-50, 400, VH, STEPS), null);

console.log("\nboundaries land where Math.round puts them (documents the real behaviour)");
// Round() switches at the half-step, i.e. 1/6, 3/6, 5/6 of the travel.
check("just before the 0→1 boundary", stepForScroll(topAtProgress(1 / 6 - 0.001), SCENE_H, VH, STEPS), 0);
check("just after the 0→1 boundary", stepForScroll(topAtProgress(1 / 6 + 0.001), SCENE_H, VH, STEPS), 1);
check("just before the 2→3 boundary", stepForScroll(topAtProgress(5 / 6 - 0.001), SCENE_H, VH, STEPS), 2);
check("just after the 2→3 boundary", stepForScroll(topAtProgress(5 / 6 + 0.001), SCENE_H, VH, STEPS), 3);

console.log("\nchip-count independence — adding a chip must not need a code change");
check("5 chips reach step 4", stepForScroll(topAtProgress(1), SCENE_H, VH, 4), 4);
check("2 chips reach step 1", stepForScroll(topAtProgress(1), SCENE_H, VH, 1), 1);

console.log(failures ? `\nFAIL — ${failures} assertion(s)` : "\nPASS — the quantizer holds its contract.");
process.exit(failures ? 1 : 0);
