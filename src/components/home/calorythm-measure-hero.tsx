"use client";

import Image from "next/image";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  resolveCalorythmCoverBands,
  resolveCalorythmCoverMotion,
} from "./calorythm-cover-motion";
import styles from "./calorythm-measure-hero.module.css";

const SOURCE_WIDTH = 1672;
const SOURCE_HEIGHT = 941;

const CONDUCTOR_FRAMES = [
  {
    id: "up",
    mask: "/images/calorythm-conductor-baton-up-mask-v1.png",
    skeleton: "/images/calorythm-conductor-skeleton-up-v1.webp",
    source: "/images/calorythm-conductor-baton-up-v1.webp",
  },
  {
    id: "mid",
    mask: "/images/calorythm-conductor-baton-mid-mask-v1.png",
    skeleton: "/images/calorythm-conductor-skeleton-v1.webp",
    source: "/images/calorythm-conductor-baton-mid-v1.webp",
  },
  {
    id: "down",
    mask: "/images/calorythm-conductor-baton-down-mask-v1.png",
    skeleton: "/images/calorythm-conductor-skeleton-down-v1.webp",
    source: "/images/calorythm-conductor-baton-down-v1.webp",
  },
] as const;

export type CalorythmCharacterPose = "measure-left" | "measure-right";

type CalorythmMeasureHeroProps = {
  characterPose?: CalorythmCharacterPose;
};

type HeroMotionProfile = "full" | "pending" | "reduced" | "static";

type NavigatorWithConnection = Navigator & {
  connection?: EventTarget & { saveData?: boolean };
};

const RHYTHM_LINES = [
  {
    color: "var(--orange)",
    id: "claim",
  },
  {
    color: "var(--coral)",
    id: "source",
  },
  {
    color: "var(--ochre)",
    id: "context",
  },
  {
    color: "var(--olive)",
    id: "editorial",
  },
] as const;

const INITIAL_BANDS = resolveCalorythmCoverBands();

type LensState = {
  active: number;
  x: number;
  y: number;
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export const resolveConductorFrame = (progress: number) =>
  resolveCalorythmCoverMotion(progress).conductor.dominantFrame;

export function CalorythmMeasureHero({
  characterPose = "measure-left",
}: CalorythmMeasureHeroProps = {}) {
  const instanceId = useId().replaceAll(":", "");
  const heroRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<SVGSVGElement>(null);
  const lensFieldRef = useRef<SVGGElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [motionProfile, setMotionProfile] =
    useState<HeroMotionProfile>("pending");

  const svgId = (name: string) => `${instanceId}-${name}`;
  const characterTransform =
    characterPose === "measure-right"
      ? `translate(${SOURCE_WIDTH} 0) scale(-1 1)`
      : "translate(300 70) scale(0.86)";

  useEffect(() => {
    const motionQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : undefined;
    const connection = (navigator as NavigatorWithConnection).connection;

    const readProfile = (): Exclude<HeroMotionProfile, "pending"> => {
      if ((motionQuery?.matches ?? true) || connection?.saveData) {
        return "reduced";
      }

      if (window.innerWidth < 1024 || window.innerHeight < 700) {
        return "static";
      }

      return "full";
    };
    const publishProfile = () => {
      const nextProfile = readProfile();
      setMotionProfile((currentProfile) =>
        currentProfile === nextProfile ? currentProfile : nextProfile,
      );
    };

    publishProfile();
    motionQuery?.addEventListener("change", publishProfile);
    connection?.addEventListener("change", publishProfile);
    window.addEventListener("resize", publishProfile);

    return () => {
      motionQuery?.removeEventListener("change", publishProfile);
      connection?.removeEventListener("change", publishProfile);
      window.removeEventListener("resize", publishProfile);
    };
  }, []);

  useEffect(() => {
    if (motionProfile === "pending") return;

    const hero = heroRef.current;
    const stage = stageRef.current;
    const visual = visualRef.current;
    const cursor = cursorRef.current;

    if (!hero || !stage || !visual || !cursor) return;
    const cursorElement = cursor;
    const visualElement = visual;

    const supportsMediaQueries = typeof window.matchMedia === "function";
    const applyCoverProgress = (progress: number) => {
      const motion = resolveCalorythmCoverMotion(progress);
      const conductorMix = motion.conductor.mix;

      hero.style.setProperty("--hero-progress", motion.progress.toFixed(4));
      hero.style.setProperty("--copy-cover", motion.copyWeights.cover.toFixed(4));
      hero.style.setProperty(
        "--copy-editorial",
        motion.copyWeights.editorial.toFixed(4),
      );
      hero.style.setProperty(
        "--copy-journal",
        motion.copyWeights.journal.toFixed(4),
      );
      hero.style.setProperty(
        "--cover-to-editorial",
        motion.transitions.coverToEditorial.toFixed(4),
      );
      hero.style.setProperty(
        "--editorial-to-journal",
        motion.transitions.editorialToJournal.toFixed(4),
      );
      hero.style.setProperty("--conductor-mix", conductorMix.toFixed(4));
      hero.style.setProperty(
        "--conductor-energy",
        motion.conductor.handoffEnergy.toFixed(4),
      );
      hero.dataset.chapter = motion.activeChapter;
      hero.dataset.conductorFrame = String(motion.conductor.dominantFrame);
      hero.dataset.conductorFrom = String(motion.conductor.fromFrame);
      hero.dataset.conductorTo = String(motion.conductor.toFrame);
      hero.dataset.conductorMotion =
        motion.conductor.fromFrame === motion.conductor.toFrame
          ? "hold"
          : "handoff";
    };

    const installStaticInspection = (profile: "reduced" | "static") => {
      hero.dataset.motion = profile;
      hero.dataset.inspection = "static";
      hero.dataset.cursor = "idle";
      hero.dataset.wireframe = "idle";
      applyCoverProgress(0);

      const publishStaticInspection = (active: boolean) => {
        const cx = SOURCE_WIDTH * 0.59;
        const cy = SOURCE_HEIGHT * 0.43;
        hero.dataset.wireframe = active ? "active" : "idle";
        lensFieldRef.current?.setAttribute(
          "transform",
          `translate(${cx.toFixed(2)} ${cy.toFixed(2)}) rotate(-8) scale(${active ? 1 : 0})`,
        );
      };
      const showStaticInspection = () => publishStaticInspection(true);
      const hideStaticInspection = () => publishStaticInspection(false);

      publishStaticInspection(document.activeElement === visual);

      visual.addEventListener("focus", showStaticInspection);
      visual.addEventListener("blur", hideStaticInspection);

      return () => {
        visual.removeEventListener("focus", showStaticInspection);
        visual.removeEventListener("blur", hideStaticInspection);
      };
    };

    if (motionProfile !== "full") {
      return installStaticInspection(motionProfile);
    }

    const supportsPointerInspection =
      !supportsMediaQueries ||
      !window.matchMedia("(hover: none), (pointer: coarse)").matches;

    hero.dataset.motion = "full";
    hero.dataset.inspection = supportsPointerInspection ? "pointer" : "static";

    let animationFrame = 0;
    let targetScrollProgress = 0;
    let scrollProgress = 0;
    let isVisible = true;
    let stageBounds: Pick<DOMRect, "height" | "left" | "top" | "width"> = {
      height: Math.max(1, window.innerHeight),
      left: 0,
      top: 0,
      width: Math.max(1, window.innerWidth),
    };
    let inverseVisualMatrix: DOMMatrix | null = null;
    let pendingPointer: { clientX: number; clientY: number } | null = null;
    let targetLens: LensState = {
      active: 0,
      x: SOURCE_WIDTH * 0.59,
      y: SOURCE_HEIGHT * 0.43,
    };
    const lens: LensState = { ...targetLens };
    let lensScale = 0;

    const cachePointerGeometry = () => {
      stageBounds = stage.getBoundingClientRect();
      const matrix = visual.getScreenCTM?.();

      try {
        inverseVisualMatrix = matrix?.inverse() ?? null;
      } catch {
        inverseVisualMatrix = null;
      }
    };

    const measureProgress = () => {
      const bounds = hero.getBoundingClientRect();
      const travel = Math.max(1, hero.offsetHeight - window.innerHeight);
      targetScrollProgress = clamp(-bounds.top / travel);

      if (targetScrollProgress >= 0.999) {
        scrollProgress = 1;
        applyCoverProgress(1);
      }

      startRender();
    };

    const handlePointerMove = (event: PointerEvent) => {
      hero.dataset.wireframe = "active";
      hero.dataset.cursor = "active";
      pendingPointer = { clientX: event.clientX, clientY: event.clientY };
      targetLens = { ...targetLens, active: 1 };

      startRender();
    };

    const handlePointerLeave = () => {
      hero.dataset.wireframe = "idle";
      hero.dataset.cursor = "idle";
      pendingPointer = null;
      targetLens = { ...targetLens, active: 0 };
      startRender();
    };

    const handleInspectionFocus = () => {
      hero.dataset.wireframe = "active";
      hero.dataset.cursor = "idle";
      pendingPointer = null;
      targetLens = {
        active: 1,
        x: SOURCE_WIDTH * 0.59,
        y: SOURCE_HEIGHT * 0.43,
      };
      startRender();
    };

    function startRender() {
      if (animationFrame === 0 && isVisible && !document.hidden) {
        animationFrame = window.requestAnimationFrame(render);
      }
    }

    function render() {
      animationFrame = 0;

      if (pendingPointer) {
        const pointer = pendingPointer;
        pendingPointer = null;
        const localX = pointer.clientX - stageBounds.left;
        const localY = pointer.clientY - stageBounds.top;
        const normalizedX = clamp(localX / Math.max(1, stageBounds.width));
        const normalizedY = clamp(localY / Math.max(1, stageBounds.height));
        let sourceX = normalizedX * SOURCE_WIDTH;
        let sourceY = normalizedY * SOURCE_HEIGHT;

        cursorElement.style.setProperty("--cursor-x", `${localX.toFixed(2)}px`);
        cursorElement.style.setProperty("--cursor-y", `${localY.toFixed(2)}px`);

        if (
          supportsPointerInspection &&
          inverseVisualMatrix &&
          typeof visualElement.createSVGPoint === "function"
        ) {
          const point = visualElement.createSVGPoint();
          point.x = pointer.clientX;
          point.y = pointer.clientY;
          const transformed = point.matrixTransform(inverseVisualMatrix);
          sourceX = transformed.x;
          sourceY = transformed.y;
        }

        targetLens = {
          active: supportsPointerInspection ? 1 : 0,
          x: clamp(sourceX, 0, SOURCE_WIDTH),
          y: clamp(sourceY, 0, SOURCE_HEIGHT),
        };
      }

      scrollProgress += (targetScrollProgress - scrollProgress) * 0.13;
      lens.x += (targetLens.x - lens.x) * 0.11;
      lens.y += (targetLens.y - lens.y) * 0.11;
      lens.active += (targetLens.active - lens.active) * 0.1;
      lensScale += (targetLens.active - lensScale) * 0.1;

      applyCoverProgress(scrollProgress);
      lensFieldRef.current?.setAttribute(
        "transform",
        `translate(${lens.x.toFixed(2)} ${lens.y.toFixed(2)}) rotate(${(-8 + (lens.x / SOURCE_WIDTH - 0.5) * 10).toFixed(2)}) scale(${lensScale.toFixed(4)})`,
      );

      const lensIsMoving =
        Math.abs(targetLens.x - lens.x) > 0.02 ||
        Math.abs(targetLens.y - lens.y) > 0.02 ||
        Math.abs(targetLens.active - lens.active) > 0.002 ||
        Math.abs(targetLens.active - lensScale) > 0.002;
      const scrollIsMoving =
        Math.abs(targetScrollProgress - scrollProgress) > 0.0002;

      if (isVisible && !document.hidden && (lensIsMoving || scrollIsMoving)) {
        startRender();
      }
    }

    const handleVisibility = () => startRender();
    const handleResize = () => {
      cachePointerGeometry();
      measureProgress();
    };
    const observer =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver(([entry]) => {
            isVisible = entry?.isIntersecting ?? true;
            if (isVisible) startRender();
          })
        : null;

    cachePointerGeometry();
    const initialBounds = hero.getBoundingClientRect();
    const initialTravel = Math.max(1, hero.offsetHeight - window.innerHeight);
    targetScrollProgress = clamp(-initialBounds.top / initialTravel);
    scrollProgress = targetScrollProgress;
    applyCoverProgress(scrollProgress);
    if (supportsPointerInspection) {
      stage.addEventListener("pointermove", handlePointerMove);
      stage.addEventListener("pointerleave", handlePointerLeave);
    }
    visual.addEventListener("focus", handleInspectionFocus);
    visual.addEventListener("blur", handlePointerLeave);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", measureProgress, { passive: true });
    observer?.observe(hero);
    startRender();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      stage.removeEventListener("pointermove", handlePointerMove);
      stage.removeEventListener("pointerleave", handlePointerLeave);
      visual.removeEventListener("focus", handleInspectionFocus);
      visual.removeEventListener("blur", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", measureProgress);
      observer?.disconnect();
    };
  }, [motionProfile]);

  return (
    <section
      className={styles.hero}
      data-conductor-frame="1"
      data-conductor-from="1"
      data-conductor-motion="hold"
      data-conductor-to="1"
      data-cursor="idle"
      data-home-scene="hero"
      data-wireframe="idle"
      ref={heroRef}
    >
      <div className={styles.stage} id="top" ref={stageRef}>
        <svg
          aria-label="Beslenmenin ritmini yöneten ve elma taşıyan mermer bir figür; anatomik katmanı incelemek için odağa al"
          className={styles.visualComposite}
          data-character-pose={characterPose}
          data-evidence-visual="threads"
          preserveAspectRatio="xMidYMid slice"
          ref={visualRef}
          role="img"
          tabIndex={0}
          viewBox="0 0 1672 941"
        >
          <title>Beslenmenin ritmini yöneten mermer figür</title>
          <defs>
            {RHYTHM_LINES.map((line, index) => (
              <clipPath
                clipPathUnits="userSpaceOnUse"
                id={svgId(`band-entry-${index}`)}
                key={line.id}
              >
                <rect
                  className={styles.bandRevealMask}
                  data-band-entry-mask={line.id}
                  height={SOURCE_HEIGHT}
                  style={{ "--line-index": index } as CSSProperties}
                  width="2008"
                  x="-168"
                  y="0"
                />
              </clipPath>
            ))}

            <filter
              height="180%"
              id={svgId("inspection-soften")}
              width="170%"
              x="-35%"
              y="-40%"
            >
              <feGaussianBlur stdDeviation="30" />
            </filter>

            <mask
              className={styles.luminanceMask}
              data-inspection-mask="soft-irregular"
              height={SOURCE_HEIGHT}
              id={svgId("lens-mask")}
              maskContentUnits="userSpaceOnUse"
              maskUnits="userSpaceOnUse"
              width={SOURCE_WIDTH}
              x="0"
              y="0"
            >
              <rect fill="black" height={SOURCE_HEIGHT} width={SOURCE_WIDTH} />
              <g
                ref={lensFieldRef}
                transform={`translate(${SOURCE_WIDTH * 0.59} ${SOURCE_HEIGHT * 0.43}) scale(0)`}
              >
                <path
                  d="M -244 -16 C -226 -124 -112 -184 10 -168 C 142 -150 248 -76 232 42 C 218 150 112 194 -12 178 C -142 160 -260 100 -244 -16 Z"
                  data-inspection-shape="organic"
                  fill="white"
                  filter={`url(#${svgId("inspection-soften")})`}
                />
              </g>
            </mask>

            {CONDUCTOR_FRAMES.map((frame, index) => (
              <mask
                className={styles.luminanceMask}
                height={SOURCE_HEIGHT}
                id={svgId(`foreground-mask-${index}`)}
                key={frame.id}
                maskContentUnits="userSpaceOnUse"
                maskUnits="userSpaceOnUse"
                width={SOURCE_WIDTH}
                x="0"
                y="0"
              >
                <image
                  data-character-layer={`foreground-mask-${frame.id}`}
                  data-mask-source="forearms-and-apple"
                  height={SOURCE_HEIGHT}
                  href={frame.mask}
                  transform={characterTransform}
                  width={SOURCE_WIDTH}
                  x="0"
                  y="0"
                />
              </mask>
            ))}

            {CONDUCTOR_FRAMES.map((frame, index) => (
              <mask
                className={styles.luminanceMask}
                height={SOURCE_HEIGHT}
                id={svgId(`skeleton-content-mask-${index}`)}
                key={frame.id}
                maskContentUnits="userSpaceOnUse"
                maskUnits="userSpaceOnUse"
                width={SOURCE_WIDTH}
                x="0"
                y="0"
              >
                <image
                  aria-hidden="true"
                  data-character-layer={`skeleton-mask-${frame.id}`}
                  data-frame-index={index}
                  data-mask-source="skeleton"
                  data-wireframe-reveal="pointer"
                  height={SOURCE_HEIGHT}
                  href={frame.skeleton}
                  transform={characterTransform}
                  width={SOURCE_WIDTH}
                  x="0"
                  y="0"
                />
              </mask>
            ))}

          </defs>

          <g className={styles.figureLayer} data-composite-layer="stone">
            {CONDUCTOR_FRAMES.map((frame, index) => (
              <image
                className={styles.conductorFrame}
                data-character-layer={`stone-${frame.id}`}
                data-conductor-frame={frame.id}
                data-frame-index={index}
                data-material-state="stone"
                height={SOURCE_HEIGHT}
                href={frame.source}
                key={frame.id}
                transform={characterTransform}
                width={SOURCE_WIDTH}
              />
            ))}
          </g>

          <g
            className={styles.rhythmBands}
            data-composite-layer="rhythm-bands"
          >
            {RHYTHM_LINES.map((line, index) => (
              <path
                className={styles.rhythmBand}
                clipPath={`url(#${svgId(`band-entry-${index}`)})`}
                data-rhythm-band={line.id}
                d={INITIAL_BANDS[index]?.d}
                key={line.id}
                stroke={line.color}
                strokeLinecap="butt"
                strokeWidth={INITIAL_BANDS[index]?.strokeWidth ?? 20}
                style={{ "--line-index": index } as CSSProperties}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>

          <g
            className={styles.figureLayer}
            data-composite-layer="foreground-occluder"
          >
            {CONDUCTOR_FRAMES.map((frame, index) => (
              <g
                className={styles.conductorForegroundFrame}
                data-frame-index={index}
                key={frame.id}
                mask={`url(#${svgId(`foreground-mask-${index}`)})`}
              >
                <image
                  data-character-layer={`foreground-${frame.id}`}
                  height={SOURCE_HEIGHT}
                  href={frame.source}
                  transform={characterTransform}
                  width={SOURCE_WIDTH}
                />
              </g>
            ))}
          </g>

          <rect
            className={styles.inspectionWash}
            data-composite-layer="inspection-wash"
            data-inspection-tone="ivory"
            height={SOURCE_HEIGHT}
            mask={`url(#${svgId("lens-mask")})`}
            width={SOURCE_WIDTH}
          />

          <g
            aria-hidden="true"
            className={styles.figureInspectionLayer}
            data-composite-layer="wireframe"
            mask={`url(#${svgId("lens-mask")})`}
          >
            {CONDUCTOR_FRAMES.map((frame, index) => (
              <rect
                className={`${styles.skeletonOverlay} ${styles.conductorSkeletonFrame}`}
                data-frame-index={index}
                data-skeleton-overlay="ink"
                height={SOURCE_HEIGHT}
                key={frame.id}
                mask={`url(#${svgId(`skeleton-content-mask-${index}`)})`}
                width={SOURCE_WIDTH}
              />
            ))}
          </g>

        </svg>

        <article className={styles.opening}>
          <h1 data-copy-zone="headline">
            <span>Beslenmenin</span>
            <em>bir ritmi var.</em>
          </h1>
          <p className={styles.intro} data-copy-zone="caption">
            CALORYTHM, beslenme bilimini görsel hikâyelerle anlatan bağımsız
            bir dijital yayın.
          </p>
        </article>

        <article className={styles.method}>
          <h2 data-copy-zone="headline">
            Yediğimiz şey,
            <em>yalnızca bir sayı</em>
            değil.
          </h2>
          <p data-copy-zone="caption">
            Bir besini yalnızca kalorisiyle değil, bedenin onunla ne yaptığıyla
            birlikte ele alıyoruz.
          </p>
        </article>

        <article className={styles.journalStatement}>
          <h2 data-copy-zone="headline">
            Beden sadece almaz.
            <em>Cevap verir.</em>
          </h2>
          <p data-copy-zone="caption">
            Sindirim, enerji, hareket, uyku ve toparlanma; aynı sistemin
            birbirini etkileyen parçalarıdır.
          </p>
        </article>

        <div
          aria-hidden="true"
          className={styles.coverSignature}
          data-cover-signature="rhythm-ring"
        >
          <Image
            alt=""
            height={128}
            src="/brand/calorythm-ring-primary.svg"
            unoptimized
            width={128}
          />
        </div>

        <div
          aria-hidden="true"
          className={styles.editorialCursor}
          data-editorial-cursor="registration"
          ref={cursorRef}
        >
          {RHYTHM_LINES.map((line, index) => (
            <i
              key={line.id}
              style={
                {
                  "--cursor-color": line.color,
                  "--cursor-index": index,
                } as CSSProperties
              }
            />
          ))}
          <span />
        </div>

        <div aria-hidden="true" className={styles.scrollCue}>
          <span>Devam et</span>
          <i />
        </div>
      </div>
    </section>
  );
}
