"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PublicationNavigationItem } from "./publication-header";
import styles from "./publication-shell.module.css";

type PublicationMenuProps = Readonly<{
  items: readonly PublicationNavigationItem[];
}>;

export function PublicationMenu({ items }: PublicationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const header = rootRef.current?.closest("header");
    const trigger = triggerRef.current;
    const focusFrame = window.requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLAnchorElement>("a[href]")?.focus();
    });
    const keepFocusInside = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const links = [
        ...(menuRef.current?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? []),
      ];
      if (links.length === 0) return;

      const first = links[0];
      const last = links.at(-1);
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!menuRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    if (header) header.dataset.menuOpen = "true";
    document.addEventListener("keydown", keepFocusInside);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      if (header) header.dataset.menuOpen = "false";
      document.removeEventListener("keydown", keepFocusInside);
      trigger?.focus();
    };
  }, [isOpen]);

  return (
    <div className={styles.mobileMenu} data-open={isOpen} ref={rootRef}>
      <button
        aria-controls="publication-mobile-menu"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Menüyü kapat" : "Menüyü aç"}
        className={styles.menuButton}
        onClick={() => setIsOpen((open) => !open)}
        ref={triggerRef}
        style={{ minHeight: 44, minWidth: 44 }}
        type="button"
      >
        <span aria-hidden="true" className={styles.menuIcon} />
      </button>
      {isOpen ? (
        <div
          aria-label="CALORYTHM menüsü"
          aria-modal="true"
          className={styles.mobileNavigationSurface}
          role="dialog"
        >
          <p className={styles.mobileMenuKicker}>CALORYTHM / Menü</p>
          <nav
            aria-label="Mobil navigasyon"
            className={styles.mobileNavigation}
            id="publication-mobile-menu"
            ref={menuRef}
          >
            {items.map((item, index) => (
              <Link href={item.href} key={item.href} onClick={() => setIsOpen(false)}>
                <span aria-hidden="true">0{index + 1}</span>
                {item.label}
              </Link>
            ))}
            <Link href="/about#katki" onClick={() => setIsOpen(false)}>
              <span aria-hidden="true">04</span>
              Fikir gönder
            </Link>
          </nav>
          <p className={styles.mobileMenuNote}>
            Beslenme bilimi üzerine bağımsız dijital dergi.
          </p>
        </div>
      ) : null}
    </div>
  );
}
