import {
  BookMarked,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronRight,
  DollarSign,
  GraduationCap,
  Heart,
  Home,
  Music,
  Settings,
  Users,
  Vote,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

interface NavSection {
  label: string;
  items: Array<{ to: string; icon: typeof Home; label: string }>;
}

const baseSections: NavSection[] = [
  {
    label: "Conteudo",
    items: [
      { to: "/", icon: Home, label: "Inicio" },
      { to: "/biblia", icon: BookOpen, label: "Biblia" },
      { to: "/hinario", icon: Music, label: "Hinario" },
      { to: "/manual", icon: BookMarked, label: "Manual IPB" },
      { to: "/downloads", icon: BookOpen, label: "Downloads" },
    ],
  },
  {
    label: "Comunidade",
    items: [
      { to: "/member/prayer", icon: Heart, label: "Oracao" },
      { to: "/member/events", icon: Calendar, label: "Eventos" },
      { to: "/member/directory", icon: Users, label: "Diretorio" },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { to: "/member/tithes", icon: DollarSign, label: "Dizimos" },
      { to: "/member/expenses", icon: DollarSign, label: "Despesas" },
    ],
  },
  {
    label: "Educacao",
    items: [{ to: "/member/ebd", icon: GraduationCap, label: "EBD" }],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const user = useAuthStore((state) => state.user);
  const churchId = useAuthStore((state) => state.currentChurchId);

  const currentChurch = user?.churches.find((church) => church.id === churchId);
  const office = currentChurch?.office?.toLowerCase() || "";
  const role = currentChurch?.role?.toLowerCase() || "";
  const hasAdminAccess = ["pastor", "presbitero", "diacono"].includes(office) || role === "admin";

  const sections = hasAdminAccess
    ? [
        ...baseSections,
        {
          label: "Administracao",
          items: [
            { to: "/admin", icon: Vote, label: "Painel Admin" },
            { to: "/admin/governance", icon: Vote, label: "Governanca" },
          ],
        },
      ]
    : baseSections;

  const toggle = (label: string) => {
    setCollapsed((previous) => ({
      ...previous,
      [label]: !previous[label],
    }));
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center border-b px-4 text-lg font-bold tracking-tight text-primary">
        Filadelfias
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {sections.map((section) => (
          <div key={section.label} className="mb-2">
            <button
              type="button"
              onClick={() => toggle(section.label)}
              className="flex w-full items-center justify-between px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>{section.label}</span>
              {collapsed[section.label] ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            </button>

            {!collapsed[section.label] ? (
              <div className="mt-1 space-y-1">
                {section.items.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-foreground hover:bg-muted",
                      )
                    }
                  >
                    <Icon size={15} />
                    {label}
                  </NavLink>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </nav>

      <div className="border-t p-2">
        <NavLink
          to="/member/profile"
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-muted"
        >
          <Settings size={16} />
          Configuracoes
        </NavLink>
      </div>
    </aside>
  );
}
