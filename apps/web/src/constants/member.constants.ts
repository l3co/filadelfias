/**
 * Member Constants
 * 
 * @deprecated Este arquivo está DEPRECATED. Use o hook useMetadata() para obter
 * enums e labels do backend. Veja: src/hooks/useMetadata.ts
 * 
 * Exemplo de migração:
 * ```tsx
 * // Antes (deprecated):
 * import { OFFICE_OPTIONS, OFFICE_LABELS } from '../constants/member.constants';
 * 
 * // Depois (correto):
 * import { useOfficeOptions, useEnumLabelsMap } from '../hooks/useMetadata';
 * const officeOptions = useOfficeOptions();
 * const officeLabels = useEnumLabelsMap('ecclesiastical_offices');
 * ```
 */

import type {
  EcclesiasticalOffice,
  EcclesiasticalFunction,
  MemberStatus,
} from '../types/members.types';

type Gender = 'MALE' | 'FEMALE';
type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
type AdmissionType = 'BAPTISM' | 'PROFESSION' | 'TRANSFER' | 'JURISDICTION';

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

export const OFFICE_OPTIONS: SelectOption<EcclesiasticalOffice>[] = [
  { value: 'MEMBRO', label: 'Membro' },
  { value: 'DIACONO', label: 'Diácono' },
  { value: 'PRESBITERO', label: 'Presbítero' },
  { value: 'PASTOR', label: 'Pastor' },
];

export const FUNCTION_OPTIONS: SelectOption<EcclesiasticalFunction>[] = [
  { value: 'TESOUREIRO', label: 'Tesoureiro' },
  { value: 'SECRETARIO', label: 'Secretário' },
  { value: 'EVANGELISTA', label: 'Evangelista' },
  { value: 'MISSIONARIO', label: 'Missionário' },
  { value: 'PROFESSOR_EBD', label: 'Professor de EBD' },
];

export const STATUS_OPTIONS: SelectOption<MemberStatus>[] = [
  { value: 'PROCESSO', label: 'Em Processo' },
  { value: 'COMUNGANTE', label: 'Comungante (Ativo)' },
  { value: 'NAO_COMUNGANTE', label: 'Não Comungante' },
  { value: 'DISCIPLINA', label: 'Sob Disciplina' },
  { value: 'AFASTADO', label: 'Afastado' },
  { value: 'TRANSFERIDO', label: 'Transferido' },
  { value: 'FALECIDO', label: 'Falecido' },
];

export const GENDER_OPTIONS: SelectOption<Gender>[] = [
  { value: 'MALE', label: 'Masculino' },
  { value: 'FEMALE', label: 'Feminino' },
];

export const MARITAL_STATUS_OPTIONS: SelectOption<MaritalStatus>[] = [
  { value: 'SINGLE', label: 'Solteiro(a)' },
  { value: 'MARRIED', label: 'Casado(a)' },
  { value: 'DIVORCED', label: 'Divorciado(a)' },
  { value: 'WIDOWED', label: 'Viúvo(a)' },
];

export const ADMISSION_TYPE_OPTIONS: SelectOption<AdmissionType>[] = [
  { value: 'BAPTISM', label: 'Batismo' },
  { value: 'PROFESSION', label: 'Profissão de Fé' },
  { value: 'TRANSFER', label: 'Transferência' },
  { value: 'JURISDICTION', label: 'Jurisdição' },
];

// Labels for display
export const OFFICE_LABELS: Record<EcclesiasticalOffice, string> = {
  MEMBRO: 'Membro',
  DIACONO: 'Diácono',
  PRESBITERO: 'Presbítero',
  PASTOR: 'Pastor',
};

export const FUNCTION_LABELS: Record<EcclesiasticalFunction, string> = {
  TESOUREIRO: 'Tesoureiro',
  SECRETARIO: 'Secretário',
  EVANGELISTA: 'Evangelista',
  MISSIONARIO: 'Missionário',
  PROFESSOR_EBD: 'Professor de EBD',
};

export const STATUS_LABELS: Record<MemberStatus, string> = {
  PROCESSO: 'Em Processo',
  COMUNGANTE: 'Comungante',
  NAO_COMUNGANTE: 'Não Comungante',
  DISCIPLINA: 'Sob Disciplina',
  AFASTADO: 'Afastado',
  TRANSFERIDO: 'Transferido',
  FALECIDO: 'Falecido',
};
