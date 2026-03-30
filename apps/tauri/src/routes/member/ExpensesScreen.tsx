import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, Clock, Plus, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useExpenses } from "@/hooks/useExpenses";

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

const categoryLabel: Record<string, string> = {
  material: "Material",
  cleaning: "Limpeza",
  transport: "Transporte",
  food: "Alimentacao",
  maintenance: "Manutencao",
  bills: "Contas",
  other: "Outros",
};

export function ExpensesScreen() {
  const navigate = useNavigate();
  const { data: expenses, isLoading } = useExpenses();

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Despesas e reembolsos</h1>
          <p className="text-sm text-muted-foreground">Acompanhe solicitacoes e envie novos pedidos.</p>
        </div>
        <Button size="sm" onClick={() => navigate("/member/expenses/new")}>
          <Plus size={16} className="mr-1" />
          Solicitar
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando solicitacoes...</p>
      ) : (
        <div className="space-y-3">
          {expenses?.map((expense) => {
            const meta = statusMeta[expense.status];
            const Icon = meta.icon;

            return (
              <article key={expense.id} className="rounded-2xl border bg-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{categoryLabel[expense.category] || "Despesa"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{expense.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {format(new Date(expense.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(expense.amount)}</p>
                    <span className={`mt-1 inline-flex items-center gap-1 text-xs ${meta.className}`}>
                      <Icon size={14} />
                      {meta.label}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}

          {!expenses?.length ? (
            <div className="rounded-2xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
              Nenhuma solicitacao encontrada.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
