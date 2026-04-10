'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function MemberDocumentsPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
        <p className="text-gray-600 mt-1">View and download your policy documents</p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
          <p className="mt-1 text-sm text-gray-500">Your policy documents will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
