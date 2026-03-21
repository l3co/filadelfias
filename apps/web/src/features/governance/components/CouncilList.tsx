import { useState, memo, useMemo } from 'react';
import { Users, Landmark, Gavel, Calendar, MoreVertical, Pencil, Trash2, UserPlus } from 'lucide-react';
import { ManageMembersDialog } from './ManageMembersDialog';
import { MeetingsDialog } from './MeetingsDialog';
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { CardSkeleton } from "../../../components/LoadingState";
import { EmptyState } from "../../../components/EmptyState";
import type { Council } from '../../../services/governance';
import { useMembers } from '../../members/hooks/useMembers';
import { useAuthTenant } from '../../../contexts/AuthContext';

interface CouncilListProps {
    councils?: Council[];
    isLoading?: boolean;
    onDelete?: (councilId: string) => void;
    onEdit?: (council: Council) => void;
}

export const CouncilList = memo(function CouncilList({ councils, isLoading, onDelete, onEdit }: CouncilListProps) {
    const tenant = useAuthTenant();
    const { data: members } = useMembers(tenant?.id);
    const [selectedCouncil, setSelectedCouncil] = useState<Council | null>(null);
    const [showMeetings, setShowMeetings] = useState(false);
    const [councilToDelete, setCouncilToDelete] = useState<Council | null>(null);
    const [managingMembers, setManagingMembers] = useState<Council | null>(null);

    // Get member names for the selected council (for attendance tracking)
    const selectedCouncilMembers = useMemo(() => {
        if (!selectedCouncil || !members) return [];
        const memberIds = selectedCouncil.member_ids || [];
        return members
            .filter(m => memberIds.includes(m.id))
            .map(m => ({ id: m.id, name: m.full_name }));
    }, [selectedCouncil, members]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
            </div>
        );
    }

    if (!councils || councils.length === 0) {
        return (
            <EmptyState
                icon={Landmark}
                title="Nenhum órgão governamental"
                description="Comece estruturando a liderança da igreja criando o Conselho ou a Junta Diaconal."
            />
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
        setManagingMembers(council);
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
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                aria-label={`Abrir ações para o órgão ${council.name}`}
                                                                title={`Abrir ações para o órgão ${council.name}`}
                                                            >
                                                                <MoreVertical size={16} aria-hidden="true" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => onEdit?.(council)}>
                                                                <Pencil size={14} className="mr-2" />
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => setManagingMembers(council)}>
                                                                <UserPlus size={14} className="mr-2" />
                                                                Gerenciar Membros
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

            {/* Meetings Dialog */}
            <MeetingsDialog
                isOpen={showMeetings}
                onClose={() => {
                    setShowMeetings(false);
                    setSelectedCouncil(null);
                }}
                council={selectedCouncil}
                membersList={selectedCouncilMembers}
            />

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

            {/* Manage Members Dialog */}
            <ManageMembersDialog
                isOpen={!!managingMembers}
                onClose={() => setManagingMembers(null)}
                council={managingMembers}
            />
        </>
    );
});
