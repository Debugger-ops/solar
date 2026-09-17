import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sunTexture, glowTexture, coronaTexture } from '../three/textures'
import { useSolarStore } from '../store/useOrreryStore'
import { registerBody } from '../three/bodyRegistry'

export default function Sun({ radius = 6 }) {
  const meshRef = useRef()
  const glowRef = useRef()
  const texture = useMemo(() => sunTexture(), [])
  const glow = useMemo(() => glowTexture(0xffcf6b), [])
  const corona = useMemo(() => coronaTexture(0xff9d3d), [])
  const select = useSolarStore((s) => s.select)

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.05
    if (glowRef.current) {
      // A slow, subtle pulse keeps the star feeling alive rather than static.
      const pulse = 1 + Math.sin(performance.now() * 0.0006) * 0.015
      glowRef.current.scale.setScalar(radius * 4.3 * pulse)
    }
  })

  return (
    <group ref={(node) => registerBody('Sun', node)}>
      <pointLight color={0xfff2d6} intensity={6.5} decay={0} />
      <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); select('Sun') }}>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      <sprite scale={[radius * 6.5, radius * 6.5, 1]}>
        <spriteMaterial map={corona} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite ref={glowRef} scale={[radius * 4.3, radius * 4.3, 1]}>
        <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  )
}
