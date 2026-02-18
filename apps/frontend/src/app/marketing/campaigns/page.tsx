'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Megaphone, 
  Mail, 
  MessageSquare, 
  Phone,
  Calendar,
  Play,
  Pause,
  CheckCircle,
  FileText,
  Zap,
  BarChart3,
  Users,
  TrendingUp
} from 'lucide-react';

export default function MarketingCampaignsPage() {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const campaigns = [
    { 
      id: '1', 
      name: 'Summer Health Promo 2026', 
      type: 'email', 
      status: 'active', 
      channel: 'Email',
      sent: 1250, 
      delivered: 1245,
      opened: 892, 
      clicked: 234,
      converted: 28,
      startDate: '2026-01-10',
      endDate: '2026-02-10',
      budget: 5000,
      spent: 2340,
      roi: 385,
      template: 'Summer Promo Template',
      workflow: 'Welcome Series',
      abTest: { enabled: true, variant: 'A vs B', winner: 'A' }
    },
    { 
      id: '2', 
      name: 'New Product Launch', 
      type: 'whatsapp', 
      status: 'active', 
      channel: 'WhatsApp',
      sent: 980, 
      delivered: 975,
      opened: 654, 
      clicked: 187,
      converted: 45,
      startDate: '2026-01-08',
      endDate: '2026-01-22',
      budget: 3000,
      spent: 1890,
      roi: 420,
      template: 'Product Launch Template',
      workflow: 'Product Announcement',
      abTest: { enabled: false, variant: null, winner: null }
    },
    { 
      id: '3', 
      name: 'Member Referral Drive', 
      type: 'sms', 
      status: 'completed', 
      channel: 'SMS',
      sent: 2100, 
      delivered: 2095,
      opened: 1456, 
      clicked: 421,
      converted: 89,
      startDate: '2026-01-05',
      endDate: '2026-01-19',
      budget: 4000,
      spent: 3980,
      roi: 512,
      template: 'Referral Incentive',
      workflow: 'Referral Campaign',
      abTest: { enabled: true, variant: 'A vs B vs C', winner: 'B' }
    },
    { 
      id: '4', 
      name: 'Winter Special Offer', 
      type: 'email', 
      status: 'scheduled', 
      channel: 'Email',
      sent: 0, 
      delivered: 0,
      opened: 0, 
      clicked: 0,
      converted: 0,
      startDate: '2026-01-20',
      endDate: '2026-02-28',
      budget: 6000,
      spent: 0,
      roi: 0,
      template: 'Winter Offer Template',
      workflow: 'Seasonal Campaign',
      abTest: { enabled: true, variant: 'A vs B', winner: null }
    },
    { 
      id: '5', 
      name: 'Voice Follow-up Campaign', 
      type: 'voice', 
      status: 'draft', 
      channel: 'Voice',
      sent: 0, 
      delivered: 0,
      opened: 0, 
      clicked: 0,
      converted: 0,
      startDate: null,
      endDate: null,
      budget: 2500,
      spent: 0,
      roi: 0,
      template: 'Voice Script Template',
      workflow: 'Follow-up Sequence',
      abTest: { enabled: false, variant: null, winner: null }
    },
  ];

  const templates = [
    { id: '1', name: 'Welcome Email', type: 'email', uses: 45 },
    { id: '2', name: 'Product Announcement', type: 'email', uses: 32 },
    { id: '3', name: 'Referral Incentive', type: 'sms', uses: 28 },
    { id: '4', name: 'WhatsApp Promo', type: 'whatsapp', uses: 19 },
    { id: '5', name: 'Voice Follow-up', type: 'voice', uses: 12 },
  ];

  const workflows = [
    { id: '1', name: 'Welcome Series', steps: 5, active: true },
    { id: '2', name: 'Abandoned Cart', steps: 3, active: true },
    { id: '3', name: 'Re-engagement', steps: 4, active: false },
    { id: '4', name: 'Referral Campaign', steps: 6, active: true },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-purple-100 text-purple-800',
    };
    const icons = {
      draft: FileText,
      scheduled: Calendar,
      active: Play,
      paused: Pause,
      completed: CheckCircle,
    };
    const Icon = icons[status as keyof typeof icons];
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${styles[status as keyof typeof styles]}`}>
        <Icon className="w-3 h-3" />
        {status.toUpperCase()}
      </span>
    );
  };

  const getChannelIcon = (channel: string) => {
    const icons = {
      Email: Mail,
      SMS: MessageSquare,
      WhatsApp: MessageSquare,
      Voice: Phone,
    };
    const Icon = icons[channel as keyof typeof icons] || Mail;
    return <Icon className="w-4 h-4" />;
  };

  const selectedCampaignData = campaigns.find(c => c.id === selectedCampaign);

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
            <p className="text-gray-600 mt-1">Multi-channel campaigns with automation & A/B testing</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Megaphone className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Campaigns</p>
                  <p className="text-3xl font-bold mt-1">{campaigns.length}</p>
                </div>
                <Megaphone className="w-8 h-8 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">{campaigns.filter(c => c.status === 'active').length}</p>
                </div>
                <Play className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sent</p>
                  <p className="text-3xl font-bold mt-1">{campaigns.reduce((sum, c) => sum + c.sent, 0).toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Open Rate</p>
                  <p className="text-3xl font-bold mt-1 text-purple-600">68%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg ROI</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">439%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Multi-Channel Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Multi-Channel Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Email</span>
                </div>
                <p className="text-2xl font-bold">{campaigns.filter(c => c.channel === 'Email').reduce((sum, c) => sum + c.sent, 0).toLocaleString()}</p>
                <p className="text-xs text-gray-600">sent • 25% open rate</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <span className="font-medium">WhatsApp</span>
                </div>
                <p className="text-2xl font-bold">{campaigns.filter(c => c.channel === 'WhatsApp').reduce((sum, c) => sum + c.sent, 0).toLocaleString()}</p>
                <p className="text-xs text-gray-600">sent • 80% read rate</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">SMS</span>
                </div>
                <p className="text-2xl font-bold">{campaigns.filter(c => c.channel === 'SMS').reduce((sum, c) => sum + c.sent, 0).toLocaleString()}</p>
                <p className="text-xs text-gray-600">sent • 98% delivery</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-5 h-5 text-orange-600" />
                  <span className="font-medium">Voice</span>
                </div>
                <p className="text-2xl font-bold">{campaigns.filter(c => c.channel === 'Voice').reduce((sum, c) => sum + c.sent, 0).toLocaleString()}</p>
                <p className="text-xs text-gray-600">sent • 45% answer rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Campaigns List */}
          <div className="lg:col-span-2 space-y-4">
            {campaigns.map((campaign) => (
              <Card 
                key={campaign.id}
                className={`cursor-pointer transition-all ${selectedCampaign === campaign.id ? 'border-purple-500 shadow-md' : ''}`}
                onClick={() => setSelectedCampaign(campaign.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          campaign.channel === 'Email' ? 'bg-purple-100' :
                          campaign.channel === 'WhatsApp' ? 'bg-green-100' :
                          campaign.channel === 'SMS' ? 'bg-blue-100' :
                          'bg-orange-100'
                        }`}>
                          {getChannelIcon(campaign.channel)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{campaign.name}</h3>
                          <p className="text-sm text-gray-600">{campaign.channel} Campaign</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        {getStatusBadge(campaign.status)}
                        {campaign.abTest.enabled && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            A/B Test
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {campaign.status !== 'draft' && campaign.sent > 0 && (
                    <div className="grid grid-cols-5 gap-3 mb-4">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600">Sent</p>
                        <p className="text-lg font-bold">{campaign.sent.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="text-xs text-gray-600">Delivered</p>
                        <p className="text-lg font-bold text-green-600">{campaign.delivered.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{((campaign.delivered / campaign.sent) * 100).toFixed(1)}%</p>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <p className="text-xs text-gray-600">Opened</p>
                        <p className="text-lg font-bold text-blue-600">{campaign.opened.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{campaign.sent > 0 ? ((campaign.opened / campaign.sent) * 100).toFixed(1) : 0}%</p>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <p className="text-xs text-gray-600">Clicked</p>
                        <p className="text-lg font-bold text-purple-600">{campaign.clicked.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{campaign.sent > 0 ? ((campaign.clicked / campaign.sent) * 100).toFixed(1) : 0}%</p>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded">
                        <p className="text-xs text-gray-600">Converted</p>
                        <p className="text-lg font-bold text-orange-600">{campaign.converted}</p>
                        <p className="text-xs text-gray-500">{campaign.sent > 0 ? ((campaign.converted / campaign.sent) * 100).toFixed(1) : 0}%</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {campaign.startDate ? `${campaign.startDate} - ${campaign.endDate}` : 'Not scheduled'}
                    </span>
                    <span>Budget: R{campaign.budget.toLocaleString()} • Spent: R{campaign.spent.toLocaleString()}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">View Details</Button>
                    <Button size="sm" variant="outline" className="flex-1">Edit</Button>
                    {campaign.status === 'draft' && (
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700 flex-1">Launch</Button>
                    )}
                    {campaign.status === 'active' && (
                      <Button size="sm" variant="outline" className="flex-1">Pause</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar - Templates & Workflows */}
          <div className="space-y-6">
            {/* Message Templates */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="w-4 h-4" />
                    Message Templates
                  </CardTitle>
                  <Button size="sm" variant="outline">+ New</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {templates.map((template) => (
                    <div key={template.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {template.type === 'email' && <Mail className="w-4 h-4 text-purple-600" />}
                          {template.type === 'sms' && <MessageSquare className="w-4 h-4 text-blue-600" />}
                          {template.type === 'whatsapp' && <MessageSquare className="w-4 h-4 text-green-600" />}
                          {template.type === 'voice' && <Phone className="w-4 h-4 text-orange-600" />}
                          <span className="text-sm font-medium">{template.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{template.uses} uses</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Automation Workflows */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="w-4 h-4" />
                    Automation Workflows
                  </CardTitle>
                  <Button size="sm" variant="outline">+ New</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {workflows.map((workflow) => (
                    <div key={workflow.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{workflow.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${workflow.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {workflow.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{workflow.steps} steps</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Scheduled Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="w-4 h-4" />
                  Scheduled Campaigns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {campaigns.filter(c => c.status === 'scheduled').map((campaign) => (
                    <div key={campaign.id} className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">{campaign.name}</p>
                      <p className="text-xs text-gray-500">Starts: {campaign.startDate}</p>
                    </div>
                  ))}
                  {campaigns.filter(c => c.status === 'scheduled').length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No scheduled campaigns</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
