'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function MemberPaymentsPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
        <p className="text-gray-600 mt-1">View your payment history and upcoming payments</p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No payment history</h3>
          <p className="mt-1 text-sm text-gray-500">Your payment history will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
