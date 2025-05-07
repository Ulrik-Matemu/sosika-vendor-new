import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { TabsDemo } from '../src/pages/login'
import { Dashboard } from './pages/dashboard'
import  Orders  from './pages/orders'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TabsDemo />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path='/orders' element={<Orders />} />
      </Routes>
    </Router>
  )
}

export default App
