import { bench, describe } from 'vitest';
import type { Member } from '../../types';

const mockMembers: Member[] = Array.from({ length: 500 }, (_, index) => ({
  id: `member-${index}`,
  tenant_id: 'tenant-1',
  full_name: `Membro ${index}`,
  email: `membro${index}@example.com`,
  phone: `1199999${String(index).padStart(4, '0')}`,
  status: 'COMUNGANTE',
  role: 'MEMBER',
  office: index % 10 === 0 ? 'DIACONO' : 'MEMBRO',
  functions: index % 20 === 0 ? ['TESOUREIRO'] : [],
  created_at: '2026-03-19T00:00:00Z',
  updated_at: '2026-03-19T00:00:00Z',
}));

function filterMembers(members: Member[], searchQuery: string, officeFilter: string | null) {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  return members.filter((member) => {
    const matchesSearch = normalizedSearch === ''
      || member.full_name.toLowerCase().includes(normalizedSearch)
      || member.email?.toLowerCase().includes(normalizedSearch)
      || member.phone?.includes(searchQuery);

    const matchesOffice = !officeFilter || member.office === officeFilter;

    return matchesSearch && matchesOffice;
  });
}

describe('Members filter benchmarks', () => {
  bench('filter 500 members by search and office', () => {
    filterMembers(mockMembers, 'membro 2', 'DIACONO');
  });
});
