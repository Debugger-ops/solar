import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useSolarStore } from '../store/useOrreryStore'
import { findBody } from '../data/planets'
import { getBodyPosition } from '../three/bodyRegistry'

const OVERVIEW_TARGET = new THREE.Vector3(0, 0, 0)
const OVERVIEW_DISTANCE = 113 // matches the initial establishing-shot camera position

function focusDistanceFor(body) {
  if (!body) return OVERVIEW_DISTANCE
  // Frame rings too, not just the sphere. The floor scales with the body's
  // own radius (rather than a fixed number) so a tiny moon like Deimos can
  // still be approached closely instead of being stranded behind a
  // planet-sized minimum distance.
  const visualRadius = body.rings ? body.radius * 2.3 : body.radius
  return THREE.MathUtils.clamp(visualRadius * 4.8, Math.max(visualRadius * 2.4, 0.8), 65)
}

// Click a body -> fly the camera to it. Every frame this eases the orbit
// target onto the body's live (still-orbiting, still-moon-orbiting)
// position and eases the zoom distance to a framing distance for its size,
// but leaves the camera's current viewing angle alone, so a click reads as
// "zoom into this body" rather than a hard cut to some fixed angle.
// Clicking empty space (or nothing having been clicked yet) eases back out
// to the whole-system view.
export default function CameraRig({ controlsRef }) {
  const selected = useSolarStore((s) => s.selected)
  const hasFocused = useSolarStore((s) => s.hasFocused)
  const { camera } = useThree()
  const liveTarget = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    const controls = controlsRef.current
    if (!controls) return

    const name = hasFocused ? selected : null
    const found = name ? findBody(name) : null
    const body = found ? found.body : null

    let rawTarget = OVERVIEW_TARGET
    if (name) {
      const pos = getBodyPosition(name, liveTarget.current)
      if (pos) rawTarget = pos
    }

    // Frame-rate independent easing (1 - e^-kt) rather than a fixed lerp
    // factor, so the fly-to takes the same amount of time regardless of fps.
    const followT = 1 - Math.exp(-3.2 * delta)
    controls.target.lerp(rawTarget, followT)

    const desired = focusDistanceFor(body)
    const offset = camera.position.clone().sub(controls.target)
    const currentDist = offset.length() || 1
    const zoomT = 1 - Math.exp(-2.4 * delta)
    const nextDist = THREE.MathUtils.lerp(currentDist, desired, zoomT)
    offset.multiplyScalar(nextDist / currentDist)
    camera.position.copy(controls.target).add(offset)

    controls.update()
  })

  return null
}
