import { memo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { TableSkeleton } from "../../../components/LoadingState";
import { EmptyState } from "../../../components/EmptyState";
import type { Member } from "../../../types";
import { User, Pencil, Mail, Phone, UserPlus } from "lucide-react";

interface MembersTableProps {
    members?: Member[];
    isLoading?: boolean;
    onEditMember?: (member: Member) => void;
    onInviteMember?: (member: Member) => void;
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

const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        'COMUNGANTE': 'Comungante',
        'ACTIVE': 'Ativo',
        'NAO_COMUNGANTE': 'Não Comungante',
        'INACTIVE': 'Inativo',
        'DISCIPLINA': 'Em Disciplina',
        'EXCLUDED': 'Excluído',
        'TRANSFERRED': 'Transferido',
        'DECEASED': 'Falecido',
    };
    return labels[status] || status;
};

const officeLabels: Record<string, string> = {
    'PASTOR': 'Pastor',
    'PRESBITERO': 'Presbítero',
    'DIACONO': 'Diácono',
};

const MemberRow = memo(function MemberRow({ 
    member, 
    onEdit, 
    onInvite 
}: { 
    member: Member; 
    onEdit?: (member: Member) => void;
    onInvite?: (member: Member) => void;
}) {
    return (
        <TableRow className="group hover:bg-gray-50/50 transition-colors">
            <TableCell className="font-medium py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center text-green-700 font-bold shadow-sm ring-2 ring-white">
                        {member.full_name.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center">
                            <span className="font-semibold text-[#002333]">{member.full_name}</span>
                            {officeLabels[member.office] && (
                                <Badge variant="default" className="ml-2 text-[10px] h-5 bg-gradient-to-r from-green-600 to-teal-600">
                                    {officeLabels[member.office]}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <Badge variant={getStatusVariant(member.status)}>
                    {getStatusLabel(member.status)}
                </Badge>
            </TableCell>
            <TableCell>
                <div className="space-y-1">
                    {member.email && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Mail size={14} />
                            <span>{member.email}</span>
                        </div>
                    )}
                    {member.phone && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Phone size={14} />
                            <span>{member.phone}</span>
                        </div>
                    )}
                    {!member.email && !member.phone && (
                        <span className="text-gray-400 text-sm">—</span>
                    )}
                </div>
            </TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {member.email && !member.user_id && (
                        <button 
                            onClick={() => onInvite?.(member)}
                            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Convidar para a plataforma"
                        >
                            <UserPlus size={16} />
                        </button>
                    )}
                    <button 
                        onClick={() => onEdit?.(member)}
                        className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                        title="Editar membro"
                    >
                        <Pencil size={16} />
                    </button>
                </div>
            </TableCell>
        </TableRow>
    );
});

export const MembersTable = memo(function MembersTable({ 
    members, 
    isLoading, 
    onEditMember, 
    onInviteMember 
}: MembersTableProps) {
    if (isLoading) {
        return <TableSkeleton rows={5} />;
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50/80 border-b border-gray-100">
                        <TableHead className="w-[350px] font-semibold text-[#002333]">Membro</TableHead>
                        <TableHead className="font-semibold text-[#002333]">Status</TableHead>
                        <TableHead className="font-semibold text-[#002333]">Contato</TableHead>
                        <TableHead className="text-right font-semibold text-[#002333]">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.map((member) => (
                        <MemberRow 
                            key={member.id} 
                            member={member} 
                            onEdit={onEditMember}
                            onInvite={onInviteMember}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
});
