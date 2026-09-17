export default function Hud() {
  return (
    <>
      <div className="hud hud-title">
        <span className="tag">React &middot; react-three-fiber</span>
        <h1>Orrery</h1>
        <p>The eight planets on their real orbital periods and eccentricities. Distances and sizes are compressed to fit the screen.</p>
      </div>
      <div className="hint">drag to orbit &middot; scroll to zoom &middot; click a body for its numbers</div>
    </>
  )
}
