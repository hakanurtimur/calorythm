import type { ReactNode } from "react";
import { orbitalPaths } from "./orbital-paths";
import styles from "./orbital.module.css";

type OrbitalLinkProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  unavailable?: boolean;
  variant?: "default" | "orbit";
};

function LinkContent({
  children,
  variant,
}: Pick<OrbitalLinkProps, "children" | "variant">) {
  return (
    <>
      {variant === "orbit" ? (
        <svg
          aria-hidden="true"
          className={styles.linkOrbit}
          data-link-orbit=""
          fill="none"
          focusable="false"
          preserveAspectRatio="none"
          viewBox="0 0 240 60"
        >
          <g transform="translate(5 0) scale(2.3 .55)">
            {orbitalPaths.map((path) => (
              <path
                d={path.d}
                data-link-orbit-path={path.id}
                key={path.id}
                pathLength="1"
                stroke={path.color}
              />
            ))}
          </g>
        </svg>
      ) : null}
      <span className={styles.linkLabel}>{children}</span>
      <span aria-hidden="true" className={styles.linkTerminal}>
        <span>→</span>
      </span>
    </>
  );
}

export function OrbitalLink({
  children,
  className,
  href,
  unavailable = false,
  variant = "default",
}: OrbitalLinkProps) {
  const classes = className ? `${styles.orbitalLink} ${className}` : styles.orbitalLink;

  if (unavailable || !href) {
    return (
      <span
        aria-disabled="true"
        className={classes}
        data-unavailable="true"
        data-variant={variant}
      >
        <LinkContent variant={variant}>{children}</LinkContent>
      </span>
    );
  }

  return (
    <a className={classes} data-variant={variant} href={href}>
      <LinkContent variant={variant}>{children}</LinkContent>
    </a>
  );
}
