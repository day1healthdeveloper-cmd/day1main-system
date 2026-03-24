/**
 * Step 5 of 6: Banking Details
 * 
 * Collects banking information for monthly debit order payments.
 * - Bank name selection (SA banks)
 * - Account holder name
 * - Account number and branch code
 * - Debit order day (1-28 of each month) - Calendar style picker
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

  const [paymentMethod, setPaymentMethod] = useState<'debit_order' | 'eft'>(
    data.collection_method === 'eft' ? 'eft' : 'debit_order'
  )
  const [verifying, setVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'failed'>('idle')
  const [verificationMessage, setVerificationMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    // Reset verification status when account details change
    if (e.target.name === 'accountNumber' || e.target.name === 'branchCode') {
      setVerificationStatus('idle')
      setVerificationMessage('')
    }
  }

  const handleVerifyAccount = async () => {
    if (!formData.accountNumber || !formData.branchCode || !formData.bankName) {
      setVerificationMessage('Please fill in bank name, account number, and branch code first')
      setVerificationStatus('failed')
      return
    }

    setVerifying(true)
    setVerificationMessage('')

    try {
      const response = await fetch('/api/netcash/verify-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountNumber: formData.accountNumber,
          branchCode: formData.branchCode,
          bankName: formData.bankName,
          accountHolderName: formData.accountHolderName,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setVerificationStatus('success')
        setVerificationMessage(result.message || 'Account verified successfully!')
      } else {
        setVerificationStatus('failed')
        setVerificationMessage(result.message || 'Account verification failed. Please check your details.')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setVerificationStatus('failed')
      setVerificationMessage('Unable to verify account. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  const handleNext = () => {
    updateData({ 
      ...formData, 
      collection_method: paymentMethod === 'eft' ? 'eft' : 'individual_debit_order'
    })
    nextStep()
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-1">Banking Details</h2>
      <p className="text-xs text-gray-600 mb-3">For monthly premium payments</p>

      <div className="space-y-2">
        {/* Payment Method Selector */}
        <div className="border-2 border-gray-300 rounded-lg p-3 bg-gray-50">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Payment Method *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('debit_order')}
              className={`p-3 rounded-lg border-2 transition-all ${
                paymentMethod === 'debit_order'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-300 bg-white hover:border-green-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'debit_order' ? 'border-green-600' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'debit_order' && (
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  )}
                </div>
                <span className="text-sm font-bold">Debit Order</span>
              </div>
              <p className="text-xs text-gray-600 text-left">
                Automatic monthly deduction from your account
              </p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('eft')}
              className={`p-3 rounded-lg border-2 transition-all ${
                paymentMethod === 'eft'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-300 bg-white hover:border-green-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'eft' ? 'border-green-600' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'eft' && (
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  )}
                </div>
                <span className="text-sm font-bold">EFT Payment</span>
              </div>
              <p className="text-xs text-gray-600 text-left">
                Manual transfer with payment notification
              </p>
            </button>
          </div>

          {/* Payment Method Info */}
          {paymentMethod === 'debit_order' && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-xs text-blue-800">
                ℹ️ <strong>Debit Order:</strong> Your account will be debited automatically on your selected day each month. Convenient and hassle-free.
              </p>
            </div>
          )}

          {paymentMethod === 'eft' && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-xs text-blue-800">
                ℹ️ <strong>EFT Payment:</strong> You'll receive SMS/email notifications on your payment date with banking details and a link to upload your proof of payment.
              </p>
            </div>
          )}
        </div>
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
            <div className="flex gap-1">
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                required
                placeholder="Account number"
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={handleVerifyAccount}
                disabled={verifying || !formData.accountNumber || !formData.branchCode || !formData.bankName}
                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {verifying ? '⏳' : '✓'} Verify
              </button>
            </div>
            {verificationStatus !== 'idle' && (
              <div className={`mt-1 p-1.5 rounded text-xs ${
                verificationStatus === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {verificationStatus === 'success' ? '✓' : '✗'} {verificationMessage}
              </div>
            )}
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
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {paymentMethod === 'debit_order' ? 'Debit Order Day *' : 'Payment Date *'}
          </label>
          <p className="text-xs text-gray-500 mb-2">
            {paymentMethod === 'debit_order' 
              ? 'Select the day of the month for your debit order'
              : 'Select the day you will make your EFT payment each month'
            }
          </p>
          <div className="grid grid-cols-7 gap-1 p-2 bg-gray-50 border border-gray-300 rounded">
            {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
              <button
                key={day}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, debitOrderDay: day }))}
                className={`h-8 w-8 flex items-center justify-center text-xs font-medium rounded transition-colors ${
                  formData.debitOrderDay === day
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-green-500 hover:bg-green-50'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Selected: <span className="font-medium text-green-600">{formData.debitOrderDay}{formData.debitOrderDay === 1 ? 'st' : formData.debitOrderDay === 2 ? 'nd' : formData.debitOrderDay === 3 ? 'rd' : 'th'}</span> of each month
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {paymentMethod === 'debit_order'
              ? 'Choose a day when you know you\'ll have funds available'
              : 'You\'ll receive an SMS/email notification on the morning of this date'
            }
          </p>
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
