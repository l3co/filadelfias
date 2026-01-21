import { Globe, MapPin } from 'lucide-react';
import { useCurrentTenant } from '../../hooks/useAuth';
import { useMissions } from '../../features/missions/hooks/useMissions';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { LoadingOverlay } from '../../components/ui/spinner';

export function MemberMissionsPage() {
  const tenant = useCurrentTenant();
  const { data: missionaries, isLoading } = useMissions(tenant?.id);

  if (isLoading) {
    return <LoadingOverlay message="Carregando missionários..." />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader 
        title="Missões" 
        description="Conheça e ore pelos nossos missionários"
      />

      {!missionaries || missionaries.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="Nenhum missionário cadastrado"
          description="Em breve você poderá conhecer os missionários apoiados pela nossa igreja"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {missionaries.map((missionary) => (
            <div
              key={missionary.id}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  {missionary.photo_url ? (
                    <img 
                      src={missionary.photo_url} 
                      alt={missionary.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <Globe className="h-8 w-8 text-indigo-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{missionary.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{missionary.field_name}</span>
                  </div>
                  {missionary.bio && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                      {missionary.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
