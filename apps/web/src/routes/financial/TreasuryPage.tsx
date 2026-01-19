import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialService } from '../../services/financial';
import type { CreateTransactionDTO } from '../../services/financial';
import { useCurrentTenant } from '../../hooks/useAuth';
import { DollarSign, TrendingUp, TrendingDown, Building } from 'lucide-react';

export function TreasuryPage() {
    const tenant = useCurrentTenant();
    const tenantId = tenant?.id;
    const queryClient = useQueryClient();
    const [isTxModalOpen, setIsTxModalOpen] = useState(false);

    // Form State
    const [txType, setTxType] = useState('CREDIT');
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [accountId, setAccountId] = useState('');
    const [categoryId, setCategoryId] = useState('');

    const { data: accounts, isLoading: isLoadingAccounts } = useQuery({
        queryKey: ['financial-accounts', tenantId],
        queryFn: () => financialService.listAccounts(tenantId!),
        enabled: !!tenantId
    });

    const { data: categories } = useQuery({
        queryKey: ['financial-categories', tenantId],
        queryFn: () => financialService.listCategories(tenantId!),
        enabled: !!tenantId
    });

    const { data: transactions, isLoading: isLoadingTx } = useQuery({
        queryKey: ['financial-transactions', tenantId],
        queryFn: () => financialService.listTransactions(tenantId!),
        enabled: !!tenantId
    });

    const createTxMutation = useMutation({
        mutationFn: (data: CreateTransactionDTO) => financialService.createTransaction(tenantId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['financial-accounts'] }); // Update balances
            setIsTxModalOpen(false);
            setAmount('');
            setDesc('');
        }
    });

    const handleCreateTx = (e: React.FormEvent) => {
        e.preventDefault();
        createTxMutation.mutate({
            account_id: accountId,
            category_id: categoryId,
            amount: parseFloat(amount),
            type: txType,
            description: desc,
            date: new Date().toISOString().split('T')[0]
        });
    };

    if (!tenantId) return <div>Selecione uma organização.</div>;
    if (isLoadingAccounts || isLoadingTx) return <div>Carregando...</div>;

    const totalBalance = accounts?.reduce((acc, curr) => acc + curr.balance, 0) || 0;

    // Filter categories by type
    const filteredCategories = categories?.filter(c =>
        (txType === 'CREDIT' && c.type === 'INCOME') ||
        (txType === 'DEBIT' && c.type === 'EXPENSE')
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tesouraria</h1>
                    <p className="text-gray-500">Gestão de caixa, ofertas e despesas.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setTxType('CREDIT');
                            setIsTxModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                    >
                        <TrendingUp size={20} /> Receita
                    </button>
                    <button
                        onClick={() => {
                            setTxType('DEBIT');
                            setIsTxModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                    >
                        <TrendingDown size={20} /> Despesa
                    </button>
                </div>
            </div>

            {/* Cards Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-500 font-medium">Saldo Total</span>
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBalance)}
                    </div>
                </div>

                {/* Account Balances */}
                {accounts?.map(acc => (
                    <div key={acc.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-500 font-medium truncate">{acc.name}</span>
                            <div className="p-2 bg-gray-50 text-gray-600 rounded-lg">
                                <Building size={20} />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.balance)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 uppercase">{acc.type}</div>
                    </div>
                ))}
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Últimas Movimentações</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {transactions?.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Nenhuma movimentação registrada.</div>
                    ) : (
                        transactions?.map(tx => (
                            <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${tx.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {tx.type === 'CREDIT' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{tx.description}</p>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span>{new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                                            <span>•</span>
                                            <span>{tx.category?.name || 'Sem categoria'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`font-bold ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.type === 'DEBIT' ? '-' : '+'}
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal de Transação */}
            {isTxModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">
                            Nova {txType === 'CREDIT' ? 'Receita' : 'Despesa'}
                        </h2>
                        <form onSubmit={handleCreateTx} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <input
                                    type="text"
                                    required
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2.5"
                                    value={desc}
                                    onChange={e => setDesc(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2.5"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Conta</label>
                                <select
                                    required
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2.5 bg-white"
                                    value={accountId}
                                    onChange={e => setAccountId(e.target.value)}
                                >
                                    <option value="">Selecione...</option>
                                    {accounts?.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                                <select
                                    required
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2.5 bg-white"
                                    value={categoryId}
                                    onChange={e => setCategoryId(e.target.value)}
                                >
                                    <option value="">Selecione...</option>
                                    {filteredCategories?.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsTxModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={createTxMutation.isPending}
                                    className={`px-4 py-2 text-white rounded-lg font-medium shadow-sm transition-colors ${txType === 'CREDIT' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                >
                                    {createTxMutation.isPending ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
