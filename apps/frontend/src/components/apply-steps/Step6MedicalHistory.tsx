/**
 * Step 4 of 6: Medical History
 * 
 * Collects medical history information for underwriting purposes.
 * - Pre-existing conditions
 * - Current medications
 * - Previous insurer details (if switching)
 * - Reason for switching
 * 
 * Part of Day1Health 6-step application flow
 */

'use client'

import { useState } from 'react'
import { ApplicationData } from '@/types/application'

interface Props {
  data: ApplicationData
  updateData: (data: Partial<ApplicationData>) => void
  nextStep: () => void
  prevStep: () => void
}

export default function Step6MedicalHistory({ data, updateData, nextStep, prevStep }: Props) {
  const [formData, setFormData] = useState({
    hasPreExisting: data.medicalHistory?.hasPreExisting || false,
    preExistingConditions: data.medicalHistory?.preExistingConditions || '',
    currentMedications: data.medicalHistory?.currentMedications || '',
    hasPreviousInsurer: data.medicalHistory?.hasPreviousInsurer || false,
    previousInsurer: data.medicalHistory?.previousInsurer || '',
    reasonForSwitching: data.medicalHistory?.reasonForSwitching || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setFormData(prev => ({ ...prev, [e.target.name]: value }))
  }

  const handleNext = () => {
    updateData({ medicalHistory: formData })
    nextStep()
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-1">Medical History</h2>
      <p className="text-xs text-gray-600 mb-2">Please provide your medical history information</p>

      <div className="space-y-2">
        <div className="border border-gray-200 rounded p-2">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              name="hasPreExisting"
              checked={formData.hasPreExisting}
              onChange={handleChange}
              className="mt-0.5"
            />
            <div>
              <span className="text-sm font-medium">I have pre-existing medical conditions</span>
              <p className="text-xs text-gray-600">Conditions you had before applying for this plan</p>
            </div>
          </label>
        </div>

        {formData.hasPreExisting && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Please list your pre-existing conditions *
            </label>
            <textarea
              name="preExistingConditions"
              value={formData.preExistingConditions}
              onChange={handleChange}
              rows={3}
              required={formData.hasPreExisting}
              placeholder="e.g., Diabetes, High blood pressure, Asthma..."
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">
            Current medications (if any)
          </label>
          <textarea
            name="currentMedications"
            value={formData.currentMedications}
            onChange={handleChange}
            rows={2}
            placeholder="List any medications you're currently taking..."
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div className="border-t pt-2">
          <div className="border border-gray-200 rounded p-2">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                name="hasPreviousInsurer"
                checked={formData.hasPreviousInsurer}
                onChange={handleChange}
                className="mt-0.5"
              />
              <div>
                <span className="text-sm font-medium">I'm switching from another medical insurer/aid</span>
                <p className="text-xs text-gray-600">You currently have or recently had medical cover</p>
              </div>
            </label>
          </div>
        </div>

        {formData.hasPreviousInsurer && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Previous insurer/medical aid name *
              </label>
              <input
                type="text"
                name="previousInsurer"
                value={formData.previousInsurer}
                onChange={handleChange}
                required={formData.hasPreviousInsurer}
                placeholder="e.g., Discovery, Bonitas, Momentum..."
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Reason for switching
              </label>
              <textarea
                name="reasonForSwitching"
                value={formData.reasonForSwitching}
                onChange={handleChange}
                rows={2}
                placeholder="Optional: Tell us why you're switching..."
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> Our team will discuss your previous cover during the confirmation call to ensure a smooth transition.
              </p>
            </div>
          </>
        )}

        <div className="flex justify-between pt-2 pb-10">
          <button
            onClick={prevStep}
            className="px-4 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 font-medium"
          >
            Next: Banking Details
          </button>
        </div>
      </div>
    </div>
  )
}
