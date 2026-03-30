import { api } from "./api";
import type { Mission } from "@/types/member";

interface ApiMission {
  id?: string | number;
  missionary_name?: string;
  missionaryName?: string;
  name?: string;
  field?: string;
  country?: string;
  description?: string;
  prayer_requests?: string[];
  prayerRequests?: string[];
  church_id?: string | number;
  tenant_id?: string | number;
}

function normalizeMission(mission: ApiMission): Mission {
  return {
    id: String(mission.id ?? ""),
    missionary_name: mission.missionary_name || mission.missionaryName || mission.name || "Missionario",
    field: mission.field || "",
    country: mission.country || "",
    description: mission.description || "",
    prayer_requests: mission.prayer_requests || mission.prayerRequests || [],
    church_id: String(mission.church_id ?? mission.tenant_id ?? ""),
  };
}

export const missionsService = {
  async getMissions(churchId: string): Promise<Mission[]> {
    const { data } = await api.get<ApiMission[]>(`/tenants/${churchId}/missions`);
    return data.map(normalizeMission);
  },

  async getMission(missionId: string): Promise<Mission> {
    const { data } = await api.get<ApiMission>(`/missions/${missionId}`);
    return normalizeMission(data);
  },
};
