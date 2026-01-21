import { useState } from 'react';
import { Users, Landmark, Gavel, Calendar, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../../../components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import type { Council } from '../../../services/governance';

interface CouncilListProps {
    councils?: Council[];
    isLoading?: boolean;
    onDelete?: (councilId: string) => void;
    onEdit?: (council: Council) => void;
}

export function CouncilList({ councils, isLoading, onDelete, onEdit }: CouncilListProps) {
    const [selectedCouncil, setSelectedCouncil] = useState<Council | null>(null);
    const [showMembers, setShowMembers] = useState(false);
    const [showMeetings, setShowMeetings] = useState(false);
    const [councilToDelete, setCouncilToDelete] = useState<Council | null>(null);

    if (isLoading) {
        return <div className="text-center p-8 text-gray-500">Carregando governança...</div>;
    }

    if (!councils || councils.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Landmark className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum órgão governamental</h3>
                <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">Comece estruturando a liderança da igreja criando o Conselho ou a Junta Diaconal.</p>
            </div>
        );
    }

    const sections = [
        { title: 'Conselhos e Juntas', types: ['SESSION', 'DEACONS'] },
        { title: 'Assembleias', types: ['ASSEMBLY'] },
        { title: 'Comissões', types: ['COMMITTEE'] },
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'ASSEMBLY': return <Users size={20} />;
            case 'SESSION': return <Gavel size={20} />;
            default: return <Landmark size={20} />;
        }
    };

    const handleViewMembers = (council: Council) => {
        setSelectedCouncil(council);
        setShowMembers(true);
    };

    const handleViewMeetings = (council: Council) => {
        setSelectedCouncil(council);
        setShowMeetings(true);
    };

    const handleDeleteConfirm = () => {
        if (councilToDelete && onDelete) {
            onDelete(councilToDelete.id);
        }
        setCouncilToDelete(null);
    };

    return (
        <>
            <div className="space-y-10">
                {sections.map(section => {
                    const items = councils.filter(c => section.types.includes(c.type));
                    if (!items.length) return null;

                    return (
                        <div key={section.title} className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                {section.title}
                                <Badge variant="secondary" className="rounded-full px-2">{items.length}</Badge>
                            </h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {items.map(council => (
                                    <Card key={council.id} className="hover:shadow-md transition-shadow group relative">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                                    {getIcon(council.type)}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[10px] uppercase">
                                                        {council.type}
                                                    </Badge>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreVertical size={16} />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => onEdit?.(council)}>
                                                                <Pencil size={14} className="mr-2" />
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => setCouncilToDelete(council)}
                                                                className="text-red-600 focus:text-red-600"
                                                            >
                                                                <Trash2 size={14} className="mr-2" />
                                                                Excluir
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                            <CardTitle className="text-lg mb-2">{council.name}</CardTitle>
                                            <p className="text-gray-500 text-sm mb-6 line-clamp-2 h-10">
                                                {council.description || 'Sem descrição.'}
                                            </p>

                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => handleViewMembers(council)}
                                                >
                                                    <Users size={14} className="mr-2" /> Membros
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800"
                                                    onClick={() => handleViewMeetings(council)}
                                                >
                                                    <Calendar size={14} className="mr-2" /> Reuniões
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Members Dialog */}
            <Dialog open={showMembers} onOpenChange={setShowMembers}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Membros - {selectedCouncil?.name}</DialogTitle>
                        <DialogDescription>
                            Lista de membros deste órgão governamental.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {selectedCouncil && 'members' in selectedCouncil && Array.isArray((selectedCouncil as any).members) ? (
                            <ul className="space-y-2">
                                {((selectedCouncil as any).members as string[]).map((member, idx) => (
                                    <li key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-sm">
                                            {member.charAt(0)}
                                        </div>
                                        <span className="text-sm">{member}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500 py-4">Nenhum membro cadastrado.</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Meetings Dialog */}
            <Dialog open={showMeetings} onOpenChange={setShowMeetings}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reuniões - {selectedCouncil?.name}</DialogTitle>
                        <DialogDescription>
                            Histórico de reuniões deste órgão.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-center text-gray-500 py-4">
                            Funcionalidade de reuniões em desenvolvimento.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!councilToDelete} onOpenChange={() => setCouncilToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir órgão?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir "{councilToDelete?.name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
