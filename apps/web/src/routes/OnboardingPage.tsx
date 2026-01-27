import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Church, Building2, Link2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

type FormData = {
    name: string;
    slug: string;
}

const steps = [
    { number: 1, title: 'Criar conta', completed: true },
    { number: 2, title: 'Configurar igreja', completed: false, active: true },
    { number: 3, title: 'Começar a usar', completed: false },
];

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
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#002333] via-green-900 to-[#002333] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
                
                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <Link to="/" className="flex items-center gap-3 mb-12">
                        <img src="/logo.svg" alt="Logo" className="h-10 w-10" />
                        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-300">
                            Filadélfias
                        </h1>
                    </Link>
                    
                    <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8">
                        <Church size={40} className="text-green-300" />
                    </div>
                    
                    <h2 className="text-3xl font-bold mb-4">
                        Configure sua igreja
                    </h2>
                    <p className="text-green-100/80 text-lg leading-relaxed max-w-md">
                        Em poucos passos você terá acesso a todas as ferramentas 
                        de gestão eclesiástica da plataforma.
                    </p>
                    
                    {/* Progress Steps */}
                    <div className="mt-12 space-y-4">
                        {steps.map((step, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    step.completed 
                                        ? 'bg-green-500 text-white' 
                                        : step.active 
                                            ? 'bg-white text-green-700' 
                                            : 'bg-white/20 text-white/60'
                                }`}>
                                    {step.completed ? <CheckCircle2 size={18} /> : step.number}
                                </div>
                                <span className={`text-sm font-medium ${
                                    step.completed || step.active ? 'text-white' : 'text-white/50'
                                }`}>
                                    {step.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-b from-white to-[#DEEFE7]/30">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2">
                            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
                            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-600">
                                Filadélfias
                            </h1>
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="text-center lg:text-left">
                        <div className="lg:hidden w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center mb-4">
                            <Church size={32} className="text-green-600" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-[#002333] tracking-tight">
                            Bem-vindo ao Filadélfias!
                        </h2>
                        <p className="mt-2 text-gray-500">
                            Vamos configurar sua primeira igreja para começar.
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            {error && (
                                <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl">
                                    <AlertCircle size={20} className="flex-shrink-0" />
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nome da Igreja
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Building2 size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        {...register('name', { required: 'Nome obrigatório' })}
                                        type="text"
                                        placeholder="Ex: Igreja Presbiteriana Central"
                                        className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 hover:bg-white"
                                    />
                                </div>
                                {errors.name && (
                                    <span className="text-xs text-red-500 mt-1 block">{errors.name.message}</span>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Identificador (Slug)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Link2 size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        {...register('slug', {
                                            required: 'Slug obrigatório',
                                            pattern: { value: /^[a-z0-9-]+$/, message: 'Use apenas letras minúsculas, números e hifens' }
                                        })}
                                        type="text"
                                        placeholder="ipb-central"
                                        className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 hover:bg-white"
                                    />
                                </div>
                                {errors.slug && (
                                    <span className="text-xs text-red-500 mt-1 block">{errors.slug.message}</span>
                                )}
                                <p className="mt-2 text-xs text-gray-500">
                                    Isso será usado na URL da sua igreja: <span className="font-medium text-gray-700">filadelfias.com/ipb-central</span>
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-600/25 hover:shadow-xl hover:shadow-green-600/30 transition-all duration-300"
                            >
                                {isLoading ? (
                                    <span>Criando Igreja...</span>
                                ) : (
                                    <>
                                        <span>Criar Igreja e Começar</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-sm text-gray-500">
                        Precisa de ajuda? <a href="#" className="text-green-600 hover:text-green-700 font-medium">Entre em contato</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
