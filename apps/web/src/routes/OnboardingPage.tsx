import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

type FormData = {
    name: string;
    slug: string;
}

export function OnboardingPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        setError('');
        try {
            await api.post('/tenants', data);
            // Refresh user to get new membership
            await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            navigate('/app');
        } catch (err) {
            const error = err as AxiosError<{ detail: string }>;
            setError(error.response?.data?.detail || 'Erro ao criar organização. Tente outro slug.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">🏛️</span>
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
                    Bem-vindo ao Filadelfias!
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Para começar, vamos configurar sua primeira igreja.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {error && (
                            <div className="rounded-md bg-red-50 p-4 border border-red-200">
                                <div className="text-sm text-red-700">{error}</div>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome da Igreja</label>
                            <input
                                {...register('name', { required: 'Nome obrigatório' })}
                                type="text"
                                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Ex: Igreja Presbiteriana Central"
                            />
                            {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name.message}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Identificador (Slug)</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                    app.filadelfias.com/
                                </span>
                                <input
                                    {...register('slug', {
                                        required: 'Slug obrigatório',
                                        pattern: { value: /^[a-z0-9-]+$/, message: 'Use apenas letras minúsculas, números e hifens' }
                                    })}
                                    type="text"
                                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="ipb-central"
                                />
                            </div>
                            {errors.slug && <span className="text-xs text-red-500 mt-1">{errors.slug.message}</span>}
                            <p className="mt-1 text-xs text-gray-500">Isso será usado na URL da sua igreja.</p>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                            >
                                {isLoading ? 'Criando Igreja...' : 'Criar Igreja e Começar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
