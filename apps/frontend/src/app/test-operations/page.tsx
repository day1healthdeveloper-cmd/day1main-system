'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestOperations() {
  const router = useRouter();

  useEffect(() => {
    // Set a mock session in localStorage for testing
    const mockUser = {
      id: 'test-user-123',
      email: 'operations@day1main.com',
      role: 'operations',
      name: 'Operations Tester'
    };
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('isAuthenticated', 'true');
    
    // Redirect to operations dashboard
    router.push('/operations/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading operations dashboard...</p>
      </div>
    </div>
  );
}
