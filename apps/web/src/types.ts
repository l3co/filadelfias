export interface Tenant {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    phone?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    website?: string;
    facebook_url?: string;
    instagram_url?: string;
    youtube_url?: string;
    whatsapp?: string;
}

export interface UserMembership {
    id: string;
    tenant: Tenant;
    role: string;
    status: string;
    joined_at: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    is_active: boolean;
    created_at: string;
    memberships: UserMembership[];
}

export type EcclesiasticalOffice = 'MEMBRO' | 'DIACONO' | 'PRESBITERO' | 'PASTOR';
export type EcclesiasticalFunction = 'TESOUREIRO' | 'SECRETARIO' | 'EVANGELISTA' | 'MISSIONARIO' | 'PROFESSOR_EBD';

export type Gender = 'M' | 'F';
export type MaritalStatus = 'SOLTEIRO' | 'CASADO' | 'DIVORCIADO' | 'VIUVO';
export type MemberStatus = 'PROCESSO' | 'COMUNGANTE' | 'NAO_COMUNGANTE' | 'DISCIPLINA' | 'AFASTADO' | 'TRANSFERIDO' | 'FALECIDO';
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
    role: string;  // Deprecated
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
    role?: string;  // Deprecated
    office: EcclesiasticalOffice;
    functions?: EcclesiasticalFunction[];
    baptism_date?: string;
    profession_of_faith_date?: string;
    admission_date?: string;
    admission_type?: AdmissionType;
    origin_church?: string;
}
