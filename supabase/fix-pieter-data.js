require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPieterData() {
  try {
    console.log('Fixing Pieter du Toit data...\n');

    // Get current data
    const { data: member, error: fetchError } = await supabase
      .from('members')
      .select('*')
      .eq('id_number', '6710135149084')
      .single();

    if (fetchError) {
      console.error('Error fetching:', fetchError);
      return;
    }

    console.log('Current data:');
    console.log('Member Number:', member.member_number);
    console.log('Policy Number:', member.policy_number);
    console.log('Join Date:', member.join_date);
    console.log('Created At:', member.created_at);
    console.log('Approved At:', member.approved_at);

    // Update with correct values
    const { data: updated, error: updateError } = await supabase
      .from('members')
      .update({
        policy_number: 'DAY17056788',
        join_date: member.approved_at || member.created_at, // Use approved_at or created_at as join_date
        updated_at: new Date().toISOString()
      })
      .eq('id_number', '6710135149084')
      .select()
      .single();

    if (updateError) {
      console.error('Error updating:', updateError);
      return;
    }

    console.log('\n✅ Updated successfully!');
    console.log('New Policy Number:', updated.policy_number);
    console.log('New Join Date:', updated.join_date);

  } catch (error) {
    console.error('Error:', error);
  }
}

fixPieterData();
