import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Accidents } from './pages/Accidents';
import { UserManagement } from './pages/UserManagement';
import { Sidebar } from './components/Sidebar';
import { useAuthStore } from './store/authStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  if (!token) return <Navigate to="/login" />;
  return (
    <>
      <Sidebar />
      {children}
    </>
  );
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  if (user?.role !== 'admin') return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accidents"
          element={
            <ProtectedRoute>
              <Accidents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;