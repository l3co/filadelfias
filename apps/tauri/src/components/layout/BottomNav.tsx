import { BookOpen, Home, Plus, User, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", icon: Home, label: "Inicio" },
  { to: "/biblia", icon: BookOpen, label: "Biblia" },
  { to: "/downloads", icon: Plus, label: "" },
  { to: "/manual", icon: Users, label: "Manual" },
  { to: "/member/profile", icon: User, label: "Perfil" },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t bg-background/95 px-2 backdrop-blur">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            cn(
              "flex min-w-14 flex-col items-center justify-center gap-0.5 rounded-md px-3 py-1 text-xs transition-colors",
              isActive ? "text-primary" : "text-muted-foreground",
            )
          }
        >
          {to === "/downloads" ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Icon size={20} />
            </div>
          ) : (
            <>
              <Icon size={22} />
              {label ? <span>{label}</span> : null}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
