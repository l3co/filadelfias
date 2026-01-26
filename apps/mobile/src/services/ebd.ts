import { api } from '@/services/api';

export interface EBDClass {
    id: string;
    name: string;
    teacher_name: string;
    age_group: string;
    schedule: string;
    room?: string;
    students_count: number;
}

export interface EBDLesson {
    id: string;
    title: string;
    date: string;
    content?: string;
    bible_reference?: string;
}

export const ebdService = {
    getClasses: async (tenantId: string): Promise<EBDClass[]> => {
        const response = await api.get(`/tenants/${tenantId}/ebd/classes`);
        return response.data;
    },

    getMyClass: async (tenantId: string): Promise<EBDClass | null> => {
        try {
            const response = await api.get(`/tenants/${tenantId}/ebd/my-class`);
            return response.data;
        } catch {
            return null;
        }
    },

    getLessons: async (tenantId: string, classId: string): Promise<EBDLesson[]> => {
        const response = await api.get(`/tenants/${tenantId}/ebd/classes/${classId}/lessons`);
        return response.data;
    },
};
