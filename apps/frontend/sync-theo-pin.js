const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseDay1 = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const supabasePlus1 = createClient(
  process.env.PLUS1_SUPABASE_URL,
  process.env.PLUS1_SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    const mobile = '0795320781';
    
    console.log(`🔍 Fetching PIN from Plus1Rewards for mobile: ${mobile}`);
    
    // Fetch PIN from Plus1Rewards
    const { data: plus1Member, error: plus1Error } = await supabasePlus1
      .from('members')
      .select('pin_code, first_name, last_name')
      .eq('cell_phone', mobile)
      .single();
    
    if (plus1Error || !plus1Member) {
      console.log('❌ Plus1 member not found:', plus1Error?.message);
      return;
    }
    
    console.log(`✅ Found Plus1 member: ${plus1Member.first_name} ${plus1Member.last_name}`);
    console.log(`📌 PIN: ${plus1Member.pin_code || 'NOT SET'}`);
    
    if (!plus1Member.pin_code) {
      console.log('⚠️ PIN not set in Plus1Rewards database');
      return;
    }
    
    // Update Day1Main member with PIN
    console.log(`\n🔄 Updating Day1Main member with PIN...`);
    const { data: updated, error: updateError } = await supabaseDay1
      .from('members')
      .update({ pin_code: plus1Member.pin_code })
      .eq('mobile', mobile)
      .select('member_number, first_name, last_name, pin_code');
    
    if (updateError) {
      console.log('❌ Update failed:', updateError.message);
      return;
    }
    
    console.log('✅ PIN synced successfully!');
    console.log('📋 Updated member:', updated);
    console.log(`\n🎯 Theo can now login at /member-login with:`);
    console.log(`   Mobile: ${mobile}`);
    console.log(`   PIN: ${plus1Member.pin_code}`);
    
  } catch (err) {
    console.error('❌ Script error:', err.message);
  }
})();
