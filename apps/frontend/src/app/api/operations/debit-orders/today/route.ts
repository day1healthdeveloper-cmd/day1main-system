import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const strikeDate = searchParams.get('strike_date');

    if (!strikeDate) {
      return NextResponse.json(
        { error: 'Strike date is required' },
        { status: 400 }
      );
    }

    // Get today's day of month (e.g., 9 for March 9)
    const today = new Date(strikeDate);
    const todayDay = today.getDate();

    // Fetch all members where debit_order_day = today's day
    // This includes: individual_debit_order, group_debit_order, and eft
    const { data: members, error } = await supabase
      .from('members')
      .select(`
        id,
        member_number,
        first_name,
        last_name,
        email,
        mobile,
        phone,
        bank_name,
        account_number,
        branch_code,
        account_holder_name,
        debit_order_day,
        collection_method,
        monthly_premium,
        status,
        debit_order_status,
        netcash_account_reference,
        payment_group_id,
        payment_groups:payment_group_id (
          id,
          group_name,
          group_code
        )
      `)
      .eq('debit_order_day', todayDay)
      .eq('status', 'active')
      .in('collection_method', ['individual_debit_order', 'group_debit_order', 'eft'])
      .order('collection_method', { ascending: true })
      .order('last_name', { ascending: true });

    if (error) {
      console.error('Error fetching members:', error);
      return NextResponse.json(
        { error: 'Failed to fetch members' },
        { status: 500 }
      );
    }

    // Transform data for frontend
    const transformedTransactions = (members || []).map((member: any) => {
      const paymentGroup = member.payment_groups as { id: any; group_name: any; group_code: any } | null;
      
      return {
        id: member.id,
        member_id: member.id,
        member_number: member.member_number,
        member_name: `${member.first_name} ${member.last_name}`,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        mobile: member.mobile,
        phone: member.phone,
        amount: member.monthly_premium,
        bank_name: member.bank_name,
        account_number: member.account_number,
        branch_code: member.branch_code,
        account_holder_name: member.account_holder_name,
        collection_method: member.collection_method,
        payment_group_id: member.payment_group_id,
        group_name: paymentGroup?.group_name || null,
        group_code: paymentGroup?.group_code || null,
        status: 'pending', // Default status - will be updated after processing
        netcash_reference: member.netcash_account_reference,
        debit_order_day: member.debit_order_day,
        debit_order_status: member.debit_order_status,
      };
    });

    // Calculate summary stats
    const summary = {
      total: transformedTransactions.length,
      individual: transformedTransactions.filter(t => t.collection_method === 'individual_debit_order').length,
      group: transformedTransactions.filter(t => t.collection_method === 'group_debit_order').length,
      eft: transformedTransactions.filter(t => t.collection_method === 'eft').length,
      total_amount: transformedTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
    };

    return NextResponse.json({
      transactions: transformedTransactions,
      summary,
      strike_date: strikeDate,
      debit_order_day: todayDay,
    });
  } catch (error) {
    console.error('Error in today transactions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
