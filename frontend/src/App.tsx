import { Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense, lazy } from 'react'
import Layout from './components/Layout'

// Lazy loaded pages
const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SymptomChecker = lazy(() => import('./pages/SymptomChecker'));
const OutbreakMap = lazy(() => import('./pages/OutbreakMap'));
const Alerts = lazy(() => import('./pages/Alerts'));
const PersonalRisk = lazy(() => import('./pages/PersonalRisk'));
const HealthTwin = lazy(() => import('./pages/HealthTwin'));
const XAIView = lazy(() => import('./pages/XAIView'));
const ModelValidation = lazy(() => import('./pages/ModelValidation'));
const DataSources = lazy(() => import('./pages/DataSources'));
const StrokeGuard = lazy(() => import('./pages/StrokeGuard'));
const AlertDemo = lazy(() => import('./pages/AlertDemo'));
const CommandCenter = lazy(() => import('./pages/CommandCenter'));
const About = lazy(() => import('./pages/About'));
const Architecture = lazy(() => import('./pages/Architecture'));
const Impact = lazy(() => import('./pages/Impact'));
const Roadmap = lazy(() => import('./pages/Roadmap'));
const Simulation = lazy(() => import('./pages/Simulation'));
const ResourcePlanner = lazy(() => import('./pages/ResourcePlanner'));
const Reports = lazy(() => import('./pages/Reports'));
const Teleconsult = lazy(() => import('./pages/Teleconsult'));
const DietPlanner = lazy(() => import('./pages/DietPlanner'));
const MentalHealth = lazy(() => import('./pages/MentalHealth'));
const HealthPassport = lazy(() => import('./pages/HealthPassport'));
const EmergencyPassportView = lazy(() => import('./pages/EmergencyPassportView'));
const LearningCenter = lazy(() => import('./pages/LearningCenter'));
const Insurance = lazy(() => import('./pages/Insurance'));
const HospitalSignals = lazy(() => import('./pages/HospitalSignals'));
const DrugDiscovery = lazy(() => import('./pages/DrugDiscovery'));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
    <div className="w-12 h-12 border-4 border-helix-accent/20 border-t-helix-accent rounded-full animate-spin mb-4" />
    <p className="text-helix-text-muted text-sm font-medium tracking-widest uppercase">Initializing Module...</p>
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Landing page — no sidebar */}
          <Route path="/" element={<Landing />} />

          {/* App shell with sidebar */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/alert-demo" element={<AlertDemo />} />
            <Route path="/outbreak-map" element={<OutbreakMap />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/personal-risk" element={<PersonalRisk />} />
            <Route path="/health-twin" element={<HealthTwin />} />
            <Route path="/symptom-checker" element={<SymptomChecker />} />
            <Route path="/xai" element={<XAIView />} />
            <Route path="/validation" element={<ModelValidation />} />
            <Route path="/data-sources" element={<DataSources />} />
            <Route path="/stroke-guard" element={<StrokeGuard />} />
            <Route path="/command-center" element={<CommandCenter />} />
            <Route path="/about" element={<About />} />
            <Route path="/architecture" element={<Architecture />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/resources" element={<ResourcePlanner />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/teleconsult" element={<Teleconsult />} />
            <Route path="/diet-planner" element={<DietPlanner />} />
            <Route path="/mental-health" element={<MentalHealth />} />
            <Route path="/passport" element={<HealthPassport />} />
            <Route path="/learning-center" element={<LearningCenter />} />
            <Route path="/insurance" element={<Insurance />} />
            <Route path="/hospital-signals" element={<HospitalSignals />} />
            <Route path="/drug-discovery" element={<DrugDiscovery />} />
          </Route>
          {/* Public Route */}
          <Route path="/passport/:id" element={<EmergencyPassportView />} />
        </Routes>
      </Suspense>
    </QueryClientProvider>
  )
}
