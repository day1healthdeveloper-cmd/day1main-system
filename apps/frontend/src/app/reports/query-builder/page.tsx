'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function QueryBuilderPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const tables = ['members', 'policies', 'claims', 'payments', 'providers'];
  const fields = {
    members: ['member_number', 'first_name', 'last_name', 'email', 'status', 'join_date'],
    policies: ['policy_number', 'product', 'status', 'monthly_premium', 'start_date'],
    claims: ['claim_number', 'service_date', 'claimed_amount', 'approved_amount', 'status'],
    payments: ['payment_number', 'payment_date', 'amount', 'status'],
    providers: ['provider_number', 'name', 'type', 'location', 'status'],
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ad-Hoc Query Builder</h1>
          <p className="text-gray-600 mt-1">Build custom queries and export data</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Query Builder</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Table</label>
                <select
                  value={selectedTable}
                  onChange={(e) => { setSelectedTable(e.target.value); setSelectedFields([]); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Choose a table...</option>
                  {tables.map(table => (
                    <option key={table} value={table}>{table.charAt(0).toUpperCase() + table.slice(1)}</option>
                  ))}
                </select>
              </div>

              {selectedTable && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Fields</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {fields[selectedTable as keyof typeof fields].map(field => (
                      <label key={field} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedFields.includes(field)}
                          onChange={() => handleFieldToggle(field)}
                        />
                        <span className="text-sm">{field}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {selectedFields.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filters (Optional)</label>
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-600">Add WHERE conditions...</p>
                  </div>
                </div>
              )}

              {selectedFields.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preview Query</label>
                  <div className="p-4 border rounded-lg bg-gray-900 text-green-400 font-mono text-sm">
                    SELECT {selectedFields.join(', ')}<br />
                    FROM {selectedTable}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button disabled={selectedFields.length === 0}>Run Query</Button>
                <Button variant="outline" disabled={selectedFields.length === 0}>Export to CSV</Button>
                <Button variant="outline" disabled={selectedFields.length === 0}>Export to Excel</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Saved Queries</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Active Members Report</p>
                  <p className="text-sm text-gray-600">All active members with contact details</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Load</Button>
                  <Button size="sm" variant="outline">Run</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
