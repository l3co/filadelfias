import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import type { CreateTransactionDTO, FinancialAccount, TransactionCategory } from "../../../services/financial";

interface TransactionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateTransactionDTO) => void;
    isLoading?: boolean;
    initialType?: 'CREDIT' | 'DEBIT';
    accounts?: FinancialAccount[];
    categories?: TransactionCategory[];
}

export function TransactionForm({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    initialType = 'CREDIT',
    accounts,
    categories
}: TransactionFormProps) {
    const { register, handleSubmit, reset } = useForm<CreateTransactionDTO>();

    if (!isOpen) return null;

    const onFormSubmit = (data: CreateTransactionDTO) => {
        onSubmit({
            ...data,
            amount: Number(data.amount), // Ensure number
            type: initialType,
            date: new Date().toISOString().split('T')[0]
        });
        reset();
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
                                placeholder="Ex: Oferta de Domingo"
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
                                <select
                                    id="account_id"
                                    {...register('account_id', { required: true })}
                                    className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                    <option value="">Selecione...</option>
                                    {accounts?.map((acc) => (
                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="category_id" className="text-sm font-medium text-gray-700">Categoria</label>
                            <select
                                id="category_id"
                                {...register('category_id', { required: true })}
                                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <option value="">Selecione...</option>
                                {categories?.filter((c) =>
                                    (isCredit && c.type === 'INCOME') ||
                                    (!isCredit && c.type === 'EXPENSE')
                                ).map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

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
