/**
 * Step 5 of 6: Banking Details
 * 
 * Collects banking information for monthly debit order payments.
 * - Bank name selection (SA banks)
 * - Account holder name
 * - Account number and branch code
 * - Debit order day (1-28 of each month)
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

const SA_BANKS = [
  'ABSA', 'African Bank', 'Bidvest Bank', 'Capitec', 'Discovery Bank',
  'FNB', 'Investec', 'Nedbank', 'Standard Bank', 'TymeBank', 'Other'
]

export default function Step7Banking({ data, updateData, nextStep, prevStep }: Props) {
  const [formData, setFormData] = useState({
    bankName: data.bankName || '',
    accountNumber: data.accountNumber || '',
    branchCode: data.branchCode || '',
    accountHolderName: data.accountHolderName || '',
    debitOrderDay: data.debitOrderDay || 1,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleNext = () => {
    updateData(formData)
    nextStep()
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-1">Banking Details</h2>
      <p className="text-xs text-gray-600 mb-2">For monthly debit order payments</p>

      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">
            Bank Name *
          </label>
          <select
            name="bankName"
            value={formData.bankName}
            onChange={handleChange}
            required
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
          >
            <option value="">Select your bank</option>
            {SA_BANKS.map(bank => (
              <option key={bank} value={bank}>{bank}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">
            Account Holder Name *
          </label>
          <input
            type="text"
            name="accountHolderName"
            value={formData.accountHolderName}
            onChange={handleChange}
            required
            placeholder="Full name as it appears on your bank account"
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Account Number *
            </label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              required
              placeholder="Account number"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Branch Code *
            </label>
            <input
              type="text"
              name="branchCode"
              value={formData.branchCode}
              onChange={handleChange}
              required
              placeholder="6-digit branch code"
              maxLength={6}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-0.5">
            Debit Order Day *
          </label>
          <select
            name="debitOrderDay"
            value={formData.debitOrderDay}
            onChange={handleChange}
            required
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
          >
            {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
              <option key={day} value={day}>
                {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of each month
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-0.5">Choose a day when you know you'll have funds available</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-2">
          <h3 className="text-xs font-medium text-blue-900 mb-1">🔒 Secure Payment</h3>
          <p className="text-xs text-blue-800">
            Your banking details are encrypted and stored securely. We use bank-level security to protect your information.
          </p>
        </div>

        <div className="flex justify-between pt-2 pb-10">
          <button
            onClick={prevStep}
            className="px-4 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!formData.bankName || !formData.accountNumber || !formData.branchCode || !formData.accountHolderName}
            className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 font-medium disabled:bg-gray-300"
          >
            Next: Review & Submit
          </button>
        </div>
      </div>
    </div>
  )
}
