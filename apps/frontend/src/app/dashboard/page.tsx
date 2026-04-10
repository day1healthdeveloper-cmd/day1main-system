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
      console.log('❌ Not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    if (!user || !user.roles || user.roles.length === 0) {
      console.log('❌ No user or roles, redirecting to login');
      router.push('/login');
      return;
    }

    // Direct role-based routing - no loops
    const role = user.roles[0];
    console.log('✅ User role:', role);
    
    if (role === 'system_admin') {
      console.log('→ Redirecting to admin dashboard');
      router.push('/admin/dashboard');
    } else if (role === 'operations_manager') {
      console.log('→ Redirecting to operations dashboard');
      router.push('/operations/dashboard');
    } else if (role === 'broker') {
      console.log('→ Redirecting to broker dashboard');
      router.push('/broker/dashboard');
    } else if (role === 'marketing_manager') {
      console.log('→ Redirecting to marketing dashboard');
      router.push('/marketing/dashboard');
    } else if (role === 'compliance_officer') {
      console.log('→ Redirecting to compliance dashboard');
      router.push('/compliance/dashboard');
    } else if (role === 'finance_manager') {
      console.log('→ Redirecting to finance dashboard');
      router.push('/finance/dashboard');
    } else if (role === 'claims_assessor') {
      console.log('→ Redirecting to claims assessor dashboard');
      router.push('/claims-assessor/dashboard');
    } else if (role === 'call_centre_agent') {
      console.log('→ Redirecting to call centre support');
      window.location.href = '/call-centre/support';
    } else if (role === 'ambulance_operator') {
      console.log('→ Redirecting to ambulance dashboard');
      router.push('/ambulance/dashboard');
    } else if (role === 'provider') {
      console.log('→ Redirecting to provider dashboard');
      router.push('/provider/dashboard');
    } else if (role === 'member') {
      console.log('→ Redirecting to member dashboard');
      router.push('/member/dashboard');
    } else if (role === 'onboarding') {
      console.log('→ Redirecting to onboarding');
      router.push('/onboarding');
    } else {
      console.log('⚠️ Unknown role:', role);
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
