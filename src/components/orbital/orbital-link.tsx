import type { ReactNode } from "react";
import styles from "./orbital.module.css";

type OrbitalLinkProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  unavailable?: boolean;
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
}: OrbitalLinkProps) {
  const classes = className ? `${styles.orbitalLink} ${className}` : styles.orbitalLink;

  if (unavailable || !href) {
    return (
      <span aria-disabled="true" className={classes} data-unavailable="true">
        <LinkContent>{children}</LinkContent>
      </span>
    );
  }

  return (
    <a className={classes} href={href}>
      <LinkContent>{children}</LinkContent>
    </a>
  );
}
