/**
 * Authentication and User Types
 */

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

export type SystemRole = 'ADMIN' | 'MODERATOR' | 'ATTENDEE';
