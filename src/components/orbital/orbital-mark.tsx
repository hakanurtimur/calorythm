import { orbitalPaths } from "./orbital-paths";
import styles from "./orbital.module.css";

export type OrbitalMarkVariant = "signature" | "frame" | "atlas" | "portal" | "finale";
export type OrbitalMarkTone = "brand" | "ivory" | "ink";

type OrbitalMarkProps = {
  className?: string;
  tone?: OrbitalMarkTone;
  variant?: OrbitalMarkVariant;
};

export function OrbitalMark({
  className,
  tone = "brand",
  variant = "signature",
}: OrbitalMarkProps) {
  const classes = className ? `${styles.mark} ${className}` : styles.mark;

  return (
    <svg
      aria-hidden="true"
      className={classes}
      data-orbit-mark={variant}
      data-tone={tone}
      fill="none"
      focusable="false"
      viewBox="0 0 128 128"
    >
      <g transform="translate(8 8) scale(1.12)">
        {orbitalPaths.map((path) => (
          <path
            d={path.d}
            data-orbit-path={path.id}
            key={path.id}
            pathLength="1"
            stroke={tone === "brand" ? path.color : "currentColor"}
          />
        ))}
      </g>
    </svg>
  );
}
