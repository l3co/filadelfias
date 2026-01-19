import { useState } from 'react';
import { useCurrentTenant } from '../../hooks/useAuth';
import { useFinancialData } from '../../features/financial/hooks/useFinancial';
import { BalanceSummary } from '../../features/financial/components/BalanceSummary';
import { TransactionList } from '../../features/financial/components/TransactionList';
import { TransactionForm } from '../../features/financial/components/TransactionForm';
import { Button } from '../../components/ui/button';
import { PlusCircle, MinusCircle } from 'lucide-react';

export function TreasuryPage() {
    const tenant = useCurrentTenant();
    const {
        accounts,
        categories,
        transactions,
        totalBalance,
        createTransaction,
        isLoading
    } = useFinancialData(tenant?.id);

    const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'CREDIT' | 'DEBIT' }>({
        isOpen: false,
        type: 'CREDIT'
    });

    const openModal = (type: 'CREDIT' | 'DEBIT') => setModalState({ isOpen: true, type });
    const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

    if (!tenant?.id) {
        return (
            <div className="flex h-[50vh] items-center justify-center p-8">
                <div className="text-center text-gray-500">
                    <p className="text-lg font-medium">Selecione uma organização</p>
                    <p className="text-sm">Você precisa estar vinculado a uma igreja para acessar o financeiro.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tesouraria</h1>
                    <p className="text-gray-500 mt-1">Gestão financeira inteligente e transparente.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => openModal('CREDIT')}
                        className="bg-green-600 hover:bg-green-700 shadow-green-200"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nova Receita
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => openModal('DEBIT')}
                        className="shadow-red-200"
                    >
                        <MinusCircle className="mr-2 h-4 w-4" />
                        Nova Despesa
                    </Button>
                </div>
            </div>

            {/* Dashboard Cards */}
            <BalanceSummary totalBalance={totalBalance} isLoading={isLoading} />

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Transaction History (Takes 2/3 width on large screens) */}
                <div className="lg:col-span-2">
                    <TransactionList transactions={transactions} isLoading={isLoading} />
                </div>

                {/* Quick Actions / Mini Reports (Side Panel) */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl p-6 text-white shadow-xl">
                        <h3 className="font-semibold text-lg mb-2">Relatório Mensal</h3>
                        <p className="text-indigo-200 text-sm mb-4">
                            O fechamento do mês de Janeiro está 90% concluído.
                        </p>
                        <Button variant="secondary" size="sm" className="w-full justify-between group">
                            Visualizar Relatório
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Button>
                    </div>

                    {/* Exemplo de onde entraria lista de contas bancárias detalhada futuramente */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="font-medium text-gray-900 mb-4">Contas Ativas</h3>
                        <div className="space-y-3">
                            {accounts?.map(acc => (
                                <div key={acc.id} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 truncate max-w-[150px]">{acc.name}</span>
                                    <span className="font-semibold text-gray-900">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.balance)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction Modal Form */}
            <TransactionForm
                isOpen={modalState.isOpen}
                onClose={closeModal}
                onSubmit={(data) => {
                    createTransaction.mutate(data);
                    closeModal();
                }}
                isLoading={createTransaction.isPending}
                initialType={modalState.type}
                accounts={accounts}
                categories={categories}
            />
        </div>
    );
}
