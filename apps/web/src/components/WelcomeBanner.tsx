import { cn } from '../lib/utils';

interface WelcomeBannerProps {
  userName: string;
  churchName?: string;
  message?: string;
  className?: string;
}

export function WelcomeBanner({ userName, churchName, message, className }: WelcomeBannerProps) {
  const firstName = userName?.split(' ')[0] || 'Visitante';
  
  return (
    <div className={cn('mb-8', className)}>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Olá, {firstName}! 👋
      </h1>
      <p className="mt-1 text-muted-foreground">
        {message || `Bem-vindo${churchName ? ` à ${churchName}` : ''}`}
      </p>
    </div>
  );
}
