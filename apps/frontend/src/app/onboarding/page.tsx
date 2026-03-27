'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingDashboard() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to applications page
    router.push('/onboarding/applications')
  }, [router])

  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-600">Redirecting...</p>
    </div>
  )
}
