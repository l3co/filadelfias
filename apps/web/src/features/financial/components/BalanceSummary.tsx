import { ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp } from "lucide-react";

interface BalanceSummaryProps {
    totalBalance: number;
    isLoading?: boolean;
}

export function BalanceSummary({ totalBalance, isLoading }: BalanceSummaryProps) {
    const formatBRL = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Saldo Total - Card Principal */}
            <div className="relative bg-gradient-to-br from-[#002333] via-green-900 to-[#002333] rounded-2xl p-6 text-white overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl" />
                <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-green-100/80">Saldo Total</span>
                        <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
                            <Wallet className="h-5 w-5 text-green-300" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold">{formatBRL(totalBalance)}</div>
                    <div className="mt-3 flex items-center gap-1.5 text-sm">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        <span className="text-green-300 font-medium">+2.5%</span>
                        <span className="text-green-100/60">vs. mês anterior</span>
                    </div>
                </div>
            </div>

            {/* Receitas */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-500">Receitas (Mês)</span>
                    <div className="p-2 rounded-xl bg-gradient-to-br from-green-50 to-teal-50">
                        <ArrowUpCircle className="h-5 w-5 text-green-600" />
                    </div>
                </div>
                <div className="text-2xl font-bold text-[#002333]">{formatBRL(12500.00)}</div>
                <p className="text-sm text-gray-500 mt-2">Dízimos e Ofertas</p>
            </div>

            {/* Despesas */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-500">Despesas (Mês)</span>
                    <div className="p-2 rounded-xl bg-red-50">
                        <ArrowDownCircle className="h-5 w-5 text-red-500" />
                    </div>
                </div>
                <div className="text-2xl font-bold text-[#002333]">{formatBRL(4320.00)}</div>
                <p className="text-sm text-gray-500 mt-2">Operacional e Missões</p>
            </div>
        </div>
    );
}
