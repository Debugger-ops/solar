import { useEffect, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

// Screen-space bloom so the sun (and any other very bright pixel) actually
// looks overexposed the way it does in real spacecraft photography, instead
// of just being a flat bright texture. Uses three.js's own bundled
// postprocessing examples, so it needs no extra dependency beyond `three`,
// which this project already has.
//
// Passing a priority to useFrame hands R3F's own per-frame render call to
// us - see https://docs.pmnd.rs/react-three-fiber/api/hooks#taking-over-the-render-loop.
export default function PostFX() {
  const { gl, scene, camera, size } = useThree()

  const composer = useMemo(() => {
    const dpr = gl.getPixelRatio()
    const c = new EffectComposer(gl)
    c.addPass(new RenderPass(scene, camera))
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(size.width * dpr, size.height * dpr),
      0.55, // strength
      0.4, // radius
      0.82, // luminance threshold
    )
    c.addPass(bloom)
    c.addPass(new OutputPass())
    return c
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera])

  useEffect(() => {
    const dpr = gl.getPixelRatio()
    composer.setSize(size.width * dpr, size.height * dpr)
  }, [composer, gl, size])

  useFrame(() => {
    composer.render()
  }, 1)

  return null
}
