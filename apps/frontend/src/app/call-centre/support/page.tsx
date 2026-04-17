'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Button } from '@/components/ui/button';
import { User, Eye, ArrowUpCircle } from 'lucide-react';

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

interface UpgradeRequest {
  id: string;
  member_first_name: string;
  member_last_name: string;
  mobile_number: string;
  current_plan: string;
  upgraded_plan: string;
  current_price: number;
  upgraded_price: number;
  status: string;
  requested_at: string;
}

interface DependantRequest {
  id: string;
  member_first_name: string;
  member_last_name: string;
  mobile_number: string;
  dependant_first_name: string;
  dependant_last_name: string;
  dependant_relationship: string;
  current_premium: number;
  new_premium: number;
  status: string;
  requested_at: string;
}

export default function CallCentreSupportPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [upgradeRequests, setUpgradeRequests] = useState<UpgradeRequest[]>([]);
  const [dependantRequests, setDependantRequests] = useState<DependantRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
    loadUpgradeRequests();
    loadDependantRequests();
  }, []);

  const loadDependantRequests = async () => {
    try {
      const response = await fetch('/api/plus1/dependant-requests?status=pending');
      const data = await response.json();
      setDependantRequests(data.requests || []);
    } catch (error) {
      console.error('Error loading dependant requests:', error);
      setDependantRequests([]);
    }
  };

  const loadUpgradeRequests = async () => {
    try {
      const response = await fetch('/api/plus1/upgrade-requests?status=pending');
      const data = await response.json();
      setUpgradeRequests(data.upgradeRequests || []);
    } catch (error) {
      console.error('Error loading upgrade requests:', error);
      setUpgradeRequests([]);
    }
  };

  const loadApplications = async () => {
    try {
      const response = await fetch('/api/admin/applications');
      const data = await response.json();
      const allApps = data.applications || [];
      // Only show 'submitted' applications - 'under_review' goes to admin
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
          <h1 className="text-3xl font-bold text-gray-900">Member Support</h1>
          <p className="text-gray-600 mt-1">
            {applications.length} new application{applications.length !== 1 ? 's' : ''} • {upgradeRequests.length} upgrade request{upgradeRequests.length !== 1 ? 's' : ''} • {dependantRequests.length} dependant request{dependantRequests.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading ? (
          <p className="text-center py-8">Loading...</p>
        ) : (
          <>
            {/* Dependant Requests Section */}
            {dependantRequests.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" />
                  Dependant Requests
                </h2>
                {dependantRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{request.member_first_name} {request.member_last_name}</p>
                          <p className="text-sm text-gray-600">{request.mobile_number}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                        ADD DEPENDANT
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                      <div>
                        <p className="text-gray-600">Dependant</p>
                        <p className="font-medium">{request.dependant_first_name} {request.dependant_last_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Relationship</p>
                        <p className="font-medium capitalize">{request.dependant_relationship}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Premium Change</p>
                        <p className="font-medium">R{request.current_premium?.toFixed(2)} → R{request.new_premium?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Requested</p>
                        <p className="font-medium">{new Date(request.requested_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => router.push(`/operations/call-centre?dependantId=${request.id}`)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Process Dependant Request
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upgrade Requests Section */}
            {upgradeRequests.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <ArrowUpCircle className="w-5 h-5 text-purple-600" />
                  Upgrade Requests
                </h2>
                {upgradeRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">{request.member_first_name} {request.member_last_name}</p>
                          <p className="text-sm text-gray-600">{request.mobile_number}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                        UPGRADE
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                      <div>
                        <p className="text-gray-600">Current Plan</p>
                        <p className="font-medium">{request.current_plan}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Upgrade To</p>
                        <p className="font-medium text-purple-600">{request.upgraded_plan}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Price Change</p>
                        <p className="font-medium">R{request.current_price?.toFixed(2)} → R{request.upgraded_price?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Requested</p>
                        <p className="font-medium">{new Date(request.requested_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => router.push(`/operations/call-centre?upgradeId=${request.id}`)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Process Upgrade
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Applications Section */}
            {applications.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  New Applications
                </h2>
                {applications.map((app) => (
                  <div key={app.id} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
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
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        NEW
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
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
                        <p className="font-medium">{new Date(app.submitted_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
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

            {/* Empty State */}
            {applications.length === 0 && upgradeRequests.length === 0 && dependantRequests.length === 0 && (
              <p className="text-center py-8 text-gray-500">No pending applications, upgrade requests, or dependant requests</p>
            )}
          </>
        )}
      </div>
    </SidebarLayout>
  );
}
