/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { memberSchema, transactionSchema } from '../member';

describe('memberSchema', () => {
  describe('full_name', () => {
    it('should accept valid name with 3+ characters', () => {
      const result = memberSchema.safeParse({ full_name: 'João Silva' });
      expect(result.success).toBe(true);
    });

    it('should accept name with exactly 3 characters', () => {
      const result = memberSchema.safeParse({ full_name: 'Ana' });
      expect(result.success).toBe(true);
    });

    it('should reject name with less than 3 characters', () => {
      const result = memberSchema.safeParse({ full_name: 'Jo' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Nome deve ter pelo menos 3 caracteres');
      }
    });

    it('should reject name with more than 100 characters', () => {
      const longName = 'A'.repeat(101);
      const result = memberSchema.safeParse({ full_name: longName });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Nome deve ter no máximo 100 caracteres');
      }
    });

    it('should reject empty name', () => {
      const result = memberSchema.safeParse({ full_name: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('email', () => {
    it('should accept valid email', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        email: 'joao@email.com',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty string as email (optional)', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        email: '',
      });
      expect(result.success).toBe(true);
    });

    it('should accept undefined email (optional)', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        email: 'invalid-email',
      });
      expect(result.success).toBe(false);
    });

    it('should reject email without domain', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        email: 'joao@',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('phone', () => {
    it('should accept valid phone with area code and hyphen', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        phone: '(11) 99999-9999',
      });
      expect(result.success).toBe(true);
    });

    it('should accept valid phone without formatting', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        phone: '99999-9999',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty string as phone (optional)', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        phone: '',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid phone format', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        phone: '123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('postal_code', () => {
    it('should accept valid CEP with hyphen', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        postal_code: '01234-567',
      });
      expect(result.success).toBe(true);
    });

    it('should accept valid CEP without hyphen', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        postal_code: '01234567',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty string as postal_code (optional)', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        postal_code: '',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid CEP format', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        postal_code: '1234',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('gender', () => {
    it('should accept M for male', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        gender: 'M',
      });
      expect(result.success).toBe(true);
    });

    it('should accept F for female', () => {
      const result = memberSchema.safeParse({
        full_name: 'Maria Silva',
        gender: 'F',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty string (optional)', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        gender: '',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid gender value', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        gender: 'X',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('marital_status', () => {
    const validStatuses = ['SOLTEIRO', 'CASADO', 'VIUVO', 'DIVORCIADO', ''];

    it.each(validStatuses)('should accept valid marital status: %s', (status) => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        marital_status: status,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid marital status', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        marital_status: 'SEPARADO',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('status (ecclesiastical)', () => {
    const validStatuses = [
      'COMUNGANTE',
      'NAO_COMUNGANTE',
      'PROCESSO',
      'DISCIPLINA',
      'AFASTADO',
      'TRANSFERIDO',
      'FALECIDO',
    ];

    it.each(validStatuses)('should accept valid status: %s', (status) => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        status,
      });
      expect(result.success).toBe(true);
    });

    it('should default to COMUNGANTE when not provided', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('COMUNGANTE');
      }
    });

    it('should reject invalid status', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        status: 'INVALID',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('office', () => {
    const validOffices = ['MEMBRO', 'DIACONO', 'PRESBITERO', 'PASTOR'];

    it.each(validOffices)('should accept valid office: %s', (office) => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        office,
      });
      expect(result.success).toBe(true);
    });

    it('should default to MEMBRO when not provided', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.office).toBe('MEMBRO');
      }
    });

    it('should reject invalid office', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        office: 'BISPO',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('functions', () => {
    const validFunctions = [
      'TESOUREIRO',
      'SECRETARIO',
      'MUSICO',
      'PROFESSOR_EBD',
      'LIDER_JOVENS',
      'LIDER_MULHERES',
      'LIDER_HOMENS',
      'LIDER_CRIANCAS',
      'SONOPLASTIA',
      'MIDIA',
      'RECEPCAO',
      'LIMPEZA',
    ];

    it('should accept empty array', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        functions: [],
      });
      expect(result.success).toBe(true);
    });

    it('should accept single valid function', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        functions: ['TESOUREIRO'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept multiple valid functions', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        functions: ['TESOUREIRO', 'SECRETARIO', 'MUSICO'],
      });
      expect(result.success).toBe(true);
    });

    it.each(validFunctions)('should accept function: %s', (func) => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        functions: [func],
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid function', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        functions: ['INVALID_FUNCTION'],
      });
      expect(result.success).toBe(false);
    });

    it('should default to empty array when not provided', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.functions).toEqual([]);
      }
    });
  });

  describe('admission_type', () => {
    const validTypes = ['PROFISSAO_FE', 'TRANSFERENCIA', 'JURISDICAO', ''];

    it.each(validTypes)('should accept valid admission type: %s', (type) => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        admission_type: type,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid admission type', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        admission_type: 'BATISMO',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('state', () => {
    it('should accept valid 2-character state', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        state: 'SP',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty string (optional)', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        state: '',
      });
      expect(result.success).toBe(true);
    });

    it('should reject state with wrong length', () => {
      const result = memberSchema.safeParse({
        full_name: 'João Silva',
        state: 'São Paulo',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('complete member data', () => {
    it('should accept complete valid member data', () => {
      const completeMember = {
        full_name: 'João Pedro da Silva',
        email: 'joao.silva@email.com',
        phone: '(11) 99999-9999',
        birth_date: '1990-05-15',
        gender: 'M',
        marital_status: 'CASADO',
        marriage_date: '2015-06-20',
        spouse_name: 'Maria Silva',
        postal_code: '01234-567',
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        status: 'COMUNGANTE',
        office: 'PRESBITERO',
        functions: ['TESOUREIRO', 'PROFESSOR_EBD'],
        admission_date: '2010-01-01',
        admission_type: 'PROFISSAO_FE',
        origin_church: '',
        baptism_date: '2008-03-15',
        profession_of_faith_date: '2010-01-01',
      };

      const result = memberSchema.safeParse(completeMember);
      expect(result.success).toBe(true);
    });

    it('should accept minimal valid member data', () => {
      const minimalMember = {
        full_name: 'João Silva',
      };

      const result = memberSchema.safeParse(minimalMember);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('COMUNGANTE');
        expect(result.data.office).toBe('MEMBRO');
        expect(result.data.functions).toEqual([]);
      }
    });
  });
});

describe('transactionSchema', () => {
  describe('description', () => {
    it('should accept valid description', () => {
      const result = transactionSchema.safeParse({
        description: 'Dízimo mensal',
        amount: 100,
        type: 'CREDIT',
        account_id: '123e4567-e89b-12d3-a456-426614174000',
        date: '2024-01-15',
      });
      expect(result.success).toBe(true);
    });

    it('should reject description with less than 3 characters', () => {
      const result = transactionSchema.safeParse({
        description: 'Di',
        amount: 100,
        type: 'CREDIT',
        account_id: '123e4567-e89b-12d3-a456-426614174000',
        date: '2024-01-15',
      });
      expect(result.success).toBe(false);
    });

    it('should reject description with more than 200 characters', () => {
      const result = transactionSchema.safeParse({
        description: 'A'.repeat(201),
        amount: 100,
        type: 'CREDIT',
        account_id: '123e4567-e89b-12d3-a456-426614174000',
        date: '2024-01-15',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('amount', () => {
    it('should accept positive amount', () => {
      const result = transactionSchema.safeParse({
        description: 'Dízimo mensal',
        amount: 150.50,
        type: 'CREDIT',
        account_id: '123e4567-e89b-12d3-a456-426614174000',
        date: '2024-01-15',
      });
      expect(result.success).toBe(true);
    });

    it('should reject zero amount', () => {
      const result = transactionSchema.safeParse({
        description: 'Dízimo mensal',
        amount: 0,
        type: 'CREDIT',
        account_id: '123e4567-e89b-12d3-a456-426614174000',
        date: '2024-01-15',
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative amount', () => {
      const result = transactionSchema.safeParse({
        description: 'Dízimo mensal',
        amount: -100,
        type: 'CREDIT',
        account_id: '123e4567-e89b-12d3-a456-426614174000',
        date: '2024-01-15',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('type', () => {
    it('should accept CREDIT type', () => {
      const result = transactionSchema.safeParse({
        description: 'Dízimo mensal',
        amount: 100,
        type: 'CREDIT',
        account_id: '123e4567-e89b-12d3-a456-426614174000',
        date: '2024-01-15',
      });
      expect(result.success).toBe(true);
    });

    it('should accept DEBIT type', () => {
      const result = transactionSchema.safeParse({
        description: 'Pagamento de luz',
        amount: 200,
        type: 'DEBIT',
        account_id: '123e4567-e89b-12d3-a456-426614174000',
        date: '2024-01-15',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid type', () => {
      const result = transactionSchema.safeParse({
        description: 'Transação',
        amount: 100,
        type: 'TRANSFER',
        account_id: '123e4567-e89b-12d3-a456-426614174000',
        date: '2024-01-15',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('account_id', () => {
    it('should accept valid UUID', () => {
      const result = transactionSchema.safeParse({
        description: 'Dízimo mensal',
        amount: 100,
        type: 'CREDIT',
        account_id: '123e4567-e89b-12d3-a456-426614174000',
        date: '2024-01-15',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const result = transactionSchema.safeParse({
        description: 'Dízimo mensal',
        amount: 100,
        type: 'CREDIT',
        account_id: 'invalid-uuid',
        date: '2024-01-15',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('date', () => {
    it('should accept valid date string', () => {
      const result = transactionSchema.safeParse({
        description: 'Dízimo mensal',
        amount: 100,
        type: 'CREDIT',
        account_id: '123e4567-e89b-12d3-a456-426614174000',
        date: '2024-01-15',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty date', () => {
      const result = transactionSchema.safeParse({
        description: 'Dízimo mensal',
        amount: 100,
        type: 'CREDIT',
        account_id: '123e4567-e89b-12d3-a456-426614174000',
        date: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('optional fields', () => {
    it('should accept category_id as valid UUID', () => {
      const result = transactionSchema.safeParse({
        description: 'Dízimo mensal',
        amount: 100,
        type: 'CREDIT',
        account_id: '123e4567-e89b-12d3-a456-426614174000',
        category_id: '123e4567-e89b-12d3-a456-426614174001',
        date: '2024-01-15',
      });
      expect(result.success).toBe(true);
    });

    it('should accept notes as optional', () => {
      const result = transactionSchema.safeParse({
        description: 'Dízimo mensal',
        amount: 100,
        type: 'CREDIT',
        account_id: '123e4567-e89b-12d3-a456-426614174000',
        date: '2024-01-15',
        notes: 'Referente ao mês de janeiro',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty notes', () => {
      const result = transactionSchema.safeParse({
        description: 'Dízimo mensal',
        amount: 100,
        type: 'CREDIT',
        account_id: '123e4567-e89b-12d3-a456-426614174000',
        date: '2024-01-15',
        notes: '',
      });
      expect(result.success).toBe(true);
    });

    it('should reject notes with more than 500 characters', () => {
      const result = transactionSchema.safeParse({
        description: 'Dízimo mensal',
        amount: 100,
        type: 'CREDIT',
        account_id: '123e4567-e89b-12d3-a456-426614174000',
        date: '2024-01-15',
        notes: 'A'.repeat(501),
      });
      expect(result.success).toBe(false);
    });
  });
});
