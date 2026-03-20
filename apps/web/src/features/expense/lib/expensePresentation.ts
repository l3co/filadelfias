import { CheckCircle2, Clock, XCircle } from 'lucide-react';

export const EXPENSE_CATEGORIES = [
  { value: 'MATERIAL', label: 'Material (escritório, didático)' },
  { value: 'CLEANING', label: 'Material de Limpeza' },
  { value: 'TRANSPORT', label: 'Transporte / Combustível' },
  { value: 'FOOD', label: 'Alimentação (eventos)' },
  { value: 'MAINTENANCE', label: 'Manutenção' },
  { value: 'UTILITIES', label: 'Contas (água, luz, internet)' },
  { value: 'OTHER', label: 'Outros' },
] as const;

const EXPENSE_CATEGORY_LABELS = EXPENSE_CATEGORIES.reduce<Record<string, string>>((accumulator, category) => {
  accumulator[category.value] = category.label;
  return accumulator;
}, {});

export function getExpenseCategoryLabel(category: string) {
  return EXPENSE_CATEGORY_LABELS[category] || category;
}

export function getExpenseStatusConfig(status: string) {
  switch (status) {
    case 'PENDING':
      return { icon: Clock, label: 'Pendente', className: 'bg-amber-100 text-amber-700' };
    case 'APPROVED':
      return { icon: CheckCircle2, label: 'Aprovado', className: 'bg-green-100 text-green-700' };
    case 'REJECTED':
      return { icon: XCircle, label: 'Rejeitado', className: 'bg-red-100 text-red-700' };
    default:
      return null;
  }
}
