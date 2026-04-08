/**
 * Step 3 of 6: Dependants (Plus1Confirm Only)
 * 
 * For Plus1Rewards members - dependants section is disabled
 * Dependants will be added later through a special process
 * 
 * Part of Day1Health Plus1Confirm 6-step application flow
 */

'use client'

import { ApplicationData } from '@/types/application'

interface Props {
  data: ApplicationData
  updateData: (data: Partial<ApplicationData>) => void
  nextStep: () => void
  prevStep: () => void
}

export default function Step3Plus1Dependents({ data, updateData, nextStep, prevStep }: Props) {
  return (
    <div>
      <h2 className="text-lg font-bold mb-1">Dependants</h2>
      <p className="text-xs text-gray-600 mb-3">Add your spouse/partner and/or children (optional)</p>

      <div className="space-y-3">
        {/* Disabled Message */}
        <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-700 mb-2">Dependants Section</h3>
            <p className="text-sm text-gray-600 mb-4">
              Dependants will be added through a special process after your application is approved.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> You can add dependants to your cover plan later through your Plus1Rewards account or by contacting our support team.
              </p>
            </div>
          </div>
        </div>

        {/* Greyed Out Add Dependant Button */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-100 opacity-50 cursor-not-allowed">
          <button
            type="button"
            disabled
            className="w-full text-sm text-gray-400 font-medium cursor-not-allowed"
          >
            + Add Dependant (Coming Soon)
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-2 pb-10">
          <button
            onClick={prevStep}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium"
          >
            Back
          </button>
          <button
            onClick={nextStep}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
          >
            Next: Medical History
          </button>
        </div>
      </div>
    </div>
  )
}
