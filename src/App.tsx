import { HashRouter, Routes, Route } from 'react-router-dom'
import { SettingsProvider } from './context/SettingsContext'
import HomePage from './pages/HomePage'
import ExhibitionsPage from './pages/ExhibitionsPage'
import AdminLogin from './pages/AdminLogin'
import AdminPanel from './pages/AdminPanel'

export default function App() {
  return (
    <SettingsProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/exhibitions" element={<ExhibitionsPage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/panel" element={<AdminPanel />} />
        </Routes>
      </HashRouter>
    </SettingsProvider>
  )
}
