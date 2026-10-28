'use client';
/* The three floating platforms. The camera flies from one to the next as the page scrolls
   (world.progress), leans toward the pointer, and each platform reacts to hover and click. */
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Environment, Lightformer, RoundedBox, Edges } from '@react-three/drei';
import { useMemo, useRef, useLayoutEffect, useEffect } from 'react';
import * as THREE from 'three';
import { world, PLATFORMS, smooth, clamp, type PlatformId } from '../lib/store';

const C = {
  night: '#090B1F', pk: '#5B54FF', pkDeep: '#2A238F', gold: '#F2B705', felt: '#1F4A3B', cream: '#E9DFC6',
  brass: '#D8AE57', ebony: '#1A1715', mint: '#49E8C8', crSlab: '#0E1A33', coral: '#FF7A59', lrSlab: '#3A1626', sky: '#38BDF8', trSlab: '#0B2A44', lip: '#F0507F', pnSlab: '#2B1638',
};

/* ---------- camera path ---------- */
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
function keyframe(i: number) {
  const side = world.rtl ? 1 : -1;
  if (i <= 0) return world.mobile
    ? { pos: V(0, -1.2, 33), look: V(0, -0.5, -1.6) }
    : { pos: V(side * 3.6, -1.0, 24), look: V(side * 4.4, -1.15, -1.6) };
  const p = PLATFORMS[Math.min(PLATFORMS.length - 1, i - 1)].pos;
  const sx = world.mobile ? 0 : side * 2.25;
  if (i >= PLATFORMS.length + 1) return { pos: V(p[0] + sx, p[1] - 3.5, p[2] + 11), look: V(p[0] + sx, p[1] - 5, p[2]) };
  if (world.mobile) return { pos: V(p[0], p[1] + 1.2, p[2] + 13.5), look: V(p[0], p[1] - 1.7, p[2]) };
  return { pos: V(p[0] + sx * 0.75, p[1] + 2.1, p[2] + 9.6), look: V(p[0] + sx, p[1] + 0.45, p[2]) };
}
function CameraRig() {
  const { camera } = useThree();
  const look = useRef(V(0, -2.7, -1.6));
  const tmpP = useMemo(() => new THREE.Vector3(), []);
  const tmpL = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    const p = clamp(world.progress, 0, PLATFORMS.length + 1);
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

/* Grab any part of a platform with the mouse: it follows the pointer on a plane facing the camera,
   and when released it springs back to its place and keeps floating with the rest. */
const _hit = new THREE.Vector3(), _n = new THREE.Vector3(), _loc = new THREE.Vector3();
/* the scene listens on the whole page, so ignore pointers that are really on text, buttons or panels */
const UI = 'a,button,input,textarea,select,label,[role=menu],.panel,.card,header,nav,footer,#install,#contact';
export const overUI = (e: ThreeEvent<PointerEvent | MouseEvent>) => !!(e.nativeEvent.target as Element | null)?.closest?.(UI);
export function Drag({ children, position = [0, 0, 0], rotation, scale }: {
  children: React.ReactNode; position?: [number, number, number]; rotation?: [number, number, number]; scale?: number;
}) {
  /* A part hangs from the point you grab. Grab it near its edge and it first swings round that point (like
     pulling the corner of a book), then follows; let go and it drifts back to its place very slowly. */
  const g = useRef<THREE.Group>(null!);
  const { camera } = useThree();
  const st = useMemo(() => ({
    on: false, id: -1, moved: false, rest: new THREE.Vector3(...position),
    restQ: new THREE.Quaternion().setFromEuler(new THREE.Euler(...(rotation || [0, 0, 0]))),
    arm: new THREE.Vector3(), target: new THREE.Vector3(), plane: new THREE.Plane(),
    tq: new THREE.Quaternion(), dq: new THREE.Quaternion(), axis: new THREE.Vector3(), tmp: new THREE.Vector3(), lag: new THREE.Vector3(),
  }), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { st.rest.set(...position); }, [position, st]);
  const toLocal = (v: THREE.Vector3) => g.current.parent!.worldToLocal(v);
  const down = (e: ThreeEvent<PointerEvent>) => {
    if (e.pointerType === 'touch' || world.reduced || e.button !== 0 || overUI(e)) return;  // touch keeps scrolling the page
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    camera.getWorldDirection(_n);
    st.plane.setFromNormalAndCoplanarPoint(_n, e.point);
    const hit = toLocal(_loc.copy(e.point));
    // the arm: where on the part you grabbed, measured from its centre, in its resting orientation
    st.arm.copy(hit).sub(g.current.position).applyQuaternion(st.dq.copy(g.current.quaternion).invert().premultiply(st.restQ));
    st.target.copy(hit);
    st.on = true; st.id = e.pointerId; st.moved = false;
    world.dragging = true; document.documentElement.dataset.drag = '1';
  };
  const move = (e: ThreeEvent<PointerEvent>) => {
    if (!st.on || e.pointerId !== st.id) return;
    e.stopPropagation();
    if (!e.ray.intersectPlane(st.plane, _hit)) return;
    st.target.copy(toLocal(_hit));
    st.moved = true;
  };
  const up = (e: ThreeEvent<PointerEvent>) => {
    if (!st.on || e.pointerId !== st.id) return;
    e.stopPropagation();
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    st.on = false; world.dragging = false; delete document.documentElement.dataset.drag;
    if (st.moved) world.dragEnd = performance.now();
  };
  useFrame((_, dt) => {
    const d = Math.min(dt, 1 / 30), o = g.current;
    if (st.on) {
      // where the grabbed point is now, given the part's current turn
      st.dq.copy(o.quaternion).multiply(st.tq.copy(st.restQ).invert());
      const armNow = st.tmp.copy(st.arm).applyQuaternion(st.dq);
      // the centre follows a little behind the hand…
      st.lag.copy(st.target).sub(armNow).sub(o.position);
      o.position.addScaledVector(st.lag, 1 - Math.exp(-d * 7));
      // …and the pull on an off-centre point turns the part (torque = arm × pull)
      st.axis.copy(armNow).cross(st.lag);
      const len = st.axis.length(), r = armNow.length();
      const ang = Math.min(0.85, len * 1.3) * Math.min(1, r / 0.6);
      st.tq.copy(st.restQ);
      if (len > 1e-5 && ang > 1e-3) st.tq.premultiply(st.dq.setFromAxisAngle(st.axis.multiplyScalar(1 / len), ang));
      o.quaternion.slerp(st.tq, 1 - Math.exp(-d * 9));
    } else {
      // let go: drift home slowly (a few seconds), still floating with the platform
      const k = 1 - Math.exp(-d * 0.9);
      o.position.lerp(st.rest, k);
      o.quaternion.slerp(st.restQ, k);
    }
  });
  return (
    <group ref={g} position={position} rotation={rotation} scale={scale}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      onPointerOver={(e) => { if (e.pointerType !== 'touch' && !world.reduced && !overUI(e)) document.documentElement.dataset.grab = '1'; }}
      onPointerOut={() => { delete document.documentElement.dataset.grab; }}>
      {children}
    </group>
  );
}

/* Hover/click + float wrapper used by every platform */
function PlatformShell({ id, index, children }: { id: PlatformId; index: number; children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null!);
  const pos = PLATFORMS[index].pos;
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime + index * 1.7;
    const hovered = world.hover === id && !world.dragging;
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
      onPointerOver={(e) => { e.stopPropagation(); if (overUI(e)) return; world.hover = id; document.documentElement.dataset.hover = id; }}
      onPointerOut={() => { if (world.hover === id) { world.hover = null; delete document.documentElement.dataset.hover; } }}
      onClick={(e) => { e.stopPropagation(); if (overUI(e) || performance.now() - world.dragEnd < 350) return; world.onPick?.(id); }}>
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

/* ---------- 0. Bar Lvovski Travel: a globe with a plane circling it, a suitcase and a boarding pass ---------- */
function Travel() {
  const orbit = useRef<THREE.Group>(null!);
  const globe = useRef<THREE.Mesh>(null!);
  const wing = useMemo(() => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0.42, -0.12); sh.lineTo(0.42, -0.2); sh.lineTo(0, -0.1); sh.lineTo(-0.42, -0.2); sh.lineTo(-0.42, -0.12); sh.lineTo(0, 0); return new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false }); }, []);
  useFrame((_, dt) => { if (world.reduced) return; orbit.current.rotation.y -= dt * 0.55; globe.current.rotation.y += dt * 0.15; });
  return (
    <PlatformShell id="tr" index={0}>
      <Glow color={C.sky} size={7.2} opacity={0.42} />
      <Drag><Slab color={C.trSlab} edge={C.sky} /></Drag>
      {/* globe */}
      <Drag position={[0, 1.05, 0]}>
        <mesh ref={globe} castShadow>
          <sphereGeometry args={[0.72, 48, 48]} />
          <meshPhysicalMaterial color="#1E7FD0" roughness={0.35} clearcoat={1} emissive="#0B4C86" emissiveIntensity={0.25} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.735, 0.012, 8, 64]} /><meshBasicMaterial color="#9BE3FF" /></mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.735, 0.012, 8, 64]} /><meshBasicMaterial color="#9BE3FF" /></mesh>
        <mesh rotation={[0, Math.PI / 2, Math.PI / 2]}><torusGeometry args={[0.735, 0.012, 8, 64]} /><meshBasicMaterial color="#9BE3FF" /></mesh>
      </Drag>
      {/* a plane flying round the globe */}
      <group ref={orbit} position={[0, 1.05, 0]} rotation={[0.35, 0, 0.12]}>
        <Drag position={[1.25, 0, 0]} rotation={[0, 0, 0]}>
          <group rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow><capsuleGeometry args={[0.06, 0.42, 6, 12]} /><meshStandardMaterial color="#FFFFFF" roughness={0.3} /></mesh>
            <mesh geometry={wing} position={[0, 0.06, -0.015]}><meshStandardMaterial color="#E6F4FF" roughness={0.4} /></mesh>
            <mesh position={[0, -0.24, 0.07]}><boxGeometry args={[0.02, 0.1, 0.12]} /><meshStandardMaterial color={C.sky} emissive={C.sky} emissiveIntensity={0.6} /></mesh>
          </group>
        </Drag>
      </group>
      {/* suitcase */}
      <Drag position={[-1.05, 0.55, 0.7]} rotation={[0, 0.5, 0]}>
        <RoundedBox args={[0.62, 0.46, 0.24]} radius={0.06} castShadow><meshPhysicalMaterial color="#F2B705" roughness={0.35} clearcoat={1} /></RoundedBox>
        <mesh position={[0, 0.3, 0]}><torusGeometry args={[0.09, 0.022, 8, 24, Math.PI]} /><meshStandardMaterial color="#3A2A08" /></mesh>
        <mesh position={[-0.16, 0, 0.125]}><boxGeometry args={[0.03, 0.46, 0.01]} /><meshStandardMaterial color="#B88700" /></mesh>
        <mesh position={[0.16, 0, 0.125]}><boxGeometry args={[0.03, 0.46, 0.01]} /><meshStandardMaterial color="#B88700" /></mesh>
      </Drag>
      {/* boarding pass */}
      <Drag position={[1.0, 0.32, 0.95]} rotation={[-0.9, -0.3, 0.1]}>
        <RoundedBox args={[0.78, 0.36, 0.02]} radius={0.03}><meshStandardMaterial color="#FFFFFF" roughness={0.5} /></RoundedBox>
        <mesh position={[-0.16, 0.06, 0.012]}><planeGeometry args={[0.36, 0.05]} /><meshBasicMaterial color={C.sky} /></mesh>
        <mesh position={[-0.2, -0.06, 0.012]}><planeGeometry args={[0.28, 0.035]} /><meshBasicMaterial color="#B6C2CF" /></mesh>
        <mesh position={[0.25, 0, 0.012]}><planeGeometry args={[0.012, 0.3]} /><meshBasicMaterial color="#B6C2CF" /></mesh>
      </Drag>
    </PlatformShell>
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
    <PlatformShell id="pk" index={1}>
      <Glow color={C.pk} size={7.5} />
      <Drag><Slab color={C.pkDeep} /></Drag>
      <Drag position={[0, 0.28, 0]}>
        <RoundedBox args={[2.1, 0.22, 2.1]} radius={0.28} smoothness={5}>
          <meshPhysicalMaterial color={C.pk} roughness={0.2} metalness={0.15} clearcoat={1} />
        </RoundedBox>
      </Drag>
      <Drag position={[-0.08, 0.95, 0]}>
        <mesh geometry={geo} rotation={[-0.35, 0, 0]} scale={0.62} castShadow>
          <meshPhysicalMaterial color="#FFFFFF" roughness={0.15} clearcoat={1} />
        </mesh>
      </Drag>
      <Drag position={[0.62, 0.62, 0.45]}>
        <mesh castShadow>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial color={C.gold} emissive={C.gold} emissiveIntensity={0.6} metalness={0.6} roughness={0.25} />
        </mesh>
      </Drag>
      <group ref={orbit}>
        {people.map((p, i) => (
          <Drag key={i} position={[Math.cos(p.a) * p.r, p.y, Math.sin(p.a) * p.r]}>
            <mesh><sphereGeometry args={[0.14, 24, 24]} /><meshStandardMaterial color={p.c} emissive={p.c} emissiveIntensity={0.35} roughness={0.35} /></mesh>
            <mesh position={[0, -0.2, 0]}><capsuleGeometry args={[0.1, 0.12, 6, 12]} /><meshStandardMaterial color={p.c} roughness={0.5} /></mesh>
          </Drag>
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
    <Drag position={[x, 0.21, z]} scale={0.42}>
      <mesh geometry={geo} castShadow>{mat}</mesh>
      {kind === 'K' ? (<group position={[0, 1.36, 0]}>
        <mesh castShadow><boxGeometry args={[0.07, 0.3, 0.07]} />{mat}</mesh>
        <mesh position={[0, 0.04, 0]} castShadow><boxGeometry args={[0.22, 0.07, 0.07]} />{mat}</mesh>
      </group>) : null}
    </Drag>
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
    <PlatformShell id="cx" index={2}>
      <Glow color={C.brass} size={7} opacity={0.42} />
      <Drag>
        <Slab color="#14261F" />
        <instancedMesh ref={tiles} args={[undefined, undefined, 64]} receiveShadow>
          <boxGeometry args={[0.37, 0.04, 0.37]} />
          <meshStandardMaterial roughness={0.75} />
        </instancedMesh>
      </Drag>
      <Piece kind="K" at={[4, 0]} side="w" /><Piece kind="Q" at={[3, 0]} side="w" />
      <Piece kind="P" at={[2, 2]} side="w" /><Piece kind="P" at={[5, 3]} side="w" /><Piece kind="P" at={[4, 1]} side="w" />
      <Piece kind="K" at={[4, 7]} side="b" /><Piece kind="P" at={[3, 5]} side="b" /><Piece kind="P" at={[6, 6]} side="b" /><Piece kind="Q" at={[2, 7]} side="b" />
      <Drag><mesh ref={ropeRef} geometry={rope} castShadow><meshStandardMaterial color="#C99A5B" roughness={0.6} /></mesh></Drag>
    </PlatformShell>
  );
}

/* ---------- 3. Crypto: a glass slab with a spinning coin and a pulse ring ---------- */
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
    <PlatformShell id="cr" index={3}>
      <Glow color={C.mint} size={6.5} opacity={0.35} />
      <Drag>
        <RoundedBox args={[3.5, 0.34, 3.5]} radius={0.14} smoothness={3}>
          <meshPhysicalMaterial color={C.crSlab} roughness={0.18} metalness={0.3} clearcoat={1} clearcoatRoughness={0.15} />
          <Edges color={C.mint} threshold={15} />
        </RoundedBox>
      </Drag>
      <Drag position={[0, 1.15, 0]}>
      <group ref={coin} rotation={[0.25, 0, 0.2]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.78, 0.78, 0.13, 64]} />
          <meshPhysicalMaterial color={C.gold} metalness={0.75} roughness={0.22} clearcoat={1} emissive={C.gold} emissiveIntensity={0.18} />
        </mesh>
        <mesh><torusGeometry args={[0.6, 0.035, 12, 64]} /><meshStandardMaterial color={C.mint} emissive={C.mint} emissiveIntensity={1.4} toneMapped={false} /></mesh>
      </group>
      </Drag>
      <mesh ref={ring} position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.95, 1, 64]} />
        <meshBasicMaterial color={C.mint} transparent opacity={0.6} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </PlatformShell>
  );
}

/* ---------- 4. LearnLume: an open book, a graduation cap, a video screen and orbiting flashcards ---------- */
function LearnLume() {
  const cards = useRef<THREE.Group>(null!);
  const play = useRef<THREE.Mesh>(null!);
  const tri = useMemo(() => {
    const s = new THREE.Shape(); s.moveTo(-0.13, -0.16); s.lineTo(0.19, 0); s.lineTo(-0.13, 0.16); s.lineTo(-0.13, -0.16);
    return new THREE.ShapeGeometry(s);
  }, []);
  const flash = useMemo(() => Array.from({ length: 6 }, (_, i) => ({ a: (i / 6) * Math.PI * 2, y: 0.75 + (i % 2) * 0.4, c: ['#FFFFFF', '#FFD9CC', '#FFE9A8'][i % 3] })), []);
  useFrame(({ clock }, dt) => {
    if (world.reduced) return;
    cards.current.rotation.y -= dt * 0.3;
    (play.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.9 + Math.sin(clock.elapsedTime * 3) * 0.4;
  });
  const page = <meshPhysicalMaterial color="#FFF6E8" roughness={0.55} clearcoat={0.2} />;
  return (
    <PlatformShell id="lr" index={4}>
      <Glow color={C.coral} size={7} opacity={0.4} />
      <Drag>
        <RoundedBox args={[3.5, 0.34, 3.5]} radius={0.14} smoothness={4} castShadow receiveShadow>
          <meshPhysicalMaterial color={C.lrSlab} roughness={0.35} metalness={0.35} clearcoat={1} clearcoatRoughness={0.25} />
          <Edges color={C.coral} threshold={15} />
        </RoundedBox>
      </Drag>
      {/* open book */}
      <Drag position={[-0.55, 0.3, 0.45]} rotation={[0, 0.5, 0]}>
        <group rotation={[0, 0, 0.16]} position={[-0.36, 0.05, 0]}><RoundedBox args={[0.72, 0.07, 0.95]} radius={0.03} castShadow>{page}</RoundedBox></group>
        <group rotation={[0, 0, -0.16]} position={[0.36, 0.05, 0]}><RoundedBox args={[0.72, 0.07, 0.95]} radius={0.03} castShadow>{page}</RoundedBox></group>
        <mesh position={[0, -0.01, 0]}><boxGeometry args={[1.56, 0.04, 1.02]} /><meshStandardMaterial color={C.coral} roughness={0.5} /></mesh>
      </Drag>
      {/* graduation cap */}
      <Drag position={[0.75, 0.62, -0.55]} rotation={[0.12, -0.4, 0]}>
        <mesh position={[0, -0.12, 0]} castShadow><cylinderGeometry args={[0.28, 0.32, 0.26, 32]} /><meshStandardMaterial color="#1B1424" roughness={0.45} /></mesh>
        <mesh rotation={[0, Math.PI / 4, 0]} castShadow><boxGeometry args={[0.9, 0.05, 0.9]} /><meshPhysicalMaterial color="#1B1424" roughness={0.35} clearcoat={1} /></mesh>
        <mesh position={[0.32, -0.12, 0.32]}><cylinderGeometry args={[0.02, 0.02, 0.26, 8]} /><meshStandardMaterial color={C.gold} emissive={C.gold} emissiveIntensity={0.5} /></mesh>
        <mesh position={[0.32, -0.28, 0.32]}><sphereGeometry args={[0.05, 16, 16]} /><meshStandardMaterial color={C.gold} emissive={C.gold} emissiveIntensity={0.6} /></mesh>
      </Drag>
      {/* the video screen */}
      <Drag position={[0.55, 0.85, 0.75]} rotation={[-0.12, -0.25, 0]}>
        <RoundedBox args={[1.05, 0.68, 0.07]} radius={0.05} castShadow><meshPhysicalMaterial color="#120B16" roughness={0.2} clearcoat={1} /></RoundedBox>
        <mesh position={[0, 0, 0.045]}><planeGeometry args={[0.92, 0.55]} /><meshStandardMaterial color="#2A1420" emissive={C.coral} emissiveIntensity={0.18} /></mesh>
        <mesh ref={play} geometry={tri} position={[0.02, 0, 0.05]}><meshStandardMaterial color="#FFFFFF" emissive={C.coral} emissiveIntensity={1} toneMapped={false} /></mesh>
      </Drag>
      {/* flashcards */}
      <group ref={cards}>
        {flash.map((f, i) => (
          <Drag key={i} position={[Math.cos(f.a) * 2.05, f.y, Math.sin(f.a) * 2.05]} rotation={[0.2, -f.a, 0.15]}>
            <RoundedBox args={[0.42, 0.28, 0.02]} radius={0.02}><meshStandardMaterial color={f.c} roughness={0.5} /></RoundedBox>
            <mesh position={[0, 0.04, 0.012]}><planeGeometry args={[0.28, 0.03]} /><meshBasicMaterial color={C.coral} /></mesh>
            <mesh position={[-0.03, -0.04, 0.012]}><planeGeometry args={[0.22, 0.025]} /><meshBasicMaterial color="#C9B8B0" /></mesh>
          </Drag>
        ))}
      </group>
    </PlatformShell>
  );
}

/* ---------- 5. Penina: a pearl that reads your chat, with two speech bubbles leaning on it ---------- */
function Penina() {
  const pearl = useRef<THREE.Mesh>(null!);
  const bubbles = useRef<THREE.Group>(null!);
  const dots = useRef<THREE.Group>(null!);
  useFrame(({ clock }, dt) => {
    if (world.reduced) return;
    pearl.current.rotation.y += dt * 0.35;
    bubbles.current.position.y = Math.sin(clock.elapsedTime * 1.3) * 0.06;
    dots.current.children.forEach((d, i) => { d.position.y = Math.max(0, Math.sin(clock.elapsedTime * 5 - i * 0.7)) * 0.06; });
  });
  const bubble = (w: number, h: number) => {
    const s = new THREE.Shape(); const r = h / 2;
    s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.absarc(w / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2, false);
    s.lineTo(-w / 2 + r, h / 2); s.absarc(-w / 2 + r, 0, r, Math.PI / 2, Math.PI * 1.5, false);
    return new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 3 });
  };
  const b1 = useMemo(() => bubble(1.2, 0.46), []);
  const b2 = useMemo(() => bubble(0.9, 0.4), []);
  return (
    <PlatformShell id="pn" index={5}>
      <Glow color={C.lip} size={6.5} opacity={0.4} />
      <Drag><Slab color={C.pnSlab} edge={C.lip} /></Drag>
      <Drag position={[-0.35, 0.95, 0]}>
        <mesh ref={pearl} castShadow>
          <sphereGeometry args={[0.78, 64, 64]} />
          <meshPhysicalMaterial color="#F6EAF3" roughness={0.12} metalness={0.05} clearcoat={1} clearcoatRoughness={0.05} iridescence={1} iridescenceIOR={1.6} iridescenceThicknessRange={[200, 700]} sheen={1} sheenColor="#FFC6DA" />
        </mesh>
      </Drag>
      <group ref={bubbles}>
        <Drag position={[0.95, 1.55, 0.35]} rotation={[0, -0.35, 0.05]}>
          <mesh geometry={b1} castShadow><meshPhysicalMaterial color={C.lip} roughness={0.3} clearcoat={1} /></mesh>
          <group ref={dots} position={[0, 0, 0.12]}>
            {[-0.25, 0, 0.25].map((x) => (<mesh key={x} position={[x, 0, 0]}><sphereGeometry args={[0.06, 16, 16]} /><meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.4} /></mesh>))}
          </group>
        </Drag>
        <Drag position={[1.05, 0.85, 0.9]} rotation={[0, -0.6, -0.05]}>
          <mesh geometry={b2} castShadow><meshPhysicalMaterial color="#F7EFF5" roughness={0.35} clearcoat={0.6} /></mesh>
          <mesh position={[-0.05, 0.05, 0.12]}><planeGeometry args={[0.5, 0.05]} /><meshBasicMaterial color="#B9A0C2" /></mesh>
          <mesh position={[-0.12, -0.07, 0.12]}><planeGeometry args={[0.36, 0.05]} /><meshBasicMaterial color="#B9A0C2" /></mesh>
        </Drag>
      </group>
    </PlatformShell>
  );
}

/* ---------- star dust ---------- */
function Dust({ count }: { count: number }) {
  const pts = useRef<THREE.Points>(null!);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry(); const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) { a[i * 3] = (Math.random() - 0.5) * 30; a[i * 3 + 1] = Math.random() * -32 + 7; a[i * 3 + 2] = Math.random() * -18 + 5; }
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
      shadows="percentage"
      camera={{ fov: 35, near: 0.1, far: 80, position: [0, -2.2, 16.5] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; }}
      eventSource={typeof document !== 'undefined' ? document.body : undefined}
      eventPrefix="client"
      onPointerMissed={() => { world.hover = null; delete document.documentElement.dataset.hover; delete document.documentElement.dataset.grab; }}
      aria-hidden
    >
      <fog attach="fog" args={[C.night, 14, 40]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 8, 6]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-6, -2, 4]} intensity={30} color={C.pk} />
      <pointLight position={[6, -6, 2]} intensity={24} color={C.brass} />
      <pointLight position={[-7, -14, -2]} intensity={22} color={C.coral} />
      <pointLight position={[-6, 3, 4]} intensity={22} color={C.sky} />
      <pointLight position={[6, -17, -4]} intensity={20} color={C.lip} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.4} position={[0, 5, -6]} scale={[12, 4, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.6} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#8E85FF" />
        <Lightformer form="rect" intensity={1.4} position={[6, -1, 2]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} color="#FFD27A" />
        <Lightformer form="circle" intensity={1.2} position={[0, -6, 0]} rotation-x={-Math.PI / 2} scale={6} color="#49E8C8" />
      </Environment>
      <CameraRig />
      <Travel />
      <Platformika />
      <Complichess />
      <Crypto />
      <LearnLume />
      <Penina />
      <Dust count={world.mobile ? 500 : 1100} />
    </Canvas>
  );
}
