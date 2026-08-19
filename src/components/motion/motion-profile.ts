export type MotionEnvironment = {
  reducedMotion: boolean;
  saveData: boolean;
  width: number;
};

export type MotionProfile = {
  animate: boolean;
  pin: boolean;
};

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

function readBrowserMotionEnvironment(): MotionEnvironment {
  if (typeof window === "undefined") {
    return { reducedMotion: true, saveData: false, width: 0 };
  }

  return {
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: (navigator as NavigatorWithConnection).connection?.saveData === true,
    width: window.innerWidth,
  };
}

export function readMotionProfile(
  readEnvironment: () => MotionEnvironment = readBrowserMotionEnvironment,
): MotionProfile {
  const environment = readEnvironment();
  const animate = !environment.reducedMotion && !environment.saveData;

  return {
    animate,
    pin: animate && environment.width > 768,
  };
}
