import Image from "next/image";

export function BrandLogo({
  size = 44,
  priority = false,
  className,
}: {
  size?: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      alt="XY"
      className={className}
      height={size}
      priority={priority}
      src="/brand/xy-logo.png"
      width={size}
    />
  );
}
