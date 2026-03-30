import { Outlet } from "react-router-dom";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { usePlatform } from "@/hooks/usePlatform";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell() {
  const platform = usePlatform();
  useKeyboardShortcuts();

  if (platform === "desktop") {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar title="Filadelfias" />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col px-6 py-5">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
      <TopBar title="Filadelfias" />
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
