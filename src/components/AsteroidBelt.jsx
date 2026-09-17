import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// A sparse ring of points between Mars and Jupiter, where the real asteroid
// belt sits. Purely decorative, but a genuine feature of the solar system
// rather than filler.
export default function AsteroidBelt({ innerRadius = 31, outerRadius = 38, count = 700 }) {
  const groupRef = useRef()

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = innerRadius + Math.random() * (outerRadius - innerRadius)
      const a = Math.random() * Math.PI * 2
      arr[i * 3] = Math.cos(a) * r
      arr[i * 3 + 1] = (Math.random() - 0.5) * 1.1
      arr[i * 3 + 2] = Math.sin(a) * r
    }
    return arr
  }, [innerRadius, outerRadius, count])

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.01
  })

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="#8d8577" size={0.16} sizeAttenuation transparent opacity={0.7} />
      </points>
    </group>
  )
}
