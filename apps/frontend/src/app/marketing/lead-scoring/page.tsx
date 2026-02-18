'use client';

import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, TrendingUp, Users, Settings, BarChart3, Zap } from 'lucide-react';

export default function LeadScoringPage() {
  const scoringModel = {
    engagement: { weight: 35, factors: ['Email Opens', 'Link Clicks', 'Page Visits', 'Time on Site'] },
    intent: { weight: 40, factors: ['Quote Requests', 'Application Started', 'Document Uploads', 'Contact Attempts'] },
    fit: { weight: 25, factors: ['Age Range', 'Income Level', 'Family Size', 'Location'] }
  };

  const scoreDistribution = [
    { range: '0-20 (Cold)', count: 78, percentage: 31.6, color: 'bg-blue-500' },
    { range: '21-40 (Cool)', count: 56, percentage: 22.7, color: 'bg-cyan-500' },
    { range: '41-60 (Warm)', count: 45, percentage: 18.2, color: 'bg-yellow-500' },
    { range: '61-80 (Hot)', count: 46, percentage: 18.6, color: 'bg-orange-500' },
    { range: '81-100 (Very Hot)', count: 22, percentage: 8.9, color: 'bg-red-500' }
  ];

  const autoAssignmentRules = [
    { id: '1', name: 'Hot Leads to Sales Team', condition: 'Score > 80', action: 'Assign to Sales', status: 'active' },
    { id: '2', name: 'Warm Leads to Marketing', condition: 'Score 60-80', action: 'Add to Nurture Campaign', status: 'active' },
    { id: '3', name: 'Cold Leads to Automation', condition: 'Score < 40', action: 'Automated Email Series', status: 'active' }
  ];

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lead Scoring</h1>
            <p className="text-gray-600 mt-1">AI-powered lead scoring model configuration</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Settings className="w-4 h-4 mr-2" />
            Configure Model
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Score</p>
                  <p className="text-3xl font-bold mt-1">58.3</p>
                </div>
                <Target className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Hot Leads</p>
                  <p className="text-3xl font-bold mt-1 text-red-600">68</p>
                </div>
                <TrendingUp className="w-10 h-10 text-red-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Scored Today</p>
                  <p className="text-3xl font-bold mt-1">247</p>
                </div>
                <Users className="w-10 h-10 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Model Accuracy</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">94%</p>
                </div>
                <Zap className="w-10 h-10 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Scoring Model Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(scoringModel).map(([key, value]) => (
                  <div key={key} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold capitalize">{key} Score</span>
                      <span className="text-2xl font-bold text-purple-600">{value.weight}%</span>
                    </div>
                    <div className="space-y-1">
                      {value.factors.map((factor, i) => (
                        <div key={i} className="text-sm text-gray-600">• {factor}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scoreDistribution.map((range, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{range.range}</span>
                      <span className="text-sm text-gray-600">{range.count} leads ({range.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className={`${range.color} h-3 rounded-full`} style={{ width: `${range.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Auto-Assignment Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {autoAssignmentRules.map((rule) => (
                <div key={rule.id} className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">{rule.name}</h3>
                    <p className="text-sm text-gray-600">If {rule.condition} → {rule.action}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">{rule.status.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
