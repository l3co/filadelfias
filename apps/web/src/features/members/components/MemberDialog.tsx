import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { MemberForm, type MemberFormData } from './MemberForm';
import { useCreateMember, useUpdateMember } from '../hooks/useMembers';
import type { Member } from '../../../types/members.types';
import { User, UserPlus } from 'lucide-react';

interface MemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  member?: Member | null;
}

export function MemberDialog({ isOpen, onClose, tenantId, member }: MemberDialogProps) {
  const createMember = useCreateMember(tenantId);
  const updateMember = useUpdateMember(tenantId);

  const isEditMode = !!member;
  const isLoading = createMember.isPending || updateMember.isPending;

  const handleSubmit = (data: MemberFormData) => {
    if (isEditMode && member) {
      updateMember.mutate(
        { memberId: member.id, data },
        { onSuccess: onClose }
      );
    } else {
      createMember.mutate(data, { onSuccess: onClose });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <User size={20} className="text-green-600" aria-hidden="true" />
                Editar Membro
              </>
            ) : (
              <>
                <UserPlus size={20} className="text-green-600" aria-hidden="true" />
                Novo Membro
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Atualize os dados cadastrais do membro selecionado.'
              : 'Preencha os dados para cadastrar um novo membro.'}
          </DialogDescription>
        </DialogHeader>

        <MemberForm
          member={member}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
          submitLabel={isEditMode ? 'Salvar Alterações' : 'Salvar Membro'}
        />
      </DialogContent>
    </Dialog>
  );
}
