import { useMemo } from 'react'
import { Line } from '@react-three/drei'

// Draws the true ellipse for a planet's orbit (sun sits at one focus, not
// the center) so eccentric orbits like Mercury's visibly aren't circles.
export default function OrbitPath({ a, ecc, visible }) {
  const points = useMemo(() => {
    const b = a * Math.sqrt(1 - ecc * ecc)
    const focusOffset = a * ecc
    const pts = []
    for (let i = 0; i <= 128; i++) {
      const t = (i / 128) * Math.PI * 2
      pts.push([Math.cos(t) * a - focusOffset, 0, Math.sin(t) * b])
    }
    return pts
  }, [a, ecc])

  if (!visible) return null
  return <Line points={points} color="#5a6478" transparent opacity={0.35} lineWidth={1} />
}
