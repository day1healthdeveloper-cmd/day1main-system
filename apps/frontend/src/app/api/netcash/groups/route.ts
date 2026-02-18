import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000/api/v1';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    console.log('Frontend API: Fetching groups from backend');
    console.log('Frontend API: Auth header present:', !!authHeader);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward the authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${BACKEND_URL}/netcash/groups`, {
      method: 'GET',
      headers,
    });

    console.log('Frontend API: Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Frontend API: Backend error:', errorText);
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Frontend API: Received', Array.isArray(data) ? data.length : 0, 'groups');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Frontend API: Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}
