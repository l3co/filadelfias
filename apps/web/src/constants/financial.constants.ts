/**
 * Financial Constants
 */

import type { SelectOption } from './member.constants';

type AccountType = 'CHECKING' | 'SAVINGS' | 'CASH' | 'INVESTMENT';
type TransactionType = 'CREDIT' | 'DEBIT';
type CategoryType = 'INCOME' | 'EXPENSE';

export const ACCOUNT_TYPE_OPTIONS: SelectOption<AccountType>[] = [
  { value: 'CHECKING', label: 'Conta Corrente' },
  { value: 'SAVINGS', label: 'Poupança' },
  { value: 'CASH', label: 'Caixa' },
  { value: 'INVESTMENT', label: 'Investimento' },
];

export const TRANSACTION_TYPE_OPTIONS: SelectOption<TransactionType>[] = [
  { value: 'CREDIT', label: 'Receita' },
  { value: 'DEBIT', label: 'Despesa' },
];

export const CATEGORY_TYPE_OPTIONS: SelectOption<CategoryType>[] = [
  { value: 'INCOME', label: 'Receita' },
  { value: 'EXPENSE', label: 'Despesa' },
];

// Labels for display
export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CHECKING: 'Conta Corrente',
  SAVINGS: 'Poupança',
  CASH: 'Caixa',
  INVESTMENT: 'Investimento',
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  CREDIT: 'Receita',
  DEBIT: 'Despesa',
};

export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  INCOME: 'Receita',
  EXPENSE: 'Despesa',
};
