/* Tiny shared state between the DOM (scroll, pointer) and the 3D scene, without React re-renders. */
export type PlatformId = 'pk' | 'cx' | 'cr';

export const world = {
  progress: 0,          // 0 = overview, 1 = Platformika, 2 = Complichess, 3 = Crypto, >3 = past the story
  pointer: { x: 0, y: 0 }, // -1..1
  hover: null as PlatformId | null,
  rtl: true,
  mobile: false,
  reduced: false,
  onPick: null as null | ((id: PlatformId) => void),
};

export const PLATFORMS: { id: PlatformId; pos: [number, number, number] }[] = [
  { id: 'pk', pos: [-2.7, 0.7, 0] },
  { id: 'cx', pos: [2.7, -2.7, -1.6] },
  { id: 'cr', pos: [-2.1, -6.3, -3.2] },
];

export const smooth = (t: number) => t * t * (3 - 2 * t);
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
