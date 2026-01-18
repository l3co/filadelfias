import { useForm } from 'react-hook-form';
import { Modal } from '../../components/ui/Modal';
import { useCreateMember } from '../../hooks/useMembers';
import { MemberCreateData } from '../../types';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    tenantId: string;
}

export function CreateMemberModal({ isOpen, onClose, tenantId }: Props) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<MemberCreateData>();
    const createMember = useCreateMember(tenantId);

    const onSubmit = (data: MemberCreateData) => {
        createMember.mutate(data, {
            onSuccess: () => {
                reset();
                onClose();
            }
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Novo Membro">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                    <input
                        {...register('full_name', { required: 'Nome é obrigatório' })}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Ex: João da Silva"
                    />
                    {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email (Opcional)</label>
                    <input
                        type="email"
                        {...register('email')}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="email@exemplo.com"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            {...register('status')}
                            className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            defaultValue="COMUNGANTE"
                        >
                            <option value="COMUNGANTE">Comungante</option>
                            <option value="NAO_COMUNGANTE">Não Comungante</option>
                            <option value="DISCIPLINA">Em Disciplina</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                        <select
                            {...register('role')}
                            className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            defaultValue="MEMBRO"
                        >
                            <option value="MEMBRO">Membro</option>
                            <option value="DIACONO">Diácono</option>
                            <option value="PRESBITERO">Presbítero</option>
                            <option value="PASTOR">Pastor</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                        <select
                            {...register('gender')}
                            className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Selecione...</option>
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
                        <select
                            {...register('marital_status')}
                            className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Selecione...</option>
                            <option value="SOLTEIRO">Solteiro(a)</option>
                            <option value="CASADO">Casado(a)</option>
                            <option value="VIUVO">Viúvo(a)</option>
                            <option value="DIVORCIADO">Divorciado(a)</option>
                        </select>
                    </div>
                </div>

                <div className="mt-5 sm:mt-6 flex gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={createMember.isPending}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:text-sm disabled:opacity-50 transition-colors"
                    >
                        {createMember.isPending ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
