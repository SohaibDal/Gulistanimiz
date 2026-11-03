import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode
} from "react";

/* ------------------ Types ------------------ */

export type ThemeName = "dark" | "sepia";

export type Theme = {
  name: string;
  
  /* Background */
  background: string;
  backgroundImage: any;
  backgroundOverlay: string;
  border: string;

  /* Cards */
  cardBackground: string;
  cardBorder: string;

  /* Text */
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  /* Accents */
  accent: string;
  danger: string;

  /* UI */
  placeholder: string;
};

/* ------------------ Theme Definitions ------------------ */

const themes: Record<ThemeName, Theme> = {
  dark: {
    name: "dark",
    background: "#0b0b0b",
    border: "#2a2a2a",
    backgroundImage: require("../assets/backgrounds/persian-blue.jpg"),
    backgroundOverlay: "rgba(0,0,0,0.65)",

    cardBackground: "rgba(18,18,18,0.92)",
    cardBorder: "rgba(255,255,255,0.08)",

    textPrimary: "#f5f5f5",
    textSecondary: "#cfcfcf",
    textMuted: "#9a9a9a",

    accent: "#d9a441",
    danger: "#e63946",

    placeholder: "#2a2a2a"
  },

  sepia: {
    name: "sepia",
    background: "#2a241c",
    border: "#4a3f2e",
    backgroundImage: require("../assets/backgrounds/persian-green.jpg"),
    backgroundOverlay: "rgba(35,25,15,0.45)",

    cardBackground: "rgba(20,15,10,0.88)", // 🔥 darker than before
    cardBorder: "rgba(255,235,200,0.18)",

    textPrimary: "#f3ecd9", // 🔥 brighter for readability
    textSecondary: "#dbc8a3",
    textMuted: "#b8a37c",

    accent: "#d4a24c",
    danger: "#c0392b",

    placeholder: "#3a2e1e"
  }
};

/* ------------------ Context ------------------ */

type ThemeContextType = {
  theme: Theme;
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

/* ------------------ Provider ------------------ */

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>("sepia"); // ✅ default

  const value = useMemo(
    () => ({
      themeName,
      setThemeName,
      theme: themes[themeName]
    }),
    [themeName]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ------------------ Hook ------------------ */

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return ctx;
}
