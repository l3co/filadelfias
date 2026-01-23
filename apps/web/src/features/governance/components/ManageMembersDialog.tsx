import { useState } from 'react';
import { UserPlus, X, Users } from 'lucide-react';
import { Button } from "../../../components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../../components/ui/dialog";
import { useCurrentTenant } from '../../../hooks/useAuth';
import { useMembers } from '../../members/hooks/useMembers';
import { useAddCouncilMember, useRemoveCouncilMember, useGovernance } from '../hooks/useGovernance';
import type { Council } from '../../../services/governance';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    council: Council | null;
}

export function ManageMembersDialog({ isOpen, onClose, council }: Props) {
    const tenant = useCurrentTenant();
    const { data: members } = useMembers(tenant?.id);
    const { data: councils } = useGovernance(tenant?.id);
    const addMember = useAddCouncilMember(tenant?.id);
    const removeMember = useRemoveCouncilMember(tenant?.id);
    const [searchTerm, setSearchTerm] = useState('');

    if (!council) return null;

    // Busca o council atualizado da query para refletir mudanças
    const currentCouncil = councils?.find(c => c.id === council.id) || council;
    const councilMemberIds = currentCouncil.member_ids || [];
    
    const councilMembers = members?.filter(m => councilMemberIds.includes(m.id)) || [];
    const availableMembers = members?.filter(m => 
        !councilMemberIds.includes(m.id) &&
        m.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handleAddMember = (memberId: string) => {
        addMember.mutate({ councilId: council.id, memberId });
    };

    const handleRemoveMember = (memberId: string) => {
        removeMember.mutate({ councilId: council.id, memberId });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users size={20} />
                        Membros - {council.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Current Members */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Membros atuais ({councilMembers.length})
                        </h4>
                        {councilMembers.length === 0 ? (
                            <p className="text-sm text-gray-500 py-2">Nenhum membro vinculado.</p>
                        ) : (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {councilMembers.map(member => (
                                    <div 
                                        key={member.id} 
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-sm">
                                                {member.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{member.full_name}</p>
                                                <p className="text-xs text-gray-500">{member.office}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveMember(member.id)}
                                            disabled={removeMember.isPending}
                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <X size={16} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Add Members */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Adicionar membros</h4>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar membro..."
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                        
                        <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                            {availableMembers.slice(0, 10).map(member => (
                                <div 
                                    key={member.id} 
                                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-sm">
                                            {member.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm">{member.full_name}</p>
                                            <p className="text-xs text-gray-500">{member.office}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleAddMember(member.id)}
                                        disabled={addMember.isPending}
                                        className="h-8 gap-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                                    >
                                        <UserPlus size={14} />
                                        Adicionar
                                    </Button>
                                </div>
                            ))}
                            {availableMembers.length === 0 && searchTerm && (
                                <p className="text-sm text-gray-500 py-2 text-center">
                                    Nenhum membro encontrado.
                                </p>
                            )}
                            {availableMembers.length > 10 && (
                                <p className="text-xs text-gray-500 py-2 text-center">
                                    Mostrando 10 de {availableMembers.length}. Refine a busca.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
