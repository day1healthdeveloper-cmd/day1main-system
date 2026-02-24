import { NextRequest, NextResponse } from 'next/server';

// Backend removed - feature temporarily disabled
export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Feature temporarily unavailable - backend migration to Supabase in progress' 
  }, { status: 503 });
}
