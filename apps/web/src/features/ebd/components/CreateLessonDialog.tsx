import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "../../../components/ui/dialog";
import { ebdService } from '../../../services/ebd';
import type { CreateLessonDTO } from '../../../services/ebd';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    classId: string;
}

export function CreateLessonDialog({ isOpen, onClose, classId }: Props) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateLessonDTO>();

    const createMutation = useMutation({
        mutationFn: (data: CreateLessonDTO) => ebdService.createLesson(classId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ebd-lessons', classId] });
            toast.success('Lição criada com sucesso!');
            reset();
            onClose();
        },
        onError: () => {
            toast.error('Erro ao criar lição.');
        }
    });

    const onSubmit = (data: CreateLessonDTO) => {
        createMutation.mutate(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Nova Lição</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Data</label>
                        <Input
                            type="date"
                            {...register('date', { required: 'Data é obrigatória' })}
                        />
                        {errors.date && <span className="text-xs text-red-500">{errors.date.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Tema</label>
                        <Input
                            {...register('topic', { required: 'Tema é obrigatório' })}
                            placeholder="Ex: A Parábola do Semeador"
                        />
                        {errors.topic && <span className="text-xs text-red-500">{errors.topic.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Referência Bíblica (opcional)</label>
                        <Input
                            {...register('bible_reference')}
                            placeholder="Ex: Mateus 13:1-23"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Descrição (opcional)</label>
                        <textarea
                            {...register('description')}
                            placeholder="Descrição ou resumo da lição"
                            className="flex min-h-[80px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Link do Material (opcional)</label>
                        <Input
                            {...register('homework_url')}
                            type="url"
                            placeholder="https://..."
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" isLoading={createMutation.isPending}>
                            Criar Lição
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
