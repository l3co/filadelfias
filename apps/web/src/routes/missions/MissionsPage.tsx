import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { missionService } from '../../services/missions';
import type { CreateMissionaryDTO } from '../../services/missions';
import { useCurrentTenant } from '../../hooks/useAuth';
import { Plus, MapPin, Globe, Mail } from 'lucide-react';

export function MissionsPage() {
    const tenant = useCurrentTenant();
    const tenantId = tenant?.id;
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [field, setField] = useState('');
    const [country, setCountry] = useState('');
    const [lat, setLat] = useState('0');
    const [lng, setLng] = useState('0');
    const [bio, setBio] = useState('');

    const { data: missionaries, isLoading } = useQuery({
        queryKey: ['missionaries', tenantId],
        queryFn: () => missionService.listMissionaries(tenantId!),
        enabled: !!tenantId
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateMissionaryDTO) => missionService.createMissionary(tenantId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['missionaries'] });
            setIsFormOpen(false);
            resetForm();
        }
    });

    const resetForm = () => {
        setName('');
        setField('');
        setCountry('');
        setLat('0');
        setLng('0');
        setBio('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({
            name,
            field_name: field,
            country_code: country,
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
            bio
        });
    };

    if (!tenantId) return <div>Selecione uma organização.</div>;
    if (isLoading) return <div>Carregando...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Missões</h1>
                    <p className="text-gray-500">Acompanhe nossos missionários e campos.</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={20} /> Novo Missionário
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {missionaries?.map(m => (
                    <div key={m.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-32 bg-indigo-50 flex items-center justify-center">
                            {/* Placeholder for photo */}
                            <Globe size={48} className="text-indigo-200" />
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-gray-900">{m.name}</h3>
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                    {m.country_code}
                                </span>
                            </div>
                            <div className="flex items-center text-gray-500 text-sm mb-4 gap-1">
                                <MapPin size={16} />
                                {m.field_name}
                            </div>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                {m.bio || "Sem biografia."}
                            </p>
                            {m.newsletter_url && (
                                <a
                                    href={m.newsletter_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-2 w-full border border-gray-200 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Mail size={16} /> Ver Newsletter
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {missionaries?.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    Nenhum missionário cadastrado.
                </div>
            )}

            {/* Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Novo Missionário</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                <input
                                    type="text"
                                    required
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2.5"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Campo</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: Sertão"
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2.5"
                                        value={field}
                                        onChange={e => setField(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">País (ISO)</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="BR"
                                        maxLength={2}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2.5 uppercase"
                                        value={country}
                                        onChange={e => setCountry(e.target.value.toUpperCase())}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2.5"
                                        value={lat}
                                        onChange={e => setLat(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2.5"
                                        value={lng}
                                        onChange={e => setLng(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Biografia</label>
                                <textarea
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2.5"
                                    rows={3}
                                    value={bio}
                                    onChange={e => setBio(e.target.value)}
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
