/**
 * API Response Schemas - Contract definitions for backend responses.
 * These schemas validate that API responses match expected structure.
 * Based on backend Pydantic schemas in src/domain/schemas.py
 */
import { z } from 'zod';

// --- Base Types ---

export const uuidSchema = z.string().uuid();
export const dateTimeSchema = z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/));
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

// --- Enums (synced with backend src/domain/enums.py) ---

export const memberStatusEnum = z.enum([
  'PROCESSO',
  'COMUNGANTE',
  'NAO_COMUNGANTE',
  'DISCIPLINA',
  'AFASTADO',
  'TRANSFERIDO',
  'FALECIDO',
]);

export const ecclesiasticalOfficeEnum = z.enum([
  'MEMBRO',
  'DIACONO',
  'PRESBITERO',
  'PASTOR',
]);

export const ecclesiasticalFunctionEnum = z.enum([
  'TESOUREIRO',
  'SECRETARIO',
  'EVANGELISTA',
  'MISSIONARIO',
]);

export const genderEnum = z.enum(['M', 'F']);

export const maritalStatusEnum = z.enum([
  'SOLTEIRO',
  'CASADO',
  'DIVORCIADO',
  'VIUVO',
]);

// --- Tenant Schemas ---

export const tenantResponseSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  slug: z.string(),
  logo_url: z.string().nullable(),
  street: z.string().nullable(),
  number: z.string().nullable(),
  complement: z.string().nullable(),
  neighborhood: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postal_code: z.string().nullable(),
  country: z.string().default('Brasil'),
  phone: z.string().nullable(),
  email: z.string().nullable(),
});

export type TenantResponse = z.infer<typeof tenantResponseSchema>;

// --- Membership Schemas ---

export const membershipResponseSchema = z.object({
  id: uuidSchema,
  tenant: tenantResponseSchema,
  role: z.string(),
  status: z.string(),
  joined_at: dateTimeSchema,
});

export type MembershipResponse = z.infer<typeof membershipResponseSchema>;

// --- User Schemas ---

export const userResponseSchema = z.object({
  id: uuidSchema,
  email: z.string().email(),
  name: z.string(),
  avatar_url: z.string().nullable(),
  is_active: z.boolean(),
  created_at: dateTimeSchema,
  memberships: z.array(membershipResponseSchema).default([]),
});

export type UserResponse = z.infer<typeof userResponseSchema>;

// --- Auth Schemas ---

export const tokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string().default('bearer'),
});

export type TokenResponse = z.infer<typeof tokenResponseSchema>;

export const authResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  user: userResponseSchema,
  must_change_password: z.boolean().optional(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

// --- Member Schemas ---

export const memberResponseSchema = z.object({
  id: uuidSchema,
  tenant_id: uuidSchema,
  user_id: uuidSchema.nullable(),
  full_name: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  birth_date: dateSchema.nullable(),
  gender: genderEnum.nullable(),
  marital_status: maritalStatusEnum.nullable(),
  marriage_date: dateSchema.nullable(),
  spouse_name: z.string().nullable(),
  // Address
  street: z.string().nullable(),
  number: z.string().nullable(),
  complement: z.string().nullable(),
  neighborhood: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postal_code: z.string().nullable(),
  // Ecclesiastical
  status: memberStatusEnum,
  office: ecclesiasticalOfficeEnum,
  functions: z.array(ecclesiasticalFunctionEnum).nullable(),
  baptism_date: dateSchema.nullable(),
  profession_of_faith_date: dateSchema.nullable(),
  admission_date: dateSchema.nullable(),
  admission_type: z.string().nullable(),
  origin_church: z.string().nullable(),
  // System
  system_role: z.string().nullable(),
  photo_url: z.string().nullable(),
  created_at: dateTimeSchema,
  updated_at: dateTimeSchema,
});

export type MemberResponse = z.infer<typeof memberResponseSchema>;

export const memberListResponseSchema = z.array(memberResponseSchema);

export type MemberListResponse = z.infer<typeof memberListResponseSchema>;

// --- Metadata Schemas ---

export const metadataItemSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const metadataResponseSchema = z.object({
  ecclesiastical_offices: z.array(metadataItemSchema),
  ecclesiastical_functions: z.array(metadataItemSchema),
  member_statuses: z.array(metadataItemSchema),
  genders: z.array(metadataItemSchema),
  marital_statuses: z.array(metadataItemSchema),
  admission_types: z.array(metadataItemSchema),
});

export type MetadataResponse = z.infer<typeof metadataResponseSchema>;

// --- Pagination Schema ---

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    size: z.number(),
    pages: z.number(),
  });
