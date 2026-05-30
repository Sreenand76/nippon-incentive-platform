import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import Login from './pages/Login';
import AdminCars from './pages/AdminCars';
import AdminSlabs from './pages/AdminSlabs';
import SalesDashboard from './pages/SalesDashboard';
import SalesSubmissions from './pages/SalesSubmissions';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            className: '!text-sm !rounded-xl !shadow-lg',
            duration: 3500,
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute role="ROLE_ADMIN" />}>
            <Route path="/admin" element={<Navigate to="/admin/cars" replace />} />
            <Route path="/admin/cars" element={<AdminCars />} />
            <Route path="/admin/slabs" element={<AdminSlabs />} />
          </Route>

          <Route element={<ProtectedRoute role="ROLE_SALES_OFFICER" />}>
            <Route path="/sales" element={<Navigate to="/sales/dashboard" replace />} />
            <Route path="/sales/dashboard" element={<SalesDashboard />} />
            <Route path="/sales/submissions" element={<SalesSubmissions />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
