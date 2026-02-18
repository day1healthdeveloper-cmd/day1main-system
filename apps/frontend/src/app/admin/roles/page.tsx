'use client';

import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminRolesPage() {
  const roles = [
    { id: '1', name: 'system_admin', description: 'System Administrator', users: 3, permissions: 50 },
    { id: '2', name: 'member', description: 'Member', users: 1247, permissions: 8 },
    { id: '3', name: 'broker', description: 'Broker', users: 23, permissions: 12 },
    { id: '4', name: 'claims_assessor', description: 'Claims Assessor', users: 15, permissions: 15 },
    { id: '5', name: 'compliance_officer', description: 'Compliance Officer', users: 5, permissions: 20 },
    { id: '6', name: 'finance_manager', description: 'Finance Manager', users: 8, permissions: 18 },
    { id: '7', name: 'marketing_manager', description: 'Marketing Manager', users: 4, permissions: 9 },
  ];

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Role & Permission Management</h1>
            <p className="text-gray-600 mt-1">Manage system roles and permissions (RBAC)</p>
          </div>
          <Button>+ Create Role</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Roles</p>
                <p className="text-3xl font-bold mt-1">{roles.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold mt-1">{roles.reduce((sum, r) => sum + r.users, 0)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Permissions</p>
                <p className="text-3xl font-bold mt-1">50+</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-lg">{role.description}</p>
                        <p className="text-sm text-gray-500 font-mono">{role.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 mr-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{role.users}</p>
                      <p className="text-xs text-gray-500">Users</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{role.permissions}</p>
                      <p className="text-xs text-gray-500">Permissions</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="outline">Permissions</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
