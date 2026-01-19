import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { governanceService } from '../../services/governance';
import type { CreateCouncilDTO } from '../../services/governance';
import { useCurrentTenant } from '../../hooks/useAuth';
import { Plus, Users, Landmark, Gavel } from 'lucide-react';

export function CouncilsPage() {
    const tenant = useCurrentTenant();
    const tenantId = tenant?.id;
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [type, setType] = useState('SESSION');
    const [desc, setDesc] = useState('');

    const { data: councils, isLoading } = useQuery({
        queryKey: ['councils', tenantId],
        queryFn: () => governanceService.listCouncils(tenantId!),
        enabled: !!tenantId
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateCouncilDTO) => governanceService.createCouncil(tenantId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['councils'] });
            setIsFormOpen(false);
            setName('');
            setDesc('');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({ name, type, description: desc });
    };

    if (!tenantId) return <div>Selecione uma organização.</div>;
    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    const sections = [
        { title: 'Conselhos e Juntas', types: ['SESSION', 'DEACONS'] },
        { title: 'Assembleias', types: ['ASSEMBLY'] },
        { title: 'Comissões', types: ['COMMITTEE'] },
    ];

    const hasCouncils = councils && councils.length > 0;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Governo e Liderança</h1>
                    <p className="text-gray-500">Gestão dos órgãos oficiais da igreja.</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={20} /> Novo Órgão
                </button>
            </div>

            {/* Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Criar Novo Órgão</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Conselho da Igreja, Junta Diaconal"
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2.5"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                <select
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2.5 bg-white"
                                    value={type}
                                    onChange={e => setType(e.target.value)}
                                >
                                    <option value="SESSION">Conselho (Presbíteros)</option>
                                    <option value="DEACONS">Junta Diaconal</option>
                                    <option value="ASSEMBLY">Assembleia</option>
                                    <option value="COMMITTEE">Comissão Temporária</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <textarea
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2.5"
                                    rows={3}
                                    placeholder="Opcional. Descreva o propósito deste órgão."
                                    value={desc}
                                    onChange={e => setDesc(e.target.value)}
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
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium shadow-sm transition-colors"
                                >
                                    {createMutation.isPending ? 'Criando...' : 'Criar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="space-y-10">
                {hasCouncils ? sections.map(section => {
                    const items = councils?.filter(c => section.types.includes(c.type));
                    if (!items?.length) return null;

                    return (
                        <div key={section.title}>
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2 flex items-center gap-2">
                                {section.title}
                                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{items.length}</span>
                            </h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {items.map(council => (
                                    <div key={council.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                                {council.type === 'ASSEMBLY' ? <Users size={24} /> :
                                                    council.type === 'SESSION' ? <Gavel size={24} /> :
                                                        <Landmark size={24} />}
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                                                {council.type}
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2 truncate">{council.name}</h4>
                                        <p className="text-gray-500 text-sm mb-6 line-clamp-2 min-h-[40px]">{council.description || 'Sem descrição.'}</p>

                                        <div className="flex gap-2">
                                            <button className="flex-1 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all">
                                                Membros
                                            </button>
                                            <button className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors">
                                                Reuniões
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }) : (
                    <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Landmark className="h-8 w-8 text-indigo-600" />
                        </div>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum órgão governamental</h3>
                        <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">Comece estruturando a liderança da igreja criando o Conselho ou a Junta Diaconal.</p>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            Criar Primeiro Órgão
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
