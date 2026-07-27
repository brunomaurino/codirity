"use client";

import dynamic from "next/dynamic";

// Loads sonner off the critical path: the toast container mounts after hydration
// (client-only), so sonner is split into an on-demand chunk instead of the initial
// bundle. Toasts are only triggered post-interaction (e.g. the contact form), by
// which point the container is mounted.
const Toaster = dynamic(
  () => import("./Toaster").then((m) => m.Toaster),
  { ssr: false }
);

export function LazyToaster() {
  return <Toaster />;
}
