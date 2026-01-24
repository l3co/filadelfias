import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface EnumOption {
  value: string;
  label: string;
}

export interface Metadata {
  enums: {
    ecclesiastical_offices: EnumOption[];
    ecclesiastical_functions: EnumOption[];
    member_statuses: EnumOption[];
    genders: EnumOption[];
    marital_statuses: EnumOption[];
    admission_types: EnumOption[];
  };
}

export function useMetadata() {
  return useQuery<Metadata>({
    queryKey: ['metadata'],
    queryFn: async () => {
      const response = await api.get('/metadata');
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hora - metadados mudam raramente
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}

// Helpers para uso direto em componentes
export function useOfficeOptions() {
  const { data } = useMetadata();
  return data?.enums.ecclesiastical_offices ?? [];
}

export function useFunctionOptions() {
  const { data } = useMetadata();
  return data?.enums.ecclesiastical_functions ?? [];
}

export function useStatusOptions() {
  const { data } = useMetadata();
  return data?.enums.member_statuses ?? [];
}

export function useGenderOptions() {
  const { data } = useMetadata();
  return data?.enums.genders ?? [];
}

export function useMaritalStatusOptions() {
  const { data } = useMetadata();
  return data?.enums.marital_statuses ?? [];
}

export function useAdmissionTypeOptions() {
  const { data } = useMetadata();
  return data?.enums.admission_types ?? [];
}

// Helper para obter label de um valor
export function useEnumLabel(
  enumType: keyof Metadata['enums'],
  value: string | undefined | null
): string {
  const { data } = useMetadata();
  if (!value) return '';
  const options = data?.enums[enumType] ?? [];
  return options.find((opt) => opt.value === value)?.label ?? value;
}

// Helper para criar um mapa de value -> label
export function useEnumLabelsMap(enumType: keyof Metadata['enums']): Record<string, string> {
  const { data } = useMetadata();
  const options = data?.enums[enumType] ?? [];
  return options.reduce(
    (acc, opt) => {
      acc[opt.value] = opt.label;
      return acc;
    },
    {} as Record<string, string>
  );
}
