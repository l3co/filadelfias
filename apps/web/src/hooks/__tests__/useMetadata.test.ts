/**
 * @vitest-environment node
 * 
 * Tests for useMetadata hook and helper functions.
 * Note: These tests mock react-query since we're testing in node environment.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock react-query - must be before imports
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

// Mock api
vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

import { useQuery } from '@tanstack/react-query';
const mockUseQuery = vi.mocked(useQuery);

import {
  useMetadata,
  useOfficeOptions,
  useFunctionOptions,
  useStatusOptions,
  useGenderOptions,
  useMaritalStatusOptions,
  useAdmissionTypeOptions,
  useEnumLabel,
  useEnumLabelsMap,
  type Metadata,
} from '../useMetadata';

const mockMetadata: Metadata = {
  enums: {
    ecclesiastical_offices: [
      { value: 'MEMBRO', label: 'Membro' },
      { value: 'DIACONO', label: 'Diácono' },
      { value: 'PRESBITERO', label: 'Presbítero' },
      { value: 'PASTOR', label: 'Pastor' },
    ],
    ecclesiastical_functions: [
      { value: 'TESOUREIRO', label: 'Tesoureiro' },
      { value: 'SECRETARIO', label: 'Secretário' },
      { value: 'EVANGELISTA', label: 'Evangelista' },
      { value: 'MISSIONARIO', label: 'Missionário' },
    ],
    member_statuses: [
      { value: 'COMUNGANTE', label: 'Comungante' },
      { value: 'NAO_COMUNGANTE', label: 'Não Comungante' },
      { value: 'PROCESSO', label: 'Em Processo' },
      { value: 'DISCIPLINA', label: 'Sob Disciplina' },
      { value: 'AFASTADO', label: 'Afastado' },
      { value: 'TRANSFERIDO', label: 'Transferido' },
      { value: 'FALECIDO', label: 'Falecido' },
    ],
    genders: [
      { value: 'M', label: 'Masculino' },
      { value: 'F', label: 'Feminino' },
    ],
    marital_statuses: [
      { value: 'SOLTEIRO', label: 'Solteiro(a)' },
      { value: 'CASADO', label: 'Casado(a)' },
      { value: 'DIVORCIADO', label: 'Divorciado(a)' },
      { value: 'VIUVO', label: 'Viúvo(a)' },
    ],
    admission_types: [
      { value: 'PROFISSAO_FE', label: 'Profissão de Fé' },
      { value: 'TRANSFERENCIA', label: 'Transferência' },
      { value: 'JURISDICAO', label: 'Jurisdição' },
    ],
  },
};

describe('useMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useMetadata hook', () => {
    it('should call useQuery with correct configuration', () => {
      mockUseQuery.mockReturnValue({ data: mockMetadata, isLoading: false });

      useMetadata();

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ['metadata'],
        queryFn: expect.any(Function),
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60 * 24,
      });
    });

    it('should return metadata when loaded', () => {
      mockUseQuery.mockReturnValue({ data: mockMetadata, isLoading: false });

      const result = useMetadata();

      expect(result.data).toEqual(mockMetadata);
      expect(result.isLoading).toBe(false);
    });
  });

  describe('useOfficeOptions', () => {
    it('should return office options when metadata is loaded', () => {
      mockUseQuery.mockReturnValue({ data: mockMetadata });

      const options = useOfficeOptions();

      expect(options).toHaveLength(4);
      expect(options[0]).toEqual({ value: 'MEMBRO', label: 'Membro' });
    });

    it('should return empty array when metadata is not loaded', () => {
      mockUseQuery.mockReturnValue({ data: undefined });

      const options = useOfficeOptions();

      expect(options).toEqual([]);
    });
  });

  describe('useFunctionOptions', () => {
    it('should return function options when metadata is loaded', () => {
      mockUseQuery.mockReturnValue({ data: mockMetadata });

      const options = useFunctionOptions();

      expect(options).toHaveLength(4);
      expect(options[0]).toEqual({ value: 'TESOUREIRO', label: 'Tesoureiro' });
    });

    it('should return empty array when metadata is not loaded', () => {
      mockUseQuery.mockReturnValue({ data: undefined });

      const options = useFunctionOptions();

      expect(options).toEqual([]);
    });
  });

  describe('useStatusOptions', () => {
    it('should return status options when metadata is loaded', () => {
      mockUseQuery.mockReturnValue({ data: mockMetadata });

      const options = useStatusOptions();

      expect(options).toHaveLength(7);
      expect(options[0]).toEqual({ value: 'COMUNGANTE', label: 'Comungante' });
    });

    it('should return empty array when metadata is not loaded', () => {
      mockUseQuery.mockReturnValue({ data: undefined });

      const options = useStatusOptions();

      expect(options).toEqual([]);
    });
  });

  describe('useGenderOptions', () => {
    it('should return gender options when metadata is loaded', () => {
      mockUseQuery.mockReturnValue({ data: mockMetadata });

      const options = useGenderOptions();

      expect(options).toEqual([
        { value: 'M', label: 'Masculino' },
        { value: 'F', label: 'Feminino' },
      ]);
    });

    it('should return empty array when metadata is not loaded', () => {
      mockUseQuery.mockReturnValue({ data: undefined });

      const options = useGenderOptions();

      expect(options).toEqual([]);
    });
  });

  describe('useMaritalStatusOptions', () => {
    it('should return marital status options when metadata is loaded', () => {
      mockUseQuery.mockReturnValue({ data: mockMetadata });

      const options = useMaritalStatusOptions();

      expect(options).toHaveLength(4);
    });

    it('should return empty array when metadata is not loaded', () => {
      mockUseQuery.mockReturnValue({ data: undefined });

      const options = useMaritalStatusOptions();

      expect(options).toEqual([]);
    });
  });

  describe('useAdmissionTypeOptions', () => {
    it('should return admission type options when metadata is loaded', () => {
      mockUseQuery.mockReturnValue({ data: mockMetadata });

      const options = useAdmissionTypeOptions();

      expect(options).toHaveLength(3);
    });

    it('should return empty array when metadata is not loaded', () => {
      mockUseQuery.mockReturnValue({ data: undefined });

      const options = useAdmissionTypeOptions();

      expect(options).toEqual([]);
    });
  });

  describe('useEnumLabel', () => {
    it('should return label for valid value', () => {
      mockUseQuery.mockReturnValue({ data: mockMetadata });

      const label = useEnumLabel('ecclesiastical_offices', 'PASTOR');

      expect(label).toBe('Pastor');
    });

    it('should return value when label not found', () => {
      mockUseQuery.mockReturnValue({ data: mockMetadata });

      const label = useEnumLabel('ecclesiastical_offices', 'UNKNOWN');

      expect(label).toBe('UNKNOWN');
    });

    it('should return empty string for null value', () => {
      mockUseQuery.mockReturnValue({ data: mockMetadata });

      const label = useEnumLabel('ecclesiastical_offices', null);

      expect(label).toBe('');
    });

    it('should return empty string for undefined value', () => {
      mockUseQuery.mockReturnValue({ data: mockMetadata });

      const label = useEnumLabel('ecclesiastical_offices', undefined);

      expect(label).toBe('');
    });
  });

  describe('useEnumLabelsMap', () => {
    it('should return map of value to label', () => {
      mockUseQuery.mockReturnValue({ data: mockMetadata });

      const map = useEnumLabelsMap('genders');

      expect(map).toEqual({
        M: 'Masculino',
        F: 'Feminino',
      });
    });

    it('should return empty object when metadata is not loaded', () => {
      mockUseQuery.mockReturnValue({ data: undefined });

      const map = useEnumLabelsMap('genders');

      expect(map).toEqual({});
    });

    it('should return complete map for all offices', () => {
      mockUseQuery.mockReturnValue({ data: mockMetadata });

      const map = useEnumLabelsMap('ecclesiastical_offices');

      expect(map).toEqual({
        MEMBRO: 'Membro',
        DIACONO: 'Diácono',
        PRESBITERO: 'Presbítero',
        PASTOR: 'Pastor',
      });
    });
  });
});
