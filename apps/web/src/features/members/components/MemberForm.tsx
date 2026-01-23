import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useViaCEP } from '../../../hooks/useViaCEP';
import {
  FUNCTION_OPTIONS,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  STATUS_OPTIONS,
  OFFICE_OPTIONS,
  ADMISSION_TYPE_OPTIONS
} from '../../../constants';
import type { Member, MemberCreateData } from '../../../types/members.types';
import { User, Mail, Phone, Calendar, MapPin, Heart, Loader2 } from 'lucide-react';

type EcclesiasticalFunction = 'TESOUREIRO' | 'SECRETARIO' | 'EVANGELISTA' | 'MISSIONARIO' | 'PROFESSOR_EBD';

export type MemberFormData = MemberCreateData;

interface MemberFormProps {
  member?: Member | null;
  onSubmit: (data: MemberFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function MemberForm({
  member,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Salvar'
}: MemberFormProps) {
  const { fetchAddress, isLoading: isFetchingCEP } = useViaCEP();

  const { register, handleSubmit, setValue, control, formState: { errors, isDirty } } = useForm<MemberFormData>({
    defaultValues: {
      status: 'ACTIVE',
      office: 'MEMBRO',
      functions: [],
    }
  });

  const selectedFunctions = useWatch({ control, name: 'functions' }) || [];
  const formValues = useWatch({ control });

  // Populate form when editing
  useEffect(() => {
    if (member) {
      setValue('full_name', member.full_name);
      setValue('email', member.email || '');
      setValue('phone', member.phone || '');
      setValue('birth_date', member.birth_date || '');
      setValue('gender', member.gender);
      setValue('marital_status', member.marital_status);
      setValue('marriage_date', member.marriage_date || '');
      setValue('spouse_name', member.spouse_name || '');
      setValue('postal_code', member.postal_code || '');
      setValue('street', member.street || '');
      setValue('number', member.number || '');
      setValue('complement', member.complement || '');
      setValue('neighborhood', member.neighborhood || '');
      setValue('city', member.city || '');
      setValue('state', member.state || '');
      setValue('status', member.status);
      setValue('office', member.office || 'MEMBRO');
      setValue('functions', member.functions || []);
      setValue('baptism_date', member.baptism_date || '');
      setValue('profession_of_faith_date', member.profession_of_faith_date || '');
      setValue('admission_date', member.admission_date || '');
      setValue('admission_type', member.admission_type);
      setValue('origin_church', member.origin_church || '');
    }
  }, [member, setValue]);

  const handleCEPBlur = async () => {
    const cep = formValues.postal_code;
    if (cep && cep.replace(/\D/g, '').length === 8) {
      const address = await fetchAddress(cep);
      if (address) {
        setValue('street', address.street, { shouldDirty: true });
        setValue('neighborhood', address.neighborhood, { shouldDirty: true });
        setValue('city', address.city, { shouldDirty: true });
        setValue('state', address.state, { shouldDirty: true });
      }
    }
  };

  const handleFunctionToggle = (fn: EcclesiasticalFunction) => {
    const current = selectedFunctions || [];
    if (current.includes(fn)) {
      setValue('functions', current.filter(f => f !== fn), { shouldDirty: true });
    } else {
      setValue('functions', [...current, fn], { shouldDirty: true });
    }
  };

  const handleFormSubmit = (data: MemberFormData) => {
    // Clean empty strings to null
    const cleanedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value === '' ? null : value
      ])
    ) as MemberFormData;
    onSubmit(cleanedData);
  };

  const isEditMode = !!member;
  const canSubmit = isEditMode ? isDirty : true;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 py-4">
      {/* Dados Pessoais */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Dados Pessoais</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">Nome Completo *</label>
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
              {GENDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Estado Civil</label>
            <select
              {...register('marital_status')}
              className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <option value="">Selecione...</option>
              {MARITAL_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
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
        </div>
      </div>

      {/* Endereço */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
          <MapPin size={16} className="text-green-600" />
          Endereço
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">CEP</label>
            <div className="relative">
              <Input
                {...register('postal_code')}
                onBlur={handleCEPBlur}
                placeholder="00000-000"
                maxLength={9}
              />
              {isFetchingCEP && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Estado</label>
            <Input
              {...register('state')}
              placeholder="SP"
              maxLength={2}
              className="uppercase"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">Cidade</label>
            <Input
              {...register('city')}
              placeholder="São Paulo"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">Logradouro</label>
            <Input
              {...register('street')}
              placeholder="Rua, Avenida..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Número</label>
            <Input
              {...register('number')}
              placeholder="123"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Complemento</label>
            <Input
              {...register('complement')}
              placeholder="Apto, Bloco..."
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">Bairro</label>
            <Input
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
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              {...register('status')}
              className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Ofício</label>
            <select
              {...register('office')}
              className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              {OFFICE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">Funções</label>
            <div className="flex flex-wrap gap-2">
              {FUNCTION_OPTIONS.map((fn) => (
                <button
                  key={fn.value}
                  type="button"
                  onClick={() => handleFunctionToggle(fn.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedFunctions.includes(fn.value)
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
              {ADMISSION_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
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

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={!canSubmit || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" />
              Salvando...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
