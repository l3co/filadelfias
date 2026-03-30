import { api } from "./api";
import type { AuthTokens, LoginInput, RegisterInput, User } from "@/types/auth";

function extractTokens(payload: unknown): AuthTokens {
  const data = payload as Partial<AuthTokens>;
  return {
    access_token: data.access_token || "",
    refresh_token: data.refresh_token || data.access_token || "",
    token_type: data.token_type || "bearer",
  };
}

function normalizeUser(user: User): User {
  const normalizedChurches =
    user.churches && user.churches.length > 0
      ? user.churches
      : (user.memberships || []).map((membership) => ({
          id: membership.tenant?.id || membership.id,
          name: membership.tenant?.name || "Igreja",
          role: membership.role,
          office: membership.status || "",
        }));

  return {
    ...user,
    churches: normalizedChurches,
  };
}

export const authService = {
  login: async (data: LoginInput): Promise<{ user: User; tokens: AuthTokens }> => {
    const formData = new URLSearchParams();
    formData.append("username", data.email);
    formData.append("password", data.password);

    const response = await api.post("/auth/login", formData.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const tokens = extractTokens(response.data);

    if (!tokens.access_token) {
      throw new Error("Login sem access token");
    }

    const profile = response.data?.user ? normalizeUser(response.data.user) : normalizeUser(await authService.getProfile(tokens.access_token));

    return { user: profile, tokens };
  },

  register: async (data: Omit<RegisterInput, "passwordConfirm">): Promise<{ user: User; tokens: AuthTokens }> => {
    const { data: result } = await api.post("/auth/register", data);
    const tokens = extractTokens(result?.tokens || result);
    const user = normalizeUser(result?.user || (await authService.getProfile(tokens.access_token)));
    return { user, tokens };
  },

  refreshToken: async (refresh_token: string): Promise<AuthTokens> => {
    const { data } = await api.post("/auth/refresh", { refresh_token });
    const tokens = extractTokens(data);

    if (!tokens.access_token) {
      throw new Error("Refresh sem access token");
    }

    return tokens;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post("/auth/forgot-password", { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post("/auth/reset-password", { token, password });
  },

  getProfile: async (accessToken?: string): Promise<User> => {
    const { data } = await api.get("/auth/me", {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
    return normalizeUser(data);
  },
};
