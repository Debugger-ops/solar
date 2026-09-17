import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sunTexture, glowTexture } from '../three/textures'
import { useSolarStore } from '../store/useSolarStore'

export default function Sun({ radius = 6 }) {
  const meshRef = useRef()
  const texture = useMemo(() => sunTexture(), [])
  const glow = useMemo(() => glowTexture(0xffcf6b), [])
  const select = useSolarStore((s) => s.select)

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.05
  })

  return (
    <group>
      <pointLight color={0xfff2d6} intensity={6.5} decay={0} />
      <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); select('Sun') }}>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      <sprite scale={[radius * 4.3, radius * 4.3, 1]}>
        <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  )
}
