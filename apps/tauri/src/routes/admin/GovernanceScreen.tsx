import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Minus, ThumbsDown, ThumbsUp, Vote } from "lucide-react";
import { toast } from "sonner";
import { governanceService } from "@/services/governance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";

const statusLabel = {
  scheduled: "Agendada",
  in_progress: "Em andamento",
  concluded: "Concluida",
};

function getAgendaIndex(itemId: string) {
  const segments = itemId.split(":");
  return Number(segments[segments.length - 1]);
}

export function GovernanceScreen() {
  const churchId = useAuthStore((state) => state.currentChurchId);
  const queryClient = useQueryClient();
  const [selectedAssemblyId, setSelectedAssemblyId] = useState<string | null>(null);

  const { data: assemblies, isLoading } = useQuery({
    queryKey: ["governance", "assemblies", churchId],
    queryFn: () => governanceService.getAssemblies(churchId!),
    enabled: Boolean(churchId),
  });

  useEffect(() => {
    if (!selectedAssemblyId && assemblies?.length) {
      setSelectedAssemblyId(assemblies[0].id);
    }
  }, [assemblies, selectedAssemblyId]);

  const selectedAssembly = useMemo(
    () => assemblies?.find((assembly) => assembly.id === selectedAssemblyId) ?? null,
    [assemblies, selectedAssemblyId],
  );

  const { data: votingItems, isLoading: isLoadingVotingItems } = useQuery({
    queryKey: ["governance", "voting-items", churchId, selectedAssemblyId],
    queryFn: () => governanceService.getVotingItems(selectedAssemblyId!, churchId!),
    enabled: Boolean(churchId && selectedAssemblyId),
  });

  const voteMutation = useMutation({
    mutationFn: ({ assemblyId, agendaIndex, choice }: { assemblyId: string; agendaIndex: number; choice: "yes" | "no" | "abstain" }) =>
      governanceService.vote(assemblyId, agendaIndex, churchId!, choice),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["governance", "voting-items", churchId, selectedAssemblyId],
      });
      toast.success("Voto registrado com sucesso.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel registrar o voto.");
    },
  });

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">Governanca</h1>
        <p className="text-sm text-muted-foreground">Acompanhe assembleias, pautas e o placar das votacoes em andamento.</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando reunioes...</p>
      ) : (
        <div className="space-y-3">
          {assemblies?.map((assembly) => (
            <button
              key={assembly.id}
              type="button"
              onClick={() => setSelectedAssemblyId(assembly.id)}
              className={`w-full rounded-2xl border bg-card p-4 text-left ${selectedAssemblyId === assembly.id ? "border-primary" : ""}`}
            >
              <div className="flex items-start gap-3">
                <Vote size={18} className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">{assembly.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(assembly.scheduled_at), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                  </p>
                  {assembly.location ? <p className="mt-1 text-sm text-muted-foreground">{assembly.location}</p> : null}
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-primary">
                    {statusLabel[assembly.status]}
                  </p>
                  {assembly.agenda.length ? (
                    <p className="mt-2 text-xs text-muted-foreground">{assembly.agenda.length} pauta(s) preparada(s)</p>
                  ) : null}
                </div>
              </div>
            </button>
          ))}

          {!assemblies?.length ? (
            <div className="rounded-2xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
              Nenhuma reuniao encontrada.
            </div>
          ) : null}
        </div>
      )}

      {selectedAssembly ? (
        <section className="space-y-3 rounded-2xl border bg-card p-4">
          <div>
            <h2 className="text-lg font-semibold">{selectedAssembly.title}</h2>
            <p className="text-sm text-muted-foreground">
              {format(new Date(selectedAssembly.scheduled_at), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
            </p>
          </div>

          {isLoadingVotingItems ? (
            <p className="text-sm text-muted-foreground">Carregando pautas de votacao...</p>
          ) : (
            <div className="space-y-3">
              {votingItems?.map((item) => (
                <article key={item.id} className="rounded-2xl border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Badge variant={item.status === "open" ? "default" : "secondary"}>
                      {item.status === "open" ? "Votacao aberta" : "Encerrada"}
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded-xl border p-3">
                      <div className="flex items-center gap-2 font-medium">
                        <ThumbsUp size={14} className="text-primary" />
                        <span>Sim</span>
                      </div>
                      <p className="mt-1 text-muted-foreground">{item.yes_count} voto(s)</p>
                    </div>
                    <div className="rounded-xl border p-3">
                      <div className="flex items-center gap-2 font-medium">
                        <ThumbsDown size={14} className="text-primary" />
                        <span>Nao</span>
                      </div>
                      <p className="mt-1 text-muted-foreground">{item.no_count} voto(s)</p>
                    </div>
                    <div className="rounded-xl border p-3">
                      <div className="flex items-center gap-2 font-medium">
                        <Minus size={14} className="text-primary" />
                        <span>Abstencao</span>
                      </div>
                      <p className="mt-1 text-muted-foreground">{item.abstain_count} voto(s)</p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground">Total registrado: {item.total_votes} voto(s)</p>
                  {item.user_vote ? (
                    <p className="mt-2 flex items-center gap-2 text-xs font-medium text-primary">
                      <Check size={14} />
                      Seu voto atual: {item.user_vote === "yes" ? "sim" : item.user_vote === "no" ? "nao" : "abstencao"}
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={item.user_vote === "yes" ? "default" : "outline"}
                      disabled={item.status === "closed" || voteMutation.isPending || !churchId}
                      onClick={() => voteMutation.mutate({ assemblyId: item.assembly_id, agendaIndex: getAgendaIndex(item.id), choice: "yes" })}
                    >
                      <ThumbsUp size={14} />
                      Sim
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={item.user_vote === "no" ? "default" : "outline"}
                      disabled={item.status === "closed" || voteMutation.isPending || !churchId}
                      onClick={() => voteMutation.mutate({ assemblyId: item.assembly_id, agendaIndex: getAgendaIndex(item.id), choice: "no" })}
                    >
                      <ThumbsDown size={14} />
                      Nao
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={item.user_vote === "abstain" ? "default" : "outline"}
                      disabled={item.status === "closed" || voteMutation.isPending || !churchId}
                      onClick={() => voteMutation.mutate({ assemblyId: item.assembly_id, agendaIndex: getAgendaIndex(item.id), choice: "abstain" })}
                    >
                      <Minus size={14} />
                      Abster
                    </Button>
                  </div>
                </article>
              ))}

              {!votingItems?.length ? (
                <div className="rounded-2xl border border-dashed bg-background p-6 text-center text-sm text-muted-foreground">
                  Esta assembleia ainda nao tem pautas elegiveis para votacao.
                </div>
              ) : null}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
