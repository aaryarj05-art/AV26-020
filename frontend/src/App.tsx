import { Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import SymptomChecker from './pages/SymptomChecker'
import OutbreakMap from './pages/OutbreakMap'
import Alerts from './pages/Alerts'
import PersonalRisk from './pages/PersonalRisk'
import HealthTwin from './pages/HealthTwin'

const queryClient = new QueryClient();

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
    <QueryClientProvider client={queryClient}>
      <Routes>
        {/* Landing page — no sidebar */}
        <Route path="/" element={<Landing />} />

        {/* App shell with sidebar */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/outbreak-map" element={<OutbreakMap />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/personal-risk" element={<PersonalRisk />} />
          <Route path="/health-twin" element={<HealthTwin />} />
          <Route path="/symptom-checker" element={<SymptomChecker />} />
        </Route>
      </Routes>
    </QueryClientProvider>
  )
}
