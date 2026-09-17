// Small procedural canvas textures, so the whole project ships with zero
// external image assets. Each function returns a THREE.CanvasTexture.
//
// A shared value-noise/fbm helper drives most of the surface detail below
// (craters, cloud swirls, gas-giant turbulence, terrain mottling) so every
// body gets an organic, non-repeating look instead of flat color or plain
// sine bands.
import * as THREE from 'three'

function hash(x, y, seed) {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123
  return s - Math.floor(s)
}

function valueNoise(x, y, seed) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const tl = hash(xi, yi, seed)
  const tr = hash(xi + 1, yi, seed)
  const bl = hash(xi, yi + 1, seed)
  const br = hash(xi + 1, yi + 1, seed)
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const top = tl + (tr - tl) * u
  const bottom = bl + (br - bl) * u
  return top + (bottom - top) * v
}

// Fractal Brownian motion: layers of value noise at rising frequency for
// natural-looking, non-repeating detail. Returns roughly 0..1.
function fbm(x, y, octaves = 4, seed = 0) {
  let total = 0
  let amp = 0.5
  let freq = 1
  let max = 0
  for (let i = 0; i < octaves; i++) {
    total += valueNoise(x * freq, y * freq, seed + i * 17.3) * amp
    max += amp
    amp *= 0.5
    freq *= 2
  }
  return total / max
}

function makeCanvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')]
}

function toCanvasTexture(c, { wrap = true } = {}) {
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  if (wrap) tex.wrapS = THREE.RepeatWrapping
  return tex
}

function polarCaps(ctx, w, h, { top = 0.12, bottom = 0.1, alpha = 0.95 } = {}) {
  const cap = ctx.createLinearGradient(0, 0, 0, h * top)
  cap.addColorStop(0, `rgba(255,255,255,${alpha})`)
  cap.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = cap
  ctx.fillRect(0, 0, w, h * top)
  ctx.save()
  ctx.translate(0, h)
  ctx.scale(1, -1)
  const capB = ctx.createLinearGradient(0, 0, 0, h * bottom)
  capB.addColorStop(0, `rgba(255,255,255,${alpha})`)
  capB.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = capB
  ctx.fillRect(0, 0, w, h * bottom)
  ctx.restore()
}

// --- Jupiter / Saturn: turbulent latitude bands, with an optional Great
// Red Spot-style storm for Jupiter. ---
export function bandedTexture(baseColor, accentColor, bands, spot = false) {
  const W = 256
  const H = 128
  const [c, ctx] = makeCanvas(W, H)
  const base = new THREE.Color(baseColor)
  const accent = new THREE.Color(accentColor)
  const img = ctx.createImageData(W, H)
  for (let y = 0; y < H; y++) {
    const turb = (fbm(y * 0.05, 0, 3, 7) - 0.5) * 16
    for (let x = 0; x < W; x++) {
      const wave = (Math.sin((y + turb) * bands * 0.055) + 1) / 2
      const detail = fbm(x * 0.05, y * 0.14, 3, 12)
      const t = Math.min(1, wave * 0.65 + detail * 0.35)
      const col = base.clone().lerp(accent, t)
      const i = (y * W + x) * 4
      img.data[i] = col.r * 255
      img.data[i + 1] = col.g * 255
      img.data[i + 2] = col.b * 255
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  if (spot) {
    const sx = W * 0.26
    const sy = H * 0.6
    const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, W * 0.1)
    grad.addColorStop(0, 'rgba(196,88,52,0.9)')
    grad.addColorStop(0.65, 'rgba(196,88,52,0.45)')
    grad.addColorStop(1, 'rgba(196,88,52,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.ellipse(sx, sy, W * 0.1, H * 0.12, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  return toCanvasTexture(c)
}

// --- Earth: noise-shaped coastlines instead of hand-placed blobs, a thin
// cloud layer, and soft polar caps. ---
export function earthTexture() {
  const W = 256
  const H = 128
  const [c, ctx] = makeCanvas(W, H)
  const oceanDeep = new THREE.Color(0x163d73)
  const ocean = new THREE.Color(0x2f6bb8)
  const land = new THREE.Color(0x4f9e5c)
  const landDry = new THREE.Color(0xb0964f)
  const img = ctx.createImageData(W, H)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const n = fbm(x * 0.045, y * 0.045, 5, 14)
      let col
      if (n > 0.56) {
        col = land.clone().lerp(landDry, Math.min(1, (n - 0.56) * 2.6))
      } else {
        col = oceanDeep.clone().lerp(ocean, Math.min(1, n / 0.56))
      }
      const i = (y * W + x) * 4
      img.data[i] = col.r * 255
      img.data[i + 1] = col.g * 255
      img.data[i + 2] = col.b * 255
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const cl = fbm(x * 0.08 + 100, y * 0.08 + 100, 4, 77)
      if (cl > 0.6) {
        ctx.fillStyle = `rgba(255,255,255,${Math.min(0.5, (cl - 0.6) * 1.7)})`
        ctx.fillRect(x, y, 1, 1)
      }
    }
  }
  polarCaps(ctx, W, H, { top: 0.12, bottom: 0.1, alpha: 0.95 })
  return toCanvasTexture(c)
}

// --- Earth's night side: near-black with city-light clusters seeded from
// the same landmass noise as earthTexture(), so lights only show up on
// "land". Blended in by EarthMaterial.jsx based on sun angle. ---
export function earthNightTexture() {
  const W = 256
  const H = 128
  const [c, ctx] = makeCanvas(W, H)
  const img = ctx.createImageData(W, H)
  for (let i = 0; i < img.data.length; i += 4) {
    img.data[i] = 2
    img.data[i + 1] = 2
    img.data[i + 2] = 6
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const land = fbm(x * 0.045, y * 0.045, 5, 14)
      if (land <= 0.58) continue
      const cluster = fbm(x * 0.15 + 300, y * 0.15 + 300, 3, 88)
      if (cluster <= 0.6) continue
      const b = Math.min(1, (cluster - 0.6) * 3)
      ctx.fillStyle = `rgba(255, ${190 + Math.floor(b * 40)}, ${110 + Math.floor(b * 40)}, ${0.45 + b * 0.5})`
      ctx.fillRect(x, y, 1, 1)
    }
  }
  return toCanvasTexture(c)
}

// --- Mercury: cratered rocky surface, no atmosphere to soften anything. ---
export function mercuryTexture(baseColor = 0x9c948a) {
  const W = 256
  const H = 128
  const [c, ctx] = makeCanvas(W, H)
  const base = new THREE.Color(baseColor)
  const img = ctx.createImageData(W, H)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const n = fbm(x * 0.06, y * 0.06, 5, 11)
      const shade = 0.55 + n * 0.55
      const col = base.clone().multiplyScalar(shade)
      const i = (y * W + x) * 4
      img.data[i] = Math.min(255, col.r * 255)
      img.data[i + 1] = Math.min(255, col.g * 255)
      img.data[i + 2] = Math.min(255, col.b * 255)
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const craterCount = 90
  for (let i = 0; i < craterCount; i++) {
    const cx = Math.random() * W
    const cy = Math.random() * H
    const r = 1.4 + Math.random() * 6.5
    const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r)
    grad.addColorStop(0, 'rgba(0,0,0,0.32)')
    grad.addColorStop(0.6, 'rgba(0,0,0,0.16)')
    grad.addColorStop(0.78, 'rgba(255,255,255,0.14)')
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
  }
  return toCanvasTexture(c)
}

// --- Venus: thick, fast-swirling cloud deck, no surface visible. ---
export function venusTexture(baseColor = 0xe8cda2) {
  const W = 256
  const H = 128
  const [c, ctx] = makeCanvas(W, H)
  const base = new THREE.Color(baseColor)
  const bright = base.clone().lerp(new THREE.Color(0xfff8e2), 0.65)
  const img = ctx.createImageData(W, H)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const swirl = fbm(x * 0.03 + Math.sin(y * 0.09) * 7, y * 0.05, 4, 21)
      const col = base.clone().lerp(bright, swirl)
      const i = (y * W + x) * 4
      img.data[i] = col.r * 255
      img.data[i + 1] = col.g * 255
      img.data[i + 2] = col.b * 255
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return toCanvasTexture(c)
}

// --- Mars: rusty regolith, darker basaltic plains, small polar ice caps. ---
export function marsTexture(baseColor = 0xb5502e) {
  const W = 256
  const H = 128
  const [c, ctx] = makeCanvas(W, H)
  const base = new THREE.Color(baseColor)
  const dark = base.clone().multiplyScalar(0.52)
  const img = ctx.createImageData(W, H)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const n = fbm(x * 0.045, y * 0.045, 5, 5)
      const col = base.clone().lerp(dark, Math.max(0, n - 0.45) * 1.3)
      const i = (y * W + x) * 4
      img.data[i] = col.r * 255
      img.data[i + 1] = col.g * 255
      img.data[i + 2] = col.b * 255
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  polarCaps(ctx, W, H, { top: 0.11, bottom: 0.08, alpha: 0.9 })
  return toCanvasTexture(c)
}

// --- Uranus / Neptune: smooth, cold methane atmosphere with faint banding. ---
export function iceGiantTexture(baseColor = 0x9fd8e0) {
  const W = 256
  const H = 128
  const [c, ctx] = makeCanvas(W, H)
  const base = new THREE.Color(baseColor)
  const bright = base.clone().lerp(new THREE.Color(0xffffff), 0.4)
  const img = ctx.createImageData(W, H)
  for (let y = 0; y < H; y++) {
    const band = (Math.sin(y * 0.09) + 1) / 2
    for (let x = 0; x < W; x++) {
      const n = fbm(x * 0.025, y * 0.06, 3, 33)
      const t = band * 0.5 + n * 0.5
      const col = base.clone().lerp(bright, t * 0.5)
      const i = (y * W + x) * 4
      img.data[i] = col.r * 255
      img.data[i + 1] = col.g * 255
      img.data[i + 2] = col.b * 255
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return toCanvasTexture(c)
}

// --- Pluto: mottled icy-rock dwarf planet, with a nod to Tombaugh Regio,
// the bright "heart" Pluto is best known for. ---
export function plutoTexture(baseColor = 0xcbb69c) {
  const W = 256
  const H = 128
  const [c, ctx] = makeCanvas(W, H)
  const base = new THREE.Color(baseColor)
  const dark = base.clone().multiplyScalar(0.58)
  const light = base.clone().lerp(new THREE.Color(0xfaf3e6), 0.75)
  const img = ctx.createImageData(W, H)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const n = fbm(x * 0.05, y * 0.05, 5, 44)
      let col = base
      if (n > 0.6) col = base.clone().lerp(dark, (n - 0.6) * 2)
      else if (n < 0.35) col = base.clone().lerp(light, (0.35 - n) * 2)
      const i = (y * W + x) * 4
      img.data[i] = col.r * 255
      img.data[i + 1] = col.g * 255
      img.data[i + 2] = col.b * 255
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  ctx.fillStyle = 'rgba(250,240,222,0.55)'
  ctx.beginPath()
  ctx.ellipse(W * 0.62, H * 0.58, W * 0.14, H * 0.22, 0, 0, Math.PI * 2)
  ctx.fill()
  return toCanvasTexture(c)
}

export function ringTexture() {
  const [c, ctx] = makeCanvas(256, 4)
  const grad = ctx.createLinearGradient(0, 0, 256, 0)
  grad.addColorStop(0.0, 'rgba(227,201,143,0)')
  grad.addColorStop(0.14, 'rgba(227,201,143,0.72)')
  grad.addColorStop(0.28, 'rgba(200,180,140,0.2)')
  grad.addColorStop(0.36, 'rgba(55,46,36,0.55)') // Cassini division
  grad.addColorStop(0.42, 'rgba(227,201,143,0.78)')
  grad.addColorStop(0.6, 'rgba(200,180,140,0.22)')
  grad.addColorStop(0.75, 'rgba(227,201,143,0.65)')
  grad.addColorStop(0.9, 'rgba(180,160,120,0.2)')
  grad.addColorStop(1.0, 'rgba(227,201,143,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 256, 4)
  return toCanvasTexture(c, { wrap: false })
}

// --- Sun: fractal granulation, a few dark sunspot clusters, bright faculae. ---
export function sunTexture() {
  const W = 320
  const H = 160
  const [c, ctx] = makeCanvas(W, H)
  const hot = new THREE.Color(0xfff2c4)
  const mid = new THREE.Color(0xffcf6b)
  const cool = new THREE.Color(0xd9660f)
  const spotColor = new THREE.Color(0x7a2c05)
  const img = ctx.createImageData(W, H)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const n = fbm(x * 0.05, y * 0.05, 5, 3)
      const spots = fbm(x * 0.02 + 40, y * 0.02 + 40, 3, 9)
      let col = mid.clone().lerp(hot, Math.max(0, n - 0.5) * 1.6)
      col = col.lerp(cool, Math.max(0, 0.42 - n) * 1.4)
      if (spots > 0.63) col = col.lerp(spotColor, (spots - 0.63) * 2.4)
      const i = (y * W + x) * 4
      img.data[i] = Math.min(255, col.r * 255)
      img.data[i + 1] = Math.min(255, col.g * 255)
      img.data[i + 2] = Math.min(255, col.b * 255)
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  for (let i = 0; i < 550; i++) {
    const x = Math.random() * W
    const y = Math.random() * H
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,246,214,0.4)' : 'rgba(255,214,140,0.25)'
    ctx.beginPath()
    ctx.arc(x, y, 0.6 + Math.random() * 1.8, 0, Math.PI * 2)
    ctx.fill()
  }
  return toCanvasTexture(c)
}

export function glowTexture(color) {
  const [c, ctx] = makeCanvas(256, 256)
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  const col = new THREE.Color(color)
  const rgb = `${(col.r * 255) | 0},${(col.g * 255) | 0},${(col.b * 255) | 0}`
  grad.addColorStop(0, `rgba(${rgb},0.9)`)
  grad.addColorStop(0.4, `rgba(${rgb},0.28)`)
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(c)
}

// A softer, wider halo layered behind glowTexture's tighter core for a more
// convincing corona.
export function coronaTexture(color) {
  const [c, ctx] = makeCanvas(256, 256)
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  const col = new THREE.Color(color)
  const rgb = `${(col.r * 255) | 0},${(col.g * 255) | 0},${(col.b * 255) | 0}`
  grad.addColorStop(0, `rgba(${rgb},0.35)`)
  grad.addColorStop(0.5, `rgba(${rgb},0.12)`)
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(c)
}
