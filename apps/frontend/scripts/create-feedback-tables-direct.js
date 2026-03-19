const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTables() {
  console.log('Creating feedback tables...\n');

  try {
    // Create feedback table
    console.log('Creating feedback table...');
    const { error: feedbackError } = await supabase.rpc('exec', {
      query: `
        CREATE TABLE IF NOT EXISTS feedback (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          status VARCHAR(50) NOT NULL DEFAULT 'pending',
          category VARCHAR(50) NOT NULL,
          priority VARCHAR(50) NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          page_name VARCHAR(255) NOT NULL,
          user_role VARCHAR(100),
          submitted_by VARCHAR(255),
          submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (feedbackError) {
      console.log('Note:', feedbackError.message);
    } else {
      console.log('✓ Feedback table created\n');
    }

    // Create comments table
    console.log('Creating feedback_comments table...');
    const { error: commentsError } = await supabase.rpc('exec', {
      query: `
        CREATE TABLE IF NOT EXISTS feedback_comments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
          comment TEXT NOT NULL,
          author VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (commentsError) {
      console.log('Note:', commentsError.message);
    } else {
      console.log('✓ Feedback comments table created\n');
    }

    // Test by inserting a sample record
    console.log('Testing tables...');
    const { data, error: testError } = await supabase
      .from('feedback')
      .insert({
        category: 'test',
        priority: 'low',
        title: 'Test feedback',
        description: 'Testing the feedback system',
        page_name: 'Test Page',
      })
      .select()
      .single();

    if (testError) {
      console.error('Test failed:', testError.message);
    } else {
      console.log('✓ Tables working! Test record created:', data.id);
      
      // Clean up test record
      await supabase.from('feedback').delete().eq('id', data.id);
      console.log('✓ Test record cleaned up\n');
    }

    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error.message);
  }
}

createTables();
