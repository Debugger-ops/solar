import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { bandedTexture, earthTexture } from '../three/textures'
import { useOrreryStore } from '../store/useOrreryStore'
import Rings from './Rings'
import OrbitPath from './OrbitPath'

// One planet: an orbiting holder (the ellipse math lives here), a spinning
// mesh inside it, optional rings, and an HTML label that stays anchored to
// its 3D position. To add a moon, nest a second, smaller orbiting group
// inside `holderRef`'s children the same way this nests the mesh + rings.
export default function Planet({ data }) {
  const holderRef = useRef()
  const meshRef = useRef()
  const angleRef = useRef(Math.random() * Math.PI * 2)

  const daysPerSecond = useOrreryStore((s) => s.daysPerSecond)
  const running = useOrreryStore((s) => s.running)
  const showOrbits = useOrreryStore((s) => s.showOrbits)
  const showLabels = useOrreryStore((s) => s.showLabels)
  const select = useOrreryStore((s) => s.select)
  const selected = useOrreryStore((s) => s.selected)

  const a = data.distanceDisplay
  const b = useMemo(() => a * Math.sqrt(1 - data.ecc * data.ecc), [a, data.ecc])
  const focusOffset = a * data.ecc

  const texture = useMemo(() => {
    if (data.map === 'earth') return earthTexture()
    if (data.map === 'bands') return bandedTexture(data.color, 0xffffff, 10)
    return null
  }, [data.map, data.color])

  useFrame((_, delta) => {
    if (running) {
      angleRef.current += ((delta * daysPerSecond) / data.periodDays) * Math.PI * 2
    }
    const x = Math.cos(angleRef.current) * a - focusOffset
    const z = Math.sin(angleRef.current) * b
    holderRef.current.position.set(x, 0, z)
    if (meshRef.current) meshRef.current.rotation.y += delta * data.spin
  })

  const isSelected = selected === data.name

  return (
    <>
      <OrbitPath a={a} ecc={data.ecc} visible={showOrbits} />
      <group ref={holderRef}>
        <mesh
          ref={meshRef}
          rotation={[0, 0, THREE.MathUtils.degToRad(data.tiltDeg)]}
          onClick={(e) => {
            e.stopPropagation()
            select(data.name)
          }}
        >
          <sphereGeometry args={[data.radius, 32, 32]} />
          {texture ? (
            <meshStandardMaterial map={texture} roughness={0.85} metalness={0.05} />
          ) : (
            <meshStandardMaterial color={data.color} roughness={0.85} metalness={0.05} />
          )}
        </mesh>

        {data.rings && (
          <Rings innerRadius={data.radius * 1.4} outerRadius={data.radius * 2.3} tiltDeg={data.tiltDeg} />
        )}

        {showLabels && (
          <Html position={[0, data.radius * 1.6 + 0.3, 0]} center distanceFactor={40} occlude>
            <div className={`planet-label${isSelected ? ' active' : ''}`}>{data.name}</div>
          </Html>
        )}
      </group>
    </>
  )
}
