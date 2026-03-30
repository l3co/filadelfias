import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth";
import { resetPasswordSchema, type ResetPasswordInput } from "@/types/auth";

export function ResetPasswordScreen() {
  const [searchParams] = useSearchParams();
  const tokenFromQuery = searchParams.get("token") || "";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: tokenFromQuery,
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      await authService.resetPassword(data.token, data.password);
      toast.success("Senha redefinida com sucesso");
    } catch {
      toast.error("Nao foi possivel redefinir a senha");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-bold">Redefinir senha</h1>
        <p className="mb-8 text-sm text-muted-foreground">Informe o token e a nova senha</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Token</label>
            <input
              type="text"
              {...register("token")}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.token ? <p className="mt-1 text-xs text-destructive">{errors.token.message}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Nova senha</label>
            <input
              type="password"
              {...register("password")}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.password ? <p className="mt-1 text-xs text-destructive">{errors.password.message}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Confirmar senha</label>
            <input
              type="password"
              {...register("passwordConfirm")}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.passwordConfirm ? (
              <p className="mt-1 text-xs text-destructive">{errors.passwordConfirm.message}</p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Redefinindo..." : "Redefinir senha"}
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
