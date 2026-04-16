import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { action, verification_notes, call_recording_url, rejection_reason } = body

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔄 UPDATING PLUS1 DEPENDANT REQUEST')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Request ID:', params.id)
    console.log('Action:', action)

    // Fetch the dependant request
    const { data: dependantRequest, error: fetchError } = await supabaseAdmin
      .from('plus1_dependant_requests')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !dependantRequest) {
      console.error('❌ Dependant request not found')
      return NextResponse.json(
        { error: 'Dependant request not found' },
        { status: 404 }
      )
    }

    console.log('✅ Found request for:', dependantRequest.member_first_name, dependantRequest.member_last_name)
    console.log('Current status:', dependantRequest.status)

    // Handle different actions
    if (action === 'verify') {
      // Call centre verification
      if (!verification_notes || !call_recording_url) {
        return NextResponse.json(
          { error: 'Verification notes and call recording are required' },
          { status: 400 }
        )
      }

      const { error: updateError } = await supabaseAdmin
        .from('plus1_dependant_requests')
        .update({
          status: 'verified',
          verification_notes,
          call_recording_url,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)

      if (updateError) throw updateError

      console.log('✅ Dependant request verified')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

      return NextResponse.json({
        success: true,
        message: 'Dependant request verified successfully'
      })

    } else if (action === 'approve') {
      // Operations manager approval
      console.log('\n📍 STEP 1: Fetching member details...')
      
      const { data: member, error: memberError } = await supabaseAdmin
        .from('members')
        .select('id, member_number, mobile, monthly_premium')
        .eq('id', dependantRequest.member_id)
        .single()

      if (memberError || !member) {
        console.error('❌ Member not found')
        throw new Error('Member not found')
      }

      console.log('✅ Member:', member.member_number)

      // Determine dependant code
      console.log('\n📍 STEP 2: Determining dependant code...')
      
      const { data: existingDependants } = await supabaseAdmin
        .from('member_dependants')
        .select('dependant_code')
        .eq('member_id', member.id)
        .order('dependant_code', { ascending: false })
        .limit(1)

      let dependantCode = 1
      
      if (existingDependants && existingDependants.length > 0) {
        dependantCode = existingDependants[0].dependant_code + 1
      }

      console.log('✅ Assigned dependant code:', dependantCode)

      // Update Plus1Rewards database FIRST
      console.log('\n📍 STEP 3: Updating Plus1Rewards database...')
      
      try {
        // Determine cover_plan_variant based on dependants
        let coverPlanVariant = 'Single'
        const totalDependants = (existingDependants?.length || 0) + 1 // +1 for the new dependant
        
        if (totalDependants >= 1) {
          // 1+ dependants = Family
          coverPlanVariant = 'Family'
        }
        
        console.log('Setting cover_plan_variant to:', coverPlanVariant)
        
        // Get the Plus1 member ID
        const memberResponse = await fetch(
          `${process.env.PLUS1_SUPABASE_URL}/rest/v1/members?cell_phone=eq.${encodeURIComponent(member.mobile)}&select=id`,
          {
            headers: {
              'apikey': process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY!,
              'Authorization': `Bearer ${process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY!}`
            }
          }
        )
        
        const memberData = await memberResponse.json()
        const plus1MemberId = memberData[0]?.id
        
        if (!plus1MemberId) {
          throw new Error('Plus1 member not found')
        }
        
        // Update members table with new price and variant
        const updateResponse = await fetch(
          `${process.env.PLUS1_SUPABASE_URL}/rest/v1/members?id=eq.${plus1MemberId}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY!,
              'Authorization': `Bearer ${process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY!}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              cover_plan_price: String(dependantRequest.new_premium),
              cover_plan_variant: coverPlanVariant,
              plan_status: 'active'
            })
          }
        )

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text()
          console.error('❌ Failed to update Plus1Rewards:', errorText)
          throw new Error(`Plus1Rewards update failed: ${errorText}`)
        }

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text()
          console.error('❌ Failed to update Plus1Rewards members:', errorText)
          throw new Error(`Plus1Rewards members update failed: ${errorText}`)
        }

        const updateData = await updateResponse.json()
        console.log('✅ Plus1Rewards members table updated - new price: R', dependantRequest.new_premium, 'variant:', coverPlanVariant)
        
        // Get member_cover_plan_id
        const coverPlanResponse = await fetch(
          `${process.env.PLUS1_SUPABASE_URL}/rest/v1/member_cover_plans?member_id=eq.${plus1MemberId}&select=id`,
          {
            headers: {
              'apikey': process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY!,
              'Authorization': `Bearer ${process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY!}`
            }
          }
        )
        
        const coverPlanData = await coverPlanResponse.json()
        const memberCoverPlanId = coverPlanData[0]?.id
        
        if (memberCoverPlanId) {
          // Update member_cover_plans (this is the source of truth that syncs to members table)
          console.log('\n📍 STEP 3B: Updating member_cover_plans...')
          
          const updateCoverPlanResponse = await fetch(
            `${process.env.PLUS1_SUPABASE_URL}/rest/v1/member_cover_plans?id=eq.${memberCoverPlanId}`,
            {
              method: 'PATCH',
              headers: {
                'apikey': process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY!,
                'Authorization': `Bearer ${process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY!}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                target_amount: dependantRequest.new_premium,
                funded_amount: dependantRequest.new_premium
              })
            }
          )
          
          if (!updateCoverPlanResponse.ok) {
            const errorText = await updateCoverPlanResponse.text()
            console.error('❌ Failed to update member_cover_plans:', errorText)
          } else {
            console.log('✅ Plus1Rewards member_cover_plans updated')
          }
          
          // Create dependant in Plus1Rewards dependants table
          console.log('\n📍 STEP 3C: Creating dependant in Plus1Rewards...')
          
          const dependantResponse = await fetch(
            `${process.env.PLUS1_SUPABASE_URL}/rest/v1/dependants`,
            {
              method: 'POST',
              headers: {
                'apikey': process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY!,
                'Authorization': `Bearer ${process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY!}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
              },
              body: JSON.stringify({
                member_cover_plan_id: memberCoverPlanId,
                dependant_type: dependantRequest.dependant_relationship,
                id_number: dependantRequest.dependant_id_number,
                first_name: dependantRequest.dependant_first_name,
                last_name: dependantRequest.dependant_last_name,
                linked_to_main_member_id: plus1MemberId,
                status: 'pending'
              })
            }
          )
          
          if (!dependantResponse.ok) {
            const errorText = await dependantResponse.text()
            console.error('❌ Failed to create Plus1 dependant:', errorText)
            // Don't throw - continue with Day1Main creation
          } else {
            console.log('✅ Plus1Rewards dependant created')
          }
        }
      } catch (plus1Error) {
        console.error('❌ CRITICAL: Plus1Rewards update failed:', plus1Error)
        throw new Error(`Failed to update Plus1Rewards: ${plus1Error instanceof Error ? plus1Error.message : 'Unknown error'}`)
      }

      // Create dependant in Day1Main
      console.log('\n📍 STEP 4: Creating dependant in Day1Main...')
      
      // Map relationship to dependant_type
      let dependantType = 'child'
      if (dependantRequest.dependant_relationship === 'spouse') {
        dependantType = 'spouse'
      } else if (dependantRequest.dependant_relationship === 'partner') {
        dependantType = 'partner'
      }
      
      const { error: dependantError } = await supabaseAdmin
        .from('member_dependants')
        .insert({
          member_id: member.id,
          member_number: member.member_number,
          dependant_code: dependantCode,
          dependant_type: dependantType,
          first_name: dependantRequest.dependant_first_name,
          last_name: dependantRequest.dependant_last_name,
          id_number: dependantRequest.dependant_id_number,
          date_of_birth: dependantRequest.dependant_date_of_birth,
          gender: dependantRequest.dependant_gender,
          status: 'active',
          created_at: new Date().toISOString()
        })

      if (dependantError) {
        console.error('❌ Failed to create dependant:', dependantError)
        throw dependantError
      }

      console.log('✅ Dependant created with code:', dependantCode)

      // Update member premium
      console.log('\n📍 STEP 5: Updating member premium...')
      
      const { error: memberUpdateError } = await supabaseAdmin
        .from('members')
        .update({
          monthly_premium: dependantRequest.new_premium,
          updated_at: new Date().toISOString()
        })
        .eq('id', member.id)

      if (memberUpdateError) {
        console.error('❌ Failed to update member premium:', memberUpdateError)
        throw memberUpdateError
      }

      console.log('✅ Member premium updated to R', dependantRequest.new_premium)

      // Update dependant request status
      console.log('\n📍 STEP 6: Updating request status...')
      
      const { error: statusError } = await supabaseAdmin
        .from('plus1_dependant_requests')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)

      if (statusError) throw statusError

      console.log('✅ Dependant request approved')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('✅ DEPENDANT ADDITION COMPLETE')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

      return NextResponse.json({
        success: true,
        message: 'Dependant approved and added successfully',
        dependant_code: dependantCode
      })

    } else if (action === 'reject') {
      // Reject dependant request
      if (!rejection_reason) {
        return NextResponse.json(
          { error: 'Rejection reason is required' },
          { status: 400 }
        )
      }

      const { error: updateError } = await supabaseAdmin
        .from('plus1_dependant_requests')
        .update({
          status: 'rejected',
          rejection_reason,
          rejected_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)

      if (updateError) throw updateError

      console.log('✅ Dependant request rejected')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

      return NextResponse.json({
        success: true,
        message: 'Dependant request rejected'
      })

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be verify, approve, or reject' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Failed to update dependant request:', error)
    return NextResponse.json(
      { error: 'Failed to update dependant request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
