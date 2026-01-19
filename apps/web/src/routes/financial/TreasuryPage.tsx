import { useState } from 'react';
import { useCurrentTenant } from '../../hooks/useAuth';
import { useFinancialData } from '../../features/financial/hooks/useFinancial';
import { BalanceSummary } from '../../features/financial/components/BalanceSummary';
import { TransactionList } from '../../features/financial/components/TransactionList';
import { TransactionForm } from '../../features/financial/components/TransactionForm';
import { Button } from '../../components/ui/button';
import { PlusCircle, MinusCircle, Wallet, FileText, CreditCard, ChevronRight } from 'lucide-react';

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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                    <Wallet className="h-8 w-8 text-amber-600" />
                </div>
                <h2 className="text-lg font-semibold text-[#002333]">Selecione uma organização</h2>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                    Você precisa estar vinculado a uma igreja para acessar o financeiro.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-green-50 to-teal-50">
                        <Wallet className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002333] tracking-tight">Tesouraria</h1>
                        <p className="text-gray-500 mt-0.5">Gestão financeira inteligente e transparente</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => openModal('CREDIT')} className="gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Nova Receita
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => openModal('DEBIT')}
                        className="gap-2"
                    >
                        <MinusCircle className="h-4 w-4" />
                        Nova Despesa
                    </Button>
                </div>
            </div>

            {/* Dashboard Cards */}
            <BalanceSummary totalBalance={totalBalance} isLoading={isLoading} />

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Transaction History */}
                <div className="lg:col-span-2">
                    <TransactionList transactions={transactions} isLoading={isLoading} />
                </div>

                {/* Side Panel */}
                <div className="space-y-6">
                    {/* Relatório Card */}
                    <div className="relative bg-gradient-to-br from-[#002333] via-green-900 to-[#002333] rounded-2xl p-6 text-white overflow-hidden shadow-lg">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl" />
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
                                    <FileText className="h-5 w-5 text-green-300" />
                                </div>
                                <h3 className="font-semibold text-lg">Relatório Mensal</h3>
                            </div>
                            <p className="text-green-100/80 text-sm mb-4">
                                O fechamento do mês está 90% concluído.
                            </p>
                            <button className="w-full flex items-center justify-between px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-sm font-medium transition-colors group">
                                Visualizar Relatório
                                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Contas Ativas */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-green-50 to-teal-50">
                                <CreditCard className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-[#002333]">Contas Ativas</h3>
                        </div>
                        <div className="space-y-3">
                            {accounts?.map(acc => (
                                <div key={acc.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                    <span className="text-sm text-gray-600 truncate max-w-[150px]">{acc.name}</span>
                                    <span className="text-sm font-semibold text-[#002333]">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.balance)}
                                    </span>
                                </div>
                            ))}
                            {(!accounts || accounts.length === 0) && (
                                <p className="text-sm text-gray-400 text-center py-4">Nenhuma conta cadastrada</p>
                            )}
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
