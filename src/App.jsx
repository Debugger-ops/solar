import Scene from './components/Scene'
import Hud from './components/Hud'
import InfoCard from './components/InfoCard'
import ControlsPanel from './components/ControlsPanel'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <Scene />
      <Hud />
      <InfoCard />
      <ControlsPanel />
    </div>
  )
}
