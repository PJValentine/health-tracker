import { useState } from 'react'
import './App.css'

function App() {
    const [count, setCount] = useState(0)

  return (
    <div className="App">
      <h1>Health Tracker</h1>
      <p>Welcome to your personal health, fitness, and nutrition tracker</p>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  )
}

export default App
