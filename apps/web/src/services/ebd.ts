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

export interface EBDComment {
    id: string;
    lesson_id: string;
    member_id: string;
    member_name?: string;
    content: string;
    parent_id?: string;
    created_at: string;
}

export interface CreateCommentDTO {
    lesson_id: string;
    member_id: string;
    content: string;
    parent_id?: string;
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

export interface MyEBDClass extends EBDClass {
    lessons?: EBDLesson[];
    enrollment?: EBDStudent;
}

export const ebdService = {
    getMyClass: async (tenantId: string) => {
        const { data } = await api.get<MyEBDClass | null>('/ebd/my-class', {
            params: { tenant_id: tenantId }
        });
        return data;
    },

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

    enrollStudent: async (classId: string, studentData: EnrollStudentDTO, tenantId: string) => {
        const { data } = await api.post<EBDStudent>(`/ebd/classes/${classId}/students`, studentData, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    listStudents: async (classId: string, tenantId: string) => {
        const { data } = await api.get<EBDStudent[]>(`/ebd/classes/${classId}/students`, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    createLesson: async (classId: string, data: CreateLessonDTO, tenantId: string) => {
        const payload = { ...data, ebd_class_id: classId };
        const { data: result } = await api.post<EBDLesson>(`/ebd/classes/${classId}/lessons`, payload, {
            params: { tenant_id: tenantId }
        });
        return result;
    },

    listLessons: async (classId: string, tenantId: string) => {
        const { data } = await api.get<EBDLesson[]>(`/ebd/classes/${classId}/lessons`, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    removeStudent: async (classId: string, studentId: string, tenantId: string) => {
        await api.delete(`/ebd/classes/${classId}/students/${studentId}`, {
            params: { tenant_id: tenantId }
        });
    },

    // Comments
    listComments: async (lessonId: string, tenantId: string) => {
        const { data } = await api.get<EBDComment[]>(`/ebd/lessons/${lessonId}/comments`, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    createComment: async (lessonId: string, tenantId: string, comment: CreateCommentDTO) => {
        const { data } = await api.post<EBDComment>(`/ebd/lessons/${lessonId}/comments`, comment, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    deleteComment: async (lessonId: string, commentId: string, tenantId: string) => {
        await api.delete(`/ebd/lessons/${lessonId}/comments/${commentId}`, {
            params: { tenant_id: tenantId }
        });
    }
};
