'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestOperations() {
  const router = useRouter();

  useEffect(() => {
    // Set mock tokens and user data directly in localStorage
    const mockUser = {
      id: '5dac2867-051d-4578-9d85-97b312b6ef41',
      email: 'test@day1main.com',
      firstName: 'Test',
      lastName: 'User',
      roles: ['operations_manager'],
      permissions: []
    };

    // Set tokens
    localStorage.setItem('accessToken', 'mock-test-token');
    localStorage.setItem('refreshToken', 'mock-refresh-token');
    
    // Redirect to operations dashboard
    router.push('/operations/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium">Loading test environment...</p>
        <p className="text-gray-500 text-sm mt-2">Redirecting to operations dashboard...</p>
      </div>
    </div>
  );
}
