import { Link } from 'react-router-dom';
import { BookOpen, Users, GraduationCap, MapPin } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { buttonVariants } from "../../../components/ui/button";
import type { EBDClass } from '../../../services/ebd';

interface ClassListProps {
    classes?: EBDClass[];
    isLoading?: boolean;
}

export function ClassList({ classes, isLoading }: ClassListProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (!classes || classes.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma classe</h3>
                <p className="mt-1 text-sm text-gray-500">Cadastre a primeira classe para começar as aulas.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((c) => (
                <Card key={c.id} className="hover:shadow-md transition-shadow group">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                            <BookOpen size={20} />
                        </div>
                        {c.location && (
                            <Badge variant="secondary" className="font-normal text-xs flex items-center gap-1">
                                <MapPin size={10} /> {c.location}
                            </Badge>
                        )}
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-lg mb-2">{c.name}</CardTitle>
                        <p className="text-sm text-gray-500 line-clamp-2 h-10">
                            {c.description || "Sem descrição disponível."}
                        </p>

                        <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
                            {(c.min_age !== undefined || c.max_age !== undefined) && (
                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs">
                                    <Users size={12} />
                                    {c.min_age ?? '0'} - {c.max_age ?? '∞'} anos
                                </span>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="grid grid-cols-2 gap-2">
                        <Link 
                            to={`/app/ebd/${c.id}?tab=students`}
                            className={buttonVariants({ variant: "outline", size: "sm", className: "w-full gap-2" })}
                        >
                            <GraduationCap size={14} /> Alunos
                        </Link>
                        <Link 
                            to={`/app/ebd/${c.id}?tab=lessons`}
                            className={buttonVariants({ variant: "outline", size: "sm", className: "w-full gap-2" })}
                        >
                            <BookOpen size={14} /> Lições
                        </Link>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
