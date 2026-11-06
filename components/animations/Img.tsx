import Image, { type ImageProps } from 'next/image';
import { imageMeta } from '@/lib/blur';

type Props = Omit<ImageProps, 'src' | 'alt' | 'placeholder' | 'blurDataURL'> & { src: string; alt: string };

/** next/image with automatic blur placeholder (generated at build time by sharp). */
export default function Img({ src, alt, className, sizes = '100vw', fill = true, ...rest }: Props) {
  const m = imageMeta[src];
  const dims = fill ? {} : { width: m?.w ?? 1400, height: m?.h ?? 1000 };
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      {...dims}
      sizes={sizes}
      placeholder={m ? 'blur' : 'empty'}
      blurDataURL={m?.b}
      className={['object-cover', className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
}
