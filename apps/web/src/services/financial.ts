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

export interface FinancialAsset {
    id: string;
    tenant_id: string;
    name: string;
    category: string;
    location?: string;
    condition: string;
    quantity: number;
    purchase_value?: number;
    acquired_date?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface MonthlyReportBreakdownItem {
    category: string;
    amount: number;
    count: number;
}

export interface MonthlyReport {
    month: number;
    year: number;
    total_income: number;
    total_expenses: number;
    net_balance: number;
    transaction_count: number;
    income_breakdown: MonthlyReportBreakdownItem[];
    expense_breakdown: MonthlyReportBreakdownItem[];
    accounts: FinancialAccount[];
    pending_tithes: number;
    pending_expenses: number;
}

export interface CreateAccountDTO {
    name: string;
    type: string;
    balance: number;
}

export interface CreateTransactionDTO {
    account_id: string;
    category_id: string;
    member_id?: string;
    amount: number;
    type: string;
    description: string;
    date: string;
}

export interface CreateAssetDTO {
    name: string;
    category: string;
    location?: string;
    condition: string;
    quantity: number;
    purchase_value?: number;
    acquired_date?: string;
    notes?: string;
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

    listTransactions: async (
        tenantId: string, 
        options?: { month?: number; year?: number; page?: number; pageSize?: number }
    ) => {
        const { data } = await api.get<Transaction[]>('/financial/transactions', {
            params: { 
                tenant_id: tenantId,
                month: options?.month,
                year: options?.year,
                page: options?.page || 1,
                page_size: options?.pageSize || 10
            }
        });
        return data;
    },

    createTransaction: async (tenantId: string, transaction: CreateTransactionDTO) => {
        const { data } = await api.post<Transaction>('/financial/transactions', transaction, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    getMonthlyReport: async (tenantId: string, options?: { month?: number; year?: number }) => {
        const { data } = await api.get<MonthlyReport>('/financial/reports/monthly', {
            params: {
                tenant_id: tenantId,
                month: options?.month,
                year: options?.year,
            }
        });
        return data;
    },

    listAssets: async (tenantId: string) => {
        const { data } = await api.get<FinancialAsset[]>('/financial/assets', {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    createAsset: async (tenantId: string, asset: CreateAssetDTO) => {
        const { data } = await api.post<FinancialAsset>('/financial/assets', asset, {
            params: { tenant_id: tenantId }
        });
        return data;
    },

    deleteAsset: async (tenantId: string, assetId: string) => {
        await api.delete(`/financial/assets/${assetId}`, {
            params: { tenant_id: tenantId }
        });
    },

    downloadCsvTemplate: async (tenantId: string) => {
        const response = await api.get('/financial/transactions/csv/template', {
            params: { tenant_id: tenantId },
            responseType: 'blob'
        });
        
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transacoes_template_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },

    importCsv: async (tenantId: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const { data } = await api.post<{
            success: boolean;
            imported: number;
            errors: Array<{ row: number; error: string }>;
            message: string;
        }>('/financial/transactions/csv/import', formData, {
            params: { tenant_id: tenantId },
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data;
    }
};
