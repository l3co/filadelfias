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
import { useCreateMissionary } from '../hooks/useMissions';
import type { CreateMissionaryDTO } from '../../../services/missions';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    tenantId: string;
}

export function CreateMissionaryDialog({ isOpen, onClose, tenantId }: Props) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateMissionaryDTO>();
    const createMissionary = useCreateMissionary(tenantId);

    const onSubmit = (data: CreateMissionaryDTO) => {
        createMissionary.mutate({
            ...data,
            latitude: Number(data.latitude),
            longitude: Number(data.longitude)
        }, {
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
                    <DialogTitle>Novo Missionário</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Nome</label>
                        <Input
                            {...register('name', { required: 'Nome é obrigatório' })}
                            placeholder="Nome do missionário ou projeto"
                        />
                        {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Campo</label>
                            <Input
                                {...register('field_name', { required: 'Campo é obrigatório' })}
                                placeholder="Ex: Sertão"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">País (ISO)</label>
                            <Input
                                {...register('country_code', { required: 'País é obrigatório', maxLength: 2 })}
                                placeholder="BR"
                                className="uppercase"
                                onChange={(e) => {
                                    e.target.value = e.target.value.toUpperCase();
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Latitude</label>
                            <Input
                                type="number"
                                step="any"
                                {...register('latitude', { value: 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Longitude</label>
                            <Input
                                type="number"
                                step="any"
                                {...register('longitude', { value: 0 })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Biografia</label>
                        <Input
                            {...register('bio')}
                            placeholder="Breve descrição"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            isLoading={createMissionary.isPending}
                        >
                            Salvar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
