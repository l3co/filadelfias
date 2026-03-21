import { memo } from 'react';
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { CardSkeleton } from "../../../components/LoadingState";
import { EmptyState } from "../../../components/EmptyState";
import { useEnumLabelsMap } from "../../../hooks/useMetadata";
import type { Member } from "../../../types";
import { User, Pencil, Mail, Phone, UserPlus, Calendar } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface MembersCardsProps {
    members?: Member[];
    isLoading?: boolean;
    onEditMember?: (member: Member) => void;
    onInviteMember?: (member: Member) => void;
    pendingInviteMemberIds?: string[];
}

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'COMUNGANTE': 
        case 'ACTIVE': 
            return 'success';
        case 'NAO_COMUNGANTE': 
        case 'INACTIVE': 
            return 'secondary';
        case 'DISCIPLINA': 
        case 'EXCLUDED': 
            return 'destructive';
        default: 
            return 'outline';
    }
};

const officeColors: Record<string, string> = {
    'PASTOR': 'from-purple-600 to-indigo-600',
    'PRESBITERO': 'from-green-600 to-teal-600',
    'DIACONO': 'from-blue-600 to-cyan-600',
};

const MemberCard = memo(function MemberCard({ 
    member, 
    onEdit, 
    onInvite,
    pendingInviteMemberIds,
    officeLabels,
    statusLabels,
    functionLabels,
}: { 
    member: Member; 
    onEdit?: (member: Member) => void;
    onInvite?: (member: Member) => void;
    pendingInviteMemberIds?: string[];
    officeLabels: Record<string, string>;
    statusLabels: Record<string, string>;
    functionLabels: Record<string, string>;
}) {
    const initials = member.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const gradientClass = officeColors[member.office] || 'from-gray-500 to-gray-600';
    const isInvitePending = pendingInviteMemberIds?.includes(member.id) ?? false;

    return (
        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden" data-testid={`member-card-${member.id}`} role="listitem">
            <CardContent className="p-0">
                {/* Header with gradient */}
                <div className={`h-16 bg-gradient-to-r ${gradientClass} relative`}>
                    <div className="absolute -bottom-8 left-4">
                        <div className="w-16 h-16 rounded-xl bg-white shadow-lg flex items-center justify-center text-xl font-bold text-gray-700 ring-4 ring-white">
                            {initials}
                        </div>
                    </div>
                    {/* Actions */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {member.email && !member.user_id && (
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={isInvitePending}
                                onClick={() => onInvite?.(member)}
                                className="h-8 w-8 p-0 bg-white/20 hover:bg-white/40 text-white"
                                title={isInvitePending ? 'Enviando convite' : 'Convidar para a plataforma'}
                                aria-label={isInvitePending
                                    ? `Enviando convite para ${member.full_name}`
                                    : `Convidar ${member.full_name} para a plataforma`}
                            >
                                <UserPlus size={14} aria-hidden="true" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit?.(member)}
                            className="h-8 w-8 p-0 bg-white/20 hover:bg-white/40 text-white"
                            title="Editar membro"
                            aria-label={`Editar ${member.full_name}`}
                        >
                            <Pencil size={14} aria-hidden="true" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="pt-10 px-4 pb-4">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-[#002333] truncate">{member.full_name}</h3>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {officeLabels[member.office] && member.office !== 'MEMBRO' && (
                                    <Badge variant="default" className={`text-[10px] h-5 bg-gradient-to-r ${gradientClass}`}>
                                        {officeLabels[member.office]}
                                    </Badge>
                                )}
                                <Badge variant={getStatusVariant(member.status)} className="text-[10px] h-5">
                                    {statusLabels[member.status] || member.status}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Functions */}
                    {member.functions && member.functions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {member.functions.map(fn => (
                                <Badge key={fn} variant="outline" className="text-[10px] h-5 text-indigo-600 border-indigo-200">
                                    {functionLabels[fn] || fn}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-1.5 text-sm">
                        {member.email && (
                            <div className="flex items-center gap-2 text-gray-500">
                                <Mail size={14} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
                                <span className="truncate">{member.email}</span>
                            </div>
                        )}
                        {member.phone && (
                            <div className="flex items-center gap-2 text-gray-500">
                                <Phone size={14} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
                                <span>{member.phone}</span>
                            </div>
                        )}
                        {member.birth_date && (
                            <div className="flex items-center gap-2 text-gray-500">
                                <Calendar size={14} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
                                <span>{new Date(member.birth_date).toLocaleDateString('pt-BR')}</span>
                            </div>
                        )}
                    </div>

                    {/* User status indicator */}
                    {member.user_id && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-xs text-green-600">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span>Tem acesso à plataforma</span>
                            </div>
                        </div>
                    )}

                    {isInvitePending && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-xs text-amber-600">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <span>Convite em envio</span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
});

export const MembersCards = memo(function MembersCards({ 
    members, 
    isLoading, 
    onEditMember, 
    onInviteMember,
    pendingInviteMemberIds,
}: MembersCardsProps) {
    // Labels do backend - fonte única de verdade
    const officeLabels = useEnumLabelsMap('ecclesiastical_offices');
    const statusLabels = useEnumLabelsMap('member_statuses');
    const functionLabels = useEnumLabelsMap('ecclesiastical_functions');

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <CardSkeleton key={i} />)}
            </div>
        );
    }

    if (!members || members.length === 0) {
        return (
            <EmptyState
                icon={User}
                title="Nenhum membro cadastrado"
                description="Comece adicionando os membros da sua igreja para gerenciar a membresia."
            />
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {members.map((member) => (
                <MemberCard 
                    key={member.id} 
                    member={member} 
                    onEdit={onEditMember}
                    onInvite={onInviteMember}
                    pendingInviteMemberIds={pendingInviteMemberIds}
                    officeLabels={officeLabels}
                    statusLabels={statusLabels}
                    functionLabels={functionLabels}
                />
            ))}
        </div>
    );
});
