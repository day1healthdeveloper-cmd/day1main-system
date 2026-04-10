'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function MemberDependantsPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Dependants</h1>
        <p className="text-gray-600 mt-1">Manage your dependants and their coverage</p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No dependants</h3>
          <p className="mt-1 text-sm text-gray-500">Contact support to add dependants to your policy.</p>
        </CardContent>
      </Card>
    </div>
  );
}
