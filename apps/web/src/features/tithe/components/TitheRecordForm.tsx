import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import type { CreateTitheRecordDTO, TitheType } from '../../../services/tithe';

interface TitheRecordFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateTitheRecordDTO) => void;
    isLoading?: boolean;
}

export function TitheRecordForm({
    isOpen,
    onClose,
    onSubmit,
    isLoading
}: TitheRecordFormProps) {
    const { register, handleSubmit, reset } = useForm<CreateTitheRecordDTO>();
    const [selectedType, setSelectedType] = useState<TitheType>('DIZIMO');

    if (!isOpen) return null;

    const onFormSubmit = (data: CreateTitheRecordDTO) => {
        onSubmit({
            ...data,
            type: selectedType,
            amount: Number(data.amount),
        });
        reset();
        setSelectedType('DIZIMO');
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4">
                    <CardTitle className="text-green-600">
                        Registrar Dízimo/Oferta
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Tipo</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedType('DIZIMO')}
                                    className={`flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                                        selectedType === 'DIZIMO'
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    Dízimo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedType('OFERTA')}
                                    className={`flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                                        selectedType === 'OFERTA'
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    Oferta
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="amount" className="text-sm font-medium text-gray-700">Valor (R$)</label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    {...register('amount', { required: true })}
                                    placeholder="0,00"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="date" className="text-sm font-medium text-gray-700">Data</label>
                                <Input
                                    id="date"
                                    type="date"
                                    {...register('date', { required: true })}
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="notes" className="text-sm font-medium text-gray-700">Observações (opcional)</label>
                            <textarea
                                id="notes"
                                {...register('notes')}
                                placeholder="Ex: Referente ao mês de janeiro"
                                className="flex min-h-[80px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                Enviar para Aprovação
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
