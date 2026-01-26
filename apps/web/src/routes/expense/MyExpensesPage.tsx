import { useState } from 'react';
import { Receipt, Plus, Clock, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { useCurrentTenant } from '../../hooks/useAuth';
import { useMyExpenses, useExpenseMutations } from '../../features/expense/hooks/useExpense';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { PageHeaderWithIcon } from '../../components/PageHeader';

const EXPENSE_CATEGORIES = [
    { value: 'MATERIAL', label: 'Material (escritório, didático)' },
    { value: 'CLEANING', label: 'Material de Limpeza' },
    { value: 'TRANSPORT', label: 'Transporte / Combustível' },
    { value: 'FOOD', label: 'Alimentação (eventos)' },
    { value: 'MAINTENANCE', label: 'Manutenção' },
    { value: 'UTILITIES', label: 'Contas (água, luz, internet)' },
    { value: 'OTHER', label: 'Outros' },
];

function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR');
}

function getCategoryLabel(category: string) {
    return EXPENSE_CATEGORIES.find(c => c.value === category)?.label || category;
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'PENDING':
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    <Clock size={12} />
                    Pendente
                </span>
            );
        case 'APPROVED':
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <CheckCircle2 size={12} />
                    Aprovado
                </span>
            );
        case 'REJECTED':
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    <XCircle size={12} />
                    Rejeitado
                </span>
            );
        default:
            return null;
    }
}

export function MyExpensesPage() {
    const tenant = useCurrentTenant();
    const { data: expenses, isLoading } = useMyExpenses(tenant?.id);
    const { submitExpense, deleteExpense } = useExpenseMutations(tenant?.id);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        description: '',
        expense_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitExpense.mutate(
            {
                amount: parseFloat(formData.amount),
                category: formData.category,
                description: formData.description,
                expense_date: formData.expense_date,
                notes: formData.notes || undefined,
            },
            {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setFormData({
                        amount: '',
                        category: '',
                        description: '',
                        expense_date: new Date().toISOString().split('T')[0],
                        notes: '',
                    });
                },
            }
        );
    };

    const handleDelete = (recordId: string) => {
        if (confirm('Tem certeza que deseja excluir esta solicitação?')) {
            deleteExpense.mutate(recordId);
        }
    };

    const pendingExpenses = expenses?.filter(e => e.status === 'PENDING') || [];
    const processedExpenses = expenses?.filter(e => e.status !== 'PENDING') || [];

    return (
        <div className="space-y-6">
            <PageHeaderWithIcon
                icon={Receipt}
                iconColor="orange"
                title="Minhas Despesas"
                description="Solicite reembolso de despesas realizadas em nome da igreja"
                actions={
                    <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                        <Plus size={16} />
                        Nova Solicitação
                    </Button>
                }
            />

            {isLoading ? (
                <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                        Carregando...
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Pending Requests */}
                    {pendingExpenses.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-amber-600">
                                    <Clock size={20} />
                                    Aguardando Aprovação
                                    <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                                        {pendingExpenses.length}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {pendingExpenses.map(expense => (
                                        <div
                                            key={expense.id}
                                            className="flex items-center justify-between p-4 rounded-xl border border-amber-100 bg-amber-50/50"
                                        >
                                            <div>
                                                <p className="font-medium text-[#002333]">{expense.description}</p>
                                                <p className="text-sm text-gray-500">
                                                    {getCategoryLabel(expense.category)} • {formatDate(expense.expense_date)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="font-semibold text-lg text-[#002333]">
                                                    {formatCurrency(expense.amount)}
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(expense.id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Processed Requests */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Solicitações</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {processedExpenses.length === 0 && pendingExpenses.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Receipt className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                    <p>Você ainda não fez nenhuma solicitação de reembolso.</p>
                                    <p className="text-sm mt-1">Clique em "Nova Solicitação" para começar.</p>
                                </div>
                            ) : processedExpenses.length === 0 ? (
                                <p className="text-center py-4 text-gray-500">Nenhuma solicitação processada ainda.</p>
                            ) : (
                                <div className="space-y-3">
                                    {processedExpenses.map(expense => (
                                        <div
                                            key={expense.id}
                                            className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-[#002333]">{expense.description}</p>
                                                    {getStatusBadge(expense.status)}
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {getCategoryLabel(expense.category)} • {formatDate(expense.expense_date)}
                                                </p>
                                                {expense.rejection_reason && (
                                                    <p className="text-sm text-red-500 mt-1">
                                                        Motivo: {expense.rejection_reason}
                                                    </p>
                                                )}
                                            </div>
                                            <p className="font-semibold text-lg text-[#002333]">
                                                {formatCurrency(expense.amount)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {/* New Expense Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Nova Solicitação de Reembolso</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Valor (R$)</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="0,00"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="expense_date">Data da Despesa</Label>
                                    <Input
                                        id="expense_date"
                                        type="date"
                                        value={formData.expense_date}
                                        onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Categoria</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EXPENSE_CATEGORIES.map(cat => (
                                            <SelectItem key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descrição</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Ex: Compra de material para EBD"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Observações (opcional)</Label>
                                <Input
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Informações adicionais"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={submitExpense.isPending || !formData.category}>
                                {submitExpense.isPending ? 'Enviando...' : 'Enviar Solicitação'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
