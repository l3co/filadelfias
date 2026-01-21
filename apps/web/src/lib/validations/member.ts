import { z } from 'zod';

export const memberSchema = z.object({
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
  
  birth_date: z
    .string()
    .optional()
    .or(z.literal('')),
  
  gender: z
    .enum(['M', 'F', ''])
    .optional(),
  
  marital_status: z
    .enum(['SOLTEIRO', 'CASADO', 'VIUVO', 'DIVORCIADO', ''])
    .optional(),
  
  marriage_date: z
    .string()
    .optional()
    .or(z.literal('')),
  
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
  status: z
    .enum(['COMUNGANTE', 'NAO_COMUNGANTE', 'PROCESSO', 'DISCIPLINA', 'AFASTADO', 'TRANSFERIDO'])
    .default('COMUNGANTE'),
  
  office: z
    .enum(['MEMBRO', 'DIACONO', 'PRESBITERO', 'PASTOR'])
    .default('MEMBRO'),
  
  functions: z
    .array(z.enum([
      'TESOUREIRO', 'SECRETARIO', 'MUSICO', 'PROFESSOR_EBD', 
      'LIDER_JOVENS', 'LIDER_MULHERES', 'LIDER_HOMENS', 'LIDER_CRIANCAS',
      'SONOPLASTIA', 'MIDIA', 'RECEPCAO', 'LIMPEZA'
    ]))
    .optional()
    .default([]),
  
  admission_date: z
    .string()
    .optional()
    .or(z.literal('')),
  
  admission_type: z
    .enum(['PROFISSAO_FE', 'TRANSFERENCIA', 'JURISDICAO', ''])
    .optional(),
  
  origin_church: z
    .string()
    .max(200, 'Igreja de origem deve ter no máximo 200 caracteres')
    .optional()
    .or(z.literal('')),
  
  baptism_date: z
    .string()
    .optional()
    .or(z.literal('')),
  
  profession_of_faith_date: z
    .string()
    .optional()
    .or(z.literal('')),
});

export type MemberFormSchema = z.infer<typeof memberSchema>;

// Schema for transaction form
export const transactionSchema = z.object({
  description: z
    .string()
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(200, 'Descrição deve ter no máximo 200 caracteres'),
  
  amount: z
    .number({ message: 'Valor inválido' })
    .positive('Valor deve ser positivo'),
  
  type: z
    .enum(['CREDIT', 'DEBIT']),
  
  account_id: z
    .string()
    .uuid('Selecione uma conta'),
  
  category_id: z
    .string()
    .uuid('Selecione uma categoria')
    .optional(),
  
  date: z
    .string()
    .min(1, 'Data é obrigatória'),
  
  notes: z
    .string()
    .max(500, 'Observações deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
});

export type TransactionFormSchema = z.infer<typeof transactionSchema>;
