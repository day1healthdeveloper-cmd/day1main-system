'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ScheduledReportsPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [schedules] = useState([
    { id: '1', name: 'Daily Claims Summary', report: 'Claims Analytics', frequency: 'Daily', time: '06:00', recipients: 'claims@day1main.co.za', status: 'active', nextRun: '2024-01-12T06:00:00' },
    { id: '2', name: 'Weekly Financial Report', report: 'Loss Ratio Analysis', frequency: 'Weekly', time: '08:00', recipients: 'finance@day1main.co.za', status: 'active', nextRun: '2024-01-15T08:00:00' },
    { id: '3', name: 'Monthly Member Report', report: 'Member Movement', frequency: 'Monthly', time: '09:00', recipients: 'admin@day1main.co.za', status: 'active', nextRun: '2024-02-01T09:00:00' },
  ]);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Scheduled Reports</h1>
            <p className="text-gray-600 mt-1">Manage automated report generation</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>+ Create Schedule</Button>
        </div>

        {showCreateForm && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Create Report Schedule</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowCreateForm(false)}>Cancel</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Schedule Name</label>
                  <Input placeholder="e.g., Daily Claims Summary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option>Claims Analytics</option>
                    <option>Loss Ratio Analysis</option>
                    <option>Member Movement</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Frequency</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time</label>
                    <Input type="time" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recipients (comma-separated emails)</label>
                  <Input placeholder="email1@example.com, email2@example.com" />
                </div>
                <Button>Create Schedule</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>Active Schedules</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{schedule.name}</p>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">{schedule.status.toUpperCase()}</span>
                    </div>
                    <p className="text-sm text-gray-600">Report: {schedule.report}</p>
                    <p className="text-sm text-gray-600">Frequency: {schedule.frequency} at {schedule.time}</p>
                    <p className="text-sm text-gray-600">Next run: {new Date(schedule.nextRun).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Recipients: {schedule.recipients}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="outline">Run Now</Button>
                    <Button size="sm" variant="outline" className="text-red-600">Disable</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
