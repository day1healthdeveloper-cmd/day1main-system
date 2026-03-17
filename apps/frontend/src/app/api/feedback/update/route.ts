import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, rename, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feedbackId, status, comment, currentStatus } = body;

    if (!feedbackId || !currentStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the feedback file
    const currentDir = path.join(process.cwd(), '.kiro', 'feedback', currentStatus);
    const currentPath = path.join(currentDir, `${feedbackId}.json`);

    if (!existsSync(currentPath)) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    // Read current feedback
    const content = await readFile(currentPath, 'utf-8');
    const feedback = JSON.parse(content);

    // Update feedback
    if (comment) {
      feedback.developerComments.push({
        comment,
        timestamp: new Date().toISOString(),
        author: 'developer', // Can be enhanced with actual user info
      });
    }

    if (status && status !== currentStatus) {
      feedback.status = status;
      feedback.updatedAt = new Date().toISOString();

      // Move file to new status directory
      const newDir = path.join(process.cwd(), '.kiro', 'feedback', status);
      if (!existsSync(newDir)) {
        await mkdir(newDir, { recursive: true });
      }
      const newPath = path.join(newDir, `${feedbackId}.json`);

      // Write updated feedback to new location
      await writeFile(newPath, JSON.stringify(feedback, null, 2), 'utf-8');

      // Delete old file
      const { unlink } = await import('fs/promises');
      await unlink(currentPath);
    } else {
      // Just update the file in place
      feedback.updatedAt = new Date().toISOString();
      await writeFile(currentPath, JSON.stringify(feedback, null, 2), 'utf-8');
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback updated successfully',
      feedback,
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    );
  }
}
