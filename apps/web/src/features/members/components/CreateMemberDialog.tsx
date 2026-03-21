import { useForm, useWatch } from 'react-hook-form';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "../../../components/ui/dialog";
import { useCreateMember } from '../hooks/useMembers';
import { useViaCEP } from '../../../hooks/useViaCEP';
import {
    useGenderOptions,
    useMaritalStatusOptions,
    useStatusOptions,
    useOfficeOptions,
    useFunctionOptions,
    useAdmissionTypeOptions,
} from '../../../hooks/useMetadata';
import type { MemberCreateData, EcclesiasticalFunction } from '../../../types';
import { User, Mail, Phone, Calendar, MapPin, Heart, Loader2, UserPlus } from 'lucide-react';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    tenantId: string;
}

export function CreateMemberDialog({ isOpen, onClose, tenantId }: Props) {
    // Metadata hooks - fonte única de verdade do backend
    const genderOptions = useGenderOptions();
    const maritalStatusOptions = useMaritalStatusOptions();
    const statusOptions = useStatusOptions();
    const officeOptions = useOfficeOptions();
    const functionOptions = useFunctionOptions();
    const admissionTypeOptions = useAdmissionTypeOptions();
    const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<MemberCreateData>({
        defaultValues: {
            status: 'COMUNGANTE',
            office: 'MEMBRO',
        }
    });
    const createMember = useCreateMember(tenantId);
    const { fetchAddress, isLoading: isFetchingCEP } = useViaCEP();

    const formValues = useWatch({ control });
    const selectedFunctions = useWatch({ control, name: 'functions' }) || [];

    const onSubmit = (data: MemberCreateData) => {
        // Clean empty strings to null
        const cleanedData = Object.fromEntries(
            Object.entries(data).map(([key, value]) => [
                key,
                value === '' ? null : value
            ])
        ) as MemberCreateData;

        createMember.mutate(cleanedData, {
            onSuccess: () => {
                reset();
                onClose();
            }
        });
    };

    const handleCEPBlur = async () => {
        const cep = formValues.postal_code;
        if (cep && cep.replace(/\D/g, '').length === 8) {
            const address = await fetchAddress(cep);
            if (address) {
                setValue('street', address.street);
                setValue('neighborhood', address.neighborhood);
                setValue('city', address.city);
                setValue('state', address.state);
            }
        }
    };

    const handleFunctionToggle = (fn: EcclesiasticalFunction) => {
        const current = selectedFunctions || [];
        if (current.includes(fn)) {
            setValue('functions', current.filter(f => f !== fn));
        } else {
            setValue('functions', [...current, fn]);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus size={20} className="text-green-600" aria-hidden="true" />
                        Novo Membro
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    {/* Dados Pessoais */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Dados Pessoais</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2 space-y-2">
                                <label htmlFor="create-member-full-name" className="text-sm font-medium text-gray-700">Nome Completo *</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                                    <Input
                                        id="create-member-full-name"
                                        {...register('full_name', { required: 'Nome é obrigatório' })}
                                        className="pl-9"
                                        placeholder="Nome completo"
                                    />
                                </div>
                                {errors.full_name && <span className="text-xs text-red-500">{errors.full_name.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="create-member-email" className="text-sm font-medium text-gray-700">Email</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                                    <Input
                                        id="create-member-email"
                                        type="email"
                                        {...register('email')}
                                        className="pl-9"
                                        placeholder="email@exemplo.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="create-member-phone" className="text-sm font-medium text-gray-700">Telefone</label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                                    <Input
                                        id="create-member-phone"
                                        {...register('phone')}
                                        className="pl-9"
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="create-member-birth-date" className="text-sm font-medium text-gray-700">Data de Nascimento</label>
                                <div className="relative">
                                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                                    <Input
                                        id="create-member-birth-date"
                                        type="date"
                                        {...register('birth_date')}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="create-member-gender" className="text-sm font-medium text-gray-700">Sexo</label>
                                <select
                                    id="create-member-gender"
                                    {...register('gender')}
                                    className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                                >
                                    <option value="">Selecione...</option>
                                    {genderOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="create-member-marital-status" className="text-sm font-medium text-gray-700">Estado Civil</label>
                                <select
                                    id="create-member-marital-status"
                                    {...register('marital_status')}
                                    className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                                >
                                    <option value="">Selecione...</option>
                                    {maritalStatusOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="create-member-marriage-date" className="text-sm font-medium text-gray-700">Data de Casamento</label>
                                <div className="relative">
                                    <Heart size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                                    <Input
                                        id="create-member-marriage-date"
                                        type="date"
                                        {...register('marriage_date')}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="create-member-spouse-name" className="text-sm font-medium text-gray-700">Nome do Cônjuge</label>
                                <Input
                                    id="create-member-spouse-name"
                                    {...register('spouse_name')}
                                    placeholder="Nome do cônjuge"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Endereço */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                            <MapPin size={16} className="text-green-600" aria-hidden="true" />
                            Endereço
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="create-member-postal-code" className="text-sm font-medium text-gray-700">CEP</label>
                                <div className="relative">
                                    <Input
                                        id="create-member-postal-code"
                                        {...register('postal_code')}
                                        onBlur={handleCEPBlur}
                                        placeholder="00000-000"
                                        maxLength={9}
                                    />
                                    {isFetchingCEP && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <Loader2 size={16} className="animate-spin text-gray-400" aria-hidden="true" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="create-member-state" className="text-sm font-medium text-gray-700">Estado</label>
                                <Input
                                    id="create-member-state"
                                    {...register('state')}
                                    placeholder="SP"
                                    maxLength={2}
                                    className="uppercase"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label htmlFor="create-member-city" className="text-sm font-medium text-gray-700">Cidade</label>
                                <Input
                                    id="create-member-city"
                                    {...register('city')}
                                    placeholder="São Paulo"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label htmlFor="create-member-street" className="text-sm font-medium text-gray-700">Logradouro</label>
                                <Input
                                    id="create-member-street"
                                    {...register('street')}
                                    placeholder="Rua, Avenida..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="create-member-number" className="text-sm font-medium text-gray-700">Número</label>
                                <Input
                                    id="create-member-number"
                                    {...register('number')}
                                    placeholder="123"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="create-member-complement" className="text-sm font-medium text-gray-700">Complemento</label>
                                <Input
                                    id="create-member-complement"
                                    {...register('complement')}
                                    placeholder="Apto, Bloco..."
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label htmlFor="create-member-neighborhood" className="text-sm font-medium text-gray-700">Bairro</label>
                                <Input
                                    id="create-member-neighborhood"
                                    {...register('neighborhood')}
                                    placeholder="Centro"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dados Eclesiásticos */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Dados Eclesiásticos</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="create-member-status" className="text-sm font-medium text-gray-700">Status</label>
                                <select
                                    id="create-member-status"
                                    {...register('status')}
                                    className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                                >
                                    {statusOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="create-member-office" className="text-sm font-medium text-gray-700">Ofício</label>
                                <select
                                    id="create-member-office"
                                    {...register('office')}
                                    className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                                >
                                    {officeOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label id="create-member-functions-label" className="text-sm font-medium text-gray-700">Funções</label>
                                <div className="flex flex-wrap gap-2" role="group" aria-labelledby="create-member-functions-label">
                                    {functionOptions.map((fn) => (
                                        <button
                                            key={fn.value}
                                            type="button"
                                            onClick={() => handleFunctionToggle(fn.value as EcclesiasticalFunction)}
                                            aria-pressed={selectedFunctions.includes(fn.value as EcclesiasticalFunction)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedFunctions.includes(fn.value as EcclesiasticalFunction)
                                                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                                                    : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                                                }`}
                                        >
                                            {fn.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="create-member-baptism-date" className="text-sm font-medium text-gray-700">Data de Batismo</label>
                                <Input id="create-member-baptism-date" type="date" {...register('baptism_date')} />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="create-member-profession-faith-date" className="text-sm font-medium text-gray-700">Profissão de Fé</label>
                                <Input id="create-member-profession-faith-date" type="date" {...register('profession_of_faith_date')} />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="create-member-admission-date" className="text-sm font-medium text-gray-700">Data de Admissão</label>
                                <Input id="create-member-admission-date" type="date" {...register('admission_date')} />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="create-member-admission-type" className="text-sm font-medium text-gray-700">Tipo de Admissão</label>
                                <select
                                    id="create-member-admission-type"
                                    {...register('admission_type')}
                                    className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                                >
                                    <option value="">Selecione...</option>
                                    {admissionTypeOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label htmlFor="create-member-origin-church" className="text-sm font-medium text-gray-700">Igreja de Origem</label>
                                <Input
                                    id="create-member-origin-church"
                                    {...register('origin_church')}
                                    placeholder="Nome da igreja de origem (se transferência)"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            isLoading={createMember.isPending}
                        >
                            Salvar Membro
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
