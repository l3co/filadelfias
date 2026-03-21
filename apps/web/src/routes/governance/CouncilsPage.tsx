import { Suspense, startTransition, useOptimistic, useState } from 'react';
import { Plus, Gavel } from 'lucide-react';
import { useAuthTenant } from '../../contexts/AuthContext';
import { useGovernance, useDeleteCouncil } from '../../features/governance/hooks/useGovernance';
import { usePermissions } from '../../hooks/usePermissions';
import { CouncilsPageClient } from '../../features/governance/client/CouncilsPageClient';
import { GovernanceSummary } from '../../features/governance/client/GovernanceSummary';
import { CreateCouncilDialog } from '../../features/governance/components/CreateCouncilDialog';
import { EditCouncilDialog } from '../../features/governance/components/EditCouncilDialog';
import { Button } from '../../components/ui/button';
import { PermissionGate, AccessDenied } from '../../components/PermissionGate';
import { PageHeaderWithIcon } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import type { Council } from '../../services/governance';

export function CouncilsPage() {
    const tenant = useAuthTenant();
    const { data: councils, dataUpdatedAt, isLoading } = useGovernance(tenant?.id);
    const deleteCouncil = useDeleteCouncil(tenant?.id);
    const { canViewGovernance } = usePermissions();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCouncil, setEditingCouncil] = useState<Council | null>(null);
    const [pendingDeleteCouncilIds, updatePendingDeleteCouncilIds] = useOptimistic<
        string[],
        { councilId: string; type: 'start' | 'finish' }
    >([], (currentState, action) => (
        action.type === 'start'
            ? currentState.includes(action.councilId)
                ? currentState
                : [...currentState, action.councilId]
            : currentState.filter((councilId) => councilId !== action.councilId)
    ));
    const optimisticCouncils = (councils ?? []).filter(
        (council) => !pendingDeleteCouncilIds.includes(council.id),
    );

    const handleDelete = async (councilId: string) => {
        startTransition(() => {
            updatePendingDeleteCouncilIds({ councilId, type: 'start' });
        });

        try {
            await deleteCouncil.mutateAsync(councilId);
        } finally {
            startTransition(() => {
                updatePendingDeleteCouncilIds({ councilId, type: 'finish' });
            });
        }
    };

    const handleEdit = (council: Council) => {
        setEditingCouncil(council);
    };

    if (!tenant) {
        return (
            <EmptyState
                icon={Gavel}
                title="Selecione uma organização"
                description="Você precisa estar vinculado a uma igreja."
            />
        );
    }

    if (!canViewGovernance) {
        return <AccessDenied resource="governance" />;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeaderWithIcon
                icon={Gavel}
                iconColor="purple"
                title="Governança"
                description={`Gestão dos órgãos oficiais da ${tenant.name}`}
                actions={
                    <PermissionGate resource="governance" action="create">
                        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                            <Plus size={16} /> Novo Órgão
                        </Button>
                    </PermissionGate>
                }
            />

            <Suspense
                fallback={
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="h-28 rounded-2xl bg-slate-100" />
                        <div className="h-28 rounded-2xl bg-slate-100" />
                        <div className="h-28 rounded-2xl bg-slate-100" />
                    </div>
                }
            >
                <GovernanceSummary tenantId={tenant.id} refreshKey={String(dataUpdatedAt)} />
            </Suspense>

            <CouncilsPageClient
                councils={optimisticCouncils}
                isDeleting={deleteCouncil.isPending}
                isLoading={isLoading}
                onDelete={handleDelete}
                onEdit={handleEdit}
            />

            <CreateCouncilDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                tenantId={tenant.id}
            />

            <EditCouncilDialog
                isOpen={!!editingCouncil}
                onClose={() => setEditingCouncil(null)}
                tenantId={tenant.id}
                council={editingCouncil}
            />
        </div>
    );
}
