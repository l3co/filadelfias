export interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  author_name: string;
  author_id: string;
  prayer_count: number;
  already_prayed: boolean;
  created_at: string;
  church_id: string;
  is_anonymous: boolean;
}

export interface CreatePrayerInput {
  title: string;
  description: string;
  category: string;
  is_anonymous: boolean;
}
