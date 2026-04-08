import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mobile, planStatus } = body

    if (!mobile || !planStatus) {
      return NextResponse.json(
        { error: 'Mobile number and plan status are required' },
        { status: 400 }
      )
    }

    // Check if environment variables are set
    if (!process.env.PLUS1_SUPABASE_URL || !process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Plus1 Supabase credentials not configured')
      return NextResponse.json(
        { error: 'External database not configured' },
        { status: 500 }
      )
    }

    // Initialize Plus1Rewards Supabase client
    const plus1Supabase = createClient(
      process.env.PLUS1_SUPABASE_URL,
      process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            'x-application-name': 'day1main-plus1-integration'
          }
        }
      }
    )

    console.log('Updating Plus1 member status:', mobile, planStatus)

    // Update member plan_status in Plus1Rewards database
    const { data, error } = await plus1Supabase
      .from('members')
      .update({ plan_status: planStatus })
      .eq('cell_phone', mobile)
      .select()

    if (error) {
      console.error('Plus1 status update error:', error)
      return NextResponse.json(
        { error: 'Failed to update status', details: error.message },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      console.log('No member found to update with mobile:', mobile)
      return NextResponse.json(
        { error: 'Member not found in Plus1 database' },
        { status: 404 }
      )
    }

    console.log('Plus1 member status updated successfully:', data[0])

    return NextResponse.json({
      success: true,
      message: 'Member status updated in Plus1Rewards',
      member: data[0]
    })

  } catch (error) {
    console.error('Plus1 status update error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
