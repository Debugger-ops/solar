import { useMemo } from 'react'
import * as THREE from 'three'
import { ringTexture } from '../three/textures'

export default function Rings({ innerRadius, outerRadius, tiltDeg }) {
  const texture = useMemo(() => ringTexture(), [])
  const geometry = useMemo(() => new THREE.RingGeometry(innerRadius, outerRadius, 64), [innerRadius, outerRadius])

  return (
    <mesh geometry={geometry} rotation={[Math.PI / 2, 0, THREE.MathUtils.degToRad(tiltDeg)]}>
      <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  )
}
