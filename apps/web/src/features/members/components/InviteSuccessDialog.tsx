import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { CheckCircle2, Copy, Check, Mail, MessageCircle } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    memberName: string;
    memberEmail: string;
    temporaryPassword: string;
    emailSent: boolean;
}

export function InviteSuccessDialog({ 
    isOpen, 
    onClose, 
    memberName, 
    memberEmail, 
    temporaryPassword,
    emailSent 
}: Props) {
    const [copied, setCopied] = useState(false);

    const handleCopyPassword = async () => {
        await navigator.clipboard.writeText(temporaryPassword);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyAll = async () => {
        const text = `Olá ${memberName}!\n\nVocê foi convidado(a) para acessar a plataforma Filadélfias.\n\nSeu email: ${memberEmail}\nSua senha temporária: ${temporaryPassword}\n\nAcesse: ${window.location.origin}/login\n\nNo primeiro acesso, você será solicitado(a) a trocar sua senha.`;
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWhatsApp = () => {
        const text = encodeURIComponent(`Olá ${memberName}!\n\nVocê foi convidado(a) para acessar a plataforma Filadélfias.\n\nSeu email: ${memberEmail}\nSua senha temporária: ${temporaryPassword}\n\nAcesse: ${window.location.origin}/login\n\nNo primeiro acesso, você será solicitado(a) a trocar sua senha.`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-green-700">
                        <div className="p-2 bg-green-100 rounded-full">
                            <CheckCircle2 size={24} aria-hidden="true" />
                        </div>
                        Convite Enviado!
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <p className="text-gray-600">
                        Uma conta foi criada para <strong>{memberName}</strong>.
                    </p>

                    {emailSent ? (
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                            <Mail size={18} aria-hidden="true" />
                            <span>Email de boas-vindas enviado para <strong>{memberEmail}</strong></span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                            <Mail size={18} aria-hidden="true" />
                            <span>Email não configurado. Compartilhe a senha manualmente.</span>
                        </div>
                    )}

                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4 space-y-3">
                        <p className="text-sm text-gray-500 text-center">Senha Temporária</p>
                        <div className="flex items-center justify-center gap-3">
                            <code className="text-2xl font-bold tracking-widest text-green-700 bg-white px-4 py-2 rounded-lg border">
                                {temporaryPassword}
                            </code>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleCopyPassword}
                                className="gap-2"
                                aria-label={copied ? 'Senha temporária copiada' : 'Copiar senha temporária'}
                            >
                                {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                                {copied ? 'Copiado!' : 'Copiar'}
                            </Button>
                        </div>
                        <p className="text-xs text-gray-400 text-center">
                            O usuário precisará trocar a senha no primeiro acesso
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCopyAll}
                            className="flex-1 gap-2"
                            aria-label={`Copiar mensagem de convite para ${memberName}`}
                        >
                            <Copy size={16} aria-hidden="true" />
                            Copiar Mensagem
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleWhatsApp}
                            className="flex-1 gap-2 text-green-600 border-green-200 hover:bg-green-50"
                            aria-label={`Compartilhar convite de ${memberName} via WhatsApp`}
                        >
                            <MessageCircle size={16} aria-hidden="true" />
                            WhatsApp
                        </Button>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={onClose} className="w-full">
                        Fechar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
