import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useProfile, useUpdateProfile } from "@/hooks/useMembers";

interface ProfileFormValues {
  name: string;
  phone: string;
}

export function ProfileScreen() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { register, handleSubmit, reset } = useForm<ProfileFormValues>({
    defaultValues: {
      name: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    reset({
      name: profile.name || "",
      phone: profile.phone || "",
    });
  }, [profile, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProfile.mutateAsync({
        name: values.name,
        phone: values.phone,
      });
      toast.success("Perfil atualizado");
    } catch {
      toast.error("Nao foi possivel atualizar o perfil");
    }
  });

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Carregando perfil...</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <div className="rounded-2xl border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Meu perfil</p>
        <h1 className="mt-2 text-2xl font-bold">{profile?.name || "Membro"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{profile?.email || "Sem e-mail cadastrado"}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-card p-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Nome</label>
          <input
            {...register("name")}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Seu nome"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Telefone</label>
          <input
            {...register("phone")}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="(00) 00000-0000"
          />
        </div>

        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? "Salvando..." : "Salvar alteracoes"}
        </Button>
      </form>
    </div>
  );
}
