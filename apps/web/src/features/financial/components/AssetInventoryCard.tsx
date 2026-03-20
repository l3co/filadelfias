import { Package2, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { formatCurrencyBRL, formatDateBR } from '../../../lib/formatters';
import type { FinancialAsset } from '../../../services/financial';

type AssetInventoryCardProps = {
  assets?: FinancialAsset[];
  isDeleting: boolean;
  isLoading: boolean;
  onCreate: () => void;
  onDelete: (assetId: string) => void;
  canManage: boolean;
};

const CONDITION_LABELS: Record<string, string> = {
  EXCELLENT: 'Excelente',
  GOOD: 'Bom',
  FAIR: 'Regular',
  NEEDS_REPAIR: 'Precisa de reparo',
};

export function AssetInventoryCard({
  assets,
  isDeleting,
  isLoading,
  onCreate,
  onDelete,
  canManage,
}: AssetInventoryCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-50 p-2">
            <Package2 className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-[#002333]">Patrimônio</h3>
            <p className="text-sm text-gray-500">Inventário básico de bens da igreja.</p>
          </div>
        </div>

        {canManage && (
          <Button className="gap-2" onClick={onCreate} size="sm" variant="outline">
            <Plus className="h-4 w-4" />
            Novo bem
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-gray-500">Carregando inventário...</p>}

        {!isLoading && (!assets || assets.length === 0) && (
          <p className="rounded-xl bg-gray-50 px-4 py-5 text-sm text-gray-500">
            Nenhum bem patrimonial cadastrado.
          </p>
        )}

        {!isLoading &&
          assets?.slice(0, 5).map((asset) => (
            <div
              className="rounded-xl border border-gray-100 p-4"
              key={asset.id}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">{asset.name}</p>
                  <p className="text-sm text-gray-500">
                    {asset.category}
                    {asset.location ? ` • ${asset.location}` : ''}
                  </p>
                </div>

                {canManage && (
                  <Button
                    isLoading={isDeleting}
                    onClick={() => onDelete(asset.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>

              <div className="mt-3 grid gap-2 text-xs text-gray-500 md:grid-cols-3">
                <span>Condição: {CONDITION_LABELS[asset.condition] || asset.condition}</span>
                <span>Quantidade: {asset.quantity}</span>
                <span>
                  {asset.purchase_value != null
                    ? `Valor: ${formatCurrencyBRL(asset.purchase_value)}`
                    : 'Valor não informado'}
                </span>
              </div>

              {asset.acquired_date && (
                <p className="mt-2 text-xs text-gray-400">
                  Aquisição: {formatDateBR(asset.acquired_date)}
                </p>
              )}
            </div>
          ))}

        {!isLoading && (assets?.length ?? 0) > 5 && (
          <p className="text-xs text-gray-400">
            Exibindo 5 de {assets?.length} bens cadastrados.
          </p>
        )}
      </div>
    </div>
  );
}
