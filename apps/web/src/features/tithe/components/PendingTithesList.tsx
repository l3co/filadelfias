import { useCallback, useMemo, useState } from 'react';
import { Clock, CheckCircle2, XCircle, User } from 'lucide-react';
import { List, type RowComponentProps } from 'react-window';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { formatCurrencyBRL, formatDateBR } from '../../../lib/formatters';
import type { TitheRecord } from '../../../services/tithe';
import { getTitheTypeLabel } from '../lib/tithePresentation';

interface PendingTithesListProps {
    records: TitheRecord[];
    isLoading: boolean;
    onApprove: (recordId: string) => void;
    onReject: (recordId: string, reason: string) => void;
    isApproving?: boolean;
    canApprove?: boolean; // Only treasurer can approve/reject
}

const VIRTUALIZATION_THRESHOLD = 20;
const DEFAULT_ROW_HEIGHT = 128;
const EXPANDED_ROW_HEIGHT = 214;
const MAX_LIST_HEIGHT = 420;

interface PendingTitheRowData {
    canApprove: boolean;
    isApproving?: boolean;
    onApprove: (recordId: string) => void;
    records: TitheRecord[];
    rejectReason: string;
    rejectingId: string | null;
    setRejectReason: (reason: string) => void;
    setRejectingId: (recordId: string | null) => void;
    onRejectConfirm: (recordId: string) => void;
}

function PendingTitheRow({
    ariaAttributes,
    index,
    style,
    canApprove,
    isApproving,
    onApprove,
    records,
    rejectReason,
    rejectingId,
    setRejectReason,
    setRejectingId,
    onRejectConfirm,
}: RowComponentProps<PendingTitheRowData>) {
    const record = records[index];

    return (
        <div
            {...ariaAttributes}
            style={style}
            className="border-b border-gray-100 px-0 py-0"
            data-testid={`pending-tithe-row-${record.id}`}
        >
            <div
                className="p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                data-testid={`pending-tithe-card-${record.id}`}
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
                                {getTitheTypeLabel(record.type)} - {formatDateBR(record.date)}
                            </p>
                            {record.notes && (
                                <p className="text-xs text-gray-400 mt-1">{record.notes}</p>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-lg text-green-600">
                            {formatCurrencyBRL(record.amount)}
                        </p>
                        <p className="text-xs text-gray-400">
                            Enviado em {formatDateBR(record.created_at)}
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
                                    onClick={() => onRejectConfirm(record.id)}
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
                                data-testid={`reject-pending-tithe-${record.id}`}
                            >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rejeitar
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => onApprove(record.id)}
                                disabled={isApproving}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                data-testid={`approve-pending-tithe-${record.id}`}
                            >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Aprovar
                            </Button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
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

    const handleReject = useCallback((recordId: string) => {
        onReject(recordId, rejectReason);
        setRejectingId(null);
        setRejectReason('');
    }, [onReject, rejectReason]);

    const shouldVirtualize = records.length > VIRTUALIZATION_THRESHOLD;
    const listHeight = useMemo(() => {
        if (!shouldVirtualize) {
            return undefined;
        }

        const totalHeight = records.reduce((height, record) => (
            height + (rejectingId === record.id ? EXPANDED_ROW_HEIGHT : DEFAULT_ROW_HEIGHT)
        ), 0);

        return Math.min(MAX_LIST_HEIGHT, totalHeight);
    }, [records, rejectingId, shouldVirtualize]);

    const rowHeight = useCallback((index: number, rowProps: PendingTitheRowData) => (
        rowProps.rejectingId === rowProps.records[index].id ? EXPANDED_ROW_HEIGHT : DEFAULT_ROW_HEIGHT
    ), []);

    const rowProps = useMemo<PendingTitheRowData>(() => ({
        canApprove,
        isApproving,
        onApprove,
        records,
        rejectReason,
        rejectingId,
        setRejectReason,
        setRejectingId,
        onRejectConfirm: handleReject,
    }), [canApprove, handleReject, isApproving, onApprove, records, rejectReason, rejectingId]);

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
                {shouldVirtualize ? (
                    <List
                        rowComponent={PendingTitheRow}
                        rowCount={records.length}
                        rowHeight={rowHeight}
                        rowProps={rowProps}
                        defaultHeight={MAX_LIST_HEIGHT}
                        style={{ height: listHeight, width: '100%' }}
                    />
                ) : (
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
                                                {getTitheTypeLabel(record.type)} - {formatDateBR(record.date)}
                                            </p>
                                            {record.notes && (
                                                <p className="text-xs text-gray-400 mt-1">{record.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-lg text-green-600">
                                            {formatCurrencyBRL(record.amount)}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Enviado em {formatDateBR(record.created_at)}
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
                )}
            </CardContent>
        </Card>
    );
}
