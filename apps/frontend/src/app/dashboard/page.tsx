'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!user || !user.roles || user.roles.length === 0) {
      router.push('/login');
      return;
    }

    // Direct role-based routing - no loops
    const role = user.roles[0];
    
    if (role === 'system_admin') {
      router.push('/admin/dashboard');
    } else if (role === 'operations_manager') {
      router.push('/operations/dashboard');
    } else if (role === 'broker') {
      router.push('/broker/dashboard');
    } else if (role === 'marketing_manager') {
      router.push('/marketing/dashboard');
    } else if (role === 'compliance_officer') {
      router.push('/compliance/dashboard');
    } else if (role === 'finance_manager') {
      router.push('/finance/dashboard');
    } else if (role === 'claims_assessor') {
      router.push('/claims-assessor/dashboard');
    } else if (role === 'call_centre_agent') {
      router.push('/call-centre/support');
    } else if (role === 'provider') {
      router.push('/provider/dashboard');
    } else if (role === 'onboarding') {
      router.push('/onboarding');
    } else {
      // Default fallback - show loading
      return;
    }
  }, [loading, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading...</p>
    </div>
  );
}
