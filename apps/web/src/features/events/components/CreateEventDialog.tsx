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
import { useCreateEvent } from '../hooks/useEvents';
import type { CreateEventDTO } from '../../../services/events';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    tenantId: string;
}

const EVENT_CATEGORIES = [
    { value: 'culto', label: 'Culto' },
    { value: 'reuniao', label: 'Reunião' },
    { value: 'evento_social', label: 'Evento Social' },
    { value: 'conferencia', label: 'Conferência' },
    { value: 'estudo', label: 'Estudo Bíblico' },
    { value: 'oracao', label: 'Reunião de Oração' },
    { value: 'outro', label: 'Outro' },
];

export function CreateEventDialog({ isOpen, onClose, tenantId }: Props) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateEventDTO>();
    const createEvent = useCreateEvent(tenantId);

    const onSubmit = (data: CreateEventDTO) => {
        createEvent.mutate(data, {
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
                    <DialogTitle>Novo Evento</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Título</label>
                        <Input
                            {...register('title', { required: 'Título é obrigatório' })}
                            placeholder="Ex: Culto Dominical"
                        />
                        {errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Data/Hora Início</label>
                            <Input
                                type="datetime-local"
                                {...register('start_date', { required: 'Data de início é obrigatória' })}
                            />
                            {errors.start_date && <span className="text-xs text-red-500">{errors.start_date.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Data/Hora Fim</label>
                            <Input
                                type="datetime-local"
                                {...register('end_date')}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Local</label>
                        <Input
                            {...register('location')}
                            placeholder="Ex: Templo Principal"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Categoria</label>
                        <select
                            {...register('category')}
                            className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <option value="">Selecione...</option>
                            {EVENT_CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Descrição</label>
                        <Input
                            {...register('description')}
                            placeholder="Detalhes do evento (opcional)"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="all_day"
                            {...register('all_day')}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor="all_day" className="text-sm text-gray-700">Dia inteiro</label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" isLoading={createEvent.isPending}>
                            Criar Evento
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
