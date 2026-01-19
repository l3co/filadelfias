import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegister } from '../hooks/useAuth';
import { AxiosError } from 'axios';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { mutate: register, isPending, error } = useRegister();

    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: '',
        confirmPassword: '',
    });

    const [validationError, setValidationError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError('');

        if (formData.password !== formData.confirmPassword) {
            setValidationError('As senhas não coincidem');
            return;
        }

        if (formData.password.length < 8) {
            setValidationError('A senha deve ter no mínimo 8 caracteres');
            return;
        }

        register(
            {
                email: formData.email,
                name: formData.name,
                password: formData.password,
            },
            {
                onSuccess: () => {
                    navigate('/login');
                },
            }
        );
    };

    const errorMessage = validationError || (error as AxiosError<{ detail: string }>)?.response?.data?.detail;

    return (
        <div className="min-h-screen flex items-center justify-center bg-mint-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
                <div>
                    <h2 className="text-center text-3xl font-bold text-navy-900">
                        Filadelfias
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Crie sua conta
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {errorMessage && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {errorMessage}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nome completo
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Senha
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirmar senha
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? 'Cadastrando...' : 'Cadastrar'}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link to="/login" className="text-sm text-teal-500 hover:text-teal-600">
                            Já tem uma conta? Entre
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
