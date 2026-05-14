import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'

function PlaceholderPage({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-helix-text mb-1">{title}</h1>
      <p className="text-helix-text-muted mb-8">Coming soon</p>
      <div className="bg-helix-surface border border-helix-border rounded-2xl p-16 flex flex-col items-center justify-center">
        <span className="text-5xl mb-4">{icon}</span>
        <p className="text-helix-text-muted text-sm">This module will be built in upcoming phases.</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Landing page — no sidebar */}
      <Route path="/" element={<Landing />} />

      {/* App shell with sidebar */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/outbreak-map" element={<PlaceholderPage title="Outbreak Map" icon="🗺️" />} />
        <Route path="/alerts" element={<PlaceholderPage title="Alerts" icon="🚨" />} />
        <Route path="/personal-risk" element={<PlaceholderPage title="Personal Risk" icon="🛡️" />} />
        <Route path="/health-twin" element={<PlaceholderPage title="Health Twin" icon="🧬" />} />
        <Route path="/symptom-checker" element={<PlaceholderPage title="Symptom Checker" icon="🩺" />} />
      </Route>
    </Routes>
  )
}
