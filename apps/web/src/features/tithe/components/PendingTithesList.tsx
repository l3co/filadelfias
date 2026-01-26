import { useState } from 'react';
import { Clock, CheckCircle2, XCircle, User } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import type { TitheRecord } from '../../../services/tithe';

interface PendingTithesListProps {
    records: TitheRecord[];
    isLoading: boolean;
    onApprove: (recordId: string) => void;
    onReject: (recordId: string, reason: string) => void;
    isApproving?: boolean;
    canApprove?: boolean; // Only treasurer can approve/reject
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR');
}

export function PendingTithesList({
    records,
    isLoading,
    onApprove,
    onReject,
    isApproving,
    canApprove = false
}: PendingTithesListProps) {
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const handleReject = (recordId: string) => {
        onReject(recordId, rejectReason);
        setRejectingId(null);
        setRejectReason('');
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-gray-500">
                    Carregando...
                </CardContent>
            </Card>
        );
    }

    if (!records || records.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-500" />
                        Dízimos Pendentes de Aprovação
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <CheckCircle2 className="h-12 w-12 mx-auto text-green-300 mb-3" />
                        <p>Nenhum dízimo pendente de aprovação.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                    Dízimos Pendentes de Aprovação
                    <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                        {records.length}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {records.map((record) => (
                        <div
                            key={record.id}
                            className="p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-gray-100">
                                        <User className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-[#002333]">
                                            {record.member_name || 'Membro'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {record.type === 'DIZIMO' ? 'Dízimo' : 'Oferta'} - {formatDate(record.date)}
                                        </p>
                                        {record.notes && (
                                            <p className="text-xs text-gray-400 mt-1">{record.notes}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-lg text-green-600">
                                        {formatCurrency(record.amount)}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Enviado em {formatDate(record.created_at)}
                                    </p>
                                </div>
                            </div>

                            {canApprove && (
                                rejectingId === record.id ? (
                                    <div className="mt-4 space-y-2">
                                        <textarea
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                            placeholder="Motivo da rejeição (opcional)"
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                            rows={2}
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setRejectingId(null)}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleReject(record.id)}
                                                disabled={isApproving}
                                            >
                                                Confirmar Rejeição
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-4 flex gap-2 justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setRejectingId(record.id)}
                                            disabled={isApproving}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <XCircle className="h-4 w-4 mr-1" />
                                            Rejeitar
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => onApprove(record.id)}
                                            disabled={isApproving}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <CheckCircle2 className="h-4 w-4 mr-1" />
                                            Aprovar
                                        </Button>
                                    </div>
                                )
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
