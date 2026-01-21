/**
 * Governance Constants
 */

import type { SelectOption } from './member.constants';

type CouncilType = 'SESSION' | 'DEACONS' | 'ASSEMBLY' | 'COMMITTEE';
type MeetingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export const COUNCIL_TYPE_OPTIONS: SelectOption<CouncilType>[] = [
  { value: 'SESSION', label: 'Conselho' },
  { value: 'DEACONS', label: 'Junta Diaconal' },
  { value: 'ASSEMBLY', label: 'Assembleia' },
  { value: 'COMMITTEE', label: 'Comissão' },
];

export const MEETING_STATUS_OPTIONS: SelectOption<MeetingStatus>[] = [
  { value: 'SCHEDULED', label: 'Agendada' },
  { value: 'IN_PROGRESS', label: 'Em Andamento' },
  { value: 'COMPLETED', label: 'Concluída' },
  { value: 'CANCELLED', label: 'Cancelada' },
];

// Labels for display
export const COUNCIL_TYPE_LABELS: Record<CouncilType, string> = {
  SESSION: 'Conselho',
  DEACONS: 'Junta Diaconal',
  ASSEMBLY: 'Assembleia',
  COMMITTEE: 'Comissão',
};

export const MEETING_STATUS_LABELS: Record<MeetingStatus, string> = {
  SCHEDULED: 'Agendada',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
};
