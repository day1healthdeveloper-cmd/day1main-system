'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Lead {
  id: string;
  leadNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: 'website' | 'referral' | 'walk-in' | 'phone' | 'social-media' | 'event';
  status: 'new' | 'contacted' | 'qualified' | 'quoted' | 'converted' | 'lost';
  interestedProduct: string;
  capturedDate: string;
  lastContactDate?: string;
  assignedTo: string;
  notes: string;
  estimatedValue: number;
}

export default function BrokerLeadsPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [showCaptureForm, setShowCaptureForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);

  // Form state for new lead capture
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState<Lead['source']>('website');
  const [interestedProduct, setInterestedProduct] = useState('');
  const [notes, setNotes] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');

  // Mock leads data
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: '1',
      leadNumber: 'LEAD-20240111-001',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '0821234567',
      source: 'website',
      status: 'new',
      interestedProduct: 'Premium Plan',
      capturedDate: '2024-01-11T09:30:00',
      assignedTo: 'You',
      notes: 'Interested in family coverage',
      estimatedValue: 2500.0,
    },
    {
      id: '2',
      leadNumber: 'LEAD-20240110-045',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@email.com',
      phone: '0827654321',
      source: 'referral',
      status: 'contacted',
      interestedProduct: 'Family Plan',
      capturedDate: '2024-01-10T14:20:00',
      lastContactDate: '2024-01-11T10:00:00',
      assignedTo: 'You',
      notes: 'Referred by existing client M-2024-1234',
      estimatedValue: 3200.0,
    },
    {
      id: '3',
      leadNumber: 'LEAD-20240109-032',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.j@email.com',
      phone: '0831112222',
      source: 'phone',
      status: 'qualified',
      interestedProduct: 'Standard Plan',
      capturedDate: '2024-01-09T11:15:00',
      lastContactDate: '2024-01-10T15:30:00',
      assignedTo: 'You',
      notes: 'Ready to proceed, waiting for documents',
      estimatedValue: 1800.0,
    },
    {
      id: '4',
      leadNumber: 'LEAD-20240108-028',
      firstName: 'Alice',
      lastName: 'Williams',
      email: 'alice.w@email.com',
      phone: '0843334444',
      source: 'social-media',
      status: 'quoted',
      interestedProduct: 'Premium Plan',
      capturedDate: '2024-01-08T16:45:00',
      lastContactDate: '2024-01-09T09:00:00',
      assignedTo: 'You',
      notes: 'Quote sent, follow up in 2 days',
      estimatedValue: 2800.0,
    },
    {
      id: '5',
      leadNumber: 'LEAD-20240107-019',
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie.b@email.com',
      phone: '0855556666',
      source: 'event',
      status: 'converted',
      interestedProduct: 'Basic Plan',
      capturedDate: '2024-01-07T10:00:00',
      lastContactDate: '2024-01-08T14:00:00',
      assignedTo: 'You',
      notes: 'Policy activated: POL-20240108-001',
      estimatedValue: 1500.0,
    },
    {
      id: '6',
      leadNumber: 'LEAD-20240106-012',
      firstName: 'Diana',
      lastName: 'Prince',
      email: 'diana.p@email.com',
      phone: '0867778888',
      source: 'walk-in',
      status: 'lost',
      interestedProduct: 'Premium Plan',
      capturedDate: '2024-01-06T13:30:00',
      lastContactDate: '2024-01-07T11:00:00',
      assignedTo: 'You',
      notes: 'Chose competitor due to pricing',
      estimatedValue: 2500.0,
    },
  ]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusBadge = (status: Lead['status']) => {
    const styles = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-purple-100 text-purple-800',
      qualified: 'bg-yellow-100 text-yellow-800',
      quoted: 'bg-orange-100 text-orange-800',
      converted: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getSourceBadge = (source: Lead['source']) => {
    const labels = {
      website: 'Website',
      referral: 'Referral',
      'walk-in': 'Walk-in',
      phone: 'Phone',
      'social-media': 'Social Media',
      event: 'Event',
    };

    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
        {labels[source]}
      </span>
    );
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.leadNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    contacted: leads.filter((l) => l.status === 'contacted').length,
    qualified: leads.filter((l) => l.status === 'qualified').length,
    quoted: leads.filter((l) => l.status === 'quoted').length,
    converted: leads.filter((l) => l.status === 'converted').length,
    lost: leads.filter((l) => l.status === 'lost').length,
    conversionRate:
      leads.length > 0
        ? ((leads.filter((l) => l.status === 'converted').length / leads.length) * 100).toFixed(1)
        : 0,
    totalValue: leads
      .filter((l) => l.status !== 'lost')
      .reduce((sum, l) => sum + l.estimatedValue, 0),
  };

  const handleCaptureLead = (e: React.FormEvent) => {
    e.preventDefault();

    const newLead: Lead = {
      id: String(leads.length + 1),
      leadNumber: `LEAD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(leads.length + 1).padStart(3, '0')}`,
      firstName,
      lastName,
      email,
      phone,
      source,
      status: 'new',
      interestedProduct,
      capturedDate: new Date().toISOString(),
      assignedTo: 'You',
      notes,
      estimatedValue: parseFloat(estimatedValue) || 0,
    };

    setLeads([newLead, ...leads]);
    setShowCaptureForm(false);

    // Reset form
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setSource('website');
    setInterestedProduct('');
    setNotes('');
    setEstimatedValue('');
  };

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowLeadDetails(true);
  };

  const handleUpdateLeadStatus = (leadId: string, newStatus: Lead['status']) => {
    setLeads(
      leads.map((lead) =>
        lead.id === leadId
          ? { ...lead, status: newStatus, lastContactDate: new Date().toISOString() }
          : lead
      )
    );
    if (selectedLead?.id === leadId) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
  };

  const handleConvertToQuote = (lead: Lead) => {
    router.push(`/broker/quotes?leadId=${lead.id}`);
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leads Management</h1>
            <p className="text-gray-600 mt-1">Capture and track your sales leads</p>
          </div>
          <Button onClick={() => setShowCaptureForm(true)}>+ Capture New Lead</Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">New</p>
                <p className="text-2xl font-bold mt-1 text-blue-600">{stats.new}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">Contacted</p>
                <p className="text-2xl font-bold mt-1 text-purple-600">{stats.contacted}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">Qualified</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.qualified}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">Quoted</p>
                <p className="text-2xl font-bold mt-1 text-orange-600">{stats.quoted}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">Converted</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{stats.converted}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">Lost</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{stats.lost}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-xs text-gray-600">Conv. Rate</p>
                <p className="text-2xl font-bold mt-1">{stats.conversionRate}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Capture Lead Form */}
        {showCaptureForm && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Capture New Lead</CardTitle>
                  <CardDescription>Enter prospect information</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowCaptureForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCaptureLead} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="source" className="text-sm font-medium">
                      Lead Source <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="source"
                      value={source}
                      onChange={(e) => setSource(e.target.value as Lead['source'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="website">Website</option>
                      <option value="referral">Referral</option>
                      <option value="walk-in">Walk-in</option>
                      <option value="phone">Phone</option>
                      <option value="social-media">Social Media</option>
                      <option value="event">Event</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="interestedProduct" className="text-sm font-medium">
                      Interested Product <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="interestedProduct"
                      value={interestedProduct}
                      onChange={(e) => setInterestedProduct(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Select product</option>
                      <option value="Premium Plan">Premium Plan</option>
                      <option value="Family Plan">Family Plan</option>
                      <option value="Standard Plan">Standard Plan</option>
                      <option value="Basic Plan">Basic Plan</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="estimatedValue" className="text-sm font-medium">
                      Estimated Value (R)
                    </label>
                    <Input
                      id="estimatedValue"
                      type="number"
                      min="0"
                      step="0.01"
                      value={estimatedValue}
                      onChange={(e) => setEstimatedValue(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Additional information about the lead..."
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit">Capture Lead</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCaptureForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">
                  Search
                </label>
                <Input
                  id="search"
                  placeholder="Name, email, phone, lead number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="statusFilter" className="text-sm font-medium">
                  Status
                </label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="quoted">Quoted</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="sourceFilter" className="text-sm font-medium">
                  Source
                </label>
                <select
                  id="sourceFilter"
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Sources</option>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="walk-in">Walk-in</option>
                  <option value="phone">Phone</option>
                  <option value="social-media">Social Media</option>
                  <option value="event">Event</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Leads List</CardTitle>
                <CardDescription>
                  Showing {filteredLeads.length} of {leads.length} leads
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Export to CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Lead Number</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Source</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Value</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        No leads found matching your filters
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-mono text-sm">{lead.leadNumber}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(lead.capturedDate).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium">
                            {lead.firstName} {lead.lastName}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm">{lead.email}</p>
                          <p className="text-xs text-gray-500">{lead.phone}</p>
                        </td>
                        <td className="py-3 px-4">{lead.interestedProduct}</td>
                        <td className="py-3 px-4">{getSourceBadge(lead.source)}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          R{lead.estimatedValue.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(lead.status)}</td>
                        <td className="py-3 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewLead(lead)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Lead Details Modal */}
        {showLeadDetails && selectedLead && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lead Details</CardTitle>
                  <CardDescription>{selectedLead.leadNumber}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowLeadDetails(false)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Name</p>
                      <p className="font-medium">
                        {selectedLead.firstName} {selectedLead.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="font-medium">{selectedLead.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-medium">{selectedLead.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Assigned To</p>
                      <p className="font-medium">{selectedLead.assignedTo}</p>
                    </div>
                  </div>
                </div>

                {/* Lead Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Lead Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Source</p>
                      <div className="mt-1">{getSourceBadge(selectedLead.source)}</div>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <div className="mt-1">{getStatusBadge(selectedLead.status)}</div>
                    </div>
                    <div>
                      <p className="text-gray-600">Interested Product</p>
                      <p className="font-medium">{selectedLead.interestedProduct}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Estimated Value</p>
                      <p className="font-medium">R{selectedLead.estimatedValue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Captured Date</p>
                      <p className="font-medium">
                        {new Date(selectedLead.capturedDate).toLocaleString()}
                      </p>
                    </div>
                    {selectedLead.lastContactDate && (
                      <div>
                        <p className="text-gray-600">Last Contact</p>
                        <p className="font-medium">
                          {new Date(selectedLead.lastContactDate).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedLead.notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes</h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                      {selectedLead.notes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedLead.status === 'new' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateLeadStatus(selectedLead.id, 'contacted')}
                      >
                        Mark as Contacted
                      </Button>
                    )}
                    {selectedLead.status === 'contacted' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateLeadStatus(selectedLead.id, 'qualified')}
                      >
                        Mark as Qualified
                      </Button>
                    )}
                    {(selectedLead.status === 'qualified' ||
                      selectedLead.status === 'contacted') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConvertToQuote(selectedLead)}
                      >
                        Generate Quote
                      </Button>
                    )}
                    {selectedLead.status === 'quoted' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateLeadStatus(selectedLead.id, 'converted')}
                      >
                        Mark as Converted
                      </Button>
                    )}
                    {selectedLead.status !== 'lost' && selectedLead.status !== 'converted' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleUpdateLeadStatus(selectedLead.id, 'lost')}
                      >
                        Mark as Lost
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Management Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-900">Lead Statuses</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                  <li>
                    <strong>New:</strong> Lead just captured, awaiting first contact
                  </li>
                  <li>
                    <strong>Contacted:</strong> Initial contact made, gathering information
                  </li>
                  <li>
                    <strong>Qualified:</strong> Lead meets criteria, ready for quote
                  </li>
                  <li>
                    <strong>Quoted:</strong> Quote sent, awaiting decision
                  </li>
                  <li>
                    <strong>Converted:</strong> Lead became a policy
                  </li>
                  <li>
                    <strong>Lost:</strong> Lead chose not to proceed
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-900">Best Practices</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                  <li>Contact new leads within 24 hours for best conversion rates</li>
                  <li>Keep detailed notes of all interactions</li>
                  <li>Follow up on quoted leads within 2-3 days</li>
                  <li>Track lead sources to optimize marketing spend</li>
                  <li>Update lead status promptly to maintain accurate pipeline</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
