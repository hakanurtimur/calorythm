"use client";

import dynamic from "next/dynamic";

const OrbitalThreadControls = dynamic(
  () => import("./orbital-thread-controls").then((module) => module.OrbitalThreadControls),
  { ssr: false },
);

export function OrbitalThreadControlsLoader() {
  if (process.env.NODE_ENV !== "development") return null;
  return <OrbitalThreadControls />;
}
