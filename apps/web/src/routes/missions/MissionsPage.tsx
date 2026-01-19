import { useState } from 'react';
import { Plus, Globe } from 'lucide-react';
import { useCurrentTenant } from '../../hooks/useAuth';
import { useMissions } from '../../features/missions/hooks/useMissions';
import { MissionaryList } from '../../features/missions/components/MissionaryList';
import { CreateMissionaryDialog } from '../../features/missions/components/CreateMissionaryDialog';
import { Button } from '../../components/ui/button';

export function MissionsPage() {
    const tenant = useCurrentTenant();
    const { data: missionaries, isLoading } = useMissions(tenant?.id);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    if (!tenant) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                    <Globe className="h-8 w-8 text-amber-600" />
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
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100">
                        <Globe className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#002333]">Missões</h1>
                        <p className="text-gray-500 mt-0.5">
                            Acompanhe os missionários e projetos apoiados pela {tenant.name}
                        </p>
                    </div>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                    <Plus size={16} /> Novo Missionário
                </Button>
            </div>

            <MissionaryList missionaries={missionaries} isLoading={isLoading} />

            <CreateMissionaryDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                tenantId={tenant.id}
            />
        </div>
    );
}
