import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppShell from './layout/AppShell';

export const ProtectedRoute = ({ role }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="card card-body max-w-md text-center">
          <p className="text-red-600 font-semibold">You don&apos;t have access to this area.</p>
        </div>
      </div>
    );
  }

  return <AppShell role={role} />;
};
