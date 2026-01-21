import { useState } from 'react';
import { Plus, Globe } from 'lucide-react';
import { useCurrentTenant } from '../../hooks/useAuth';
import { useMissions } from '../../features/missions/hooks/useMissions';
import { MissionaryList } from '../../features/missions/components/MissionaryList';
import { CreateMissionaryDialog } from '../../features/missions/components/CreateMissionaryDialog';
import { Button } from '../../components/ui/button';
import { PageHeaderWithIcon } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';

export function MissionsPage() {
    const tenant = useCurrentTenant();
    const { data: missionaries, isLoading } = useMissions(tenant?.id);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

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

            <MissionaryList missionaries={missionaries} isLoading={isLoading} />

            <CreateMissionaryDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                tenantId={tenant.id}
            />
        </div>
    );
}
