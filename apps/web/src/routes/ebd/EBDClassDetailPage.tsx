import { useState } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, GraduationCap, BookOpen, Plus, Users, Calendar, MapPin, Trash2, ExternalLink } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMembers } from '../../features/members/hooks/useMembers';
import { ebdService } from '../../services/ebd';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { EmptyState } from '../../components/EmptyState';
import { EnrollStudentDialog } from '../../features/ebd/components/EnrollStudentDialog';
import { CreateLessonDialog } from '../../features/ebd/components/CreateLessonDialog';
import { LessonComments } from '../../features/ebd/components/LessonComments';
import { useAuthTenant } from '../../contexts/AuthContext';
import { ROUTES } from '../../lib/routes';

export function EBDClassDetailPage() {
    const { classId } = useParams<{ classId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const tenant = useAuthTenant();
    const activeTab = searchParams.get('tab') || 'students';
    const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
    const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
    const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);

    const handleTabChange = (value: string) => {
        navigate(`${ROUTES.ADMIN.EDUCATION_CLASS(classId ?? '')}?tab=${value}`, { replace: true });
    };

    const { data: classes } = useQuery({
        queryKey: ['ebd-classes', tenant?.id],
        queryFn: () => ebdService.listClasses(tenant!.id),
        enabled: !!tenant?.id,
    });

    const currentClass = classes?.find(c => c.id === classId);

    const { data: students, isLoading: studentsLoading } = useQuery({
        queryKey: ['ebd-students', classId],
        queryFn: () => ebdService.listStudents(classId!, tenant!.id),
        enabled: !!classId && !!tenant?.id,
    });

    const { data: lessons, isLoading: lessonsLoading } = useQuery({
        queryKey: ['ebd-lessons', classId],
        queryFn: () => ebdService.listLessons(classId!, tenant!.id),
        enabled: !!classId && !!tenant?.id,
    });

    const { data: members } = useMembers(tenant?.id);

    const queryClient = useQueryClient();

    const removeStudentMutation = useMutation({
        mutationFn: (studentId: string) => ebdService.removeStudent(classId!, studentId, tenant!.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ebd-students', classId] });
            toast.success('Aluno removido da turma!');
        },
        onError: () => {
            toast.error('Erro ao remover aluno.');
        }
    });

    const getMemberName = (memberId: string) => {
        const member = members?.find(m => m.id === memberId);
        return member?.full_name || 'Membro não encontrado';
    };

    const getRoleBadge = (role: string) => {
        const roles: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
            'TEACHER': { label: 'Professor', variant: 'default' },
            'ASSISTANT': { label: 'Auxiliar', variant: 'secondary' },
            'STUDENT': { label: 'Aluno', variant: 'outline' },
        };
        return roles[role] || { label: role, variant: 'outline' as const };
    };

    if (!tenant || !classId) {
        return (
            <EmptyState
                icon={GraduationCap}
                title="Turma não encontrada"
                description="Selecione uma turma válida."
            />
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to={ROUTES.ADMIN.EDUCATION}>
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft size={16} /> Voltar
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{currentClass?.name || 'Turma'}</h1>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                        {currentClass?.location && (
                            <span className="flex items-center gap-1">
                                <MapPin size={14} /> {currentClass.location}
                            </span>
                        )}
                        {(currentClass?.min_age || currentClass?.max_age) && (
                            <span className="flex items-center gap-1">
                                <Users size={14} /> {currentClass.min_age ?? 0} - {currentClass.max_age ?? '∞'} anos
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList>
                    <TabsTrigger value="students" className="gap-2">
                        <GraduationCap size={16} /> Alunos ({students?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="lessons" className="gap-2">
                        <BookOpen size={16} /> Lições ({lessons?.length || 0})
                    </TabsTrigger>
                </TabsList>

                {/* Students Tab */}
                <TabsContent value="students" className="mt-6">
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => setIsEnrollDialogOpen(true)} className="gap-2">
                            <Plus size={16} /> Matricular Aluno
                        </Button>
                    </div>

                    {studentsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : !students?.length ? (
                        <EmptyState
                            icon={Users}
                            title="Nenhum aluno matriculado"
                            description="Matricule alunos nesta turma para começar."
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {students.map(student => {
                                const roleInfo = getRoleBadge(student.role);
                                return (
                                    <Card key={student.id} className="hover:shadow-sm transition-shadow group">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{getMemberName(student.member_id)}</p>
                                                <p className="text-xs text-gray-500">
                                                    Matriculado em {new Date(student.enrolled_at).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
                                                <button
                                                    onClick={() => removeStudentMutation.mutate(student.id)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Remover aluno"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Lessons Tab */}
                <TabsContent value="lessons" className="mt-6">
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => setIsLessonDialogOpen(true)} className="gap-2">
                            <Plus size={16} /> Nova Lição
                        </Button>
                    </div>

                    {lessonsLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : !lessons?.length ? (
                        <EmptyState
                            icon={BookOpen}
                            title="Nenhuma lição cadastrada"
                            description="Adicione lições para esta turma."
                        />
                    ) : (
                        <div className="space-y-4">
                            {lessons.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(lesson => (
                                <Card key={lesson.id} className="hover:shadow-sm transition-shadow">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-base">{lesson.topic}</CardTitle>
                                                {lesson.bible_reference && (
                                                    <p className="text-sm text-indigo-600 font-medium mt-1">
                                                        {lesson.bible_reference}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(lesson.date).toLocaleDateString('pt-BR')}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0 space-y-4">
                                        {lesson.description && (
                                            <p className="text-sm text-gray-600">{lesson.description}</p>
                                        )}
                                        <div className="flex items-center gap-3">
                                            {lesson.homework_url && (
                                                <a
                                                    href={lesson.homework_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                                >
                                                    <ExternalLink size={14} />
                                                    Material
                                                </a>
                                            )}
                                            <button
                                                onClick={() => setExpandedLessonId(expandedLessonId === lesson.id ? null : lesson.id)}
                                                className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                                            >
                                                {expandedLessonId === lesson.id ? 'Ocultar comentários' : 'Ver comentários'}
                                            </button>
                                        </div>

                                        {expandedLessonId === lesson.id && (
                                            <div className="pt-4 border-t border-gray-100">
                                                <LessonComments
                                                    lessonId={lesson.id}
                                                    tenantId={tenant!.id}
                                                    currentMemberId={students?.find(s => s.member_id)?.member_id}
                                                    members={members || []}
                                                    canDelete={true}
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <EnrollStudentDialog
                isOpen={isEnrollDialogOpen}
                onClose={() => setIsEnrollDialogOpen(false)}
                classId={classId}
                members={members || []}
                enrolledMemberIds={students?.map(s => s.member_id) || []}
                tenantId={tenant!.id}
            />

            <CreateLessonDialog
                isOpen={isLessonDialogOpen}
                onClose={() => setIsLessonDialogOpen(false)}
                classId={classId}
                tenantId={tenant!.id}
            />
        </div>
    );
}
