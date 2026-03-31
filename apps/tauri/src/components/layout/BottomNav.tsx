import { BookMarked, BookOpen, Church, Heart, Home, Music, User, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

interface Tab {
  to: string;
  icon: typeof Home;
  label: string;
  cta?: boolean;
}

const publicTabs: Tab[] = [
  { to: "/", icon: Home, label: "Início" },
  { to: "/biblia", icon: BookOpen, label: "Bíblia" },
  { to: "/hinario", icon: Music, label: "Hinário" },
  { to: "/manual", icon: BookMarked, label: "Manual" },
  { to: "/auth/login", icon: Church, label: "Entrar", cta: true },
];

const authTabs: Tab[] = [
  { to: "/", icon: Home, label: "Início" },
  { to: "/biblia", icon: BookOpen, label: "Bíblia" },
  { to: "/member/prayer", icon: Heart, label: "Oração" },
  { to: "/member/directory", icon: Users, label: "Comunidade" },
  { to: "/member/profile", icon: User, label: "Perfil" },
];

export function BottomNav() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const tabs = isAuthenticated ? authTabs : publicTabs;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t bg-white/95 px-2 backdrop-blur">
      {tabs.map(({ to, icon: Icon, label, cta }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            cn(
              "flex min-w-12 flex-col items-center justify-center gap-0.5 rounded-md px-2 py-1 text-[10px] transition-colors",
              isActive
                ? "text-green-700"
                : cta
                  ? "text-green-600"
                  : "text-slate-400",
            )
          }
        >
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
