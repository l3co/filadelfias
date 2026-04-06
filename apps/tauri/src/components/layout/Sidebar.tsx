import {
  BookMarked,
  BookOpen,
  Calendar,
  Church,
  DollarSign,
  Download,
  GraduationCap,
  Heart,
  Home,
  Music,
  Settings,
  Users,
  Vote,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

const publicItems = [
  { to: "/", icon: Home, label: "Início" },
  { to: "/biblia", icon: BookOpen, label: "Bíblia" },
  { to: "/hinario", icon: Music, label: "Hinário" },
  { to: "/manual", icon: BookMarked, label: "Manual IPB" },
  { to: "/downloads", icon: Download, label: "Downloads" },
];

const memberItems = [
  { to: "/member/prayer", icon: Heart, label: "Oração" },
  { to: "/member/events", icon: Calendar, label: "Eventos" },
  { to: "/member/directory", icon: Users, label: "Diretório" },
  { to: "/member/tithes", icon: DollarSign, label: "Dízimos" },
  { to: "/member/expenses", icon: DollarSign, label: "Despesas" },
  { to: "/member/ebd", icon: GraduationCap, label: "EBD" },
];

const adminItems = [
  { to: "/admin", icon: Vote, label: "Painel Admin" },
  { to: "/admin/governance", icon: Vote, label: "Governança" },
];

function NavItem({ to, icon: Icon, label }: { to: string; icon: typeof Home; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
          isActive
            ? "bg-gradient-to-r from-green-50 to-teal-50 font-semibold text-green-700"
            : "text-slate-600 hover:bg-slate-50",
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "flex items-center justify-center rounded-md p-1",
              isActive
                ? "bg-gradient-to-br from-green-700 to-teal-600 text-white"
                : "bg-slate-100 text-slate-500",
            )}
          >
            <Icon size={13} />
          </span>
          {label}
        </>
      )}
    </NavLink>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="mb-1 mt-3 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
      {label}
    </p>
  );
}

export function Sidebar() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const currentChurchId = useAuthStore((state) => state.currentChurchId);

  const currentChurch = user?.churches.find((c) => c.id === currentChurchId);
  const churchName = currentChurch?.name ?? "Minha Igreja";
  const office = currentChurch?.office?.toLowerCase() ?? "";
  const role = currentChurch?.role?.toLowerCase() ?? "";
  const hasAdminAccess =
    ["pastor", "presbitero", "diacono"].includes(office) || role === "admin";

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b px-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-700 to-teal-600 text-white">
          <Church size={14} />
        </span>
        <span className="bg-gradient-to-r from-green-700 to-teal-600 bg-clip-text text-[15px] font-extrabold text-transparent">
          Filadélfias
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <SectionLabel label="Conteúdo" />
        <div className="space-y-0.5">
          {publicItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>

        {!isLoading && isAuthenticated && (
          <>
            <SectionLabel label={churchName} />
            <div className="space-y-0.5">
              {memberItems.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </div>

            {hasAdminAccess && (
              <>
                <SectionLabel label="Admin" />
                <div className="space-y-0.5">
                  {adminItems.map((item) => (
                    <NavItem key={item.to} {...item} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t p-2">
        {!isLoading && isAuthenticated && user ? (
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-700 to-teal-600 text-sm font-bold text-white">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-800">{user.name}</p>
              {currentChurch?.office && (
                <p className="truncate text-[10px] text-slate-400">{currentChurch.office}</p>
              )}
            </div>
            <NavLink
              to="/member/profile"
              className="rounded p-1 text-slate-400 hover:text-slate-600"
              title="Configurações"
            >
              <Settings size={14} />
            </NavLink>
          </div>
        ) : !isLoading ? (
          <button
            type="button"
            onClick={() => navigate("/auth/login")}
            className="flex w-full items-center gap-2.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-left transition-colors hover:bg-green-100"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-green-700 to-teal-600 text-white">
              <Church size={14} />
            </span>
            <div>
              <p className="text-xs font-semibold text-green-700">Minha Igreja</p>
              <p className="text-[10px] text-green-600">Entrar para acessar</p>
            </div>
            <span className="ml-auto text-green-400">→</span>
          </button>
        ) : null}
      </div>
    </aside>
  );
}
