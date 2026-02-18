'use client';

import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, XCircle, AlertCircle, FileText, Users } from 'lucide-react';

export default function ConsentManagementPage() {
  const consentStats = {
    totalContacts: 15420,
    optedIn: 12890,
    optedOut: 2530,
    pending: 0,
    complianceRate: 100
  };

  const consentTypes = [
    { type: 'Marketing Communications', optedIn: 12890, optedOut: 2530, rate: 83.6 },
    { type: 'Email Marketing', optedIn: 11245, optedOut: 4175, rate: 72.9 },
    { type: 'SMS Marketing', optedIn: 9876, optedOut: 5544, rate: 64.0 },
    { type: 'WhatsApp Marketing', optedIn: 8234, optedOut: 7186, rate: 53.4 },
    { type: 'Voice Calls', optedIn: 5678, optedOut: 9742, rate: 36.8 }
  ];

  const recentActivity = [
    { contact: 'john.doe@email.com', action: 'Opted Out', channel: 'Email', time: '2 hours ago' },
    { contact: 'jane.smith@email.com', action: 'Opted In', channel: 'WhatsApp', time: '5 hours ago' },
    { contact: 'bob.jones@email.com', action: 'Opted Out', channel: 'SMS', time: '1 day ago' }
  ];

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consent Management</h1>
            <p className="text-gray-600 mt-1">POPIA compliance and communication preferences</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <FileText className="w-4 h-4 mr-2" />
            Export Audit Trail
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Contacts</p>
                  <p className="text-3xl font-bold mt-1">{consentStats.totalContacts.toLocaleString()}</p>
                </div>
                <Users className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Opted In</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">{consentStats.optedIn.toLocaleString()}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Opted Out</p>
                  <p className="text-3xl font-bold mt-1 text-red-600">{consentStats.optedOut.toLocaleString()}</p>
                </div>
                <XCircle className="w-10 h-10 text-red-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Opt-in Rate</p>
                  <p className="text-3xl font-bold mt-1 text-purple-600">{((consentStats.optedIn/consentStats.totalContacts)*100).toFixed(1)}%</p>
                </div>
                <Shield className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">POPIA Compliance</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">{consentStats.complianceRate}%</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Consent by Channel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consentTypes.map((consent, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{consent.type}</span>
                      <span className="text-sm text-gray-600">{consent.rate}% opt-in</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="text-xs text-gray-600">Opted In</p>
                        <p className="text-lg font-bold text-green-600">{consent.optedIn.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-2 bg-red-50 rounded">
                        <p className="text-xs text-gray-600">Opted Out</p>
                        <p className="text-lg font-bold text-red-600">{consent.optedOut.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${consent.rate}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Consent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      {activity.action === 'Opted In' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-medium">{activity.action}</span>
                    </div>
                    <p className="text-sm text-gray-600">{activity.contact}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                      <span>{activity.channel}</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">POPIA Compliance</span>
                </div>
                <p className="text-xs text-blue-700">All consent records are logged and auditable. Suppression lists are automatically updated.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
