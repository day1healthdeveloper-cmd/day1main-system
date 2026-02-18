'use client';

import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Play, 
  Pause,
  Edit,
  Copy,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  MessageSquare,
  Phone,
  Users
} from 'lucide-react';

export default function WorkflowsPage() {
  const workflows = [
    {
      id: '1',
      name: 'Welcome Series',
      trigger: 'New Lead Captured',
      status: 'active',
      steps: 5,
      enrolled: 1245,
      completed: 892,
      active: 353,
      completionRate: 71.6,
      avgTime: '7 days',
      channels: ['email', 'sms'],
      lastRun: '2 hours ago'
    },
    {
      id: '2',
      name: 'Abandoned Application',
      trigger: 'Application Started but Not Completed',
      status: 'active',
      steps: 3,
      enrolled: 814,
      completed: 234,
      active: 580,
      completionRate: 28.7,
      avgTime: '3 days',
      channels: ['email', 'sms', 'voice'],
      lastRun: '30 minutes ago'
    },
    {
      id: '3',
      name: 'Hot Lead Follow-up',
      trigger: 'Lead Score > 85',
      status: 'active',
      steps: 4,
      enrolled: 342,
      completed: 289,
      active: 53,
      completionRate: 84.5,
      avgTime: '2 days',
      channels: ['email', 'whatsapp', 'voice'],
      lastRun: '1 hour ago'
    },
    {
      id: '4',
      name: 'Re-engagement Campaign',
      trigger: 'No Activity for 30 Days',
      status: 'paused',
      steps: 6,
      enrolled: 567,
      completed: 123,
      active: 0,
      completionRate: 21.7,
      avgTime: '14 days',
      channels: ['email', 'sms'],
      lastRun: '5 days ago'
    },
    {
      id: '5',
      name: 'Referral Nurture',
      trigger: 'Referral Code Generated',
      status: 'active',
      steps: 4,
      enrolled: 156,
      completed: 98,
      active: 58,
      completionRate: 62.8,
      avgTime: '10 days',
      channels: ['email', 'whatsapp'],
      lastRun: '3 hours ago'
    },
  ];

  const templates = [
    { id: '1', name: 'Lead Nurture Sequence', steps: 5, uses: 12 },
    { id: '2', name: 'Onboarding Flow', steps: 8, uses: 8 },
    { id: '3', name: 'Win-back Campaign', steps: 4, uses: 6 },
    { id: '4', name: 'Product Launch', steps: 6, uses: 4 },
  ];

  const triggers = [
    { name: 'New Lead Captured', count: 247 },
    { name: 'Application Started', count: 814 },
    { name: 'Lead Score Changed', count: 156 },
    { name: 'Email Opened', count: 3125 },
    { name: 'Link Clicked', count: 625 },
    { name: 'Form Submitted', count: 892 },
  ];

  const getChannelIcon = (channel: string) => {
    switch(channel) {
      case 'email': return <Mail className="w-3 h-3" />;
      case 'sms': return <MessageSquare className="w-3 h-3" />;
      case 'whatsapp': return <MessageSquare className="w-3 h-3" />;
      case 'voice': return <Phone className="w-3 h-3" />;
      default: return <Mail className="w-3 h-3" />;
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Automation Workflows</h1>
            <p className="text-gray-600 mt-1">Build and manage automated marketing workflows</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Copy className="w-4 h-4 mr-2" />
              From Template
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Zap className="w-4 h-4 mr-2" />
              New Workflow
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Workflows</p>
                  <p className="text-3xl font-bold mt-1">{workflows.length}</p>
                  <p className="text-xs text-gray-500 mt-1">{workflows.filter(w => w.status === 'active').length} active</p>
                </div>
                <Zap className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Enrolled</p>
                  <p className="text-3xl font-bold mt-1">{workflows.reduce((sum, w) => sum + w.enrolled, 0).toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">+234 this week</p>
                </div>
                <Users className="w-10 h-10 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">{workflows.reduce((sum, w) => sum + w.completed, 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{workflows.reduce((sum, w) => sum + w.active, 0)} in progress</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Completion</p>
                  <p className="text-3xl font-bold mt-1 text-purple-600">53.9%</p>
                  <p className="text-xs text-green-600 mt-1">+5.2% this month</p>
                </div>
                <BarChart3 className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workflows List */}
          <div className="lg:col-span-2 space-y-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{workflow.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                          workflow.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {workflow.status === 'active' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                          {workflow.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Trigger:</span> {workflow.trigger}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{workflow.steps} steps</span>
                        <span className="text-xs text-gray-300">•</span>
                        <div className="flex items-center gap-1">
                          {workflow.channels.map((channel, i) => (
                            <span key={i} className="text-xs px-1.5 py-0.5 bg-gray-100 rounded flex items-center gap-1">
                              {getChannelIcon(channel)}
                              {channel}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-3 mb-3">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600">Enrolled</p>
                      <p className="text-lg font-bold">{workflow.enrolled.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <p className="text-xs text-gray-600">Active</p>
                      <p className="text-lg font-bold text-blue-600">{workflow.active.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <p className="text-xs text-gray-600">Completed</p>
                      <p className="text-lg font-bold text-green-600">{workflow.completed.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <p className="text-xs text-gray-600">Rate</p>
                      <p className="text-lg font-bold text-purple-600">{workflow.completionRate}%</p>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <p className="text-xs text-gray-600">Avg Time</p>
                      <p className="text-sm font-bold text-orange-600">{workflow.avgTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last run: {workflow.lastRun}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      Analytics
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Copy className="w-3 h-3 mr-1" />
                      Clone
                    </Button>
                    {workflow.status === 'active' ? (
                      <Button size="sm" variant="outline" className="flex-1">
                        <Pause className="w-3 h-3 mr-1" />
                        Pause
                      </Button>
                    ) : (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 flex-1">
                        <Play className="w-3 h-3 mr-1" />
                        Activate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Workflow Templates */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Workflow Templates</CardTitle>
                  <Button size="sm" variant="outline">View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {templates.map((template) => (
                    <div key={template.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{template.name}</span>
                        <Button size="sm" variant="ghost">
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{template.steps} steps</span>
                        <span>{template.uses} uses</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trigger Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trigger Activity (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {triggers.map((trigger, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{trigger.name}</span>
                      <span className="text-sm font-medium text-purple-600">{trigger.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Optimization Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="font-medium text-blue-900">Improve "Abandoned Application"</p>
                    <p className="text-xs text-blue-700">Add SMS reminder at step 2</p>
                  </div>
                  <div className="p-2 bg-green-50 border border-green-200 rounded">
                    <p className="font-medium text-green-900">"Hot Lead Follow-up" performing well</p>
                    <p className="text-xs text-green-700">84.5% completion rate</p>
                  </div>
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="font-medium text-yellow-900">Re-activate "Re-engagement"</p>
                    <p className="text-xs text-yellow-700">Paused for 5 days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
