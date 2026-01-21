import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import type { LucideIcon } from 'lucide-react';

interface HomeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow' | 'indigo' | 'pink';
  className?: string;
}

const colorVariants = {
  blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
  green: 'bg-green-50 text-green-600 group-hover:bg-green-100',
  purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
  orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-100',
  red: 'bg-red-50 text-red-600 group-hover:bg-red-100',
  yellow: 'bg-yellow-50 text-yellow-600 group-hover:bg-yellow-100',
  indigo: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100',
  pink: 'bg-pink-50 text-pink-600 group-hover:bg-pink-100',
};

export function HomeCard({ icon: Icon, title, description, href, color = 'blue', className }: HomeCardProps) {
  return (
    <Link
      to={href}
      className={cn(
        'group block rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20',
        className
      )}
    >
      <div className={cn('inline-flex rounded-lg p-3 transition-colors', colorVariants[color])}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-semibold text-lg">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}

interface HomeCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function HomeCardGrid({ children, columns = 3, className }: HomeCardGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {children}
    </div>
  );
}
