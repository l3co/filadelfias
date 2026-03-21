import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  fallbackSrc?: string;
}

export function LazyImage({
  src,
  alt,
  className,
  fallbackSrc,
  ...props
}: LazyImageProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!imgRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCurrentSrc(src);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' },
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [src]);

  return (
    <img
      {...props}
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (fallbackSrc && currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
          return;
        }
      }}
      className={cn(
        'transition-opacity duration-300',
        currentSrc ? 'opacity-100' : 'opacity-0',
        className,
      )}
    />
  );
}
