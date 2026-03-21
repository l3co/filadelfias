import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import { getPostLoginRoute } from '../lib/userRouting';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { ROUTES, useAppNavigate } from '../lib/routes';

export default function LoginPage() {
    const appNavigate = useAppNavigate();
    const { mutate: login, isPending, error } = useLogin();

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        login(formData, {
            onSuccess: () => {
                const route = getPostLoginRoute();
                appNavigate.to(route);
            },
        });
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#002333] via-green-900 to-[#002333] relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-64 bg-gradient-to-r from-transparent via-green-500/5 to-transparent" />
                
                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <Link to={ROUTES.PUBLIC.HOME} className="flex items-center gap-3 mb-12">
                        <img src="/logo.svg" alt="Logo" className="h-10 w-10" />
                        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-300">
                            Filadélfias
                        </h1>
                    </Link>
                    
                    <blockquote className="text-xl text-green-100/90 leading-relaxed italic border-l-4 border-green-500 pl-6 mb-8">
                        "Lâmpada para os meus pés é a tua palavra e luz para o meu caminho."
                        <footer className="text-green-300 text-base mt-3 not-italic font-medium">
                            — Salmo 119:105
                        </footer>
                    </blockquote>
                    
                    <p className="text-green-100/70 text-lg leading-relaxed max-w-md">
                        Plataforma gratuita e open source para gestão eclesiástica. 
                        Tecnologia a serviço da Igreja de Cristo.
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-b from-white to-[#DEEFE7]/30">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <Link to={ROUTES.PUBLIC.HOME} className="inline-flex items-center gap-2">
                            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
                            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-600">
                                Filadélfias
                            </h1>
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-extrabold text-[#002333] tracking-tight">
                            Bem-vindo de volta
                        </h2>
                        <p className="mt-2 text-gray-500">
                            Entre com sua conta para acessar o painel
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl">
                                    <AlertCircle size={20} className="flex-shrink-0" aria-hidden="true" />
                                    <span className="text-sm">Email ou senha incorretos</span>
                                </div>
                            )}

                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail size={18} className="text-gray-400" aria-hidden="true" />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="seu@email.com"
                                            className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 hover:bg-white"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                            Senha
                                        </label>
                                        <Link to={ROUTES.AUTH.FORGOT_PASSWORD} className="text-sm text-green-600 hover:text-green-700 font-medium">
                                            Esqueceu a senha?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock size={18} className="text-gray-400" aria-hidden="true" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 hover:bg-white"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="group w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-600/25 hover:shadow-xl hover:shadow-green-600/30 transition-all duration-300"
                            >
                                {isPending ? (
                                    <span>Entrando...</span>
                                ) : (
                                    <>
                                        <span>Entrar</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <p className="text-sm text-blue-700 leading-relaxed">
                            <strong>É membro de uma igreja?</strong> Use as credenciais fornecidas pelo administrador da sua igreja para acessar.
                        </p>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-gray-500">
                        É administrador?{' '}
                        <Link to={ROUTES.AUTH.REGISTER} className="text-green-600 hover:text-green-700 font-semibold">
                            Cadastre sua igreja
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
