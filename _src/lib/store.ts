/* Tiny shared state between the DOM (scroll, pointer) and the 3D scene, without React re-renders. */
export type PlatformId = 'pk' | 'cx' | 'cr' | 'lr';

export const world = {
  progress: 0,          // 0 = overview, 1 = Platformika, 2 = Complichess, 3 = Crypto, 4 = Cramika, >4 = past the story
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
  { id: 'pk', pos: [-2.7, 0.7, 0] },
  { id: 'cx', pos: [2.7, -2.7, -1.6] },
  { id: 'cr', pos: [-2.1, -6.3, -3.2] },
  { id: 'lr', pos: [2.4, -9.9, -4.8] },
];

export const smooth = (t: number) => t * t * (3 - 2 * t);
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
