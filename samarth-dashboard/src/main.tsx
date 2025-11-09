import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// ✅ Import Leaflet CSS for maps (required)
import 'leaflet/dist/leaflet.css'

// ✅ Import Tailwind + your custom styles
import './index.css'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
