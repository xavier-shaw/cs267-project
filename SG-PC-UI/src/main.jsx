import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

window.BACKEND_SG_URL = 'http://localhost:8000'
window.BACKEND_PC_URL = 'http://localhost:8001'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)