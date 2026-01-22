import { api } from '../lib/api';

export interface EBDClass {
    id: string;
    tenant_id: string;
    name: string;
    description?: string;
    min_age?: number;
    max_age?: number;
    location?: string;
}

export interface EBDStudent {
    id: string;
    ebd_class_id: string;
    member_id: string;
    role: string;
    enrolled_at: string;
}

export interface EBDLesson {
    id: string;
    ebd_class_id: string;
    date: string;
    topic: string;
    bible_reference?: string;
    description?: string;
    homework_url?: string;
}

export interface CreateClassDTO {
    name: string;
    description?: string;
    min_age?: number;
    max_age?: number;
    location?: string;
}

export interface EnrollStudentDTO {
    member_id: string;
    role: string;
}

export interface CreateLessonDTO {
    ebd_class_id?: string;
    date: string;
    topic: string;
    bible_reference?: string;
    description?: string;
    homework_url?: string;
}

export const ebdService = {
    listClasses: async (tenantId: string) => {
        const { data } = await api.get<EBDClass[]>('/ebd/classes', {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    createClass: async (tenantId: string, classData: CreateClassDTO) => {
        const { data } = await api.post<EBDClass>('/ebd/classes', classData, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    enrollStudent: async (classId: string, studentData: EnrollStudentDTO) => {
        const { data } = await api.post<EBDStudent>(`/ebd/classes/${classId}/students`, studentData);
        return data;
    },

    listStudents: async (classId: string) => {
        const { data } = await api.get<EBDStudent[]>(`/ebd/classes/${classId}/students`);
        return data;
    },

    createLesson: async (classId: string, data: CreateLessonDTO) => {
        const payload = { ...data, ebd_class_id: classId };
        const { data: result } = await api.post<EBDLesson>(`/ebd/classes/${classId}/lessons`, payload);
        return result;
    },

    listLessons: async (classId: string) => {
        const { data } = await api.get<EBDLesson[]>(`/ebd/classes/${classId}/lessons`);
        return data;
    },

    removeStudent: async (classId: string, studentId: string) => {
        await api.delete(`/ebd/classes/${classId}/students/${studentId}`);
    }
};
