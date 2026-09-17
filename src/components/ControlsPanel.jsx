import { useOrreryStore } from '../store/useOrreryStore'

export default function ControlsPanel() {
  const daysPerSecond = useOrreryStore((s) => s.daysPerSecond)
  const running = useOrreryStore((s) => s.running)
  const showOrbits = useOrreryStore((s) => s.showOrbits)
  const showLabels = useOrreryStore((s) => s.showLabels)
  const setSpeed = useOrreryStore((s) => s.setSpeed)
  const toggleRunning = useOrreryStore((s) => s.toggleRunning)
  const toggleOrbits = useOrreryStore((s) => s.toggleOrbits)
  const toggleLabels = useOrreryStore((s) => s.toggleLabels)

  return (
    <div className="controls" role="group" aria-label="Orrery controls">
      <h2>Mechanism</h2>

      <div className="row">
        <span className="row-label">Time &middot; days / sec</span>
        <span className="row-value">{daysPerSecond}</span>
      </div>
      <div className="row">
        <input
          type="range"
          min="1"
          max="240"
          step="1"
          value={daysPerSecond}
          onChange={(e) => setSpeed(Number(e.target.value))}
          aria-label="Simulation speed in days per second"
          style={{ width: '100%' }}
        />
      </div>

      <div className="row">
        <span className="row-label">Running</span>
        <button
          className="iconbtn"
          onClick={toggleRunning}
          aria-pressed={running}
          aria-label={running ? 'Pause simulation' : 'Resume simulation'}
        >
          {running ? '❚❚' : '▶'}
        </button>
      </div>

      <div className="row">
        <span className="row-label">Orbit paths</span>
        <input
          type="checkbox"
          className="toggle"
          checked={showOrbits}
          onChange={toggleOrbits}
          aria-label="Toggle orbit paths"
        />
      </div>

      <div className="row">
        <span className="row-label">Labels</span>
        <input
          type="checkbox"
          className="toggle"
          checked={showLabels}
          onChange={toggleLabels}
          aria-label="Toggle planet labels"
        />
      </div>
    </div>
  )
}
