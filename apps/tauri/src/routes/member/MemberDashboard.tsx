import { BookOpen, Calendar, DollarSign, GraduationCap, Heart, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useTodayDevotional } from "@/hooks/useDevotionals";
import { useAuthStore } from "@/stores/authStore";

const quickLinks = [
  { to: "/member/prayer", icon: Heart, label: "Oracao" },
  { to: "/biblia", icon: BookOpen, label: "Biblia" },
  { to: "/member/events", icon: Calendar, label: "Eventos" },
  { to: "/member/directory", icon: Users, label: "Diretorio" },
  { to: "/member/tithes", icon: DollarSign, label: "Dizimos" },
  { to: "/member/ebd", icon: GraduationCap, label: "EBD" },
];

export function MemberDashboard() {
  const user = useAuthStore((state) => state.user);
  const { data: devotional } = useTodayDevotional();

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="mb-1 text-2xl font-bold">Ola, {user?.name?.split(" ")[0] || "irmao"}</h1>
        <p className="text-sm text-muted-foreground">Bem-vindo ao Filadelfias.</p>
      </div>

      {devotional ? (
        <Link to="/member/devotionals" className="block rounded-2xl border bg-card p-4 transition-colors hover:bg-muted">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">Devocional de hoje</p>
          <p className="font-medium">{devotional.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{devotional.scripture}</p>
        </Link>
      ) : null}

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Acesso rapido</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {quickLinks.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border bg-card p-4 text-center transition-colors hover:bg-muted"
            >
              <Icon size={22} className="text-primary" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
