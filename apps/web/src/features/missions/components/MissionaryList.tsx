import { MapPin, Globe, Mail } from 'lucide-react';
import { Card, CardContent, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { buttonVariants } from "../../../components/ui/button";
import type { Missionary } from '../../../services/missions';

interface MissionaryListProps {
    missionaries?: Missionary[];
    isLoading?: boolean;
}

export function MissionaryList({ missionaries, isLoading }: MissionaryListProps) {
    if (isLoading) {
        return <div className="text-center p-8 text-gray-500">Carregando missões...</div>;
    }

    if (!missionaries || missionaries.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum missionário</h3>
                <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">Cadastre os missionários e projetos que sua igreja apoia.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missionaries.map((m) => (
                <Card key={m.id} className="hover:shadow-md transition-shadow overflow-hidden group">
                    <div className="h-32 bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                        <Globe size={48} className="text-indigo-200 group-hover:text-indigo-300" />
                    </div>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <CardTitle className="text-lg">{m.name}</CardTitle>
                            <Badge variant="secondary" className="font-mono text-xs">
                                {m.country_code}
                            </Badge>
                        </div>

                        <div className="flex items-center text-gray-500 text-sm mb-4 gap-1">
                            <MapPin size={16} />
                            {m.field_name}
                        </div>

                        <p className="text-gray-600 text-sm mb-6 line-clamp-3 min-h-[60px]">
                            {m.bio || "Sem biografia."}
                        </p>

                        {m.newsletter_url && (
                            <a
                                href={m.newsletter_url}
                                target="_blank"
                                rel="noreferrer"
                                className={buttonVariants({ variant: "outline", size: "sm", className: "w-full gap-2" })}
                            >
                                <Mail size={16} /> Ver Newsletter
                            </a>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
