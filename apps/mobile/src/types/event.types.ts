export interface Event {
    id: string;
    tenant_id?: string;
    title: string;
    description?: string;
    date: string;
    time?: string;
    location?: string;
    created_at?: string;
    updated_at?: string;
}
