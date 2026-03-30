import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCreatePrayer } from "@/hooks/usePrayer";

const categories = ["Saude", "Familia", "Trabalho", "Espiritual", "Financeiro", "Relacionamentos", "Outros"];

const schema = z.object({
  title: z.string().min(3, "Titulo muito curto"),
  description: z.string().min(10, "Descreva melhor o pedido"),
  category: z.string().min(1, "Selecione uma categoria"),
  is_anonymous: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export function NewPrayerScreen() {
  const navigate = useNavigate();
  const createPrayer = useCreatePrayer();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      is_anonymous: false,
      category: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createPrayer.mutateAsync(data);
      toast.success("Pedido enviado");
      navigate("/member/prayer");
    } catch {
      toast.error("Erro ao enviar pedido");
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">Novo pedido de oracao</h1>
        <p className="text-sm text-muted-foreground">Compartilhe com a igreja o motivo pelo qual deseja oracao.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border bg-card p-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Titulo</label>
          <input
            {...register("title")}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ex: Saude da minha mae"
          />
          {errors.title ? <p className="mt-1 text-xs text-destructive">{errors.title.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Descricao</label>
          <textarea
            {...register("description")}
            rows={5}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Compartilhe mais detalhes sobre o pedido..."
          />
          {errors.description ? <p className="mt-1 text-xs text-destructive">{errors.description.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Categoria</label>
          <select
            {...register("category")}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Selecione...</option>
            {categories.map((category) => (
              <option key={category} value={category.toLowerCase()}>
                {category}
              </option>
            ))}
          </select>
          {errors.category ? <p className="mt-1 text-xs text-destructive">{errors.category.message}</p> : null}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("is_anonymous")} className="rounded" />
          Enviar anonimamente
        </label>

        <Button type="submit" className="w-full" disabled={isSubmitting || createPrayer.isPending}>
          {isSubmitting || createPrayer.isPending ? "Enviando..." : "Enviar pedido"}
        </Button>
      </form>
    </div>
  );
}
