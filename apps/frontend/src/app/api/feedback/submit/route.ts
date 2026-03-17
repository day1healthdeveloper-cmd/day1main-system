import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, priority, title, description, pageName, userRole } = body;

    // Validate required fields
    if (!category || !priority || !title || !description || !pageName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create feedback directory structure
    const feedbackDir = path.join(process.cwd(), '.kiro', 'feedback', 'pending');
    
    if (!existsSync(feedbackDir)) {
      await mkdir(feedbackDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedPage = pageName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = `${timestamp}-${sanitizedPage}.json`;
    const filepath = path.join(feedbackDir, filename);

    // Create feedback object
    const feedback = {
      id: filename.replace('.json', ''),
      status: 'pending',
      category,
      priority,
      title,
      description,
      pageName,
      userRole: userRole || 'unknown',
      submittedAt: new Date().toISOString(),
      submittedBy: 'user', // Can be enhanced with actual user info
      developerComments: [],
      updatedAt: new Date().toISOString(),
    };

    // Write feedback to file
    await writeFile(filepath, JSON.stringify(feedback, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedbackId: feedback.id,
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
