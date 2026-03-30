import { api } from "./api";
import type { Tithe, TitheSummary } from "@/types/financial";

interface ApiTitheRecord {
  id?: string | number;
  amount?: number | string;
  type?: "DIZIMO" | "OFERTA" | "tithe" | "offering";
  date?: string;
  created_at?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "pending" | "approved" | "rejected";
  notes?: string;
  description?: string;
  receipt_url?: string;
  member_id?: string | number;
}

function normalizeStatus(status?: ApiTitheRecord["status"]): Tithe["status"] {
  switch (status) {
    case "APPROVED":
    case "approved":
      return "approved";
    case "REJECTED":
    case "rejected":
      return "rejected";
    default:
      return "pending";
  }
}

function normalizeType(type?: ApiTitheRecord["type"]): Tithe["type"] {
  switch (type) {
    case "OFERTA":
    case "offering":
      return "offering";
    default:
      return "tithe";
  }
}

function normalizeTithe(record: ApiTitheRecord): Tithe {
  const createdAt = record.created_at || record.date || new Date().toISOString();
  const createdDate = new Date(createdAt);

  return {
    id: String(record.id ?? ""),
    amount: Number(record.amount ?? 0),
    type: normalizeType(record.type),
    description: record.description || record.notes,
    receipt_url: record.receipt_url,
    status: normalizeStatus(record.status),
    month: createdDate.getMonth() + 1,
    year: createdDate.getFullYear(),
    created_at: createdAt,
    member_id: String(record.member_id ?? ""),
  };
}

export const titheService = {
  async getTithes(churchId: string): Promise<Tithe[]> {
    const { data } = await api.get<ApiTitheRecord[]>(`/tenants/${churchId}/my-tithes`);
    return data.map(normalizeTithe);
  },

  async getSummary(churchId: string): Promise<TitheSummary> {
    const { data } = await api.get<TitheSummary>(`/tenants/${churchId}/my-tithes/summary`);
    return data;
  },

  async createTithe(
    churchId: string,
    payload: {
      amount: number;
      type: "DIZIMO" | "OFERTA";
      notes?: string;
    },
  ): Promise<Tithe> {
    const { data } = await api.post<ApiTitheRecord>(`/tenants/${churchId}/my-tithes`, payload);
    return normalizeTithe(data);
  },
};
