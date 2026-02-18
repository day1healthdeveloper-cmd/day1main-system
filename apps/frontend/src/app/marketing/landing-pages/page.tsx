'use client';

import { useState, useEffect } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Layout, 
  Eye, 
  Users, 
  TrendingUp,
  Edit,
  Copy,
  Trash2,
  Play,
  Pause,
  BarChart3,
  Zap,
  MousePointer,
  FileText,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface LandingPage {
  id: string;
  name: string;
  slug: string;
  title: string;
  description: string;
  template: string;
  status: string;
  created_at: string;
  updated_at: string;
  stats?: {
    visits: number;
    leads: number;
    conversionRate: number;
  };
}

export default function LandingPagesPage() {
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLandingPages();
  }, []);

  async function fetchLandingPages() {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken'); // Changed from 'access_token' to 'accessToken'
      
      console.log('Fetching landing pages with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch('http://localhost:3000/api/v1/marketing/landing-pages', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || `Failed to fetch landing pages (${response.status})`);
      }

      const data = await response.json();
      console.log('Fetched landing pages:', data);
      
      // Fetch stats for each landing page
      const pagesWithStats = await Promise.all(
        data.map(async (page: LandingPage) => {
          try {
            const statsResponse = await fetch(
              `http://localhost:3000/api/v1/marketing/landing-pages/${page.id}/stats`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );
            
            if (statsResponse.ok) {
              const stats = await statsResponse.json();
              return { ...page, stats };
            }
          } catch (err) {
            console.error(`Failed to fetch stats for ${page.id}`, err);
          }
          return page;
        })
      );

      setLandingPages(pagesWithStats);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const totalVisits = landingPages.reduce((sum, p) => sum + (p.stats?.visits || 0), 0);
  const totalLeads = landingPages.reduce((sum, p) => sum + (p.stats?.leads || 0), 0);
  const avgConversion = landingPages.length > 0
    ? landingPages.reduce((sum, p) => sum + (p.stats?.conversionRate || 0), 0) / landingPages.length
    : 0;

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading landing pages...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (error) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600 mb-2 font-semibold">Error: {error}</p>
            <p className="text-gray-600 mb-4 text-sm">
              {error.includes('Failed to fetch') || error.includes('401') 
                ? 'You need to be logged in as a marketing user to view landing pages.' 
                : 'Unable to load landing pages.'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={fetchLandingPages} variant="outline">Retry</Button>
              <Button onClick={() => window.location.href = '/login'} className="bg-purple-600 hover:bg-purple-700">
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Landing Pages & Funnels</h1>
            <p className="text-gray-600 mt-1">Build, manage, and optimize landing pages with A/B testing</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Layout className="w-4 h-4 mr-2" />
              New Funnel
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Layout className="w-4 h-4 mr-2" />
              New Landing Page
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Pages</p>
                  <p className="text-3xl font-bold mt-1">{landingPages.length}</p>
                  <p className="text-xs text-gray-500 mt-1">{landingPages.filter(p => p.status === 'active').length} active</p>
                </div>
                <Layout className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Visits</p>
                  <p className="text-3xl font-bold mt-1">{totalVisits.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">+15% this month</p>
                </div>
                <Eye className="w-10 h-10 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Leads</p>
                  <p className="text-3xl font-bold mt-1">{totalLeads.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">+8% this month</p>
                </div>
                <Users className="w-10 h-10 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Conversion</p>
                  <p className="text-3xl font-bold mt-1 text-purple-600">{avgConversion.toFixed(1)}%</p>
                  <p className="text-xs text-green-600 mt-1">+2.1% this month</p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Landing Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="w-5 h-5" />
              Landing Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {landingPages.length === 0 ? (
              <div className="text-center py-12">
                <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No landing pages yet</p>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Layout className="w-4 h-4 mr-2" />
                  Create Your First Landing Page
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {landingPages.map((page) => (
                  <div key={page.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{page.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${
                            page.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {page.status === 'active' ? <Play className="w-3 h-3 inline mr-1" /> : <Pause className="w-3 h-3 inline mr-1" />}
                            {page.status.toUpperCase()}
                          </span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {page.template}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">/promo/{page.slug}</p>
                        <p className="text-xs text-gray-500">{page.description}</p>
                      </div>
                    </div>

                    {page.stats && (
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-600">Visits</p>
                          <p className="text-lg font-bold">{page.stats.visits.toLocaleString()}</p>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <p className="text-xs text-gray-600">Leads</p>
                          <p className="text-lg font-bold text-green-600">{page.stats.leads.toLocaleString()}</p>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <p className="text-xs text-gray-600">Conv. Rate</p>
                          <p className="text-lg font-bold text-purple-600">{page.stats.conversionRate.toFixed(1)}%</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Created: {new Date(page.created_at).toLocaleDateString()}</span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`http://localhost:3001/lp/${page.slug}`, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Analytics
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="w-3 h-3 mr-1" />
                          Clone
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
