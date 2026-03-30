import { api } from "./api";
import type { Member } from "@/types/member";

interface ApiMember {
  id?: string | number;
  full_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  office?: string;
  function?: string;
  functions?: string[];
  church_id?: string | number;
  tenant_id?: string | number;
  avatar_url?: string;
  birthdate?: string;
}

function normalizeMember(member: ApiMember): Member {
  return {
    id: String(member.id ?? ""),
    name: member.full_name || member.name || "Membro",
    email: member.email || "",
    phone: member.phone,
    office: member.office || member.function || member.functions?.[0] || "",
    church_id: String(member.church_id ?? member.tenant_id ?? ""),
    avatar_url: member.avatar_url,
    birthdate: member.birthdate,
  };
}

export const membersService = {
  async getMembers(churchId: string, filters?: { office?: string; search?: string }): Promise<Member[]> {
    const { data } = await api.get<ApiMember[]>(`/tenants/${churchId}/members`, { params: filters });
    return data.map(normalizeMember);
  },

  async getMember(memberId: string): Promise<Member> {
    const { data } = await api.get<ApiMember>(`/members/${memberId}`);
    return normalizeMember(data);
  },

  async getProfile(): Promise<Member> {
    const { data } = await api.get<ApiMember>("/members/me");
    return normalizeMember(data);
  },

  async updateProfile(payload: Partial<Pick<Member, "name" | "phone">>): Promise<Member> {
    const requestBody = {
      full_name: payload.name,
      phone: payload.phone,
    };
    const { data } = await api.patch<ApiMember>("/members/me", requestBody);
    return normalizeMember(data);
  },
};
