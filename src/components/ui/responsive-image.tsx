import Image from "next/image";
import { cn } from "@/lib/utils/cn";

interface ResponsiveImageProps {
  src: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}

export function ResponsiveImage({
  src,
  alt = "",
  className,
  priority = false,
  sizes = "(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw",
  fill = false,
  width,
  height,
}: ResponsiveImageProps) {
  if (src.endsWith(".svg")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={className} />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={cn(className)}
      priority={priority}
      sizes={sizes}
      fill={fill}
      width={fill ? undefined : width ?? 800}
      height={fill ? undefined : height ?? 600}
    />
  );
}
