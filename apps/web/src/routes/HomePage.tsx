import { useCurrentUser, useLogout } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
    const { data: user, isLoading } = useCurrentUser();
    const { mutate: logout } = useLogout();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(undefined, {
            onSuccess: () => {
                navigate('/login');
            },
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-mint-50">
                <div className="text-navy-900">Carregando...</div>
            </div>
        );
    }

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-mint-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-navy-900">Filadelfias</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Olá, {user.name}</span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 rounded-md"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-2xl font-bold text-navy-900 mb-4">
                            Bem-vindo ao Filadelfias!
                        </h2>
                        <p className="text-gray-600">
                            Você está autenticado como <strong>{user.email}</strong>
                        </p>
                        <p className="text-gray-600 mt-2">
                            Esta é a página inicial. Em breve teremos mais funcionalidades!
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
