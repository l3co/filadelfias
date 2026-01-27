import { TrendingUp, TrendingDown, MoreHorizontal, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import type { Transaction } from "../../../services/financial";

const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

interface TransactionListProps {
    transactions?: Transaction[];
    isLoading?: boolean;
    filters?: { month: number; year: number; page: number };
    onNextPage?: () => void;
    onPrevPage?: () => void;
    onMonthChange?: (month: number) => void;
    onYearChange?: (year: number) => void;
}

export function TransactionList({
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

    const handlePrevMonth = () => {
        if (onMonthChange && onYearChange) {
            if (currentMonth === 1) {
                onMonthChange(12);
                onYearChange(currentYear - 1);
            } else {
                onMonthChange(currentMonth - 1);
            }
        }
    };

    const handleNextMonth = () => {
        if (onMonthChange && onYearChange) {
            if (currentMonth === 12) {
                onMonthChange(1);
                onYearChange(currentYear + 1);
            } else {
                onMonthChange(currentMonth + 1);
            }
        }
    };

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
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevMonth} data-testid="prev-month-button">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium min-w-[120px] text-center" data-testid="current-month-display">
                            {MONTHS[currentMonth - 1]} {currentYear}
                        </span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextMonth} data-testid="next-month-button">
                            <ChevronRight className="h-4 w-4" />
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
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevMonth} data-testid="prev-month-button">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[120px] text-center" data-testid="current-month-display">
                        {MONTHS[currentMonth - 1]} {currentYear}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextMonth} data-testid="next-month-button">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

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
                                    <span>{new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={`font-bold tabular-nums text-right ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                                {tx.type === 'DEBIT' ? '-' : '+'}
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

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
}
