'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function SubmitClaimPage() {
  const router = useRouter();

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Submit a Claim</h1>
        <p className="text-gray-600 mt-1">Submit a new claim for reimbursement</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Claim Submission</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Claim submission form coming soon</h3>
            <p className="mt-1 text-sm text-gray-500">
              For now, please contact our call centre to submit a claim.
            </p>
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium">Call Centre: 0800 123 456</p>
              <p className="text-sm font-medium">Email: claims@day1health.co.za</p>
            </div>
            <Button 
              variant="outline" 
              className="mt-6"
              onClick={() => router.push('/member/claims')}
            >
              Back to Claims
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
