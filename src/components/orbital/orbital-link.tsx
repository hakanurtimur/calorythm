import type { CSSProperties, ReactNode } from "react";
import styles from "./orbital.module.css";

type OrbitalLinkProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  unavailable?: boolean;
  variant?: "default" | "orbit";
};

function LinkContent({ children }: Pick<OrbitalLinkProps, "children">) {
  return (
    <>
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
  const orbitalAttributes =
    variant === "orbit"
      ? {
          "data-orbital-anchor": "hero-cta",
          style: { "--orbital-fill-progress": 0 } as CSSProperties,
        }
      : {};

  if (unavailable || !href) {
    return (
      <span
        aria-disabled="true"
        className={classes}
        data-unavailable="true"
        data-variant={variant}
        {...orbitalAttributes}
      >
        <LinkContent>{children}</LinkContent>
      </span>
    );
  }

  return (
    <a className={classes} data-variant={variant} href={href} {...orbitalAttributes}>
      <LinkContent>{children}</LinkContent>
    </a>
  );
}
