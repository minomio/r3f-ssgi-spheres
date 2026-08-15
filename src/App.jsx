import * as THREE from "three";
import { useRef, useReducer, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { BallCollider, Physics, RigidBody } from "@react-three/rapier";
import { easing } from "maath";
import { Effects } from "./Effects";

const BASE_SPHERES = 18
const BASE_Z = 30
const EXIT_DELAY = 1500 // ms before unmounting exited spheres

const accents = ["#ff4060", "#ffcc00", "#20ffa0", "#4060ff"];

const shuffle = (accent = 0) => [
  { color: "#444", roughness: 0.1, metalness: 0.5 },
  { color: "#444", roughness: 0.1, metalness: 0.5 },
  { color: "#444", roughness: 0.1, metalness: 0.5 },
  { color: "white", roughness: 0.1, metalness: 0.1 },
  { color: "white", roughness: 0.1, metalness: 0.1 },
  { color: "white", roughness: 0.1, metalness: 0.1 },
  { color: accents[accent], roughness: 0.1, accent: true },
  { color: accents[accent], roughness: 0.1, accent: true },
  { color: accents[accent], roughness: 0.1, accent: true },
  { color: "#444", roughness: 0.1 },
  { color: "#444", roughness: 0.3 },
  { color: "#444", roughness: 0.3 },
  { color: "white", roughness: 0.1 },
  { color: "white", roughness: 0.2 },
  { color: "white", roughness: 0.1 },
  { color: accents[accent], roughness: 0.1, accent: true, transparent: true, opacity: 0.8 },
  { color: accents[accent], roughness: 0.3, accent: true },
  { color: accents[accent], roughness: 0.1, accent: true },
];

function ZoomTracker({ onCountChange }) {
  const { camera } = useThree()
  const last = useRef(BASE_SPHERES)
  useFrame(() => {
    const z = camera.position.z
    camera.far = z * 10
    camera.updateProjectionMatrix()
    const next = Math.max(BASE_SPHERES, Math.round(BASE_SPHERES * (z / BASE_Z)))
    if (next !== last.current) {
      last.current = next
      onCountChange(next)
    }
  })
  return null
}

export default function App(props) {
  const [accent, click] = useReducer((state) => ++state % accents.length, 0);
  const basePattern = useMemo(() => shuffle(accent), [accent]);

  // targetCount follows zoom; renderedCount only shrinks after exit animation
  const [targetCount, setTargetCount] = useState(BASE_SPHERES)
  const [renderedCount, setRenderedCount] = useState(BASE_SPHERES)
  const exitTimer = useRef(null)

  useEffect(() => {
    if (targetCount >= renderedCount) {
      // Zooming out: show new spheres immediately, cancel any pending removal
      if (exitTimer.current) { clearTimeout(exitTimer.current); exitTimer.current = null }
      setRenderedCount(targetCount)
    } else {
      // Zooming in: let exiting spheres fly out, then unmount
      if (exitTimer.current) clearTimeout(exitTimer.current)
      exitTimer.current = setTimeout(() => {
        setRenderedCount(targetCount)
        exitTimer.current = null
      }, EXIT_DELAY)
    }
  }, [targetCount])

  return (
    <Canvas
      flat
      shadows
      onClick={click}
      dpr={[1, 1.5]}
      gl={{ antialias: false }}
      camera={{ position: [0, 0, 30], fov: 17.5, near: 1, far: 100000 }}
      {...props}
    >
      <color attach="background" args={["#141622"]} />
      <Physics timeStep="vary" gravity={[0, 0, 0]}>
        <Pointer />
        <ZoomTracker onCountChange={setTargetCount} />
        {Array.from({ length: renderedCount }, (_, i) => {
          const spread = (Math.floor(i / BASE_SPHERES) + 1) * 10
          const exiting = i >= targetCount
          return <Sphere key={i} {...basePattern[i % basePattern.length]} spread={spread} exiting={exiting} />
        })}
      </Physics>
      <Environment resolution={256}>
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer form="circle" intensity={100} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} />
          <Lightformer form="ring" color="#4060ff" intensity={80} onUpdate={(self) => self.lookAt(0, 0, 0)} position={[10, 10, 0]} scale={10} />
        </group>
      </Environment>
      <OrbitControls enableRotate={false} enablePan={false} />
      <Effects />
      <FixEnvMap />
    </Canvas>
  );
}

function FixEnvMap() {
  const { scene } = useThree()
  useEffect(() => {
    if (scene.environment) scene.environment.type = THREE.HalfFloatType
  })
  return null
}

function Sphere({
  position,
  spread = 10,
  exiting = false,
  children,
  vec = new THREE.Vector3(),
  scale,
  r = THREE.MathUtils.randFloatSpread,
  accent,
  color = "white",
  ...props
}) {
  const api = useRef(null);
  const ref = useRef(null);
  const pos = useMemo(() => position || [r(spread), r(spread), r(spread)], []);
  useFrame((state, delta) => {
    delta = Math.min(0.1, delta);
    if (exiting) {
      // Push outward — reverse of the normal inward pull
      api.current?.applyImpulse(
        vec.copy(api.current.translation()).multiplyScalar(0.4),
        false,
      )
    } else {
      // Pull toward center
      api.current?.applyImpulse(
        vec.copy(api.current.translation()).negate().multiplyScalar(0.2),
        false,
      )
    }
    easing.dampC(ref.current.material.color, color, 0.2, delta);
  });
  return (
    <RigidBody linearDamping={4} angularDamping={1} friction={0.1} position={pos} ref={api} colliders={false}>
      <BallCollider args={[1]} />
      <mesh ref={ref} castShadow receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial {...props} />
        {children}
      </mesh>
    </RigidBody>
  );
}

function Pointer({ vec = new THREE.Vector3() }) {
  const ref = useRef(null);
  useFrame(({ mouse, viewport }) =>
    ref.current?.setNextKinematicTranslation(
      vec.set(
        (mouse.x * viewport.width) / 2,
        (mouse.y * viewport.height) / 2,
        0,
      ),
    ),
  );
  return (
    <RigidBody position={[0, 0, 0]} type="kinematicPosition" colliders={false} ref={ref}>
      <BallCollider args={[1]} />
    </RigidBody>
  );
}
