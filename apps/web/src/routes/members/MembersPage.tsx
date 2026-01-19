import { useState } from 'react';
import { Plus, Users, Search, Filter } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentTenant } from '../../hooks/useAuth';
import { useMembers } from '../../features/members/hooks/useMembers';
import { MembersTable } from '../../features/members/components/MembersTable';
import { CreateMemberDialog } from '../../features/members/components/CreateMemberDialog';
import { EditMemberDialog } from '../../features/members/components/EditMemberDialog';
import { InviteSuccessDialog } from '../../features/members/components/InviteSuccessDialog';
import { Button } from '../../components/ui/button';
import { api } from '../../lib/api';
import type { Member } from '../../types';

interface InviteResult {
    success: boolean;
    message: string;
    temporary_password: string | null;
    email_sent: boolean;
}

export function MembersPage() {
    const tenant = useCurrentTenant();
    const queryClient = useQueryClient();
    const { data: members, isLoading } = useMembers(tenant?.id);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [inviteResult, setInviteResult] = useState<{ member: Member; result: InviteResult } | null>(null);

    const inviteMutation = useMutation({
        mutationFn: async (member: Member) => {
            const response = await api.post<InviteResult>(`/tenants/${tenant?.id}/members/${member.id}/invite`);
            return { member, result: response.data };
        },
        onSuccess: (data) => {
            setInviteResult(data);
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
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, email..."
                        className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-gray-400"
                    />
                </div>
                <Button variant="outline" className="gap-2">
                    <Filter size={16} />
                    Filtros
                </Button>
            </div>

            {/* Table */}
            <MembersTable 
                members={members} 
                isLoading={isLoading} 
                onEditMember={(member) => setEditingMember(member)}
                onInviteMember={(member) => inviteMutation.mutate(member)}
            />

            {/* Create Dialog */}
            <CreateMemberDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                tenantId={tenant.id}
            />

            {/* Edit Dialog */}
            <EditMemberDialog
                isOpen={!!editingMember}
                onClose={() => setEditingMember(null)}
                member={editingMember}
                tenantId={tenant.id}
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
