import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '../ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

const DISMISS_KEY = 'pwa-install-dismissed';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const wasDismissed = window.sessionStorage.getItem(DISMISS_KEY) === 'true';
    if (wasDismissed) {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      window.setTimeout(() => {
        setIsVisible(true);
      }, 5000);
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      setIsVisible(false);
      window.sessionStorage.removeItem(DISMISS_KEY);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const dismiss = () => {
    setIsVisible(false);
    window.sessionStorage.setItem(DISMISS_KEY, 'true');
  };

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }

    setIsVisible(false);
  };

  if (!deferredPrompt || !isVisible) {
    return null;
  }

  return (
    <aside className="fixed inset-x-4 bottom-4 z-[70] rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl md:left-auto md:right-4 md:w-96">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-green-50 p-2">
          <Download className="h-5 w-5 text-green-600" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-[#002333]">Instalar Filadélfias</h2>
          <p className="mt-1 text-sm text-gray-600">
            Adicione o app à tela inicial para abrir mais rápido e continuar com recursos essenciais offline.
          </p>

          <div className="mt-3 flex gap-2">
            <Button className="gap-2" onClick={handleInstall} size="sm" type="button">
              <Download className="h-4 w-4" aria-hidden="true" />
              Instalar
            </Button>
            <Button onClick={dismiss} size="sm" type="button" variant="outline">
              Agora não
            </Button>
          </div>
        </div>

        <button
          aria-label="Fechar sugestão de instalação"
          className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          onClick={dismiss}
          type="button"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
