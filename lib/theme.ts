export type ThemeName = "dark" | "sepia";

export const themes = {
  dark: {
    background: "#0e0e0e",
    card: "#151515",

    textPrimary: "#e8e6e3",
    textSecondary: "#9a9a9a",
    textMuted: "#777",

    accent: "#b59a5a",
    border: "#222",
    placeholder: "#2a2a2a"
  },

  sepia: {
    background: "#f4ecd8",
    card: "#efe4c8",

    textPrimary: "#3a2f1c",
    textSecondary: "#5a4a32",
    textMuted: "#7a6a52",

    accent: "#a66b2f",
    border: "#e0d4b8",
    placeholder: "#e6dcc6"
  }
};

export type Theme = typeof themes.dark;
