/**
 * Step 5 of 6: Your Medi Cover Plan (Plus1Confirm Only)
 * 
 * For Plus1Rewards members - displays cover plan name
 * No banking details needed as payment is handled by Plus1Rewards
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

export default function Step5Plus1CoverPlan({ data, updateData, nextStep, prevStep }: Props) {
  const handleNext = () => {
    nextStep()
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-1">Your Medi Cover Plan</h2>
      <p className="text-xs text-gray-600 mb-3">Your cover plan details</p>

      <div className="space-y-3">
        {/* Cover Plan Display */}
        <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Your Cover Plan</p>
              <p className="text-2xl font-bold text-green-900">{data.planName || 'Cover Plan'}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Amount</p>
              <p className="text-2xl font-bold text-green-900">R{data.monthlyPrice || '0'}</p>
            </div>
          </div>
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
            onClick={handleNext}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
          >
            Next: Review & Submit
          </button>
        </div>
      </div>
    </div>
  )
}
