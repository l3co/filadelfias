import { useState } from 'react';
import { Plus, Globe } from 'lucide-react';
import { useAuthTenant } from '../../contexts/AuthContext';
import { useMissions, useDeleteMissionary } from '../../features/missions/hooks/useMissions';
import { MissionaryList } from '../../features/missions/components/MissionaryList';
import { CreateMissionaryDialog } from '../../features/missions/components/CreateMissionaryDialog';
import { Button } from '../../components/ui/button';
import { PageHeaderWithIcon } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';

export function MissionsPage() {
    const tenant = useAuthTenant();
    const { data: missionaries, isLoading } = useMissions(tenant?.id);
    const deleteMissionary = useDeleteMissionary(tenant?.id);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleDelete = (missionaryId: string) => {
        deleteMissionary.mutate(missionaryId);
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
                    <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                        <Plus size={16} /> Novo Missionário
                    </Button>
                }
            />

            <MissionaryList 
                missionaries={missionaries} 
                isLoading={isLoading} 
                onDelete={handleDelete}
            />

            <CreateMissionaryDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                tenantId={tenant.id}
            />
        </div>
    );
}
