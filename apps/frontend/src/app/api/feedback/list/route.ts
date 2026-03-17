import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    // Fetch feedback from database
    const { data: feedbackList, error: feedbackError } = await supabase
      .from('feedback')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (feedbackError) {
      console.error('Database error:', feedbackError);
      return NextResponse.json(
        { error: 'Failed to list feedback' },
        { status: 500 }
      );
    }

    // Fetch comments for each feedback
    const feedbackIds = feedbackList.map(f => f.id);
    const { data: comments, error: commentsError } = await supabase
      .from('feedback_comments')
      .select('*')
      .in('feedback_id', feedbackIds)
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.error('Comments error:', commentsError);
    }

    // Combine feedback with comments
    const feedback = feedbackList.map(item => ({
      id: item.id,
      status: item.status,
      category: item.category,
      priority: item.priority,
      title: item.title,
      description: item.description,
      pageName: item.page_name,
      userRole: item.user_role,
      submittedAt: item.submitted_at,
      submittedBy: item.submitted_by,
      developerComments: comments?.filter(c => c.feedback_id === item.id).map(c => ({
        comment: c.comment,
        timestamp: c.created_at,
        author: c.author,
      })) || [],
      updatedAt: item.updated_at,
    }));

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error listing feedback:', error);
    return NextResponse.json(
      { error: 'Failed to list feedback' },
      { status: 500 }
    );
  }
}
