/* Tiny shared state between the DOM (scroll, pointer) and the 3D scene, without React re-renders. */
export type PlatformId = 'tr' | 'pk' | 'cx' | 'cr' | 'lr';

export const world = {
  progress: 0,          // 0 = overview, 1 = Travel, 2 = Platformika, 3 = Complichess, 4 = Crypto, 5 = LearnLume, >5 = past the story
  pointer: { x: 0, y: 0 }, // -1..1
  hover: null as PlatformId | null,
  rtl: true,
  mobile: false,
  reduced: false,
  onPick: null as null | ((id: PlatformId) => void),
  dragging: false,      // a part of a platform is being dragged with the mouse
  dragEnd: 0,           // time the last drag ended (swallows the click that follows it)
};

export const PLATFORMS: { id: PlatformId; pos: [number, number, number] }[] = [
  { id: 'tr', pos: [-2.7, 0.7, 0] },
  { id: 'pk', pos: [2.7, -2.9, -1.6] },
  { id: 'cx', pos: [-2.4, -6.5, -3.2] },
  { id: 'cr', pos: [2.4, -10.1, -4.8] },
  { id: 'lr', pos: [-2.4, -13.7, -6.4] },
];

export const smooth = (t: number) => t * t * (3 - 2 * t);
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
