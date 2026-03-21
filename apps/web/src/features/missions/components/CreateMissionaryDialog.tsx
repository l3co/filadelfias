import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "../../../components/ui/dialog";
import { CreatableCombobox } from "../../../components/ui/creatable-combobox";
import type { ComboboxOption } from "../../../components/ui/creatable-combobox";
import { useCreateMissionary, useCountries, useCreateCountry, useUpdateMissionary } from '../hooks/useMissions';
import type { CreateMissionaryDTO, Missionary } from '../../../services/missions';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    tenantId: string;
    initialData?: Missionary | null;
}

export function CreateMissionaryDialog({ isOpen, onClose, tenantId, initialData }: Props) {
    const { control, register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateMissionaryDTO>();
    const createMissionary = useCreateMissionary(tenantId);
    const updateMissionary = useUpdateMissionary(tenantId);
    const { data: countries } = useCountries(tenantId);
    const createCountry = useCreateCountry(tenantId);
    const selectedCountry = useWatch({ control, name: 'country_code' }) ?? '';

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
        setValue('country_code', value);
    };

    const onSubmit = (data: CreateMissionaryDTO) => {
        const onSuccess = () => {
            reset();
            onClose();
        };

        if (initialData?.id) {
            updateMissionary.mutate({ missionaryId: initialData.id, data }, {
                onSuccess,
            });
            return;
        }

        createMissionary.mutate(data, {
            onSuccess: () => {
                onSuccess();
            }
        });
    };

    useEffect(() => {
        if (!isOpen) return;

        reset({
            name: initialData?.name ?? '',
            field_name: initialData?.field_name ?? '',
            country_code: initialData?.country_code ?? '',
            state: initialData?.state ?? '',
            city: initialData?.city ?? '',
            bio: initialData?.bio ?? '',
            photo_url: initialData?.photo_url ?? '',
            newsletter_url: initialData?.newsletter_url ?? '',
        });
    }, [initialData, isOpen, reset]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Editar Missionário' : 'Novo Missionário'}</DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? 'Atualize os dados do missionário ou projeto apoiado.'
                            : 'Cadastre um missionário ou projeto apoiado pela igreja.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label htmlFor="missionary-name" className="text-sm font-medium text-gray-700">Nome</label>
                        <Input
                            id="missionary-name"
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
                            <label htmlFor="missionary-state" className="text-sm font-medium text-gray-700">Estado/Região</label>
                            <Input
                                id="missionary-state"
                                {...register('state')}
                                placeholder="Ex: Amazonas"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="missionary-city" className="text-sm font-medium text-gray-700">Cidade</label>
                            <Input
                                id="missionary-city"
                                {...register('city')}
                                placeholder="Ex: Manaus"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="missionary-field-name" className="text-sm font-medium text-gray-700">Campo Missionário</label>
                        <Input
                            id="missionary-field-name"
                            {...register('field_name', { required: 'Campo é obrigatório' })}
                            placeholder="Ex: Amazônia, Sertão Nordestino"
                        />
                        {errors.field_name && <span className="text-xs text-red-500">{errors.field_name.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="missionary-bio" className="text-sm font-medium text-gray-700">Biografia</label>
                        <Input
                            id="missionary-bio"
                            {...register('bio')}
                            placeholder="Breve descrição do trabalho missionário"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="missionary-photo-url" className="text-sm font-medium text-gray-700">Foto (URL opcional)</label>
                        <Input
                            id="missionary-photo-url"
                            {...register('photo_url')}
                            type="url"
                            placeholder="https://..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="missionary-newsletter-url" className="text-sm font-medium text-gray-700">Link da Newsletter (opcional)</label>
                        <Input
                            id="missionary-newsletter-url"
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
                            isLoading={createMissionary.isPending || updateMissionary.isPending}
                        >
                            {initialData ? 'Atualizar' : 'Salvar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
