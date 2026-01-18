import { Plus } from 'lucide-react';

export function MembersPage() {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Membros</h1>
                    <p className="text-gray-500">Gerencie os membros da sua igreja</p>
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer">
                    <Plus className="h-5 w-5 mr-2" />
                    Novo Membro
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md p-12 text-center border border-gray-200">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
                    <Plus className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Nenhum membro cadastrado</h3>
                <p className="mt-1 text-sm text-gray-500">Comece adicionando novos membros à igreja.</p>
            </div>
        </div>
    );
}
