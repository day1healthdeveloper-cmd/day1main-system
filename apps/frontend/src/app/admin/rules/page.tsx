'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RulesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const rules = [
    { id: 'RULE-001', name: 'Annual Limit Check', type: 'limit', product: 'Comprehensive Plan', status: 'active', version: 'v2.1' },
    { id: 'RULE-002', name: 'Co-payment 20%', type: 'co_payment', product: 'Hospital Plan', status: 'active', version: 'v1.5' },
    { id: 'RULE-003', name: 'Pre-existing Exclusion', type: 'exclusion', product: 'All Plans', status: 'active', version: 'v3.0' },
    { id: 'RULE-004', name: 'Waiting Period 3 months', type: 'waiting_period', product: 'Basic Plan', status: 'active', version: 'v1.0' },
    { id: 'RULE-005', name: 'PMB Override', type: 'override', product: 'All Plans', status: 'draft', version: 'v1.0' },
  ];

  const stats = {
    totalRules: 87,
    active: 72,
    draft: 15,
    types: 8,
  };

  const filteredRules = rules.filter(rule =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rules Engine</h1>
          <p className="text-gray-600 mt-1">Manage business rules and policy logic</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Rules</p>
                <p className="text-3xl font-bold mt-1">{stats.totalRules}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.active}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Draft</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.draft}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Rule Types</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">{stats.types}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Rule name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Rules Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Business Rules</CardTitle>
              <Button size="sm">New Rule</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Rule ID</th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Product</th>
                    <th className="text-left py-3 px-4 font-medium">Version</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRules.map((rule) => (
                    <tr key={rule.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{rule.id}</td>
                      <td className="py-3 px-4">{rule.name}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                          {rule.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{rule.product}</td>
                      <td className="py-3 px-4 text-sm font-mono">{rule.version}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${
                          rule.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {rule.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Test</Button>
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
