/**
 * EBD (Escola Bíblica Dominical) Types
 */

export type StudentRole = 'STUDENT' | 'TEACHER' | 'ASSISTANT';

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
  role: StudentRole;
  enrolled_at: string;
}

export interface EBDLesson {
  id: string;
  ebd_class_id: string;
  date: string;
  topic: string;
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
  role: StudentRole;
}

export interface CreateLessonDTO {
  ebd_class_id?: string;
  date: string;
  topic: string;
  description?: string;
  homework_url?: string;
}
