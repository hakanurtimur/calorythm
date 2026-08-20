export type MotionEnvironment = {
  height: number;
  reducedMotion: boolean;
  saveData: boolean;
  width: number;
};

export type MotionProfile = {
  animate: boolean;
  pin: boolean;
  splashDuration: 0 | 900 | 1750;
};

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

function readBrowserMotionEnvironment(): MotionEnvironment {
  if (typeof window === "undefined") {
    return { height: 0, reducedMotion: true, saveData: false, width: 0 };
  }

  return {
    height: window.innerHeight,
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
    pin: animate && environment.width >= 768 && environment.height >= 700,
    splashDuration: animate ? (environment.width < 768 ? 900 : 1750) : 0,
  };
}
