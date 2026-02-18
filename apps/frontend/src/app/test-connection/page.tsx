'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestConnectionPage() {
  const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [message, setMessage] = useState('');
  const [tables, setTables] = useState<any[]>([]);

  useEffect(() => {
    testConnection();
  }, []);

  async function testConnection() {
    try {
      // Test 1: Check environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        setStatus('error');
        setMessage('Missing Supabase environment variables');
        return;
      }

      // Test 2: Try to query a simple table (users)
      const { data, error, count } = await supabase
        .from('users')
        .select('id, email', { count: 'exact' })
        .limit(5);

      if (error) {
        setStatus('error');
        setMessage(`Error querying database: ${error.message}`);
        return;
      }

      setStatus('success');
      setMessage(`Successfully connected to Supabase! Found ${count || 0} users in database.`);
      setTables(data || []);
    } catch (err: any) {
      setStatus('error');
      setMessage(`Exception: ${err.message}`);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">Status:</p>
          <p className={`text-lg font-semibold ${
            status === 'success' ? 'text-green-600' : 
            status === 'error' ? 'text-red-600' : 
            'text-yellow-600'
          }`}>
            {status === 'testing' && 'Testing connection...'}
            {status === 'success' && '✓ Connected'}
            {status === 'error' && '✗ Connection Failed'}
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded mb-4 ${
            status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {tables.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2">Sample users:</p>
            <ul className="list-disc list-inside">
              {tables.map((user: any, idx) => (
                <li key={idx} className="text-sm">{user.email || user.id}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={testConnection}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Again
        </button>
      </div>
    </div>
  );
}
