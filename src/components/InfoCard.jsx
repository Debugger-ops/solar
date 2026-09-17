import { PLANETS, SUN, factsFor } from '../data/planets'
import { useSolarStore } from '../store/useOrreryStore'

export default function InfoCard() {
  const selected = useSolarStore((s) => s.selected)

  if (!selected) {
    return (
      <div className="card">
        <p className="hint-inline">Click the sun or any planet to see its numbers.</p>
      </div>
    )
  }

  const body = selected === 'Sun' ? SUN : PLANETS.find((p) => p.name === selected)
  if (!body) return null

  const facts = selected === 'Sun' ? body.facts : factsFor(body)
  const swatch = '#' + body.color.toString(16).padStart(6, '0')

  return (
    <div className="card">
      <div className="name">
        <span className="swatch" style={{ background: swatch }} />
        <span>{body.name}</span>
      </div>
      <dl>
        {facts.map(([k, v]) => (
          <div className="fact" key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <p className="note">{body.note}</p>
    </div>
  )
}
