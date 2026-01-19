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
import { useCreateCouncil } from '../hooks/useGovernance';
import type { CreateCouncilDTO } from '../../../services/governance';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    tenantId: string;
}

export function CreateCouncilDialog({ isOpen, onClose, tenantId }: Props) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateCouncilDTO>();
    const createCouncil = useCreateCouncil(tenantId);

    const onSubmit = (data: CreateCouncilDTO) => {
        createCouncil.mutate(data, {
            onSuccess: () => {
                reset();
                onClose();
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Novo Órgão Governamental</DialogTitle>
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
                            defaultValue="SESSION"
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
                            isLoading={createCouncil.isPending}
                        >
                            Criar Órgão
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
