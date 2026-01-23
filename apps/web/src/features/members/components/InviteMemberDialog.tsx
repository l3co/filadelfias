import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';
import { Loader2, Shield, User } from 'lucide-react';
import type { Member } from '../../../types';

interface InviteMemberDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onInvite: (member: Member, role: 'ADMIN' | 'MEMBER') => void;
    member: Member | null;
    isLoading?: boolean;
}

export function InviteMemberDialog({
    isOpen,
    onClose,
    onInvite,
    member,
    isLoading = false
}: InviteMemberDialogProps) {
    const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');

    if (!member) return null;

    const handleInvite = () => {
        onInvite(member, role);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Convidar Membro</DialogTitle>
                    <DialogDescription>
                        Enviar convite de acesso à plataforma para <b>{member.full_name}</b>.
                        O usuário receberá uma senha temporária por e-mail.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Nível de Acesso</Label>
                        <Select
                            value={role}
                            onValueChange={(value) => setRole(value as 'ADMIN' | 'MEMBER')}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o nível de acesso" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MEMBER">
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-gray-500" />
                                        <span>Membro</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Acesso básico de leitura e registro pessoal.</p>
                                </SelectItem>
                                <SelectItem value="ADMIN">
                                    <div className="flex items-center gap-2">
                                        <Shield size={16} className="text-purple-600" />
                                        <span>Administrador</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Acesso total para gerenciar a igreja.</p>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleInvite} disabled={isLoading} className="gap-2">
                        {isLoading && <Loader2 size={16} className="animate-spin" />}
                        Enviar Convite
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
