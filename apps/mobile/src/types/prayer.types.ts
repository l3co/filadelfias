export interface PrayerRequest {
    id: string;
    tenant_id: string;
    member_id: string;
    author_name: string;
    content: string;
    category: string;
    is_anonymous: boolean;
    prayer_count: number;
    prayed_by: string[];
    created_at: string;
    updated_at: string;
}

export interface CreatePrayerRequestData {
    content: string;
    is_anonymous: boolean;
    category?: string;
}
