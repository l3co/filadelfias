import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth";
import { registerSchema, type RegisterInput } from "@/types/auth";
import { useAuthStore } from "@/stores/authStore";

export function RegisterScreen() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const { user, tokens } = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      await setTokens(tokens);
      useAuthStore.setState({
        user,
        isAuthenticated: true,
        currentChurchId: user.churches[0]?.id ?? null,
        isLoading: false,
      });

      toast.success("Conta criada com sucesso");
      navigate("/member");
    } catch {
      toast.error("Nao foi possivel criar a conta");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-bold">Criar conta</h1>
        <p className="mb-8 text-sm text-muted-foreground">Cadastre-se para acessar a area de membros</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nome</label>
            <input
              type="text"
              {...register("name")}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.name ? <p className="mt-1 text-xs text-destructive">{errors.name.message}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">E-mail</label>
            <input
              type="email"
              {...register("email")}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.email ? <p className="mt-1 text-xs text-destructive">{errors.email.message}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Senha</label>
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
            {isSubmitting ? "Criando..." : "Criar conta"}
          </Button>
        </form>

        <div className="mt-4 text-sm">
          <Link to="/auth/login" className="text-primary hover:underline">
            Ja tenho conta
          </Link>
        </div>
      </div>
    </div>
  );
}
