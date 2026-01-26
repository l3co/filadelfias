import { api } from '../lib/api';

export interface ExpenseRequest {
    id: string;
    member_id: string;
    member_name?: string;
    amount: number;
    category: string;
    description: string;
    expense_date: string;
    receipt_url?: string;
    notes?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    created_at: string;
    approved_by?: string;
    approved_at?: string;
    rejection_reason?: string;
    transaction_id?: string;
}

export interface CreateExpenseRequest {
    amount: number;
    category: string;
    description: string;
    expense_date: string;
    receipt_url?: string;
    notes?: string;
}

export interface ApproveExpenseRequest {
    status: 'APPROVED' | 'REJECTED';
    rejection_reason?: string;
}

export const expenseService = {
    async submitExpense(tenantId: string, data: CreateExpenseRequest): Promise<ExpenseRequest> {
        const response = await api.post<ExpenseRequest>(`/expense/requests?tenant_id=${tenantId}`, data);
        return response.data;
    },

    async getMyExpenses(tenantId: string): Promise<ExpenseRequest[]> {
        const response = await api.get<ExpenseRequest[]>(`/expense/requests/my?tenant_id=${tenantId}`);
        return response.data;
    },

    async getPendingExpenses(tenantId: string): Promise<ExpenseRequest[]> {
        const response = await api.get<ExpenseRequest[]>(`/expense/requests/pending?tenant_id=${tenantId}`);
        return response.data;
    },

    async approveExpense(tenantId: string, recordId: string, data: ApproveExpenseRequest): Promise<ExpenseRequest> {
        const response = await api.post<ExpenseRequest>(
            `/expense/requests/${recordId}/approve?tenant_id=${tenantId}`,
            data
        );
        return response.data;
    },

    async deleteExpense(tenantId: string, recordId: string): Promise<void> {
        await api.delete(`/expense/requests/${recordId}?tenant_id=${tenantId}`);
    },
};
