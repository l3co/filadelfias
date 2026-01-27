/**
 * @vitest-environment node
 * 
 * Contract tests for API response schemas.
 * These tests ensure that the frontend schemas match the expected backend response structure.
 */
import { describe, it, expect } from 'vitest';
import {
  tokenResponseSchema,
  authResponseSchema,
  userResponseSchema,
  memberResponseSchema,
  memberListResponseSchema,
  tenantResponseSchema,
  membershipResponseSchema,
  metadataResponseSchema,
  memberStatusEnum,
  ecclesiasticalOfficeEnum,
  ecclesiasticalFunctionEnum,
  genderEnum,
  maritalStatusEnum,
} from '../api-contracts';

describe('API Contract Schemas', () => {
  describe('Enums', () => {
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

      it('should reject functions not in backend enum', () => {
        // These are UI-only functions, not in backend enum
        expect(ecclesiasticalFunctionEnum.safeParse('MUSICO').success).toBe(false);
        expect(ecclesiasticalFunctionEnum.safeParse('PROFESSOR_EBD').success).toBe(false);
      });
    });

    describe('genderEnum', () => {
      it('should accept M and F', () => {
        expect(genderEnum.safeParse('M').success).toBe(true);
        expect(genderEnum.safeParse('F').success).toBe(true);
      });

      it('should reject other values', () => {
        expect(genderEnum.safeParse('X').success).toBe(false);
        expect(genderEnum.safeParse('MASCULINO').success).toBe(false);
      });
    });

    describe('maritalStatusEnum', () => {
      const validStatuses = ['SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO'];

      it.each(validStatuses)('should accept valid marital status: %s', (status) => {
        expect(maritalStatusEnum.safeParse(status).success).toBe(true);
      });
    });
  });

  describe('tokenResponseSchema', () => {
    it('should accept valid token response', () => {
      const response = {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'bearer',
      };
      expect(tokenResponseSchema.safeParse(response).success).toBe(true);
    });

    it('should reject missing access_token', () => {
      const response = { token_type: 'bearer' };
      expect(tokenResponseSchema.safeParse(response).success).toBe(false);
    });
  });

  describe('tenantResponseSchema', () => {
    it('should accept valid tenant response', () => {
      const response = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Igreja Presbiteriana Central',
        slug: 'ipc-central',
        logo_url: null,
        street: 'Rua das Flores',
        number: '123',
        complement: null,
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        postal_code: '01234-567',
        country: 'Brasil',
        phone: '(11) 99999-9999',
        email: 'contato@ipc.org.br',
      };
      expect(tenantResponseSchema.safeParse(response).success).toBe(true);
    });

    it('should accept tenant with all nullable fields as null', () => {
      const response = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Igreja',
        slug: 'igreja',
        logo_url: null,
        street: null,
        number: null,
        complement: null,
        neighborhood: null,
        city: null,
        state: null,
        postal_code: null,
        country: 'Brasil',
        phone: null,
        email: null,
      };
      expect(tenantResponseSchema.safeParse(response).success).toBe(true);
    });
  });

  describe('userResponseSchema', () => {
    it('should accept valid user response', () => {
      const response = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        name: 'João Silva',
        avatar_url: null,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        memberships: [],
      };
      expect(userResponseSchema.safeParse(response).success).toBe(true);
    });

    it('should accept user with memberships', () => {
      const response = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        name: 'João Silva',
        avatar_url: 'https://example.com/avatar.jpg',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        memberships: [
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            tenant: {
              id: '123e4567-e89b-12d3-a456-426614174002',
              name: 'Igreja',
              slug: 'igreja',
              logo_url: null,
              street: null,
              number: null,
              complement: null,
              neighborhood: null,
              city: null,
              state: null,
              postal_code: null,
              country: 'Brasil',
              phone: null,
              email: null,
            },
            role: 'ADMIN',
            status: 'ACTIVE',
            joined_at: '2024-01-01T00:00:00Z',
          },
        ],
      };
      expect(userResponseSchema.safeParse(response).success).toBe(true);
    });

    it('should reject invalid email', () => {
      const response = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'invalid-email',
        name: 'João Silva',
        avatar_url: null,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        memberships: [],
      };
      expect(userResponseSchema.safeParse(response).success).toBe(false);
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

    it('should reject member with invalid function', () => {
      const invalidMember = { ...validMember, functions: ['MUSICO'] };
      expect(memberResponseSchema.safeParse(invalidMember).success).toBe(false);
    });

    it('should accept member with multiple functions', () => {
      const memberWithFunctions = {
        ...validMember,
        functions: ['TESOUREIRO', 'SECRETARIO'],
      };
      expect(memberResponseSchema.safeParse(memberWithFunctions).success).toBe(true);
    });

    it('should accept all valid status values', () => {
      const statuses = [
        'PROCESSO',
        'COMUNGANTE',
        'NAO_COMUNGANTE',
        'DISCIPLINA',
        'AFASTADO',
        'TRANSFERIDO',
        'FALECIDO',
      ];
      statuses.forEach((status) => {
        const member = { ...validMember, status };
        expect(memberResponseSchema.safeParse(member).success).toBe(true);
      });
    });
  });

  describe('memberListResponseSchema', () => {
    it('should accept array of members', () => {
      const members = [
        {
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
        },
      ];
      expect(memberListResponseSchema.safeParse(members).success).toBe(true);
    });

    it('should accept empty array', () => {
      expect(memberListResponseSchema.safeParse([]).success).toBe(true);
    });
  });

  describe('metadataResponseSchema', () => {
    it('should accept valid metadata response', () => {
      const response = {
        ecclesiastical_offices: [
          { value: 'MEMBRO', label: 'Membro' },
          { value: 'DIACONO', label: 'Diácono' },
          { value: 'PRESBITERO', label: 'Presbítero' },
          { value: 'PASTOR', label: 'Pastor' },
        ],
        ecclesiastical_functions: [
          { value: 'TESOUREIRO', label: 'Tesoureiro' },
          { value: 'SECRETARIO', label: 'Secretário' },
        ],
        member_statuses: [
          { value: 'COMUNGANTE', label: 'Comungante' },
          { value: 'NAO_COMUNGANTE', label: 'Não Comungante' },
        ],
        genders: [
          { value: 'M', label: 'Masculino' },
          { value: 'F', label: 'Feminino' },
        ],
        marital_statuses: [
          { value: 'SOLTEIRO', label: 'Solteiro(a)' },
          { value: 'CASADO', label: 'Casado(a)' },
        ],
        admission_types: [
          { value: 'PROFISSAO_FE', label: 'Profissão de Fé' },
          { value: 'TRANSFERENCIA', label: 'Transferência' },
        ],
      };
      expect(metadataResponseSchema.safeParse(response).success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const response = {
        ecclesiastical_offices: [],
        // missing other fields
      };
      expect(metadataResponseSchema.safeParse(response).success).toBe(false);
    });
  });

  describe('authResponseSchema', () => {
    it('should accept valid auth response', () => {
      const response = {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'bearer',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user@example.com',
          name: 'João Silva',
          avatar_url: null,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          memberships: [],
        },
        must_change_password: false,
      };
      expect(authResponseSchema.safeParse(response).success).toBe(true);
    });

    it('should accept auth response without must_change_password', () => {
      const response = {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'bearer',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user@example.com',
          name: 'João Silva',
          avatar_url: null,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          memberships: [],
        },
      };
      expect(authResponseSchema.safeParse(response).success).toBe(true);
    });
  });
});
