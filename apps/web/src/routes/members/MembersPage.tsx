import { useState, useMemo } from 'react';
import { Plus, Users, Search, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentTenant } from '../../hooks/useAuth';
import { useMembers } from '../../features/members/hooks/useMembers';
import { MembersCards } from '../../features/members/components/MembersCards';
import { MemberDialog } from '../../features/members/components/MemberDialog';
import { InviteMemberDialog } from '../../features/members/components/InviteMemberDialog';
import { InviteSuccessDialog } from '../../features/members/components/InviteSuccessDialog';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { api } from '../../lib/api';
import type { Member } from '../../types';

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
    const tenant = useCurrentTenant();
    const queryClient = useQueryClient();
    const { data: members, isLoading } = useMembers(tenant?.id);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [inviteMember, setInviteMember] = useState<Member | null>(null);
    const [inviteResult, setInviteResult] = useState<{ member: Member; result: InviteResult } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [officeFilter, setOfficeFilter] = useState<string | null>(null);

    const filteredMembers = useMemo(() => {
        if (!members) return [];

        return members.filter(member => {
            const matchesSearch = searchQuery === '' ||
                member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.phone?.includes(searchQuery);

            const matchesOffice = !officeFilter || member.office === officeFilter;

            return matchesSearch && matchesOffice;
        });
    }, [members, searchQuery, officeFilter]);

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
        onSuccess: (data) => {
            setInviteResult(data);
            setInviteMember(null);
            queryClient.invalidateQueries({ queryKey: ['members', tenant?.id] });
        }
    });

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

    const memberCount = members?.length || 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-green-50 to-teal-50">
                        <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#002333]">Membros</h1>
                        <p className="text-gray-500 mt-0.5">
                            {memberCount > 0 ? `${memberCount} membros em ${tenant.name}` : `Gerencie a membresia da ${tenant.name}`}
                        </p>
                    </div>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Membro
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por nome, email, telefone..."
                            className="w-full pl-11 pr-10 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-gray-400"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Office Filters */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setOfficeFilter(null)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${!officeFilter
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Todos
                        <Badge variant="secondary" className="ml-2 bg-white/20">{members?.length || 0}</Badge>
                    </button>
                    {Object.entries(officeLabels).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setOfficeFilter(officeFilter === key ? null : key)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${officeFilter === key
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {label}
                            {officeCounts[key] && (
                                <Badge variant="secondary" className="ml-2">{officeCounts[key]}</Badge>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cards */}
            <MembersCards
                members={filteredMembers}
                isLoading={isLoading}
                onEditMember={(member) => setEditingMember(member)}
                onInviteMember={(member) => setInviteMember(member)}
            />

            {/* Create/Edit Dialog (Unified) */}
            <MemberDialog
                isOpen={isCreateOpen || !!editingMember}
                onClose={() => {
                    setIsCreateOpen(false);
                    setEditingMember(null);
                }}
                tenantId={tenant.id}
                member={editingMember}
            />

            {/* Invite Dialog (Confirm & Role Selection) */}
            <InviteMemberDialog
                isOpen={!!inviteMember}
                onClose={() => setInviteMember(null)}
                member={inviteMember}
                onInvite={(member, role) => inviteMutation.mutate({ member, role })}
                isLoading={inviteMutation.isPending}
            />

            {/* Invite Success Dialog */}
            {inviteResult && (
                <InviteSuccessDialog
                    isOpen={!!inviteResult}
                    onClose={() => setInviteResult(null)}
                    memberName={inviteResult.member.full_name}
                    memberEmail={inviteResult.member.email || ''}
                    temporaryPassword={inviteResult.result.temporary_password || ''}
                    emailSent={inviteResult.result.email_sent}
                />
            )}
        </div>
    );
}
