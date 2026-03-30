import { z } from "zod";

export interface UserChurch {
  id: string;
  name: string;
  role: string;
  office: string;
}

export interface MembershipTenant {
  id: string;
  name: string;
  slug?: string;
}

export interface UserMembership {
  id: string;
  role: string;
  status?: string;
  tenant?: MembershipTenant;
}

export interface User {
  id: string;
  name: string;
  email: string;
  churches: UserChurch[];
  memberships?: UserMembership[];
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export const loginSchema = z.object({
  email: z.string().email("E-mail invalido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nome muito curto"),
    email: z.string().email("E-mail invalido"),
    password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Senhas nao coincidem",
    path: ["passwordConfirm"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail invalido"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token obrigatorio"),
    password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Senhas nao coincidem",
    path: ["passwordConfirm"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
