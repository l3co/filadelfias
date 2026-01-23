import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '../../hooks/useAuth';
import { useViaCEP } from '../../hooks/useViaCEP';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
    Church, MapPin, Phone, Save, Loader2, AlertCircle, CheckCircle2,
    Building2, Trash2, Globe, Instagram, Youtube, MessageCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChurchFormData {
    name: string;
    slug: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    postal_code: string;
    phone: string;
    email: string;
    website: string;
    facebook_url: string;
    instagram_url: string;
    youtube_url: string;
    whatsapp: string;
}

export function ChurchSettingsPage() {
    const { data: user } = useCurrentUser();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { fetchAddress, isLoading: isFetchingCEP } = useViaCEP();
    const [successMessage, setSuccessMessage] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const tenant = user?.memberships?.[0]?.tenant;
    const tenantId = tenant?.id;
    const userRole = user?.memberships?.[0]?.role?.toUpperCase();
    const isAdmin = userRole === 'ADMIN' || userRole === 'MODERATOR';

    const { register, handleSubmit, setValue, control, formState: { errors, isDirty } } = useForm<ChurchFormData>({
        defaultValues: {
            name: '',
            slug: '',
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            postal_code: '',
            phone: '',
            email: '',
            website: '',
            facebook_url: '',
            instagram_url: '',
            youtube_url: '',
            whatsapp: '',
        }
    });

    const formValues = useWatch({ control });

    useEffect(() => {
        if (tenant) {
            setValue('name', tenant.name || '');
            setValue('slug', tenant.slug || '');
            setValue('street', tenant.street || '');
            setValue('number', tenant.number || '');
            setValue('complement', tenant.complement || '');
            setValue('neighborhood', tenant.neighborhood || '');
            setValue('city', tenant.city || '');
            setValue('state', tenant.state || '');
            setValue('postal_code', tenant.postal_code || '');
            setValue('phone', tenant.phone || '');
            setValue('email', tenant.email || '');
            setValue('website', tenant.website || '');
            setValue('facebook_url', tenant.facebook_url || '');
            setValue('instagram_url', tenant.instagram_url || '');
            setValue('youtube_url', tenant.youtube_url || '');
            setValue('whatsapp', tenant.whatsapp || '');
        }
    }, [tenant, setValue]);

    const updateMutation = useMutation({
        mutationFn: async (data: ChurchFormData) => {
            const response = await api.patch(`/tenants/${tenantId}`, {
                name: data.name,
                street: data.street,
                number: data.number,
                complement: data.complement || null,
                neighborhood: data.neighborhood,
                city: data.city,
                state: data.state.toUpperCase(),
                postal_code: data.postal_code.replace(/\D/g, ''),
                phone: data.phone || null,
                email: data.email || null,
                website: data.website || null,
                facebook_url: data.facebook_url || null,
                instagram_url: data.instagram_url || null,
                youtube_url: data.youtube_url || null,
                whatsapp: data.whatsapp || null,
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            setSuccessMessage('Dados da igreja atualizados com sucesso!');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/tenants/${tenantId}`);
        },
        onSuccess: () => {
            queryClient.clear();
            navigate('/');
        }
    });

    const handleCEPBlur = async () => {
        const cep = formValues.postal_code;
        if (cep && cep.replace(/\D/g, '').length === 8) {
            const address = await fetchAddress(cep);
            if (address) {
                setValue('street', address.street, { shouldDirty: true });
                setValue('neighborhood', address.neighborhood, { shouldDirty: true });
                setValue('city', address.city, { shouldDirty: true });
                setValue('state', address.state, { shouldDirty: true });
            }
        }
    };

    const onSubmit = (data: ChurchFormData) => {
        setSuccessMessage('');
        updateMutation.mutate(data);
    };

    if (!isAdmin) {
        return (
            <div className="p-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">Acesso Restrito</h3>
                    <p className="text-yellow-700">
                        Apenas administradores podem editar os dados da igreja.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-gradient-to-br from-green-100 to-teal-100 rounded-xl">
                        <Church className="w-6 h-6 text-green-700" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#002333]">Configurações da Igreja</h1>
                </div>
                <p className="text-gray-500 ml-14">Gerencie os dados e informações da sua igreja</p>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 size={20} />
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Error Message */}
            {updateMutation.isError && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                    <AlertCircle size={20} />
                    <span>Erro ao atualizar dados. Tente novamente.</span>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Dados Básicos */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-[#002333] mb-4 flex items-center gap-2">
                        <Building2 size={20} className="text-green-600" />
                        Dados Básicos
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome da Igreja
                            </label>
                            <Input
                                {...register('name', { required: 'Nome obrigatório' })}
                                placeholder="Ex: Igreja Presbiteriana Central"
                            />
                            {errors.name && (
                                <span className="text-xs text-red-500 mt-1">{errors.name.message}</span>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Identificador (URL)
                            </label>
                            <Input
                                {...register('slug')}
                                disabled
                                className="bg-gray-50 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">O identificador não pode ser alterado</p>
                        </div>
                    </div>
                </div>

                {/* Endereço */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-[#002333] mb-4 flex items-center gap-2">
                        <MapPin size={20} className="text-green-600" />
                        Endereço
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
                            <div className="relative">
                                <Input
                                    {...register('postal_code')}
                                    onBlur={handleCEPBlur}
                                    placeholder="00000-000"
                                    maxLength={9}
                                />
                                {isFetchingCEP && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <Loader2 size={16} className="animate-spin text-gray-400" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                            <Input
                                {...register('state')}
                                placeholder="SP"
                                maxLength={2}
                                className="uppercase"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                            <Input
                                {...register('city')}
                                placeholder="São Paulo"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Logradouro</label>
                            <Input
                                {...register('street')}
                                placeholder="Rua, Avenida..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                            <Input
                                {...register('number')}
                                placeholder="123"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
                            <Input
                                {...register('complement')}
                                placeholder="Sala, Bloco..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
                            <Input
                                {...register('neighborhood')}
                                placeholder="Centro"
                            />
                        </div>
                    </div>
                </div>

                {/* Contato */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-[#002333] mb-4 flex items-center gap-2">
                        <Phone size={20} className="text-green-600" />
                        Contato
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                            <Input
                                {...register('phone')}
                                placeholder="(11) 99999-9999"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <Input
                                {...register('email')}
                                type="email"
                                placeholder="contato@igreja.com"
                            />
                        </div>
                    </div>
                </div>

                {/* Mídias Sociais */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-[#002333] mb-4 flex items-center gap-2">
                        <Globe size={20} className="text-green-600" />
                        Mídias Sociais
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                            <Input
                                {...register('website')}
                                type="url"
                                placeholder="https://www.igreja.com.br"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <span className="flex items-center gap-2">
                                    <MessageCircle size={16} /> WhatsApp
                                </span>
                            </label>
                            <Input
                                {...register('whatsapp')}
                                placeholder="(11) 99999-9999"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <span className="flex items-center gap-2">
                                    <Instagram size={16} /> Instagram
                                </span>
                            </label>
                            <Input
                                {...register('instagram_url')}
                                type="url"
                                placeholder="https://instagram.com/suaigreja"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <span className="flex items-center gap-2">
                                    <Youtube size={16} /> YouTube
                                </span>
                            </label>
                            <Input
                                {...register('youtube_url')}
                                type="url"
                                placeholder="https://youtube.com/@suaigreja"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                            <Input
                                {...register('facebook_url')}
                                type="url"
                                placeholder="https://facebook.com/suaigreja"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={!isDirty || updateMutation.isPending}
                        className="gap-2"
                    >
                        {updateMutation.isPending ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Salvar Alterações
                            </>
                        )}
                    </Button>
                </div>
            </form>

            {/* Danger Zone */}
            <div className="mt-12 bg-red-50 rounded-2xl border border-red-200 p-6">
                <h2 className="text-lg font-semibold text-red-800 mb-2 flex items-center gap-2">
                    <Trash2 size={20} className="text-red-600" />
                    Zona de Perigo
                </h2>
                <p className="text-red-700 text-sm mb-4">
                    Ações irreversíveis. Tenha certeza antes de prosseguir.
                </p>

                {!showDeleteConfirm ? (
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="gap-2"
                    >
                        <Trash2 size={18} />
                        Excluir Igreja
                    </Button>
                ) : (
                    <div className="bg-white rounded-xl p-4 border border-red-300">
                        <p className="text-red-800 font-medium mb-3">
                            Esta ação é irreversível e irá excluir:
                        </p>
                        <ul className="text-red-700 text-sm mb-4 list-disc list-inside space-y-1">
                            <li>Todos os dados da igreja</li>
                            <li>Todos os membros cadastrados</li>
                            <li>Todos os registros financeiros</li>
                            <li>Todas as aulas de EBD</li>
                            <li>Todos os eventos e missões</li>
                        </ul>
                        <p className="text-sm text-gray-700 mb-3">
                            Digite <strong className="text-red-700">{tenant?.slug}</strong> para confirmar:
                        </p>
                        <Input
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder={tenant?.slug}
                            className="mb-4"
                        />
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeleteConfirmText('');
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={deleteConfirmText !== tenant?.slug || deleteMutation.isPending}
                                onClick={() => deleteMutation.mutate()}
                                className="gap-2"
                            >
                                {deleteMutation.isPending ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Excluindo...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={18} />
                                        Confirmar Exclusão
                                    </>
                                )}
                            </Button>
                        </div>
                        {deleteMutation.isError && (
                            <div className="mt-3 text-red-600 text-sm flex items-center gap-2">
                                <AlertCircle size={16} />
                                Erro ao excluir. Tente novamente.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
