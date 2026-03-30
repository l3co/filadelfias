import { api } from "./api";
import type { Assembly, VotingItem } from "@/types/admin";

interface ApiCouncil {
  id?: string | number;
  name?: string;
  council_type?: string;
}

interface ApiMeeting {
  id?: string | number;
  title?: string;
  scheduled_date?: string;
  date?: string;
  status?: string;
  location?: string;
  council_id?: string | number;
  agenda?: string;
  meeting_type?: string;
}

function normalizeMeeting(item: ApiMeeting, churchId: string): Assembly {
  const rawStatus = (item.status || "").toUpperCase();
  const status =
    rawStatus === "COMPLETED" ? "concluded" : rawStatus === "IN_PROGRESS" ? "in_progress" : "scheduled";

  return {
    id: String(item.id ?? ""),
    title: item.title || item.agenda || "Assembleia",
    scheduled_at: item.scheduled_date || item.date || new Date().toISOString(),
    status,
    agenda: splitAgenda(item.agenda),
    church_id: churchId,
    location: item.location,
    council_id: String(item.council_id ?? ""),
  };
}

function splitAgenda(agenda?: string): string[] {
  if (!agenda) {
    return [];
  }

  return agenda
    .split(/\n+/)
    .map((item) => item.replace(/^\s*\d+[\).\-\s]+/, "").trim())
    .filter(Boolean);
}

export const governanceService = {
  async getAssemblies(churchId: string): Promise<Assembly[]> {
    const { data: councils } = await api.get<ApiCouncil[]>("/governance/councils", {
      params: { tenant_id: churchId },
    });

    const meetings = await Promise.all(
      councils.map(async (council) => {
        const { data } = await api.get<ApiMeeting[]>(`/governance/councils/${council.id}/meetings`, {
          params: { tenant_id: churchId },
        });
        return data.map((meeting) => normalizeMeeting({ ...meeting, council_id: council.id }, churchId));
      }),
    );

    return meetings.flat().sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
  },

  async getVotingItems(assemblyId: string, churchId: string): Promise<VotingItem[]> {
    const { data } = await api.get<VotingItem[]>(`/governance/meetings/${assemblyId}/votes`, {
      params: { tenant_id: churchId },
    });
    return data;
  },

  async vote(assemblyId: string, agendaIndex: number, churchId: string, choice: "yes" | "no" | "abstain"): Promise<void> {
    await api.post(`/governance/meetings/${assemblyId}/votes/${agendaIndex}`, { choice }, { params: { tenant_id: churchId } });
  },
};
