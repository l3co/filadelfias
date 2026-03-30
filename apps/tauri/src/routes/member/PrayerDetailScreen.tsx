import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Heart } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePrayer, usePrayForRequest } from "@/hooks/usePrayer";

export function PrayerDetailScreen() {
  const { prayerId } = useParams<{ prayerId: string }>();
  const { data: prayer, isLoading } = usePrayer(prayerId);
  const prayMutation = usePrayForRequest();

  const handlePray = async () => {
    if (!prayer || prayer.already_prayed) {
      return;
    }

    try {
      await prayMutation.mutateAsync(prayer.id);
      toast.success("Oracao registrada");
    } catch {
      toast.error("Nao foi possivel registrar a oracao");
    }
  };

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Carregando pedido...</div>;
  }

  if (!prayer) {
    return <div className="p-4 text-sm text-muted-foreground">Pedido nao encontrado.</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <div className="rounded-2xl border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{prayer.category}</p>
        <h1 className="mt-2 text-2xl font-bold">{prayer.title}</h1>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-foreground/90">{prayer.description}</p>
      </div>

      <div className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
        <p>{prayer.is_anonymous ? "Autor anonimo" : prayer.author_name}</p>
        <p className="mt-1">{format(new Date(prayer.created_at), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}</p>
        <p className="mt-1">{prayer.prayer_count} oracoes registradas</p>
      </div>

      <Button onClick={() => void handlePray()} disabled={prayer.already_prayed || prayMutation.isPending} className="w-full">
        <Heart size={16} className={prayer.already_prayed ? "fill-current" : ""} />
        {prayer.already_prayed ? "Voce ja orou por este pedido" : prayMutation.isPending ? "Registrando..." : "Orar por este pedido"}
      </Button>
    </div>
  );
}
