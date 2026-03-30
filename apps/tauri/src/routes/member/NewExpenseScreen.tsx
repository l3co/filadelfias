import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCreateExpense } from "@/hooks/useExpenses";
import type { ExpenseCategory } from "@/types/financial";

const categories: Array<{ value: ExpenseCategory; label: string }> = [
  { value: "material", label: "Material" },
  { value: "cleaning", label: "Limpeza" },
  { value: "transport", label: "Transporte" },
  { value: "food", label: "Alimentacao" },
  { value: "maintenance", label: "Manutencao" },
  { value: "bills", label: "Contas" },
  { value: "other", label: "Outros" },
];

const schema = z.object({
  amount: z
    .string()
    .min(1, "Informe o valor")
    .refine((value) => !Number.isNaN(Number(value.replace(",", "."))) && Number(value.replace(",", ".")) > 0, "Valor invalido"),
  category: z.enum(["material", "cleaning", "transport", "food", "maintenance", "bills", "other"]),
  description: z.string().min(3, "Descreva a despesa"),
  expense_date: z.string().min(1, "Informe a data"),
  notes: z.string().optional(),
  receipt_url: z.string().url("URL invalida").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export function NewExpenseScreen() {
  const navigate = useNavigate();
  const createExpense = useCreateExpense();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "other",
      expense_date: new Date().toISOString().slice(0, 10),
      notes: "",
      receipt_url: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createExpense.mutateAsync({
        amount: Number(data.amount.replace(",", ".")),
        category: data.category,
        description: data.description,
        expense_date: data.expense_date,
        notes: data.notes || undefined,
        receipt_url: data.receipt_url || undefined,
      });
      toast.success("Solicitacao enviada");
      navigate("/member/expenses");
    } catch {
      toast.error("Erro ao enviar solicitacao");
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">Nova solicitacao de reembolso</h1>
        <p className="text-sm text-muted-foreground">Preencha os dados da despesa para avaliacao da tesouraria.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border bg-card p-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Valor</label>
          <input
            {...register("amount")}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="0,00"
            inputMode="decimal"
          />
          {errors.amount ? <p className="mt-1 text-xs text-destructive">{errors.amount.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Categoria</label>
          <select
            {...register("category")}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Descricao</label>
          <textarea
            {...register("description")}
            rows={4}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Descreva a despesa"
          />
          {errors.description ? <p className="mt-1 text-xs text-destructive">{errors.description.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Data da despesa</label>
          <input
            type="date"
            {...register("expense_date")}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.expense_date ? <p className="mt-1 text-xs text-destructive">{errors.expense_date.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">URL do comprovante</label>
          <input
            {...register("receipt_url")}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="https://..."
          />
          {errors.receipt_url ? <p className="mt-1 text-xs text-destructive">{errors.receipt_url.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Observacoes</label>
          <textarea
            {...register("notes")}
            rows={3}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Opcional"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting || createExpense.isPending}>
          {isSubmitting || createExpense.isPending ? "Enviando..." : "Enviar solicitacao"}
        </Button>
      </form>
    </div>
  );
}
