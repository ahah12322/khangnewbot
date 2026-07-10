import Image, { type StaticImageData } from 'next/image';

interface ThumbnailProps {
    src: StaticImageData | string;
    alt: string;
    width?: number;
    height?: number;
    quality?: number;
    className?: string;
    priority?: boolean;
}

export default function Thumbnail({ src, alt, width = 200, height = 200, quality = 75, className = '', priority = false }: Readonly<ThumbnailProps>) {
    return <Image src={src} alt={alt} width={width} height={height} quality={quality} className={className} priority={priority} />;
}

