import { GraduationCap, Users, Calendar, BookOpen, Clock, MapPin, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PageHeaderWithIcon } from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { EmptyState } from '../../components/EmptyState';
import { useCurrentTenant } from '../../hooks/useAuth';
import { ebdService, type EBDLesson } from '../../services/ebd';

function getLessonStatus(lessonDate: string): 'completed' | 'current' | 'upcoming' {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = new Date(lessonDate);
  date.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'completed';
  if (diffDays <= 7) return 'current';
  return 'upcoming';
}

function formatLessonDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function getNextSunday(): string {
  const today = new Date();
  const daysUntilSunday = (7 - today.getDay()) % 7 || 7;
  const nextSunday = new Date(today);
  nextSunday.setDate(today.getDate() + daysUntilSunday);
  return nextSunday.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function getCurrentLesson(lessons: EBDLesson[]): EBDLesson | null {
  const sorted = [...lessons].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const today = new Date();

  for (const lesson of sorted) {
    const lessonDate = new Date(lesson.date);
    if (lessonDate >= today || getLessonStatus(lesson.date) === 'current') {
      return lesson;
    }
  }
  return sorted[sorted.length - 1] || null;
}

export function MemberEBDPage() {
  const tenant = useCurrentTenant();

  const { data: userClass, isLoading } = useQuery({
    queryKey: ['my-ebd-class', tenant?.id],
    queryFn: () => ebdService.getMyClass(tenant!.id),
    enabled: !!tenant?.id,
  });

  const lessons = userClass?.lessons || [];
  const sortedLessons = [...lessons].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const currentLesson = getCurrentLesson(lessons);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <PageHeaderWithIcon
          icon={GraduationCap}
          title="Minha Turma - EBD"
          description="Escola Bíblica Dominical"
        />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      </div>
    );
  }

  if (!userClass) {
    return (
      <div className="max-w-3xl mx-auto">
        <PageHeaderWithIcon
          icon={GraduationCap}
          title="Minha Turma - EBD"
          description="Escola Bíblica Dominical"
        />
        <EmptyState
          icon={GraduationCap}
          title="Você não está matriculado em uma turma"
          description="Entre em contato com a secretaria da EBD para se matricular em uma classe."
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeaderWithIcon
        icon={GraduationCap}
        title="Minha Turma - EBD"
        description="Escola Bíblica Dominical"
      />

      {/* Class Info Card */}
      <Card className="mb-6 overflow-hidden shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{userClass.name}</CardTitle>
            <Badge variant="secondary" className="bg-white/20 text-white">
              {sortedLessons.length} lições
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Users size={20} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Descrição</p>
                <p className="font-medium text-gray-900">{userClass.description || userClass.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Clock size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Horário</p>
                <p className="font-medium text-gray-900">Domingos às 9h</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <MapPin size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Local</p>
                <p className="font-medium text-gray-900">{userClass.location || 'A definir'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                <Calendar size={20} className="text-rose-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Próxima Aula</p>
                <p className="font-medium text-gray-900 capitalize">{getNextSunday()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Lesson Highlight */}
      {currentLesson && (
        <Card className="mb-6 border-2 border-indigo-200 bg-indigo-50">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0">
                <BookOpen size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-indigo-600 font-medium mb-1">Lição Atual</p>
                <h3 className="text-lg font-bold text-gray-900">{currentLesson.topic}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {currentLesson.description || 'Prepare-se estudando o texto bíblico da lição antes do encontro'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lessons List */}
      {sortedLessons.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lições do Trimestre</h3>
          <div className="space-y-2">
            {sortedLessons.map((lesson, index) => {
              const status = getLessonStatus(lesson.date);
              return (
                <Card
                  key={lesson.id}
                  className={`transition-all ${status === 'current'
                      ? 'border-2 border-indigo-300 bg-indigo-50/50'
                      : status === 'completed'
                        ? 'opacity-75'
                        : ''
                    }`}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : status === 'current'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className={`font-medium ${status === 'completed' ? 'text-gray-500' : 'text-gray-900'
                          }`}>
                          {lesson.topic}
                        </p>
                        <p className="text-sm text-gray-400">{formatLessonDate(lesson.date)}</p>
                      </div>
                    </div>
                    {status === 'current' && (
                      <Badge className="bg-indigo-500">Atual</Badge>
                    )}
                    {status === 'completed' && (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Concluída
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
