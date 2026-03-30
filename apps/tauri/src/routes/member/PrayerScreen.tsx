import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Heart, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePrayForRequest, usePrayers } from "@/hooks/usePrayer";

export function PrayerScreen() {
  const navigate = useNavigate();
  const { data: prayers, isLoading } = usePrayers();
  const prayMutation = usePrayForRequest();

  const handlePray = async (prayerId: string) => {
    try {
      await prayMutation.mutateAsync(prayerId);
      toast.success("Oracao registrada");
    } catch {
      toast.error("Nao foi possivel registrar a oracao");
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pedidos de oracao</h1>
          <p className="text-sm text-muted-foreground">Ore pelos irmaos da igreja e compartilhe seus pedidos.</p>
        </div>
        <Button size="sm" onClick={() => navigate("/member/prayer/new")}>
          <Plus size={16} className="mr-1" />
          Novo
        </Button>
      </div>

      <div className="rounded-2xl border bg-primary/5 p-4 text-sm text-primary">
        "Confessem os seus pecados uns aos outros e orem uns pelos outros." - Tiago 5:16
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando pedidos...</p>
      ) : (
        <div className="space-y-3">
          {prayers?.map((prayer) => (
            <article
              key={prayer.id}
              onClick={() => navigate(`/member/prayer/${prayer.id}`)}
              className="cursor-pointer rounded-2xl border bg-card p-4 transition-colors hover:bg-muted"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{prayer.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-primary">{prayer.category}</p>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!prayer.already_prayed && !prayMutation.isPending) {
                      void handlePray(prayer.id);
                    }
                  }}
                  className="shrink-0 rounded-full p-1"
                  aria-label="Registrar oracao"
                >
                  <Heart
                    size={18}
                    className={prayer.already_prayed ? "fill-primary text-primary" : "text-muted-foreground"}
                  />
                </button>
              </div>

              <p className="line-clamp-3 text-sm text-muted-foreground">{prayer.description}</p>

              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>{prayer.is_anonymous ? "Anonimo" : prayer.author_name}</span>
                <span>
                  {prayer.prayer_count} oracoes ·{" "}
                  {formatDistanceToNow(new Date(prayer.created_at), { addSuffix: true, locale: ptBR })}
                </span>
              </div>
            </article>
          ))}

          {!prayers?.length ? (
            <div className="rounded-2xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
              Nenhum pedido encontrado. Seja o primeiro a compartilhar.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
