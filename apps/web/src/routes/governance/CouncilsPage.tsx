import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCurrentTenant } from '../../hooks/useAuth';
import { useGovernance } from '../../features/governance/hooks/useGovernance';
import { CouncilList } from '../../features/governance/components/CouncilList';
import { CreateCouncilDialog } from '../../features/governance/components/CreateCouncilDialog';
import { Button } from '../../components/ui/button';

export function CouncilsPage() {
    const tenant = useCurrentTenant();
    const { data: councils, isLoading } = useGovernance(tenant?.id);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    if (!tenant) return <div>Selecione uma organização.</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Governo e Liderança</h1>
                    <p className="text-muted-foreground text-gray-500 mt-1">
                        Gestão dos órgãos oficiais da {tenant.name}.
                    </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Plus size={16} /> Novo Órgão
                </Button>
            </div>

            <CouncilList councils={councils} isLoading={isLoading} />

            <CreateCouncilDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                tenantId={tenant.id}
            />
        </div>
    );
}
