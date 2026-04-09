'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Button } from '@/components/ui/button';
import { User, Eye } from 'lucide-react';

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
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await fetch('/api/admin/applications');
      const data = await response.json();
      const allApps = data.applications || [];
      setApplications(allApps.filter((app: Application) => app.status === 'submitted'));
    } catch (error) {
      console.error('Error:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Member Applications</h1>
          <p className="text-gray-600 mt-1">Showing {applications.length} applications</p>
        </div>

        {loading ? (
          <p className="text-center py-8">Loading...</p>
        ) : applications.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No new applications</p>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app.id} className="p-4 border rounded-lg bg-white">
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
