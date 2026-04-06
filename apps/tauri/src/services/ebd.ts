import { api } from "./api";
import type { EBDAttendance, EBDClass, EBDLesson } from "@/types/financial";

interface ApiEBDClass {
  id?: string | number;
  name?: string;
  teacher_name?: string;
  age_group?: string;
  age_range?: string;
  schedule?: string;
  room?: string;
  students_count?: number;
  church_id?: string | number;
  tenant_id?: string | number;
}

interface ApiEBDLesson {
  id?: string | number;
  title?: string;
  date?: string;
  content?: string;
  bible_reference?: string;
  class_id?: string | number;
  quarter?: number;
  year?: number;
}

function normalizeClass(item: ApiEBDClass): EBDClass {
  return {
    id: String(item.id ?? ""),
    name: item.name || "Turma",
    teacher_name: item.teacher_name || "Professor(a)",
    age_range: item.age_range || item.age_group,
    church_id: String(item.church_id ?? item.tenant_id ?? ""),
    schedule: item.schedule,
    room: item.room,
    students_count: item.students_count,
  };
}

function normalizeLesson(item: ApiEBDLesson, classId?: string): EBDLesson {
  const date = item.date || new Date().toISOString();
  const parsedDate = new Date(date);

  return {
    id: String(item.id ?? ""),
    title: item.title || "Licao",
    date,
    class_id: String(item.class_id ?? classId ?? ""),
    quarter: item.quarter ?? Math.floor(parsedDate.getMonth() / 3) + 1,
    year: item.year ?? parsedDate.getFullYear(),
    content: item.content,
    bible_reference: item.bible_reference,
  };
}

export const ebdService = {
  async getClasses(churchId: string): Promise<EBDClass[]> {
    const { data } = await api.get<ApiEBDClass[]>("/ebd/classes", { params: { tenant_id: churchId } });
    return data.map(normalizeClass);
  },

  async getMyClass(churchId: string): Promise<EBDClass | null> {
    try {
      const { data } = await api.get<ApiEBDClass>("/ebd/my-class", { params: { tenant_id: churchId } });
      return normalizeClass(data);
    } catch {
      return null;
    }
  },

  async getLessons(churchId: string, classId: string): Promise<EBDLesson[]> {
    const { data } = await api.get<ApiEBDLesson[]>(`/ebd/classes/${classId}/lessons`, { params: { tenant_id: churchId } });
    return data.map((lesson) => normalizeLesson(lesson, classId));
  },

  async getAttendance(_lessonId: string): Promise<EBDAttendance[]> {
    return [];
  },

  async markAttendance(_lessonId: string, _memberId: string, _present: boolean): Promise<void> {
    return;
  },
};
