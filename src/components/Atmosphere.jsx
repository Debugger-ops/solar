import { useMemo } from 'react'
import * as THREE from 'three'

// A thin, additive, back-side-rendered shell just outside the planet mesh.
// The fragment shader keys off the view-space Z of the surface normal - a
// cheap Fresnel trick - so the rim glows brightest where the surface curves
// away from the camera, exactly like the limb-brightened haze you see
// around Earth/Venus/the gas giants in real spacecraft photos, without the
// cost of real atmospheric scattering.
const vertexShader = `
varying vec3 vNormal;
void main() {
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
uniform vec3 glowColor;
uniform float intensity;
varying vec3 vNormal;
void main() {
  float rim = pow(1.0 - clamp(abs(vNormal.z), 0.0, 1.0), 2.6);
  gl_FragColor = vec4(glowColor, rim * intensity);
}
`

export default function Atmosphere({ radius, color = '#8fd0ff', intensity = 0.9, scale = 1.06 }) {
  const uniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color(color) },
      intensity: { value: intensity },
    }),
    [color, intensity],
  )

  return (
    <mesh scale={scale}>
      <sphereGeometry args={[radius, 32, 32]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
      />
    </mesh>
  )
}
