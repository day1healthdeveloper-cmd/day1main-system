'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PMBPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const conditions = [
    { code: 'CDL-01', name: 'Addison\'s Disease', category: 'Chronic', icd10: 'E27.1', covered: 'Yes' },
    { code: 'CDL-02', name: 'Asthma', category: 'Chronic', icd10: 'J45', covered: 'Yes' },
    { code: 'CDL-03', name: 'Bipolar Mood Disorder', category: 'Chronic', icd10: 'F31', covered: 'Yes' },
    { code: 'CDL-04', name: 'Bronchiectasis', category: 'Chronic', icd10: 'J47', covered: 'Yes' },
    { code: 'CDL-05', name: 'Cardiac Failure', category: 'Chronic', icd10: 'I50', covered: 'Yes' },
    { code: 'DTP-01', name: 'Acute Myocardial Infarction', category: 'Emergency', icd10: 'I21', covered: 'Yes' },
    { code: 'DTP-02', name: 'Appendicitis', category: 'Emergency', icd10: 'K35', covered: 'Yes' },
  ];

  const stats = {
    totalConditions: 270,
    chronicDiseases: 27,
    emergencies: 243,
    dtpPairs: 156,
  };

  const filteredConditions = conditions.filter(condition =>
    condition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    condition.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    condition.icd10.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">PMB Reference</h1>
          <p className="text-gray-600 mt-1">Prescribed Minimum Benefits (PMB) conditions and coverage</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Conditions</p>
                <p className="text-3xl font-bold mt-1">{stats.totalConditions}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Chronic Diseases (CDL)</p>
                <p className="text-3xl font-bold mt-1 text-purple-600">{stats.chronicDiseases}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Emergency Conditions</p>
                <p className="text-3xl font-bold mt-1 text-red-600">{stats.emergencies}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">DTP Pairs</p>
                <p className="text-3xl font-bold mt-1 text-blue-600">{stats.dtpPairs}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search PMB Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Condition name, code, or ICD-10..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Conditions Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>PMB Conditions</CardTitle>
              <Button size="sm" variant="outline">Check Eligibility</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Code</th>
                    <th className="text-left py-3 px-4 font-medium">Condition Name</th>
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-left py-3 px-4 font-medium">ICD-10</th>
                    <th className="text-left py-3 px-4 font-medium">PMB Covered</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConditions.map((condition) => (
                    <tr key={condition.code} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono font-medium">{condition.code}</td>
                      <td className="py-3 px-4">{condition.name}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${
                          condition.category === 'Chronic' ? 'bg-purple-100 text-purple-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {condition.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">{condition.icd10}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                          {condition.covered}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">View Details</Button>
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
