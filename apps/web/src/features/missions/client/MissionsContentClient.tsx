import { SocialProjectList } from '../components/SocialProjectList';
import type { SocialProject } from '../../../services/missions';

interface MissionsContentClientProps {
  isDeleting: boolean;
  isLoading: boolean;
  onDelete: (projectId: string) => void;
  onEdit: (project: SocialProject) => void;
  pendingDeleteIds?: string[];
  projects?: SocialProject[];
}

export function MissionsContentClient({
  isDeleting,
  isLoading,
  onDelete,
  onEdit,
  pendingDeleteIds,
  projects,
}: MissionsContentClientProps) {
  return (
    <SocialProjectList
      isDeleting={isDeleting}
      isLoading={isLoading}
      onEdit={onEdit}
      onDelete={onDelete}
      pendingDeleteIds={pendingDeleteIds}
      projects={projects}
    />
  );
}
