import { useQuery } from "@tanstack/react-query";
import { DollarSign, Receipt, Users, Vote } from "lucide-react";
import { Link } from "react-router-dom";
import { adminService } from "@/services/admin";
import { useAuthStore } from "@/stores/authStore";

export function AdminDashboard() {
  const churchId = useAuthStore((state) => state.currentChurchId);

  const { data: pendingTithes } = useQuery({
    queryKey: ["pending-tithes", churchId],
    queryFn: () => adminService.getPendingTithes(churchId!),
    enabled: Boolean(churchId),
    select: (items) => items.length,
  });

  const { data: pendingExpenses } = useQuery({
    queryKey: ["pending-expenses", churchId],
    queryFn: () => adminService.getPendingExpenses(churchId!),
    enabled: Boolean(churchId),
    select: (items) => items.length,
  });

  const cards = [
    { to: "/admin/tithes", icon: DollarSign, label: "Dizimos pendentes", count: pendingTithes ?? 0 },
    { to: "/admin/expenses", icon: Receipt, label: "Despesas pendentes", count: pendingExpenses ?? 0 },
    { to: "/admin/members", icon: Users, label: "Membros", count: null },
    { to: "/admin/governance", icon: Vote, label: "Governanca", count: null },
  ];

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">Area administrativa</h1>
        <p className="text-sm text-muted-foreground">Acompanhe aprovacoes, membros e governanca da igreja.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map(({ to, icon: Icon, label, count }) => (
          <Link
            key={to}
            to={to}
            className="relative flex min-h-36 flex-col items-center justify-center gap-3 rounded-2xl border bg-card p-5 text-center transition-colors hover:bg-muted"
          >
            {count !== null && count > 0 ? (
              <span className="absolute top-2 right-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-destructive px-1 text-xs text-white">
                {count}
              </span>
            ) : null}
            <Icon size={24} className="text-primary" />
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
