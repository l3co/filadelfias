/**
 * Governance Types
 */

export type CouncilType = 'SESSION' | 'DEACONS' | 'ASSEMBLY' | 'COMMITTEE';

export type MeetingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Council {
  id: string;
  tenant_id: string;
  name: string;
  type: CouncilType;
  description?: string;
}

export interface Meeting {
  id: string;
  council_id: string;
  date: string;
  status: MeetingStatus;
  agenda?: string;
  location?: string;
}

export interface CreateCouncilDTO {
  name: string;
  type: CouncilType;
  description?: string;
}

export interface CreateMeetingDTO {
  council_id: string;
  date: string;
  agenda?: string;
  location?: string;
}
