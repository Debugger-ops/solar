import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import Sun from './Sun'
import Planet from './Planet'
import AsteroidBelt from './AsteroidBelt'
import { PLANETS, SUN } from '../data/planets'
import { useSolarStore } from '../store/useOrreryStore'

export default function Scene() {
  const select = useSolarStore((s) => s.select)

  return (
    <Canvas
      camera={{ position: [-30, 42, 100], fov: 50, near: 0.1, far: 600 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onPointerMissed={() => select(null)}
    >
      <color attach="background" args={['#04050a']} />
      <fogExp2 attach="fog" args={['#04050a', 0.0032]} />

      <ambientLight color={0x223047} intensity={0.55} />
      <Stars radius={200} depth={80} count={2200} factor={2} saturation={0} fade speed={0.3} />

      <Sun radius={SUN.radius} />
      <AsteroidBelt />

      {PLANETS.map((planet) => (
        <Planet key={planet.name} data={planet} />
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.07}
        minDistance={12}
        maxDistance={240}
        enablePan={false}
        target={[0, 0, 0]}
      />
    </Canvas>
  )
}
