export type Theme = "dark" | "light";

const ACCENT_COLORS = [
  { name: "Mint", value: "#2ED9A4" },
  { name: "Turquoise", value: "#14B8A6" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Pink", value: "#EC4899" },
  { name: "Orange", value: "#F97316" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Coral", value: "#FF5D5D" },
];

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("theme") as Theme | null;
  return stored ?? getSystemTheme();
}

export function setTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  localStorage.setItem("theme", theme);
  document.documentElement.classList.remove("dark", "light");
  document.documentElement.classList.add(theme);
}

export function getAccentColor(): string {
  if (typeof window === "undefined") return "#2ED9A4";
  return localStorage.getItem("accent-color") ?? "#2ED9A4";
}

export function setAccentColor(color: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("accent-color", color);
  document.documentElement.style.setProperty("--color-accent", color);
}

export { ACCENT_COLORS };
