import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const feedbackDir = path.join(process.cwd(), '.kiro', 'feedback', status);

    if (!existsSync(feedbackDir)) {
      return NextResponse.json({ feedback: [] });
    }

    // Read all JSON files in the directory
    const files = await readdir(feedbackDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    // Read and parse each file
    const feedback = await Promise.all(
      jsonFiles.map(async (file) => {
        const filepath = path.join(feedbackDir, file);
        const content = await readFile(filepath, 'utf-8');
        return JSON.parse(content);
      })
    );

    // Sort by date (newest first)
    feedback.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error listing feedback:', error);
    return NextResponse.json(
      { error: 'Failed to list feedback' },
      { status: 500 }
    );
  }
}
