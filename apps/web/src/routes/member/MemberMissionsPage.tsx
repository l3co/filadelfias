import { useMemo, useState } from 'react';
import { Globe, Heart, MapPin, Send } from 'lucide-react';
import { useAuthTenant } from '../../contexts/AuthContext';
import { useMissions } from '../../features/missions/hooks/useMissions';
import { useCreatePrayerRequest, usePrayerRequests, usePrayFor } from '../../features/prayer/hooks/usePrayer';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { LoadingOverlay } from '../../components/ui/spinner';
import { LazyImage } from '../../components/ui/LazyImage';
import { Button } from '../../components/ui/button';

export function MemberMissionsPage() {
  const tenant = useAuthTenant();
  const { data: missionaries, isLoading } = useMissions(tenant?.id);
  const { data: missionPrayerRequests } = usePrayerRequests(tenant?.id);
  const createPrayerRequest = useCreatePrayerRequest(tenant?.id);
  const prayFor = usePrayFor(tenant?.id);
  const [expandedMissionaryId, setExpandedMissionaryId] = useState<string | null>(null);
  const [prayerDrafts, setPrayerDrafts] = useState<Record<string, string>>({});

  if (isLoading) {
    return <LoadingOverlay message="Carregando missionários..." />;
  }

  const prayersByMissionary = useMemo(() => {
    const groups: Record<string, typeof missionPrayerRequests> = {};
    (missionPrayerRequests ?? []).forEach((request) => {
      if (!request.missionary_id) return;
      groups[request.missionary_id] ??= [];
      groups[request.missionary_id].push(request);
    });
    return groups;
  }, [missionPrayerRequests]);

  const handleSubmitPrayer = (missionaryId: string) => {
    const content = prayerDrafts[missionaryId]?.trim();
    if (!content) return;

    createPrayerRequest.mutate(
      {
        content,
        category: 'missions',
        missionary_id: missionaryId,
      },
      {
        onSuccess: () => {
          setPrayerDrafts((current) => ({ ...current, [missionaryId]: '' }));
          setExpandedMissionaryId(missionaryId);
        },
      },
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader 
        title="Missões" 
        description="Conheça e ore pelos nossos missionários"
      />

      {!missionaries || missionaries.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="Nenhum missionário cadastrado"
          description="Em breve você poderá conhecer os missionários apoiados pela nossa igreja"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {missionaries.map((missionary) => (
            <div
              key={missionary.id}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  {missionary.photo_url ? (
                    <LazyImage
                      src={missionary.photo_url} 
                      alt={missionary.name}
                      className="h-16 w-16 rounded-full object-cover"
                      fallbackSrc="/logo.svg"
                    />
                  ) : (
                    <Globe className="h-8 w-8 text-indigo-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{missionary.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {missionary.city && missionary.state
                        ? `${missionary.city}, ${missionary.state}`
                        : missionary.field_name}
                    </span>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-wide text-indigo-500">{missionary.field_name}</p>
                  {missionary.bio && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                      {missionary.bio}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      className="gap-2"
                      onClick={() =>
                        setExpandedMissionaryId((current) => current === missionary.id ? null : missionary.id)
                      }
                      size="sm"
                      variant="outline"
                    >
                      <Heart className="h-4 w-4" />
                      Orar por esta missão
                    </Button>
                    <span className="text-xs text-gray-500">
                      {(prayersByMissionary[missionary.id] ?? []).length} pedido(s) vinculado(s)
                    </span>
                  </div>
                </div>
              </div>

              {expandedMissionaryId === missionary.id && (
                <div className="mt-5 space-y-4 border-t border-gray-100 pt-4">
                  <div className="rounded-xl bg-indigo-50 p-4">
                    <label className="mb-2 block text-sm font-medium text-indigo-900">
                      Compartilhar pedido de oração por {missionary.name}
                    </label>
                    <textarea
                      className="min-h-[88px] w-full rounded-xl border border-indigo-100 bg-white p-3 text-sm outline-none focus:border-indigo-300"
                      onChange={(event) =>
                        setPrayerDrafts((current) => ({ ...current, [missionary.id]: event.target.value }))
                      }
                      placeholder="Ex: Ore por portas abertas no campo, saúde da família, sustento e fruto no ministério."
                      value={prayerDrafts[missionary.id] ?? ''}
                    />
                    <div className="mt-3 flex justify-end">
                      <Button
                        className="gap-2"
                        isLoading={createPrayerRequest.isPending}
                        onClick={() => handleSubmitPrayer(missionary.id)}
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                        Publicar pedido
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(prayersByMissionary[missionary.id] ?? []).length === 0 ? (
                      <p className="text-sm text-gray-500">Nenhum pedido de oração ligado a esta missão ainda.</p>
                    ) : (
                      (prayersByMissionary[missionary.id] ?? []).map((request) => (
                        <div key={request.id} className="rounded-xl border border-gray-100 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{request.author_name}</p>
                              <p className="mt-1 text-sm text-gray-600">{request.content}</p>
                            </div>
                            <Button
                              onClick={() => prayFor.mutate(request.id)}
                              size="sm"
                              variant="ghost"
                            >
                              <Heart className="h-4 w-4" />
                              <span className="ml-2">{request.prayer_count}</span>
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
