import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentTenant } from '../../hooks/useAuth';
import { useFinancialData } from '../../features/financial/hooks/useFinancial';
import { usePendingTitheRecords, useTitheMutations } from '../../features/tithe/hooks/useTithe';
import { usePermissions } from '../../hooks/usePermissions';
import { BalanceSummary } from '../../features/financial/components/BalanceSummary';
import { TransactionList } from '../../features/financial/components/TransactionList';
import { TransactionForm } from '../../features/financial/components/TransactionForm';
import { CsvImportDialog } from '../../features/financial/components/CsvImportDialog';
import { PendingTithesList } from '../../features/tithe/components/PendingTithesList';
import { PendingExpensesList } from '../../features/expense/components/PendingExpensesList';
import { usePendingExpenses, useExpenseMutations } from '../../features/expense/hooks/useExpense';
import { Button } from '../../components/ui/button';
import { AccessDenied } from '../../components/PermissionGate';
import { PlusCircle, MinusCircle, Wallet, FileText, CreditCard, ChevronRight, Upload } from 'lucide-react';
import { PageHeaderWithIcon } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { financialService } from '../../services/financial';
import { membersService } from '../../services/members';
import { toast } from 'sonner';

export function TreasuryPage() {
    const tenant = useCurrentTenant();
    const {
        accounts,
        categories,
        transactions,
        totalBalance,
        createTransaction,
        createAccount,
        createCategory,
        isLoading,
        filters,
        nextPage,
        prevPage,
        setMonth,
        setYear,
    } = useFinancialData(tenant?.id);
    const { canViewFinancial, isTreasurer } = usePermissions();

    const { data: pendingTithes, isLoading: tithesLoading } = usePendingTitheRecords(tenant?.id);
    const { approveRecord } = useTitheMutations(tenant?.id);

    const { data: pendingExpenses, isLoading: expensesLoading } = usePendingExpenses(tenant?.id);
    const { approveExpense } = useExpenseMutations(tenant?.id);

    const { data: members } = useQuery({
        queryKey: ['members', tenant?.id],
        queryFn: () => membersService.listMembers(tenant!.id),
        enabled: !!tenant?.id,
    });

    const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'CREDIT' | 'DEBIT' }>({
        isOpen: false,
        type: 'CREDIT'
    });
    const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);

    const openModal = (type: 'CREDIT' | 'DEBIT') => setModalState({ isOpen: true, type });
    const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

    const handleDownloadTemplate = () => {
        if (tenant?.id) {
            financialService.downloadCsvTemplate(tenant.id);
        }
    };

    const handleImportCsv = async (file: File) => {
        if (!tenant?.id) throw new Error('Tenant não encontrado');
        return financialService.importCsv(tenant.id, file);
    };

    if (!tenant?.id) {
        return (
            <EmptyState
                icon={Wallet}
                title="Selecione uma organização"
                description="Você precisa estar vinculado a uma igreja para acessar o financeiro."
            />
        );
    }

    if (!canViewFinancial) {
        return <AccessDenied resource="financial" />;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeaderWithIcon
                icon={Wallet}
                iconColor="green"
                title="Tesouraria"
                description="Gestão financeira inteligente e transparente"
                actions={
                    isTreasurer ? (
                        <div className="flex gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsCsvDialogOpen(true)} 
                                className="gap-2"
                            >
                                <Upload className="h-4 w-4" />
                                Importar CSV
                            </Button>
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
                    ) : null
                }
            />

            {/* Dashboard Cards */}
            <BalanceSummary totalBalance={totalBalance} isLoading={isLoading} transactions={transactions} />

            {/* Pending Tithes - Only visible to treasurer */}
            {isTreasurer && (pendingTithes?.length ?? 0) > 0 && (
                <PendingTithesList
                    records={pendingTithes || []}
                    isLoading={tithesLoading}
                    onApprove={(recordId) => approveRecord.mutate({ recordId, data: { status: 'APPROVED' } })}
                    onReject={(recordId, reason) => approveRecord.mutate({ recordId, data: { status: 'REJECTED', rejection_reason: reason } })}
                    isApproving={approveRecord.isPending}
                    canApprove={isTreasurer}
                />
            )}

            {/* Pending Expenses - Only visible to treasurer */}
            {isTreasurer && (pendingExpenses?.length ?? 0) > 0 && (
                <PendingExpensesList
                    records={pendingExpenses || []}
                    isLoading={expensesLoading}
                    onApprove={(recordId) => approveExpense.mutate({ recordId, data: { status: 'APPROVED' } })}
                    onReject={(recordId, reason) => approveExpense.mutate({ recordId, data: { status: 'REJECTED', rejection_reason: reason } })}
                    isApproving={approveExpense.isPending}
                />
            )}

            {/* Transaction History and Side Panel - Only visible to treasurer */}
            {isTreasurer && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Transaction History */}
                    <div className="lg:col-span-2">
                        <TransactionList 
                            transactions={transactions} 
                            isLoading={isLoading}
                            filters={filters}
                            onNextPage={nextPage}
                            onPrevPage={prevPage}
                            onMonthChange={setMonth}
                            onYearChange={setYear}
                        />
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
                                    Gere relatórios financeiros detalhados.
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
            )}

            {/* Transaction Modal Form */}
            <TransactionForm
                isOpen={modalState.isOpen}
                onClose={closeModal}
                onSubmit={(data, resetForm) => {
                    createTransaction.mutate(data, {
                        onSuccess: () => {
                            toast.success(modalState.type === 'CREDIT' ? 'Receita cadastrada com sucesso!' : 'Despesa cadastrada com sucesso!');
                            resetForm();
                            closeModal();
                        },
                        onError: (error) => {
                            toast.error(`Erro ao cadastrar: ${error.message}`);
                        }
                    });
                }}
                onCreateAccount={async (name: string) => {
                    const result = await createAccount.mutateAsync({ name, type: 'CASH', balance: 0 });
                    return { value: result.id, label: result.name };
                }}
                onCreateCategory={async (name: string, type: string) => {
                    const result = await createCategory.mutateAsync({ name, type });
                    return { value: result.id, label: result.name };
                }}
                isLoading={createTransaction.isPending}
                initialType={modalState.type}
                accounts={accounts}
                categories={categories}
                members={members}
            />

            {/* CSV Import Dialog */}
            <CsvImportDialog
                isOpen={isCsvDialogOpen}
                onClose={() => setIsCsvDialogOpen(false)}
                onImport={handleImportCsv}
                onDownloadTemplate={handleDownloadTemplate}
            />
        </div>
    );
}
