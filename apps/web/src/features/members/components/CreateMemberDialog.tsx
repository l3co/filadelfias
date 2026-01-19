import { useForm } from 'react-hook-form';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "../../../components/ui/dialog";
import { useCreateMember } from '../hooks/useMembers';
import type { MemberCreateData } from '../../../types';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    tenantId: string;
}

export function CreateMemberDialog({ isOpen, onClose, tenantId }: Props) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<MemberCreateData>();
    const createMember = useCreateMember(tenantId);

    const onSubmit = (data: MemberCreateData) => {
        createMember.mutate(data, {
            onSuccess: () => {
                reset();
                onClose();
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Novo Membro</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                        <Input
                            {...register('full_name', { required: 'Nome é obrigatório' })}
                            placeholder="Ex: João da Silva"
                            error={!!errors.full_name}
                        />
                        {errors.full_name && <span className="text-xs text-red-500">{errors.full_name.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email (Opcional)</label>
                        <Input
                            type="email"
                            {...register('email')}
                            placeholder="email@exemplo.com"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Status</label>
                            <select
                                {...register('status')}
                                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                                defaultValue="COMUNGANTE"
                            >
                                <option value="COMUNGANTE">Comungante</option>
                                <option value="NAO_COMUNGANTE">Não Comungante</option>
                                <option value="DISCIPLINA">Em Disciplina</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Ofício</label>
                            <select
                                {...register('office')}
                                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                                defaultValue="MEMBRO"
                            >
                                <option value="MEMBRO">Membro</option>
                                <option value="DIACONO">Diácono</option>
                                <option value="PRESBITERO">Presbítero</option>
                                <option value="PASTOR">Pastor</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Sexo</label>
                            <select
                                {...register('gender')}
                                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                            >
                                <option value="">Selecione...</option>
                                <option value="M">Masculino</option>
                                <option value="F">Feminino</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Estado Civil</label>
                            <select
                                {...register('marital_status')}
                                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                            >
                                <option value="">Selecione...</option>
                                <option value="SOLTEIRO">Solteiro(a)</option>
                                <option value="CASADO">Casado(a)</option>
                                <option value="VIUVO">Viúvo(a)</option>
                                <option value="DIVORCIADO">Divorciado(a)</option>
                            </select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            isLoading={createMember.isPending}
                        >
                            Salvar Membro
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
