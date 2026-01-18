export interface Tenant {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
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

export interface Member {
    id: string;
    full_name: string;
    email?: string;
    phone?: string;
    birth_date?: string;
    gender?: string;
    marital_status?: string;
    address?: string;
    photo_url?: string;
    status: string;
    role: string;
    baptism_date?: string;
    tenant_id: string;
    user_id?: string;
    created_at: string;
    updated_at: string;
}

export interface MemberCreateData {
    full_name: string;
    email?: string;
    phone?: string;
    birth_date?: string;
    gender?: string;
    marital_status?: string;
    address?: string;
    status: string;
    role: string;
    baptism_date?: string;
}
