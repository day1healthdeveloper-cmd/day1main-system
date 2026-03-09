require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPieterPolicyNumber() {
  try {
    console.log('Fixing Pieter du Toit policy number...\n');

    // Update policy_number only
    const { data: updated, error: updateError } = await supabase
      .from('members')
      .update({
        policy_number: 'DAY17056788',
        updated_at: new Date().toISOString()
      })
      .eq('id_number', '6710135149084')
      .select()
      .single();

    if (updateError) {
      console.error('Error updating:', updateError);
      return;
    }

    console.log('✅ Updated successfully!');
    console.log('Member Number:', updated.member_number);
    console.log('Policy Number:', updated.policy_number);
    console.log('Created At:', updated.created_at);
    console.log('Approved At:', updated.approved_at);

  } catch (error) {
    console.error('Error:', error);
  }
}

fixPieterPolicyNumber();
