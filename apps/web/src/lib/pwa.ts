import { toast } from 'sonner';
import { Workbox } from 'workbox-window';

let isRegistered = false;

export async function registerServiceWorker() {
  if (
    typeof window === 'undefined' ||
    isRegistered ||
    !('serviceWorker' in navigator)
  ) {
    return;
  }

  isRegistered = true;

  try {
    const workbox = new Workbox('/sw.js');

    workbox.addEventListener('waiting', () => {
      toast.message('Nova versão disponível', {
        action: {
          label: 'Atualizar',
          onClick: async () => {
            await workbox.messageSkipWaiting();
          },
        },
        description: 'Atualize para aplicar as melhorias mais recentes do app.',
        duration: 10000,
      });
    });

    workbox.addEventListener('controlling', () => {
      window.location.reload();
    });

    workbox.addEventListener('activated', (event) => {
      if (!event.isUpdate) {
        toast.success('Modo offline pronto', {
          description: 'Os recursos essenciais do app já podem ser usados sem conexão.',
        });
      }
    });

    await workbox.register({ immediate: true });
  } catch (error) {
    console.warn('Falha ao registrar service worker.', error);
  }
}
