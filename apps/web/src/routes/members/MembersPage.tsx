import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useCurrentTenant } from '../../hooks/useAuth';
import { useMembers } from '../../hooks/useMembers';
import { CreateMemberModal } from './CreateMemberModal';

export function MembersPage() {
    const tenant = useCurrentTenant();
    const { data: members, isLoading } = useMembers(tenant?.id);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!tenant) {
        return (
            <div className="p-12 text-center bg-white rounded-lg shadow">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                    <span className="text-2xl">⚠️</span>
                </div>
                <h2 className="text-lg font-medium text-gray-900">Nenhuma igreja vinculada</h2>
                <p className="text-gray-500 mt-2">Sua conta não está vinculada a nenhuma igreja.</p>
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Membros - {tenant.name}</h1>
                    <p className="text-sm text-gray-500">Gerencie os membros da sua congregação</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Novo Membro
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Carregando lista de membros...</p>
                </div>
            ) : members && members.length > 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                    <ul role="list" className="divide-y divide-gray-200">
                        {members.map((member) => (
                            <li key={member.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                            {member.full_name.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-900">{member.full_name}</h3>
                                            <p className="text-sm text-gray-500">{member.email || 'Sem email'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {member.status}
                                        </span>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {member.role}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md p-12 text-center border border-gray-200">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
                        <Plus className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Nenhum membro encontrado</h3>
                    <p className="mt-1 text-sm text-gray-500">Clique em "Novo Membro" para adicionar alguém à lista.</p>
                </div>
            )}

            <CreateMemberModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                tenantId={tenant.id}
            />
        </div>
    );
}
