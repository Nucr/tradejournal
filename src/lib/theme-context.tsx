"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { getTheme, setTheme as applyTheme, getAccentColor, setAccentColor, ACCENT_COLORS, Theme } from "./theme";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  accentColor: string;
  setAccent: (color: string) => void;
  accentColors: typeof ACCENT_COLORS;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggle: () => {},
  accentColor: "#2ED9A4",
  setAccent: () => {},
  accentColors: ACCENT_COLORS,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [accentColor, setAccentState] = useState("#2ED9A4");

  useEffect(() => {
    setThemeState(getTheme());
    setAccentState(getAccentColor());
  }, []);

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

  return (
    <ThemeContext.Provider value={{ theme, toggle, accentColor, setAccent, accentColors: ACCENT_COLORS }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
