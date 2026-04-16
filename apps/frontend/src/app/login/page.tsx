'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, Phone, Lock, AlertCircle, CheckCircle } from 'lucide-react';

type LoginMode = 'staff' | 'member';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loginMode, setLoginMode] = useState<LoginMode>('member');
  
  // Staff login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Member login state
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  
  // Common state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Prevent caching of this page
  useEffect(() => {
    // Clear any cached authentication state
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.href);
    }
  }, []);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const credentials = [
    { dept: 'Admin', email: 'admin@day1main.com', password: 'admin123', color: 'red' },
    { dept: 'Operations', email: 'operations@day1main.com', password: 'operations123', color: 'indigo' },
    { dept: 'Marketing', email: 'marketing@day1main.com', password: 'marketing123', color: 'pink' },
    { dept: 'Broker', email: 'broker@day1main.com', password: 'broker123', color: 'purple' },
    { dept: 'Compliance', email: 'compliance@day1main.com', password: 'compliance123', color: 'blue' },
    { dept: 'Finance', email: 'finance@day1main.com', password: 'finance123', color: 'cyan' },
    { dept: 'Claims', email: 'assessor@day1main.com', password: 'assessor123', color: 'green' },
    { dept: 'Provider (NXAMALO)', email: 'nxamalo1@gmail.com', password: '223344', color: 'orange' },
    { dept: 'Call Centre', email: 'callcentre@day1main.com', password: 'callcentre123', color: 'teal' },
    { dept: 'Ambulance', email: 'ambulance@day1main.com', password: 'ambulance123', color: 'rose' },
    { dept: 'Onboarding', email: 'onboarding@day1main.com', password: 'onboarding123', color: 'orange' },
  ];

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      
      // Small delay to ensure auth state is saved
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force a hard navigation to clear any cached state
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleMemberLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAttemptsRemaining(null);
    setLoading(true);

    try {
      const response = await fetch('/api/member/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, pin }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        if (data.attempts_remaining !== undefined) {
          setAttemptsRemaining(data.attempts_remaining);
        }
        setLoading(false);
        return;
      }

      // Store session token
      localStorage.setItem('member_session', data.session_token);
      localStorage.setItem('member_data', JSON.stringify(data.member));

      // Redirect to member dashboard
      window.location.href = '/member/dashboard';
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Login error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-8">
      <div className="w-full max-w-6xl">
        {/* Homepage Button */}
        <div className="mb-4 flex justify-center">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Homepage
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Login Form */}
          <Card className="w-full">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Welcome to Day1Main
              </CardTitle>
              <CardDescription className="text-center">
                Sign in to access your account
              </CardDescription>
              
              {/* Login Mode Toggle */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('member');
                    setError('');
                    setAttemptsRemaining(null);
                  }}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                    loginMode === 'member'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Member Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('staff');
                    setError('');
                    setAttemptsRemaining(null);
                  }}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                    loginMode === 'staff'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Staff Login
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {loginMode === 'member' ? (
                // Member Login Form
                <form onSubmit={handleMemberLogin} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-red-800">{error}</p>
                        {attemptsRemaining !== null && attemptsRemaining > 0 && (
                          <p className="text-xs text-red-600 mt-1">
                            {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="mobile" className="text-sm font-medium">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="mobile"
                        type="tel"
                        placeholder="0821234567"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                        disabled={loading}
                        className="pl-10"
                        pattern="[0-9]{10}"
                        title="Please enter a valid 10-digit mobile number"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="pin" className="text-sm font-medium">
                      PIN
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="pin"
                        type="password"
                        placeholder="Enter your 4-6 digit PIN"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        required
                        disabled={loading}
                        className="pl-10"
                        pattern="[0-9]{4,6}"
                        maxLength={6}
                        title="Please enter your 4-6 digit PIN"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>

                  {/* Help Links */}
                  <div className="mt-4 text-center space-y-2">
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                      onClick={() => alert('Please contact support at support@day1health.co.za or call 0800 123 456')}
                    >
                      Forgot your PIN?
                    </button>
                    <p className="text-xs text-gray-500">
                      Don't have an account?{' '}
                      <a href="/apply" className="text-blue-600 hover:underline">
                        Apply now
                      </a>
                    </p>
                  </div>

                  {/* Security Notice */}
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-800">
                        Your account will be locked for 30 minutes after 5 failed login attempts for security.
                      </p>
                    </div>
                  </div>
                </form>
              ) : (
                // Staff Login Form
                <form onSubmit={handleStaffLogin} className="space-y-4">
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Demo Credentials - Only show for staff login */}
          {loginMode === 'staff' && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-xl text-center">Demo Login Credentials</CardTitle>
                <CardDescription className="text-center">Click to copy email or password</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto">
                  {credentials.map((cred) => (
                    <div key={cred.dept} className={`p-3 rounded-lg border ${
                      cred.color === 'red' ? 'bg-red-50 border-red-200' :
                      cred.color === 'indigo' ? 'bg-indigo-50 border-indigo-200' :
                      cred.color === 'pink' ? 'bg-pink-50 border-pink-200' :
                      cred.color === 'purple' ? 'bg-purple-50 border-purple-200' :
                      cred.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                      cred.color === 'cyan' ? 'bg-cyan-50 border-cyan-200' :
                      cred.color === 'green' ? 'bg-green-50 border-green-200' :
                      cred.color === 'orange' ? 'bg-orange-50 border-orange-200' :
                      cred.color === 'teal' ? 'bg-teal-50 border-teal-200' :
                      cred.color === 'rose' ? 'bg-rose-50 border-rose-200' :
                      'bg-lime-50 border-lime-200'
                    }`}>
                      <p className={`font-semibold mb-2 ${
                        cred.color === 'red' ? 'text-red-900' :
                        cred.color === 'indigo' ? 'text-indigo-900' :
                        cred.color === 'pink' ? 'text-pink-900' :
                        cred.color === 'purple' ? 'text-purple-900' :
                        cred.color === 'blue' ? 'text-blue-900' :
                        cred.color === 'cyan' ? 'text-cyan-900' :
                        cred.color === 'green' ? 'text-green-900' :
                        cred.color === 'orange' ? 'text-orange-900' :
                        cred.color === 'teal' ? 'text-teal-900' :
                        cred.color === 'rose' ? 'text-rose-900' :
                        'text-lime-900'
                      }`}>{cred.dept}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-600">Email:</p>
                            <p className="font-mono text-xs truncate">{cred.email}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(cred.email, `${cred.dept}-email`)}
                            className="flex-shrink-0 p-1.5 hover:bg-white/50 rounded transition-colors"
                            title="Copy email"
                          >
                            {copiedField === `${cred.dept}-email` ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-600">Password:</p>
                            <p className="font-mono text-xs">{cred.password}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(cred.password, `${cred.dept}-password`)}
                            className="flex-shrink-0 p-1.5 hover:bg-white/50 rounded transition-colors"
                            title="Copy password"
                          >
                            {copiedField === `${cred.dept}-password` ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Member Login Info - Show when member login is selected */}
          {loginMode === 'member' && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-xl text-center">Member Portal Access</CardTitle>
                <CardDescription className="text-center">
                  Access your health insurance dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">What you can do:</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>View your policy details and coverage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>Submit and track claims</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>Update your personal information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>Download policy documents</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>Manage your dependants</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">First time logging in?</h3>
                  <p className="text-sm text-green-800 mb-3">
                    Your PIN was sent to you when your application was approved. If you don't have your PIN:
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-green-300 text-green-700 hover:bg-green-100"
                    onClick={() => alert('Please contact support at support@day1health.co.za or call 0800 123 456')}
                  >
                    Contact Support
                  </Button>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-900 mb-2">Plus1Rewards Members</h3>
                  <p className="text-sm text-orange-800">
                    Your PIN is the same as your Plus1Rewards PIN. Use your registered mobile number to log in.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
