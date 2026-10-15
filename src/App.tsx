import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { UiSwitcherModal } from './components/UiSwitcherModal';
import { StreakBadge } from './components/StreakBadge';
import { StreakModal } from './components/StreakModal';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import StartInterview from './pages/StartInterview';
import VoicePoweredOrbDemo from './pages/VoicePoweredOrbDemo';
import InterviewRoom from './pages/InterviewRoom';
import Report from './pages/Report';
import AdminDashboard from './pages/AdminDashboard';
import AssessmentDashboardPage from './pages/AssessmentDashboardPage';
import { MultimodalSocraticHub } from './pages/MultimodalSocraticHub';
import { AdaptiveAssessmentPage } from './pages/AdaptiveAssessmentPage';
import { LearnerModelPage } from './pages/LearnerModelPage';
import { RevisionStudioPage } from './pages/RevisionStudioPage';
import { StudyCalendarPage } from './pages/StudyCalendarPage';
import { SystemEvaluationPage } from './pages/SystemEvaluationPage';
import { StarkInterviewPage } from './pages/StarkInterviewPage';
import {
  LayoutDashboard,
  Play,
  ShieldAlert,
  LogOut,
  Activity,
  BrainCircuit,
  BookOpen,
  GraduationCap,
  GitBranch,
  RotateCw,
  Calendar as CalendarIcon,
  Target,
  Palette,
  Radio
} from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({ children, requireAdmin }) => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-mono">
        <Activity className="animate-spin text-brand-cyan mb-2" size={32} />
        <span className="text-sm text-zinc-400">CONNECTING TO KODEXIS LAB...</span>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.role === 'ROLE_CANDIDATE' && !user.isOnboarded && window.location.pathname !== '/onboard') {
    return <Navigate to="/onboard" replace />;
  }

  if (requireAdmin && user.role !== 'ROLE_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { themeConfig, isSwitcherOpen, setIsSwitcherOpen } = useTheme();
  const [isStreakModalOpen, setIsStreakModalOpen] = React.useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user?.role === 'ROLE_ADMIN'
    ? [{ name: 'Admin Console', path: '/admin', icon: ShieldAlert }]
    : [
        { name: 'Dashboard Console', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Proficiency Analytics', path: '/assessment-dashboard', icon: Activity },
        { name: 'Elsa AI Interview', path: '/elsa', icon: Radio },
        { name: 'Knowledge & Socratic AI (RAG)', path: '/knowledge', icon: BookOpen },
        { name: 'Adaptive Assessment', path: '/assessment', icon: GraduationCap },
        { name: 'Learner Model & DAG', path: '/learner-model', icon: GitBranch },
        { name: 'Targeted Revision', path: '/revision', icon: RotateCw },
        { name: 'Study Calendar', path: '/calendar', icon: CalendarIcon },
        { name: 'RAGAS & Cohort Eval', path: '/system-eval', icon: Target },
        { name: 'Interview Lab', path: '/start-interview', icon: Play },
      ];

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex flex-col md:flex-row font-sans">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-background-panel border-r border-border flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 border-b border-border flex items-center space-x-2.5">
            <div className="relative flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-8 h-8 filter drop-shadow-[0_0_8px_rgba(34,211,238,0.35)]" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="sidebar-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <polygon points="50,8 86,29 86,71 50,92 14,71 14,29" stroke="url(#sidebar-logo-grad)" strokeWidth="3" strokeLinejoin="round" className="opacity-40" />
                <polygon points="50,15 80,32 80,68 50,85 20,68 20,32" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeLinejoin="round" />
                <path d="M 36 38 L 24 50 L 36 62" stroke="#22d3ee" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 64 38 L 76 50 L 64 62" stroke="#8b5cf6" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 44 42 C 48 46, 52 54, 56 58" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 56 42 C 52 46, 48 54, 44 58" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="50" cy="50" r="4" fill="#22d3ee" />
              </svg>
            </div>
            <div>
              <h1 className="text-md font-mono font-bold tracking-widest text-zinc-100 uppercase">KODEXIS</h1>
              <p className="text-[9px] text-zinc-500 font-mono tracking-tight">INTERVIEW LAB V1.0</p>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded text-sm font-mono transition ${
                    isActive
                      ? 'bg-zinc-800/50 text-brand-cyan border-l-2 border-brand-cyan'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          {/* Daily Practice Streak Badge */}
          <div className="p-4 border-t border-border">
            <StreakBadge onClick={() => setIsStreakModalOpen(true)} />
          </div>

          {/* UI Theme Switcher Quick Bar */}
          <div className="px-4 pb-4">
            <button
              onClick={() => setIsSwitcherOpen(true)}
              className="w-full p-2.5 rounded-lg border border-border bg-background hover:border-brand-cyan/50 hover:bg-background-elevated transition flex items-center justify-between text-left group"
            >
              <div className="flex items-center space-x-2.5">
                <div 
                  className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: themeConfig.accentColor }}
                />
                <div>
                  <p className="text-[11px] font-mono font-bold text-zinc-200 group-hover:text-brand-cyan transition">
                    {themeConfig.name}
                  </p>
                  <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">
                    {themeConfig.category} Mode · Switch
                  </p>
                </div>
              </div>
              <span className="p-1 rounded bg-zinc-800 text-zinc-400 group-hover:text-zinc-200 transition">
                <Palette size={13} />
              </span>
            </button>
          </div>

          {/* Status readouts at sidebar bottom */}
          <div className="p-4 border-t border-border space-y-4">
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-zinc-500 uppercase">Telemetry Status</p>
              <div className="space-y-1.5 font-mono text-[10px]">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Activity size={10} className="text-brand-cyan" /> Piston API:
                  </span>
                  <span className="text-brand-emerald flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse"></span> ONLINE
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <BrainCircuit size={10} className="text-brand-violet" /> Assessment Brain:
                  </span>
                  <span className="text-brand-emerald flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse"></span> READY
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-border/50">
              <div className="truncate pr-2">
                <p className="text-xs font-semibold text-zinc-300 truncate">{user?.fullName}</p>
                <p className="text-[9px] font-mono text-zinc-500 truncate uppercase">{user?.role.replace('ROLE_', '')}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded transition"
                title="Logout session"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      <UiSwitcherModal isOpen={isSwitcherOpen} onClose={() => setIsSwitcherOpen(false)} showLayoutOptions={false} />
      <StreakModal isOpen={isStreakModalOpen} onClose={() => setIsStreakModalOpen(false)} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        
        {/* Onboarding Guard */}
        <Route
          path="/onboard"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* Dashboard layouts protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment-dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AssessmentDashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/knowledge"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <MultimodalSocraticHub />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <MultimodalSocraticHub />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AdaptiveAssessmentPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/learner-model"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <LearnerModelPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/revision"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <RevisionStudioPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <StudyCalendarPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-eval"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SystemEvaluationPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/elsa"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <StarkInterviewPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stark"
          element={<Navigate to="/elsa" replace />}
        />
        <Route
          path="/start-interview"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <StartInterview />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orb-demo"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <VoicePoweredOrbDemo />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Full IDE and Reports are distraction-free outside standard sidebar */}
        <Route
          path="/interview/:id"
          element={
            <ProtectedRoute>
              <InterviewRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/:id"
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

const RootApp: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>
);

export default RootApp;
