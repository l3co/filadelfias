import { create } from "zustand";
import { secureStore } from "@/lib/secureStore";
import { authService } from "@/services/auth";
import type { AuthTokens, User } from "@/types/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentChurchId: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setTokens: (tokens: AuthTokens) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  currentChurchId: null,

  initialize: async () => {
    try {
      const token = await secureStore.get("access_token");

      if (!token) {
        set({ isLoading: false, user: null, isAuthenticated: false, currentChurchId: null });
        return;
      }

      const user = await authService.getProfile(token);
      set({
        user,
        isAuthenticated: true,
        currentChurchId: user.churches[0]?.id ?? null,
        isLoading: false,
      });
    } catch {
      await secureStore.clear();
      set({ user: null, isAuthenticated: false, currentChurchId: null, isLoading: false });
    }
  },

  login: async (email, password) => {
    const { user, tokens } = await authService.login({ email, password });
    await get().setTokens(tokens);
    set({
      user,
      isAuthenticated: true,
      currentChurchId: user.churches[0]?.id ?? null,
      isLoading: false,
    });
  },

  logout: async () => {
    await secureStore.clear();
    set({ user: null, isAuthenticated: false, currentChurchId: null, isLoading: false });
  },

  setTokens: async (tokens) => {
    await secureStore.set("access_token", tokens.access_token);
    await secureStore.set("refresh_token", tokens.refresh_token);
  },

  getAccessToken: async () => secureStore.get("access_token"),
  getRefreshToken: async () => secureStore.get("refresh_token"),
}));
