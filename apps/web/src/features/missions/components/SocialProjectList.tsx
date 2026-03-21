import { CalendarDays, MapPin, Pencil, Trash2, Users2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { EmptyState } from '../../../components/EmptyState';
import { formatDateBR } from '../../../lib/formatters';
import type { SocialProject } from '../../../services/missions';

type Props = {
  isDeleting: boolean;
  isLoading: boolean;
  onEdit: (project: SocialProject) => void;
  onDelete: (projectId: string) => void;
  projects?: SocialProject[];
};

const STATUS_LABELS: Record<string, string> = {
  PLANNING: 'Planejamento',
  ACTIVE: 'Ativo',
  PAUSED: 'Pausado',
  COMPLETED: 'Concluído',
};

const STATUS_COLORS: Record<string, string> = {
  PLANNING: 'bg-amber-100 text-amber-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  PAUSED: 'bg-slate-100 text-slate-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
};

export function SocialProjectList({ isDeleting, isLoading, onDelete, onEdit, projects }: Props) {
  if (isLoading) {
    return <p className="text-sm text-gray-500">Carregando projetos sociais...</p>;
  }

  if (!projects || projects.length === 0) {
    return (
      <EmptyState
        description="Cadastre a primeira iniciativa social da igreja."
        title="Nenhum projeto social"
        icon={Users2}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {projects.map((project) => (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm" key={project.id}>
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-gray-900">{project.title}</h3>
              <span
                className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[project.status] || STATUS_COLORS.PLANNING}`}
              >
                {STATUS_LABELS[project.status] || project.status}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                onClick={() => onEdit(project)}
                size="sm"
                variant="ghost"
                aria-label={`Editar projeto ${project.title}`}
                title={`Editar projeto ${project.title}`}
              >
                <Pencil className="h-4 w-4 text-blue-500" aria-hidden="true" />
              </Button>
              <Button
                isLoading={isDeleting}
                onClick={() => onDelete(project.id)}
                size="sm"
                variant="ghost"
                aria-label={`Excluir projeto ${project.title}`}
                title={`Excluir projeto ${project.title}`}
              >
                <Trash2 className="h-4 w-4 text-red-500" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-gray-600">{project.summary}</p>

          <div className="mt-4 space-y-2 text-xs text-gray-500">
            {project.location && (
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {project.location}
              </p>
            )}
            {project.target_audience && (
              <p className="flex items-center gap-2">
                <Users2 className="h-3.5 w-3.5" aria-hidden="true" />
                Público: {project.target_audience}
              </p>
            )}
            {(project.start_date || project.end_date) && (
              <p className="flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                {project.start_date ? formatDateBR(project.start_date) : 'Sem início'}
                {' - '}
                {project.end_date ? formatDateBR(project.end_date) : 'Sem fim'}
              </p>
            )}
            {(project.coordinator_name || project.contact_info) && (
              <p>
                Coordenação: {project.coordinator_name || 'Não informada'}
                {project.contact_info ? ` • ${project.contact_info}` : ''}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
