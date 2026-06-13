import {
  BookMarked,
  BookOpen,
  Calendar,
  ChevronRight,
  Church,
  DollarSign,
  Download,
  GraduationCap,
  Heart,
  Home,
  LogOut,
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
          "group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-gradient-to-r from-green-50 to-teal-50 text-green-700 shadow-sm"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "flex items-center justify-center rounded-lg p-1.5 transition-colors",
              isActive
                ? "bg-gradient-to-br from-green-600 to-teal-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700",
            )}
          >
            <Icon size={13} />
          </span>
          {label}
          {isActive && (
            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-green-500" />
          )}
        </>
      )}
    </NavLink>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="mb-1 mt-3 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
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
  const logout = useAuthStore((state) => state.logout);

  const currentChurch = user?.churches.find((c) => c.id === currentChurchId);
  const churchName = currentChurch?.name ?? "Minha Igreja";
  const office = currentChurch?.office?.toLowerCase() ?? "";
  const role = currentChurch?.role?.toLowerCase() ?? "";
  const hasAdminAccess =
    ["pastor", "presbitero", "diacono"].includes(office) || role === "admin";

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-100 bg-white shadow-[4px_0_20px_rgba(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-gray-100 px-4 dark:border-gray-800">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-700 to-teal-600 text-white">
          <Church size={14} />
        </span>
        <span className="bg-gradient-to-r from-green-700 to-teal-600 bg-clip-text text-[15px] font-extrabold text-transparent">
          Filadélfias
        </span>
      </div>

      {/* Card da Igreja */}
      {!isLoading && isAuthenticated && currentChurch && (
        <div className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">
          <div className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-green-50 to-teal-50 px-3 py-2.5 transition-colors hover:from-green-100 hover:to-teal-100 dark:from-green-950/40 dark:to-teal-950/40">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-teal-600 text-sm font-bold text-white shadow-sm">
                {churchName.charAt(0)}
              </div>
              <div className="text-left">
                <p className="max-w-[120px] truncate text-xs font-semibold text-gray-900 dark:text-gray-100">{churchName}</p>
                <p className="text-[10px] text-gray-500">Minha Igreja</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-gray-400" />
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
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
      <div className="flex-shrink-0 border-t border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
        {!isLoading && isAuthenticated && user ? (
          <>
            <NavLink
              to="/member/profile"
              className="mb-2 flex items-center gap-2.5 rounded-xl bg-gray-50 px-3 py-2.5 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-teal-100 text-sm font-bold text-green-700 shadow-sm dark:from-green-900 dark:to-teal-900 dark:text-green-400">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
                {currentChurch?.office && (
                  <p className="truncate text-[10px] text-gray-500">{currentChurch.office}</p>
                )}
              </div>
              <Settings size={13} className="text-gray-400 hover:text-gray-600" />
            </NavLink>
            <button
              type="button"
              onClick={() => logout().catch(console.error)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-transparent px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:border-red-100 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <LogOut size={13} />
              Sair da conta
            </button>
          </>
        ) : !isLoading ? (
          <button
            type="button"
            onClick={() => navigate("/auth/login")}
            className="flex w-full items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-left transition-colors hover:bg-green-100 dark:border-green-900 dark:bg-green-950/40 dark:hover:bg-green-950/60"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-700 to-teal-600 text-white">
              <Church size={14} />
            </span>
            <div>
              <p className="text-xs font-semibold text-green-700 dark:text-green-400">Minha Igreja</p>
              <p className="text-[10px] text-green-600 dark:text-green-500">Entrar para acessar</p>
            </div>
            <span className="ml-auto text-green-400">→</span>
          </button>
        ) : null}
      </div>
    </aside>
  );
}
