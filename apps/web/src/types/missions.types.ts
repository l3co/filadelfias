/**
 * Missions Types
 */

export interface Missionary {
  id: string;
  tenant_id: string;
  name: string;
  field_name: string;
  country_code: string;
  latitude: number;
  longitude: number;
  bio?: string;
  photo_url?: string;
  newsletter_url?: string;
}

export interface CreateMissionaryDTO {
  name: string;
  field_name: string;
  country_code: string;
  latitude: number;
  longitude: number;
  bio?: string;
  photo_url?: string;
  newsletter_url?: string;
}
