import { TrendingUp, TrendingDown, MoreHorizontal, Calendar } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import type { Transaction } from "../../../services/financial";

interface TransactionListProps {
    transactions?: Transaction[];
    isLoading?: boolean;
}

export function TransactionList({ transactions, isLoading }: TransactionListProps) {
    if (isLoading) {
        return (
            <Card className="p-12 flex items-center justify-center">
                <p className="text-gray-500">Carregando movimentações...</p>
            </Card>
        );
    }

    if (!transactions || transactions.length === 0) {
        return (
            <Card className="p-12 border-dashed border-2 flex flex-col items-center justify-center text-gray-500">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <TrendingUp className="w-6 h-6 text-gray-400" />
                </div>
                <p>Nenhuma movimentação registrada.</p>
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
                    <h3 className="font-semibold text-gray-800">Últimas Movimentações</h3>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-gray-500">
                    Ver tudo
                </Button>
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
        </Card>
    );
}
