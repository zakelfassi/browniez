import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useCallback } from 'react'
import { Player } from '../components/Player'
import { useAudioEngine } from '../hooks/useAudioEngine'
import '../components/Player.css'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { toggle } = useAudioEngine()

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Space to toggle play/pause (but not when typing in an input)
      if (
        e.code === 'Space' &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault()
        toggle()
      }
    },
    [toggle]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return <Player />
}
