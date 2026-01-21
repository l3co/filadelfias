import { cn } from '../lib/utils';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6', className)}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#002333]">
          {title}
        </h1>
        {description && (
          <p className="text-gray-500 mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

interface PageHeaderWithIconProps extends PageHeaderProps {
  icon: LucideIcon;
  iconColor?: 'green' | 'purple' | 'orange' | 'blue' | 'red' | 'teal';
}

const iconColorClasses = {
  green: 'from-green-50 to-teal-50 text-green-600',
  purple: 'from-purple-50 to-purple-100 text-purple-600',
  orange: 'from-orange-50 to-orange-100 text-orange-600',
  blue: 'from-blue-50 to-blue-100 text-blue-600',
  red: 'from-red-50 to-red-100 text-red-600',
  teal: 'from-teal-50 to-teal-100 text-teal-600',
};

export function PageHeaderWithIcon({ 
  icon: Icon, 
  iconColor = 'green', 
  title, 
  description, 
  actions, 
  className 
}: PageHeaderWithIconProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4', className)}>
      <div className="flex items-center gap-4">
        <div className={cn('p-3 rounded-2xl bg-gradient-to-br', iconColorClasses[iconColor])}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#002333]">
            {title}
          </h1>
          {description && (
            <p className="text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
