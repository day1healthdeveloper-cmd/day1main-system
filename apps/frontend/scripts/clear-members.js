require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function clearMembers() {
  console.log('🗑️  Clearing members and dependants tables...\n');

  try {
    // First, delete all dependants (they reference members)
    console.log('Deleting all dependants...');
    const { error: depError } = await supabase
      .from('member_dependants')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (depError) {
      console.error('❌ Error deleting dependants:', depError);
      throw depError;
    }
    console.log('✅ All dependants deleted\n');

    // Then, delete all members
    console.log('Deleting all members...');
    const { error: memberError } = await supabase
      .from('members')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (memberError) {
      console.error('❌ Error deleting members:', memberError);
      throw memberError;
    }
    console.log('✅ All members deleted\n');

    // Verify counts
    const { count: memberCount } = await supabase
      .from('members')
      .select('id', { count: 'exact', head: true });

    const { count: depCount } = await supabase
      .from('member_dependants')
      .select('id', { count: 'exact', head: true });

    console.log('📊 Final counts:');
    console.log(`  Members: ${memberCount}`);
    console.log(`  Dependants: ${depCount}`);

    if (memberCount === 0 && depCount === 0) {
      console.log('\n✅ Tables cleared successfully!');
    } else {
      console.log('\n⚠️  Warning: Some records may still exist');
    }

  } catch (error) {
    console.error('❌ Failed to clear tables:', error);
    process.exit(1);
  }
}

clearMembers()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
