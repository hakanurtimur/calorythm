"use client";

import { useEffect, useRef } from "react";

export function PublicationFooterMotion() {
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const footer = anchorRef.current?.closest<HTMLElement>("[data-footer-reveal-root]");
    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    if (
      !footer ||
      prefersReducedMotion ||
      typeof window.IntersectionObserver !== "function"
    ) {
      return;
    }

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;

        footer.dataset.footerRevealed = "true";
        observer.disconnect();
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.12,
      },
    );

    observer.observe(footer);

    return () => observer.disconnect();
  }, []);

  return <span aria-hidden="true" data-footer-motion-anchor="" hidden ref={anchorRef} />;
}
