import { use } from 'react';
import { Globe, HandHeart, MapPinned } from 'lucide-react';
import { getMissionariesPromise, getSocialProjectsPromise } from '../data/missions.data';

interface MissionsSummaryProps {
  missionariesRefreshKey?: string;
  projectsRefreshKey?: string;
  tenantId: string;
}

export function MissionsSummary({
  missionariesRefreshKey,
  projectsRefreshKey,
  tenantId,
}: MissionsSummaryProps) {
  const missionaries = use(getMissionariesPromise(tenantId, missionariesRefreshKey));
  const projects = use(getSocialProjectsPromise(tenantId, projectsRefreshKey));
  const countryCount = new Set(missionaries.map((missionary) => missionary.country_code)).size;
  const activeProjectsCount = projects.filter((project) => project.status === 'ACTIVE').length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
        <div className="mb-2 flex items-center gap-2 text-orange-700">
          <Globe size={16} />
          <span className="text-sm font-medium">Missionários</span>
        </div>
        <p className="text-2xl font-semibold text-orange-950">{missionaries.length}</p>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <div className="mb-2 flex items-center gap-2 text-blue-700">
          <MapPinned size={16} />
          <span className="text-sm font-medium">Países alcançados</span>
        </div>
        <p className="text-2xl font-semibold text-blue-950">{countryCount}</p>
      </div>

      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
        <div className="mb-2 flex items-center gap-2 text-rose-700">
          <HandHeart size={16} />
          <span className="text-sm font-medium">Projetos ativos</span>
        </div>
        <p className="text-2xl font-semibold text-rose-950">{activeProjectsCount}</p>
      </div>
    </div>
  );
}
