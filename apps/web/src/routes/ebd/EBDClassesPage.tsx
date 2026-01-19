import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ebdService } from '../../services/ebd';
import type { CreateClassDTO } from '../../services/ebd';
import { useCurrentTenant } from '../../hooks/useAuth';
import { Plus, BookOpen, GraduationCap, Users } from 'lucide-react';

export function EBDClassesPage() {
    const tenant = useCurrentTenant();
    const tenantId = tenant?.id;
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [minAge, setMinAge] = useState('');
    const [maxAge, setMaxAge] = useState('');
    const [location, setLocation] = useState('');

    const { data: classes, isLoading } = useQuery({
        queryKey: ['ebd-classes', tenantId],
        queryFn: () => ebdService.listClasses(tenantId!),
        enabled: !!tenantId
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateClassDTO) => ebdService.createClass(tenantId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ebd-classes'] });
            setIsFormOpen(false);
            setName('');
            setDesc('');
            setMinAge('');
            setMaxAge('');
            setLocation('');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({
            name,
            description: desc,
            min_age: minAge ? parseInt(minAge) : undefined,
            max_age: maxAge ? parseInt(maxAge) : undefined,
            location
        });
    };

    if (!tenantId) return <div>Selecione uma organização.</div>;
    if (isLoading) return <div>Carregando...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Educação Cristã (EBD)</h1>
                    <p className="text-gray-500">Gestão de classes e ensino bíblico.</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={20} /> Nova Classe
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes?.map(c => (
                    <div key={c.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                <BookOpen size={24} />
                            </div>
                            {c.location && (
                                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                    {c.location}
                                </span>
                            )}
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{c.name}</h3>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{c.description || "Sem descrição."}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                            {(c.min_age !== undefined || c.max_age !== undefined) && (
                                <span className="flex items-center gap-1">
                                    <Users size={16} /> {c.min_age}-{c.max_age} anos
                                </span>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button className="flex-1 text-sm bg-gray-50 text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                                <GraduationCap size={16} /> Alunos
                            </button>
                            <button className="flex-1 text-sm bg-gray-50 text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                                <BookOpen size={16} /> Lições
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {classes?.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    Nenhuma classe cadastrada.
                </div>
            )}

            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Nova Classe de EBD</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Classe</label>
                                <input
                                    type="text"
                                    required
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2.5"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <textarea
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2.5"
                                    rows={2}
                                    value={desc}
                                    onChange={e => setDesc(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Idade Mín.</label>
                                    <input
                                        type="number"
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2.5"
                                        value={minAge}
                                        onChange={e => setMinAge(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Idade Máx.</label>
                                    <input
                                        type="number"
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2.5"
                                        value={maxAge}
                                        onChange={e => setMaxAge(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Local/Sala</label>
                                <input
                                    type="text"
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2.5"
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium shadow-sm transition-colors"
                                >
                                    {createMutation.isPending ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
