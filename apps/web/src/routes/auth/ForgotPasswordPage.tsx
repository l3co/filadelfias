import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { api } from '../../lib/api';
import { ROUTES } from '../../lib/routes';

interface ForgotPasswordData {
    email: string;
}

export function ForgotPasswordPage() {
    const [submitted, setSubmitted] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordData>();

    const forgotPasswordMutation = useMutation({
        mutationFn: async (data: ForgotPasswordData) => {
            await api.post('/auth/forgot-password', data);
        },
        onSuccess: () => {
            setSubmitted(true);
        }
    });

    const onSubmit = (data: ForgotPasswordData) => {
        forgotPasswordMutation.mutate(data);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                            <CheckCircle2 size={32} className="text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-[#002333] mb-2">Email Enviado!</h1>
                        <p className="text-gray-600 mb-6">
                            Se o email existir em nossa base, você receberá instruções para redefinir sua senha.
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            Verifique também sua pasta de spam.
                        </p>
                        <Link to={ROUTES.AUTH.LOGIN}>
                            <Button variant="outline" className="gap-2">
                                <ArrowLeft size={16} />
                                Voltar para Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg">
                            <Mail size={32} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-[#002333]">Esqueceu sua senha?</h1>
                        <p className="text-gray-500 mt-2">
                            Digite seu email e enviaremos instruções para redefinir sua senha.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <Input
                                    type="email"
                                    {...register('email', { 
                                        required: 'Email é obrigatório',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Email inválido'
                                        }
                                    })}
                                    className="pl-10"
                                    placeholder="seu@email.com"
                                />
                            </div>
                            {errors.email && (
                                <span className="text-xs text-red-500">{errors.email.message}</span>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={forgotPasswordMutation.isPending}
                        >
                            Enviar Instruções
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link 
                            to={ROUTES.AUTH.LOGIN} 
                            className="text-sm text-gray-500 hover:text-green-600 inline-flex items-center gap-1"
                        >
                            <ArrowLeft size={14} />
                            Voltar para Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
