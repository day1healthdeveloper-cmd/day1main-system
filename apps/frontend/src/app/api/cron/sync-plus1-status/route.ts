import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security (optional but recommended)
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Starting Plus1 status sync...')

    // Check if Plus1 credentials are configured
    if (!process.env.PLUS1_SUPABASE_URL || !process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Plus1 Supabase credentials not configured')
      return NextResponse.json(
        { error: 'Plus1 database not configured' },
        { status: 500 }
      )
    }

    // Initialize clients
    const day1Supabase = createServerSupabaseClient()
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
        }
      }
    )

    // Get all Day1 members that came from Plus1 (broker code = POR)
    const { data: porBroker } = await day1Supabase
      .from('brokers')
      .select('id')
      .eq('code', 'POR')
      .single()

    if (!porBroker) {
      console.log('No POR broker found - skipping sync')
      return NextResponse.json({ 
        success: true, 
        message: 'No Plus1 members to sync' 
      })
    }

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get Day1 members from Plus1 that were approved 30+ days ago and haven't been synced recently
    const { data: day1Members, error: day1Error } = await day1Supabase
      .from('members')
      .select('id, member_number, mobile, status, approved_at, updated_at')
      .eq('broker_id', porBroker.id)
      .in('status', ['active', 'suspended']) // Only sync active/suspended members
      .lte('approved_at', thirtyDaysAgo.toISOString()) // Approved 30+ days ago

    if (day1Error) {
      console.error('Failed to fetch Day1 members:', day1Error)
      throw new Error(`Failed to fetch Day1 members: ${day1Error.message}`)
    }

    if (!day1Members || day1Members.length === 0) {
      console.log('No Plus1 members due for 30-day sync')
      return NextResponse.json({ 
        success: true, 
        message: 'No Plus1 members due for sync',
        synced: 0
      })
    }

    console.log(`Found ${day1Members.length} Plus1 members due for 30-day sync`)

    let syncedCount = 0
    let updatedCount = 0
    let errorCount = 0

    // Sync each member
    for (const day1Member of day1Members) {
      try {
        // Get Plus1 member status by mobile number
        const { data: plus1Members, error: plus1Error } = await plus1Supabase
          .from('members')
          .select('plan_status, cell_phone')
          .eq('cell_phone', day1Member.mobile)
          .limit(1)

        if (plus1Error) {
          console.error(`Error fetching Plus1 member ${day1Member.mobile}:`, plus1Error)
          errorCount++
          continue
        }

        if (!plus1Members || plus1Members.length === 0) {
          console.log(`Plus1 member not found: ${day1Member.mobile}`)
          errorCount++
          continue
        }

        const plus1Member = plus1Members[0]
        const plus1Status = plus1Member.plan_status?.toLowerCase() || 'active'

        // Map Plus1 status to Day1 status
        let day1Status = 'active'
        if (plus1Status === 'suspended' || plus1Status === 'inactive') {
          day1Status = 'suspended'
        }

        // Update Day1 member if status changed
        if (day1Member.status !== day1Status) {
          const { error: updateError } = await day1Supabase
            .from('members')
            .update({ 
              status: day1Status,
              updated_at: new Date().toISOString()
            })
            .eq('id', day1Member.id)

          if (updateError) {
            console.error(`Failed to update member ${day1Member.member_number}:`, updateError)
            errorCount++
          } else {
            console.log(`✅ Updated ${day1Member.member_number}: ${day1Member.status} → ${day1Status}`)
            updatedCount++
          }
        }

        syncedCount++
      } catch (memberError) {
        console.error(`Error syncing member ${day1Member.member_number}:`, memberError)
        errorCount++
      }
    }

    console.log(`✅ Sync complete: ${syncedCount} checked, ${updatedCount} updated, ${errorCount} errors`)

    return NextResponse.json({
      success: true,
      message: 'Plus1 status sync completed',
      stats: {
        totalMembers: day1Members.length,
        synced: syncedCount,
        updated: updatedCount,
        errors: errorCount
      }
    })

  } catch (error) {
    console.error('Plus1 status sync error:', error)
    return NextResponse.json(
      { 
        error: 'Sync failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
