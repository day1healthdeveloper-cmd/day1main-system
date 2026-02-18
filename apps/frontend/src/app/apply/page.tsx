'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Step1Personal from '@/components/apply-steps/Step1Personal'
import Step2Documents from '@/components/apply-steps/Step2Documents'
import Step5Dependents from '@/components/apply-steps/Step5Dependents'
import Step6MedicalHistory from '@/components/apply-steps/Step6MedicalHistory'
import Step7Banking from '@/components/apply-steps/Step7Banking'
import Step6ReviewTermsSubmit from '@/components/apply-steps/Step6ReviewTermsSubmit'
import { ApplicationData } from '@/types/application'

export default function ApplyPage() {
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan')
  const planName = searchParams.get('planName')
  const planConfig = searchParams.get('config')
  const monthlyPrice = searchParams.get('price')
  const adults = searchParams.get('adults')
  const children = searchParams.get('children')
  
  const [currentStep, setCurrentStep] = useState(1)
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    firstName: '',
    lastName: '',
    idNumber: '',
    dateOfBirth: '',
    email: '',
    mobile: '',
    addressLine1: '',
    city: '',
    postalCode: '',
    planId: planId || undefined,
    planName: planName || undefined,
    planConfig: planConfig || undefined,
    monthlyPrice: monthlyPrice ? parseFloat(monthlyPrice) : undefined,
  })

  const updateData = (data: Partial<ApplicationData>) => {
    setApplicationData(prev => ({ ...prev, ...data }))
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 6))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))
  const goToStep = (step: number) => setCurrentStep(step)

  const steps = [
    { number: 1, title: 'Personal Info', component: Step1Personal },
    { number: 2, title: 'Documents', component: Step2Documents },
    { number: 3, title: 'Dependents', component: Step5Dependents },
    { number: 4, title: 'Medical History', component: Step6MedicalHistory },
    { number: 5, title: 'Banking Details', component: Step7Banking },
    { number: 6, title: 'Review & Submit', component: Step6ReviewTermsSubmit },
  ]

  const CurrentStepComponent = steps[currentStep - 1].component

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 border-b shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white mb-3">Day1Health Application</h1>
          {planName && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-white/90 font-medium">Selected Plan:</span>
                <span className="text-xl font-bold text-yellow-300">{planName}</span>
                {monthlyPrice && (
                  <>
                    <span className="text-white/60">|</span>
                    <span className="text-sm text-white/90 font-medium">Monthly Premium:</span>
                    <span className="text-2xl font-bold text-yellow-300">R{monthlyPrice}</span>
                  </>
                )}
                {(adults || children) && (
                  <>
                    <span className="text-white/60">|</span>
                    <span className="text-sm text-white/90 font-medium">Coverage:</span>
                    <span className="text-lg font-semibold text-white">
                      {adults && parseInt(adults) > 0 && `${adults} Adult${parseInt(adults) > 1 ? 's' : ''}`}
                      {adults && children && parseInt(adults) > 0 && parseInt(children) > 0 && ' + '}
                      {children && parseInt(children) > 0 && `${children} Child${parseInt(children) > 1 ? 'ren' : ''}`}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <button
                    onClick={() => goToStep(step.number)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                      currentStep === step.number
                        ? 'bg-green-600 text-white'
                        : currentStep > step.number
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.number}
                  </button>
                  <span className="text-[10px] mt-1 text-center hidden sm:block leading-tight">{step.title}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 ${currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-4 py-2">
        <div className="bg-white rounded-lg shadow-sm p-3">
          <CurrentStepComponent
            data={applicationData}
            updateData={updateData}
            nextStep={nextStep}
            prevStep={prevStep}
            goToStep={goToStep}
          />
        </div>
      </div>
    </div>
  )
}
