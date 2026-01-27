import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  strongPasswordSchema,
} from '../auth';

describe('loginSchema', () => {
  it('should accept valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'invalid-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email inválido');
    }
  });

  it('should reject empty email', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Senha é obrigatória');
    }
  });

  it('should reject missing fields', () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('should accept valid email', () => {
    const result = forgotPasswordSchema.safeParse({
      email: 'user@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = forgotPasswordSchema.safeParse({
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email inválido');
    }
  });

  it('should reject email without domain', () => {
    const result = forgotPasswordSchema.safeParse({
      email: 'user@',
    });
    expect(result.success).toBe(false);
  });
});

describe('strongPasswordSchema', () => {
  it('should accept valid strong password', () => {
    const result = strongPasswordSchema.safeParse('StrongPass1!');
    expect(result.success).toBe(true);
  });

  it('should reject password shorter than 8 characters', () => {
    const result = strongPasswordSchema.safeParse('Abc1!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Senha deve ter pelo menos 8 caracteres');
    }
  });

  it('should reject password without uppercase letter', () => {
    const result = strongPasswordSchema.safeParse('lowercase1!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Deve conter pelo menos uma letra maiúscula');
    }
  });

  it('should reject password without lowercase letter', () => {
    const result = strongPasswordSchema.safeParse('UPPERCASE1!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Deve conter pelo menos uma letra minúscula');
    }
  });

  it('should reject password without number', () => {
    const result = strongPasswordSchema.safeParse('NoNumbers!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Deve conter pelo menos um número');
    }
  });

  it('should reject password without special character', () => {
    const result = strongPasswordSchema.safeParse('NoSpecial1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Deve conter pelo menos um caractere especial');
    }
  });

  it('should accept password with all required characters', () => {
    const validPasswords = [
      'Password1!',
      'MyP@ssw0rd',
      'Secure#123',
      'Test1234$',
      'Complex^1a',
    ];

    validPasswords.forEach((password) => {
      const result = strongPasswordSchema.safeParse(password);
      expect(result.success).toBe(true);
    });
  });
});

describe('resetPasswordSchema', () => {
  it('should accept valid password reset data', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'NewPass123!',
      confirmPassword: 'NewPass123!',
    });
    expect(result.success).toBe(true);
  });

  it('should reject mismatched passwords', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'NewPass123!',
      confirmPassword: 'Different123!',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.issues.find((i) => i.path.includes('confirmPassword'));
      expect(confirmError?.message).toBe('Senhas não conferem');
    }
  });

  it('should reject weak password', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'weak',
      confirmPassword: 'weak',
    });
    expect(result.success).toBe(false);
  });

  it('should validate password strength before checking match', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'short',
      confirmPassword: 'short',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });
});

describe('changePasswordSchema', () => {
  it('should accept valid password change data', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'OldPassword123',
      newPassword: 'NewPass123!',
      confirmPassword: 'NewPass123!',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty current password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: '',
      newPassword: 'NewPass123!',
      confirmPassword: 'NewPass123!',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const currentError = result.error.issues.find((i) => i.path.includes('currentPassword'));
      expect(currentError?.message).toBe('Senha atual é obrigatória');
    }
  });

  it('should reject weak new password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'OldPassword123',
      newPassword: 'weak',
      confirmPassword: 'weak',
    });
    expect(result.success).toBe(false);
  });

  it('should reject mismatched new passwords', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'OldPassword123',
      newPassword: 'NewPass123!',
      confirmPassword: 'Different123!',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.issues.find((i) => i.path.includes('confirmPassword'));
      expect(confirmError?.message).toBe('Senhas não conferem');
    }
  });

  it('should allow any current password (validation happens on server)', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'any-password-here',
      newPassword: 'NewPass123!',
      confirmPassword: 'NewPass123!',
    });
    expect(result.success).toBe(true);
  });
});
