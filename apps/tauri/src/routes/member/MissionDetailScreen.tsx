import { Globe } from "lucide-react";
import { useParams } from "react-router-dom";
import { useMission } from "@/hooks/useMissions";

export function MissionDetailScreen() {
  const { missionId } = useParams<{ missionId: string }>();
  const { data: mission, isLoading } = useMission(missionId);

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Carregando missao...</div>;
  }

  if (!mission) {
    return <div className="p-4 text-sm text-muted-foreground">Missao nao encontrada.</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <div className="rounded-2xl border bg-card p-5">
        <div className="mb-2 flex items-center gap-2">
          <Globe size={16} className="text-primary" />
          <span className="text-xs text-muted-foreground">
            {mission.country} {mission.field ? `- ${mission.field}` : ""}
          </span>
        </div>
        <h1 className="text-2xl font-bold">{mission.missionary_name}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{mission.description}</p>
      </div>

      {mission.prayer_requests.length ? (
        <div className="rounded-2xl border bg-card p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">Pedidos de oracao</p>
          <ul className="space-y-2">
            {mission.prayer_requests.map((request, index) => (
              <li key={`${mission.id}-${index}`} className="text-sm text-muted-foreground">
                • {request}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
