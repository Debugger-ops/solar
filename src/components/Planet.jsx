import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import {
  bandedTexture,
  earthTexture,
  earthNightTexture,
  mercuryTexture,
  venusTexture,
  marsTexture,
  iceGiantTexture,
  plutoTexture,
} from '../three/textures'
import { useSolarStore } from '../store/useOrreryStore'
import { registerBody } from '../three/bodyRegistry'
import Rings from './Rings'
import OrbitPath from './OrbitPath'
import Moon from './Moon'
import Atmosphere from './Atmosphere'
import EarthMaterial from './EarthMaterial'

// One planet: an orbiting holder (the ellipse math lives here), a spinning
// mesh inside it, optional rings/atmosphere/moons, and an HTML label that
// stays anchored to its 3D position. The whole thing sits inside two static
// rotation groups - longitude of ascending node, then inclination - so the
// orbit plane itself is tilted to the body's real inclination instead of
// every orbit sitting flat on y=0. To add a moon, push an entry onto that
// planet's `moonBodies` array in data/planets.js; Moon.jsx handles the rest.
export default function Planet({ data }) {
  const holderRef = useRef()
  const meshRef = useRef()
  const angleRef = useRef(Math.random() * Math.PI * 2)

  const daysPerSecond = useSolarStore((s) => s.daysPerSecond)
  const running = useSolarStore((s) => s.running)
  const showOrbits = useSolarStore((s) => s.showOrbits)
  const showLabels = useSolarStore((s) => s.showLabels)
  const select = useSolarStore((s) => s.select)
  const selected = useSolarStore((s) => s.selected)

  const a = data.distanceDisplay
  const b = useMemo(() => a * Math.sqrt(1 - data.ecc * data.ecc), [a, data.ecc])
  const focusOffset = a * data.ecc

  // Every body gets a procedural, non-repeating surface generated from its
  // `map` field - see three/textures.js for what each one draws.
  const texture = useMemo(() => {
    switch (data.map) {
      case 'earth':
        return earthTexture()
      case 'mercury':
        return mercuryTexture(data.color)
      case 'venus':
        return venusTexture(data.color)
      case 'mars':
        return marsTexture(data.color)
      case 'ice':
        return iceGiantTexture(data.color)
      case 'pluto':
        return plutoTexture(data.color)
      case 'bands':
        return bandedTexture(data.color, 0xffffff, 10, data.spot)
      default:
        return null
    }
  }, [data.map, data.color, data.spot])

  // Earth alone uses a real sun-angle day/night shader instead of the
  // scene's ambient/point light, so it needs a second, night-side map.
  const nightTexture = useMemo(() => (data.map === 'earth' ? earthNightTexture() : null), [data.map])

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
    <group rotation={[0, THREE.MathUtils.degToRad(data.lonAscNodeDeg || 0), 0]}>
      <group rotation={[THREE.MathUtils.degToRad(data.inclDeg || 0), 0, 0]}>
        <OrbitPath a={a} ecc={data.ecc} visible={showOrbits} />
        <group
          ref={(node) => {
            holderRef.current = node
            registerBody(data.name, node)
          }}
        >
          <mesh
            ref={meshRef}
            rotation={[0, 0, THREE.MathUtils.degToRad(data.tiltDeg)]}
            onClick={(e) => {
              e.stopPropagation()
              select(data.name)
            }}
          >
            <sphereGeometry args={[data.radius, 32, 32]} />
            {data.map === 'earth' ? (
              <EarthMaterial dayMap={texture} nightMap={nightTexture} />
            ) : texture ? (
              <meshStandardMaterial map={texture} roughness={0.85} metalness={0.05} />
            ) : (
              <meshStandardMaterial color={data.color} roughness={0.85} metalness={0.05} />
            )}
          </mesh>

          {data.rings && (
            <Rings innerRadius={data.radius * 1.4} outerRadius={data.radius * 2.3} tiltDeg={data.tiltDeg} />
          )}

          {data.atmosphereGlow && (
            <Atmosphere
              radius={data.radius}
              color={data.atmosphereGlow.color}
              intensity={data.atmosphereGlow.intensity}
            />
          )}

          {data.moonBodies?.map((moon) => (
            <Moon key={moon.name} data={moon} />
          ))}

          {showLabels && (
            <Html position={[0, data.radius * 1.6 + 0.3, 0]} center distanceFactor={40} occlude>
              <div className={`planet-label${isSelected ? ' active' : ''}`}>
                <span>{data.name}</span>
                {data.dwarf && <span className="dwarf-badge">dwarf</span>}
              </div>
            </Html>
          )}
        </group>
      </group>
    </group>
  )
}
