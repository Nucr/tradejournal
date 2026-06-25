"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { getTheme, setTheme as applyTheme, getAccentColor, setAccentColor, ACCENT_COLORS, Theme } from "./theme";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  accentColor: string;
  setAccent: (color: string) => void;
  previewAccent: string | null;
  setPreviewAccent: (color: string | null) => void;
  confirmAccent: () => void;
  cancelAccent: () => void;
  accentColors: typeof ACCENT_COLORS;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggle: () => {},
  accentColor: "#2ED9A4",
  setAccent: () => {},
  previewAccent: null,
  setPreviewAccent: () => {},
  confirmAccent: () => {},
  cancelAccent: () => {},
  accentColors: ACCENT_COLORS,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [accentColor, setAccentState] = useState("#2ED9A4");
  const [previewAccent, setPreviewAccent] = useState<string | null>(null);

  useEffect(() => {
    setThemeState(getTheme());
    setAccentState(getAccentColor());
  }, []);

  const effectiveAccent = previewAccent ?? accentColor;

  useEffect(() => {
    document.documentElement.style.setProperty("--color-accent", effectiveAccent);
  }, [effectiveAccent]);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      return next;
    });
  }, []);

  const setAccent = useCallback((color: string) => {
    setAccentColor(color);
    setAccentState(color);
  }, []);

  const confirmAccent = useCallback(() => {
    if (previewAccent) {
      setAccentColor(previewAccent);
      setAccentState(previewAccent);
      setPreviewAccent(null);
    }
  }, [previewAccent]);

  const cancelAccent = useCallback(() => {
    document.documentElement.style.setProperty("--color-accent", accentColor);
    setPreviewAccent(null);
  }, [accentColor]);

  return (
    <ThemeContext.Provider value={{
      theme, toggle,
      accentColor, setAccent,
      previewAccent, setPreviewAccent,
      confirmAccent, cancelAccent,
      accentColors: ACCENT_COLORS,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
