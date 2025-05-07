import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { TabsDemo } from '../src/pages/login'
import { Dashboard } from './pages/dashboard'
import  Orders  from './pages/orders'
import VendorProfile from './pages/profile'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TabsDemo />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/profile' element={<VendorProfile />} />
      </Routes>
    </Router>
  )
}

export default App
