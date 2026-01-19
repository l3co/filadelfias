import { Users, Landmark, Gavel, Calendar } from 'lucide-react';
import { Card, CardContent, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import type { Council } from '../../../services/governance';

interface CouncilListProps {
    councils?: Council[];
    isLoading?: boolean;
}

export function CouncilList({ councils, isLoading }: CouncilListProps) {
    if (isLoading) {
        return <div className="text-center p-8 text-gray-500">Carregando governança...</div>;
    }

    if (!councils || councils.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Landmark className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum órgão governamental</h3>
                <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">Comece estruturando a liderança da igreja criando o Conselho ou a Junta Diaconal.</p>
            </div>
        );
    }

    const sections = [
        { title: 'Conselhos e Juntas', types: ['SESSION', 'DEACONS'] },
        { title: 'Assembleias', types: ['ASSEMBLY'] },
        { title: 'Comissões', types: ['COMMITTEE'] },
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'ASSEMBLY': return <Users size={20} />;
            case 'SESSION': return <Gavel size={20} />;
            default: return <Landmark size={20} />;
        }
    };

    return (
        <div className="space-y-10">
            {sections.map(section => {
                const items = councils.filter(c => section.types.includes(c.type));
                if (!items.length) return null;

                return (
                    <div key={section.title} className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            {section.title}
                            <Badge variant="secondary" className="rounded-full px-2">{items.length}</Badge>
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map(council => (
                                <Card key={council.id} className="hover:shadow-md transition-shadow group">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                                {getIcon(council.type)}
                                            </div>
                                            <Badge variant="outline" className="text-[10px] uppercase">
                                                {council.type}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-lg mb-2">{council.name}</CardTitle>
                                        <p className="text-gray-500 text-sm mb-6 line-clamp-2 h-10">
                                            {council.description || 'Sem descrição.'}
                                        </p>

                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="w-full">
                                                <Users size={14} className="mr-2" /> Membros
                                            </Button>
                                            <Button variant="ghost" size="sm" className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800">
                                                <Calendar size={14} className="mr-2" /> Reuniões
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
