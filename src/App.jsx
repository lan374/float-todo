import { useEffect } from 'react'
import { useTodoStore } from './store/useTodoStore'
import { MainWindow } from './pages/MainWindow'
import { CardWindow } from './pages/CardWindow'

export default function App() {
  const init = useTodoStore(s => s.init)

  useEffect(() => { init() }, [])

  const hash = window.location.hash
  const cardMatch = hash.match(/^#\/card\/(.+)$/)

  if (cardMatch) {
    return <CardWindow listId={cardMatch[1]} />
  }

  return <MainWindow />
}
