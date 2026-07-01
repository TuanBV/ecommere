import { mediaVariantUrl } from '@/lib/api';

type ResponsiveImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
};

export function ResponsiveImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  priority = false,
  loading,
  fetchPriority
}: ResponsiveImageProps) {
  const imageFetchPriority = fetchPriority ?? (priority ? 'high' : 'auto');
  const imageLoading = loading ?? (priority ? 'eager' : 'lazy');

  return (
    <picture className={className}>
      <source media="(max-width: 640px)" srcSet={mediaVariantUrl(src, 'mobile')} />
      <source media="(max-width: 1024px)" srcSet={mediaVariantUrl(src, 'tablet')} />
      <img
        src={mediaVariantUrl(src, 'pc')}
        alt={alt}
        className={imgClassName}
        loading={imageLoading}
        decoding="async"
        fetchPriority={imageFetchPriority}
        {...({ fetchpriority: imageFetchPriority } as Record<string, string>)}
      />
    </picture>
  );
}
