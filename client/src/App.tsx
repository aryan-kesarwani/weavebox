import Dashboard from './pages/Dashboard'
import Landing from './pages/Landing'
import { BrowserRouter, Routes, Route } from 'react-router-dom'


function App() {
  

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
