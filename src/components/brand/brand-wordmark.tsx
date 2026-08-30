import Image from "next/image";

type BrandWordmarkProps = {
  alt?: string;
  className?: string;
  priority?: boolean;
  variant?: "inverse" | "primary";
};

export function BrandWordmark({
  alt = "",
  className,
  priority = false,
  variant = "primary",
}: BrandWordmarkProps) {
  return (
    <Image
      alt={alt}
      className={className}
      data-brand-wordmark={variant}
      height={82}
      priority={priority}
      src={`/brand/calorythm-wordmark-${variant}.svg`}
      unoptimized
      width={794}
    />
  );
}
