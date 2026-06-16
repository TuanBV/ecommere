import { mediaVariantUrl } from '@/lib/api';

type ResponsiveImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
};

export function ResponsiveImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  priority = false
}: ResponsiveImageProps) {
  return (
    <picture className={className}>
      <source media="(max-width: 640px)" srcSet={mediaVariantUrl(src, 'mobile')} />
      <source media="(max-width: 1024px)" srcSet={mediaVariantUrl(src, 'tablet')} />
      <img
        src={mediaVariantUrl(src, 'pc')}
        alt={alt}
        className={imgClassName}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
      />
    </picture>
  );
}
