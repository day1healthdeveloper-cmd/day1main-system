'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Button } from '@/components/ui/button';
import { User, Eye, CheckCircle, XCircle } from 'lucide-react';

interface Application {
  id: string;
  application_number: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  plan_name: string;
  monthly_price: number;
  status: string;
  submitted_at: string;
  dependents?: any[];
}

export default function CallCentreSupportPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  useEffect(() => {
    if (loading) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Load applications regardless of role check
    loadApplications();
  }, [loading, isAuthenticated]);

  const loadApplications = async () => {
    setLoadingApps(true);
    try {
      const response = await fetch('/api/admin/applications');
      
      if (!response.ok) throw new Error('Failed to fetch applications');
      
      const data = await response.json();
      const allApps = data.applications || [];
      
      // Show only submitted applications
      setApplications(allApps.filter((app: Application) => app.status === 'submitted'));
    } catch (error) {
      console.error('Error loading applications:', error);
      setApplications([]);
    } finally {
      setLoadingApps(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: id, status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      loadApplications();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Member Applications</h1>
            <p className="text-gray-600 mt-1">Showing {applications.length} of {applications.length} applications</p>
          </div>
          <Button variant="outline" size="sm">
            Export CSV
          </Button>
        </div>

        {loadingApps ? (
          <p className="text-center py-8 text-gray-500">Loading applications...</p>
        ) : applications.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No new applications</p>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="p-4 border rounded-lg bg-white"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{app.first_name} {app.last_name}</p>
                      <p className="text-sm text-gray-600">{app.application_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(app.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Plan</p>
                    <p className="font-medium">{app.plan_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Monthly Premium</p>
                    <p className="font-medium">R{app.monthly_price?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Dependants</p>
                    <p className="font-medium">{app.dependents?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Submitted</p>
                    <p className="font-medium">{new Date(app.submitted_at).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/call-centre/application/${app.id}`)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
