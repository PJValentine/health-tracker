import { useState } from 'react'
import './App.css'

function App() {
    const [count, setCount] = useState(0)

  return (
        <div className="App">
              <h1>Health Tracker</h1>h1>
              <p>Welcome to your personal health, fitness, and nutrition tracker</p>p>
              <button onClick={() => setCount(count + 1)}>
                      Count: {count}
              </button>button>
        </div>div>
      )
}

export default App</div>
