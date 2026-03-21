import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/utils';
import { MembersPage } from './MembersPage';

vi.mock('../../contexts/AuthContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../contexts/AuthContext')>();

  return {
    ...actual,
    useAuthTenant: vi.fn(),
  };
});

vi.mock('../../features/members/hooks/useMembers', () => ({
  useMembers: vi.fn(),
}));

vi.mock('../../features/members/client/MembersPageClient', () => ({
  MembersPageClient: vi.fn(({ members, isLoading, onEditMember, onInviteMember }) => (
    <div>
      <div data-testid="members-loading">{String(isLoading)}</div>
      <ul>
        {members.map((member: { id: string; full_name: string }) => (
          <li key={member.id}>
            <span>{member.full_name}</span>
            <button type="button" onClick={() => onEditMember(member)}>
              Editar {member.full_name}
            </button>
            <button type="button" onClick={() => onInviteMember(member)}>
              Convidar {member.full_name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )),
}));

vi.mock('../../features/members/client/MembersSummary', () => ({
  MembersSummary: vi.fn(() => null),
}));

vi.mock('../../features/members/components/MemberDialog', () => ({
  MemberDialog: vi.fn(({ isOpen, member }) =>
    isOpen ? <div>MemberDialog {member?.full_name ?? 'novo'}</div> : null,
  ),
}));

vi.mock('../../features/members/components/InviteMemberDialog', () => ({
  InviteMemberDialog: vi.fn(({ isOpen, member }) =>
    isOpen ? <div>InviteDialog {member?.full_name}</div> : null,
  ),
}));

vi.mock('../../features/members/components/InviteSuccessDialog', () => ({
  InviteSuccessDialog: vi.fn(() => null),
}));

import { useAuthTenant } from '../../contexts/AuthContext';
import { useMembers } from '../../features/members/hooks/useMembers';

const mockUseAuthTenant = vi.mocked(useAuthTenant);
const mockUseMembers = vi.mocked(useMembers);

describe('MembersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty tenant state when no tenant is linked', () => {
    mockUseAuthTenant.mockReturnValue(null);
    mockUseMembers.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as ReturnType<typeof useMembers>);

    renderWithProviders(<MembersPage />);

    expect(screen.getByText('Nenhuma igreja vinculada')).toBeInTheDocument();
  });

  it('filters members by search query and office', async () => {
    mockUseAuthTenant.mockReturnValue({
      id: 'tenant-1',
      name: 'Igreja Teste',
      slug: 'igreja-teste',
    });
    mockUseMembers.mockReturnValue({
      data: [
        { id: '1', full_name: 'João Silva', office: 'PASTOR', email: 'joao@test.com', phone: '1111' },
        { id: '2', full_name: 'Maria Souza', office: 'DIACONO', email: 'maria@test.com', phone: '2222' },
        { id: '3', full_name: 'Pedro Santos', office: 'MEMBRO', email: 'pedro@test.com', phone: '3333' },
      ],
      isLoading: false,
    } as ReturnType<typeof useMembers>);

    renderWithProviders(<MembersPage />);

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Maria Souza')).toBeInTheDocument();
    expect(screen.getByText('Pedro Santos')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Buscar por nome, email, telefone...'), {
      target: { value: 'maria' },
    });

    await waitFor(() => {
      expect(screen.queryByText('João Silva')).not.toBeInTheDocument();
      expect(screen.getByText('Maria Souza')).toBeInTheDocument();
      expect(screen.queryByText('Pedro Santos')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /diácono/i }));

    expect(screen.getByText('Maria Souza')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /todos/i }));

    expect(screen.getByText('Maria Souza')).toBeInTheDocument();
  });

  it('opens create, edit and invite flows from page actions', () => {
    mockUseAuthTenant.mockReturnValue({
      id: 'tenant-1',
      name: 'Igreja Teste',
      slug: 'igreja-teste',
    });
    mockUseMembers.mockReturnValue({
      data: [
        { id: '1', full_name: 'João Silva', office: 'PASTOR', email: 'joao@test.com', phone: '1111' },
      ],
      isLoading: false,
    } as ReturnType<typeof useMembers>);

    renderWithProviders(<MembersPage />);

    fireEvent.click(screen.getByRole('button', { name: /novo membro/i }));
    expect(screen.getByText('MemberDialog novo')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /editar joão silva/i }));
    expect(screen.getByText('MemberDialog João Silva')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /convidar joão silva/i }));
    expect(screen.getByText('InviteDialog João Silva')).toBeInTheDocument();
  });
});
