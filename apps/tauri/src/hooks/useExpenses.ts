import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { expenseService } from "@/services/expense";
import { useAuthStore } from "@/stores/authStore";
import type { Expense } from "@/types/financial";

export function useExpenses() {
  const churchId = useAuthStore((state) => state.currentChurchId);

  return useQuery({
    queryKey: ["expenses", churchId],
    queryFn: () => expenseService.getExpenses(churchId!),
    enabled: Boolean(churchId),
  });
}

export function useCreateExpense() {
  const churchId = useAuthStore((state) => state.currentChurchId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      amount: number;
      category: Expense["category"];
      description: string;
      expense_date: string;
      receipt_url?: string;
      notes?: string;
    }) => expenseService.createExpense(churchId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", churchId] });
    },
  });
}
