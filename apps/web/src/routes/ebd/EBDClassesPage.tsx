import { useState } from 'react';
import { Plus, GraduationCap } from 'lucide-react';
import { useCurrentTenant } from '../../hooks/useAuth';
import { useEducation } from '../../features/ebd/hooks/useEducation';
import { ClassList } from '../../features/ebd/components/ClassList';
import { CreateClassDialog } from '../../features/ebd/components/CreateClassDialog';
import { Button } from '../../components/ui/button';
import { PageHeaderWithIcon } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';

export function EBDClassesPage() {
    const tenant = useCurrentTenant();
    const { data: classes, isLoading } = useEducation(tenant?.id);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    if (!tenant) {
        return (
            <EmptyState
                icon={GraduationCap}
                title="Selecione uma organização"
                description="Você precisa estar vinculado a uma igreja."
            />
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeaderWithIcon
                icon={GraduationCap}
                iconColor="blue"
                title="EBD"
                description="Escola Bíblica Dominical - Turmas e Alunos"
                actions={
                    <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                        <Plus size={16} /> Nova Turma
                    </Button>
                }
            />

            <ClassList classes={classes} isLoading={isLoading} />

            <CreateClassDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                tenantId={tenant.id}
            />
        </div>
    );
}
