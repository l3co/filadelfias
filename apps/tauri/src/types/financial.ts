export type TitheStatus = "pending" | "approved" | "rejected";
export type ExpenseStatus = "pending" | "approved" | "rejected";
export type ExpenseCategory =
  | "material"
  | "cleaning"
  | "transport"
  | "food"
  | "maintenance"
  | "bills"
  | "other";

export interface Tithe {
  id: string;
  amount: number;
  type: "tithe" | "offering";
  description?: string;
  receipt_url?: string;
  status: TitheStatus;
  month: number;
  year: number;
  created_at: string;
  member_id: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  receipt_url?: string;
  status: ExpenseStatus;
  created_at: string;
  member_id: string;
}

export interface EBDClass {
  id: string;
  name: string;
  teacher_name: string;
  age_range?: string;
  church_id: string;
  schedule?: string;
  room?: string;
  students_count?: number;
}

export interface EBDLesson {
  id: string;
  title: string;
  date: string;
  class_id: string;
  quarter: number;
  year: number;
  content?: string;
  bible_reference?: string;
}

export interface EBDAttendance {
  lesson_id: string;
  member_id: string;
  present: boolean;
}

export interface TitheSummary {
  total_year: number;
  total_month: number;
  pending_count: number;
}
