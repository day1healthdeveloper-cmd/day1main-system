'use client';

import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RegimePage() {
  const regimes = [
    { id: 'REG-001', name: 'Medical Schemes Act', code: 'MSA', status: 'active', products: 45, rules: 128 },
    { id: 'REG-002', name: 'Insurance Act', code: 'IA', status: 'active', products: 23, rules: 87 },
  ];

  const workflows = [
    { id: 'WF-001', regime: 'Medical Schemes Act', name: 'Member Registration', steps: 8, status: 'active' },
    { id: 'WF-002', regime: 'Medical Schemes Act', name: 'Claims Processing', steps: 12, status: 'active' },
    { id: 'WF-003', regime: 'Insurance Act', name: 'Underwriting', steps: 15, status: 'active' },
    { id: 'WF-004', regime: 'Insurance Act', name: 'Risk Assessment', steps: 10, status: 'active' },
  ];

  const stats = {
    totalRegimes: 2,
    activeWorkflows: 24,
    totalProducts: 68,
    totalRules: 215,
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Regime Configuration</h1>
          <p className="text-gray-600 mt-1">Manage regulatory regimes and workflows</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Regimes</p>
                <p className="text-3xl font-bold mt-1">{stats.totalRegimes}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Active Workflows</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">{stats.activeWorkflows}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.totalProducts}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Rules</p>
                <p className="text-3xl font-bold mt-1 text-purple-600">{stats.totalRules}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Regimes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Regulatory Regimes</CardTitle>
              <Button size="sm">New Regime</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Regime ID</th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Code</th>
                    <th className="text-left py-3 px-4 font-medium">Products</th>
                    <th className="text-left py-3 px-4 font-medium">Rules</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {regimes.map((regime) => (
                    <tr key={regime.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{regime.id}</td>
                      <td className="py-3 px-4">{regime.name}</td>
                      <td className="py-3 px-4 font-mono">{regime.code}</td>
                      <td className="py-3 px-4 text-center">{regime.products}</td>
                      <td className="py-3 px-4 text-center">{regime.rules}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                          {regime.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">Configure</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Workflows */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Regime Workflows</CardTitle>
              <Button size="sm">New Workflow</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Workflow ID</th>
                    <th className="text-left py-3 px-4 font-medium">Regime</th>
                    <th className="text-left py-3 px-4 font-medium">Workflow Name</th>
                    <th className="text-left py-3 px-4 font-medium">Steps</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workflows.map((workflow) => (
                    <tr key={workflow.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{workflow.id}</td>
                      <td className="py-3 px-4 text-sm">{workflow.regime}</td>
                      <td className="py-3 px-4">{workflow.name}</td>
                      <td className="py-3 px-4 text-center">{workflow.steps}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                          {workflow.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
