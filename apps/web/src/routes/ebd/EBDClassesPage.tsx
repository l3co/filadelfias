import { useState } from 'react';
import { Plus, GraduationCap } from 'lucide-react';
import { useCurrentTenant } from '../../hooks/useAuth';
import { useEducation } from '../../features/ebd/hooks/useEducation';
import { ClassList } from '../../features/ebd/components/ClassList';
import { CreateClassDialog } from '../../features/ebd/components/CreateClassDialog';
import { Button } from '../../components/ui/button';

export function EBDClassesPage() {
    const tenant = useCurrentTenant();
    const { data: classes, isLoading } = useEducation(tenant?.id);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    if (!tenant) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                    <GraduationCap className="h-8 w-8 text-amber-600" />
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
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100">
                        <GraduationCap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#002333]">Educação Cristã</h1>
                        <p className="text-gray-500 mt-0.5">
                            Gestão de classes e ensino bíblico (EBD)
                        </p>
                    </div>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
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
