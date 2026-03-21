import { Suspense, useState, useMemo, useCallback, useDeferredValue, startTransition, useOptimistic } from 'react';
import { Plus, Users } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMembers } from '../../features/members/hooks/useMembers';
import { MembersPageClient } from '../../features/members/client/MembersPageClient';
import { MembersSummary } from '../../features/members/client/MembersSummary';
import { MemberDialog } from '../../features/members/components/MemberDialog';
import { InviteMemberDialog } from '../../features/members/components/InviteMemberDialog';
import { InviteSuccessDialog } from '../../features/members/components/InviteSuccessDialog';
import { Button } from '../../components/ui/button';
import { SearchAndFilter } from '../../components/patterns/SearchAndFilter';
import { PageHeaderWithIcon } from '../../components/PageHeader';
import { api } from '../../lib/api';
import type { Member } from '../../types';
import { useAuthTenant } from '../../contexts/AuthContext';

interface InviteResult {
    success: boolean;
    message: string;
    temporary_password: string | null;
    email_sent: boolean;
}

const officeLabels: Record<string, string> = {
    PASTOR: 'Pastor',
    PRESBITERO: 'Presbítero',
    DIACONO: 'Diácono',
    MEMBRO: 'Membro',
};

export function MembersPage() {
    const tenant = useAuthTenant();
    const queryClient = useQueryClient();
    const { data: members, dataUpdatedAt, isLoading } = useMembers(tenant?.id);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [inviteMember, setInviteMember] = useState<Member | null>(null);
    const [inviteResult, setInviteResult] = useState<{ member: Member; result: InviteResult } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [officeFilter, setOfficeFilter] = useState<string | null>(null);
    const [pendingInviteMemberIds, updatePendingInviteMemberIds] = useOptimistic<
        string[],
        { memberId: string; type: 'start' | 'finish' }
    >([], (currentState, action) => {
        if (action.type === 'start') {
            return currentState.includes(action.memberId)
                ? currentState
                : [...currentState, action.memberId];
        }

        return currentState.filter((memberId) => memberId !== action.memberId);
    });
    const deferredSearchQuery = useDeferredValue(searchQuery);
    const deferredOfficeFilter = useDeferredValue(officeFilter);

    const filteredMembers = useMemo(() => {
        if (!members) return [];

        return members.filter(member => {
            const normalizedSearch = deferredSearchQuery.trim().toLowerCase();
            const matchesSearch = normalizedSearch === '' ||
                member.full_name.toLowerCase().includes(normalizedSearch) ||
                member.email?.toLowerCase().includes(normalizedSearch) ||
                member.phone?.includes(deferredSearchQuery);

            const matchesOffice = !deferredOfficeFilter || member.office === deferredOfficeFilter;

            return matchesSearch && matchesOffice;
        });
    }, [members, deferredSearchQuery, deferredOfficeFilter]);

    const officeCounts = useMemo(() => {
        if (!members) return {};
        return members.reduce((acc, m) => {
            const office = m.office || 'MEMBRO';
            acc[office] = (acc[office] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [members]);

    const inviteMutation = useMutation({
        mutationFn: async ({ member, role }: { member: Member; role: 'ADMIN' | 'MEMBER' }) => {
            const response = await api.post<InviteResult>(
                `/tenants/${tenant?.id}/members/${member.id}/invite`,
                {},
                { params: { role } }
            );
            return { member, result: response.data };
        },
    });

    const handleCreateOpen = useCallback(() => {
        setIsCreateOpen(true);
    }, []);

    const handleEditMember = useCallback((member: Member) => {
        setEditingMember(member);
    }, []);

    const handleInviteMember = useCallback((member: Member) => {
        setInviteMember(member);
    }, []);

    const handleInviteSubmit = useCallback(async (member: Member, role: 'ADMIN' | 'MEMBER') => {
        startTransition(() => {
            updatePendingInviteMemberIds({ memberId: member.id, type: 'start' });
        });

        try {
            const data = await inviteMutation.mutateAsync({ member, role });
            setInviteResult(data);
            setInviteMember(null);
            await queryClient.invalidateQueries({ queryKey: ['members', tenant?.id] });
        } finally {
            startTransition(() => {
                updatePendingInviteMemberIds({ memberId: member.id, type: 'finish' });
            });
        }
    }, [inviteMutation, queryClient, tenant?.id, updatePendingInviteMemberIds]);

    const handleMemberDialogClose = useCallback(() => {
        setIsCreateOpen(false);
        setEditingMember(null);
    }, []);

    const handleInviteDialogClose = useCallback(() => {
        setInviteMember(null);
    }, []);

    const handleInviteSuccessClose = useCallback(() => {
        setInviteResult(null);
    }, []);

    const handleSearchChange = useCallback((value: string) => {
        startTransition(() => {
            setSearchQuery(value);
        });
    }, []);

    const handleClearSearch = useCallback(() => {
        startTransition(() => {
            setSearchQuery('');
        });
    }, []);

    const handleOfficeFilterChange = useCallback((office: string | null) => {
        startTransition(() => {
            setOfficeFilter((current) => current === office ? null : office);
        });
    }, []);

    const memberCount = members?.length || 0;
    const officeFilters = useMemo(
        () => [
            { key: null, label: 'Todos', count: memberCount },
            ...Object.entries(officeLabels).map(([key, label]) => ({
                key,
                label,
                count: officeCounts[key],
            })),
        ],
        [memberCount, officeCounts],
    );

    if (!tenant) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                    <span className="text-3xl">⚠️</span>
                </div>
                <h2 className="text-lg font-semibold text-[#002333]">Nenhuma igreja vinculada</h2>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                    Sua conta não está vinculada a nenhuma igreja. Complete o onboarding para continuar.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeaderWithIcon
                icon={Users}
                title="Membros"
                description={
                    memberCount > 0 ? `${memberCount} membros em ${tenant.name}` : `Gerencie a membresia da ${tenant.name}`
                }
                actions={
                    <Button onClick={handleCreateOpen} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Membro
                    </Button>
                }
            />

            <SearchAndFilter
                searchValue={searchQuery}
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}
                searchPlaceholder="Buscar por nome, email, telefone..."
                filters={officeFilters}
                activeFilter={officeFilter}
                onFilterChange={handleOfficeFilterChange}
            />

            <Suspense
                fallback={
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="h-28 rounded-2xl bg-slate-100" />
                        <div className="h-28 rounded-2xl bg-slate-100" />
                        <div className="h-28 rounded-2xl bg-slate-100" />
                    </div>
                }
            >
                <MembersSummary tenantId={tenant.id} refreshKey={String(dataUpdatedAt)} />
            </Suspense>

            <MembersPageClient
                members={filteredMembers}
                isLoading={isLoading}
                onEditMember={handleEditMember}
                onInviteMember={handleInviteMember}
                pendingInviteMemberIds={pendingInviteMemberIds}
            />

            {/* Create/Edit Dialog (Unified) */}
            <MemberDialog
                isOpen={isCreateOpen || !!editingMember}
                onClose={handleMemberDialogClose}
                tenantId={tenant.id}
                member={editingMember}
            />

            {/* Invite Dialog (Confirm & Role Selection) */}
            <InviteMemberDialog
                isOpen={!!inviteMember}
                onClose={handleInviteDialogClose}
                member={inviteMember}
                onInvite={handleInviteSubmit}
                isLoading={inviteMutation.isPending}
            />

            {/* Invite Success Dialog */}
            {inviteResult && (
                <InviteSuccessDialog
                    isOpen={!!inviteResult}
                    onClose={handleInviteSuccessClose}
                    memberName={inviteResult.member.full_name}
                    memberEmail={inviteResult.member.email || ''}
                    temporaryPassword={inviteResult.result.temporary_password || ''}
                    emailSent={inviteResult.result.email_sent}
                />
            )}
        </div>
    );
}
