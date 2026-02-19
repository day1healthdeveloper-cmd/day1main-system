'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function TestOperations() {
  const router = useRouter();
  const { login } = useAuth();
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    const autoLogin = async () => {
      try {
        setStatus('Logging in as Test user...');
        
        // Auto-login with test user credentials
        await login('test@day1main.com', 'test123');
        
        setStatus('Login successful! Redirecting...');
        
        // Small delay to show success message
        setTimeout(() => {
          router.push('/operations/dashboard');
        }, 500);
      } catch (error) {
        setStatus('Login failed. Redirecting to login page...');
        console.error('Auto-login failed:', error);
        
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    };

    autoLogin();
  }, [login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium">{status}</p>
        <p className="text-gray-500 text-sm mt-2">Please wait...</p>
      </div>
    </div>
  );
}
