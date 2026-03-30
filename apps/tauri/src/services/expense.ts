import { api } from "./api";
import type { Expense } from "@/types/financial";

interface ApiExpense {
  id?: string | number;
  member_id?: string | number;
  member_name?: string;
  amount?: number | string;
  category?: "MATERIAL" | "CLEANING" | "TRANSPORT" | "FOOD" | "MAINTENANCE" | "UTILITIES" | "OTHER";
  description?: string;
  expense_date?: string;
  receipt_url?: string | null;
  notes?: string | null;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  created_at?: string;
}

function normalizeCategory(category?: ApiExpense["category"]): Expense["category"] {
  switch (category) {
    case "MATERIAL":
      return "material";
    case "CLEANING":
      return "cleaning";
    case "TRANSPORT":
      return "transport";
    case "FOOD":
      return "food";
    case "MAINTENANCE":
      return "maintenance";
    case "UTILITIES":
      return "bills";
    default:
      return "other";
  }
}

function normalizeStatus(status?: ApiExpense["status"]): Expense["status"] {
  switch (status) {
    case "APPROVED":
      return "approved";
    case "REJECTED":
      return "rejected";
    default:
      return "pending";
  }
}

function normalizeExpense(item: ApiExpense): Expense {
  return {
    id: String(item.id ?? ""),
    amount: Number(item.amount ?? 0),
    category: normalizeCategory(item.category),
    description: item.description || "",
    receipt_url: item.receipt_url || undefined,
    status: normalizeStatus(item.status),
    created_at: item.created_at || item.expense_date || new Date().toISOString(),
    member_id: String(item.member_id ?? ""),
  };
}

function mapCategoryToApi(category: Expense["category"]) {
  switch (category) {
    case "material":
      return "MATERIAL";
    case "cleaning":
      return "CLEANING";
    case "transport":
      return "TRANSPORT";
    case "food":
      return "FOOD";
    case "maintenance":
      return "MAINTENANCE";
    case "bills":
      return "UTILITIES";
    default:
      return "OTHER";
  }
}

export const expenseService = {
  async getExpenses(churchId: string): Promise<Expense[]> {
    const { data } = await api.get<ApiExpense[]>("/expense/requests/my", {
      params: { tenant_id: churchId },
    });
    return data.map(normalizeExpense);
  },

  async createExpense(
    churchId: string,
    payload: {
      amount: number;
      category: Expense["category"];
      description: string;
      expense_date: string;
      receipt_url?: string;
      notes?: string;
    },
  ): Promise<Expense> {
    const { data } = await api.post<ApiExpense>(
      "/expense/requests",
      {
        amount: payload.amount,
        category: mapCategoryToApi(payload.category),
        description: payload.description,
        expense_date: payload.expense_date,
        receipt_url: payload.receipt_url,
        notes: payload.notes,
      },
      {
        params: { tenant_id: churchId },
      },
    );

    return normalizeExpense(data);
  },
};
