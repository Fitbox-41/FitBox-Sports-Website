import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Identify requests from the website UI so the shared auth backend can tell a
// website sign-in from an app sign-in (used to segregate users in the admin).
axios.defaults.headers.common['X-Client'] = 'web'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
