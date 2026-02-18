'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DependantsPage() {
  const dependants = [
    { id: 'DEP-001', name: 'Sarah Smith', relationship: 'Spouse', idNumber: '8505125678089', dateOfBirth: '1985-05-12', status: 'active' },
    { id: 'DEP-002', name: 'John Smith Jr', relationship: 'Child', idNumber: '1205156789012', dateOfBirth: '2012-05-15', status: 'active' },
    { id: 'DEP-003', name: 'Emily Smith', relationship: 'Child', idNumber: '1508207890123', dateOfBirth: '2015-08-20', status: 'active' },
  ];

  const stats = {
    totalDependants: 3,
    activeDependants: 3,
    children: 2,
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Dependants</h1>
          <p className="text-gray-600 mt-1">Manage your dependants</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Dependants</p>
                <p className="text-3xl font-bold mt-1">{stats.totalDependants}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.activeDependants}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Children</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">{stats.children}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dependants Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Dependants</CardTitle>
              <Button size="sm">Add Dependant</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Relationship</th>
                    <th className="text-left py-3 px-4 font-medium">ID Number</th>
                    <th className="text-left py-3 px-4 font-medium">Date of Birth</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dependants.map((dep) => (
                    <tr key={dep.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{dep.name}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {dep.relationship}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">{dep.idNumber}</td>
                      <td className="py-3 px-4 text-sm">{dep.dateOfBirth}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                          {dep.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Remove</Button>
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
