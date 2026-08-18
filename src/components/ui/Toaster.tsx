"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--toast-bg, #fff)",
          color: "var(--toast-color, #1a1a1a)",
          border: "1px solid var(--toast-border, #e5e5e5)",
        },
        classNames: {
          success: "!bg-brand-fill-dark !text-white !border-brand-fill-dark",
          error: "!bg-red-600 !text-white !border-red-600",
        },
      }}
    />
  );
}
