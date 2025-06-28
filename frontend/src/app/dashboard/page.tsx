'use client';

import React from 'react';
import { UserDashboard } from '@/components/dashboard';
import { ProtectedRoute } from '@/components/auth';

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredPermissions={['view_dashboard']}>
      <main className="min-h-screen bg-gray-50">
        <div className="container-wide py-8">
          <UserDashboard />
        </div>
      </main>
    </ProtectedRoute>
  );
} 