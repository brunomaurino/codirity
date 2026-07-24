"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useSyncExternalStore,
} from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// NOTE: this storage key and the resolution rules below (value set, unstored
// default of "light", and the "system" -> prefers-color-scheme mapping) are
// intentionally MIRRORED by the pre-paint `themeInitScript` in src/app/layout.tsx,
// which runs before this component and cannot import from here (it is inlined as a
// static string in <head>). If you change the key or the resolution here, update
// that script too, or the two will silently desync.
const STORAGE_KEY = "codirity-theme";
// Same-tab setTheme() must notify useSyncExternalStore subscribers; the native
// `storage` event only fires in OTHER tabs, so we also dispatch this one.
const THEME_EVENT = "codirity-theme-change";

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // localStorage can throw (private mode / disabled) — fall through to default.
  }
  return "light";
}

// External store: theme lives in localStorage + the OS color-scheme media query,
// not in React state. Reading it via useSyncExternalStore is SSR-safe (server
// snapshot below) and reconciles the real client value after hydration WITHOUT a
// mismatch warning — which is exactly why the old mount-gate is no longer needed.
function subscribe(callback: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_EVENT, callback);
  return () => {
    media.removeEventListener("change", callback);
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_EVENT, callback);
  };
}

// Single composite snapshot "<theme>|<resolved>" read off ONE subscription, so
// both hooks' worth of reactivity comes from a single registered listener set.
// The composite (not just the raw preference) is what makes an OS scheme change
// while in "system" mode re-render: the raw value stays "system" but the resolved
// half flips, so the snapshot string changes. Returns a primitive (compared by
// Object.is), so no infinite-loop / "getSnapshot should be cached" warning.
function getSnapshot(): string {
  const theme = getStoredTheme();
  const resolved = theme === "system" ? getSystemTheme() : theme;
  return `${theme}|${resolved}`;
}

// Server snapshot matches the pre-paint script's unstored default ("light").
function getServerSnapshot(): string {
  return "light|light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const [theme, resolvedTheme] = snapshot.split("|") as [Theme, ResolvedTheme];

  // Keep the <html data-theme> attribute in sync with the resolved theme. The
  // pre-paint script sets it first (before this ever runs), so this is a no-op
  // on load and only does work when the user toggles / the OS scheme changes.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Persistence can fail (private mode / disabled); still notify subscribers
      // so the in-memory theme updates for this session.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  // Toggle between light and dark (skips system)
  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme, setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
