export type ResponseParticle = {
  x: number;
  y: number;
  phase: number;
  speed: number;
  radius: number;
  paletteIndex: number;
};

type CreateResponseParticlesOptions = {
  count: number;
  seed: number;
};

const UINT32_RANGE = 4_294_967_296;

function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (Math.imul(1_664_525, state) + 1_013_904_223) >>> 0;
    return state / UINT32_RANGE;
  };
}

function wrap(value: number): number {
  return ((value % 1) + 1) % 1;
}

export function createResponseParticles({ count, seed }: CreateResponseParticlesOptions): ResponseParticle[] {
  const random = createSeededRandom(seed);

  return Array.from({ length: Math.max(0, Math.floor(count)) }, () => ({
    x: random(),
    y: random(),
    phase: random() * Math.PI * 2,
    speed: 0.025 + random() * 0.055,
    radius: 0.6 + random() * 1.4,
    paletteIndex: Math.floor(random() * 3),
  }));
}

export function advanceResponseParticle(
  particle: ResponseParticle,
  time: number,
  intensity: number,
): ResponseParticle {
  if (intensity === 0 || time <= 0) return particle;

  const amount = Math.min(1, Math.max(0, intensity));
  particle.phase = (particle.phase + time * (0.65 + particle.speed) * amount) % (Math.PI * 2);
  particle.x = wrap(particle.x + particle.speed * time * amount);
  particle.y = wrap(particle.y + Math.sin(particle.phase) * amount * time * 0.006);
  return particle;
}
