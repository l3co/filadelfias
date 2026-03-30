import { useThemeStore } from "@/stores/themeStore";

export function useTheme() {
  return useThemeStore((state) => ({
    theme: state.theme,
    resolvedTheme: state.resolvedTheme,
    setTheme: state.setTheme,
  }));
}
