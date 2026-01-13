import { createFileRoute } from '@tanstack/react-router'
import { Player } from '../components/Player'
import '../components/Player.css'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return <Player />
}
