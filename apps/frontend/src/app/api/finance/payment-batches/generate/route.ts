import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateBatchNumber, groupClaimsByPayee, calculatePaymentTotal, validateBankingDetails } from '@/lib/payment-processing';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();

    const {
      batch_type, // 'provider', 'member_refund', or 'mixed'
      payment_method = 'eft',
      claim_ids, // Optional: specific claims to include
      date_from, // Optional: filter by approval date
      date_to,
      created_by // TODO: Get from auth session
    } = body;

    // Validate batch type
    if (!['provider', 'member_refund', 'mixed'].includes(batch_type)) {
      return NextResponse.json(
        { error: 'Invalid batch type' },
        { status: 400 }
      );
    }

    // Build query for approved claims that haven't been paid
    let query = supabase
      .from('claims')
      .select(`
        id,
        claim_number,
        approved_amount,
        approved_at,
        service_date,
        claim_source,
        provider_id,
        member_id,
        providers:provider_id (
          id,
          name,
          bank_name,
          account_number,
          branch_code,
          account_holder_name
        ),
        members:member_id (
          id,
          first_name,
          last_name,
          bank_name,
          account_number,
          branch_code,
          account_holder_name
        )
      `)
      .eq('status', 'approved')
      .is('paid_date', null);

    // Filter by claim IDs if provided
    if (claim_ids && claim_ids.length > 0) {
      query = query.in('id', claim_ids);
    }

    // Filter by date range if provided
    if (date_from) {
      query = query.gte('approved_at', date_from);
    }
    if (date_to) {
      query = query.lte('approved_at', date_to);
    }

    // Filter by batch type
    if (batch_type === 'provider') {
      query = query.eq('claim_source', 'provider');
    } else if (batch_type === 'member_refund') {
      query = query.eq('claim_source', 'member');
    }

    const { data: claims, error: claimsError } = await query;

    if (claimsError) {
      console.error('Error fetching claims:', claimsError);
      throw claimsError;
    }

    if (!claims || claims.length === 0) {
      return NextResponse.json(
        { error: 'No approved unpaid claims found' },
        { status: 404 }
      );
    }

    // Transform claims into payment records
    const payments = claims.map(claim => {
      const isProviderClaim = claim.claim_source === 'provider';
      const payeeRaw = isProviderClaim ? claim.providers : claim.members;
      
      // Handle array or single object
      const payee = Array.isArray(payeeRaw) ? payeeRaw[0] : payeeRaw;
      
      if (!payee) {
        console.warn(`Missing payee data for claim ${claim.claim_number}`);
        return null;
      }

      return {
        claim_id: claim.id,
        claim_number: claim.claim_number,
        payee_type: (isProviderClaim ? 'provider' : 'member') as 'provider' | 'member',
        payee_id: payee.id,
        payee_name: isProviderClaim 
          ? payee.name 
          : `${payee.first_name} ${payee.last_name}`,
        bank_name: payee.bank_name,
        account_number: payee.account_number,
        branch_code: payee.branch_code,
        account_holder_name: payee.account_holder_name,
        payment_amount: parseFloat(claim.approved_amount),
        service_date: claim.service_date,
        approved_date: claim.approved_at
      };
    }).filter(p => p !== null);

    // Validate banking details for all payments
    const invalidPayments = payments.filter(payment => {
      const validation = validateBankingDetails(payment);
      return !validation.valid;
    });

    if (invalidPayments.length > 0) {
      return NextResponse.json({
        error: 'Some claims have invalid banking details',
        invalid_count: invalidPayments.length,
        invalid_claims: invalidPayments.map(p => ({
          claim_number: p.claim_number,
          payee_name: p.payee_name,
          validation: validateBankingDetails(p)
        }))
      }, { status: 400 });
    }

    // Calculate totals
    const totalClaims = payments.length;
    const totalAmount = payments.reduce((sum, p) => sum + p.payment_amount, 0);

    // Generate batch number
    const batchNumber = generateBatchNumber();
    const batchDate = new Date().toISOString().split('T')[0];

    // Create payment batch
    const { data: batch, error: batchError } = await supabase
      .from('payment_batches')
      .insert({
        batch_number: batchNumber,
        batch_type,
        batch_date: batchDate,
        total_claims: totalClaims,
        total_amount: totalAmount,
        status: 'draft',
        payment_method,
        created_by
      })
      .select()
      .single();

    if (batchError) {
      console.error('Error creating batch:', batchError);
      throw batchError;
    }

    // Create individual payment records
    const paymentRecords = payments.map(payment => ({
      claim_id: payment.claim_id,
      payment_batch_id: batch.id,
      payee_type: payment.payee_type,
      payee_id: payment.payee_id,
      payee_name: payment.payee_name,
      bank_name: payment.bank_name,
      account_number: payment.account_number,
      branch_code: payment.branch_code,
      account_holder_name: payment.account_holder_name,
      payment_amount: payment.payment_amount,
      payment_method,
      payment_status: 'pending',
      created_by
    }));

    const { data: createdPayments, error: paymentsError } = await supabase
      .from('claim_payments')
      .insert(paymentRecords)
      .select();

    if (paymentsError) {
      console.error('Error creating payments:', paymentsError);
      // Rollback batch creation
      await supabase.from('payment_batches').delete().eq('id', batch.id);
      throw paymentsError;
    }

    // Group payments by payee for summary
    const groupedPayments = groupClaimsByPayee(payments);
    const payeeSummary = Array.from(groupedPayments.entries()).map(([key, claims]) => ({
      payee_name: claims[0].payee_name,
      payee_type: claims[0].payee_type,
      claim_count: claims.length,
      total_amount: calculatePaymentTotal(claims)
    }));

    return NextResponse.json({
      success: true,
      batch: {
        ...batch,
        payments: createdPayments
      },
      summary: {
        total_claims: totalClaims,
        total_amount: totalAmount,
        unique_payees: groupedPayments.size,
        payee_breakdown: payeeSummary
      }
    });

  } catch (error) {
    console.error('Error generating payment batch:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate payment batch', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
