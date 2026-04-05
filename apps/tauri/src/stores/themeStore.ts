import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

type ResolvedTheme = "light" | "dark";

interface ThemeStore {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme): ResolvedTheme {
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  return resolvedTheme;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "system",
      resolvedTheme: getSystemTheme(),
      setTheme: (theme) => {
        const resolvedTheme = applyTheme(theme);
        set({ theme, resolvedTheme });
      },
    }),
    {
      name: "filadelfias-theme",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setTheme(state.theme);
        }
      },
    },
  ),
);

// Re-apply the resolved theme whenever the OS preference changes.
// Only takes effect when the user has selected "system" theme.
if (typeof window !== "undefined") {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    const { theme, setTheme } = useThemeStore.getState();
    if (theme === "system") {
      setTheme("system");
    }
  });
}
