import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCurrentTenant } from '../../hooks/useAuth';
import { useEducation } from '../../features/ebd/hooks/useEducation';
import { ClassList } from '../../features/ebd/components/ClassList';
import { CreateClassDialog } from '../../features/ebd/components/CreateClassDialog';
import { Button } from '../../components/ui/button';

export function EBDClassesPage() {
    const tenant = useCurrentTenant();
    const { data: classes, isLoading } = useEducation(tenant?.id);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    if (!tenant) return <div>Selecione uma organização.</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Educação Cristã (EBD)</h1>
                    <p className="text-muted-foreground text-gray-500 mt-1">
                        Gestão de classes e ensino bíblico.
                    </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Plus size={16} /> Nova Classe
                </Button>
            </div>

            <ClassList classes={classes} isLoading={isLoading} />

            <CreateClassDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                tenantId={tenant.id}
            />
        </div>
    );
}
