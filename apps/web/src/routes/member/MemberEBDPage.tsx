import { GraduationCap, Users, Calendar, BookOpen, Clock, MapPin } from 'lucide-react';
import { PageHeaderWithIcon } from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { EmptyState } from '../../components/EmptyState';

interface EBDClass {
  id: string;
  name: string;
  teacher: string;
  schedule: string;
  location: string;
  currentLesson: string;
  nextClass: string;
  totalStudents: number;
}

const mockUserClass: EBDClass | null = {
  id: '1',
  name: 'Jovens e Adultos',
  teacher: 'Prof. Carlos Mendes',
  schedule: 'Domingos às 9h',
  location: 'Sala 3 - Anexo',
  currentLesson: 'A Soberania de Deus',
  nextClass: 'Domingo, 26 de Janeiro',
  totalStudents: 18,
};

interface Lesson {
  id: string;
  number: number;
  title: string;
  date: string;
  status: 'completed' | 'current' | 'upcoming';
}

const mockLessons: Lesson[] = [
  { id: '1', number: 1, title: 'Introdução ao Trimestre', date: '05/01', status: 'completed' },
  { id: '2', number: 2, title: 'A Natureza de Deus', date: '12/01', status: 'completed' },
  { id: '3', number: 3, title: 'A Soberania de Deus', date: '19/01', status: 'current' },
  { id: '4', number: 4, title: 'A Providência Divina', date: '26/01', status: 'upcoming' },
  { id: '5', number: 5, title: 'A Graça de Deus', date: '02/02', status: 'upcoming' },
];

export function MemberEBDPage() {
  const userClass = mockUserClass;

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
              {userClass.totalStudents} alunos
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
                <p className="text-xs text-gray-500">Professor(a)</p>
                <p className="font-medium text-gray-900">{userClass.teacher}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Clock size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Horário</p>
                <p className="font-medium text-gray-900">{userClass.schedule}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <MapPin size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Local</p>
                <p className="font-medium text-gray-900">{userClass.location}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                <Calendar size={20} className="text-rose-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Próxima Aula</p>
                <p className="font-medium text-gray-900">{userClass.nextClass}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Lesson Highlight */}
      <Card className="mb-6 border-2 border-indigo-200 bg-indigo-50">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-indigo-600 font-medium mb-1">Lição Atual</p>
              <h3 className="text-lg font-bold text-gray-900">{userClass.currentLesson}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Prepare-se estudando o texto bíblico da lição antes do encontro
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lessons List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lições do Trimestre</h3>
        <div className="space-y-2">
          {mockLessons.map((lesson) => (
            <Card 
              key={lesson.id} 
              className={`transition-all ${
                lesson.status === 'current' 
                  ? 'border-2 border-indigo-300 bg-indigo-50/50' 
                  : lesson.status === 'completed'
                  ? 'opacity-75'
                  : ''
              }`}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    lesson.status === 'completed' 
                      ? 'bg-green-100 text-green-700'
                      : lesson.status === 'current'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {lesson.number}
                  </div>
                  <div>
                    <p className={`font-medium ${
                      lesson.status === 'completed' ? 'text-gray-500' : 'text-gray-900'
                    }`}>
                      {lesson.title}
                    </p>
                    <p className="text-sm text-gray-400">{lesson.date}</p>
                  </div>
                </div>
                {lesson.status === 'current' && (
                  <Badge className="bg-indigo-500">Atual</Badge>
                )}
                {lesson.status === 'completed' && (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    Concluída
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
