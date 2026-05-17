import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense, lazy } from 'react'
import Layout from './components/Layout'

// Lazy loaded pages (7 core pages)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const OutbreakMap = lazy(() => import('./pages/OutbreakMap'));
const Predictions = lazy(() => import('./pages/Predictions'));
const Alerts = lazy(() => import('./pages/Alerts'));
const SymptomReports = lazy(() => import('./pages/SymptomReports'));
const Simulation = lazy(() => import('./pages/Simulation'));
const Reports = lazy(() => import('./pages/Reports'));
const Upgrade = lazy(() => import('./pages/Upgrade'));
import { ChatBotProvider } from './components/ChatBotProvider';
import ChatBot from './components/ChatBot';

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in bg-[#0C1220]">
    <div className="w-10 h-10 border-2 border-[#3B82F6]/20 border-t-[#3B82F6] rounded-full animate-spin mb-4" />
    <p className="text-[#8A9BB0] text-[11px] font-semibold uppercase tracking-widest">Helix Intelligence</p>
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChatBotProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
          {/* Default route redirects to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* App shell with sidebar */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/outbreak-map" element={<OutbreakMap />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/symptom-reports" element={<SymptomReports />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/upgrade" element={<Upgrade />} />
          </Route>

          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
      <ChatBot />
      </ChatBotProvider>
    </QueryClientProvider>
  )
}
