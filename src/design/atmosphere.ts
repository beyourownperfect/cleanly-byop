import type { Object, LifecycleMoment } from '../shared/types/domain';

export function calculateAtmosphere(
  objects: Object[],
  moments: Map<string, LifecycleMoment>,
): number {
  if (objects.length === 0) return 0.5;

  const homeRatio = objects.filter(
    (o) => o.currentStorageSpaceId === o.homeStorageSpaceId,
  ).length / objects.length;

  const totalWeight = objects.reduce((sum, o) => {
    const moment = moments.get(o.currentMomentId);
    return sum + (moment?.atmosphereWeight ?? 0);
  }, 0);
  const avgWeight = totalWeight / objects.length;

  return Math.max(0, Math.min(1, homeRatio * 0.6 + ((avgWeight + 1) / 2) * 0.4));
}

export function applyAtmosphere(temp: number): void {
  const root = document.documentElement;

  // Cool spectrum: 0.0 = deeper/darker blue (tense), 1.0 = slightly lighter (serene)
  const light = Math.round(10 + temp * 6);

  root.style.setProperty('--atmos-hue', '220');
  root.style.setProperty('--atmos-saturation', `${15 - temp * 5}%`);
  root.style.setProperty('--atmos-lightness', `${light}%`);
}
