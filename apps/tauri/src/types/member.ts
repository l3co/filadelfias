export interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  office: string;
  church_id: string;
  avatar_url?: string;
  birthdate?: string;
}

export interface Devotional {
  id: string;
  title: string;
  content: string;
  scripture: string;
  author: string;
  date: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  starts_at: string;
  ends_at: string;
  church_id: string;
}

export interface Mission {
  id: string;
  missionary_name: string;
  field: string;
  country: string;
  description: string;
  prayer_requests: string[];
  church_id: string;
}
