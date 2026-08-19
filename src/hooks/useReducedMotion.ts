"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;

// The server has no matchMedia, and it must not guess: reporting `false` means
// the markup ships in its motion-capable form and the client corrects on
// hydration, which is the safe direction (the reduced-motion CSS is inert until
// the preference is actually set, so a reader who wants no motion never sees
// any regardless of what this returns).
const getServerSnapshot = () => false;

/**
 * Reads the user's reduced-motion preference as an external store.
 *
 * `useSyncExternalStore` rather than the usual `useState` + effect: reading
 * matchMedia during render would break SSR, and setting state from an effect is
 * both a hydration-mismatch risk and a React Compiler lint error
 * (`react-hooks/set-state-in-effect`). This also picks up a LIVE change to the
 * OS setting, which a one-shot read at mount does not.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
