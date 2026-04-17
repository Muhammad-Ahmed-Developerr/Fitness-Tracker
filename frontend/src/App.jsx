import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOTP from './pages/auth/VerifyOTP';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import Nutrition from './pages/Nutrition';
import Profile from './pages/Profile';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import Support from './pages/Support';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSupport from './pages/admin/AdminSupport';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import { Toaster } from 'react-hot-toast';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center text-accent">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center text-accent">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function AppContent() {
  return (
    <Router>
      <Routes>
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
        
        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} 
        />
        <Route 
          path="/admin/users" 
          element={<AdminRoute><AdminLayout><UserManagement /></AdminLayout></AdminRoute>} 
        />
        <Route 
          path="/admin/support" 
          element={<AdminRoute><AdminLayout><AdminSupport /></AdminLayout></AdminRoute>} 
        />
        <Route 
          path="/admin/analytics" 
          element={<AdminRoute><AdminLayout><AdminAnalytics /></AdminLayout></AdminRoute>} 
        />
        <Route 
          path="/admin/notifications" 
          element={<AdminRoute><AdminLayout><AdminNotifications /></AdminLayout></AdminRoute>} 
        />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
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
