"use client";

import { useEffect } from "react";

export type PublicationSurfaceTone = "dark" | "light";

export function resolvePublicationSurfaceTone(
  elements: readonly Element[],
  fallback: PublicationSurfaceTone,
  ignoredRoot?: Element,
): PublicationSurfaceTone {
  for (const element of elements) {
    if (ignoredRoot?.contains(element)) continue;

    const surface = element.closest<HTMLElement>("[data-header-tone]");
    const tone = surface?.dataset.headerTone;

    if (tone === "dark" || tone === "light") return tone;
  }

  return fallback;
}
type PublicationHeaderSurfaceProps = Readonly<{
  fallbackTone: PublicationSurfaceTone;
  headerId: string;
}>;

export function PublicationHeaderSurface({
  fallbackTone,
  headerId,
}: PublicationHeaderSurfaceProps) {
  useEffect(() => {
    const header = document.getElementById(headerId);
    if (!header) return;

    let frame = 0;

    const publish = () => {
      frame = 0;
      const bounds = header.getBoundingClientRect();
      const sampleX = Math.max(0, Math.min(window.innerWidth - 1, window.innerWidth / 2));
      const sampleY = Math.max(0, Math.min(window.innerHeight - 1, bounds.bottom + 1));
      const elements = typeof document.elementsFromPoint === "function"
        ? document.elementsFromPoint(sampleX, sampleY)
        : [document.elementFromPoint?.(sampleX, sampleY)].filter(
            (element): element is Element => element instanceof Element,
          );

      header.dataset.surface = resolvePublicationSurfaceTone(
        elements,
        fallbackTone,
        header,
      );
      header.dataset.compact = window.scrollY > 32 ? "true" : "false";
    };

    const schedule = () => {
      if (frame !== 0) return;
      frame = window.requestAnimationFrame(publish);
    };

    publish();
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
    };
  }, [fallbackTone, headerId]);

  return null;
}
