import Dashboard from './pages/Dashboard'
import Landing from './pages/Landing'
import Upload from './pages/Upload'
import { BrowserRouter, Routes, Route } from 'react-router-dom'


function App() {
  

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
