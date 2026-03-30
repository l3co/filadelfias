import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adminService } from "@/services/admin";
import { useAuthStore } from "@/stores/authStore";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function TitheApprovalsScreen() {
  const churchId = useAuthStore((state) => state.currentChurchId);
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["pending-tithes", churchId],
    queryFn: () => adminService.getPendingTithes(churchId!),
    enabled: Boolean(churchId),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminService.approveTithe(churchId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-tithes", churchId] });
      toast.success("Registro aprovado");
    },
    onError: () => toast.error("Erro ao aprovar registro"),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => adminService.rejectTithe(churchId!, id, "Rejeitado pela administracao"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-tithes", churchId] });
      toast.success("Registro rejeitado");
    },
    onError: () => toast.error("Erro ao rejeitar registro"),
  });

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">Aprovacao de dizimos</h1>
        <p className="text-sm text-muted-foreground">Revise os registros pendentes antes de lancar no caixa.</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando registros...</p>
      ) : (
        <div className="space-y-3">
          {items?.map((item) => (
            <article key={item.id} className="rounded-2xl border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{item.member_name}</p>
                  <p className="text-sm text-muted-foreground">{item.type === "tithe" ? "Dizimo" : "Oferta"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {format(new Date(item.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  {item.description ? <p className="mt-2 text-sm text-muted-foreground">{item.description}</p> : null}
                </div>
                <p className="font-semibold">{formatCurrency(item.amount)}</p>
              </div>

              <div className="mt-4 flex gap-2">
                <Button onClick={() => approveMutation.mutate(item.id)} disabled={approveMutation.isPending || rejectMutation.isPending}>
                  Aprovar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => rejectMutation.mutate(item.id)}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                >
                  Rejeitar
                </Button>
              </div>
            </article>
          ))}

          {!items?.length ? (
            <div className="rounded-2xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
              Nenhum registro pendente.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
