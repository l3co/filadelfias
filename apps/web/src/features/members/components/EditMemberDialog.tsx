import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "../../../components/ui/dialog";
import { api } from '../../../lib/api';
import type { Member, EcclesiasticalOffice, EcclesiasticalFunction } from '../../../types';
import { User, Mail, Phone, Calendar, MapPin, Heart, Loader2 } from 'lucide-react';

interface EditMemberFormData {
    full_name: string;
    email?: string;
    phone?: string;
    birth_date?: string;
    gender?: string;
    marital_status?: string;
    marriage_date?: string;
    spouse_name?: string;
    address?: string;
    status: string;
    office: EcclesiasticalOffice;
    functions?: EcclesiasticalFunction[];
    baptism_date?: string;
    profession_of_faith_date?: string;
    admission_date?: string;
    admission_type?: string;
    origin_church?: string;
}

type Props = {
    isOpen: boolean;
    onClose: () => void;
    member: Member | null;
    tenantId: string;
}

const FUNCTIONS_OPTIONS: { value: EcclesiasticalFunction; label: string }[] = [
    { value: 'TESOUREIRO', label: 'Tesoureiro' },
    { value: 'SECRETARIO', label: 'Secretário' },
    { value: 'EVANGELISTA', label: 'Evangelista' },
    { value: 'MISSIONARIO', label: 'Missionário' },
];

export function EditMemberDialog({ isOpen, onClose, member, tenantId }: Props) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, setValue, watch, formState: { errors, isDirty } } = useForm<EditMemberFormData>();

    const selectedFunctions = watch('functions') || [];

    useEffect(() => {
        if (member) {
            setValue('full_name', member.full_name);
            setValue('email', member.email || '');
            setValue('phone', member.phone || '');
            setValue('birth_date', member.birth_date || '');
            setValue('gender', member.gender || '');
            setValue('marital_status', member.marital_status || '');
            setValue('marriage_date', member.marriage_date || '');
            setValue('spouse_name', member.spouse_name || '');
            setValue('address', member.address || '');
            setValue('status', member.status);
            setValue('office', member.office || 'MEMBRO');
            setValue('functions', member.functions || []);
            setValue('baptism_date', member.baptism_date || '');
            setValue('profession_of_faith_date', member.profession_of_faith_date || '');
            setValue('admission_date', member.admission_date || '');
            setValue('admission_type', member.admission_type || '');
            setValue('origin_church', member.origin_church || '');
        }
    }, [member, setValue]);

    const updateMutation = useMutation({
        mutationFn: async (data: EditMemberFormData) => {
            const response = await api.patch(`/tenants/${tenantId}/members/${member?.id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members', tenantId] });
            reset();
            onClose();
        }
    });

    const onSubmit = (data: EditMemberFormData) => {
        updateMutation.mutate(data);
    };

    const handleFunctionToggle = (fn: EcclesiasticalFunction) => {
        const current = selectedFunctions || [];
        if (current.includes(fn)) {
            setValue('functions', current.filter(f => f !== fn), { shouldDirty: true });
        } else {
            setValue('functions', [...current, fn], { shouldDirty: true });
        }
    };

    if (!member) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User size={20} className="text-green-600" />
                        Editar Membro
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    {/* Dados Pessoais */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Dados Pessoais</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        {...register('full_name', { required: 'Nome é obrigatório' })}
                                        className="pl-9"
                                        placeholder="Nome completo"
                                    />
                                </div>
                                {errors.full_name && <span className="text-xs text-red-500">{errors.full_name.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        type="email"
                                        {...register('email')}
                                        className="pl-9"
                                        placeholder="email@exemplo.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Telefone</label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        {...register('phone')}
                                        className="pl-9"
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Data de Nascimento</label>
                                <div className="relative">
                                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        type="date"
                                        {...register('birth_date')}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Sexo</label>
                                <select
                                    {...register('gender')}
                                    className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Feminino</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Estado Civil</label>
                                <select
                                    {...register('marital_status')}
                                    className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="SOLTEIRO">Solteiro(a)</option>
                                    <option value="CASADO">Casado(a)</option>
                                    <option value="VIUVO">Viúvo(a)</option>
                                    <option value="DIVORCIADO">Divorciado(a)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Data de Casamento</label>
                                <div className="relative">
                                    <Heart size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        type="date"
                                        {...register('marriage_date')}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Nome do Cônjuge</label>
                                <Input
                                    {...register('spouse_name')}
                                    placeholder="Nome do cônjuge"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-gray-700">Endereço</label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                                    <textarea
                                        {...register('address')}
                                        className="flex min-h-[80px] w-full rounded-xl border border-gray-200 bg-white px-3 py-2 pl-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                                        placeholder="Endereço completo"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dados Eclesiásticos */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Dados Eclesiásticos</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <select
                                    {...register('status')}
                                    className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                                >
                                    <option value="COMUNGANTE">Comungante</option>
                                    <option value="NAO_COMUNGANTE">Não Comungante</option>
                                    <option value="PROCESSO">Em Processo</option>
                                    <option value="DISCIPLINA">Em Disciplina</option>
                                    <option value="AFASTADO">Afastado</option>
                                    <option value="TRANSFERIDO">Transferido</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Ofício</label>
                                <select
                                    {...register('office')}
                                    className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                                >
                                    <option value="MEMBRO">Membro</option>
                                    <option value="DIACONO">Diácono</option>
                                    <option value="PRESBITERO">Presbítero</option>
                                    <option value="PASTOR">Pastor</option>
                                </select>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-gray-700">Funções</label>
                                <div className="flex flex-wrap gap-2">
                                    {FUNCTIONS_OPTIONS.map((fn) => (
                                        <button
                                            key={fn.value}
                                            type="button"
                                            onClick={() => handleFunctionToggle(fn.value)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                                selectedFunctions.includes(fn.value)
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
                                <label className="text-sm font-medium text-gray-700">Data de Batismo</label>
                                <Input type="date" {...register('baptism_date')} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Profissão de Fé</label>
                                <Input type="date" {...register('profession_of_faith_date')} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Data de Admissão</label>
                                <Input type="date" {...register('admission_date')} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Tipo de Admissão</label>
                                <select
                                    {...register('admission_type')}
                                    className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="PROFISSAO_FE">Profissão de Fé</option>
                                    <option value="TRANSFERENCIA">Transferência</option>
                                    <option value="JURISDICAO">Jurisdição</option>
                                </select>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-gray-700">Igreja de Origem</label>
                                <Input
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
                            disabled={!isDirty || updateMutation.isPending}
                        >
                            {updateMutation.isPending ? (
                                <>
                                    <Loader2 size={16} className="animate-spin mr-2" />
                                    Salvando...
                                </>
                            ) : (
                                'Salvar Alterações'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
