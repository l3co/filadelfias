import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/types/auth";

export function ForgotPasswordScreen() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await authService.forgotPassword(data.email);
      toast.success("Se o e-mail existir, enviaremos as instrucoes");
    } catch {
      toast.error("Nao foi possivel processar a solicitacao");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-bold">Recuperar senha</h1>
        <p className="mb-8 text-sm text-muted-foreground">Informe seu e-mail para receber o link de redefinicao</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">E-mail</label>
            <input
              type="email"
              {...register("email")}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.email ? <p className="mt-1 text-xs text-destructive">{errors.email.message}</p> : null}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar instrucoes"}
          </Button>
        </form>

        <div className="mt-4 text-sm">
          <Link to="/auth/login" className="text-primary hover:underline">
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  );
}
