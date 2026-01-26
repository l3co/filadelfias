import { useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { CreatableCombobox, type ComboboxOption } from "../../../components/ui/creatable-combobox";
import type { CreateTransactionDTO, FinancialAccount, TransactionCategory } from "../../../services/financial";
import type { Member } from "../../../types/members.types";

interface TransactionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateTransactionDTO, resetForm: () => void) => void;
    onCreateAccount?: (name: string) => Promise<ComboboxOption>;
    onCreateCategory?: (name: string, type: string) => Promise<ComboboxOption>;
    isLoading?: boolean;
    initialType?: 'CREDIT' | 'DEBIT';
    accounts?: FinancialAccount[];
    categories?: TransactionCategory[];
    members?: Member[];
}

export function TransactionForm({
    isOpen,
    onClose,
    onSubmit,
    onCreateAccount,
    onCreateCategory,
    isLoading,
    initialType = 'CREDIT',
    accounts,
    categories,
    members
}: TransactionFormProps) {
    const { register, handleSubmit, reset, setValue } = useForm<CreateTransactionDTO>();
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [selectedMemberId, setSelectedMemberId] = useState<string>('');

    if (!isOpen) return null;

    const accountOptions: ComboboxOption[] = accounts?.map(acc => ({
        value: acc.id,
        label: acc.name
    })) || [];

    const categoryType = initialType === 'CREDIT' ? 'INCOME' : 'EXPENSE';
    const categoryOptions: ComboboxOption[] = categories
        ?.filter(c => c.type === categoryType)
        .map(cat => ({
            value: cat.id,
            label: cat.name
        })) || [];

    const memberOptions: ComboboxOption[] = members?.map(m => ({
        value: m.id,
        label: m.full_name
    })) || [];

    const onFormSubmit = (data: CreateTransactionDTO) => {
        onSubmit({
            ...data,
            account_id: selectedAccountId,
            category_id: selectedCategoryId,
            member_id: selectedMemberId || undefined,
            amount: Number(data.amount),
            type: initialType,
            date: new Date().toISOString().split('T')[0]
        }, resetForm);
    };

    const resetForm = () => {
        reset();
        setSelectedAccountId('');
        setSelectedCategoryId('');
        setSelectedMemberId('');
    };

    const handleMemberChange = (value: string) => {
        setSelectedMemberId(value);
    };

    const handleAccountChange = (value: string) => {
        setSelectedAccountId(value);
        setValue('account_id', value);
    };

    const handleCreateAccount = async (name: string): Promise<ComboboxOption> => {
        if (onCreateAccount) {
            const newOption = await onCreateAccount(name);
            setSelectedAccountId(newOption.value);
            setValue('account_id', newOption.value);
            return newOption;
        }
        return { value: '', label: '' };
    };

    const handleCategoryChange = (value: string) => {
        setSelectedCategoryId(value);
        setValue('category_id', value);
    };

    const handleCreateCategory = async (name: string): Promise<ComboboxOption> => {
        if (onCreateCategory) {
            const newOption = await onCreateCategory(name, categoryType);
            setSelectedCategoryId(newOption.value);
            setValue('category_id', newOption.value);
            return newOption;
        }
        return { value: '', label: '' };
    };

    const isCredit = initialType === 'CREDIT';

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4">
                    <CardTitle className={isCredit ? "text-green-600" : "text-red-600"}>
                        Nova {isCredit ? 'Receita' : 'Despesa'}
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium text-gray-700">Descrição</label>
                            <Input
                                id="description"
                                {...register('description', { required: true })}
                                placeholder={isCredit ? "Ex: Oferta de Domingo" : "Ex: Conta de Luz"}
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="amount" className="text-sm font-medium text-gray-700">Valor (R$)</label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    {...register('amount', { required: true })}
                                    placeholder="0,00"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="account_id" className="text-sm font-medium text-gray-700">Conta</label>
                                <CreatableCombobox
                                    options={accountOptions}
                                    value={selectedAccountId}
                                    onChange={handleAccountChange}
                                    onCreateNew={onCreateAccount ? handleCreateAccount : undefined}
                                    placeholder="Selecione ou crie..."
                                    searchPlaceholder="Buscar conta..."
                                    emptyMessage="Nenhuma conta encontrada."
                                    createMessage="Criar conta"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="category_id" className="text-sm font-medium text-gray-700">Categoria</label>
                            <CreatableCombobox
                                options={categoryOptions}
                                value={selectedCategoryId}
                                onChange={handleCategoryChange}
                                onCreateNew={onCreateCategory ? handleCreateCategory : undefined}
                                placeholder="Selecione ou crie..."
                                searchPlaceholder="Buscar categoria..."
                                emptyMessage="Nenhuma categoria encontrada."
                                createMessage="Criar categoria"
                            />
                        </div>

                        {/* Campo opcional de membro - apenas para receitas */}
                        {isCredit && members && members.length > 0 && (
                            <div className="space-y-2">
                                <label htmlFor="member_id" className="text-sm font-medium text-gray-700">
                                    Membro <span className="text-gray-400 font-normal">(opcional)</span>
                                </label>
                                <CreatableCombobox
                                    options={memberOptions}
                                    value={selectedMemberId}
                                    onChange={handleMemberChange}
                                    placeholder="Vincular a um membro..."
                                    searchPlaceholder="Buscar membro..."
                                    emptyMessage="Nenhum membro encontrado."
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className={isCredit ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
                            >
                                Salvar Lançamento
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
