const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function revertDefinitions() {
  console.log('🔄 Reverting definitions...\n');

  // Delete all items with section_type = 'definitions'
  const { data: deleted, error } = await supabase
    .from('policy_section_items')
    .delete()
    .eq('section_type', 'definitions')
    .select();

  if (error) {
    console.error('❌ Error deleting definitions:', error);
    return;
  }

  console.log(`✅ Deleted ${deleted.length} definition items`);
  console.log('\n✨ Revert complete!');
}

revertDefinitions().catch(console.error);
