'use client';
/* The three floating platforms. The camera flies from one to the next as the page scrolls
   (world.progress), leans toward the pointer, and each platform reacts to hover and click. */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, RoundedBox, Edges } from '@react-three/drei';
import { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { world, PLATFORMS, smooth, clamp, type PlatformId } from '../lib/store';

const C = {
  night: '#090B1F', pk: '#5B54FF', pkDeep: '#2A238F', gold: '#F2B705', felt: '#1F4A3B', cream: '#E9DFC6',
  brass: '#D8AE57', ebony: '#1A1715', mint: '#49E8C8', crSlab: '#0E1A33',
};

/* ---------- camera path ---------- */
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
function keyframe(i: number) {
  const side = world.rtl ? 1 : -1;
  if (i <= 0) return world.mobile
    ? { pos: V(0, -1.2, 33), look: V(0, -0.5, -1.6) }
    : { pos: V(side * 3.6, -1.0, 24), look: V(side * 4.4, -1.15, -1.6) };
  const p = PLATFORMS[Math.min(2, i - 1)].pos;
  const sx = world.mobile ? 0 : side * 2.25;
  if (i >= 4) return { pos: V(p[0] + sx, p[1] - 3.5, p[2] + 11), look: V(p[0] + sx, p[1] - 5, p[2]) };
  if (world.mobile) return { pos: V(p[0], p[1] + 1.2, p[2] + 13.5), look: V(p[0], p[1] - 1.7, p[2]) };
  return { pos: V(p[0] + sx * 0.75, p[1] + 2.1, p[2] + 9.6), look: V(p[0] + sx, p[1] + 0.45, p[2]) };
}
function CameraRig() {
  const { camera } = useThree();
  const look = useRef(V(0, -2.7, -1.6));
  const tmpP = useMemo(() => new THREE.Vector3(), []);
  const tmpL = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    const p = clamp(world.progress, 0, 4);
    const i = Math.floor(p), f = smooth(p - i);
    const a = keyframe(i), b = keyframe(i + 1);
    tmpP.lerpVectors(a.pos, b.pos, f); tmpL.lerpVectors(a.look, b.look, f);
    if (!world.reduced) { tmpP.x += world.pointer.x * 0.45; tmpP.y += world.pointer.y * 0.3; }
    const k = world.reduced ? 1 : 1 - Math.pow(0.0015, dt);
    camera.position.lerp(tmpP, k); look.current.lerp(tmpL, k);
    camera.lookAt(look.current);
  });
  return null;
}

/* ---------- shared bits ---------- */
function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d')!; const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,.35)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function Glow({ color, size = 6, y = -0.6, opacity = 0.55 }: { color: string; size?: number; y?: number; opacity?: number }) {
  const tex = useMemo(glowTexture, []);
  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={tex} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </mesh>
  );
}

/* Hover/click + float wrapper used by every platform */
function PlatformShell({ id, index, children }: { id: PlatformId; index: number; children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null!);
  const pos = PLATFORMS[index].pos;
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime + index * 1.7;
    const hovered = world.hover === id;
    const focus = 1 - Math.min(1, Math.abs(world.progress - (index + 1)));
    const s = 1 + (hovered ? 0.045 : 0) + focus * 0.02;
    const k = 1 - Math.pow(0.002, dt);
    g.current.scale.lerp(tmp.set(s, s, s), k);
    const bob = world.reduced ? 0 : Math.sin(t * 0.8) * 0.12;
    g.current.position.set(pos[0], pos[1] + bob, pos[2]);
    const tiltX = world.reduced ? 0 : 0.12 + Math.sin(t * 0.5) * 0.03 + (hovered ? world.pointer.y * 0.12 : 0);
    const tiltZ = world.reduced ? 0 : Math.cos(t * 0.45) * 0.03 - (hovered ? world.pointer.x * 0.12 : 0);
    g.current.rotation.x += (tiltX - g.current.rotation.x) * k;
    g.current.rotation.z += (tiltZ - g.current.rotation.z) * k;
  });
  return (
    <group ref={g}
      onPointerOver={(e) => { e.stopPropagation(); world.hover = id; document.documentElement.dataset.hover = id; }}
      onPointerOut={() => { if (world.hover === id) { world.hover = null; delete document.documentElement.dataset.hover; } }}
      onClick={(e) => { e.stopPropagation(); world.onPick?.(id); }}>
      {children}
    </group>
  );
}

function Slab({ color, edge }: { color: string; edge?: string }) {
  return (
    <RoundedBox args={[3.5, 0.34, 3.5]} radius={0.14} smoothness={5} castShadow receiveShadow>
      <meshPhysicalMaterial color={color} roughness={0.32} metalness={0.25} clearcoat={1} clearcoatRoughness={0.18} />
      {edge ? <Edges color={edge} threshold={20} /> : null}
    </RoundedBox>
  );
}

/* ---------- 1. Platformika: the logo tile, a gold coin-dot and orbiting people ---------- */
function pShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 0); s.lineTo(0, 2); s.lineTo(0.8, 2); s.absarc(0.8, 1.4, 0.6, Math.PI / 2, -Math.PI / 2, true);
  s.lineTo(0.42, 0.8); s.lineTo(0.42, 0); s.lineTo(0, 0);
  const hole = new THREE.Path(); hole.absarc(0.8, 1.4, 0.26, 0, Math.PI * 2, false); s.holes.push(hole);
  return s;
}
function Platformika() {
  const orbit = useRef<THREE.Group>(null!);
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(pShape(), { depth: 0.28, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 4, curveSegments: 32 });
    g.center(); return g;
  }, []);
  const people = useMemo(() => Array.from({ length: 9 }, (_, i) => ({ a: (i / 9) * Math.PI * 2, r: 1.95 + (i % 3) * 0.18, y: 0.55 + (i % 2) * 0.35, c: ['#FF5A72', '#F2B705', '#8E85FF', '#33D196', '#FFFFFF'][i % 5] })), []);
  useFrame((_, dt) => { if (!world.reduced) orbit.current.rotation.y += dt * 0.35; });
  return (
    <PlatformShell id="pk" index={0}>
      <Glow color={C.pk} size={7.5} />
      <Slab color={C.pkDeep} />
      <RoundedBox args={[2.1, 0.22, 2.1]} radius={0.28} smoothness={5} position={[0, 0.28, 0]}>
        <meshPhysicalMaterial color={C.pk} roughness={0.2} metalness={0.15} clearcoat={1} />
      </RoundedBox>
      <mesh geometry={geo} position={[-0.08, 0.95, 0]} rotation={[-0.35, 0, 0]} scale={0.62} castShadow>
        <meshPhysicalMaterial color="#FFFFFF" roughness={0.15} clearcoat={1} />
      </mesh>
      <mesh position={[0.62, 0.62, 0.45]} castShadow>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color={C.gold} emissive={C.gold} emissiveIntensity={0.6} metalness={0.6} roughness={0.25} />
      </mesh>
      <group ref={orbit}>
        {people.map((p, i) => (
          <group key={i} position={[Math.cos(p.a) * p.r, p.y, Math.sin(p.a) * p.r]}>
            <mesh><sphereGeometry args={[0.14, 24, 24]} /><meshStandardMaterial color={p.c} emissive={p.c} emissiveIntensity={0.35} roughness={0.35} /></mesh>
            <mesh position={[0, -0.2, 0]}><capsuleGeometry args={[0.1, 0.12, 6, 12]} /><meshStandardMaterial color={p.c} roughness={0.5} /></mesh>
          </group>
        ))}
      </group>
    </PlatformShell>
  );
}

/* ---------- 2. Complichess: a felt board, brass and ebony pieces, and the rope ---------- */
const PAWN = [[0, 0], [0.34, 0], [0.34, 0.07], [0.26, 0.12], [0.16, 0.3], [0.13, 0.48], [0.2, 0.52], [0.13, 0.56], [0.19, 0.66], [0.19, 0.78], [0.1, 0.88], [0, 0.9]];
const KING = [[0, 0], [0.38, 0], [0.38, 0.08], [0.28, 0.14], [0.2, 0.42], [0.16, 0.82], [0.26, 0.88], [0.17, 0.94], [0.24, 1.14], [0.12, 1.2], [0, 1.2]];
const QUEEN = [[0, 0], [0.37, 0], [0.37, 0.08], [0.27, 0.14], [0.19, 0.42], [0.15, 0.78], [0.25, 0.84], [0.16, 0.9], [0.27, 1.08], [0.1, 1.12], [0.08, 1.18], [0, 1.2]];
function lathe(pts: number[][]) { return new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 40); }
function Piece({ kind, at, side }: { kind: 'P' | 'K' | 'Q'; at: [number, number]; side: 'w' | 'b' }) {
  const geo = useMemo(() => lathe(kind === 'P' ? PAWN : kind === 'K' ? KING : QUEEN), [kind]);
  const x = (at[0] - 3.5) * 0.38, z = (at[1] - 3.5) * 0.38;
  const mat = side === 'w'
    ? <meshPhysicalMaterial color={C.brass} metalness={0.85} roughness={0.22} clearcoat={0.6} />
    : <meshPhysicalMaterial color={C.ebony} metalness={0.3} roughness={0.25} clearcoat={1} />;
  return (
    <group position={[x, 0.21, z]} scale={0.42}>
      <mesh geometry={geo} castShadow>{mat}</mesh>
      {kind === 'K' ? (<group position={[0, 1.36, 0]}>
        <mesh castShadow><boxGeometry args={[0.07, 0.3, 0.07]} />{mat}</mesh>
        <mesh position={[0, 0.04, 0]} castShadow><boxGeometry args={[0.22, 0.07, 0.07]} />{mat}</mesh>
      </group>) : null}
    </group>
  );
}
function Complichess() {
  const tiles = useRef<THREE.InstancedMesh>(null!);
  const ropeRef = useRef<THREE.Mesh>(null!);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), c = new THREE.Color();
    let k = 0;
    for (let f = 0; f < 8; f++) for (let r = 0; r < 8; r++) {
      m.makeTranslation((f - 3.5) * 0.38, 0.19, (r - 3.5) * 0.38); tiles.current.setMatrixAt(k, m);
      tiles.current.setColorAt(k, c.set((f + r) % 2 ? C.cream : C.felt)); k++;
    }
    tiles.current.instanceMatrix.needsUpdate = true; if (tiles.current.instanceColor) tiles.current.instanceColor.needsUpdate = true;
  }, []);
  const rope = useMemo(() => {
    const pts = [V(-1.14, 0.3, 1.33), V(-0.76, 0.42, 0.95), V(-0.38, 0.3, 1.33)];
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.045, 10, false);
  }, []);
  useFrame(({ clock }) => { if (ropeRef.current && !world.reduced) ropeRef.current.position.y = Math.sin(clock.elapsedTime * 2) * 0.02; });
  return (
    <PlatformShell id="cx" index={1}>
      <Glow color={C.brass} size={7} opacity={0.42} />
      <Slab color="#14261F" />
      <instancedMesh ref={tiles} args={[undefined, undefined, 64]} receiveShadow>
        <boxGeometry args={[0.37, 0.04, 0.37]} />
        <meshStandardMaterial roughness={0.75} />
      </instancedMesh>
      <Piece kind="K" at={[4, 0]} side="w" /><Piece kind="Q" at={[3, 0]} side="w" />
      <Piece kind="P" at={[2, 2]} side="w" /><Piece kind="P" at={[5, 3]} side="w" /><Piece kind="P" at={[4, 1]} side="w" />
      <Piece kind="K" at={[4, 7]} side="b" /><Piece kind="P" at={[3, 5]} side="b" /><Piece kind="P" at={[6, 6]} side="b" /><Piece kind="Q" at={[2, 7]} side="b" />
      <mesh ref={ropeRef} geometry={rope} castShadow><meshStandardMaterial color="#C99A5B" roughness={0.6} /></mesh>
    </PlatformShell>
  );
}

/* ---------- 3. Crypto: an unfinished wireframe slab with a spinning coin (coming soon) ---------- */
function Crypto() {
  const coin = useRef<THREE.Group>(null!);
  const ring = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }, dt) => {
    if (world.reduced) return;
    coin.current.rotation.y += dt * 1.1;
    const t = (clock.elapsedTime * 0.45) % 1;
    ring.current.scale.setScalar(0.6 + t * 2.4);
    (ring.current.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - t);
  });
  return (
    <PlatformShell id="cr" index={2}>
      <Glow color={C.mint} size={6.5} opacity={0.35} />
      <RoundedBox args={[3.5, 0.34, 3.5]} radius={0.14} smoothness={3}>
        <meshPhysicalMaterial color={C.crSlab} transparent opacity={0.45} roughness={0.1} transmission={0} />
        <Edges color={C.mint} threshold={15} />
      </RoundedBox>
      <group ref={coin} position={[0, 1.15, 0]} rotation={[0.25, 0, 0.2]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.78, 0.78, 0.13, 64]} />
          <meshPhysicalMaterial color={C.gold} metalness={0.75} roughness={0.22} clearcoat={1} emissive={C.gold} emissiveIntensity={0.18} />
        </mesh>
        <mesh><torusGeometry args={[0.6, 0.035, 12, 64]} /><meshStandardMaterial color={C.mint} emissive={C.mint} emissiveIntensity={1.4} toneMapped={false} /></mesh>
      </group>
      <mesh ref={ring} position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.95, 1, 64]} />
        <meshBasicMaterial color={C.mint} transparent opacity={0.6} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </PlatformShell>
  );
}

/* ---------- star dust ---------- */
function Dust({ count }: { count: number }) {
  const pts = useRef<THREE.Points>(null!);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry(); const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) { a[i * 3] = (Math.random() - 0.5) * 30; a[i * 3 + 1] = Math.random() * -22 + 7; a[i * 3 + 2] = Math.random() * -18 + 5; }
    g.setAttribute('position', new THREE.BufferAttribute(a, 3)); return g;
  }, [count]);
  const tex = useMemo(glowTexture, []);
  useFrame((_, dt) => { if (!world.reduced) pts.current.rotation.y += dt * 0.012; });
  return (
    <points ref={pts} geometry={geo}>
      <pointsMaterial map={tex} size={0.09} sizeAttenuation color="#B9B3FF" transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      shadows
      camera={{ fov: 35, near: 0.1, far: 80, position: [0, -2.2, 16.5] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; }}
      onPointerMissed={() => { world.hover = null; delete document.documentElement.dataset.hover; }}
      aria-hidden
    >
      <fog attach="fog" args={[C.night, 14, 40]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 8, 6]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-6, -2, 4]} intensity={30} color={C.pk} />
      <pointLight position={[6, -6, 2]} intensity={24} color={C.brass} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.4} position={[0, 5, -6]} scale={[12, 4, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.6} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#8E85FF" />
        <Lightformer form="rect" intensity={1.4} position={[6, -1, 2]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} color="#FFD27A" />
        <Lightformer form="circle" intensity={1.2} position={[0, -6, 0]} rotation-x={-Math.PI / 2} scale={6} color="#49E8C8" />
      </Environment>
      <CameraRig />
      <Platformika />
      <Complichess />
      <Crypto />
      <Dust count={world.mobile ? 500 : 1100} />
    </Canvas>
  );
}
