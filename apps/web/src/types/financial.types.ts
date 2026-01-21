/**
 * Financial Types
 */

export type AccountType = 'CHECKING' | 'SAVINGS' | 'CASH' | 'INVESTMENT';

export type TransactionType = 'CREDIT' | 'DEBIT';

export type CategoryType = 'INCOME' | 'EXPENSE';

export interface FinancialAccount {
  id: string;
  tenant_id: string;
  name: string;
  type: AccountType;
  balance: number;
}

export interface TransactionCategory {
  id: string;
  tenant_id: string;
  name: string;
  type: CategoryType;
  parent_id?: string;
}

export interface Transaction {
  id: string;
  tenant_id: string;
  account_id: string;
  category_id: string;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
  category?: TransactionCategory;
  account?: FinancialAccount;
}

export interface CreateAccountDTO {
  name: string;
  type: AccountType;
  balance: number;
}

export interface CreateTransactionDTO {
  account_id: string;
  category_id: string;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
}

export interface CreateCategoryDTO {
  name: string;
  type: CategoryType;
}
