import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface HomeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow' | 'indigo' | 'pink' | 'emerald';
  className?: string;
}

const colorVariants = {
  blue: {
    icon: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30',
    border: 'group-hover:border-blue-200',
    accent: 'text-blue-600',
  },
  green: {
    icon: 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30',
    border: 'group-hover:border-green-200',
    accent: 'text-green-600',
  },
  emerald: {
    icon: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30',
    border: 'group-hover:border-emerald-200',
    accent: 'text-emerald-600',
  },
  purple: {
    icon: 'bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/30',
    border: 'group-hover:border-purple-200',
    accent: 'text-purple-600',
  },
  orange: {
    icon: 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30',
    border: 'group-hover:border-orange-200',
    accent: 'text-orange-600',
  },
  red: {
    icon: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30',
    border: 'group-hover:border-rose-200',
    accent: 'text-rose-600',
  },
  yellow: {
    icon: 'bg-gradient-to-br from-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-500/30',
    border: 'group-hover:border-yellow-200',
    accent: 'text-yellow-600',
  },
  indigo: {
    icon: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30',
    border: 'group-hover:border-indigo-200',
    accent: 'text-indigo-600',
  },
  pink: {
    icon: 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/30',
    border: 'group-hover:border-pink-200',
    accent: 'text-pink-600',
  },
};

export function HomeCard({ icon: Icon, title, description, href, color = 'blue', className }: HomeCardProps) {
  const variant = colorVariants[color];
  
  return (
    <Link
      to={href}
      className={cn(
        'group relative block rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300',
        'hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1',
        variant.border,
        className
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative">
        <div className={cn(
          'inline-flex rounded-xl p-3 transition-transform duration-300 group-hover:scale-110',
          variant.icon
        )}>
          <Icon className="h-6 w-6" />
        </div>
        
        <h3 className="mt-4 font-semibold text-lg text-slate-900 group-hover:text-slate-800 transition-colors">
          {title}
        </h3>
        
        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
          {description}
        </p>
        
        {/* Arrow indicator */}
        <div className={cn(
          'mt-4 flex items-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1',
          variant.accent
        )}>
          Acessar
          <ChevronRight className="h-4 w-4 ml-1" />
        </div>
      </div>
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
