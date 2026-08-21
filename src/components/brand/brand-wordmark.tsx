import Image from "next/image";

type BrandWordmarkProps = {
  alt?: string;
  className?: string;
  priority?: boolean;
};

export function BrandWordmark({
  alt = "",
  className,
  priority = false,
}: BrandWordmarkProps) {
  return (
    <Image
      alt={alt}
      className={className}
      data-brand-wordmark="primary"
      height={82}
      priority={priority}
      src="/brand/calorythm-wordmark-primary.svg"
      unoptimized
      width={794}
    />
  );
}
