import { useState } from 'react'
import './styles/App.css'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import WeightTracker from './pages/WeightTracker'
import NutritionLogger from './pages/NutritionLogger'
import AppleHealthConnect from './pages/AppleHealthConnect'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'weight':
        return <WeightTracker />
      case 'nutrition':
        return <NutritionLogger />
      case 'apple-health':
        return <AppleHealthConnect />
      default:
        return <Dashboard />
    }
  }

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderPage()}
    </Layout>
  )
}

export default App
