'use client';

import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Clock, CheckCircle, AlertCircle, TrendingUp, FileText } from 'lucide-react';

export default function OnboardingPipelinePage() {
  const pipelineSteps = [
    { step: 'Account Created', count: 1628, completed: 1628, rate: 100, avgTime: '2 min', bottleneck: false },
    { step: 'Email Verified', count: 1545, completed: 1545, rate: 94.9, avgTime: '5 min', bottleneck: false },
    { step: 'ID Uploaded', count: 1423, completed: 1423, rate: 87.4, avgTime: '8 min', bottleneck: true },
    { step: 'Address Verified', count: 1289, completed: 1289, rate: 79.2, avgTime: '6 min', bottleneck: false },
    { step: 'Selfie Verified', count: 1156, completed: 1156, rate: 71.0, avgTime: '4 min', bottleneck: false },
    { step: 'Health Questionnaire', count: 1045, completed: 1045, rate: 64.2, avgTime: '12 min', bottleneck: true },
    { step: 'Underwriting Complete', count: 892, completed: 892, rate: 54.8, avgTime: '3 min', bottleneck: false },
    { step: 'Plan Selected', count: 756, completed: 756, rate: 46.4, avgTime: '5 min', bottleneck: false },
    { step: 'Payment Setup', count: 623, completed: 623, rate: 38.3, avgTime: '7 min', bottleneck: true },
    { step: 'Documents Signed', count: 534, completed: 534, rate: 32.8, avgTime: '3 min', bottleneck: false },
    { step: 'Policy Activated', count: 434, completed: 434, rate: 26.7, avgTime: 'Instant', bottleneck: false }
  ];

  const stats = {
    totalStarted: 1628,
    completed: 434,
    inProgress: 1194,
    avgCompletionTime: '27 min',
    completionRate: 26.7,
    automationRate: 99
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Onboarding Pipeline</h1>
            <p className="text-gray-600 mt-1">Track onboarding progress and identify bottlenecks</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <FileText className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Started</p>
                <p className="text-3xl font-bold mt-1">{stats.totalStarted}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">{stats.inProgress}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.completed}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold mt-1 text-purple-600">{stats.completionRate}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Avg Time</p>
                <p className="text-3xl font-bold mt-1">{stats.avgCompletionTime}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Automation</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.automationRate}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Onboarding Funnel (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pipelineSteps.map((step, i) => (
                <div key={i} className={`p-4 border rounded-lg ${step.bottleneck ? 'border-red-300 bg-red-50' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold">{i + 1}. {step.step}</span>
                      {step.bottleneck && (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Bottleneck
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{step.rate}%</p>
                      <p className="text-xs text-gray-500">completion</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-2">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600">Count</p>
                      <p className="text-lg font-bold">{step.count}</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <p className="text-xs text-gray-600">Completed</p>
                      <p className="text-lg font-bold text-green-600">{step.completed}</p>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <p className="text-xs text-gray-600">Avg Time</p>
                      <p className="text-lg font-bold text-blue-600">{step.avgTime}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${step.bottleneck ? 'bg-red-500' : 'bg-purple-600'}`}
                      style={{ width: `${step.rate}%` }}
                    ></div>
                  </div>
                  {i < pipelineSteps.length - 1 && (
                    <div className="text-xs text-red-600 mt-1">
                      Drop-off: {((pipelineSteps[i].count - pipelineSteps[i+1].count) / pipelineSteps[i].count * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
