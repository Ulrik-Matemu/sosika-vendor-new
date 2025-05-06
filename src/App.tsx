import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { TabsDemo } from '../src/pages/login'
import { Dashboard } from './pages/dashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TabsDemo />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
