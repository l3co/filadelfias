import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { api } from '../lib/api';
import { useViaCEP } from '../hooks/useViaCEP';
import {
    Church, Building2, MapPin, User, CheckCircle2, ArrowRight, ArrowLeft,
    AlertCircle, Loader2, Mail, Lock, Phone, Link2, Check, X
} from 'lucide-react';

interface PasswordRequirement {
    label: string;
    test: (password: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
    { label: 'Mínimo 8 caracteres', test: (p) => p.length >= 8 },
    { label: 'Uma letra maiúscula', test: (p) => /[A-Z]/.test(p) },
    { label: 'Uma letra minúscula', test: (p) => /[a-z]/.test(p) },
    { label: 'Um número', test: (p) => /\d/.test(p) },
    { label: 'Um caractere especial (!@#$%...)', test: (p) => /[!@#$%^&*()_+\-=[\]{};':",.<>/?]/.test(p) },
];

function validatePassword(password: string): string | true {
    for (const req of PASSWORD_REQUIREMENTS) {
        if (!req.test(password)) {
            return req.label;
        }
    }
    return true;
}

function PasswordStrengthIndicator({ password }: { password: string }) {
    const results = PASSWORD_REQUIREMENTS.map(req => ({
        ...req,
        passed: req.test(password || ''),
    }));
    
    const passedCount = results.filter(r => r.passed).length;
    const strengthPercent = (passedCount / PASSWORD_REQUIREMENTS.length) * 100;
    
    const strengthColor = strengthPercent < 40 ? 'bg-red-500' : 
                          strengthPercent < 80 ? 'bg-yellow-500' : 'bg-green-500';

    if (!password) return null;

    return (
        <div className="mt-2 space-y-2">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-300 ${strengthColor}`}
                    style={{ width: `${strengthPercent}%` }}
                />
            </div>
            <div className="grid grid-cols-2 gap-1">
                {results.map((req, i) => (
                    <div key={i} className={`flex items-center gap-1.5 text-xs ${req.passed ? 'text-green-600' : 'text-gray-400'}`}>
                        {req.passed ? <Check size={12} /> : <X size={12} />}
                        <span>{req.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

type Step = 1 | 2 | 3 | 4;

interface FormData {
    // Step 1 - Igreja
    church_name: string;
    church_slug: string;
    // Step 2 - Endereço
    postal_code: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    // Step 3 - Admin
    admin_name: string;
    admin_email: string;
    admin_password: string;
    admin_password_confirm: string;
    admin_phone: string;
}

const steps = [
    { number: 1, title: 'Dados da Igreja', icon: Church },
    { number: 2, title: 'Endereço', icon: MapPin },
    { number: 3, title: 'Administrador', icon: User },
    { number: 4, title: 'Confirmação', icon: CheckCircle2 },
];

export function ChurchRegistrationWizard() {
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { fetchAddress, isLoading: isFetchingCEP } = useViaCEP();

    const { register, handleSubmit, setValue, control, formState: { errors }, trigger } = useForm<FormData>({
        defaultValues: {
            church_name: '',
            church_slug: '',
            postal_code: '',
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            admin_name: '',
            admin_email: '',
            admin_password: '',
            admin_password_confirm: '',
            admin_phone: '',
        }
    });

    const formValues = useWatch({ control });

    const registerMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await api.post('/churches/register', {
                church_name: data.church_name,
                church_slug: data.church_slug,
                street: data.street,
                number: data.number,
                complement: data.complement || null,
                neighborhood: data.neighborhood,
                city: data.city,
                state: data.state,
                postal_code: data.postal_code.replace(/\D/g, ''),
                admin_name: data.admin_name,
                admin_email: data.admin_email,
                admin_password: data.admin_password,
                admin_phone: data.admin_phone || null,
            });
            return response.data;
        },
        onSuccess: (data) => {
            localStorage.setItem('access_token', data.access_token);
            navigate('/app');
        },
        onError: (error: AxiosError<{ detail?: string | Array<{ msg: string }> }>) => {
            const detail = error.response?.data?.detail;
            if (Array.isArray(detail)) {
                // Pydantic validation errors
                setError(detail.map(e => e.msg).join('. '));
            } else if (typeof detail === 'string') {
                setError(detail);
            } else {
                setError('Erro ao cadastrar igreja. Tente novamente.');
            }
        }
    });

    const handleCEPBlur = async () => {
        const cep = formValues.postal_code;
        if (cep && cep.replace(/\D/g, '').length === 8) {
            const address = await fetchAddress(cep);
            if (address) {
                setValue('street', address.street);
                setValue('neighborhood', address.neighborhood);
                setValue('city', address.city);
                setValue('state', address.state);
            }
        }
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 50);
    };

    const handleChurchNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setValue('church_name', name);
        if (!formValues.church_slug || formValues.church_slug === generateSlug(formValues.church_name || '')) {
            setValue('church_slug', generateSlug(name));
        }
    };

    const nextStep = async () => {
        let fieldsToValidate: (keyof FormData)[] = [];

        if (currentStep === 1) {
            fieldsToValidate = ['church_name', 'church_slug'];
        } else if (currentStep === 2) {
            fieldsToValidate = ['postal_code', 'street', 'number', 'neighborhood', 'city', 'state'];
        } else if (currentStep === 3) {
            fieldsToValidate = ['admin_name', 'admin_email', 'admin_password', 'admin_password_confirm'];
        }

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, 4) as Step);
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1) as Step);
    };

    const onSubmit = (data: FormData) => {
        if (data.admin_password !== data.admin_password_confirm) {
            setError('As senhas não coincidem.');
            return;
        }
        setError('');
        registerMutation.mutate(data);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Progress */}
            <div className="hidden lg:flex lg:w-[400px] bg-gradient-to-br from-[#002333] via-green-900 to-[#002333] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col justify-center px-12 text-white w-full">
                    <Link to="/" className="mb-12">
                        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-300">
                            Filadélfias
                        </h1>
                    </Link>

                    <h2 className="text-2xl font-bold mb-2">Cadastre sua Igreja</h2>
                    <p className="text-green-100/70 mb-10">
                        Preencha os dados para começar a usar a plataforma.
                    </p>

                    {/* Progress Steps */}
                    <div className="space-y-4">
                        {steps.map((step, i) => {
                            const Icon = step.icon;
                            const isCompleted = currentStep > step.number;
                            const isCurrent = currentStep === step.number;

                            return (
                                <div key={i} className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isCompleted
                                        ? 'bg-green-500 text-white'
                                        : isCurrent
                                            ? 'bg-white text-green-700'
                                            : 'bg-white/10 text-white/40'
                                        }`}>
                                        {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                                    </div>
                                    <span className={`text-sm font-medium ${isCompleted || isCurrent ? 'text-white' : 'text-white/40'
                                        }`}>
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-white to-[#DEEFE7]/30">
                <div className="w-full max-w-lg animate-in fade-in slide-in-from-right-4 duration-500">
                    {/* Mobile Header */}
                    <div className="lg:hidden text-center mb-8">
                        <Link to="/">
                            <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-600">
                                Filadélfias
                            </h1>
                        </Link>
                        <p className="text-gray-500 mt-2">Passo {currentStep} de 4</p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 sm:p-8 border border-gray-100">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {error && (
                                <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl mb-6">
                                    <AlertCircle size={20} className="flex-shrink-0" />
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}

                            {/* Step 1: Igreja */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-[#002333] mb-1">Dados da Igreja</h3>
                                        <p className="text-gray-500 text-sm">Informações básicas da sua igreja</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nome da Igreja *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Building2 size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                {...register('church_name', { required: 'Nome obrigatório' })}
                                                onChange={handleChurchNameChange}
                                                placeholder="Ex: Igreja Presbiteriana Central"
                                                className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 hover:bg-white"
                                            />
                                        </div>
                                        {errors.church_name && (
                                            <span className="text-xs text-red-500 mt-1 block">{errors.church_name.message}</span>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Identificador (URL) *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Link2 size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                {...register('church_slug', {
                                                    required: 'Identificador obrigatório',
                                                    pattern: { value: /^[a-z0-9-]+$/, message: 'Use apenas letras minúsculas, números e hifens' }
                                                })}
                                                placeholder="ipb-central"
                                                className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 hover:bg-white"
                                            />
                                        </div>
                                        {errors.church_slug && (
                                            <span className="text-xs text-red-500 mt-1 block">{errors.church_slug.message}</span>
                                        )}
                                        <p className="mt-2 text-xs text-gray-500">
                                            Sua igreja será acessível em: <span className="font-medium text-gray-700">filadelfias.com/{formValues.church_slug || 'sua-igreja'}</span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Endereço */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-[#002333] mb-1">Endereço</h3>
                                        <p className="text-gray-500 text-sm">Localização da sua igreja</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">CEP *</label>
                                            <div className="relative">
                                                <input
                                                    {...register('postal_code', { required: 'CEP obrigatório' })}
                                                    onBlur={handleCEPBlur}
                                                    placeholder="00000-000"
                                                    maxLength={9}
                                                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 hover:bg-white"
                                                />
                                                {isFetchingCEP && (
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                        <Loader2 size={16} className="animate-spin text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            {errors.postal_code && (
                                                <span className="text-xs text-red-500 mt-1 block">{errors.postal_code.message}</span>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Estado *</label>
                                            <input
                                                {...register('state', { required: 'Estado obrigatório' })}
                                                placeholder="SP"
                                                maxLength={2}
                                                className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 hover:bg-white uppercase"
                                            />
                                            {errors.state && (
                                                <span className="text-xs text-red-500 mt-1 block">{errors.state.message}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Logradouro *</label>
                                        <input
                                            {...register('street', { required: 'Logradouro obrigatório' })}
                                            placeholder="Rua, Avenida..."
                                            className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 hover:bg-white"
                                        />
                                        {errors.street && (
                                            <span className="text-xs text-red-500 mt-1 block">{errors.street.message}</span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Número *</label>
                                            <input
                                                {...register('number', { required: 'Número obrigatório' })}
                                                placeholder="123"
                                                className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 hover:bg-white"
                                            />
                                            {errors.number && (
                                                <span className="text-xs text-red-500 mt-1 block">{errors.number.message}</span>
                                            )}
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
                                            <input
                                                {...register('complement')}
                                                placeholder="Sala, Bloco..."
                                                className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 hover:bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Bairro *</label>
                                            <input
                                                {...register('neighborhood', { required: 'Bairro obrigatório' })}
                                                placeholder="Centro"
                                                className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 hover:bg-white"
                                            />
                                            {errors.neighborhood && (
                                                <span className="text-xs text-red-500 mt-1 block">{errors.neighborhood.message}</span>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Cidade *</label>
                                            <input
                                                {...register('city', { required: 'Cidade obrigatória' })}
                                                placeholder="São Paulo"
                                                className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 hover:bg-white"
                                            />
                                            {errors.city && (
                                                <span className="text-xs text-red-500 mt-1 block">{errors.city.message}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Admin */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-[#002333] mb-1">Administrador</h3>
                                        <p className="text-gray-500 text-sm">Dados do responsável pela igreja</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo *</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                {...register('admin_name', { required: 'Nome obrigatório' })}
                                                placeholder="Seu nome completo"
                                                className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 hover:bg-white"
                                            />
                                        </div>
                                        {errors.admin_name && (
                                            <span className="text-xs text-red-500 mt-1 block">{errors.admin_name.message}</span>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                {...register('admin_email', {
                                                    required: 'Email obrigatório',
                                                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' }
                                                })}
                                                type="email"
                                                placeholder="seu@email.com"
                                                className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 hover:bg-white"
                                            />
                                        </div>
                                        {errors.admin_email && (
                                            <span className="text-xs text-red-500 mt-1 block">{errors.admin_email.message}</span>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Phone size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                {...register('admin_phone')}
                                                placeholder="(11) 99999-9999"
                                                className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 hover:bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Senha *</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                {...register('admin_password', {
                                                    required: 'Senha obrigatória',
                                                    validate: (value) => {
                                                        const result = validatePassword(value);
                                                        return result === true ? true : `Falta: ${result}`;
                                                    }
                                                })}
                                                type="password"
                                                placeholder="••••••••"
                                                className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 hover:bg-white"
                                            />
                                        </div>
                                        <PasswordStrengthIndicator password={formValues.admin_password || ''} />
                                        {errors.admin_password && (
                                            <span className="text-xs text-red-500 mt-1 block">{errors.admin_password.message}</span>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha *</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                {...register('admin_password_confirm', {
                                                    required: 'Confirme a senha',
                                                    validate: (value) => value === formValues.admin_password || 'As senhas não coincidem'
                                                })}
                                                type="password"
                                                placeholder="••••••••"
                                                className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50/50 hover:bg-white"
                                            />
                                        </div>
                                        {errors.admin_password_confirm && (
                                            <span className="text-xs text-red-500 mt-1 block">{errors.admin_password_confirm.message}</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Confirmação */}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-[#002333] mb-1">Confirmação</h3>
                                        <p className="text-gray-500 text-sm">Revise os dados antes de finalizar</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <Church size={16} className="text-green-600" />
                                                Igreja
                                            </h4>
                                            <p className="text-gray-900 font-medium">{formValues.church_name}</p>
                                            <p className="text-sm text-gray-500">filadelfias.com/{formValues.church_slug}</p>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <MapPin size={16} className="text-green-600" />
                                                Endereço
                                            </h4>
                                            <p className="text-gray-900">
                                                {formValues.street}, {formValues.number}
                                                {formValues.complement && ` - ${formValues.complement}`}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {formValues.neighborhood}, {formValues.city} - {formValues.state}
                                            </p>
                                            <p className="text-sm text-gray-500">CEP: {formValues.postal_code}</p>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <User size={16} className="text-green-600" />
                                                Administrador
                                            </h4>
                                            <p className="text-gray-900 font-medium">{formValues.admin_name}</p>
                                            <p className="text-sm text-gray-500">{formValues.admin_email}</p>
                                            {formValues.admin_phone && (
                                                <p className="text-sm text-gray-500">{formValues.admin_phone}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                                        <p className="text-sm text-green-700">
                                            Ao clicar em "Cadastrar Igreja", você concorda com os termos de uso da plataforma Filadélfias.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                                {currentStep > 1 ? (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        <ArrowLeft size={18} />
                                        Voltar
                                    </button>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        <ArrowLeft size={18} />
                                        Voltar ao login
                                    </Link>
                                )}

                                {currentStep < 4 ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-xl transition-all shadow-lg shadow-green-600/25"
                                    >
                                        Próximo
                                        <ArrowRight size={18} />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={registerMutation.isPending}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-xl transition-all shadow-lg shadow-green-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {registerMutation.isPending ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Cadastrando...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={18} />
                                                Cadastrar Igreja
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Já tem uma conta? <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">Faça login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
