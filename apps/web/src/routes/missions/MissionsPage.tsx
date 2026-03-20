import { useState } from 'react';
import { Plus, Globe, MapPinned, Mail } from 'lucide-react';
import { useAuthTenant } from '../../contexts/AuthContext';
import { useMissions, useDeleteMissionary } from '../../features/missions/hooks/useMissions';
import { MissionaryList } from '../../features/missions/components/MissionaryList';
import { CreateMissionaryDialog } from '../../features/missions/components/CreateMissionaryDialog';
import { Button } from '../../components/ui/button';
import { PageHeaderWithIcon } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import type { Missionary } from '../../services/missions';

export function MissionsPage() {
    const tenant = useAuthTenant();
    const { data: missionaries, isLoading } = useMissions(tenant?.id);
    const deleteMissionary = useDeleteMissionary(tenant?.id);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMissionary, setEditingMissionary] = useState<Missionary | null>(null);
    const missionaryCount = missionaries?.length ?? 0;
    const countryCount = new Set((missionaries ?? []).map((missionary) => missionary.country_code)).size;
    const newsletterCount = (missionaries ?? []).filter((missionary) => missionary.newsletter_url).length;

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

            <div className="grid gap-4 md:grid-cols-3">
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
            </div>

            <MissionaryList 
                missionaries={missionaries} 
                isLoading={isLoading} 
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <CreateMissionaryDialog
                isOpen={isDialogOpen}
                initialData={editingMissionary}
                onClose={handleCloseDialog}
                tenantId={tenant.id}
            />
        </div>
    );
}
