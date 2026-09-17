import { useMemo } from 'react'

// Earth is the one body lit specifically by the sun's actual direction
// rather than just the scene's ambient + point light like every other
// planet: this blends the lit-side day map with a night/city-lights map
// based on the angle between the surface normal and the direction to the
// sun. The sun always sits at the world origin in this scene, so that
// direction simplifies to -vWorldPosition - no uniform to keep in sync.
const vertexShader = `
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;
void main() {
  vUv = uv;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`

const fragmentShader = `
uniform sampler2D dayMap;
uniform sampler2D nightMap;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;
void main() {
  vec3 sunDir = normalize(-vWorldPosition);
  float ndotl = dot(normalize(vWorldNormal), sunDir);
  float mixAmt = smoothstep(-0.12, 0.18, ndotl);
  vec3 dayColor = texture2D(dayMap, vUv).rgb;
  vec3 nightColor = texture2D(nightMap, vUv).rgb;
  gl_FragColor = vec4(mix(nightColor, dayColor, mixAmt), 1.0);
}
`

export default function EarthMaterial({ dayMap, nightMap }) {
  const uniforms = useMemo(
    () => ({
      dayMap: { value: dayMap },
      nightMap: { value: nightMap },
    }),
    [dayMap, nightMap],
  )

  return <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
}
