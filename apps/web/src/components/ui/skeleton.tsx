import { cn } from '../../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

// Common skeleton variants
export function SkeletonText({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn('h-4 w-full', className)} {...props} />;
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      <Skeleton className="h-32 w-full rounded-lg" />
      <SkeletonText className="w-3/4" />
      <SkeletonText className="w-1/2" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, className, ...props }: SkeletonProps & { rows?: number }) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn('h-10 w-10 rounded-full', className)} {...props} />;
}
