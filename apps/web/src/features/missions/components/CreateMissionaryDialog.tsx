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

const COUNTRIES = [
    { code: 'BR', name: 'Brasil' },
    { code: 'US', name: 'Estados Unidos' },
    { code: 'PT', name: 'Portugal' },
    { code: 'ES', name: 'Espanha' },
    { code: 'MX', name: 'México' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CO', name: 'Colômbia' },
    { code: 'PE', name: 'Peru' },
    { code: 'CL', name: 'Chile' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'EC', name: 'Equador' },
    { code: 'BO', name: 'Bolívia' },
    { code: 'PY', name: 'Paraguai' },
    { code: 'UY', name: 'Uruguai' },
    { code: 'MZ', name: 'Moçambique' },
    { code: 'AO', name: 'Angola' },
    { code: 'CV', name: 'Cabo Verde' },
    { code: 'GW', name: 'Guiné-Bissau' },
    { code: 'ST', name: 'São Tomé e Príncipe' },
    { code: 'TL', name: 'Timor-Leste' },
    { code: 'IN', name: 'Índia' },
    { code: 'CN', name: 'China' },
    { code: 'JP', name: 'Japão' },
    { code: 'KR', name: 'Coreia do Sul' },
    { code: 'PH', name: 'Filipinas' },
    { code: 'ID', name: 'Indonésia' },
    { code: 'ZA', name: 'África do Sul' },
    { code: 'NG', name: 'Nigéria' },
    { code: 'KE', name: 'Quênia' },
    { code: 'ET', name: 'Etiópia' },
    { code: 'EG', name: 'Egito' },
    { code: 'MA', name: 'Marrocos' },
    { code: 'IL', name: 'Israel' },
    { code: 'TR', name: 'Turquia' },
    { code: 'RU', name: 'Rússia' },
    { code: 'DE', name: 'Alemanha' },
    { code: 'FR', name: 'França' },
    { code: 'IT', name: 'Itália' },
    { code: 'GB', name: 'Reino Unido' },
    { code: 'CA', name: 'Canadá' },
    { code: 'AU', name: 'Austrália' },
    { code: 'NZ', name: 'Nova Zelândia' },
].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

export function CreateMissionaryDialog({ isOpen, onClose, tenantId }: Props) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateMissionaryDTO>();
    const createMissionary = useCreateMissionary(tenantId);

    const onSubmit = (data: CreateMissionaryDTO) => {
        createMissionary.mutate(data, {
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

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">País</label>
                        <select
                            {...register('country_code', { required: 'País é obrigatório' })}
                            className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <option value="">Selecione um país...</option>
                            {COUNTRIES.map(country => (
                                <option key={country.code} value={country.code}>
                                    {country.name} ({country.code})
                                </option>
                            ))}
                        </select>
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
