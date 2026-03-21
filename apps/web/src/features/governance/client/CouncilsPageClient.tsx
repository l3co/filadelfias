import { CouncilList } from '../components/CouncilList';
import type { Council } from '../../../services/governance';

interface CouncilsPageClientProps {
  councils?: Council[];
  isDeleting?: boolean;
  isLoading?: boolean;
  onDelete?: (councilId: string) => void;
  onEdit?: (council: Council) => void;
}

export function CouncilsPageClient({
  councils,
  isLoading,
  onDelete,
  onEdit,
}: CouncilsPageClientProps) {
  return (
    <CouncilList
      councils={councils}
      isLoading={isLoading}
      onDelete={onDelete}
      onEdit={onEdit}
    />
  );
}
