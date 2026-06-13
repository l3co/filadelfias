import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PresentedVerse {
  text: string;
  reference: string;
  verseNumber: number;
}

export interface PresentationSettings {
  bgColor: string;
  textColor: string;
  fontSize: number;
  logoPosition: "top-right" | "bottom-right" | "none";
  logoUrl: string;
}

interface PresentationStore {
  isPresenting: boolean;
  currentVerse: PresentedVerse | null;
  isBlank: boolean;
  settings: PresentationSettings;
  setPresenting: (v: boolean) => void;
  setCurrentVerse: (verse: PresentedVerse | null) => void;
  setBlank: (v: boolean) => void;
  updateSettings: (patch: Partial<PresentationSettings>) => void;
}

export const usePresentationStore = create<PresentationStore>()(
  persist(
    (set) => ({
      isPresenting: false,
      currentVerse: null,
      isBlank: false,
      settings: {
        bgColor: "#0f172a",
        textColor: "#f8fafc",
        fontSize: 64,
        logoPosition: "bottom-right",
        logoUrl: "",
      },
      setPresenting: (v) => set({ isPresenting: v, currentVerse: null, isBlank: false }),
      setCurrentVerse: (verse) => set({ currentVerse: verse, isBlank: false }),
      setBlank: (v) => set({ isBlank: v }),
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
    }),
    {
      name: "presentation-settings",
      partialize: (s) => ({ settings: s.settings }),
    },
  ),
);
