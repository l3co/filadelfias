import { ChevronRight, CreditCard, FileText, MinusCircle, PlusCircle, Upload, Wallet } from 'lucide-react';
import { AccessDenied } from '../../../components/PermissionGate';
import { EmptyState } from '../../../components/EmptyState';
import { PageHeaderWithIcon } from '../../../components/PageHeader';
import { Button } from '../../../components/ui/button';
import { useTreasuryPageData } from '../hooks/useTreasuryPageData';
import { BalanceSummary } from './BalanceSummary';
import { CsvImportDialog } from './CsvImportDialog';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { PendingTithesList } from '../../tithe/components/PendingTithesList';
import { PendingExpensesList } from '../../expense/components/PendingExpensesList';
import { formatCurrencyBRL } from '../../../lib/formatters';
import { MonthlyReportDialog } from './MonthlyReportDialog';
import { AssetInventoryCard } from './AssetInventoryCard';
import { CreateAssetDialog } from './CreateAssetDialog';

type TreasuryPageViewProps = ReturnType<typeof useTreasuryPageData>;

export function TreasuryPageView({
  accounts,
  canViewFinancial,
  categories,
  closeModal,
  createAsset,
  createAccount,
  createCategory,
  createTransaction,
  deleteAsset,
  expensesLoading,
  filters,
  handleAssetSubmit,
  handleCloseAssetDialog,
  handleCloseCsvDialog,
  handleCloseReport,
  handleDownloadTemplate,
  handleImportCsv,
  handleOpenCsvDialog,
  handleOpenAssetDialog,
  handleOpenReport,
  handleTransactionSubmit,
  isCsvDialogOpen,
  isAssetDialogOpen,
  isLoading,
  isReportOpen,
  members,
  modalState,
  nextPage,
  openCreditModal,
  openDebitModal,
  pendingExpenses,
  pendingTithes,
  prevPage,
  setMonth,
  setYear,
  showTreasuryControls,
  tenant,
  tithesLoading,
  totalBalance,
  transactions,
  assets,
  assetsLoading,
  report,
  reportLoading,
  approveExpense,
  approveRecord,
}: TreasuryPageViewProps) {
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
          showTreasuryControls ? (
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleOpenCsvDialog} className="gap-2">
                <Upload className="h-4 w-4" />
                Importar CSV
              </Button>
              <Button onClick={openCreditModal} className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Nova Receita
              </Button>
              <Button variant="destructive" onClick={openDebitModal} className="gap-2">
                <MinusCircle className="h-4 w-4" />
                Nova Despesa
              </Button>
            </div>
          ) : null
        }
      />

      <BalanceSummary totalBalance={totalBalance} isLoading={isLoading} transactions={transactions} />

      {showTreasuryControls && (pendingTithes?.length ?? 0) > 0 && (
        <PendingTithesList
          records={pendingTithes || []}
          isLoading={tithesLoading}
          onApprove={(recordId) => approveRecord.mutate({ recordId, data: { status: 'APPROVED' } })}
          onReject={(recordId, reason) =>
            approveRecord.mutate({
              recordId,
              data: { status: 'REJECTED', rejection_reason: reason },
            })
          }
          isApproving={approveRecord.isPending}
          canApprove={showTreasuryControls}
        />
      )}

      {showTreasuryControls && (pendingExpenses?.length ?? 0) > 0 && (
        <PendingExpensesList
          records={pendingExpenses || []}
          isLoading={expensesLoading}
          onApprove={(recordId) => approveExpense.mutate({ recordId, data: { status: 'APPROVED' } })}
          onReject={(recordId, reason) =>
            approveExpense.mutate({
              recordId,
              data: { status: 'REJECTED', rejection_reason: reason },
            })
          }
          isApproving={approveExpense.isPending}
        />
      )}

      {showTreasuryControls && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

          <div className="space-y-6">
            <div className="relative bg-gradient-to-br from-[#002333] via-green-900 to-[#002333] rounded-2xl p-6 text-white overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
                    <FileText className="h-5 w-5 text-green-300" />
                  </div>
                  <h3 className="font-semibold text-lg">Relatório Mensal</h3>
                </div>
                <p className="text-green-100/80 text-sm mb-4">Gere relatórios financeiros detalhados.</p>
                <button
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-sm font-medium transition-colors group"
                  onClick={handleOpenReport}
                  type="button"
                >
                  Visualizar Relatório
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-50 to-teal-50">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-[#002333]">Contas Ativas</h3>
              </div>
              <div className="space-y-3">
                {accounts?.map((account) => (
                  <div key={account.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600 truncate max-w-[150px]">{account.name}</span>
                    <span className="text-sm font-semibold text-[#002333]">{formatCurrencyBRL(account.balance)}</span>
                  </div>
                ))}
                {(!accounts || accounts.length === 0) && (
                  <p className="text-sm text-gray-400 text-center py-4">Nenhuma conta cadastrada</p>
                )}
              </div>
            </div>

            <AssetInventoryCard
              assets={assets}
              canManage={showTreasuryControls}
              isDeleting={deleteAsset.isPending}
              isLoading={assetsLoading}
              onCreate={handleOpenAssetDialog}
              onDelete={(assetId) => deleteAsset.mutate(assetId)}
            />
          </div>
        </div>
      )}

      <TransactionForm
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSubmit={handleTransactionSubmit}
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

      <CsvImportDialog
        isOpen={isCsvDialogOpen}
        onClose={handleCloseCsvDialog}
        onImport={handleImportCsv}
        onDownloadTemplate={handleDownloadTemplate}
      />

      <MonthlyReportDialog
        isLoading={reportLoading}
        isOpen={isReportOpen}
        onClose={handleCloseReport}
        report={report}
      />

      <CreateAssetDialog
        isOpen={isAssetDialogOpen}
        isSubmitting={createAsset.isPending}
        onClose={handleCloseAssetDialog}
        onSubmit={handleAssetSubmit}
      />
    </div>
  );
}
