import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCreateTithe } from "@/hooks/useTithes";

const schema = z.object({
  amount: z
    .string()
    .min(1, "Informe o valor")
    .refine((value) => !Number.isNaN(Number(value.replace(",", "."))) && Number(value.replace(",", ".")) > 0, "Valor invalido"),
  type: z.enum(["tithe", "offering"]),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function NewTitheScreen() {
  const navigate = useNavigate();
  const createTithe = useCreateTithe();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "tithe",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createTithe.mutateAsync({
        amount: Number(data.amount.replace(",", ".")),
        type: data.type === "tithe" ? "DIZIMO" : "OFERTA",
        notes: data.description || undefined,
      });
      toast.success("Registro enviado para aprovacao");
      navigate("/member/tithes");
    } catch {
      toast.error("Erro ao enviar registro");
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">Registrar dizimo ou oferta</h1>
        <p className="text-sm text-muted-foreground">Envie um novo registro para acompanhamento.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border bg-card p-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Tipo</label>
          <select
            {...register("type")}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="tithe">Dizimo</option>
            <option value="offering">Oferta</option>
          </select>
        </div>

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
          <label className="mb-1 block text-sm font-medium">Observacao</label>
          <textarea
            {...register("description")}
            rows={4}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Opcional"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting || createTithe.isPending}>
          {isSubmitting || createTithe.isPending ? "Enviando..." : "Enviar para aprovacao"}
        </Button>
      </form>
    </div>
  );
}
