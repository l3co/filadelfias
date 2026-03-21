import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="alert"
      className="fixed inset-x-0 top-0 z-[70] border-b border-amber-700 bg-amber-600 px-4 py-2 text-white shadow-lg"
    >
      <div className="flex items-center justify-center gap-2 text-center text-sm font-medium">
        <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Você está offline. Alguns dados podem ficar limitados até a conexão voltar.</span>
      </div>
    </div>
  );
}
