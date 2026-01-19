import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import type { Member } from "../../../types";
import { User, Pencil, Mail, Phone } from "lucide-react";

interface MembersTableProps {
    members?: Member[];
    isLoading?: boolean;
    onEditMember?: (member: Member) => void;
}

export function MembersTable({ members, isLoading, onEditMember }: MembersTableProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4 animate-pulse">
                            <div className="w-10 h-10 rounded-xl bg-gray-100" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-100 rounded w-1/3" />
                                <div className="h-3 bg-gray-50 rounded w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!members || members.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center mb-4">
                    <User className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-[#002333]">Nenhum membro cadastrado</h3>
                <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                    Comece adicionando os membros da sua igreja para gerenciar a membresia.
                </p>
            </div>
        );
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'COMUNGANTE': return 'success';
            case 'NAO_COMUNGANTE': return 'secondary';
            case 'DISCIPLINA': return 'destructive';
            default: return 'outline';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'COMUNGANTE': return 'Comungante';
            case 'NAO_COMUNGANTE': return 'Não Comungante';
            case 'DISCIPLINA': return 'Em Disciplina';
            default: return status;
        }
    };

    const getOfficeBadge = (office: string) => {
        const officeLabels: Record<string, string> = {
            'PASTOR': 'Pastor',
            'PRESBITERO': 'Presbítero',
            'DIACONO': 'Diácono',
        };
        
        if (officeLabels[office]) {
            return (
                <Badge variant="default" className="ml-2 text-[10px] h-5 bg-gradient-to-r from-green-600 to-teal-600">
                    {officeLabels[office]}
                </Badge>
            );
        }
        return null;
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
                        <TableRow key={member.id} className="group hover:bg-gray-50/50 transition-colors">
                            <TableCell className="font-medium py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center text-green-700 font-bold shadow-sm ring-2 ring-white">
                                        {member.full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center">
                                            <span className="font-semibold text-[#002333]">{member.full_name}</span>
                                            {getOfficeBadge(member.office)}
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
                                <button 
                                    onClick={() => onEditMember?.(member)}
                                    className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Editar membro"
                                >
                                    <Pencil size={16} />
                                </button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
