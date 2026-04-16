import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const includeMembers = searchParams.get('includeMembers') === 'true'

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 FETCHING PLUS1 DEPENDANT REQUESTS')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Status filter:', status || 'all')
    console.log('Include members:', includeMembers)

    // Build query
    let query = supabaseAdmin
      .from('plus1_dependant_requests')
      .select('*')
      .order('requested_at', { ascending: false })

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status)
    }

    const { data: requests, error } = await query

    if (error) {
      console.error('❌ Error fetching dependant requests:', error)
      throw error
    }

    console.log(`✅ Found ${requests?.length || 0} dependant request(s)`)

    // If includeMembers is true, fetch full member details
    if (includeMembers && requests && requests.length > 0) {
      const memberIds = requests.map(r => r.member_id).filter(Boolean)
      
      if (memberIds.length > 0) {
        const { data: members } = await supabaseAdmin
          .from('members')
          .select('id, member_number, first_name, last_name, email, mobile, plan_name, monthly_premium, broker_code')
          .in('id', memberIds)

        // Attach member data to requests
        const requestsWithMembers = requests.map(request => {
          const member = members?.find(m => m.id === request.member_id)
          return {
            ...request,
            member
          }
        })

        console.log('✅ Attached member details to requests')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

        return NextResponse.json({
          success: true,
          requests: requestsWithMembers
        })
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    return NextResponse.json({
      success: true,
      requests: requests || []
    })

  } catch (error) {
    console.error('Failed to fetch dependant requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dependant requests', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
