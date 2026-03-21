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
    tenantId: string;
}

export function CreateLessonDialog({ isOpen, onClose, classId, tenantId }: Props) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateLessonDTO>();

    const createMutation = useMutation({
        mutationFn: (data: CreateLessonDTO) => ebdService.createLesson(classId, data, tenantId),
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
                        <label htmlFor="ebd-lesson-date" className="text-sm font-medium text-gray-700">Data</label>
                        <Input
                            id="ebd-lesson-date"
                            type="date"
                            {...register('date', { required: 'Data é obrigatória' })}
                        />
                        {errors.date && <span className="text-xs text-red-500">{errors.date.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="ebd-lesson-topic" className="text-sm font-medium text-gray-700">Tema</label>
                        <Input
                            id="ebd-lesson-topic"
                            {...register('topic', { required: 'Tema é obrigatório' })}
                            placeholder="Ex: A Parábola do Semeador"
                        />
                        {errors.topic && <span className="text-xs text-red-500">{errors.topic.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="ebd-lesson-bible-reference" className="text-sm font-medium text-gray-700">Referência Bíblica (opcional)</label>
                        <Input
                            id="ebd-lesson-bible-reference"
                            {...register('bible_reference')}
                            placeholder="Ex: Mateus 13:1-23"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="ebd-lesson-description" className="text-sm font-medium text-gray-700">Descrição (opcional)</label>
                        <textarea
                            id="ebd-lesson-description"
                            {...register('description')}
                            placeholder="Descrição ou resumo da lição"
                            className="flex min-h-[80px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="ebd-lesson-homework-url" className="text-sm font-medium text-gray-700">Link do Material (opcional)</label>
                        <Input
                            id="ebd-lesson-homework-url"
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
