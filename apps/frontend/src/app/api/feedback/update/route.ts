import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feedbackId, status, comment, currentStatus } = body;

    if (!feedbackId) {
      return NextResponse.json(
        { error: 'Missing feedback ID' },
        { status: 400 }
      );
    }

    // Add comment if provided
    if (comment) {
      const { error: commentError } = await supabase
        .from('feedback_comments')
        .insert({
          feedback_id: feedbackId,
          comment,
          author: 'developer',
        });

      if (commentError) {
        console.error('Comment error:', commentError);
        return NextResponse.json(
          { error: 'Failed to add comment' },
          { status: 500 }
        );
      }
    }

    // Update status if provided
    if (status) {
      const { error: updateError } = await supabase
        .from('feedback')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', feedbackId);

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update status' },
          { status: 500 }
        );
      }
    }

    // Fetch updated feedback with comments
    const { data: feedback, error: fetchError } = await supabase
      .from('feedback')
      .select('*')
      .eq('id', feedbackId)
      .single();

    if (fetchError) {
      console.error('Fetch error:', fetchError);
    }

    const { data: comments } = await supabase
      .from('feedback_comments')
      .select('*')
      .eq('feedback_id', feedbackId)
      .order('created_at', { ascending: true });

    const result = {
      ...feedback,
      pageName: feedback?.page_name,
      userRole: feedback?.user_role,
      submittedAt: feedback?.submitted_at,
      submittedBy: feedback?.submitted_by,
      updatedAt: feedback?.updated_at,
      developerComments: comments?.map(c => ({
        comment: c.comment,
        timestamp: c.created_at,
        author: c.author,
      })) || [],
    };

    return NextResponse.json({
      success: true,
      message: 'Feedback updated successfully',
      feedback: result,
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    );
  }
}
