import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { mercuryTexture } from '../three/textures'
import { useSolarStore } from '../store/useOrreryStore'
import { registerBody } from '../three/bodyRegistry'
import OrbitPath from './OrbitPath'

// A moon: same orbiting-holder + spinning-mesh trick as Planet.jsx, but
// nested inside its parent's holder group in Scene.jsx / Planet.jsx, so it
// automatically rides along with the planet's own orbit around the sun
// (its position here is entirely relative to the parent). Orbits are drawn
// circular (ecc 0) since real moon eccentricities are small enough not to
// matter at this scale. Almost every large moon is tidally locked, so
// `tidalLocked` pins the mesh's spin to its orbital angle instead of an
// independent rotation speed.
export default function Moon({ data }) {
  const holderRef = useRef()
  const meshRef = useRef()
  const angleRef = useRef(Math.random() * Math.PI * 2)

  const daysPerSecond = useSolarStore((s) => s.daysPerSecond)
  const running = useSolarStore((s) => s.running)
  const showOrbits = useSolarStore((s) => s.showOrbits)
  const showLabels = useSolarStore((s) => s.showLabels)
  const select = useSolarStore((s) => s.select)
  const selected = useSolarStore((s) => s.selected)

  const texture = useMemo(() => (data.cratered ? mercuryTexture(data.color) : null), [data.cratered, data.color])

  useFrame((_, delta) => {
    if (running) {
      angleRef.current += ((delta * daysPerSecond) / data.periodDays) * Math.PI * 2
    }
    const x = Math.cos(angleRef.current) * data.distance
    const z = Math.sin(angleRef.current) * data.distance
    holderRef.current.position.set(x, 0, z)
    if (meshRef.current) {
      if (data.tidalLocked) meshRef.current.rotation.y = angleRef.current
      else meshRef.current.rotation.y += delta * (data.spin || 1)
    }
  })

  const isSelected = selected === data.name

  return (
    <>
      <OrbitPath a={data.distance} ecc={0} visible={showOrbits} />
      <group
        ref={(node) => {
          holderRef.current = node
          registerBody(data.name, node)
        }}
      >
        <mesh
          ref={meshRef}
          rotation={[0, 0, ((data.tiltDeg || 0) * Math.PI) / 180]}
          onClick={(e) => {
            e.stopPropagation()
            select(data.name)
          }}
        >
          <sphereGeometry args={[data.radius, 20, 20]} />
          {texture ? (
            <meshStandardMaterial map={texture} roughness={0.92} metalness={0.02} />
          ) : (
            <meshStandardMaterial color={data.color} roughness={0.92} metalness={0.02} />
          )}
        </mesh>

        {showLabels && (
          <Html position={[0, data.radius * 1.8 + 0.15, 0]} center distanceFactor={22} occlude>
            <div className={`planet-label${isSelected ? ' active' : ''}`}>
              <span>{data.name}</span>
            </div>
          </Html>
        )}
      </group>
    </>
  )
}
