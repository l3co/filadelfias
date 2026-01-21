import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "../../../components/ui/dialog";
import { useUpdateCouncil } from '../hooks/useGovernance';
import type { Council, CreateCouncilDTO } from '../../../services/governance';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    tenantId: string;
    council: Council | null;
}

export function EditCouncilDialog({ isOpen, onClose, tenantId, council }: Props) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateCouncilDTO>();
    const updateCouncil = useUpdateCouncil(tenantId);

    useEffect(() => {
        if (council) {
            reset({
                name: council.name,
                type: council.type,
                description: council.description || '',
            });
        }
    }, [council, reset]);

    const onSubmit = (data: CreateCouncilDTO) => {
        if (!council) return;
        updateCouncil.mutate({ councilId: council.id, data }, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar Órgão Governamental</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Nome</label>
                        <Input
                            {...register('name', { required: 'Nome é obrigatório' })}
                            placeholder="Ex: Conselho da Igreja"
                        />
                        {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Tipo</label>
                        <select
                            {...register('type')}
                            className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <option value="SESSION">Conselho (Presbíteros)</option>
                            <option value="DEACONS">Junta Diaconal</option>
                            <option value="ASSEMBLY">Assembleia</option>
                            <option value="COMMITTEE">Comissão Temporária</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Descrição</label>
                        <Input
                            {...register('description')}
                            placeholder="Opcional. Propósito deste órgão."
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            isLoading={updateCouncil.isPending}
                        >
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
