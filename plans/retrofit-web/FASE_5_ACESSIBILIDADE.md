# Fase 5: Acessibilidade - WCAG 2.1 Level AA Compliance

> **Duração:** 2-3 semanas  
> **Prioridade:** 🟡 Médio  
> **Dependências:** Fase 3 (Componentes bem estruturados)

---

## 🎯 Objetivos

1. Atingir WCAG 2.1 Level AA compliance
2. Implementar ARIA labels e roles corretos
3. Garantir keyboard navigation completa
4. Implementar focus management adequado
5. Validar color contrast ratios
6. Testar com screen readers

---

## 📋 Tarefas Detalhadas

### 5.1 Audit de Acessibilidade

**Ferramentas:**
- Lighthouse (Chrome DevTools)
- axe DevTools
- WAVE Extension
- NVDA/JAWS screen readers

#### 5.1.1 Executar Lighthouse

```bash
# Via CLI
npm install -g lighthouse
lighthouse http://localhost:5173 --view --output=html --output-path=./lighthouse-report.html

# Via Chrome DevTools
# 1. Abrir DevTools
# 2. Tab "Lighthouse"
# 3. Selecionar "Accessibility"
# 4. "Generate report"
```

#### 5.1.2 Instalar axe-core para Testes Automatizados

```bash
npm install --save-dev @axe-core/react jest-axe
```

```typescript
// apps/web/src/test/setup.ts
import 'jest-axe/extend-expect';
```

```typescript
// apps/web/src/components/ui/__tests__/button.a11y.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../button';

expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(
      <Button onClick={() => {}}>Click me</Button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('disabled button has correct aria-disabled', async () => {
    const { container } = render(
      <Button disabled onClick={() => {}}>Disabled</Button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

### 5.2 ARIA Labels e Semantic HTML

**Problema Atual:**

```tsx
// ❌ Sem labels descritivos
<button onClick={handleDelete}>
  <Trash size={16} />
</button>

<div onClick={handleClick}>Card clickável</div>

<input type="text" placeholder="Buscar..." />
```

**Solução:**

```tsx
// ✅ Com ARIA labels e semantic HTML
<button 
  onClick={handleDelete}
  aria-label="Deletar membro"
  title="Deletar membro"
>
  <Trash size={16} aria-hidden="true" />
</button>

<button onClick={handleClick} className="card-button">
  Card clickável
</button>

<label htmlFor="search-input" className="sr-only">
  Buscar membros
</label>
<input 
  id="search-input"
  type="text" 
  placeholder="Buscar..."
  aria-label="Campo de busca de membros"
/>
```

#### 5.2.1 Screen Reader Only Class

```css
/* apps/web/src/index.css */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

#### 5.2.2 Refatorar Componentes com ARIA

```tsx
// apps/web/src/components/ui/button.tsx
import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'default', size = 'default', loading, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <>
            <span className="sr-only">Carregando</span>
            <div className="animate-spin mr-2" aria-hidden="true">⏳</div>
          </>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

```tsx
// apps/web/src/features/members/components/MemberCard.tsx
interface MemberCardProps {
  member: Member;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}

export function MemberCard({ member, onEdit, onDelete }: MemberCardProps) {
  return (
    <article 
      className="card"
      aria-labelledby={`member-${member.id}-name`}
    >
      <h3 id={`member-${member.id}-name`} className="font-semibold">
        {member.full_name}
      </h3>
      
      <p className="text-gray-600">
        <span className="sr-only">Email:</span>
        {member.email}
      </p>
      
      <div className="flex gap-2" role="group" aria-label="Ações do membro">
        <button
          onClick={() => onEdit(member)}
          aria-label={`Editar ${member.full_name}`}
          className="btn-icon"
        >
          <Edit size={16} aria-hidden="true" />
        </button>
        
        <button
          onClick={() => onDelete(member)}
          aria-label={`Deletar ${member.full_name}`}
          className="btn-icon text-red-600"
        >
          <Trash size={16} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
```

**Componentes a Atualizar:**
- [ ] Todos os botões icon-only
- [ ] Inputs sem labels
- [ ] Cards clicáveis
- [ ] Modals (aria-modal, role="dialog")
- [ ] Dropdowns (aria-expanded, aria-haspopup)
- [ ] Tabs (role="tablist", aria-selected)
- [ ] Alerts/Toasts (role="alert", aria-live)

---

### 5.3 Keyboard Navigation

**Objetivo:** Todo elemento interativo acessível via teclado

#### 5.3.1 Focus Visible Styles

```css
/* apps/web/src/index.css */
*:focus {
  outline: none;
}

*:focus-visible {
  outline: 2px solid #10b981; /* green-500 */
  outline-offset: 2px;
  border-radius: 4px;
}

/* Skip to main content link */
.skip-to-main {
  position: absolute;
  top: -40px;
  left: 0;
  background: #10b981;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  z-index: 100;
}

.skip-to-main:focus {
  top: 0;
}
```

#### 5.3.2 Skip to Content Link

```tsx
// apps/web/src/App.tsx
function App() {
  return (
    <>
      <a href="#main-content" className="skip-to-main">
        Pular para o conteúdo principal
      </a>
      
      <Suspense fallback={<LoadingOverlay message="Carregando..." />}>
        <Routes>
          {/* ... */}
        </Routes>
      </Suspense>
    </>
  );
}
```

```tsx
// apps/web/src/components/layout/DashboardLayout.tsx
export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside aria-label="Menu principal">
        {/* Sidebar */}
      </aside>
      
      <div className="flex-1 flex flex-col">
        <header>{/* Header */}</header>
        
        <main id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

#### 5.3.3 Keyboard Handlers

```tsx
// apps/web/src/components/ui/Modal.tsx
import { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    // Focus close button on open
    closeButtonRef.current?.focus();

    // Trap focus inside modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }

      if (e.key === 'Tab') {
        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-white rounded-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="modal-title" className="text-xl font-bold">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        
        <div>{children}</div>
      </div>
    </div>
  );
}
```

#### 5.3.4 Dropdown com Keyboard

```tsx
// apps/web/src/components/ui/Dropdown.tsx
import { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  trigger: React.ReactNode;
  items: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }>;
}

export function Dropdown({ trigger, items }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          setIsOpen(false);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          items[focusedIndex].onClick();
          setIsOpen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, items]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="dropdown-menu"
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          id="dropdown-menu"
          role="menu"
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg"
        >
          {items.map((item, index) => (
            <button
              key={index}
              role="menuitem"
              className={cn(
                'w-full text-left px-4 py-2 hover:bg-gray-100',
                index === focusedIndex && 'bg-gray-50'
              )}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              tabIndex={-1}
            >
              {item.icon && <span aria-hidden="true">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### 5.4 Color Contrast

**Objetivo:** Mínimo 4.5:1 para texto normal, 3:1 para texto grande

#### 5.4.1 Auditar Cores

```bash
# Ferramenta: WebAIM Contrast Checker
# https://webaim.org/resources/contrastchecker/

# Ou usar axe DevTools no navegador
```

**Problemas Comuns:**

```css
/* ❌ Contraste insuficiente */
.text-gray-400 { color: #9ca3af; } /* 2.8:1 em bg branco */
.text-green-300 { color: #6ee7b7; } /* 2.1:1 em bg branco */

/* ✅ Contraste adequado */
.text-gray-600 { color: #4b5563; } /* 4.6:1 em bg branco */
.text-green-700 { color: #047857; } /* 4.5:1 em bg branco */
```

#### 5.4.2 Atualizar Paleta

```typescript
// apps/web/tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        // ✅ Cores acessíveis para texto em bg branco
        'text-primary': '#0f172a',    // slate-900: 19:1
        'text-secondary': '#475569',  // slate-600: 7.2:1
        'text-muted': '#64748b',      // slate-500: 4.9:1
        
        // ✅ Cores de ação
        'action-primary': '#047857',  // green-700: 4.5:1
        'action-danger': '#b91c1c',   // red-700: 5.9:1
        'action-warning': '#c2410c',  // orange-700: 5.4:1
      }
    }
  }
};
```

#### 5.4.3 Refatorar Componentes

```tsx
// ❌ Antes
<p className="text-gray-400">Texto secundário</p>

// ✅ Depois
<p className="text-gray-600">Texto secundário</p>
```

---

### 5.5 Forms Acessíveis

**Objetivo:** Labels claros, validação acessível, error messages

```tsx
// apps/web/src/components/ui/FormField.tsx
import { useId } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, error, hint, required, children }: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-medium text-gray-900">
        {label}
        {required && <span aria-label="obrigatório"> *</span>}
      </label>
      
      {hint && (
        <p id={hintId} className="text-sm text-gray-600">
          {hint}
        </p>
      )}
      
      <div>
        {React.cloneElement(children as React.ReactElement, {
          id,
          'aria-describedby': [
            hint && hintId,
            error && errorId,
          ].filter(Boolean).join(' '),
          'aria-invalid': !!error,
          'aria-required': required,
        })}
      </div>
      
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
```

**Uso:**

```tsx
<FormField 
  label="Nome completo" 
  required
  error={errors.name?.message}
  hint="Digite o nome completo do membro"
>
  <input type="text" {...register('name')} />
</FormField>
```

---

### 5.6 Live Regions

**Objetivo:** Anunciar mudanças dinâmicas para screen readers

```tsx
// apps/web/src/components/ui/Toast.tsx
import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

export function Toast({ message, type = 'info', duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'fixed bottom-4 right-4 px-6 py-4 rounded-lg shadow-lg',
        type === 'success' && 'bg-green-600 text-white',
        type === 'error' && 'bg-red-600 text-white',
        type === 'info' && 'bg-blue-600 text-white'
      )}
    >
      <span className="sr-only">
        {type === 'success' && 'Sucesso: '}
        {type === 'error' && 'Erro: '}
        {type === 'info' && 'Informação: '}
      </span>
      {message}
    </div>
  );
}
```

```tsx
// apps/web/src/components/patterns/LoadingState.tsx
export function LoadingState({ message = 'Carregando...' }: { message?: string }) {
  return (
    <div 
      role="status" 
      aria-live="polite"
      className="flex flex-col items-center justify-center py-12"
    >
      <div className="animate-spin w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full" />
      <p className="mt-4 text-gray-600">{message}</p>
      <span className="sr-only">Carregando conteúdo</span>
    </div>
  );
}
```

---

### 5.7 Testing com Screen Readers

**Setup:**

- **Windows:** NVDA (free) ou JAWS
- **macOS:** VoiceOver (built-in)
- **Linux:** Orca

#### 5.7.1 Checklist de Testes

**Navegação:**
- [ ] Tab navega para todos os elementos interativos
- [ ] Shift+Tab navega para trás
- [ ] Enter/Space ativa botões e links
- [ ] Escape fecha modais
- [ ] Arrow keys navegam em dropdowns/selects

**Screen Reader:**
- [ ] Landmarks (main, nav, aside) anunciados
- [ ] Headings (h1-h6) na ordem correta
- [ ] Links descritivos (não "clique aqui")
- [ ] Buttons com labels claros
- [ ] Forms com labels e errors
- [ ] Live regions anunciam mudanças
- [ ] Images com alt text

**VoiceOver (macOS):**
```bash
# Ativar: Cmd + F5
# Navegar: Control + Option + Arrow keys
# Interagir: Control + Option + Space
```

**NVDA (Windows):**
```bash
# Ativar: Control + Alt + N
# Navegar: Arrow keys
# Interagir: Enter/Space
# Elements list: Insert + F7
```

---

## 🧪 Testes Automatizados de A11y

### 5.8 Jest + axe Integration

```typescript
// apps/web/src/test/a11y.test.tsx
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import App from '../App';

describe('Accessibility', () => {
  it('App should not have basic accessibility issues', async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 5.9 Playwright A11y Tests

```typescript
// apps/web/e2e/a11y.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage should not have accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('dashboard should not have accessibility violations', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/senha/i).fill('password');
    await page.getByRole('button', { name: /entrar/i }).click();
    
    await page.waitForURL(/\/admin/);
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

---

## 📊 Métricas de Sucesso

### WCAG 2.1 Level AA

| Princípio | Critério | Status |
|-----------|----------|--------|
| **Percebível** | Contraste 4.5:1 | ✅ |
| **Percebível** | Redimensionamento 200% | ✅ |
| **Operável** | Keyboard acessível | ✅ |
| **Operável** | Sem keyboard trap | ✅ |
| **Compreensível** | Labels claros | ✅ |
| **Compreensível** | Error identification | ✅ |
| **Robusto** | ARIA válido | ✅ |

### Lighthouse Score

| Categoria | Antes | Meta |
|-----------|-------|------|
| **Accessibility** | 70 | 95+ |
| **Best Practices** | 85 | 95+ |
| **SEO** | 75 | 90+ |

### axe Violations

- **Critical:** 0
- **Serious:** 0
- **Moderate:** <5
- **Minor:** <10

---

## 📦 Entregáveis

1. ✅ Todos os componentes com ARIA correto
2. ✅ Keyboard navigation completa
3. ✅ Focus management em modals
4. ✅ Color contrast WCAG AA
5. ✅ Forms acessíveis com error handling
6. ✅ Screen reader tested
7. ✅ Testes automatizados (axe + Playwright)
8. ✅ Documentação de a11y

---

## 🔄 Checklist

- [ ] Criar branch `retrofit/fase-5-acessibilidade`
- [ ] Lighthouse audit inicial
- [ ] Instalar jest-axe
- [ ] Adicionar ARIA labels em todos os botões
- [ ] Semantic HTML (article, nav, aside, main)
- [ ] Skip to content link
- [ ] Focus visible styles
- [ ] Modal com focus trap
- [ ] Dropdown com keyboard
- [ ] Forms com FormField acessível
- [ ] Color contrast fixes
- [ ] Live regions (Toast, Loading)
- [ ] Screen reader testing (VoiceOver)
- [ ] axe tests automatizados
- [ ] Playwright a11y tests
- [ ] Code review
- [ ] Merge para main

---

## 📅 Timeline

| Semana | Tarefas |
|--------|---------|
| **1** | Audit + ARIA labels + Semantic HTML |
| **2** | Keyboard navigation + Focus management |
| **3** | Color contrast + Testing + Documentation |

---

## 🎓 Recursos

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Checklist](https://webaim.org/standards/wcag/checklist)
- [MDN ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [A11y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)
