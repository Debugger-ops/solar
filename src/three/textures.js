// Small procedural canvas textures, so the whole project ships with zero
// external image assets. Each function returns a THREE.CanvasTexture.
import * as THREE from 'three'

export function bandedTexture(baseColor, accentColor, bands) {
  const c = document.createElement('canvas')
  c.width = 4
  c.height = 256
  const ctx = c.getContext('2d')
  const base = new THREE.Color(baseColor)
  const accent = new THREE.Color(accentColor)
  for (let y = 0; y < 256; y++) {
    const t = ((Math.sin(y * bands * 0.12) + 1) / 2) * 0.5 + ((Math.sin(y * 0.03) + 1) / 2) * 0.5
    const col = base.clone().lerp(accent, t * 0.7)
    ctx.fillStyle = `rgb(${(col.r * 255) | 0},${(col.g * 255) | 0},${(col.b * 255) | 0})`
    ctx.fillRect(0, y, 4, 1)
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  return tex
}

export function earthTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 128
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#3f7bd0'
  ctx.fillRect(0, 0, 256, 128)
  ctx.fillStyle = '#4f9e5c'
  const blobs = [
    [40, 30, 26],
    [70, 80, 20],
    [140, 40, 30],
    [180, 90, 22],
    [210, 55, 16],
    [100, 100, 18],
    [20, 90, 14],
  ]
  blobs.forEach(([x, y, r]) => {
    ctx.beginPath()
    for (let a = 0; a < Math.PI * 2; a += 0.4) {
      const rr = r * (0.7 + Math.random() * 0.6)
      const px = x + Math.cos(a) * rr
      const py = y + Math.sin(a) * rr * 0.7
      a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.fill()
  })
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.fillRect(0, 0, 256, 10)
  ctx.fillRect(0, 118, 256, 10)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export function ringTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 4
  const ctx = c.getContext('2d')
  const grad = ctx.createLinearGradient(0, 0, 256, 0)
  grad.addColorStop(0.0, 'rgba(227,201,143,0)')
  grad.addColorStop(0.18, 'rgba(227,201,143,0.75)')
  grad.addColorStop(0.34, 'rgba(200,180,140,0.25)')
  grad.addColorStop(0.5, 'rgba(227,201,143,0.7)')
  grad.addColorStop(0.68, 'rgba(180,160,120,0.2)')
  grad.addColorStop(0.85, 'rgba(227,201,143,0.6)')
  grad.addColorStop(1.0, 'rgba(227,201,143,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 256, 4)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export function sunTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#ffcf6b'
  ctx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * 256
    const y = Math.random() * 256
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,235,190,0.35)' : 'rgba(214,120,30,0.25)'
    ctx.beginPath()
    ctx.arc(x, y, 1 + Math.random() * 2.5, 0, Math.PI * 2)
    ctx.fill()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export function glowTexture(color) {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')
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
