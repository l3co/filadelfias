import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Loader2, Shield, User } from 'lucide-react';
import { cn } from '../../../lib/utils';
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
    const initialRole = (member?.system_role as 'ADMIN' | 'MEMBER') || 'MEMBER';
    const [role, setRole] = useState<'ADMIN' | 'MEMBER'>(initialRole);

    useEffect(() => {
        const newRole = (member?.system_role as 'ADMIN' | 'MEMBER') || 'MEMBER';
        setRole(newRole);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [member?.id]);

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
                    <div className="space-y-3">
                        <Label id="invite-member-role-label">Nível de Acesso</Label>
                        <div className="space-y-2" role="radiogroup" aria-labelledby="invite-member-role-label">
                            <button
                                type="button"
                                onClick={() => setRole('MEMBER')}
                                role="radio"
                                aria-checked={role === 'MEMBER'}
                                className={cn(
                                    "w-full flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all",
                                    role === 'MEMBER' 
                                        ? "border-green-500 bg-green-50" 
                                        : "border-gray-200 hover:border-gray-300"
                                )}
                            >
                                <User size={20} className={cn("mt-0.5", role === 'MEMBER' ? "text-green-600" : "text-gray-400")} aria-hidden="true" />
                                <div>
                                    <span className={cn("font-medium", role === 'MEMBER' ? "text-green-700" : "text-gray-700")}>Membro</span>
                                    <p className="text-xs text-gray-500 mt-0.5">Acesso básico de leitura e registro pessoal.</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('ADMIN')}
                                role="radio"
                                aria-checked={role === 'ADMIN'}
                                className={cn(
                                    "w-full flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all",
                                    role === 'ADMIN' 
                                        ? "border-purple-500 bg-purple-50" 
                                        : "border-gray-200 hover:border-gray-300"
                                )}
                            >
                                <Shield size={20} className={cn("mt-0.5", role === 'ADMIN' ? "text-purple-600" : "text-gray-400")} aria-hidden="true" />
                                <div>
                                    <span className={cn("font-medium", role === 'ADMIN' ? "text-purple-700" : "text-gray-700")}>Administrador</span>
                                    <p className="text-xs text-gray-500 mt-0.5">Acesso total para gerenciar a igreja.</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleInvite} disabled={isLoading} className="gap-2">
                        {isLoading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                        Enviar Convite
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
