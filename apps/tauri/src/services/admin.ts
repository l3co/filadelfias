import { api } from "./api";
import type { PendingExpense, PendingTithe } from "@/types/admin";

interface ApiPendingTithe {
  id?: string | number;
  member_name?: string;
  amount?: number | string;
  type?: "DIZIMO" | "OFERTA";
  notes?: string;
  attachment_url?: string | null;
  date?: string;
  created_at?: string;
  rejection_reason?: string | null;
}

interface ApiPendingExpense {
  id?: string | number;
  member_name?: string;
  amount?: number | string;
  category?: string;
  description?: string;
  receipt_url?: string | null;
  created_at?: string;
  expense_date?: string;
  rejection_reason?: string | null;
}

function normalizePendingTithe(item: ApiPendingTithe): PendingTithe {
  return {
    id: String(item.id ?? ""),
    member_name: item.member_name || "Membro",
    amount: Number(item.amount ?? 0),
    type: item.type === "OFERTA" ? "offering" : "tithe",
    description: item.notes || undefined,
    receipt_url: item.attachment_url || undefined,
    created_at: item.created_at || item.date || new Date().toISOString(),
    rejection_reason: item.rejection_reason || undefined,
  };
}

function normalizePendingExpense(item: ApiPendingExpense): PendingExpense {
  return {
    id: String(item.id ?? ""),
    member_name: item.member_name || "Membro",
    amount: Number(item.amount ?? 0),
    category: item.category || "OTHER",
    description: item.description || "",
    receipt_url: item.receipt_url || undefined,
    created_at: item.created_at || item.expense_date || new Date().toISOString(),
    rejection_reason: item.rejection_reason || undefined,
  };
}

export const adminService = {
  async getPendingTithes(churchId: string): Promise<PendingTithe[]> {
    const { data } = await api.get<ApiPendingTithe[]>("/tithe/records/pending", {
      params: { tenant_id: churchId },
    });
    return data.map(normalizePendingTithe);
  },

  async approveTithe(churchId: string, titheId: string): Promise<void> {
    await api.patch(
      `/tithe/records/${titheId}/approve`,
      { status: "APPROVED" },
      { params: { tenant_id: churchId } },
    );
  },

  async rejectTithe(churchId: string, titheId: string, reason: string): Promise<void> {
    await api.patch(
      `/tithe/records/${titheId}/approve`,
      { status: "REJECTED", rejection_reason: reason },
      { params: { tenant_id: churchId } },
    );
  },

  async getPendingExpenses(churchId: string): Promise<PendingExpense[]> {
    const { data } = await api.get<ApiPendingExpense[]>("/expense/requests/pending", {
      params: { tenant_id: churchId },
    });
    return data.map(normalizePendingExpense);
  },

  async approveExpense(churchId: string, expenseId: string): Promise<void> {
    await api.post(
      `/expense/requests/${expenseId}/approve`,
      { status: "APPROVED" },
      { params: { tenant_id: churchId } },
    );
  },

  async rejectExpense(churchId: string, expenseId: string, reason: string): Promise<void> {
    await api.post(
      `/expense/requests/${expenseId}/approve`,
      { status: "REJECTED", rejection_reason: reason },
      { params: { tenant_id: churchId } },
    );
  },
};
