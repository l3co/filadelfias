import { useCurrentUser } from '../hooks/useAuth';

export default function HomePage() {
    const { data: user } = useCurrentUser();

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Card Example */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500">Membros Ativos</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">0</p>
                    <div className="mt-2 flex items-center text-sm text-green-600">
                        <span>Dados reais em breve</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 col-span-1 md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Bem-vindo, {user?.name}!</h3>
                    <p className="text-gray-600">
                        Você está no painel administrativo do <strong>Filadelfias</strong>.
                        Use o menu lateral para cadastrar membros, ver relatórios e gerenciar a igreja.
                    </p>
                </div>
            </div>
        </div>
    );
}
