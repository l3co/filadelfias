import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCurrentTenant } from '../../hooks/useAuth';
import { useMembers } from '../../features/members/hooks/useMembers';
import { MembersTable } from '../../features/members/components/MembersTable';
import { CreateMemberDialog } from '../../features/members/components/CreateMemberDialog';
import { Button } from '../../components/ui/button';

export function MembersPage() {
    const tenant = useCurrentTenant();
    const { data: members, isLoading } = useMembers(tenant?.id);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    if (!tenant) {
        return (
            <div className="p-12 text-center bg-white rounded-lg shadow border border-gray-100">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                    <span className="text-2xl">⚠️</span>
                </div>
                <h2 className="text-lg font-medium text-gray-900">Nenhuma igreja vinculada</h2>
                <p className="text-gray-500 mt-2">Sua conta não está vinculada a nenhuma igreja.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Membros</h1>
                    <p className="text-muted-foreground text-gray-500 mt-1">
                        Gerencie a membresia da {tenant.name}.
                    </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Membro
                </Button>
            </div>

            <MembersTable members={members} isLoading={isLoading} />

            <CreateMemberDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                tenantId={tenant.id}
            />
        </div>
    );
}
