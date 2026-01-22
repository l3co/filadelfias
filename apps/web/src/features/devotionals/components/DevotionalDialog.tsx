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
import { useCreateDevotional, useUpdateDevotional } from '../hooks/useDevotionals';
import type { Devotional, CreateDevotionalDTO } from '../../../services/devotionals';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    tenantId: string;
    devotional?: Devotional | null;
}

export function DevotionalDialog({ isOpen, onClose, tenantId, devotional }: Props) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateDevotionalDTO>();
    const createDevotional = useCreateDevotional(tenantId);
    const updateDevotional = useUpdateDevotional(tenantId);
    
    const isEditing = !!devotional;

    useEffect(() => {
        if (devotional) {
            reset({
                title: devotional.title,
                date: devotional.date,
                verse_reference: devotional.verse_reference,
                verse_text: devotional.verse_text,
                meditation: devotional.meditation,
                reflection: devotional.reflection || '',
                prayer: devotional.prayer || '',
                author: devotional.author || '',
            });
        } else {
            reset({
                title: '',
                date: new Date().toISOString().split('T')[0],
                verse_reference: '',
                verse_text: '',
                meditation: '',
                reflection: '',
                prayer: '',
                author: '',
            });
        }
    }, [devotional, reset]);

    const onSubmit = (data: CreateDevotionalDTO) => {
        if (isEditing) {
            updateDevotional.mutate({ id: devotional.id, data }, {
                onSuccess: () => {
                    reset();
                    onClose();
                }
            });
        } else {
            createDevotional.mutate(data, {
                onSuccess: () => {
                    reset();
                    onClose();
                }
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Devocional' : 'Novo Devocional'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Título</label>
                            <Input
                                {...register('title', { required: 'Título é obrigatório' })}
                                placeholder="Ex: A Graça de Deus"
                            />
                            {errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Data</label>
                            <Input
                                type="date"
                                {...register('date', { required: 'Data é obrigatória' })}
                            />
                            {errors.date && <span className="text-xs text-red-500">{errors.date.message}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Referência Bíblica</label>
                            <Input
                                {...register('verse_reference', { required: 'Referência é obrigatória' })}
                                placeholder="Ex: João 3:16"
                            />
                            {errors.verse_reference && <span className="text-xs text-red-500">{errors.verse_reference.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Autor (opcional)</label>
                            <Input
                                {...register('author')}
                                placeholder="Ex: Pastor João"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Texto do Versículo</label>
                        <textarea
                            {...register('verse_text', { required: 'Texto do versículo é obrigatório' })}
                            placeholder="Digite o texto do versículo..."
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                        {errors.verse_text && <span className="text-xs text-red-500">{errors.verse_text.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Meditação</label>
                        <textarea
                            {...register('meditation', { required: 'Meditação é obrigatória' })}
                            placeholder="Escreva a meditação do dia..."
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                        {errors.meditation && <span className="text-xs text-red-500">{errors.meditation.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Reflexão (opcional)</label>
                        <textarea
                            {...register('reflection')}
                            placeholder="Perguntas para reflexão..."
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Oração (opcional)</label>
                        <textarea
                            {...register('prayer')}
                            placeholder="Sugestão de oração..."
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            isLoading={createDevotional.isPending || updateDevotional.isPending}
                        >
                            {isEditing ? 'Salvar Alterações' : 'Criar Devocional'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
