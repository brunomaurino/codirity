"use client";

import { useEffect, useRef, useState } from "react";
import { queue } from "@/config/offer";
import { useReducedMotion } from "@/hooks";

// The queue scene (redesign-v4 Bundle W3) — docs/redesign-v4/approved-mockup.html
// #queue is the contract. This is the site's SIGNATURE motion: the subscription
// mechanic demonstrated instead of described. You scroll; the queue advances.
//
// THE MOTION CONTRACT, and why it is built this way:
//
//   The scene is a tall scroll track whose stage sticks for its whole length.
//   The handler below converts scroll position into a DISCRETE INTEGER step and
//   writes it only when it CHANGES. Every visual change — the track sliding,
//   the chips flipping, the ring appearing — is a CSS transition on the house
//   curve (globals.css `.q-track` / `.q-task`).
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
    let current = 0;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      // rAF-gated: scroll fires far more often than the compositor paints, and
      // getBoundingClientRect forces layout. One read per frame, maximum.
      requestAnimationFrame(() => {
        ticking = false;
        const r = scene.getBoundingClientRect();
        // Travel available for the sticky stage = the scene's height minus the
        // one viewport the stage itself occupies.
        const travel = r.height - window.innerHeight;
        if (travel <= 0) return;
        const progress = Math.min(1, Math.max(0, -r.top / travel));
        const next = Math.round(progress * steps);
        // ONLY the rounded integer ever reaches the DOM. `progress` itself is
        // never written anywhere — that is the no-1:1-scroll-linking contract.
        if (next !== current) {
          current = next;
          setScrollStep(next);
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
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
          <h2 className="d-md rv" style={{ marginTop: "20px" }}>
            {queue.headline.map((line, i) => (
              <span key={line} className="line" style={{ "--l": i } as React.CSSProperties}>
                <span>{line}</span>
              </span>
            ))}
          </h2>
          <div className="queue" style={{ "--step": step } as React.CSSProperties}>
            {/* An ordered list because the ORDER is the claim: one is being
                worked, the rest wait behind it in a known sequence. */}
            <ol className="q-track">
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
            {/* aria-live so the count reaching a screen reader tracks the
                mechanic; the chips' own status words carry the same state in
                text, so nothing here is conveyed by colour alone. */}
            <p className="q-shipped">
              {queue.shippedLabel}&ensp;
              <span className="q-count" aria-live="polite">
                {step}
              </span>
            </p>
            <p className="q-note">{queue.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
