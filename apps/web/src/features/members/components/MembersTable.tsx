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
import { User } from "lucide-react";

interface MembersTableProps {
    members?: Member[];
    isLoading?: boolean;
}

export function MembersTable({ members, isLoading }: MembersTableProps) {
    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Carregando membros...</div>;
    }

    if (!members || members.length === 0) {
        return (
            <div className="p-12 text-center border rounded-lg bg-gray-50">
                <User className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum membro</h3>
                <p className="mt-1 text-sm text-gray-500">Comece adicionando novos membros à igreja.</p>
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

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'PASTOR':
            case 'PRESBITERO':
            case 'DIACONO':
                return <Badge variant="default" className="ml-2 text-[10px] h-5">{role}</Badge>;
            default:
                return null;
        }
    }

    return (
        <div className="rounded-md border border-gray-200 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50/50">
                        <TableHead className="w-[300px]">Nome</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.map((member) => (
                        <TableRow key={member.id} className="group">
                            <TableCell className="font-medium">
                                <div className="flex items-center">
                                    <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3 border-2 border-white shadow-sm">
                                        {member.full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center">
                                            {member.full_name}
                                            {getRoleBadge(member.role)}
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(member.status)}>
                                    {member.status.replace('_', ' ')}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-gray-500">
                                {member.email || '-'}
                            </TableCell>
                            <TableCell className="text-right">
                                {/* Actions placeholder for future */}
                                <span className="text-xs text-gray-400 group-hover:text-indigo-600 cursor-pointer">Editar</span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
