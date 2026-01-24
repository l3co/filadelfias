/**
 * Member Types
 */

export type EcclesiasticalOffice = 'MEMBRO' | 'DIACONO' | 'PRESBITERO' | 'PASTOR';

export type EcclesiasticalFunction =
  | 'TESOUREIRO'
  | 'SECRETARIO'
  | 'EVANGELISTA'
  | 'MISSIONARIO'
  | 'PROFESSOR_EBD';

export type MemberStatus = 'PROCESSO' | 'COMUNGANTE' | 'NAO_COMUNGANTE' | 'DISCIPLINA' | 'AFASTADO' | 'TRANSFERIDO' | 'FALECIDO';

export type Gender = 'M' | 'F';

export type MaritalStatus = 'SOLTEIRO' | 'CASADO' | 'DIVORCIADO' | 'VIUVO';

export type AdmissionType = 'BATISMO' | 'PROFISSAO_FE' | 'TRANSFERENCIA' | 'JURISDICAO' | 'RESTAURACAO';

export interface Member {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  gender?: Gender;
  marital_status?: MaritalStatus;
  marriage_date?: string;
  spouse_name?: string;

  // Structured Address
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postal_code?: string;

  photo_url?: string;
  status: MemberStatus;
  role: string; // Deprecated
  office: EcclesiasticalOffice;
  functions?: EcclesiasticalFunction[];
  baptism_date?: string;
  profession_of_faith_date?: string;
  admission_date?: string;
  admission_type?: AdmissionType;
  origin_church?: string;
  tenant_id: string;
  user_id?: string;
  system_role?: 'ADMIN' | 'MEMBER';
  created_at: string;
  updated_at: string;
}

export interface MemberCreateData {
  full_name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  gender?: Gender;
  marital_status?: MaritalStatus;
  marriage_date?: string;
  spouse_name?: string;

  // Structured Address
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postal_code?: string;

  status: MemberStatus;
  role?: string; // Deprecated
  office: EcclesiasticalOffice;
  functions?: EcclesiasticalFunction[];
  baptism_date?: string;
  profession_of_faith_date?: string;
  admission_date?: string;
  admission_type?: AdmissionType;
  origin_church?: string;
  system_role?: 'ADMIN' | 'MEMBER';
}

export type MemberUpdateData = Partial<MemberCreateData>;
