# Orrery

A scaled 3D solar system, built with React + [react-three-fiber](https://docs.pmnd.rs/react-three-fiber) (Three.js) and [drei](https://github.com/pmndrs/drei), scaffolded with Vite.

Real orbital periods and eccentricities drive the animation; distances and planet sizes are compressed so the whole system fits on screen. Click any body for its numbers (distance, period, eccentricity, relative size).

## Setup

Requires Node 18+.

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (typically `http://localhost:5173`).

Other scripts:

```bash
npm run build     # production build to dist/
npm run preview   # serve the production build locally
npm run lint      # oxlint
```

`node_modules` isn't included in this download — `npm install` regenerates it from `package.json`, which is the normal way JS/React projects are shared (node_modules is large, platform-specific, and fully reproducible from the lockfile-less `package.json` here; run `npm install` once and you're set).

## Project structure

```
src/
  data/planets.js        Real orbital data (distance, period, eccentricity, radius, color, notes)
  three/textures.js       Procedural canvas textures (banded gas giants, Earth, Saturn's rings, sun, glow) — no image assets
  store/useOrreryStore.js Zustand store: simulation speed, play/pause, orbit/label visibility, selected body
  components/
    Scene.jsx             The <Canvas> — camera, lights, starfield, OrbitControls, maps over PLANETS
    Sun.jsx                Sun mesh + point light + glow sprite
    Planet.jsx             One orbiting, spinning planet + its label + optional rings
    Rings.jsx               Saturn's ring geometry/material
    OrbitPath.jsx           The elliptical orbit line for one planet
    AsteroidBelt.jsx        Point cloud between Mars and Jupiter
    Hud.jsx                 Title/description overlay
    InfoCard.jsx            Bottom-left data card for the selected body
    ControlsPanel.jsx      Bottom-right speed/play/orbit/label controls
  App.jsx / App.css        Layout and all styling
```

## Extending it

A few common additions, and where they'd go:

- **Add a body** (a ninth planet, a dwarf planet, a moon): add an entry to `PLANETS` in `src/data/planets.js`. `Scene.jsx` maps over that array automatically, so a new top-level body needs nothing else. A moon is easiest as a small `Planet`-like mesh nested *inside* an existing planet's `<group ref={holderRef}>` in `Planet.jsx`, orbiting the planet the same way planets orbit the sun.
- **New controls** (e.g. a "focus camera on selected body" button, a texture-quality toggle): add state + an action to `useOrreryStore.js`, then read it wherever it's needed — no prop drilling required.
- **Real planet textures**: swap the procedural textures in `three/textures.js` for `useLoader(TextureLoader, url)` calls (drei also has a `useTexture` hook that does this for you).
- **Camera fly-to on click**: in `Planet.jsx`'s `onClick`, in addition to `select(data.name)`, you could store the clicked body's live position and animate `camera.position`/`controls.target` toward it in a `useFrame` in `Scene.jsx`.
- **Moons, comets, spacecraft trajectories**: follow the `Planet.jsx` pattern — a holder `group` for the orbit position, a spinning mesh inside it — since that's the whole trick behind every orbiting body here.

## Notes

- No image assets: gas-giant bands, Earth's continents, Saturn's rings and the sun's surface are all generated at runtime with `<canvas>` (see `three/textures.js`). Swap in real texture files anytime.
- Distances (`distanceDisplay`) and sizes (`radius`) are compressed for visibility; `distanceAU` and `earthRadii` on each planet hold the real ratios, shown in the info card.
- The scene renders in a single dark theme by design (deep space doesn't have a sensible light mode).
