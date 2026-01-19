import { useState } from 'react';
import { Plus, Gavel } from 'lucide-react';
import { useCurrentTenant } from '../../hooks/useAuth';
import { useGovernance } from '../../features/governance/hooks/useGovernance';
import { CouncilList } from '../../features/governance/components/CouncilList';
import { CreateCouncilDialog } from '../../features/governance/components/CreateCouncilDialog';
import { Button } from '../../components/ui/button';

export function CouncilsPage() {
    const tenant = useCurrentTenant();
    const { data: councils, isLoading } = useGovernance(tenant?.id);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    if (!tenant) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                    <Gavel className="h-8 w-8 text-amber-600" />
                </div>
                <h2 className="text-lg font-semibold text-[#002333]">Selecione uma organização</h2>
                <p className="text-gray-500 mt-2">Você precisa estar vinculado a uma igreja.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100">
                        <Gavel className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#002333]">Governança</h1>
                        <p className="text-gray-500 mt-0.5">
                            Gestão dos órgãos oficiais da {tenant.name}
                        </p>
                    </div>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
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
