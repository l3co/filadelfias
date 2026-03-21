import { toast } from 'sonner';
import { registerSW } from 'virtual:pwa-register';

let isRegistered = false;

export function registerServiceWorker() {
  if (typeof window === 'undefined' || isRegistered) {
    return;
  }

  isRegistered = true;

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      toast.message('Nova versão disponível', {
        action: {
          label: 'Atualizar',
          onClick: () => updateSW(true),
        },
        description: 'Atualize para aplicar as melhorias mais recentes do app.',
        duration: 10000,
      });
    },
    onOfflineReady() {
      toast.success('Modo offline pronto', {
        description: 'Os recursos essenciais do app já podem ser usados sem conexão.',
      });
    },
    onRegisterError(error: unknown) {
      console.error('Falha ao registrar service worker', error);
    },
  });
}
