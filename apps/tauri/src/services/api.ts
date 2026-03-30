import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.filadelfias.com";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const { useAuthStore } = await import("@/stores/authStore");
  const token = await useAuthStore.getState().getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: unknown) => void }[] = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (!originalRequest.headers) {
                originalRequest.headers = {} as InternalAxiosRequestConfig["headers"];
              }

              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { useAuthStore } = await import("@/stores/authStore");
        const refreshToken = await useAuthStore.getState().getRefreshToken();

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const { authService } = await import("./auth");
        const tokens = await authService.refreshToken(refreshToken);
        await useAuthStore.getState().setTokens(tokens);

        failedQueue.forEach((entry) => entry.resolve(tokens.access_token));
        failedQueue = [];

        if (!originalRequest.headers) {
          originalRequest.headers = {} as InternalAxiosRequestConfig["headers"];
        }

        originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        failedQueue.forEach((entry) => entry.reject(refreshError));
        failedQueue = [];

        const { useAuthStore } = await import("@/stores/authStore");
        await useAuthStore.getState().logout();
        window.location.href = "/auth/login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
