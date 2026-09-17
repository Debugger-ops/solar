import { factsFor, findBody, moonFactsFor } from '../data/planets'
import { useSolarStore } from '../store/useOrreryStore'

export default function InfoCard() {
  const selected = useSolarStore((s) => s.selected)

  if (!selected) {
    return (
      <div className="card">
        <p className="hint-inline">Click the sun, any planet, or a moon to see its numbers.</p>
      </div>
    )
  }

  const found = findBody(selected)
  if (!found) return null
  const { kind, body, parent } = found

  const facts = kind === 'sun' ? body.facts : kind === 'moon' ? moonFactsFor(body, parent) : factsFor(body)
  const swatch = '#' + body.color.toString(16).padStart(6, '0')

  return (
    <div className="card">
      <div className="name">
        <span className="swatch" style={{ background: swatch }} />
        <span>{body.name}</span>
        {kind === 'moon' && <span className="dwarf-badge">moon</span>}
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
