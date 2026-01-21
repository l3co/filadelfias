/**
 * EBD Constants
 */

import type { SelectOption } from './member.constants';

type StudentRole = 'STUDENT' | 'TEACHER' | 'ASSISTANT';

export const STUDENT_ROLE_OPTIONS: SelectOption<StudentRole>[] = [
  { value: 'STUDENT', label: 'Aluno' },
  { value: 'TEACHER', label: 'Professor' },
  { value: 'ASSISTANT', label: 'Auxiliar' },
];

// Labels for display
export const STUDENT_ROLE_LABELS: Record<StudentRole, string> = {
  STUDENT: 'Aluno',
  TEACHER: 'Professor',
  ASSISTANT: 'Auxiliar',
};
