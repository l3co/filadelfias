/**
 * Member validation schemas for mobile app.
 * Synced with backend src/domain/schemas.py and web src/lib/validations/member.ts
 */
import { z } from 'zod';

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

export type MemberStatus = z.infer<typeof memberStatusEnum>;

export const ecclesiasticalOfficeEnum = z.enum([
  'MEMBRO',
  'DIACONO',
  'PRESBITERO',
  'PASTOR',
]);

export type EcclesiasticalOffice = z.infer<typeof ecclesiasticalOfficeEnum>;

export const ecclesiasticalFunctionEnum = z.enum([
  'TESOUREIRO',
  'SECRETARIO',
  'EVANGELISTA',
  'MISSIONARIO',
]);

export type EcclesiasticalFunction = z.infer<typeof ecclesiasticalFunctionEnum>;

export const genderEnum = z.enum(['M', 'F']);

export type Gender = z.infer<typeof genderEnum>;

export const maritalStatusEnum = z.enum([
  'SOLTEIRO',
  'CASADO',
  'DIVORCIADO',
  'VIUVO',
]);

export type MaritalStatus = z.infer<typeof maritalStatusEnum>;

// --- Member Response Schema (API response validation) ---

export const memberResponseSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  full_name: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  birth_date: z.string().nullable(),
  gender: genderEnum.nullable(),
  marital_status: maritalStatusEnum.nullable(),
  marriage_date: z.string().nullable(),
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
  baptism_date: z.string().nullable(),
  profession_of_faith_date: z.string().nullable(),
  admission_date: z.string().nullable(),
  admission_type: z.string().nullable(),
  origin_church: z.string().nullable(),
  // System
  system_role: z.string().nullable(),
  photo_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type MemberResponse = z.infer<typeof memberResponseSchema>;

// --- Member Form Schema (form validation) ---

export const memberFormSchema = z.object({
  full_name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),

  email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),

  phone: z
    .string()
    .regex(/^(\(\d{2}\)\s?)?\d{4,5}-?\d{4}$/, 'Telefone inválido')
    .optional()
    .or(z.literal('')),

  birth_date: z.string().optional().or(z.literal('')),

  gender: genderEnum.optional().or(z.literal('')),

  marital_status: maritalStatusEnum.optional().or(z.literal('')),

  marriage_date: z.string().optional().or(z.literal('')),

  spouse_name: z
    .string()
    .max(100, 'Nome do cônjuge deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),

  // Address
  postal_code: z
    .string()
    .regex(/^\d{5}-?\d{3}$/, 'CEP inválido')
    .optional()
    .or(z.literal('')),

  street: z
    .string()
    .max(200, 'Endereço deve ter no máximo 200 caracteres')
    .optional()
    .or(z.literal('')),

  number: z
    .string()
    .max(20, 'Número deve ter no máximo 20 caracteres')
    .optional()
    .or(z.literal('')),

  complement: z
    .string()
    .max(100, 'Complemento deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),

  neighborhood: z
    .string()
    .max(100, 'Bairro deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),

  city: z
    .string()
    .max(100, 'Cidade deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),

  state: z
    .string()
    .length(2, 'Estado deve ter 2 caracteres')
    .optional()
    .or(z.literal('')),

  // Ecclesiastical data
  status: memberStatusEnum.default('COMUNGANTE'),

  office: ecclesiasticalOfficeEnum.default('MEMBRO'),

  functions: z.array(ecclesiasticalFunctionEnum).optional().default([]),

  admission_date: z.string().optional().or(z.literal('')),

  admission_type: z
    .enum(['PROFISSAO_FE', 'TRANSFERENCIA', 'JURISDICAO', 'BATISMO', 'RESTAURACAO', ''])
    .optional(),

  origin_church: z
    .string()
    .max(200, 'Igreja de origem deve ter no máximo 200 caracteres')
    .optional()
    .or(z.literal('')),

  baptism_date: z.string().optional().or(z.literal('')),

  profession_of_faith_date: z.string().optional().or(z.literal('')),
});

export type MemberFormData = z.infer<typeof memberFormSchema>;
