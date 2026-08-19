"use client";

import { useEffect } from "react";

interface UseRevealOnScrollOptions {
  /** CSS selector for elements to reveal */
  selector?: string;
  /** Threshold for intersection (0-1) */
  threshold?: number;
  /** Root margin for earlier/later triggering */
  rootMargin?: string;
}

/**
 * Hook that adds 'visible' class to elements with 'reveal' class
 * when they enter the viewport using Intersection Observer.
 */
export function useRevealOnScroll({
  selector = ".reveal",
  threshold = 0.1,
  rootMargin = "0px 0px -50px 0px",
}: UseRevealOnScrollOptions = {}) {
  useEffect(() => {
    // Legacy v3 system: `.reveal` → `.visible`. Kept working until every
    // section migrates to the v4 system below (W1–W6), then W6 removes it.
    const elements = document.querySelectorAll(selector);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );
    elements.forEach((element) => observer.observe(element));

    // v4 reveal system (HANDOFF-redesign-v4 §1.6): `.rv` → `.in`, driving the
    // masked line-rise (`.line > span`) and `.fade` children. ONE observer,
    // armed after 450ms so the first section's reveal never competes with the
    // hero's own entrance sequence (a two-intros collision measured on the
    // approved mockup's first draft). Under prefers-reduced-motion the CSS
    // side is inert, so arming immediately just makes content visible.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // The hero's entrance joins the same system: .in lands on #hero via rAF
    // (a server-rendered .in would not animate — transitions don't fire on
    // first paint). Its .line/.fade children inherit the ancestor .in.
    const hero = document.getElementById("hero");
    const heroRaf = hero
      ? requestAnimationFrame(() => hero.classList.add("in"))
      : 0;

    let v4io: IntersectionObserver | null = null;
    const arm = () => {
      v4io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              v4io?.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -12% 0px" }
      );
      document.querySelectorAll(".rv").forEach((el) => v4io?.observe(el));
    };
    const timer = window.setTimeout(arm, reduced ? 0 : 450);

    return () => {
      elements.forEach((element) => observer.unobserve(element));
      window.clearTimeout(timer);
      if (heroRaf) cancelAnimationFrame(heroRaf);
      v4io?.disconnect();
    };
  }, [selector, threshold, rootMargin]);
}
