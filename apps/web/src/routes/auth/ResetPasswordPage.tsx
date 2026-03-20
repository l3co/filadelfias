import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Lock, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { api } from '../../lib/api';
import { ROUTES } from '../../lib/routes';

interface ResetPasswordData {
    new_password: string;
    confirm_password: string;
}

export function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState(false);

    const { register, handleSubmit, control, formState: { errors } } = useForm<ResetPasswordData>();
    const password = useWatch({ control, name: 'new_password' });

    const resetPasswordMutation = useMutation({
        mutationFn: async (data: ResetPasswordData) => {
            await api.post('/auth/reset-password', {
                token,
                new_password: data.new_password
            });
        },
        onSuccess: () => {
            setSuccess(true);
            setTimeout(() => navigate(ROUTES.AUTH.LOGIN), 3000);
        }
    });

    const onSubmit = (data: ResetPasswordData) => {
        resetPasswordMutation.mutate(data);
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h1 className="text-2xl font-bold text-[#002333] mb-2">Link Inválido</h1>
                        <p className="text-gray-600 mb-6">
                            Este link de redefinição de senha é inválido ou expirou.
                        </p>
                        <Link to={ROUTES.AUTH.FORGOT_PASSWORD}>
                            <Button>Solicitar Novo Link</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                            <CheckCircle2 size={32} className="text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-[#002333] mb-2">Senha Alterada!</h1>
                        <p className="text-gray-600 mb-6">
                            Sua senha foi redefinida com sucesso. Você será redirecionado para o login...
                        </p>
                        <Link to={ROUTES.AUTH.LOGIN}>
                            <Button className="gap-2">
                                Ir para Login
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
                            <Lock size={32} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-[#002333]">Nova Senha</h1>
                        <p className="text-gray-500 mt-2">
                            Digite sua nova senha abaixo.
                        </p>
                    </div>

                    {resetPasswordMutation.isError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            Token inválido ou expirado. Solicite um novo link.
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nova Senha</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('new_password', {
                                        required: 'Senha é obrigatória',
                                        minLength: {
                                            value: 6,
                                            message: 'Senha deve ter no mínimo 6 caracteres'
                                        }
                                    })}
                                    className="pl-10 pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.new_password && (
                                <span className="text-xs text-red-500">{errors.new_password.message}</span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Confirmar Senha</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('confirm_password', {
                                        required: 'Confirmação é obrigatória',
                                        validate: value => value === password || 'As senhas não coincidem'
                                    })}
                                    className="pl-10"
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.confirm_password && (
                                <span className="text-xs text-red-500">{errors.confirm_password.message}</span>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={resetPasswordMutation.isPending}
                        >
                            Redefinir Senha
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
