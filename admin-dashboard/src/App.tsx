import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';

// Pages
import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import { LiveOperations } from './pages/LiveOperations';
import { Vendors } from './pages/Vendors';
import { Residents } from './pages/Residents';
import { Categories } from './pages/Categories';
import { Alerts } from './pages/Alerts';
import { Ratings } from './pages/Ratings';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

export function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="live-ops" element={<LiveOperations />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="residents" element={<Residents />} />
          <Route path="categories" element={<Categories />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="ratings" element={<Ratings />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
