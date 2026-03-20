import { useMemo, useState } from 'react';
import { BookOpenText, CalendarDays, Globe, HandHeart, Heart, MapPin, Newspaper, Send, Users2 } from 'lucide-react';
import { useAuthTenant } from '../../contexts/AuthContext';
import { useCountries, useMissions, useSocialProjects } from '../../features/missions/hooks/useMissions';
import { useCreatePrayerRequest, usePrayerRequests, usePrayFor } from '../../features/prayer/hooks/usePrayer';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { LoadingOverlay } from '../../components/ui/spinner';
import { LazyImage } from '../../components/ui/LazyImage';
import { Button } from '../../components/ui/button';
import { formatDateBR } from '../../lib/formatters';

const PROJECT_STATUS_LABELS: Record<string, string> = {
  PLANNING: 'Planejamento',
  ACTIVE: 'Em andamento',
  PAUSED: 'Pausado',
  COMPLETED: 'Concluído',
};

const PROJECT_STATUS_COLORS: Record<string, string> = {
  PLANNING: 'bg-amber-100 text-amber-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  PAUSED: 'bg-slate-100 text-slate-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
};

export function MemberMissionsPage() {
  const tenant = useAuthTenant();
  const { data: countries, isLoading: isLoadingCountries } = useCountries(tenant?.id);
  const { data: missionaries, isLoading } = useMissions(tenant?.id);
  const { data: socialProjects, isLoading: isLoadingProjects } = useSocialProjects(tenant?.id);
  const { data: missionPrayerRequests } = usePrayerRequests(tenant?.id);
  const createPrayerRequest = useCreatePrayerRequest(tenant?.id);
  const prayFor = usePrayFor(tenant?.id);
  const [expandedMissionaryId, setExpandedMissionaryId] = useState<string | null>(null);
  const [profileMissionaryId, setProfileMissionaryId] = useState<string | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [prayerDrafts, setPrayerDrafts] = useState<Record<string, string>>({});

  const countryNameByCode = useMemo(
    () => Object.fromEntries((countries ?? []).map((country) => [country.code, country.name])),
    [countries],
  );

  const prayersByMissionary = useMemo(() => {
    const groups: Record<string, typeof missionPrayerRequests> = {};
    (missionPrayerRequests ?? []).forEach((request) => {
      if (!request.missionary_id) return;
      groups[request.missionary_id] ??= [];
      groups[request.missionary_id].push(request);
    });
    return groups;
  }, [missionPrayerRequests]);

  const prayersByProject = useMemo(() => {
    const groups: Record<string, typeof missionPrayerRequests> = {};
    (missionPrayerRequests ?? []).forEach((request) => {
      if (!request.social_project_id) return;
      groups[request.social_project_id] ??= [];
      groups[request.social_project_id].push(request);
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

  const handleSubmitProjectPrayer = (projectId: string) => {
    const content = prayerDrafts[projectId]?.trim();
    if (!content) return;

    createPrayerRequest.mutate(
      {
        content,
        category: 'missions',
        social_project_id: projectId,
      },
      {
        onSuccess: () => {
          setPrayerDrafts((current) => ({ ...current, [projectId]: '' }));
          setExpandedProjectId(projectId);
        },
      },
    );
  };

  const missionaryCount = missionaries?.length ?? 0;
  const socialProjectCount = socialProjects?.length ?? 0;
  const prayerRequestCount = missionPrayerRequests?.length ?? 0;

  if (isLoading || isLoadingProjects || isLoadingCountries) {
    return <LoadingOverlay message="Carregando missões e projetos sociais..." />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader 
        title="Missões" 
        description="Conheça os missionários e acompanhe as frentes missionárias e sociais da igreja"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-5">
          <div className="mb-2 flex items-center gap-2 text-indigo-700">
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium">Missionários</span>
          </div>
          <p className="text-2xl font-semibold text-indigo-950">{missionaryCount}</p>
        </div>

        <div className="rounded-3xl border border-rose-100 bg-rose-50 p-5">
          <div className="mb-2 flex items-center gap-2 text-rose-700">
            <HandHeart className="h-4 w-4" />
            <span className="text-sm font-medium">Projetos sociais</span>
          </div>
          <p className="text-2xl font-semibold text-rose-950">{socialProjectCount}</p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
          <div className="mb-2 flex items-center gap-2 text-emerald-700">
            <Heart className="h-4 w-4" />
            <span className="text-sm font-medium">Pedidos de oração</span>
          </div>
          <p className="text-2xl font-semibold text-emerald-950">{prayerRequestCount}</p>
        </div>
      </div>

      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-[#002333]">Missionários apoiados</h2>
          <p className="text-sm text-gray-500">Ore, acompanhe atualizações e conheça melhor cada campo.</p>
        </div>

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
                className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100">
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
                    <h3 className="text-lg font-semibold">{missionary.name}</h3>
                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {missionary.city && missionary.state
                          ? `${missionary.city}, ${missionary.state}`
                          : missionary.field_name}
                      </span>
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-wide text-indigo-500">{missionary.field_name}</p>
                    {missionary.bio && (
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                        {missionary.bio}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Button
                        className="gap-2"
                        onClick={() =>
                          setProfileMissionaryId((current) => (current === missionary.id ? null : missionary.id))
                        }
                        size="sm"
                        variant={profileMissionaryId === missionary.id ? 'default' : 'outline'}
                      >
                        <BookOpenText className="h-4 w-4" />
                        {profileMissionaryId === missionary.id ? 'Ocultar perfil' : 'Ver perfil'}
                      </Button>
                      <Button
                        className="gap-2"
                        onClick={() =>
                          setExpandedMissionaryId((current) => (current === missionary.id ? null : missionary.id))
                        }
                        size="sm"
                        variant="outline"
                      >
                        <Heart className="h-4 w-4" />
                        Orar por esta missão
                      </Button>
                      {missionary.newsletter_url && (
                        <a
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                          href={missionary.newsletter_url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <Newspaper className="mr-2 h-4 w-4" />
                          Newsletter
                        </a>
                      )}
                      <span className="text-xs text-gray-500">
                        {(prayersByMissionary[missionary.id] ?? []).length} pedido(s) vinculado(s)
                      </span>
                    </div>
                  </div>
                </div>

                {profileMissionaryId === missionary.id && (
                  <div className="mt-5 space-y-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Campo</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{missionary.field_name}</p>
                      </div>
                      <div className="rounded-xl bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">País</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {countryNameByCode[missionary.country_code] || missionary.country_code}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Localização</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {[missionary.city, missionary.state].filter(Boolean).join(', ') || 'Não informada'}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Pedidos vinculados</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {(prayersByMissionary[missionary.id] ?? []).length} pedido(s) de oração
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Biografia</p>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">
                        {missionary.bio || 'Este missionário ainda não possui uma biografia detalhada cadastrada.'}
                      </p>
                    </div>

                    {missionary.newsletter_url && (
                      <div className="flex justify-start">
                        <a
                          className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
                          href={missionary.newsletter_url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <Newspaper className="mr-2 h-4 w-4" />
                          Acompanhar newsletter
                        </a>
                      </div>
                    )}
                  </div>
                )}

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
      </section>

      <section className="space-y-5 rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 to-orange-50 p-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Projetos sociais</h2>
          <p className="text-sm text-gray-600">
            Veja as ações sociais em andamento e como a igreja está servindo a comunidade.
          </p>
        </div>

        {!socialProjects || socialProjects.length === 0 ? (
          <EmptyState
            icon={HandHeart}
            title="Nenhum projeto social cadastrado"
            description="Quando a igreja cadastrar novas iniciativas, elas aparecerão aqui."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {socialProjects.map((project) => (
              <article key={project.id} className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.title}</h3>
                    <span
                      className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        PROJECT_STATUS_COLORS[project.status] || PROJECT_STATUS_COLORS.PLANNING
                      }`}
                    >
                      {PROJECT_STATUS_LABELS[project.status] || project.status}
                    </span>
                  </div>
                  <div className="rounded-xl bg-rose-100 p-2 text-rose-700">
                    <HandHeart className="h-4 w-4" />
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-gray-600">{project.summary}</p>

                <div className="mt-4 space-y-2 text-sm text-gray-500">
                  {project.location && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {project.location}
                    </p>
                  )}
                  {project.target_audience && (
                    <p className="flex items-center gap-2">
                      <Users2 className="h-4 w-4" />
                      Público-alvo: {project.target_audience}
                    </p>
                  )}
                  {(project.start_date || project.end_date) && (
                    <p className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {project.start_date ? formatDateBR(project.start_date) : 'Sem início'}
                      {' - '}
                      {project.end_date ? formatDateBR(project.end_date) : 'Sem fim'}
                    </p>
                  )}
                  {(project.coordinator_name || project.contact_info) && (
                    <p>
                      Coordenação: {project.coordinator_name || 'Não informada'}
                      {project.contact_info ? ` • ${project.contact_info}` : ''}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-rose-100 pt-4">
                  <Button
                    className="gap-2"
                    onClick={() =>
                      setExpandedProjectId((current) => (current === project.id ? null : project.id))
                    }
                    size="sm"
                    variant="outline"
                  >
                    <Heart className="h-4 w-4" />
                    Orar por este projeto
                  </Button>
                  <span className="text-xs text-gray-500">
                    {(prayersByProject[project.id] ?? []).length} pedido(s) vinculado(s)
                  </span>
                </div>

                {expandedProjectId === project.id && (
                  <div className="mt-5 space-y-4 border-t border-rose-100 pt-4">
                    <div className="rounded-xl bg-white p-4">
                      <label className="mb-2 block text-sm font-medium text-rose-900">
                        Compartilhar pedido de oração por {project.title}
                      </label>
                      <textarea
                        className="min-h-[88px] w-full rounded-xl border border-rose-100 bg-white p-3 text-sm outline-none focus:border-rose-300"
                        onChange={(event) =>
                          setPrayerDrafts((current) => ({ ...current, [project.id]: event.target.value }))
                        }
                        placeholder="Ex: Ore por provisão, voluntários, sabedoria da coordenação e alcance das famílias atendidas."
                        value={prayerDrafts[project.id] ?? ''}
                      />
                      <div className="mt-3 flex justify-end">
                        <Button
                          className="gap-2"
                          isLoading={createPrayerRequest.isPending}
                          onClick={() => handleSubmitProjectPrayer(project.id)}
                          size="sm"
                        >
                          <Send className="h-4 w-4" />
                          Publicar pedido
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {(prayersByProject[project.id] ?? []).length === 0 ? (
                        <p className="text-sm text-gray-500">Nenhum pedido de oração ligado a este projeto ainda.</p>
                      ) : (
                        (prayersByProject[project.id] ?? []).map((request) => (
                          <div key={request.id} className="rounded-xl border border-rose-100 bg-white p-4">
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
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
