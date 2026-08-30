"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  buildRhythmRailPath,
  buildRhythmRailTipLattice,
} from "@/lib/rhythm-rail-geometry";

export type JournalMotionProfile = "full" | "reduced" | "static";

export type JournalMotionRuntime = {
  ScrollTrigger: (typeof import("gsap/ScrollTrigger"))["ScrollTrigger"];
  gsap: (typeof import("gsap"))["gsap"];
};

export type JournalMotionProfileInput = {
  height: number;
  reducedMotion: boolean;
  saveData: boolean;
  width: number;
};

export type EvidenceRailPathInput = {
  baseX: number;
  height?: number;
  renderScaleX?: number;
  renderScaleY?: number;
  targetY: number;
  tipX: number;
};

type JournalMotionProps = {
  children: ReactNode;
  loadRuntime?: () => Promise<JournalMotionRuntime>;
};

type NavigatorWithConnection = Navigator & {
  connection?: EventTarget & { saveData?: boolean };
};

type RailInteractionRuntime = {
  gsap: JournalMotionRuntime["gsap"];
  paths: SVGPathElement[];
  rail: SVGSVGElement;
  straightPaths: string[];
};

const EVIDENCE_TIP_START = 176;

export function resolveJournalMotionProfile({
  height,
  reducedMotion,
  saveData,
  width,
}: JournalMotionProfileInput): JournalMotionProfile {
  if (reducedMotion || saveData) return "reduced";
  if (width < 900 || height < 650) return "static";

  return "full";
}

export function buildEvidenceRailPath({
  baseX,
  height,
  renderScaleX,
  renderScaleY,
  targetY,
  tipX,
}: EvidenceRailPathInput) {
  return buildRhythmRailPath({
    baseX,
    height,
    renderScaleX,
    renderScaleY,
    targetY,
    tipX,
  });
}

async function loadJournalMotionRuntime(): Promise<JournalMotionRuntime> {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);

  return { gsap, ScrollTrigger };
}

const parseBaseX = (path: string | null, fallback: number) => {
  const match = path?.match(/^\s*M\s*(-?\d+(?:\.\d+)?)/i);
  return match ? Number(match[1]) : fallback;
};

const readViewBox = (rail: SVGSVGElement) => {
  const values = rail.getAttribute("viewBox")?.trim().split(/[\s,]+/).map(Number);
  if (values?.length === 4 && values.every(Number.isFinite)) {
    return { height: values[3]!, minY: values[1]!, width: values[2]! };
  }

  return { height: 1000, minY: 0, width: 320 };
};

const mapEntryCenterToRail = (entry: HTMLElement, rail: SVGSVGElement) => {
  const railRect = rail.getBoundingClientRect();
  const entryRect = entry.getBoundingClientRect();
  const viewBox = readViewBox(rail);
  if (railRect.height <= 0) return viewBox.minY + viewBox.height / 2;

  const relativeCenter = entryRect.top + entryRect.height / 2 - railRect.top;
  const progress = Math.min(1, Math.max(0, relativeCenter / railRect.height));
  return viewBox.minY + progress * viewBox.height;
};

export function JournalMotion({
  children,
  loadRuntime = loadJournalMotionRuntime,
}: JournalMotionProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRoot = rootRef.current;
    if (!currentRoot) return;
    const scope = currentRoot;

    let active = true;
    let configurationVersion = 0;
    let currentProfile: JournalMotionProfile | undefined;
    let focusedEntry: HTMLElement | null = null;
    let hoveredEntry: HTMLElement | null = null;
    let publishedEntry: HTMLElement | null = null;
    let railRuntime: RailInteractionRuntime | undefined;
    let motionContext:
      | ReturnType<JournalMotionRuntime["gsap"]["context"]>
      | undefined;
    const removeEntryListeners: Array<() => void> = [];
    const motionQuery = typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : undefined;
    const connection = (navigator as NavigatorWithConnection).connection;
    const entries = Array.from(
      scope.querySelectorAll<HTMLElement>("[data-journal-entry]"),
    );

    const readProfile = () => resolveJournalMotionProfile({
      height: window.innerHeight,
      reducedMotion: motionQuery?.matches ?? false,
      saveData: connection?.saveData ?? false,
      width: window.innerWidth,
    });

    const restoreRailPaths = (runtime: RailInteractionRuntime) => {
      runtime.paths.forEach((path, index) => {
        const straightPath = runtime.straightPaths[index];
        if (straightPath) path.setAttribute("d", straightPath);
      });
    };

    const clearMotion = () => {
      if (railRuntime) {
        railRuntime.gsap.killTweensOf(railRuntime.paths);
        restoreRailPaths(railRuntime);
        railRuntime = undefined;
      }
      motionContext?.revert();
      motionContext = undefined;
    };

    const animateRailToEntry = (entry: HTMLElement | null) => {
      if (!railRuntime) return;
      const { gsap, paths, rail, straightPaths } = railRuntime;
      const targetY = entry ? mapEntryCenterToRail(entry, rail) : 0;
      const viewBox = readViewBox(rail);
      const railRect = rail.getBoundingClientRect();
      const renderScaleX = railRect.width > 0 && viewBox.width > 0
        ? railRect.width / viewBox.width
        : 1;
      const renderScaleY = railRect.height > 0 && viewBox.height > 0
        ? railRect.height / viewBox.height
        : 1;
      const baseXs = straightPaths.map((path, index) => (
        parseBaseX(path, 72 + index * 24)
      ));
      const tipXs = buildRhythmRailTipLattice({
        anchor: EVIDENCE_TIP_START,
        baseXs,
      });

      gsap.to(paths, {
        attr: {
          d: (index: number) => {
            if (!entry) return straightPaths[index] ?? "";
            const baseX = baseXs[index] ?? baseXs[0] ?? 72;
            return buildEvidenceRailPath({
              baseX,
              height: viewBox.height,
              renderScaleX,
              renderScaleY,
              targetY,
              tipX: tipXs[index] ?? tipXs[0] ?? EVIDENCE_TIP_START,
            });
          },
        },
        duration: entry ? 0.5 : 0.42,
        ease: entry ? "power3.out" : "power2.inOut",
        overwrite: "auto",
      });
    };

    const publishActiveEntry = () => {
      const nextEntry = focusedEntry ?? hoveredEntry;
      if (nextEntry === publishedEntry) return;
      publishedEntry = nextEntry;

      const index = nextEntry?.dataset.journalIndex;
      if (index) scope.dataset.activeJournalEntry = index;
      else delete scope.dataset.activeJournalEntry;
      animateRailToEntry(nextEntry);
    };

    entries.forEach((entry) => {
      const handlePointerEnter = () => {
        hoveredEntry = entry;
        publishActiveEntry();
      };
      const handlePointerLeave = () => {
        if (hoveredEntry === entry) hoveredEntry = null;
        publishActiveEntry();
      };
      const handleFocusIn = () => {
        focusedEntry = entry;
        publishActiveEntry();
      };
      const handleFocusOut = (event: FocusEvent) => {
        const relatedTarget = event.relatedTarget;
        if (relatedTarget instanceof Node && entry.contains(relatedTarget)) return;
        focusedEntry = relatedTarget instanceof Element
          ? relatedTarget.closest<HTMLElement>("[data-journal-entry]")
          : null;
        if (focusedEntry && !scope.contains(focusedEntry)) focusedEntry = null;
        publishActiveEntry();
      };

      entry.addEventListener("pointerenter", handlePointerEnter);
      entry.addEventListener("pointerleave", handlePointerLeave);
      entry.addEventListener("focusin", handleFocusIn);
      entry.addEventListener("focusout", handleFocusOut);
      removeEntryListeners.push(() => {
        entry.removeEventListener("pointerenter", handlePointerEnter);
        entry.removeEventListener("pointerleave", handlePointerLeave);
        entry.removeEventListener("focusin", handleFocusIn);
        entry.removeEventListener("focusout", handleFocusOut);
      });
    });

    async function installMotion(version: number) {
      const { gsap, ScrollTrigger } = await loadRuntime();
      if (
        !active
        || version !== configurationVersion
        || readProfile() !== "full"
      ) return;

      gsap.registerPlugin(ScrollTrigger);
      motionContext = gsap.context(() => {
        const coverCopy = scope.querySelector<HTMLElement>("[data-journal-cover-copy]");
        const coverImage = scope.querySelector<HTMLElement>("[data-journal-cover-image]");
        const evidenceRail = scope.querySelector<SVGSVGElement>("[data-evidence-rail]");
        const evidenceLines = Array.from(
          scope.querySelectorAll<SVGPathElement>("[data-evidence-line]"),
        );

        if (coverCopy || coverImage) {
          const cover = gsap.timeline({ defaults: { ease: "power3.out" } });
          if (coverCopy) {
            cover.fromTo(
              coverCopy,
              { opacity: 0, y: 28 },
              { duration: 0.82, opacity: 1, y: 0 },
            );
          }
          if (coverImage) {
            cover.fromTo(
              coverImage,
              { clipPath: "inset(8% 0% 100% 0%)", scale: 1.035 },
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1,
                scale: 1,
              },
              coverCopy ? 0.08 : 0,
            );
          }
        }

        if (evidenceRail) {
          const rail = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              end: "bottom 30%",
              scrub: 0.62,
              start: "top 84%",
              trigger: evidenceRail,
            },
          });
          rail.fromTo(
            evidenceRail,
            { scaleY: 0, transformOrigin: "top center" },
            { duration: 1, scaleY: 1, transformOrigin: "top center" },
          );
        }

        entries.forEach((entry) => {
          const visual = entry.querySelector<HTMLElement>("[data-journal-entry-visual]");
          const entryTimeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              end: "top 48%",
              scrub: 0.48,
              start: "top 88%",
              trigger: entry,
            },
          });
          entryTimeline.fromTo(
            entry,
            { opacity: 0, y: 34 },
            { duration: 1, opacity: 1, y: 0 },
          );
          if (visual) {
            entryTimeline.fromTo(
              visual,
              { clipPath: "inset(0% 0% 100% 0%)", scale: 1.025 },
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 0.86,
                scale: 1,
              },
              0.08,
            );
          }
        });

        if (evidenceRail && evidenceLines.length > 0) {
          railRuntime = {
            gsap,
            paths: evidenceLines,
            rail: evidenceRail,
            straightPaths: evidenceLines.map((path) => path.getAttribute("d") ?? ""),
          };
          if (publishedEntry) animateRailToEntry(publishedEntry);
        }
      }, scope);
    }

    const configure = () => {
      const nextProfile = readProfile();
      if (nextProfile === currentProfile) return;
      currentProfile = nextProfile;
      configurationVersion += 1;
      clearMotion();
      scope.dataset.motionProfile = nextProfile;
      if (nextProfile === "full") void installMotion(configurationVersion);
    };
    const handleConstraintChange = () => configure();

    window.addEventListener("resize", handleConstraintChange);
    motionQuery?.addEventListener("change", handleConstraintChange);
    connection?.addEventListener("change", handleConstraintChange);
    configure();

    return () => {
      active = false;
      configurationVersion += 1;
      clearMotion();
      removeEntryListeners.forEach((removeListener) => removeListener());
      window.removeEventListener("resize", handleConstraintChange);
      motionQuery?.removeEventListener("change", handleConstraintChange);
      connection?.removeEventListener("change", handleConstraintChange);
    };
  }, [loadRuntime]);

  return (
    <div data-journal-motion-root data-motion-profile="pending" ref={rootRef}>
      {children}
    </div>
  );
}
