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
import { useCreateClass } from '../hooks/useEducation';
import type { CreateClassDTO } from '../../../services/ebd';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    tenantId: string;
}

export function CreateClassDialog({ isOpen, onClose, tenantId }: Props) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateClassDTO>();
    const createClass = useCreateClass(tenantId);

    const onSubmit = (data: CreateClassDTO) => {
        createClass.mutate({
            ...data,
            min_age: data.min_age ? Number(data.min_age) : undefined,
            max_age: data.max_age ? Number(data.max_age) : undefined,
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
                    <DialogTitle>Nova Classe de EBD</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label htmlFor="ebd-class-name" className="text-sm font-medium text-gray-700">Nome da Classe</label>
                        <Input
                            id="ebd-class-name"
                            {...register('name', { required: 'Nome é obrigatório' })}
                            placeholder="Ex: Jovens e Adolescentes"
                        />
                        {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="ebd-class-description" className="text-sm font-medium text-gray-700">Descrição</label>
                        <Input
                            id="ebd-class-description"
                            {...register('description')}
                            placeholder="Breve descrição da turma"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="ebd-class-min-age" className="text-sm font-medium text-gray-700">Idade Mín.</label>
                            <Input
                                id="ebd-class-min-age"
                                type="number"
                                {...register('min_age')}
                                placeholder="Ex: 12"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="ebd-class-max-age" className="text-sm font-medium text-gray-700">Idade Máx.</label>
                            <Input
                                id="ebd-class-max-age"
                                type="number"
                                {...register('max_age')}
                                placeholder="Ex: 18"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="ebd-class-location" className="text-sm font-medium text-gray-700">Local / Sala</label>
                        <Input
                            id="ebd-class-location"
                            {...register('location')}
                            placeholder="Ex: Sala 3 - Bloco B"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            isLoading={createClass.isPending}
                        >
                            Salvar Classe
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
