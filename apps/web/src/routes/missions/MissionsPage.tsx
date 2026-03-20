import { useMemo, useState } from 'react';
import { Plus, Globe, HandHeart, Heart, MapPinned, Mail, Clock3 } from 'lucide-react';
import { useAuthTenant } from '../../contexts/AuthContext';
import {
  useCreateSocialProject,
  useDeleteMissionary,
  useDeleteSocialProject,
  useMissions,
  useSocialProjects,
  useUpdateSocialProject,
} from '../../features/missions/hooks/useMissions';
import { usePrayerRequests } from '../../features/prayer/hooks/usePrayer';
import { MissionaryList } from '../../features/missions/components/MissionaryList';
import { CreateMissionaryDialog } from '../../features/missions/components/CreateMissionaryDialog';
import { CreateSocialProjectDialog } from '../../features/missions/components/CreateSocialProjectDialog';
import { SocialProjectList } from '../../features/missions/components/SocialProjectList';
import { Button } from '../../components/ui/button';
import { PageHeaderWithIcon } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { formatDateBR } from '../../lib/formatters';
import type { CreateSocialProjectDTO, Missionary, SocialProject } from '../../services/missions';

export function MissionsPage() {
    const tenant = useAuthTenant();
    const { data: missionaries, isLoading } = useMissions(tenant?.id);
    const { data: socialProjects, isLoading: isLoadingProjects } = useSocialProjects(tenant?.id);
    const { data: prayerRequests, isLoading: isLoadingPrayerRequests } = usePrayerRequests(tenant?.id);
    const deleteMissionary = useDeleteMissionary(tenant?.id);
    const createSocialProject = useCreateSocialProject(tenant?.id);
    const updateSocialProject = useUpdateSocialProject(tenant?.id);
    const deleteSocialProject = useDeleteSocialProject(tenant?.id);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSocialProjectDialogOpen, setIsSocialProjectDialogOpen] = useState(false);
    const [editingMissionary, setEditingMissionary] = useState<Missionary | null>(null);
    const [editingSocialProject, setEditingSocialProject] = useState<SocialProject | null>(null);
    const missionaryCount = missionaries?.length ?? 0;
    const countryCount = new Set((missionaries ?? []).map((missionary) => missionary.country_code)).size;
    const newsletterCount = (missionaries ?? []).filter((missionary) => missionary.newsletter_url).length;
    const socialProjectCount = socialProjects?.length ?? 0;
    const activeSocialProjectCount = (socialProjects ?? []).filter((project) => project.status === 'ACTIVE').length;
    const linkedMissionPrayerCount = (prayerRequests ?? []).filter((request) => !!request.missionary_id).length;
    const linkedProjectPrayerCount = (prayerRequests ?? []).filter((request) => !!request.social_project_id).length;
    const totalPrayerCount = prayerRequests?.length ?? 0;
    const totalPrayerEngagement = (prayerRequests ?? []).reduce((total, request) => total + request.prayer_count, 0);

    const missionaryNameById = useMemo(
        () =>
            Object.fromEntries((missionaries ?? []).map((missionary) => [missionary.id, missionary.name])),
        [missionaries],
    );

    const socialProjectNameById = useMemo(
        () =>
            Object.fromEntries((socialProjects ?? []).map((project) => [project.id, project.title])),
        [socialProjects],
    );

    const recentLinkedPrayerRequests = useMemo(
        () =>
            (prayerRequests ?? [])
                .filter((request) => request.missionary_id || request.social_project_id)
                .slice(0, 5),
        [prayerRequests],
    );

    const handleDelete = (missionaryId: string) => {
        deleteMissionary.mutate(missionaryId);
    };

    const handleCreate = () => {
        setEditingMissionary(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (missionary: Missionary) => {
        setEditingMissionary(missionary);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingMissionary(null);
    };

    const handleCreateSocialProject = (data: CreateSocialProjectDTO) => {
        if (editingSocialProject) {
            updateSocialProject.mutate(
                { projectId: editingSocialProject.id, data },
                { onSuccess: () => {
                    setEditingSocialProject(null);
                    setIsSocialProjectDialogOpen(false);
                } },
            );
            return;
        }

        createSocialProject.mutate(data, {
            onSuccess: () => {
                setEditingSocialProject(null);
                setIsSocialProjectDialogOpen(false);
            },
        });
    };

    const handleEditSocialProject = (project: SocialProject) => {
        setEditingSocialProject(project);
        setIsSocialProjectDialogOpen(true);
    };

    const handleCloseSocialProjectDialog = () => {
        setEditingSocialProject(null);
        setIsSocialProjectDialogOpen(false);
    };

    if (!tenant) {
        return (
            <EmptyState
                icon={Globe}
                title="Selecione uma organização"
                description="Você precisa estar vinculado a uma igreja."
            />
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeaderWithIcon
                icon={Globe}
                iconColor="orange"
                title="Missões"
                description={`Acompanhe os missionários e projetos apoiados pela ${tenant.name}`}
                actions={
                    <Button onClick={handleCreate} className="gap-2">
                        <Plus size={16} /> Novo Missionário
                    </Button>
                }
            />

            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
                <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
                    <div className="mb-2 flex items-center gap-2 text-orange-700">
                        <Globe size={16} />
                        <span className="text-sm font-medium">Missionários</span>
                    </div>
                    <p className="text-2xl font-semibold text-orange-950">{missionaryCount}</p>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                    <div className="mb-2 flex items-center gap-2 text-blue-700">
                        <MapPinned size={16} />
                        <span className="text-sm font-medium">Países alcançados</span>
                    </div>
                    <p className="text-2xl font-semibold text-blue-950">{countryCount}</p>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                    <div className="mb-2 flex items-center gap-2 text-emerald-700">
                        <Mail size={16} />
                        <span className="text-sm font-medium">Newsletters ativas</span>
                    </div>
                    <p className="text-2xl font-semibold text-emerald-950">{newsletterCount}</p>
                </div>

                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
                    <div className="mb-2 flex items-center gap-2 text-rose-700">
                        <HandHeart size={16} />
                        <span className="text-sm font-medium">Projetos sociais</span>
                    </div>
                    <p className="text-2xl font-semibold text-rose-950">{socialProjectCount}</p>
                    <p className="text-xs text-rose-600">{activeSocialProjectCount} em andamento</p>
                </div>

                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                    <div className="mb-2 flex items-center gap-2 text-indigo-700">
                        <Heart size={16} />
                        <span className="text-sm font-medium">Orações ligadas</span>
                    </div>
                    <p className="text-2xl font-semibold text-indigo-950">{totalPrayerCount}</p>
                    <p className="text-xs text-indigo-600">
                        {linkedMissionPrayerCount} missões • {linkedProjectPrayerCount} projetos
                    </p>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                    <div className="mb-2 flex items-center gap-2 text-amber-700">
                        <Clock3 size={16} />
                        <span className="text-sm font-medium">Engajamento</span>
                    </div>
                    <p className="text-2xl font-semibold text-amber-950">{totalPrayerEngagement}</p>
                    <p className="text-xs text-amber-600">orações registradas</p>
                </div>
            </div>

            <section className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-indigo-700">
                    <Heart size={18} />
                    <span className="text-sm font-semibold uppercase tracking-wide">Painel de Oração</span>
                </div>

                {isLoadingPrayerRequests ? (
                    <p className="text-sm text-gray-500">Carregando pedidos recentes...</p>
                ) : recentLinkedPrayerRequests.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        Ainda não existem pedidos de oração vinculados a missionários ou projetos sociais.
                    </p>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {recentLinkedPrayerRequests.map((request) => {
                            const linkedLabel = request.missionary_id
                                ? missionaryNameById[request.missionary_id] || 'Missão vinculada'
                                : socialProjectNameById[request.social_project_id ?? ''] || 'Projeto social vinculado';
                            const linkedType = request.missionary_id ? 'Missionário' : 'Projeto social';

                            return (
                                <article key={request.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{linkedLabel}</p>
                                            <p className="mt-1 text-xs uppercase tracking-wide text-indigo-600">{linkedType}</p>
                                        </div>
                                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-500">
                                            {request.prayer_count} oração(ões)
                                        </span>
                                    </div>

                                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600">
                                        {request.content}
                                    </p>

                                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                                        <span>{request.author_name}</span>
                                        <span>{formatDateBR(request.created_at)}</span>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            <MissionaryList 
                missionaries={missionaries} 
                isLoading={isLoading} 
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <section className="space-y-4 rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 to-orange-50 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-rose-700">
                            <HandHeart size={18} />
                            <span className="text-sm font-semibold uppercase tracking-wide">Projetos Sociais</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {socialProjectCount} projeto(s) social(is) cadastrado(s)
                        </h2>
                        <p className="text-sm text-gray-600">
                            Organize frentes de ação social da igreja com status, público-alvo e coordenação.
                        </p>
                    </div>

                    <Button className="gap-2" onClick={() => {
                        setEditingSocialProject(null);
                        setIsSocialProjectDialogOpen(true);
                    }}>
                        <Plus size={16} />
                        Novo Projeto Social
                    </Button>
                </div>

                <SocialProjectList
                    isDeleting={deleteSocialProject.isPending}
                    isLoading={isLoadingProjects}
                    onEdit={handleEditSocialProject}
                    onDelete={(projectId) => deleteSocialProject.mutate(projectId)}
                    projects={socialProjects}
                />
            </section>

            <CreateMissionaryDialog
                isOpen={isDialogOpen}
                initialData={editingMissionary}
                onClose={handleCloseDialog}
                tenantId={tenant.id}
            />

            <CreateSocialProjectDialog
                initialData={editingSocialProject}
                isOpen={isSocialProjectDialogOpen}
                isSubmitting={createSocialProject.isPending || updateSocialProject.isPending}
                onClose={handleCloseSocialProjectDialog}
                onSubmit={handleCreateSocialProject}
            />
        </div>
    );
}
