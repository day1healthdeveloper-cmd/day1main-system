import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const daysAhead = parseInt(searchParams.get('daysAhead') || '2')

    // Calculate next business day (skip weekends)
    const today = new Date()
    let targetDate = new Date(today)
    let businessDaysAdded = 0

    while (businessDaysAdded < daysAhead) {
      targetDate.setDate(targetDate.getDate() + 1)
      const dayOfWeek = targetDate.getDay()
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDaysAdded++
      }
    }

    // Format as YYYY-MM-DD
    const formatted = targetDate.toISOString().split('T')[0]

    return NextResponse.json({
      date: targetDate.toISOString(),
      formatted,
      displayDate: targetDate.toLocaleDateString('en-ZA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    })
  } catch (error) {
    console.error('Error calculating next debit date:', error)
    return NextResponse.json(
      { error: 'Failed to calculate date' },
      { status: 500 }
    )
  }
}
