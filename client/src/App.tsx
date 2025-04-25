import Dashboard from './pages/Dashboard'
import WeaveBoxLanding from './pages/Landing'
import Upload from './pages/Upload'
import Uploads from './pages/Uploads'
import ArweaveFiles from './pages/ArweaveFiles'
import GoogleDrive from './pages/GoogleDrive'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WeaveBoxLanding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/uploads" element={<Uploads />} />
          <Route path="/arweavefiles" element={<ArweaveFiles />} />
          <Route path="/google-drive" element={<GoogleDrive />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
