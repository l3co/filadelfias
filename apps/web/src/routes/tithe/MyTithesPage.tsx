import { useState } from 'react';
import { Heart, PlusCircle, Clock, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { useAuthTenant } from '../../contexts/AuthContext';
import { useMyTitheRecords, useMyTitheSummary, useTitheMutations } from '../../features/tithe/hooks/useTithe';
import { TitheRecordForm } from '../../features/tithe/components/TitheRecordForm';
import { Button } from '../../components/ui/button';
import { PageHeaderWithIcon } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { formatCurrencyBRL, formatDateBR } from '../../lib/formatters';
import type { TitheRecord } from '../../services/tithe';
import { getTitheTypeLabel } from '../../features/tithe/lib/tithePresentation';

const currentYear = new Date().getFullYear();

function StatusBadge({ status }: { status: TitheRecord['status'] }) {
    const config = {
        PENDING: { icon: Clock, label: 'Pendente', className: 'bg-amber-100 text-amber-700' },
        APPROVED: { icon: CheckCircle2, label: 'Aprovado', className: 'bg-green-100 text-green-700' },
        REJECTED: { icon: XCircle, label: 'Rejeitado', className: 'bg-red-100 text-red-700' },
    };

    const { icon: Icon, label, className } = config[status];

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${className}`}>
            <Icon className="h-3 w-3" />
            {label}
        </span>
    );
}

export function MyTithesPage() {
    const tenant = useAuthTenant();
    const [year, setYear] = useState(currentYear);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: records, isLoading: recordsLoading } = useMyTitheRecords(tenant?.id, year);
    const { data: summary, isLoading: summaryLoading } = useMyTitheSummary(tenant?.id, year);
    const { submitRecord, deleteRecord } = useTitheMutations(tenant?.id);

    const isLoading = recordsLoading || summaryLoading;

    const handleSubmit = (data: Parameters<typeof submitRecord.mutate>[0]) => {
        submitRecord.mutate(data, {
            onSuccess: () => setIsFormOpen(false),
        });
    };

    const handleDelete = (recordId: string) => {
        if (confirm('Tem certeza que deseja excluir este registro?')) {
            deleteRecord.mutate(recordId);
        }
    };

    if (!tenant?.id) {
        return (
            <EmptyState
                icon={Heart}
                title="Selecione uma organização"
                description="Você precisa estar vinculado a uma igreja para acessar seus dízimos."
            />
        );
    }

    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeaderWithIcon
                icon={Heart}
                iconColor="green"
                title="Meus Dízimos e Ofertas"
                description="Acompanhe suas contribuições e envie comprovantes"
                actions={
                    <div className="flex gap-3 items-center">
                        <select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                        >
                            {years.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <Button onClick={() => setIsFormOpen(true)} className="gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Novo Registro
                        </Button>
                    </div>
                }
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Dízimos ({year})</p>
                            <p className="text-2xl font-bold text-green-600">
                                {isLoading ? '...' : formatCurrencyBRL(summary?.total_dizimo || 0)}
                            </p>
                            <p className="text-xs text-gray-400">{summary?.count_dizimo || 0} registros</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Ofertas ({year})</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {isLoading ? '...' : formatCurrencyBRL(summary?.total_oferta || 0)}
                            </p>
                            <p className="text-xs text-gray-400">{summary?.count_oferta || 0} registros</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Total ({year})</p>
                            <p className="text-2xl font-bold text-[#002333]">
                                {isLoading ? '...' : formatCurrencyBRL(summary?.total || 0)}
                            </p>
                            {(summary?.count_pending || 0) > 0 && (
                                <p className="text-xs text-amber-500">{summary?.count_pending} pendentes</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Records List */}
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Registros</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">Carregando...</div>
                    ) : !records || records.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Nenhum registro encontrado para {year}.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {records.map((record) => (
                                <div
                                    key={record.id}
                                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${
                                            record.type === 'DIZIMO' ? 'bg-green-100' : 'bg-blue-100'
                                        }`}>
                                            <Heart className={`h-5 w-5 ${
                                                record.type === 'DIZIMO' ? 'text-green-600' : 'text-blue-600'
                                            }`} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-[#002333]">
                                                {getTitheTypeLabel(record.type)}
                                            </p>
                                            <p className="text-sm text-gray-500">{formatDateBR(record.date)}</p>
                                            {record.notes && (
                                                <p className="text-xs text-gray-400 mt-1">{record.notes}</p>
                                            )}
                                            {record.rejection_reason && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    Motivo: {record.rejection_reason}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-semibold text-[#002333]">
                                                {formatCurrencyBRL(record.amount)}
                                            </p>
                                            <StatusBadge status={record.status} />
                                        </div>
                                        {record.status === 'PENDING' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(record.id)}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Form Modal */}
            <TitheRecordForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleSubmit}
                isLoading={submitRecord.isPending}
            />
        </div>
    );
}
