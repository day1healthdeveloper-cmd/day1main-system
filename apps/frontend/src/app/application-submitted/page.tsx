'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ApplicationSubmittedPage() {
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Application Submitted Successfully!
          </h1>

          {/* Reference Number */}
          {ref && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 mb-1">Your Application Reference Number:</p>
              <p className="text-2xl font-bold text-blue-900">{ref}</p>
              <p className="text-xs text-blue-700 mt-2">Please save this number for your records</p>
            </div>
          )}

          {/* What Happens Next */}
          <div className="text-left mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">What happens next?</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Application Review</h3>
                  <p className="text-sm text-gray-600">Our team will review your application and verify your documents within 1 hour.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Confirmation Call</h3>
                  <p className="text-sm text-gray-600">You'll receive a confirmation call shortly to verify your details and answer any questions.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Approval & Activation</h3>
                  <p className="text-sm text-gray-600">Once approved, your cover will be activated and your first debit order will be processed.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Welcome Pack</h3>
                  <p className="text-sm text-gray-600">You'll receive your member card, policy documents, and welcome pack via email and post.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Confirmation */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              📧 A confirmation email has been sent to your registered email address with your application details.
            </p>
          </div>

          {/* Contact Info */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Need help?</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>📞 Call us: 0800 DAY1 HEALTH</p>
              <p>📧 Email: applications@day1health.co.za</p>
              <p>⏰ Monday - Friday: 8:00 AM - 5:00 PM</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/lp/summer-health-2026"
              onClick={() => {
                // Ensure scroll to top when navigating
                if (typeof window !== 'undefined') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Back to Home Page
            </Link>
            <button
              onClick={() => window.print()}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Print Confirmation
            </button>
            <button
              onClick={() => {
                const element = document.createElement('a');
                const content = `
Day1Health Application Confirmation

Application Reference: ${ref || 'N/A'}
Date: ${new Date().toLocaleDateString()}

Thank you for applying with Day1Health!

What happens next:
1. Application Review - Our team will review your application and verify your documents within 1 hour.
2. Confirmation Call - You'll receive a confirmation call shortly to verify your details and answer any questions.
3. Approval & Activation - Once approved, your cover will be activated and your first debit order will be processed.
4. Welcome Pack - You'll receive your member card, policy documents, and welcome pack via email and post.

Need help?
Call us: 0800 DAY1 HEALTH
Email: applications@day1health.co.za
Hours: Monday - Friday: 8:00 AM - 5:00 PM

Please keep this confirmation for your records.
                `.trim();
                const file = new Blob([content], { type: 'text/plain' });
                element.href = URL.createObjectURL(file);
                element.download = `Day1Health-Application-${ref || 'Confirmation'}.txt`;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
              className="px-8 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
            >
              Download Confirmation
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
