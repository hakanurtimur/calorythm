"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PublicationNavigationItem } from "./publication-header";
import styles from "./publication-shell.module.css";

type PublicationMenuProps = Readonly<{
  items: readonly PublicationNavigationItem[];
}>;

export function PublicationMenu({ items }: PublicationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div className={styles.mobileMenu}>
      <button
        aria-controls="publication-mobile-menu"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Menüyü kapat" : "Menüyü aç"}
        className={styles.menuButton}
        onClick={() => setIsOpen((open) => !open)}
        style={{ minHeight: 44, minWidth: 44 }}
        type="button"
      >
        <span aria-hidden="true" className={styles.menuIcon} />
      </button>
      {isOpen ? (
        <nav
          aria-label="Mobil navigasyon"
          className={styles.mobileNavigation}
          id="publication-mobile-menu"
        >
          {items.map((item) => (
            <Link href={item.href} key={item.href} onClick={() => setIsOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/about#katki" onClick={() => setIsOpen(false)}>
            Yazar olarak katıl
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
