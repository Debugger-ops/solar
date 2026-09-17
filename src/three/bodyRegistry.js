// A plain (non-reactive) registry mapping each body's name to its live
// Object3D. The camera rig needs to know where the selected body currently
// is every frame (it keeps orbiting even while focused); routing that
// through React state would re-render the whole tree 60x/sec, so instead
// each Planet/Sun registers its own group here on mount and the camera rig
// just reads positions directly out of the scene graph.
const registry = new Map()

export function registerBody(name, object3D) {
  if (object3D) registry.set(name, object3D)
  else registry.delete(name)
}

export function getBodyPosition(name, target) {
  const obj = registry.get(name)
  if (!obj) return null
  return obj.getWorldPosition(target)
}
