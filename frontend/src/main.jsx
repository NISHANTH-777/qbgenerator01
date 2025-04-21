import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import FacultyTaskProgress from './components/pages/faculty/FacultyTaskProgress.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* <FacultyTaskProgress /> */}
  </StrictMode>,
)
