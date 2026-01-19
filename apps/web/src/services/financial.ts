import { api } from '../lib/api';

export interface FinancialAccount {
    id: string;
    tenant_id: string;
    name: string;
    type: string;
    balance: number;
}

export interface TransactionCategory {
    id: string;
    tenant_id: string;
    name: string;
    type: string; // INCOME, EXPENSE
    parent_id?: string;
}

export interface Transaction {
    id: string;
    tenant_id: string;
    account_id: string;
    category_id: string;
    amount: number;
    type: string; // CREDIT, DEBIT
    description: string;
    date: string;
    category?: TransactionCategory;
    account?: FinancialAccount;
}

export interface CreateAccountDTO {
    name: string;
    type: string;
    balance: number;
}

export interface CreateTransactionDTO {
    account_id: string;
    category_id: string;
    amount: number;
    type: string;
    description: string;
    date: string;
}

export const financialService = {
    listAccounts: async (tenantId: string) => {
        const { data } = await api.get<FinancialAccount[]>('/financial/accounts', {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    createAccount: async (tenantId: string, account: CreateAccountDTO) => {
        const { data } = await api.post<FinancialAccount>('/financial/accounts', account, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    listCategories: async (tenantId: string) => {
        const { data } = await api.get<TransactionCategory[]>('/financial/categories', {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    createCategory: async (tenantId: string, category: { name: string, type: string }) => {
        const { data } = await api.post<TransactionCategory>('/financial/categories', category, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    listTransactions: async (tenantId: string) => {
        const { data } = await api.get<Transaction[]>('/financial/transactions', {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    createTransaction: async (tenantId: string, transaction: CreateTransactionDTO) => {
        const { data } = await api.post<Transaction>('/financial/transactions', transaction, {
            params: { tenant_id: tenantId }
        });
        return data;
    }
};
