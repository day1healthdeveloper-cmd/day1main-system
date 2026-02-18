'use client';

import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ConsentPage() {
  const consents = [
    { id: 'CON-001', purpose: 'Marketing Communications', granted: true, date: '2024-01-15', expires: '2026-01-15' },
    { id: 'CON-002', purpose: 'Data Processing', granted: true, date: '2024-01-15', expires: 'Never' },
    { id: 'CON-003', purpose: 'Third Party Sharing', granted: false, date: '2024-01-15', expires: 'N/A' },
    { id: 'CON-004', purpose: 'Research & Analytics', granted: true, date: '2024-01-15', expires: '2026-01-15' },
  ];

  const stats = {
    totalConsents: 4,
    granted: 3,
    revoked: 1,
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consent Management</h1>
          <p className="text-gray-600 mt-1">Manage your data processing consents</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Consents</p>
                <p className="text-3xl font-bold mt-1">{stats.totalConsents}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Granted</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.granted}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Revoked</p>
                <p className="text-3xl font-bold mt-1 text-red-600">{stats.revoked}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Consents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Consents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Purpose</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Date Granted</th>
                    <th className="text-left py-3 px-4 font-medium">Expires</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {consents.map((consent) => (
                    <tr key={consent.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{consent.purpose}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${consent.granted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {consent.granted ? 'Granted' : 'Revoked'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{consent.date}</td>
                      <td className="py-3 px-4 text-sm">{consent.expires}</td>
                      <td className="py-3 px-4">
                        {consent.granted ? (
                          <Button variant="outline" size="sm">Revoke</Button>
                        ) : (
                          <Button size="sm">Grant</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* POPIA Rights */}
        <Card>
          <CardHeader>
            <CardTitle>Your POPIA Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                <div>
                  <h3 className="font-medium">Request Your Data</h3>
                  <p className="text-sm text-gray-600">Get a copy of all your personal data</p>
                </div>
                <Button variant="outline">Request</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                <div>
                  <h3 className="font-medium">Correct Your Data</h3>
                  <p className="text-sm text-gray-600">Request corrections to your personal data</p>
                </div>
                <Button variant="outline">Request</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                <div>
                  <h3 className="font-medium">Delete Your Data</h3>
                  <p className="text-sm text-gray-600">Request deletion of your personal data</p>
                </div>
                <Button variant="outline">Request</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
