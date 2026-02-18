'use client';

import { useState, useEffect } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  TrendingUp, 
  Mail, 
  Phone, 
  MessageSquare,
  Clock,
  Target,
  Activity,
  UserCheck,
  UserX,
  Flame,
  Snowflake,
  ThermometerSun
} from 'lucide-react';

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  source: string
  status: string
  lifecycle: string
  leadScore: number
  assignedTo: string | null
  createdDate: string
  createdTime: string
  createdDateTime: string
  lastActivity: string
  lastActivityTime: string
  lastActivityDateTime: string
  marketingConsent: boolean
  emailConsent: boolean
  smsConsent: boolean
  phoneConsent: boolean
  tags: string[]
  isApplicant: boolean
  isMember: boolean
  isRejected: boolean
}

interface Stats {
  total: number
  new: number
  contacted: number
  qualified: number
  converted: number
  lost: number
  hot: number
  warm: number
  cold: number
}

export default function MarketingLeadsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    converted: 0,
    lost: 0,
    hot: 0,
    warm: 0,
    cold: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLeads, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/marketing/leads');
      const data = await response.json();
      setLeads(data.leads || []);
      setStats(data.stats || stats);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedLeadData = leads.find(l => l.id === selectedLead);

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading leads...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-purple-100 text-purple-800',
      converted: 'bg-green-100 text-green-800',
      lost: 'bg-gray-100 text-gray-800',
    };
    return <span className={`text-xs px-2 py-1 rounded ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>{status.toUpperCase()}</span>;
  };

  const getLifecycleBadge = (lifecycle: string) => {
    const config = {
      hot: { icon: Flame, color: 'text-red-600', bg: 'bg-red-100', label: 'Hot' },
      warm: { icon: ThermometerSun, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Warm' },
      cold: { icon: Snowflake, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Cold' },
      converted: { icon: UserCheck, color: 'text-green-600', bg: 'bg-green-100', label: 'Converted' },
    };
    const { icon: Icon, color, bg, label } = config[lifecycle as keyof typeof config] || config.cold;
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${bg} ${color} font-medium`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
            <p className="text-gray-600 mt-1">Capture and manage sales leads with AI-powered scoring</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={fetchLeads}>
            <Users className="w-4 h-4 mr-2" />
            Refresh Leads
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">New</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">{stats.new}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Contacted</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.contacted}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Qualified</p>
                <p className="text-3xl font-bold mt-1 text-purple-600">{stats.qualified}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Converted</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.converted}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Lost</p>
                <p className="text-3xl font-bold mt-1 text-gray-600">{stats.lost}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lifecycle Stages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Lead Lifecycle Stages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-900">Hot Leads</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">{stats.hot}</span>
                </div>
                <p className="text-xs text-red-700">Score 80-100 • Immediate follow-up required</p>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ThermometerSun className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-orange-900">Warm Leads</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">{stats.warm}</span>
                </div>
                <p className="text-xs text-orange-700">Score 60-79 • Nurture with campaigns</p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Snowflake className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Cold Leads</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{stats.cold}</span>
                </div>
                <p className="text-xs text-blue-700">Score 0-59 • Awareness campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input placeholder="Name, email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Lifecycle</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>All Stages</option>
                  <option>Hot (80-100)</option>
                  <option>Warm (60-79)</option>
                  <option>Cold (0-59)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Source</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>All Sources</option>
                  <option>Web</option>
                  <option>Phone</option>
                  <option>Email</option>
                  <option>Referral</option>
                  <option>Broker</option>
                  <option>Campaign</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leads Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Leads ({filteredLeads.length})</CardTitle>
                  <Button variant="outline" size="sm">Export CSV</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredLeads.map((lead) => (
                    <div 
                      key={lead.id} 
                      className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${selectedLead === lead.id ? 'border-purple-500 bg-purple-50' : ''}`}
                      onClick={() => setSelectedLead(lead.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-medium text-sm">
                              {lead.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            <p className="text-xs text-gray-500">{lead.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getLifecycleBadge(lead.lifecycle)}
                          {getStatusBadge(lead.status)}
                        </div>
                      </div>

                      {/* Lead Scoring */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-600">Lead Score</p>
                          <p className={`text-lg font-bold ${getScoreColor(lead.leadScore)}`}>{lead.leadScore}</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-600">Status</p>
                          <p className="text-sm font-medium">{lead.isApplicant ? 'Applicant' : lead.isMember ? 'Member' : 'Lead'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {lead.createdDateTime}
                        </span>
                        <span>Source: {lead.source}</span>
                        <span>{lead.assignedTo || 'Unassigned'}</span>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2 mt-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{lead.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{lead.email}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lead Activity Timeline */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedLeadData ? (
                  <div className="space-y-4">
                    <div className="pb-3 border-b">
                      <p className="font-medium">{selectedLeadData.name}</p>
                      <p className="text-sm text-gray-600">{selectedLeadData.email}</p>
                      <p className="text-sm text-gray-600">{selectedLeadData.phone}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-500">Created: {selectedLeadData.createdDateTime}</p>
                        <p className="text-xs text-gray-500">Last Activity: {selectedLeadData.lastActivityDateTime}</p>
                        <p className="text-xs text-gray-500">Source: {selectedLeadData.source}</p>
                      </div>
                      {selectedLeadData.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {selectedLeadData.tags.map((tag, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-xs font-medium text-gray-700 mb-1">Marketing Consent</p>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600">
                            {selectedLeadData.marketingConsent ? '✓ Opted in' : '✗ Not opted in'}
                          </p>
                          {selectedLeadData.marketingConsent && (
                            <>
                              <p className="text-xs text-gray-600">
                                Email: {selectedLeadData.emailConsent ? '✓' : '✗'}
                              </p>
                              <p className="text-xs text-gray-600">
                                SMS: {selectedLeadData.smsConsent ? '✓' : '✗'}
                              </p>
                              <p className="text-xs text-gray-600">
                                Phone: {selectedLeadData.phoneConsent ? '✓' : '✗'}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t space-y-2">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        Assign to Me
                      </Button>
                      <Button variant="outline" className="w-full">
                        Update Status
                      </Button>
                      <Button variant="outline" className="w-full">
                        Add Note
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Select a lead to view activity timeline</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
