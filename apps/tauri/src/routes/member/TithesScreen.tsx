import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, Clock, Plus, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTitheSummary, useTithes } from "@/hooks/useTithes";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

const statusMeta = {
  approved: { icon: CheckCircle, label: "Aprovado", className: "text-emerald-600" },
  pending: { icon: Clock, label: "Pendente", className: "text-amber-500" },
  rejected: { icon: XCircle, label: "Rejeitado", className: "text-destructive" },
};

export function TithesScreen() {
  const navigate = useNavigate();
  const { data: tithes, isLoading } = useTithes();
  const { data: summary } = useTitheSummary();

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dizimos e ofertas</h1>
          <p className="text-sm text-muted-foreground">Acompanhe seus envios e o status de aprovacao.</p>
        </div>
        <Button size="sm" onClick={() => navigate("/member/tithes/new")}>
          <Plus size={16} className="mr-1" />
          Registrar
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border bg-primary/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Este mes</p>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(summary?.total_month ?? 0)}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Este ano</p>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(summary?.total_year ?? 0)}</p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando registros...</p>
      ) : (
        <div className="space-y-3">
          {tithes?.map((tithe) => {
            const meta = statusMeta[tithe.status];
            const Icon = meta.icon;

            return (
              <article key={tithe.id} className="flex items-center justify-between rounded-2xl border bg-card p-4">
                <div>
                  <p className="font-medium">{tithe.type === "tithe" ? "Dizimo" : "Oferta"}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(tithe.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  {tithe.description ? <p className="mt-1 text-sm text-muted-foreground">{tithe.description}</p> : null}
                </div>

                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(tithe.amount)}</p>
                  <span className={`mt-1 inline-flex items-center gap-1 text-xs ${meta.className}`}>
                    <Icon size={14} />
                    {meta.label}
                  </span>
                </div>
              </article>
            );
          })}

          {!tithes?.length ? (
            <div className="rounded-2xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
              Nenhum registro encontrado.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
