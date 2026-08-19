"use client";

import { useEffect, useRef, useState } from "react";
import { queue } from "@/config/offer";
import { useReducedMotion } from "@/hooks";
import { stepForScroll } from "@/lib/queueStep";

// The queue scene (redesign-v4 Bundle W3) — docs/redesign-v4/approved-mockup.html
// #queue is the contract. This is the site's SIGNATURE motion: the subscription
// mechanic demonstrated instead of described. You scroll; the queue advances.
//
// THE MOTION CONTRACT, and why it is built this way:
//
//   The scene is a tall scroll track whose stage sticks for its whole length.
//   The handler below converts scroll position into a DISCRETE INTEGER step and
//   writes it only when it CHANGES. Every visual change is a CSS transition:
//   the track slides on the house curve (`.q-track`, `var(--ease)`), while the
//   chips' border/colour/opacity cross-fade on a plain `ease` — both verbatim
//   from the mockup. (The distinction is deliberate: the slide is the gesture
//   and carries the house easing; the chip states are just state feedback.)
//
//   It is deliberately NOT 1:1 scroll-linked. A transform driven continuously
//   off scroll offset reads as the page being dragged around; discrete steps
//   with their own easing read as a machine advancing. That difference is the
//   whole point of the section, so the quantizer is the load-bearing part, not
//   an implementation detail.
//
//   There is NO scroll-jacking: the listener is passive, nothing calls
//   preventDefault or scrollTo, and only transform/opacity animate. The page
//   scrolls natively the entire time — including under a touch viewport, where
//   a non-passive listener would also cost scroll performance.
//
// Reduced motion: the step is pinned to the STEP-1 TABLEAU (one shipped, one
// active) and no scroll listener is attached at all; the CSS drops the scene to
// height:auto with a static stage. Full information, zero motion — not a hidden
// section, and not the bare step-0 state, which would show the mechanic only
// half-made.

export function Queue() {
  const sceneRef = useRef<HTMLElement>(null);
  const [scrollStep, setScrollStep] = useState(0);
  const reduced = useReducedMotion();
  // Mirrors the rendered scroll step so the effect's change-guard survives a
  // re-run. `reduced` is a live OS preference: toggling it off mid-session
  // re-runs the effect, and an effect-local counter would restart at 0 while
  // the React state still held the advanced step — the guard would then treat
  // a genuine change as a no-op and strand the scene on a stale step
  // (Phase 4/5 review).
  const lastStep = useRef(0);

  // The TABLEAU: chip 0 shipped, chip 1 active. Derived rather than pushed into
  // state from an effect — showing the mechanic mid-flight is what makes it
  // legible without any movement, and the bare step-0 state would show it only
  // half-made (nothing shipped yet).
  const step = reduced ? 1 : scrollStep;

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || reduced) return;

    const steps = queue.tasks.length - 1;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      // rAF-gated: scroll fires far more often than the compositor paints, and
      // getBoundingClientRect forces layout. One read per frame, maximum.
      requestAnimationFrame(() => {
        ticking = false;
        const r = scene.getBoundingClientRect();
        // The quantizer math lives in a pure function so it has a committed
        // test (scripts/w3-quantizer-test.ts) — a browser harness proves the
        // behaviour once and leaves nothing behind to catch a regression.
        const next = stepForScroll(r.top, r.height, window.innerHeight, steps);
        // ONLY a rounded integer ever reaches the DOM. The continuous progress
        // ratio stays inside stepForScroll — that is the no-1:1-linking
        // contract. `null` means the scene cannot travel; leave the step alone.
        if (next !== null && next !== lastStep.current) {
          lastStep.current = next;
          setScrollStep(next);
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Resize matters because the scene's height is viewport-relative: a resize
    // changes `travel` without changing scrollY, so the step would stay stale
    // until the reader happened to scroll again. Same handler, same rAF gate.
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  return (
    <section
      ref={sceneRef}
      id="queue"
      data-ground="dark"
      className="queue-scene relative bg-ground text-chalk"
    >
      <div className="queue-stage">
        <div className="wrap-v4">
          <p className="label rv fade">{queue.label}</p>
          {/* `display` carries the leading/tracking; `.d-md` sets ONLY the
              font-size. Without the pair the heading falls back to body
              line-height 1.55, ~65% taller — enough to overflow the clipped
              100svh stage on a short viewport (Phase 4/5 review). */}
          <h2 className="display d-md rv" style={{ marginTop: "20px" }}>
            {queue.headline.map((line, i) => (
              <span key={line} className="line" style={{ "--l": i } as React.CSSProperties}>
                <span>{line}</span>
              </span>
            ))}
          </h2>
          <div className="queue" style={{ "--step": step } as React.CSSProperties}>
            {/* An ordered list because the ORDER is the claim: one is being
                worked, the rest wait behind it in a known sequence. The
                explicit role is not redundant — Safari/VoiceOver strips list
                semantics from any list styled `list-style: none`, which would
                drop exactly the ordering this section is arguing (Phase 4/5
                review). */}
            <ol className="q-track" role="list">
              {queue.tasks.map((task, i) => {
                const shipped = i < step;
                const active = i === step;
                return (
                  <li
                    key={task}
                    className={
                      "q-task" + (shipped ? " is-shipped" : active ? " is-active" : "")
                    }
                  >
                    {task}
                    <small>
                      {shipped
                        ? queue.states.shipped
                        : active
                          ? queue.states.active
                          : queue.states.queued}
                    </small>
                  </li>
                );
              })}
            </ol>
            {/* The live region spans the whole line, not just the digit: with
                it on the bare number a screen reader announces a context-free
                "2". aria-atomic re-reads the label with it, so the
                announcement is "Shipped 2" (Phase 4/5 review). The chips carry
                their own state as TEXT, so nothing is conveyed by colour
                alone and they need no live region of their own. */}
            <p className="q-shipped" aria-live="polite" aria-atomic="true">
              {queue.shippedLabel}&ensp;
              <span className="q-count">{step}</span>
            </p>
            <p className="q-note">{queue.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
