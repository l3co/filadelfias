import { useMemo, useState } from 'react';
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
import { CreatableCombobox } from "../../../components/ui/creatable-combobox";
import type { ComboboxOption } from "../../../components/ui/creatable-combobox";
import { useCreateMissionary, useCountries, useCreateCountry } from '../hooks/useMissions';
import type { CreateMissionaryDTO } from '../../../services/missions';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    tenantId: string;
}

export function CreateMissionaryDialog({ isOpen, onClose, tenantId }: Props) {
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateMissionaryDTO>();
    const createMissionary = useCreateMissionary(tenantId);
    const { data: countries } = useCountries(tenantId);
    const createCountry = useCreateCountry(tenantId);
    const [selectedCountry, setSelectedCountry] = useState('');

    const countryOptions: ComboboxOption[] = useMemo(() => {
        if (!countries) return [];
        return countries.map(c => ({ value: c.code, label: c.name }));
    }, [countries]);

    const handleCreateCountry = async (name: string): Promise<ComboboxOption> => {
        const code = name.substring(0, 3).toUpperCase();
        const result = await createCountry.mutateAsync({ code, name });
        return { value: result.code, label: result.name };
    };

    const handleCountryChange = (value: string) => {
        setSelectedCountry(value);
        setValue('country_code', value);
    };

    const onSubmit = (data: CreateMissionaryDTO) => {
        createMissionary.mutate(data, {
            onSuccess: () => {
                reset();
                setSelectedCountry('');
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

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">País</label>
                        <input type="hidden" {...register('country_code', { required: 'País é obrigatório' })} />
                        <CreatableCombobox
                            options={countryOptions}
                            value={selectedCountry}
                            onChange={handleCountryChange}
                            onCreateNew={handleCreateCountry}
                            placeholder="Digite para buscar ou criar..."
                            searchPlaceholder="Buscar país..."
                            emptyMessage="Nenhum país encontrado."
                            createMessage="Criar país"
                        />
                        {errors.country_code && <span className="text-xs text-red-500">{errors.country_code.message}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Estado/Região</label>
                            <Input
                                {...register('state')}
                                placeholder="Ex: Amazonas"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Cidade</label>
                            <Input
                                {...register('city')}
                                placeholder="Ex: Manaus"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Campo Missionário</label>
                        <Input
                            {...register('field_name', { required: 'Campo é obrigatório' })}
                            placeholder="Ex: Amazônia, Sertão Nordestino"
                        />
                        {errors.field_name && <span className="text-xs text-red-500">{errors.field_name.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Biografia</label>
                        <Input
                            {...register('bio')}
                            placeholder="Breve descrição do trabalho missionário"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Foto (URL opcional)</label>
                        <Input
                            {...register('photo_url')}
                            type="url"
                            placeholder="https://..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Link da Newsletter (opcional)</label>
                        <Input
                            {...register('newsletter_url')}
                            type="url"
                            placeholder="https://..."
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
