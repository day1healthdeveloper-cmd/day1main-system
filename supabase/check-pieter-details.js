require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPieterDetails() {
  try {
    console.log('Checking Pieter du Toit details...\n');

    const { data: member, error } = await supabase
      .from('members')
      .select('*')
      .eq('id_number', '6710135149084')
      .single();

    if (error) {
      console.error('Error:', error);
      return;
    }

    if (!member) {
      console.log('Member not found');
      return;
    }

    console.log('Member Details:');
    console.log('ID:', member.id);
    console.log('Member Number:', member.member_number);
    console.log('Policy Number:', member.policy_number);
    console.log('Join Date:', member.join_date);
    console.log('Created At:', member.created_at);
    console.log('First Name:', member.first_name);
    console.log('Last Name:', member.last_name);
    console.log('Status:', member.status);
    console.log('Plan Name:', member.plan_name);
    console.log('\nFull member object:');
    console.log(JSON.stringify(member, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
}

checkPieterDetails();
