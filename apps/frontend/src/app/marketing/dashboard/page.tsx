'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Megaphone, 
  TrendingUp, 
  UserPlus, 
  Mail, 
  MessageSquare, 
  Phone,
  Target,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Zap
} from 'lucide-react';

export default function MarketingDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/marketing/dashboard');
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!stats) {
    return (
      <SidebarLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Failed to load dashboard data</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.firstName}! Here's your marketing overview</p>
        </div>

        {/* Key Metrics - Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            className="relative overflow-hidden rounded-lg border border-r-0 bg-gradient-to-t from-background to-muted transition-all duration-200 hover:shadow-lg group"
            style={{
              "--glow-color": "rgba(147, 51, 234, 1)",
              "--glow-color-via": "rgba(147, 51, 234, 0.075)",
              "--glow-color-to": "rgba(147, 51, 234, 0.2)",
            } as React.CSSProperties}
          >
            <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent from-40% via-[var(--glow-color-via)] to-[var(--glow-color-to)] via-70% z-10 pointer-events-none"></div>
            <div className="absolute w-[5px] h-[60%] bg-[var(--glow-color)] right-0 top-1/2 -translate-y-1/2 rounded-l shadow-[-2px_0_10px_var(--glow-color)] group-hover:translate-x-full transition-all duration-200 z-20"></div>
            <CardContent className="pt-6 relative z-30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Leads</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalLeads}</p>
                  {stats.totalLeads > 0 && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Active
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </div>

          <div 
            className="relative overflow-hidden rounded-lg border border-r-0 bg-gradient-to-t from-background to-muted transition-all duration-200 hover:shadow-lg group"
            style={{
              "--glow-color": "rgba(236, 72, 153, 1)",
              "--glow-color-via": "rgba(236, 72, 153, 0.075)",
              "--glow-color-to": "rgba(236, 72, 153, 0.2)",
            } as React.CSSProperties}
          >
            <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent from-40% via-[var(--glow-color-via)] to-[var(--glow-color-to)] via-70% z-10 pointer-events-none"></div>
            <div className="absolute w-[5px] h-[60%] bg-[var(--glow-color)] right-0 top-1/2 -translate-y-1/2 rounded-l shadow-[-2px_0_10px_var(--glow-color)] group-hover:translate-x-full transition-all duration-200 z-20"></div>
            <CardContent className="pt-6 relative z-30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Campaigns</p>
                  <p className="text-3xl font-bold mt-1 text-purple-600">{stats.activeCampaigns}</p>
                  <p className="text-xs text-gray-600 mt-1">Coming soon</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Megaphone className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </div>

          <div 
            className="relative overflow-hidden rounded-lg border border-r-0 bg-gradient-to-t from-background to-muted transition-all duration-200 hover:shadow-lg group"
            style={{
              "--glow-color": "rgba(16, 185, 129, 1)",
              "--glow-color-via": "rgba(16, 185, 129, 0.075)",
              "--glow-color-to": "rgba(16, 185, 129, 0.2)",
            } as React.CSSProperties}
          >
            <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent from-40% via-[var(--glow-color-via)] to-[var(--glow-color-to)] via-70% z-10 pointer-events-none"></div>
            <div className="absolute w-[5px] h-[60%] bg-[var(--glow-color)] right-0 top-1/2 -translate-y-1/2 rounded-l shadow-[-2px_0_10px_var(--glow-color)] group-hover:translate-x-full transition-all duration-200 z-20"></div>
            <CardContent className="pt-6 relative z-30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">{stats.conversionRate}%</p>
                  {stats.totalLeads > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      {stats.pipeline.converted} of {stats.totalLeads}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </div>

          <div 
            className="relative overflow-hidden rounded-lg border border-r-0 bg-gradient-to-t from-background to-muted transition-all duration-200 hover:shadow-lg group"
            style={{
              "--glow-color": "rgba(59, 130, 246, 1)",
              "--glow-color-via": "rgba(59, 130, 246, 0.075)",
              "--glow-color-to": "rgba(59, 130, 246, 0.2)",
            } as React.CSSProperties}
          >
            <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent from-40% via-[var(--glow-color-via)] to-[var(--glow-color-to)] via-70% z-10 pointer-events-none"></div>
            <div className="absolute w-[5px] h-[60%] bg-[var(--glow-color)] right-0 top-1/2 -translate-y-1/2 rounded-l shadow-[-2px_0_10px_var(--glow-color)] group-hover:translate-x-full transition-all duration-200 z-20"></div>
            <CardContent className="pt-6 relative z-30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Referrals</p>
                  <p className="text-3xl font-bold mt-1">{stats.referrals}</p>
                  <p className="text-xs text-gray-600 mt-1">Coming soon</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </div>
        </div>

        {/* Lead Pipeline & Campaign Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lead Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Lead Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">New Leads</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.pipeline.new}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="font-medium">Contacted</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.pipeline.contacted}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="font-medium">Qualified</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.pipeline.qualified}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Converted</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.pipeline.converted}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Multi-Channel Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Multi-Channel Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <span className="text-sm text-gray-600">25% open rate</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">WhatsApp</span>
                    </div>
                    <span className="text-sm text-gray-600">80% read rate</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">SMS</span>
                    </div>
                    <span className="text-sm text-gray-600">98% delivery</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium">Voice</span>
                    </div>
                    <span className="text-sm text-gray-600">45% answer rate</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ROI & Automation Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Campaign ROI</p>
                  <p className="text-2xl font-bold text-green-600">342%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg. Onboarding Time</p>
                  <p className="text-2xl font-bold">27 min</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Automation Rate</p>
                  <p className="text-2xl font-bold text-purple-600">99%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button className="p-4 border rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors text-left group">
                <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <UserPlus className="w-5 h-5 text-purple-600" />
                </div>
                <p className="font-medium">Capture Lead</p>
                <p className="text-xs text-gray-500">Add new lead</p>
              </button>

              <button className="p-4 border rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors text-left group">
                <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <Megaphone className="w-5 h-5 text-purple-600" />
                </div>
                <p className="font-medium">New Campaign</p>
                <p className="text-xs text-gray-500">Create campaign</p>
              </button>

              <button className="p-4 border rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors text-left group">
                <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <p className="font-medium">View Analytics</p>
                <p className="text-xs text-gray-500">Performance metrics</p>
              </button>

              <button className="p-4 border rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors text-left group">
                <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <UserPlus className="w-5 h-5 text-purple-600" />
                </div>
                <p className="font-medium">Referral Codes</p>
                <p className="text-xs text-gray-500">Generate codes</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Leads & Active Campaigns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Leads */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Recent Leads
                </CardTitle>
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  View All →
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentLeads.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No leads yet</p>
                  </div>
                ) : (
                  stats.recentLeads.map((lead: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-medium text-sm">
                          {lead.name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{lead.name}</p>
                        <p className="text-xs text-gray-500 truncate">{lead.email} • {lead.source}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600">{lead.score}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          lead.status === 'Converted' ? 'bg-green-100 text-green-800' :
                          lead.status === 'Qualified' ? 'bg-orange-100 text-orange-800' :
                          lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {lead.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Campaigns */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5" />
                  Active Campaigns
                </CardTitle>
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  View All →
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Summer Health Promo', channel: 'Email', sent: 1250, opened: 892, clicked: 234, status: 'Active' },
                  { name: 'New Product Launch', channel: 'WhatsApp', sent: 980, opened: 654, clicked: 187, status: 'Active' },
                  { name: 'Member Referral Drive', channel: 'SMS', sent: 2100, opened: 1456, clicked: 421, status: 'Active' },
                ].map((campaign, i) => (
                  <div key={i} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{campaign.name}</p>
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded">
                          {campaign.status}
                        </span>
                      </div>
                      {campaign.channel === 'Email' && <Mail className="w-4 h-4 text-purple-600" />}
                      {campaign.channel === 'WhatsApp' && <MessageSquare className="w-4 h-4 text-green-600" />}
                      {campaign.channel === 'SMS' && <MessageSquare className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Sent</p>
                        <p className="font-medium">{campaign.sent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Opened</p>
                        <p className="font-medium text-green-600">
                          {campaign.opened.toLocaleString()} ({Math.round(campaign.opened/campaign.sent*100)}%)
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Clicked</p>
                        <p className="font-medium text-purple-600">
                          {campaign.clicked.toLocaleString()} ({Math.round(campaign.clicked/campaign.sent*100)}%)
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onboarding Funnel & Lead Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Onboarding Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Onboarding Funnel (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { step: 'Landing Page Visits', count: 5420, percentage: 100 },
                  { step: 'Lead Capture', count: 1628, percentage: 30 },
                  { step: 'Application Started', count: 814, percentage: 15 },
                  { step: 'KYC Completed', count: 651, percentage: 12 },
                  { step: 'Plan Selected', count: 570, percentage: 10.5 },
                  { step: 'Payment Setup', count: 489, percentage: 9 },
                  { step: 'Policy Activated', count: 434, percentage: 8 },
                ].map((stage, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{stage.step}</span>
                      <span className="text-sm text-gray-600">{stage.count.toLocaleString()} ({stage.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-purple-400 h-2 rounded-full transition-all" 
                        style={{ width: `${stage.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lead Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Lead Sources (This Month)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.leadSources.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No lead sources yet</p>
                  </div>
                ) : (
                  stats.leadSources.map((source: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{source.source}</span>
                          <span className="text-sm text-gray-600">{source.leads} leads • {source.conversion}% conv.</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${(source.leads / stats.totalLeads) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-900">Hot Leads</span>
                </div>
                <p className="text-2xl font-bold text-red-600 mb-1">{stats.lifecycle.hot}</p>
                <p className="text-xs text-red-700">Require immediate follow-up</p>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Warm Leads</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600 mb-1">{stats.lifecycle.warm}</p>
                <p className="text-xs text-yellow-700">Nurture with campaigns</p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Cold Leads</span>
                </div>
                <p className="text-2xl font-bold text-blue-600 mb-1">{stats.lifecycle.cold}</p>
                <p className="text-xs text-blue-700">Awareness campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
