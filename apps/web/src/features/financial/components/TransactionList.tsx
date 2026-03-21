import { memo, useCallback, useMemo } from 'react';
import { TrendingUp, TrendingDown, MoreHorizontal, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { List, type RowComponentProps } from 'react-window';
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { formatCurrencyBRL, formatDateBR } from "../../../lib/formatters";
import type { Transaction } from "../../../services/financial";

const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
const VIRTUALIZATION_THRESHOLD = 25;
const TRANSACTION_ROW_HEIGHT = 88;
const MAX_LIST_HEIGHT = 520;

interface TransactionRowData {
    transactions: Transaction[];
}

function TransactionRow({
    ariaAttributes,
    index,
    style,
    transactions,
}: RowComponentProps<TransactionRowData>) {
    const tx = transactions[index];

    return (
        <div
            {...ariaAttributes}
            style={style}
            className="group flex items-center justify-between border-b border-gray-100 px-6 py-4 hover:bg-gray-50 transition-all duration-200"
        >
            <div className="flex items-center gap-4">
                <div className={`
                    p-2.5 rounded-xl transition-colors
                    ${tx.type === 'CREDIT'
                        ? 'bg-green-50 text-green-600 group-hover:bg-green-100'
                        : 'bg-red-50 text-red-600 group-hover:bg-red-100'}
                `}>
                    {tx.type === 'CREDIT' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </div>
                <div>
                    <p className="font-semibold text-gray-900">{tx.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span className="font-medium text-gray-600">{tx.category?.name || 'Geral'}</span>
                        <span>•</span>
                        <span>{formatDateBR(tx.date)}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className={`font-bold tabular-nums text-right ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'DEBIT' ? '-' : '+'}
                    {formatCurrencyBRL(tx.amount)}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Abrir ações para transação ${tx.description}`}
                    title={`Abrir ações para transação ${tx.description}`}
                >
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                </Button>
            </div>
        </div>
    );
}

interface TransactionListProps {
    transactions?: Transaction[];
    isLoading?: boolean;
    filters?: { month: number; year: number; page: number };
    onNextPage?: () => void;
    onPrevPage?: () => void;
    onMonthChange?: (month: number) => void;
    onYearChange?: (year: number) => void;
}

export const TransactionList = memo(function TransactionList({
    transactions,
    isLoading,
    filters,
    onNextPage,
    onPrevPage,
    onMonthChange,
    onYearChange
}: TransactionListProps) {
    if (isLoading) {
        return (
            <Card className="p-12 flex items-center justify-center">
                <p className="text-gray-500">Carregando movimentações...</p>
            </Card>
        );
    }

    const currentMonth = filters?.month || new Date().getMonth() + 1;
    const currentYear = filters?.year || new Date().getFullYear();
    const currentPage = filters?.page || 1;
    const shouldVirtualize = (transactions?.length ?? 0) > VIRTUALIZATION_THRESHOLD;
    const listHeight = useMemo(() => {
        const totalRowsHeight = (transactions?.length ?? 0) * TRANSACTION_ROW_HEIGHT;
        return Math.min(MAX_LIST_HEIGHT, totalRowsHeight);
    }, [transactions]);
    const rowProps = useMemo<TransactionRowData>(() => ({
        transactions: transactions ?? [],
    }), [transactions]);

    const handlePrevMonth = useCallback(() => {
        if (onMonthChange && onYearChange) {
            if (currentMonth === 1) {
                onMonthChange(12);
                onYearChange(currentYear - 1);
            } else {
                onMonthChange(currentMonth - 1);
            }
        }
    }, [currentMonth, currentYear, onMonthChange, onYearChange]);

    const handleNextMonth = useCallback(() => {
        if (onMonthChange && onYearChange) {
            if (currentMonth === 12) {
                onMonthChange(1);
                onYearChange(currentYear + 1);
            } else {
                onMonthChange(currentMonth + 1);
            }
        }
    }, [currentMonth, currentYear, onMonthChange, onYearChange]);

    if (!transactions || transactions.length === 0) {
        return (
            <Card className="overflow-hidden border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white border border-gray-200 rounded-md shadow-sm">
                            <Calendar className="w-4 h-4 text-gray-500" />
                        </div>
                        <h3 className="font-semibold text-gray-800">Movimentações do Mês</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevMonth} data-testid="prev-month-button" aria-label="Mês anterior">
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <span className="text-sm font-medium min-w-[120px] text-center" data-testid="current-month-display">
                            {MONTHS[currentMonth - 1]} {currentYear}
                        </span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextMonth} data-testid="next-month-button" aria-label="Próximo mês">
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    </div>
                </div>
                <div className="p-12 flex flex-col items-center justify-center text-gray-500">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <TrendingUp className="w-6 h-6 text-gray-400" />
                    </div>
                    <p>Nenhuma movimentação neste mês.</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white border border-gray-200 rounded-md shadow-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Movimentações do Mês</h3>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevMonth} data-testid="prev-month-button" aria-label="Mês anterior">
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <span className="text-sm font-medium min-w-[120px] text-center" data-testid="current-month-display">
                        {MONTHS[currentMonth - 1]} {currentYear}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextMonth} data-testid="next-month-button" aria-label="Próximo mês">
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                </div>
            </div>

            {shouldVirtualize ? (
                <div className="border-b border-gray-100">
                    <List
                        className="divide-y divide-gray-100"
                        defaultHeight={MAX_LIST_HEIGHT}
                        rowComponent={TransactionRow}
                        rowCount={transactions.length}
                        rowHeight={TRANSACTION_ROW_HEIGHT}
                        rowProps={rowProps}
                        style={{ height: listHeight, width: '100%' }}
                    />
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {transactions.map((tx) => (
                        <div key={tx.id} className="group px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-all duration-200">
                            <div className="flex items-center gap-4">
                                <div className={`
                                    p-2.5 rounded-xl transition-colors
                                    ${tx.type === 'CREDIT'
                                        ? 'bg-green-50 text-green-600 group-hover:bg-green-100'
                                        : 'bg-red-50 text-red-600 group-hover:bg-red-100'}
                                `}>
                                    {tx.type === 'CREDIT' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{tx.description}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                        <span className="font-medium text-gray-600">{tx.category?.name || 'Geral'}</span>
                                        <span>•</span>
                                        <span>{formatDateBR(tx.date)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className={`font-bold tabular-nums text-right ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.type === 'DEBIT' ? '-' : '+'}
                                    {formatCurrencyBRL(tx.amount)}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label={`Abrir ações para transação ${tx.description}`}
                                    title={`Abrir ações para transação ${tx.description}`}
                                >
                                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Paginação */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <span className="text-sm text-gray-500">Página {currentPage}</span>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onPrevPage}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onNextPage}
                        disabled={transactions.length < 10}
                    >
                        Próxima
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>
        </Card>
    );
});
