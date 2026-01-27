import {
  memberStatusEnum,
  ecclesiasticalOfficeEnum,
  ecclesiasticalFunctionEnum,
  genderEnum,
  maritalStatusEnum,
  memberResponseSchema,
  memberFormSchema,
} from '../member';

describe('Member Enums', () => {
  describe('memberStatusEnum', () => {
    const validStatuses = [
      'PROCESSO',
      'COMUNGANTE',
      'NAO_COMUNGANTE',
      'DISCIPLINA',
      'AFASTADO',
      'TRANSFERIDO',
      'FALECIDO',
    ];

    it.each(validStatuses)('should accept valid status: %s', (status) => {
      expect(memberStatusEnum.safeParse(status).success).toBe(true);
    });

    it('should reject invalid status', () => {
      expect(memberStatusEnum.safeParse('INVALID').success).toBe(false);
      expect(memberStatusEnum.safeParse('ACTIVE').success).toBe(false);
    });
  });

  describe('ecclesiasticalOfficeEnum', () => {
    const validOffices = ['MEMBRO', 'DIACONO', 'PRESBITERO', 'PASTOR'];

    it.each(validOffices)('should accept valid office: %s', (office) => {
      expect(ecclesiasticalOfficeEnum.safeParse(office).success).toBe(true);
    });

    it('should reject invalid office', () => {
      expect(ecclesiasticalOfficeEnum.safeParse('BISPO').success).toBe(false);
    });
  });

  describe('ecclesiasticalFunctionEnum', () => {
    const validFunctions = ['TESOUREIRO', 'SECRETARIO', 'EVANGELISTA', 'MISSIONARIO'];

    it.each(validFunctions)('should accept valid function: %s', (func) => {
      expect(ecclesiasticalFunctionEnum.safeParse(func).success).toBe(true);
    });

    it('should reject invalid function', () => {
      expect(ecclesiasticalFunctionEnum.safeParse('MUSICO').success).toBe(false);
    });
  });

  describe('genderEnum', () => {
    it('should accept M and F', () => {
      expect(genderEnum.safeParse('M').success).toBe(true);
      expect(genderEnum.safeParse('F').success).toBe(true);
    });

    it('should reject other values', () => {
      expect(genderEnum.safeParse('X').success).toBe(false);
    });
  });

  describe('maritalStatusEnum', () => {
    const validStatuses = ['SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO'];

    it.each(validStatuses)('should accept valid marital status: %s', (status) => {
      expect(maritalStatusEnum.safeParse(status).success).toBe(true);
    });
  });
});

describe('memberResponseSchema', () => {
  const validMember = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    tenant_id: '123e4567-e89b-12d3-a456-426614174001',
    user_id: null,
    full_name: 'João Pedro da Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-9999',
    birth_date: '1990-05-15',
    gender: 'M',
    marital_status: 'CASADO',
    marriage_date: '2015-06-20',
    spouse_name: 'Maria Silva',
    street: 'Rua das Flores',
    number: '123',
    complement: 'Apto 45',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    postal_code: '01234-567',
    status: 'COMUNGANTE',
    office: 'PRESBITERO',
    functions: ['TESOUREIRO'],
    baptism_date: '2008-03-15',
    profession_of_faith_date: '2010-01-01',
    admission_date: '2010-01-01',
    admission_type: 'PROFISSAO_FE',
    origin_church: null,
    system_role: 'ADMIN',
    photo_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  it('should accept valid complete member response', () => {
    expect(memberResponseSchema.safeParse(validMember).success).toBe(true);
  });

  it('should accept member with minimal data', () => {
    const minimalMember = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      tenant_id: '123e4567-e89b-12d3-a456-426614174001',
      user_id: null,
      full_name: 'João Silva',
      email: null,
      phone: null,
      birth_date: null,
      gender: null,
      marital_status: null,
      marriage_date: null,
      spouse_name: null,
      street: null,
      number: null,
      complement: null,
      neighborhood: null,
      city: null,
      state: null,
      postal_code: null,
      status: 'COMUNGANTE',
      office: 'MEMBRO',
      functions: null,
      baptism_date: null,
      profession_of_faith_date: null,
      admission_date: null,
      admission_type: null,
      origin_church: null,
      system_role: null,
      photo_url: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };
    expect(memberResponseSchema.safeParse(minimalMember).success).toBe(true);
  });

  it('should reject member with invalid status', () => {
    const invalidMember = { ...validMember, status: 'ACTIVE' };
    expect(memberResponseSchema.safeParse(invalidMember).success).toBe(false);
  });

  it('should reject member with invalid office', () => {
    const invalidMember = { ...validMember, office: 'BISPO' };
    expect(memberResponseSchema.safeParse(invalidMember).success).toBe(false);
  });
});

describe('memberFormSchema', () => {
  describe('full_name', () => {
    it('should accept valid name', () => {
      const result = memberFormSchema.safeParse({ full_name: 'João Silva' });
      expect(result.success).toBe(true);
    });

    it('should reject name with less than 3 characters', () => {
      const result = memberFormSchema.safeParse({ full_name: 'Jo' });
      expect(result.success).toBe(false);
    });

    it('should reject name with more than 100 characters', () => {
      const result = memberFormSchema.safeParse({ full_name: 'A'.repeat(101) });
      expect(result.success).toBe(false);
    });
  });

  describe('email', () => {
    it('should accept valid email', () => {
      const result = memberFormSchema.safeParse({
        full_name: 'João Silva',
        email: 'joao@email.com',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty email', () => {
      const result = memberFormSchema.safeParse({
        full_name: 'João Silva',
        email: '',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = memberFormSchema.safeParse({
        full_name: 'João Silva',
        email: 'invalid-email',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('phone', () => {
    it('should accept valid phone with area code', () => {
      const result = memberFormSchema.safeParse({
        full_name: 'João Silva',
        phone: '(11) 99999-9999',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty phone', () => {
      const result = memberFormSchema.safeParse({
        full_name: 'João Silva',
        phone: '',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('postal_code', () => {
    it('should accept valid CEP with hyphen', () => {
      const result = memberFormSchema.safeParse({
        full_name: 'João Silva',
        postal_code: '01234-567',
      });
      expect(result.success).toBe(true);
    });

    it('should accept valid CEP without hyphen', () => {
      const result = memberFormSchema.safeParse({
        full_name: 'João Silva',
        postal_code: '01234567',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty postal_code', () => {
      const result = memberFormSchema.safeParse({
        full_name: 'João Silva',
        postal_code: '',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('status', () => {
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
      const result = memberFormSchema.safeParse({
        full_name: 'João Silva',
        status,
      });
      expect(result.success).toBe(true);
    });

    it('should default to COMUNGANTE', () => {
      const result = memberFormSchema.safeParse({ full_name: 'João Silva' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('COMUNGANTE');
      }
    });
  });

  describe('office', () => {
    const validOffices = ['MEMBRO', 'DIACONO', 'PRESBITERO', 'PASTOR'];

    it.each(validOffices)('should accept valid office: %s', (office) => {
      const result = memberFormSchema.safeParse({
        full_name: 'João Silva',
        office,
      });
      expect(result.success).toBe(true);
    });

    it('should default to MEMBRO', () => {
      const result = memberFormSchema.safeParse({ full_name: 'João Silva' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.office).toBe('MEMBRO');
      }
    });
  });

  describe('functions', () => {
    it('should accept empty array', () => {
      const result = memberFormSchema.safeParse({
        full_name: 'João Silva',
        functions: [],
      });
      expect(result.success).toBe(true);
    });

    it('should accept valid functions', () => {
      const result = memberFormSchema.safeParse({
        full_name: 'João Silva',
        functions: ['TESOUREIRO', 'SECRETARIO'],
      });
      expect(result.success).toBe(true);
    });

    it('should default to empty array', () => {
      const result = memberFormSchema.safeParse({ full_name: 'João Silva' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.functions).toEqual([]);
      }
    });
  });

  describe('complete form data', () => {
    it('should accept complete valid form data', () => {
      const completeForm = {
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
        functions: ['TESOUREIRO'],
        admission_date: '2010-01-01',
        admission_type: 'PROFISSAO_FE',
        origin_church: '',
        baptism_date: '2008-03-15',
        profession_of_faith_date: '2010-01-01',
      };

      const result = memberFormSchema.safeParse(completeForm);
      expect(result.success).toBe(true);
    });

    it('should accept minimal form data', () => {
      const result = memberFormSchema.safeParse({ full_name: 'João Silva' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('COMUNGANTE');
        expect(result.data.office).toBe('MEMBRO');
        expect(result.data.functions).toEqual([]);
      }
    });
  });
});
