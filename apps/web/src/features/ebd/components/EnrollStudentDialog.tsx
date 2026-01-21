import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from "../../../components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "../../../components/ui/dialog";
import { ebdService } from '../../../services/ebd';
import type { EnrollStudentDTO } from '../../../services/ebd';
import type { Member } from '../../../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    classId: string;
    members: Member[];
    enrolledMemberIds: string[];
}

export function EnrollStudentDialog({ isOpen, onClose, classId, members, enrolledMemberIds }: Props) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<EnrollStudentDTO>();

    const enrollMutation = useMutation({
        mutationFn: (data: EnrollStudentDTO) => ebdService.enrollStudent(classId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ebd-students', classId] });
            toast.success('Aluno matriculado com sucesso!');
            reset();
            onClose();
        },
        onError: () => {
            toast.error('Erro ao matricular aluno.');
        }
    });

    const onSubmit = (data: EnrollStudentDTO) => {
        enrollMutation.mutate(data);
    };

    const availableMembers = members.filter(m => !enrolledMemberIds.includes(m.id));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Matricular Aluno</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Membro</label>
                        <select
                            {...register('member_id', { required: 'Selecione um membro' })}
                            className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <option value="">Selecione um membro...</option>
                            {availableMembers.map(member => (
                                <option key={member.id} value={member.id}>
                                    {member.full_name}
                                </option>
                            ))}
                        </select>
                        {errors.member_id && <span className="text-xs text-red-500">{errors.member_id.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Função</label>
                        <select
                            {...register('role', { required: 'Selecione uma função' })}
                            className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <option value="STUDENT">Aluno</option>
                            <option value="TEACHER">Professor</option>
                            <option value="ASSISTANT">Auxiliar</option>
                        </select>
                        {errors.role && <span className="text-xs text-red-500">{errors.role.message}</span>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" isLoading={enrollMutation.isPending}>
                            Matricular
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
