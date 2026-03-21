import { MembersCards } from '../components/MembersCards';
import type { Member } from '../../../types/members.types';

interface MembersPageClientProps {
  isLoading?: boolean;
  members: Member[];
  onEditMember: (member: Member) => void;
  onInviteMember: (member: Member) => void;
  pendingInviteMemberIds?: string[];
}

export function MembersPageClient({
  isLoading,
  members,
  onEditMember,
  onInviteMember,
  pendingInviteMemberIds,
}: MembersPageClientProps) {
  return (
    <MembersCards
      members={members}
      isLoading={isLoading}
      onEditMember={onEditMember}
      onInviteMember={onInviteMember}
      pendingInviteMemberIds={pendingInviteMemberIds}
    />
  );
}
