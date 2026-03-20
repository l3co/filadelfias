import { ArrowDownRight, ArrowUpRight, Landmark, Receipt, Wallet } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { formatCurrencyBRL } from '../../../lib/formatters';
import type { MonthlyReport } from '../../../services/financial';

type MonthlyReportDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  report?: MonthlyReport;
  isLoading: boolean;
};

const MONTH_LABELS = [
  'Janeiro',
  'Fevereiro',
  'Marco',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export function MonthlyReportDialog({
  isOpen,
  onClose,
  report,
  isLoading,
}: MonthlyReportDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Relatório Financeiro Mensal</DialogTitle>
          <DialogDescription>
            {report
              ? `${MONTH_LABELS[report.month - 1]} de ${report.year}`
              : 'Resumo financeiro consolidado do período selecionado.'}
          </DialogDescription>
        </DialogHeader>

        {isLoading && <p className="text-sm text-gray-500">Carregando relatório...</p>}

        {!isLoading && report && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-gray-200 bg-green-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-green-700">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="text-sm font-medium">Receitas</span>
                </div>
                <p className="text-xl font-semibold text-green-900">{formatCurrencyBRL(report.total_income)}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-red-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-red-700">
                  <ArrowDownRight className="h-4 w-4" />
                  <span className="text-sm font-medium">Despesas</span>
                </div>
                <p className="text-xl font-semibold text-red-900">{formatCurrencyBRL(report.total_expenses)}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-blue-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-blue-700">
                  <Wallet className="h-4 w-4" />
                  <span className="text-sm font-medium">Saldo do Período</span>
                </div>
                <p className="text-xl font-semibold text-blue-900">{formatCurrencyBRL(report.net_balance)}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-amber-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-amber-700">
                  <Receipt className="h-4 w-4" />
                  <span className="text-sm font-medium">Movimentações</span>
                </div>
                <p className="text-xl font-semibold text-amber-900">{report.transaction_count}</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-gray-200 p-5">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Receitas por categoria
                </h3>
                <div className="space-y-3">
                  {report.income_breakdown.length === 0 && (
                    <p className="text-sm text-gray-500">Nenhuma receita encontrada no período.</p>
                  )}
                  {report.income_breakdown.map((item) => (
                    <div className="flex items-center justify-between" key={`income-${item.category}`}>
                      <div>
                        <p className="font-medium text-gray-900">{item.category}</p>
                        <p className="text-xs text-gray-500">{item.count} lancamento(s)</p>
                      </div>
                      <p className="font-semibold text-green-700">{formatCurrencyBRL(item.amount)}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 p-5">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Despesas por categoria
                </h3>
                <div className="space-y-3">
                  {report.expense_breakdown.length === 0 && (
                    <p className="text-sm text-gray-500">Nenhuma despesa encontrada no período.</p>
                  )}
                  {report.expense_breakdown.map((item) => (
                    <div className="flex items-center justify-between" key={`expense-${item.category}`}>
                      <div>
                        <p className="font-medium text-gray-900">{item.category}</p>
                        <p className="text-xs text-gray-500">{item.count} lancamento(s)</p>
                      </div>
                      <p className="font-semibold text-red-700">{formatCurrencyBRL(item.amount)}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <section className="rounded-2xl border border-gray-200 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-gray-600" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Saldos por conta
                  </h3>
                </div>
                <div className="space-y-3">
                  {report.accounts.map((account) => (
                    <div className="flex items-center justify-between" key={account.id}>
                      <div>
                        <p className="font-medium text-gray-900">{account.name}</p>
                        <p className="text-xs uppercase text-gray-500">{account.type}</p>
                      </div>
                      <p className="font-semibold text-gray-900">{formatCurrencyBRL(account.balance)}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 p-5">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Pendencias
                </h3>
                <div className="space-y-3">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Dizimos aguardando aprovacao</p>
                    <p className="text-2xl font-semibold text-gray-900">{report.pending_tithes}</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Reembolsos aguardando aprovacao</p>
                    <p className="text-2xl font-semibold text-gray-900">{report.pending_expenses}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
