import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { getDatabase } from "@/lib/database";
import { router } from "@/routes";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { listen } from "@tauri-apps/api/event";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useThemeStore();
  const initialize = useAuthStore((state) => state.initialize);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    setTheme(theme);
  }, [setTheme, theme]);

  useEffect(() => {
    getDatabase()
      .then(() => setDbReady(true))
      .catch((error) => {
        console.error("Database initialization failed:", error);
        setDbReady(true); // never block on DB error
      });
  }, []);

  useEffect(() => {
    initialize().catch(console.error);
  }, [initialize]);

  // Handle navigation events emitted from Tauri native menus (desktop only).
  // Using router.navigate() preserves React state instead of doing a full reload.
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    listen<string>("navigate", (event) => {
      router.navigate(event.payload).catch(console.error);
    })
      .then((fn) => {
        unlisten = fn;
      })
      .catch(() => {
        // Not running inside Tauri (e.g. plain browser dev) — no-op.
      });

    return () => {
      unlisten?.();
    };
  }, []);

  if (!dbReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-700 to-teal-600 text-white">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
          </span>
          <p className="text-sm text-slate-400">Carregando…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="top-center" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
