'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Plus1AddDependantSuccessPage() {
  const searchParams = useSearchParams()
  const requestId = searchParams.get('ref')
  const newPremium = searchParams.get('newPremium')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <CardTitle className="text-2xl">Request Submitted Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center text-gray-600">
              <p className="mb-2">Your dependant addition request has been received.</p>
              {requestId && (
                <p className="text-sm">
                  Reference Number: <span className="font-mono font-semibold">{requestId}</span>
                </p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                <li>Our call centre will contact you within 24-48 hours</li>
                <li>We'll verify the dependant details and documents</li>
                <li>Once verified, our operations team will approve the addition</li>
                <li>Your dependant will be added to your cover</li>
                <li>You'll receive confirmation via SMS and email</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">Important Information</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                <li>Waiting periods apply to new dependants (3 months general, 12 months maternity)</li>
                <li>Your new premium will be confirmed by our call centre team</li>
                <li>Payment continues through Plus1Rewards</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = '/member/dashboard'}
                className="w-full"
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Back to Home
              </Button>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>Need help? Contact us:</p>
              <p className="font-semibold">0800 123 456</p>
              <p>support@day1health.co.za</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
