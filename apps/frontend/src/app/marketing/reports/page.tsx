'use client';

import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, Mail, BarChart3, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  const reportTemplates = [
    { id: '1', name: 'Weekly Performance Report', category: 'Performance', frequency: 'Weekly', lastRun: '2 days ago' },
    { id: '2', name: 'Monthly Campaign Summary', category: 'Campaigns', frequency: 'Monthly', lastRun: '5 days ago' },
    { id: '3', name: 'Lead Source Analysis', category: 'Leads', frequency: 'Weekly', lastRun: '1 day ago' },
    { id: '4', name: 'ROI Dashboard', category: 'Financial', frequency: 'Monthly', lastRun: '1 week ago' },
    { id: '5', name: 'Conversion Funnel Report', category: 'Analytics', frequency: 'Weekly', lastRun: '3 days ago' },
    { id: '6', name: 'Executive Summary', category: 'Executive', frequency: 'Monthly', lastRun: '2 weeks ago' }
  ];

  const scheduledReports = [
    { name: 'Weekly Performance', recipients: 3, nextRun: 'Tomorrow 9:00 AM', status: 'active' },
    { name: 'Monthly Summary', recipients: 5, nextRun: 'Jan 31, 9:00 AM', status: 'active' },
    { name: 'Lead Analysis', recipients: 2, nextRun: 'Friday 9:00 AM', status: 'active' }
  ];

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 mt-1">Generate and schedule marketing reports</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Custom Report
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Report Templates</p>
                <p className="text-3xl font-bold mt-1">{reportTemplates.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-3xl font-bold mt-1">{scheduledReports.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Download className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Generated (30d)</p>
                <p className="text-3xl font-bold mt-1">42</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Mail className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Email Sent</p>
                <p className="text-3xl font-bold mt-1">156</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportTemplates.map((report) => (
                    <div key={report.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{report.name}</h3>
                          <p className="text-xs text-gray-500">{report.category} • {report.frequency}</p>
                        </div>
                        <span className="text-xs text-gray-500">Last run: {report.lastRun}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Download className="w-3 h-3 mr-1" />
                          Generate
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          Schedule
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Mail className="w-3 h-3 mr-1" />
                          Email
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Scheduled Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scheduledReports.map((report, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{report.name}</span>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                          {report.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>Recipients: {report.recipients}</p>
                        <p>Next run: {report.nextRun}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Performance Dashboard
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    ROI Analysis
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Executive Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
