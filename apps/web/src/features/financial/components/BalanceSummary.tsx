import { ArrowUpCircle, ArrowDownCircle, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

interface BalanceSummaryProps {
    totalBalance: number;
    isLoading?: boolean;
}

export function BalanceSummary({ totalBalance, isLoading }: BalanceSummaryProps) {
    // Formatter
    const formatBRL = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                        Saldo Total
                    </CardTitle>
                    <div className="h-8 w-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{formatBRL(totalBalance)}</div>
                    <p className="text-xs text-indigo-600 mt-1 font-medium">+2.5% vs. mês anterior</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                        Receitas (Mês)
                    </CardTitle>
                    <div className="h-8 w-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                        <ArrowUpCircle className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{formatBRL(12500.00)}</div>
                    <p className="text-xs text-gray-500 mt-1">Dízimos e Ofertas</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                        Despesas (Mês)
                    </CardTitle>
                    <div className="h-8 w-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                        <ArrowDownCircle className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{formatBRL(4320.00)}</div>
                    <p className="text-xs text-gray-500 mt-1">Operacional e Missões</p>
                </CardContent>
            </Card>
        </div>
    );
}
