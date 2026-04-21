import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Core Pages (Fast Load)
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MainLayout from './components/layout/MainLayout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Workouts = lazy(() => import('./pages/Workouts'));
const Nutrition = lazy(() => import('./pages/Nutrition'));
const Profile = lazy(() => import('./pages/Profile'));
const Progress = lazy(() => import('./pages/Progress'));
const Settings = lazy(() => import('./pages/Settings'));
const Support = lazy(() => import('./pages/Support'));
const Search = lazy(() => import('./pages/Search'));
const Subscription = lazy(() => import('./pages/Subscription'));
const AICoach = lazy(() => import('./pages/AICoach'));
const Habits = lazy(() => import('./pages/Habits'));
const Goals = lazy(() => import('./pages/Goals'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Landing = lazy(() => import('./pages/guest/Landing'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const VerifyOTP = lazy(() => import('./pages/auth/VerifyOTP'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));

const LoadingFallback = () => (
  <div className="h-screen flex flex-col items-center justify-center bg-dark text-accent">
    <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="font-mono text-xs uppercase tracking-[0.2em] animate-pulse">Initializing Interface...</p>
  </div>
);

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Landing />;
}

function AppContent() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} 
          />
          <Route 
            path="/workouts" 
            element={<ProtectedRoute><MainLayout><Workouts /></MainLayout></ProtectedRoute>} 
          />
          <Route 
            path="/nutrition" 
            element={<ProtectedRoute><MainLayout><Nutrition /></MainLayout></ProtectedRoute>} 
          />
          <Route 
            path="/profile" 
            element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} 
          />
          <Route 
            path="/progress" 
            element={<ProtectedRoute><MainLayout><Progress /></MainLayout></ProtectedRoute>} 
          />
          <Route 
            path="/settings" 
            element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} 
          />
          <Route 
            path="/support" 
            element={<ProtectedRoute><MainLayout><Support /></MainLayout></ProtectedRoute>} 
          />
          <Route 
            path="/ai-coach" 
            element={<ProtectedRoute><MainLayout><AICoach /></MainLayout></ProtectedRoute>} 
          />

          <Route 
            path="/habits" 
            element={<ProtectedRoute><MainLayout><Habits /></MainLayout></ProtectedRoute>} 
          />

          <Route 
            path="/goals" 
            element={<ProtectedRoute><MainLayout><Goals /></MainLayout></ProtectedRoute>} 
          />

          <Route 
            path="/tasks" 
            element={<ProtectedRoute><MainLayout><Tasks /></MainLayout></ProtectedRoute>} 
          />

          <Route 
            path="/subscription" 
            element={<ProtectedRoute><MainLayout><Subscription /></MainLayout></ProtectedRoute>} 
          />

          <Route 
            path="/search" 
            element={<ProtectedRoute><MainLayout><Search /></MainLayout></ProtectedRoute>} 
          />

          {/* Admin Route */}
          <Route 
            path="/admin" 
            element={<AdminRoute><MainLayout><AdminPanel /></MainLayout></AdminRoute>} 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#0A2740', color: '#fff', border: '1px solid rgba(0,230,255,0.2)' }
      }} />
      <AppContent />
    </AuthProvider>
  );
}

export default App;
