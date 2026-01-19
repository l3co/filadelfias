import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegister } from '../hooks/useAuth';
import { AxiosError } from 'axios';
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

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

    const benefits = [
        'Gestão completa de membros',
        'Controle financeiro transparente',
        'Escola Bíblica Dominical',
        'Governança e atas',
    ];

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#002333] via-green-900 to-[#002333] relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
                
                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <Link to="/" className="mb-12">
                        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-300">
                            Filadélfias
                        </h1>
                    </Link>
                    
                    <h2 className="text-3xl font-bold mb-6">
                        Comece a transformar a gestão da sua igreja
                    </h2>
                    
                    <ul className="space-y-4">
                        {benefits.map((benefit, i) => (
                            <li key={i} className="flex items-center gap-3 text-green-100/90">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle2 size={14} className="text-green-400" />
                                </div>
                                <span>{benefit}</span>
                            </li>
                        ))}
                    </ul>
                    
                    <p className="mt-10 text-green-100/60 text-sm">
                        100% gratuito e open source. Para a Glória de Deus.
                    </p>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-b from-white to-[#DEEFE7]/30 overflow-y-auto">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 py-8">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <Link to="/">
                            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-600">
                                Filadélfias
                            </h1>
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-extrabold text-[#002333] tracking-tight">
                            Crie sua conta
                        </h2>
                        <p className="mt-2 text-gray-500">
                            Cadastre-se gratuitamente para começar
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {errorMessage && (
                                <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl">
                                    <AlertCircle size={20} className="flex-shrink-0" />
                                    <span className="text-sm">{errorMessage}</span>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nome completo
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User size={18} className="text-gray-400" />
                                        </div>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required
                                            placeholder="Seu nome"
                                            className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 hover:bg-white"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail size={18} className="text-gray-400" />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="seu@email.com"
                                            className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 hover:bg-white"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        Senha
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock size={18} className="text-gray-400" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            placeholder="Mínimo 8 caracteres"
                                            className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 hover:bg-white"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirmar senha
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock size={18} className="text-gray-400" />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            required
                                            placeholder="Repita sua senha"
                                            className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 hover:bg-white"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                                    <span>Criando conta...</span>
                                ) : (
                                    <>
                                        <span>Criar conta</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-center text-gray-400">
                                Ao criar sua conta, você concorda com nossos termos de uso e política de privacidade.
                            </p>
                        </form>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-gray-500">
                        Já tem uma conta?{' '}
                        <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
                            Faça login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
