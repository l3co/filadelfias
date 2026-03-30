import { Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMissions } from "@/hooks/useMissions";

export function MissionsScreen() {
  const navigate = useNavigate();
  const { data: missions, isLoading } = useMissions();

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">Missoes</h1>
        <p className="text-sm text-muted-foreground">Acompanhe campos missionarios e pedidos de oracao.</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando missoes...</p>
      ) : (
        <div className="space-y-3">
          {missions?.map((mission) => (
            <button
              key={mission.id}
              onClick={() => navigate(`/member/missions/${mission.id}`)}
              className="w-full rounded-2xl border bg-card p-4 text-left transition-colors hover:bg-muted"
            >
              <div className="mb-2 flex items-center gap-2">
                <Globe size={16} className="text-primary" />
                <span className="text-xs text-muted-foreground">
                  {mission.country} {mission.field ? `- ${mission.field}` : ""}
                </span>
              </div>
              <p className="font-medium">{mission.missionary_name}</p>
              <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{mission.description}</p>
            </button>
          ))}

          {!missions?.length ? <p className="text-sm text-muted-foreground">Nenhuma missao encontrada.</p> : null}
        </div>
      )}
    </div>
  );
}
