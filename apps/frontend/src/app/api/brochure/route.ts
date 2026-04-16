import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileName = searchParams.get('file');

    if (!fileName) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      );
    }

    // Security: Only allow specific file names (no path traversal)
    const allowedFiles = [
      'Day-To-Day Single Plan .pdf',
      'Hospital Value Plus Plan.pdf',
      'Comprehensive Value Plus Plan.pdf',
      'Comprehensive Platinum Plan.pdf',
      'Comprehensive Executive Plan.pdf',
      'Hospital Platinum Plan.pdf',
      'Hospital Executive Plan.pdf',
      'Senior Comprehensive Plan.pdf',
      'Senior Day-To-Day Plan.pdf',
      'Senior Hospital Plan.pdf',
    ];

    if (!allowedFiles.includes(fileName)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Read the PDF file
    const filePath = path.join(process.cwd(), 'docs', 'cover plan brochures', fileName);
    const fileBuffer = await readFile(filePath);

    // Return the PDF with proper headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error serving brochure:', error);
    return NextResponse.json(
      { error: 'Failed to load brochure' },
      { status: 500 }
    );
  }
}
