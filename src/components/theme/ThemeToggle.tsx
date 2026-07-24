"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative p-2 rounded-full",
        "text-gray-600 hover:text-gray-900",
        "dark:text-gray-400 dark:hover:text-white",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        "transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2",
        className
      )}
      aria-label={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
    >
      {/* Both icons render; visibility is driven by the [data-theme] attribute
          (Tailwind `dark:` variant), which the pre-paint theme-init script sets
          before hydration — so the correct icon shows immediately with no flash
          and no hydration mismatch. */}
      <Moon className="w-5 h-5 dark:hidden" />
      <Sun className="hidden w-5 h-5 dark:block" />
    </button>
  );
}
